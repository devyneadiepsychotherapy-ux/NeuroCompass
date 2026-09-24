"use client";
/**
 * ReminderManager : fires check-in and streak reminder notifications when the app
 * is opened or brought back to the foreground, if the set time has passed and we
 * haven't already notified today.
 */
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { getTodayKey } from "@/lib/utils";
import {
  detectNative,
  syncNativeNotifications,
  checkNativePermission,
  addNativeTapListener,
} from "@/lib/nativeNotifications";
import { Heart, Scan, ClipboardList, Pill, X, Flame } from "lucide-react";

type ReminderType = "mood" | "body" | "full" | "thirstHunger";
type NotifStyle = "cheerleader" | "gentle" | "silent";

const REMINDER_CONFIG: Record<ReminderType, {
  label: string;
  cheerBody: string;
  gentleBody: string;
  href: string;
  Icon: React.ElementType;
}> = {
  mood: {
    label: "Mood Check-In",
    cheerBody: "Time for a quick mood check-in 💚",
    gentleBody: "No rush, a mood check-in is here whenever you want it.",
    href: "/mood",
    Icon: Heart,
  },
  body: {
    label: "Body Check-In",
    cheerBody: "Take a moment to check in with your body 🌿",
    gentleBody: "Your body check-in is here whenever you're ready. No pressure.",
    href: "/mood",
    Icon: Scan,
  },
  full: {
    label: "Full Check-In",
    cheerBody: "Your full daily check-in is ready when you are 🌟",
    gentleBody: "Your full check-in is ready whenever it feels right today.",
    href: "/mood",
    Icon: ClipboardList,
  },
  thirstHunger: {
    label: "Thirst & Hunger Check-In",
    cheerBody: "Have you had water and food recently? 💧🍎",
    gentleBody: "A quiet reminder: water and food, whenever you get a chance.",
    href: "/tools",
    Icon: ClipboardList,
  },
};

const STREAK_CONFIG: Record<Exclude<NotifStyle, "silent">, { title: string; body: (streak: number) => string }> = {
  cheerleader: {
    title: "Keep your streak going! 🔥",
    body: (streak) => `You're on a ${streak}-day streak. Open NeuroCompass to keep it alive.`,
  },
  gentle: {
    title: "Your streak is still here",
    body: (streak) => `${streak} days and counting. No pressure to check in today.`,
  },
};

function reminderBody(cfg: { cheerBody: string; gentleBody: string }, style: Exclude<NotifStyle, "silent">) {
  return style === "cheerleader" ? cfg.cheerBody : cfg.gentleBody;
}

// Check-in banners are grouped by destination so e.g. Mood + Body + Full all
// being due at once (very possible - they're often set for similar times)
// renders as ONE banner instead of three near-identical rows. Without this,
// a handful of simultaneously-due reminders + a medication reminder produced
// a tall stack of banners that visually buried the page underneath.
type BannerGroup = {
  key: string;
  href: string;
  Icon: React.ElementType;
  title: string;
  body: string;
  types: ReminderType[];
};

function groupBanners(types: ReminderType[], style: Exclude<NotifStyle, "silent">): BannerGroup[] {
  const byHref = new Map<string, ReminderType[]>();
  types.forEach((t) => {
    const href = REMINDER_CONFIG[t].href;
    byHref.set(href, [...(byHref.get(href) ?? []), t]);
  });
  return Array.from(byHref.entries()).map(([href, group]) => {
    if (group.length === 1) {
      const cfg = REMINDER_CONFIG[group[0]];
      return { key: href, href, Icon: cfg.Icon, title: cfg.label, body: reminderBody(cfg, style), types: group };
    }
    const names = group.map((t) => REMINDER_CONFIG[t].label.replace(" Check-In", "")).join(", ");
    return {
      key: href,
      href,
      Icon: ClipboardList,
      title: "Check-Ins Ready",
      body:
        style === "cheerleader"
          ? `Your ${names} check-ins are ready for you 💚`
          : `${names} check-ins are ready whenever you are.`,
      types: group,
    };
  });
}


