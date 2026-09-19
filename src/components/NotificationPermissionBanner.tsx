"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { requestAnyNotificationPermission } from "@/lib/nativeNotifications";
import { withTimeout } from "@/lib/utils";

const REQUEST_TIMEOUT_MS = 10000;

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
 *
 * Imports nativeNotifications statically (ReminderManager.tsx already does,
 * and works) rather than via a click-time `await import(...)`, which this
 * file used to do: a tester's "Allow" button got stuck on "Requesting..."
 * indefinitely, well past the 10s timeout the native calls inside that
 * module are guarded with - because that guard lives *inside* the
 * dynamically-imported module, so it can't protect against the import()
 * itself hanging (its chunk's network fetch stalling, most plausible on
 * mobile data for a chunk the service worker hasn't cached yet). The whole
 * click handler is now also raced against its own timeout below as a second
 * layer, independent of import() entirely.
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
      const result = await withTimeout(
        requestAnyNotificationPermission(),
        REQUEST_TIMEOUT_MS,
        "notification permission request",
      );
      setReminderPermissionState(result);
    } catch (e) {
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
