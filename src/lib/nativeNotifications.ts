/**
 * nativeNotifications : bridges the app's reminder settings to real OS-scheduled
 * local notifications on the Capacitor Android build.
 *
 * On plain web (no Capacitor) every export is a cheap no-op, so callers can invoke
 * these unconditionally. `ReminderManager` keeps its in-app banner + web
 * `Notification()` path as the browser fallback; this module only does anything
 * when running inside the native WebView.
 *
 * Strategy: each enabled reminder slot becomes ONE daily-repeating local
 * notification (`schedule.on = { hour, minute }`). On every sync we cancel every
 * pending notification we previously scheduled and re-schedule from current
 * state, so toggling a reminder / changing a time / changing notification style
 * all converge without per-id bookkeeping. The app is the only source of local
 * notifications, so "cancel all pending" is safe.
 *
 * Copy here is intentionally kept in sync with REMINDER_CONFIG / STREAK_CONFIG in
 * ReminderManager.tsx (banners use the React-icon version, this uses plain text).
 */
import type {
  CheckInReminders,
  MedicationReminder,
  StreakReminderConfig,
} from "@/types";

type NotifStyle = "cheerleader" | "gentle" | "silent";
type PermState = "granted" | "denied" | "default";

const CHANNEL_ID = "reminders";

export interface NativeSyncInput {
  notificationStyle: NotifStyle;
  checkInReminders: CheckInReminders;
  streakReminder: StreakReminderConfig;
  streak: number;
  medicationReminders: MedicationReminder[];
}

let nativeChecked = false;
let nativeResult = false;

/** True only inside the Capacitor native WebView. Cached after first call. */
export async function detectNative(): Promise<boolean> {
  if (nativeChecked) return nativeResult;
  try {
    const { Capacitor } = await import("@capacitor/core");
    nativeResult = Capacitor.isNativePlatform();
  } catch {
    nativeResult = false;
  }
  nativeChecked = true;
  return nativeResult;
}