function isTimePast(time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

export default function ReminderManager() {
  const {
    checkInReminders, setReminderPermissionState,
    streakReminder, streak,
    medicationReminders, medicationTakenDates,
    medicationReminderShownDates,
    notificationStyle, _hasHydrated,
    appointments, tasks, toolReminders,
  } = useAppStore();
  // _hasHydrated is set to true by onRehydrateStorage in the store once Zustand
  // persist has finished reading from localStorage. Without gating on it, this
  // effect runs against default (empty) reminder state on cold mount and never
  // reruns, so reminders would silently never fire on a fresh app open.
  const mounted = _hasHydrated;
  const router = useRouter();
  const [banners, setBanners] = useState<ReminderType[]>([]);
  const [medBanners, setMedBanners] = useState<string[]>([]); // medication IDs
  const [showStreakBanner, setShowStreakBanner] = useState(false);
  // Which due item is currently the one actually shown, when more than one is
  // due at once. Showing every due reminder at the same time - even grouped
  // into one visual card - was explicitly reported as overwhelming, an ND
  // sensory/accessibility concern and not a styling preference: only ONE
  // reminder is ever rendered at a time, with a quiet "+N more" affordance to
  // deliberately step to the next one. Clamped against the current due list
  // on every render (see dueItems below) rather than reset via an effect, so
  // dismissing the visible item naturally reveals the next one in its place.
  const [activeIndex, setActiveIndex] = useState(0);

  // Reads live store state via getState() rather than the checkInReminders /
  // medicationReminders / etc. destructured above. Those are only fresh as of
  // whatever render created THIS closure - the mount effect below registers
  // its visibilitychange listener once (deps: [mounted]) and never again, so
  // that listener permanently wraps the checkReminders defined during the
  // very first render. Every later app-foreground event was calling that
  // frozen closure, which still saw the pre-hydration/pre-mark snapshot of
  // "have I shown this today" - so a reminder correctly marked notified minutes
  // earlier would look undecided again on every subsequent foreground,
  // re-showing the same banner indefinitely. getState() sidesteps the
  // staleness entirely by reading the store directly at call time instead of
  // trusting whatever this function's lexical scope captured.
  function checkReminders() {
    const store = useAppStore.getState();
    const { notificationStyle, checkInReminders, medicationTakenDates, medicationReminderShownDates, medicationReminders, streakReminder, streak } = store;
    if (notificationStyle === "silent") return;
    const style = notificationStyle as Exclude<NotifStyle, "silent">;

    const today = getTodayKey();
    const due: ReminderType[] = [];

    (["mood", "body", "full", "thirstHunger"] as ReminderType[]).forEach((type) => {
      const r = checkInReminders[type];
      if (!r.enabled) return;
      const hasSlotDue = r.times.some(
        (t) => isTimePast(t) && r.lastNotifiedDates[t] !== today
      );
      if (hasSlotDue) due.push(type);
    });

    // Medication reminders: show a banner once per due slot per day. This used
    // to have no "already shown" gate at all - it recomputed straight from
    // "isn't marked taken yet" on every single foreground, so an untaken dose
    // re-popped the same banner every time the app was opened, all day. Taking
    // the dose still clears it immediately as before; this only stops it from
    // re-announcing itself when nothing has changed.
    //
    // The "shown" key deliberately includes the reminder's current time,
    // unlike the "taken" key (which must stay id/slot-only to match
    // toggleMedicationTaken's format - "taken" means the dose is done for the
    // slot regardless of what time it was originally due). Editing a
    // medication's time later in the day - the user missed the morning dose
    // and wants a nudge this afternoon instead, or a tester retiming it to
    // verify the reminder still works - used to stay permanently gated by the
    // OLD time's "already shown today" flag, since the key never changed.
    const takenToday = medicationTakenDates[today] ?? [];
    const shownToday = medicationReminderShownDates[today] ?? [];
    const dueMedIds: string[] = [];
    const newlyShownKeys: string[] = [];
    medicationReminders.forEach((m) => {
      const slots: { takenKey: string; shownKey: string; time: string }[] =
        m.schedule === "both"
          ? [
              { takenKey: `${m.id}-morning`, shownKey: `${m.id}-morning:${m.time}`, time: m.time },
              ...(m.eveningTime
                ? [{ takenKey: `${m.id}-evening`, shownKey: `${m.id}-evening:${m.eveningTime}`, time: m.eveningTime }]
                : []),
            ]
          : [{ takenKey: m.id, shownKey: `${m.id}:${m.time}`, time: m.time }];
      const newlyDue = slots.filter(
        (slot) => isTimePast(slot.time) && !takenToday.includes(slot.takenKey) && !shownToday.includes(slot.shownKey)
      );
      if (newlyDue.length > 0) {
        dueMedIds.push(m.id);
        newlyShownKeys.push(...newlyDue.map((slot) => slot.shownKey));
      }
    });
    if (dueMedIds.length > 0) {
      setMedBanners(dueMedIds);
      store.markMedicationReminderShown(newlyShownKeys, today);
    }

    // Streak morning reminder
    const sr = streakReminder;
    const streakDue = sr.enabled && streak > 0 && isTimePast(sr.time) && sr.lastNotifiedDate !== today;

    if (due.length === 0 && !streakDue) return;

    const permGranted = checkInReminders.permissionState === "granted" && typeof Notification !== "undefined";

    if (permGranted) {
      due.forEach((type) => {
        const r = checkInReminders[type];
        const cfg = REMINDER_CONFIG[type];
        r.times.forEach((t) => {
          if (!isTimePast(t) || r.lastNotifiedDates[t] === today) return;
          try {
            new Notification(cfg.label, {
              body: reminderBody(cfg, style),
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              tag: `checkin-${type}-${t}`,
            });
          } catch { /* fallback below */ }
          store.markReminderNotified(type, t, today);
        });
      });

      if (streakDue) {
        const streakCfg = STREAK_CONFIG[style];
        try {
          new Notification(streakCfg.title, {
            body: streakCfg.body(streak),
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "streak-reminder",
          });
        } catch { /* fallback below */ }
        store.markStreakReminderNotified(today);
      }
    } else {
      // In-app banners
      if (due.length > 0) {
        setBanners(due);
        due.forEach((type) => {
          const r = checkInReminders[type];
          r.times.forEach((t) => {
            if (isTimePast(t) && r.lastNotifiedDates[t] !== today) {
              store.markReminderNotified(type, t, today);
            }
          });
        });
      }
      if (streakDue) {
        setShowStreakBanner(true);
        store.markStreakReminderNotified(today);
      }
    }
  }

  useEffect(() => {
    if (!mounted) return;
    let disposed = false;

    (async () => {
      const native = await detectNative();
      if (disposed) return;
      if (native) {
        // On the Capacitor build, notification permission is an OS-level grant
        // (Android 13+ system dialog), not the web Notification API.
        const perm = await checkNativePermission();
        if (!disposed) setReminderPermissionState(perm);
      } else if (typeof Notification !== "undefined") {
        setReminderPermissionState(Notification.permission as "default" | "granted" | "denied");
      }
    })();

    // In-app banners + web Notification() fallback. On native this still runs so
    // opening the app surfaces the banner nudge; OS-scheduled notifications
    // (see the sync effect below) cover the app-closed case.
    checkReminders();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkReminders();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Reconcile real OS-scheduled local notifications with reminder state. No-op on
  // web. Re-runs whenever any reminder slice changes (toggle, time edit, style,
  // streak count, meds) and on every foreground so schedules stay in step.
  useEffect(() => {
    if (!mounted) return;
    let disposed = false;

    const sync = () => {
      void syncNativeNotifications({
        notificationStyle,
        checkInReminders,
        streakReminder,
        streak,
        medicationReminders,
        appointments,
        tasks,
        toolReminders,
      });
    };

    sync();

    const handleVisibility = () => {
      if (!disposed && document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mounted, notificationStyle, checkInReminders, streakReminder, streak, medicationReminders, appointments, tasks, toolReminders]);

  // Route the SPA when a scheduled notification is tapped (native only).
  useEffect(() => {
    if (!mounted) return;
    let remove: (() => void) | undefined;
    let disposed = false;
    addNativeTapListener((href) => router.push(href)).then((fn) => {
      if (disposed) fn();
      else remove = fn;
    });
    return () => {
      disposed = true;
      remove?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Auto-dismiss: banners used to have no expiry, so an unattended one (nobody
  // taps Go or X) rode along across every subsequent page - including ones it
  // has nothing to do with, like Settings - sitting on top of the content
  // underneath indefinitely. Give it a generous read window, then clear itself.
  // Restarts the window on any change, so a newly-added banner still gets its
  // full read time even if another one is already showing.
  useEffect(() => {
    if (banners.length === 0 && medBanners.length === 0 && !showStreakBanner) return;
    const timer = setTimeout(() => {
      setBanners([]);
      setMedBanners([]);
      setShowStreakBanner(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [banners, medBanners, showStreakBanner]);

  if (banners.length === 0 && medBanners.length === 0 && !showStreakBanner) return null;

  // Banners only ever get populated when notificationStyle !== "silent" (checkReminders
  // returns early otherwise), so this fallback is just to satisfy the type checker.
  const style: Exclude<NotifStyle, "silent"> = notificationStyle === "silent" ? "gentle" : notificationStyle;
  const streakCfg = STREAK_CONFIG[style];

  // Streak, check-in groups, and medication reminders used to each render as
  // their own floating card, and an earlier pass tried "fix" this by merging
  // them into rows inside one shared card - but the actual complaint was never
  // the card boundary. Showing every due reminder at the same time, visible
  // together, is itself the problem: an explicit ND sensory/overwhelm concern
  // ("i have never used an app in my life that shows all notifications at the
  // same time stacked so you can see all of them"), not a layout preference.
  // So only the single highest-priority item ever renders - medication first
  // (health-safety-time-sensitive), then check-ins, then the streak nudge
  // last (pure gamification, least urgent) - with the rest sitting behind a
  // quiet "+N more" control that steps to the next one only on an explicit
  // tap. Nothing about a second or third due reminder is visible until the
  // user deliberately asks for it.
  const dueItems: {
    key: string;
    Icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    body: string;
    onGo: () => void;
    onDismiss: () => void;
  }[] = [];

  if (medBanners.length > 0) {
    dueItems.push({
      key: "medication",
      Icon: Pill,
      iconBg: "bg-sage-100",
      iconColor: "text-sage-600",
      title: "Medication reminder",
      body:
        medBanners.length === 1
          ? medicationReminders.find((m) => m.id === medBanners[0])?.name ?? "Medication"
          : `${medBanners.length} medications to take`,
      onGo: () => { setMedBanners([]); router.push("/me"); },
      onDismiss: () => setMedBanners([]),
    });
  }

  groupBanners(banners, style).forEach((group) => {
    dueItems.push({
      key: group.key,
      Icon: group.Icon,
      iconBg: "bg-sage-100",
      iconColor: "text-sage-600",
      title: group.title,
      body: group.body,
      onGo: () => {
        setBanners((b) => b.filter((t) => !group.types.includes(t)));
        router.push(group.href);
      },
      onDismiss: () => setBanners((b) => b.filter((t) => !group.types.includes(t))),
    });
  });

  if (showStreakBanner) {
    dueItems.push({
      key: "streak",
      Icon: Flame,
      iconBg: "bg-terracotta-100",
      iconColor: "text-terracotta-600",
      title: streakCfg.title,
      body: streakCfg.body(streak),
      onGo: () => { setShowStreakBanner(false); router.push("/"); },
      onDismiss: () => setShowStreakBanner(false),
    });
  }

  // dueItems can shrink (a Go/dismiss, or the underlying reminder state
  // changing) without activeIndex having moved - clamp rather than reset, so
  // acting on the visible item naturally slides the next one into its place.
  const activeItem = dueItems[Math.min(activeIndex, dueItems.length - 1)];
  const moreCount = dueItems.length - 1;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto">
      {moreCount > 0 && (
        <div className="h-2 mx-3 rounded-t-2xl bg-sage-100 border border-b-0 border-sage-200" aria-hidden="true" />
      )}
      <div className="bg-white rounded-2xl shadow-xl border border-sage-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${activeItem.iconBg} flex items-center justify-center shrink-0`}>
            <activeItem.Icon size={17} className={activeItem.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">{activeItem.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{activeItem.body}</p>
          </div>
          <button
            onClick={activeItem.onGo}
            className="text-xs font-semibold text-sage-600 underline underline-offset-2 shrink-0"
          >
            Go
          </button>
          <button
            onClick={activeItem.onDismiss}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
        {moreCount > 0 && (
          <button
            onClick={() => setActiveIndex((i) => (i + 1) % dueItems.length)}
            className="mt-2 pt-2 border-t border-sage-100 w-full text-left text-[11px] font-medium text-slate-400 hover:text-slate-500 transition-colors"
          >
            +{moreCount} more waiting - tap to see next
          </button>
        )}
      </div>
    </div>
  );
}
