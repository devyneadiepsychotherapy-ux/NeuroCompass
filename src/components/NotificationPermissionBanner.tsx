"use client";
import { useState } from "react";
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
  const [requestFailed, setRequestFailed] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (permissionState === "granted") return null;

  async function requestPermission() {
    setRequestFailed(false);
    setRequesting(true);
    try {
      const { requestAnyNotificationPermission } = await import("@/lib/nativeNotifications");
      setReminderPermissionState(await requestAnyNotificationPermission());
    } catch (e) {
      // The request itself failed (e.g. the native plugin bridge rejected the
      // call, or - now that native calls are timeout-guarded - it just never
      // came back at all) rather than the user simply not having decided yet.
      // This used to be swallowed, so the button looked broken with zero
      // feedback; it can now take up to ~10s to surface a genuine failure,
      // so the button showing "Requesting..." in the meantime matters more
      // than it used to - silence for that long reads as "did nothing" too.
      console.error("[NotificationPermissionBanner] permission request failed", e);
      setRequestFailed(true);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="bg-sage-50 border border-sage-100 rounded-xl px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-600 flex-1">
          {permissionState === "denied"
            ? "Notifications blocked. Enable in device settings."
            : "Allow notifications to get reminders when the app is closed."}
        </p>
        {permissionState !== "denied" && (
          <button
            onClick={requestPermission}
            disabled={requesting}
            className="text-xs font-semibold text-sage-700 underline shrink-0 disabled:opacity-50 disabled:no-underline"
          >
            {requesting ? "Requesting…" : "Allow"}
          </button>
        )}
      </div>
      {requestFailed && (
        <p className="text-xs text-terracotta-600 leading-relaxed">
          That didn&apos;t work. Turn notifications on for NeuroCompass from your phone&apos;s
          Settings app instead (Settings → Apps → NeuroCompass → Notifications).
        </p>
      )}
    </div>
  );
}
