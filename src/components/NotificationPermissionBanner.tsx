"use client";
import { useAppStore } from "@/store/useAppStore";

/**
 * Shared "allow OS notifications" prompt. The permission it requests is global
 * (one Android/browser grant covers check-in, streak, and medication
 * reminders alike) but for a long time the only place a user could actually
 * see and tap "Allow" was buried inside the Check-In page's collapsed
 * "Reminders" accordion. The Settings > Notifications section and the
 * Medication Reminder tool both schedule real notifications but had no
 * permission control of their own -- toggling them on silently did nothing
 * if permission had never been granted. This component is now shared across
 * all three surfaces so the prompt (and its logic) live in one place.
 */
export function NotificationPermissionBanner() {
  const permissionState = useAppStore((s) => s.checkInReminders.permissionState);
  const setReminderPermissionState = useAppStore((s) => s.setReminderPermissionState);

  if (permissionState === "granted") return null;

  async function requestPermission() {
    const { requestAnyNotificationPermission } = await import("@/lib/nativeNotifications");
    setReminderPermissionState(await requestAnyNotificationPermission());
  }

  return (
    <div className="bg-sage-50 border border-sage-100 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
      <p className="text-xs text-slate-600 flex-1">
        {permissionState === "denied"
          ? "Notifications blocked. Enable in device settings."
          : "Allow notifications to get reminders when the app is closed."}
      </p>
      {permissionState !== "denied" && (
        <button
          onClick={requestPermission}
          className="text-xs font-semibold text-sage-700 underline shrink-0"
        >
          Allow
        </button>
      )}
    </div>
  );
}
