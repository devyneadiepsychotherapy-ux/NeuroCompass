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


function isTimePast(time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

export default function ReminderManager() {
  const {
    checkInReminders, markReminderNotified, setReminderPermissionState,
    streakReminder, markStreakReminderNotified, streak,
    medicationReminders, medicationTakenDates,
    notificationStyle, _hasHydrated,
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

  function checkReminders() {
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

    // Medication reminders: show banner if any due slot hasn't been taken yet
    const takenToday = medicationTakenDates[today] ?? [];
    const dueMeds = medicationReminders.filter((m) => {
      if (m.schedule === "both") {
        const morningDue = isTimePast(m.time) && !takenToday.includes(`${m.id}-morning`);
        const eveningDue = m.eveningTime && isTimePast(m.eveningTime) && !takenToday.includes(`${m.id}-evening`);
        return morningDue || eveningDue;
      }
      return isTimePast(m.time) && !takenToday.includes(m.id);
    }).map((m) => m.id);
    if (dueMeds.length > 0) {
      setMedBanners(dueMeds);
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
          markReminderNotified(type, t, today);
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
        markStreakReminderNotified(today);
      }
    } else {
      // In-app banners
      if (due.length > 0) {
        setBanners(due);
        due.forEach((type) => {
          const r = checkInReminders[type];
          r.times.forEach((t) => {
            if (isTimePast(t) && r.lastNotifiedDates[t] !== today) {
              markReminderNotified(type, t, today);
            }
          });
        });
      }
      if (streakDue) {
        setShowStreakBanner(true);
        markStreakReminderNotified(today);
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
  }, [mounted, notificationStyle, checkInReminders, streakReminder, streak, medicationReminders]);

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

  if (banners.length === 0 && medBanners.length === 0 && !showStreakBanner) return null;

  // Banners only ever get populated when notificationStyle !== "silent" (checkReminders
  // returns early otherwise), so this fallback is just to satisfy the type checker.
  const style: Exclude<NotifStyle, "silent"> = notificationStyle === "silent" ? "gentle" : notificationStyle;
  const streakCfg = STREAK_CONFIG[style];

  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2 max-w-sm mx-auto">
      {showStreakBanner && (
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-sage-200 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-terracotta-100 flex items-center justify-center shrink-0">
            <Flame size={17} className="text-terracotta-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">{streakCfg.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{streakCfg.body(streak)}</p>
          </div>
          <button
            onClick={() => { setShowStreakBanner(false); router.push("/"); }}
            className="text-xs font-semibold text-sage-600 underline underline-offset-2 shrink-0"
          >
            Go
          </button>
          <button
            onClick={() => setShowStreakBanner(false)}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {banners.map((type) => {
        const cfg = REMINDER_CONFIG[type];
        return (
          <div
            key={type}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-sage-200 px-4 py-3"
          >
            <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
              <cfg.Icon size={17} className="text-sage-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">{cfg.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{reminderBody(cfg, style)}</p>
            </div>
            <button
              onClick={() => {
                setBanners((b) => b.filter((t) => t !== type));
                router.push(cfg.href);
              }}
              className="text-xs font-semibold text-sage-600 underline underline-offset-2 shrink-0"
            >
              Go
            </button>
            <button
              onClick={() => setBanners((b) => b.filter((t) => t !== type))}
              className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      {medBanners.length > 0 && (
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-sage-200 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
            <Pill size={17} className="text-sage-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">Medication reminder</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {medBanners.length === 1
                ? medicationReminders.find((m) => m.id === medBanners[0])?.name ?? "Medication"
                : `${medBanners.length} medications to take`}
            </p>
          </div>
          <button
            onClick={() => { setMedBanners([]); router.push("/me"); }}
            className="text-xs font-semibold text-sage-600 underline underline-offset-2 shrink-0"
          >
            Go
          </button>
          <button
            onClick={() => setMedBanners([])}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
