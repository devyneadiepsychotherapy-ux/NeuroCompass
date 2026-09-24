/**
 * nativeNotifications : bridges the app's reminder settings to real OS-scheduled
 * local notifications on the Capacitor Android build.
 *
 * On plain web (no Capacitor) every export is a cheap no-op, so callers can invoke
 * these unconditionally. `ReminderManager` keeps its in-app banner + web
 * `Notification()` path as the browser fallback; this module only does anything
 * when running inside the native WebView.
 *
 * Strategy: each enabled check-in/streak/medication reminder slot becomes ONE
 * daily-repeating local notification (`schedule.on = { hour, minute }`); each
 * appointment or non-recurring task with a reminder set becomes ONE dated,
 * one-time notification (`schedule.at = Date`) instead, since those fire once
 * and are done, not every day. On every sync we cancel every pending
 * notification we previously scheduled and re-schedule from current state, so
 * toggling a reminder / changing a time / changing notification style all
 * converge without per-id bookkeeping. The app is the only source of local
 * notifications, so "cancel all pending" is safe.
 *
 * Copy here is intentionally kept in sync with REMINDER_CONFIG / STREAK_CONFIG in
 * ReminderManager.tsx (banners use the React-icon version, this uses plain text).
 */
import type {
  Appointment,
  CheckInReminders,
  MedicationReminder,
  StreakReminderConfig,
  Task,
} from "@/types";

type NotifStyle = "cheerleader" | "gentle" | "silent";
type PermState = "granted" | "denied" | "default";

const CHANNEL_ID = "reminders";
// All of our notifications share this group so Android collapses several
// arriving close together into one expandable stack in the shade ("N
// notifications from NeuroCompass") instead of flooding it with full-size
// cards - check-ins, the streak reminder, and medication reminders each have
// independently user-configured times with no awareness of each other, so
// two landing in the same window (matching defaults, or just a coincidence
// of someone's own choices) is expected, not a bug in itself.
const NOTIFICATION_GROUP = "neurocompass-reminders";