async function getPlugin() {
  const mod = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

function mapPerm(display: string): PermState {
  return display === "granted" ? "granted" : display === "denied" ? "denied" : "default";
}

/** Ask the OS for notification permission (Android 13+ system dialog). */
export async function requestNativePermission(): Promise<PermState> {
  if (!(await detectNative())) return "default";
  try {
    const LN = await getPlugin();
    const res = await LN.requestPermissions();
    return mapPerm(res.display);
  } catch {
    return "default";
  }
}

/** Read current OS notification permission without prompting. */
export async function checkNativePermission(): Promise<PermState> {
  if (!(await detectNative())) return "default";
  try {
    const LN = await getPlugin();
    const res = await LN.checkPermissions();
    return mapPerm(res.display);
  } catch {
    return "default";
  }
}

/** Route the SPA when the user taps a scheduled notification. Returns a cleanup fn. */
export async function addNativeTapListener(
  onNavigate: (href: string) => void,
): Promise<() => void> {
  if (!(await detectNative())) return () => {};
  try {
    const LN = await getPlugin();
    const handle = await LN.addListener("localNotificationActionPerformed", (action) => {
      const href = action.notification?.extra?.href;
      if (typeof href === "string" && href) onNavigate(href);
    });
    return () => {
      void handle.remove();
    };
  } catch {
    return () => {};
  }
}

function parseHM(t: string): { hour: number; minute: number } {
  const [h, m] = t.split(":").map(Number);
  return { hour: Number.isFinite(h) ? h : 0, minute: Number.isFinite(m) ? m : 0 };
}

/** FNV-1a → stable positive 31-bit int, so cancel/replace targets the same slot. */
function hashId(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h & 0x7fffffff;
}

const CHECKIN_COPY: Record<
  keyof Omit<CheckInReminders, "permissionState">,
  { title: string; cheer: string; gentle: string; href: string }
> = {
  mood: {
    title: "Mood Check-In",
    cheer: "Time for a quick mood check-in \u{1F49A}",
    gentle: "No rush, a mood check-in is here whenever you want it.",
    href: "/mood",
  },
  body: {
    title: "Body Check-In",
    cheer: "Take a moment to check in with your body \u{1F33F}",
    gentle: "Your body check-in is here whenever you're ready. No pressure.",
    href: "/mood",
  },
  full: {
    title: "Full Check-In",
    cheer: "Your full daily check-in is ready when you are \u{1F31F}",
    gentle: "Your full check-in is ready whenever it feels right today.",
    href: "/mood",
  },
  thirstHunger: {
    title: "Thirst & Hunger Check-In",
    cheer: "Have you had water and food recently? \u{1F4A7}\u{1F34E}",
    gentle: "A quiet reminder: water and food, whenever you get a chance.",
    href: "/tools",
  },
};

interface PlannedNotification {
  id: number;
  title: string;
  body: string;
  href: string;
  hour: number;
  minute: number;
}

function planNotifications(input: NativeSyncInput): PlannedNotification[] {
  const style = input.notificationStyle as Exclude<NotifStyle, "silent">;
  const planned: PlannedNotification[] = [];

  (["mood", "body", "full", "thirstHunger"] as const).forEach((type) => {
    const entry = input.checkInReminders[type];
    if (!entry?.enabled) return;
    const copy = CHECKIN_COPY[type];
    entry.times.forEach((t) => {
      const { hour, minute } = parseHM(t);
      planned.push({
        id: hashId(`checkin:${type}:${t}`),
        title: copy.title,
        body: style === "cheerleader" ? copy.cheer : copy.gentle,
        href: copy.href,
        hour,
        minute,
      });
    });
  });

  const sr = input.streakReminder;
  if (sr?.enabled && input.streak > 0) {
    const { hour, minute } = parseHM(sr.time);
    planned.push({
      id: hashId("streak"),
      title: style === "cheerleader" ? "Keep your streak going! \u{1F525}" : "Your streak is still here",
      body:
        style === "cheerleader"
          ? `You're on a ${input.streak}-day streak. Open NeuroCompass to keep it alive.`
          : `${input.streak} days and counting. No pressure to check in today.`,
      href: "/",
      hour,
      minute,
    });
  }

  input.medicationReminders.forEach((m) => {
    const schedule = m.schedule ?? "morning";
    const slots: Array<{ slot: string; time: string }> = [];
    if (schedule === "both") {
      slots.push({ slot: "morning", time: m.time });
      if (m.eveningTime) slots.push({ slot: "evening", time: m.eveningTime });
    } else if (schedule === "evening") {
      slots.push({ slot: "evening", time: m.time });
    } else {
      slots.push({ slot: "morning", time: m.time });
    }
    slots.forEach(({ slot, time }) => {
      const { hour, minute } = parseHM(time);
      planned.push({
        id: hashId(`med:${m.id}:${slot}`),
        title: "Medication reminder",
        body:
          style === "cheerleader"
            ? `Time to take ${m.name} \u{1F48A}`
            : `A reminder to take ${m.name}, whenever you're ready.`,
        href: "/me",
        hour,
        minute,
      });
    });
  });

  return planned;
}

/**
 * Reconcile OS-scheduled notifications with current reminder state. Safe to call
 * on every app foreground and whenever a reminder setting changes. No-op on web.
 */
export async function syncNativeNotifications(input: NativeSyncInput): Promise<void> {
  if (!(await detectNative())) return;

  let LN: Awaited<ReturnType<typeof getPlugin>>;
  try {
    LN = await getPlugin();
  } catch {
    return;
  }

  // Android notification channel (ignored on other platforms).
  try {
    await LN.createChannel({
      id: CHANNEL_ID,
      name: "Reminders",
      description: "Check-in, streak, and medication reminders",
      importance: 4,
      visibility: 1,
    });
  } catch {
    /* not Android, or channels unsupported */
  }

  // Clear whatever we scheduled last time.
  try {
    const pending = await LN.getPending();
    if (pending.notifications.length > 0) {
      await LN.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }
  } catch {
    /* nothing pending */
  }

  if (input.notificationStyle === "silent") return;

  try {
    const perm = await LN.checkPermissions();
    if (perm.display !== "granted") return;
  } catch {
    return;
  }

  const planned = planNotifications(input);
  if (planned.length === 0) return;

  try {
    await LN.schedule({
      notifications: planned.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        channelId: CHANNEL_ID,
        schedule: { on: { hour: p.hour, minute: p.minute }, allowWhileIdle: true },
        extra: { href: p.href },
      })),
    });
  } catch (e) {
    console.warn("[nativeNotifications] schedule failed", e);
  }
}