export interface NativeSyncInput {
  notificationStyle: NotifStyle;
  checkInReminders: CheckInReminders;
  streakReminder: StreakReminderConfig;
  streak: number;
  medicationReminders: MedicationReminder[];
  appointments: Appointment[];
  tasks: Task[];
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

/**
 * Capacitor's registerPlugin() wraps every native plugin in a Proxy whose
 * `get` trap returns a callable stub for ANY property name, including
 * "then" - so the plugin object is accidentally "thenable". Returning it
 * directly from an async function (or awaiting it, or Promise.resolve()-ing
 * it) makes the JS engine treat it as a thenable and call `.then(resolve,
 * reject)` on it to adopt its state, per the Promise spec. The proxy
 * interprets that as a call to a native method literally named "then",
 * which doesn't exist: it throws an exception nobody catches (the
 * "Uncaught (in promise)" spam seen in adb logcat on every launch) and,
 * critically, never calls the resolve/reject it was given - so whatever
 * was awaiting the plugin hangs forever. This was the real cause of every
 * "Allow does nothing" / "stuck on Requesting..." report: every call site
 * below does `await` a helper that returned the proxy this way. Getting
 * the plugin inline, with the import and the property access as two
 * separate un-awaited statements, means the proxy itself never has a
 * chance to be treated as a return/await value.
 */
async function getPluginModule() {
  return import("@capacitor/local-notifications");
}

function mapPerm(display: string): PermState {
  return display === "granted" ? "granted" : display === "denied" ? "denied" : "default";
}

const NATIVE_CALL_TIMEOUT_MS = 10000;

/**
 * Every native plugin call gets raced against this. A tester reported the
 * "Allow" button doing nothing at all, on more than one screen, even after
 * assertPluginAvailable() started throwing on a missing bridge - which means
 * a thrown/rejected call wasn't the (only) failure mode. The other
 * possibility documented right on schedule()'s isExactNotification below is
 * that a native call can trigger an OS screen launch (the exact-alarm
 * settings prompt) that never returns a result back to JS if Android's
 * background-activity-launch rules block it in this calling context - the
 * call's promise then never resolves AND never rejects, so it neither
 * succeeds nor hits a catch block: nothing happens, forever, silently.
 * `try/catch` cannot see a promise that never settles; only racing it
 * against something that does can turn that into a visible, honest failure.
 */
function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[nativeNotifications] ${label} timed out after ${NATIVE_CALL_TIMEOUT_MS}ms`));
    }, NATIVE_CALL_TIMEOUT_MS);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/**
 * Guard every native call with this. `registerPlugin` (inside the
 * @capacitor/local-notifications package) silently falls back to its web
 * implementation - not native - whenever the bridge has no PluginHeader for
 * "LocalNotifications", even while `Capacitor.isNativePlatform()` correctly
 * reports true. That web fallback then throws "not supported in this
 * browser" the moment it's actually called (Android's WebView doesn't
 * implement the web Notification API), which every caller here used to
 * catch-and-swallow into "default" - a button tap that visibly does nothing,
 * a permission check that's silently always wrong, with zero trace of why.
 * Checking `isPluginAvailable` up front tells the two failure modes apart
 * and gets it into the logs instead of disappearing.
 */
async function assertPluginAvailable(): Promise<void> {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isPluginAvailable("LocalNotifications")) {
    console.error(
      "[nativeNotifications] LocalNotifications is not available on the native bridge " +
        "(isNativePlatform() is true, so this is a plugin-registration problem, not a " +
        "platform-detection one) - calls would silently fall back to the unsupported web implementation.",
    );
    throw new Error("LocalNotifications plugin unavailable on native bridge");
  }
}

/**
 * Ask the OS for notification permission (Android 13+ system dialog).
 *
 * Deliberately does NOT swallow failures into "default" the way the rest of
 * this module does for background sync calls: a tester reported tapping
 * "Allow" and getting no system dialog at all, with the app silently staying
 * in the un-granted state - i.e. this exact call was failing and nobody
 * could tell, because every catch here used to return "default" with no
 * logging. Real OS responses (granted/denied/no-decision-yet) still resolve
 * normally; an actual request failure (the plugin bridge unavailable, the
 * native call throwing) now propagates so the caller can show the user
 * something true ("that didn't work, try your phone's Settings app")
 * instead of a button that looks broken with no explanation.
 */
export async function requestNativePermission(): Promise<PermState> {
  if (!(await detectNative())) return "default";
  await assertPluginAvailable();
  const mod = await getPluginModule();
  const LN = mod.LocalNotifications;
  const res = await withTimeout(LN.requestPermissions(), "requestPermissions()");
  return mapPerm(res.display);
}

/**
 * Request whichever notification permission applies: the OS system dialog on
 * the Capacitor build, or the web Notification API on plain web. Shared by
 * every "Allow notifications" control in the app (Check-In, Settings,
 * Medication Reminder) so they all trigger the same prompt the same way.
 * Throws on a genuine request failure - see requestNativePermission - so
 * callers should catch it and show a fallback message rather than letting it
 * disappear.
 */
export async function requestAnyNotificationPermission(): Promise<PermState> {
  if (await detectNative()) return requestNativePermission();
  if (typeof Notification === "undefined") return "default";
  return mapPerm(await Notification.requestPermission());
}

/**
 * Read current OS notification permission without prompting. Runs on every
 * app foreground, so failures here are swallowed to "default" (a crash loop
 * on every resume would be worse than a wrong reading) - but logged, since a
 * silent failure here means the app can never see a permission the user
 * granted straight from their phone's Settings app, and every reminder stays
 * permanently un-scheduled with no visible explanation.
 */
export async function checkNativePermission(): Promise<PermState> {
  if (!(await detectNative())) return "default";
  try {
    await assertPluginAvailable();
    const mod = await getPluginModule();
    const LN = mod.LocalNotifications;
    const res = await withTimeout(LN.checkPermissions(), "checkPermissions()");
    return mapPerm(res.display);
  } catch (e) {
    console.error("[nativeNotifications] checkNativePermission failed", e);
    return "default";
  }
}

/** Route the SPA when the user taps a scheduled notification. Returns a cleanup fn. */
export async function addNativeTapListener(
  onNavigate: (href: string) => void,
): Promise<() => void> {
  if (!(await detectNative())) return () => {};
  try {
    const mod = await getPluginModule();
    const LN = mod.LocalNotifications;
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

type NotificationTime =
  // weekday, when present, is a Capacitor Weekday value (1=Sun...7=Sat) - see
  // recurringTaskWeekdays() below for why this differs from Task.recurDays'
  // own 0=Sun...6=Sat convention.
  | { kind: "daily"; hour: number; minute: number; weekday?: number }
  | { kind: "once"; at: Date };

interface PlannedNotification {
  id: number;
  title: string;
  body: string;
  href: string;
  time: NotificationTime;
}

/** Copy for a one-time reminder firing `mins` before (or at, if 0) the event. */
function leadTimeCopy(mins: number, style: Exclude<NotifStyle, "silent">): string {
  if (mins === 0) return style === "cheerleader" ? "It's happening now! \u{1F389}" : "It's time.";
  const unit = `minute${mins === 1 ? "" : "s"}`;
  return style === "cheerleader" ? `Starting in ${mins} ${unit} \u{23F0}` : `Starting in ${mins} ${unit}.`;
}

/**
 * Appointments and non-recurring tasks get ONE dated notification each,
 * unlike the daily-repeating reminders above. A recurring task has no single
 * stable date to fire on - real recurring native reminders are a separate,
 * bigger feature - so those are skipped here entirely, same as anything
 * already done/skipped or missing the fields needed to compute a fire time.
 * Past-due fire times are dropped rather than scheduled: Capacitor has no
 * defined behavior for an `at` time already in the past, and re-computing
 * this fresh on every sync means a completed/expired one-time reminder just
 * naturally stops appearing next time, with no separate bookkeeping needed.
 */
function planOneTimeNotifications(input: NativeSyncInput, now: Date): PlannedNotification[] {
  const style = input.notificationStyle as Exclude<NotifStyle, "silent">;
  const planned: PlannedNotification[] = [];

  // Each item's computation is isolated in its own try/catch (see the same
  // pattern below in planNotifications, and the comment there for why): one
  // appointment or task with an unexpected/legacy field shape - or a date
  // string that produces an Invalid Date, which silently passes the plain
  // `<=` past-due check below since any comparison against NaN is false -
  // must never be able to take the rest of this sync's scheduling down with
  // it. isNaN() on the computed time is a second, explicit guard against
  // that same Invalid Date case slipping through into a native schedule()
  // call, which Capacitor/Android has no defined behavior for.
  input.appointments.forEach((appt) => {
    try {
      if (appt.allDay || appt.reminderMinsBefore === undefined || !appt.startTime) return;
      const { hour, minute } = parseHM(appt.startTime);
      const at = new Date(`${appt.date}T00:00:00`);
      at.setHours(hour, minute - appt.reminderMinsBefore, 0, 0);
      if (isNaN(at.getTime()) || at.getTime() <= now.getTime()) return;
      planned.push({
        id: hashId(`appt:${appt.id}`),
        title: appt.title,
        body: leadTimeCopy(appt.reminderMinsBefore, style),
        href: "/planner",
        time: { kind: "once", at },
      });
    } catch (e) {
      console.error(`[nativeNotifications] skipping malformed appointment reminder "${appt.title ?? appt.id}"`, e);
    }
  });

  input.tasks.forEach((task) => {
    try {
      if (task.isRecurring) return;
      if (task.status === "done" || task.status === "skipped") return;
      if (task.reminderMinsBefore === undefined || !task.dueDate) return;
      const { hour, minute } = parseHM(task.startTime || "09:00");
      const at = new Date(`${task.dueDate}T00:00:00`);
      at.setHours(hour, minute - task.reminderMinsBefore, 0, 0);
      if (isNaN(at.getTime()) || at.getTime() <= now.getTime()) return;
      planned.push({
        id: hashId(`task:${task.id}`),
        title: task.title,
        body: leadTimeCopy(task.reminderMinsBefore, style),
        href: "/planner",
        time: { kind: "once", at },
      });
    } catch (e) {
      console.error(`[nativeNotifications] skipping malformed task reminder "${task.title ?? task.id}"`, e);
    }
  });

  return planned;
}

/**
 * Which day(s) a recurring task's daily-repeating reminder should fire on,
 * as Capacitor Weekday values (1=Sun...7=Sat - note this is NOT the same
 * convention as Task.recurDays, which is 0=Sun...6=Sat, so "custom" needs a
 * +1 conversion below). Returns:
 * - [] for "fires every day, no weekday filter needed" (daily)
 * - a non-empty array for "fires only on these specific weekdays"
 * - null for "cannot determine a sensible day(s) to fire on for this task,
 *   don't schedule a reminder at all" - true for "monthly" outright (a task
 *   pinned to e.g. "2nd Tuesday of the month" has no native construct for
 *   that; Capacitor's `on.day` is a fixed day-of-month, which would misfire
 *   on any month where the Nth-weekday lands on a different date), and for
 *   "weekly" specifically when the task has no dueDate to anchor to (weekly
 *   tasks are otherwise satisfied by completion anywhere in the calendar
 *   week - see isTaskDone in planner/page.tsx - not tied to one weekday, so
 *   there's nothing to derive a fire day from without one).
 */
function recurringTaskWeekdays(task: Task): number[] | null {
  switch (task.recurType) {
    case "daily":
      return [];
    case "weekdays":
      return [2, 3, 4, 5, 6]; // Mon-Fri
    case "weekends":
      return [1, 7]; // Sun, Sat
    case "custom":
      return (task.recurDays ?? []).map((d) => d + 1);
    case "weekly": {
      if (!task.dueDate) return null;
      const day = new Date(`${task.dueDate}T12:00:00`).getDay();
      return isNaN(day) ? null : [day + 1];
    }
    case "monthly":
    default:
      return null;
  }
}

/**
 * Every reminder type below is planned independently, each wrapped in its
 * own try/catch: a single malformed record (a legacy field shape, an
 * unexpected undefined) must only cost that ONE reminder, never silently
 * abort every other reminder sharing this same synchronous function. Before
 * this, one bad record anywhere in check-ins/streak/medication could throw
 * partway through and prevent planOneTimeNotifications() from ever running
 * at all - so a perfectly correctly-configured appointment or task reminder
 * could go permanently unscheduled for a reason that had nothing to do with
 * it, with nothing but a swallowed exception to show for it.
 */
function planNotifications(input: NativeSyncInput, now: Date): PlannedNotification[] {
  const style = input.notificationStyle as Exclude<NotifStyle, "silent">;
  const planned: PlannedNotification[] = [];

  (["mood", "body", "full", "thirstHunger"] as const).forEach((type) => {
    try {
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
          time: { kind: "daily", hour, minute },
        });
      });
    } catch (e) {
      console.error(`[nativeNotifications] skipping malformed check-in reminder "${type}"`, e);
    }
  });

  try {
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
        time: { kind: "daily", hour, minute },
      });
    }
  } catch (e) {
    console.error("[nativeNotifications] skipping malformed streak reminder", e);
  }

  input.medicationReminders.forEach((m) => {
    try {
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
          time: { kind: "daily", hour, minute },
        });
      });
    } catch (e) {
      console.error(`[nativeNotifications] skipping malformed medication reminder "${m.name ?? m.id}"`, e);
    }
  });

  // Recurring tasks: same daily-repeating rhythm as check-ins/medication above,
  // not the one-time schedule.at path planOneTimeNotifications() uses for
  // appointments and non-recurring tasks - a recurring task has no single
  // date to fire once on. reminderMinsBefore is reused purely as an enabled
  // flag here (its "before" framing doesn't apply to a task that isn't
  // counting down to a fixed event) - the reminder always fires exactly at
  // startTime, on whichever day(s) recurringTaskWeekdays() resolves.
  input.tasks.forEach((task) => {
    try {
      if (!task.isRecurring) return;
      if (task.reminderMinsBefore === undefined || !task.startTime) return;
      const weekdays = recurringTaskWeekdays(task);
      if (weekdays === null) return;
      const { hour, minute } = parseHM(task.startTime);
      const body =
        style === "cheerleader"
          ? `Time for: ${task.title} \u{2705}`
          : `A reminder for: ${task.title}, whenever you're ready.`;
      if (weekdays.length === 0) {
        planned.push({
          id: hashId(`recurtask:${task.id}`),
          title: task.title,
          body,
          href: "/planner",
          time: { kind: "daily", hour, minute },
        });
      } else {
        weekdays.forEach((weekday) => {
          planned.push({
            id: hashId(`recurtask:${task.id}:${weekday}`),
            title: task.title,
            body,
            href: "/planner",
            time: { kind: "daily", hour, minute, weekday },
          });
        });
      }
    } catch (e) {
      console.error(`[nativeNotifications] skipping malformed recurring task reminder "${task.title ?? task.id}"`, e);
    }
  });

  return [...planned, ...planOneTimeNotifications(input, now)];
}

/**
 * Reconcile OS-scheduled notifications with current reminder state. Safe to call
 * on every app foreground and whenever a reminder setting changes. No-op on web.
 */
export async function syncNativeNotifications(input: NativeSyncInput): Promise<void> {
  if (!(await detectNative())) return;

  let LN: Awaited<ReturnType<typeof getPluginModule>>["LocalNotifications"];
  try {
    await assertPluginAvailable();
    const mod = await getPluginModule();
    LN = mod.LocalNotifications;
  } catch (e) {
    console.error("[nativeNotifications] syncNativeNotifications: plugin unavailable, nothing scheduled", e);
    return;
  }

  // Android notification channel (ignored on other platforms).
  try {
    await withTimeout(
      LN.createChannel({
        id: CHANNEL_ID,
        name: "Reminders",
        description: "Check-in, streak, and medication reminders",
        importance: 4,
        visibility: 1,
      }),
      "createChannel()",
    );
  } catch {
    /* not Android, or channels unsupported */
  }

  // Clear whatever we scheduled last time.
  try {
    const pending = await withTimeout(LN.getPending(), "getPending()");
    if (pending.notifications.length > 0) {
      await withTimeout(
        LN.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) }),
        "cancel()",
      );
    }
  } catch {
    /* nothing pending */
  }

  if (input.notificationStyle === "silent") return;

  try {
    const perm = await withTimeout(LN.checkPermissions(), "checkPermissions()");
    if (perm.display !== "granted") return;
  } catch (e) {
    console.error("[nativeNotifications] syncNativeNotifications: checkPermissions failed, nothing scheduled", e);
    return;
  }

  const planned = planNotifications(input, new Date());
  if (planned.length === 0) return;

  try {
    await withTimeout(LN.schedule({
      notifications: planned.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        channelId: CHANNEL_ID,
        schedule:
          p.time.kind === "daily"
            ? { on: { hour: p.time.hour, minute: p.time.minute, weekday: p.time.weekday }, allowWhileIdle: true }
            : { at: p.time.at, allowWhileIdle: true },
        extra: { href: p.href },
        group: NOTIFICATION_GROUP,
        // isExactNotification defaults to true, and on Android 12+ that means
        // schedule() unilaterally launches the system "Alarms & reminders"
        // settings screen the moment permission isn't already granted - from
        // this automatic every-foreground sync call, not a deliberate tap.
        // That's very likely why notifications appeared to just not fire: the
        // plugin was hijacking the screen (or, if the background-activity-launch
        // was blocked by the OS, silently leaving this schedule() call's promise
        // unresolved) instead of ever reaching a scheduled notification. A mood
        // or medication reminder has no need for to-the-second precision, so
        // request inexact scheduling outright - still Doze-resistant via
        // allowWhileIdle, still fires within a few minutes of the target time,
        // and never depends on a permission we've never asked for or explained.
        // Applies equally to one-time appointment/task reminders below.
        isExactNotification: false,
      })),
    }), "schedule()");
  } catch (e) {
    console.warn("[nativeNotifications] schedule failed", e);
  }
}
