"use client";
/**
 * ReminderManager — fires check-in reminder notifications when the app is opened
 * or brought back to the foreground, if the set time has passed and we haven't
 * already notified today.
 *
 * Delivery: uses the native Notifications API (works as a PWA on Android/desktop).
 * On iOS, browser notifications only appear when the app is foregrounded — the
 * in-app banner fallback handles that case.
 */
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Heart, Scan, ClipboardList, X } from "lucide-react";

type ReminderType = "mood" | "body" | "full";

const REMINDER_CONFIG: Record<ReminderType, { label: string; body: string; href: string; Icon: React.ElementType }> = {
  mood: {
    label: "Mood Check-In",
    body: "Time for a quick mood check-in 💚",
    href: "/mood",
    Icon: Heart,
  },
  body: {
    label: "Body Check-In",
    body: "Take a moment to check in with your body 🌿",
    href: "/mood",
    Icon: Scan,
  },
  full: {
    label: "Full Check-In",
    body: "Your full daily check-in is ready when you are 🌟",
    href: "/mood",
    Icon: ClipboardList,
  },
};

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function isTimePast(time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

export default function ReminderManager() {
  const { checkInReminders, markReminderNotified, setReminderPermissionState } = useAppStore();
  const router = useRouter();
  const [banners, setBanners] = useState<ReminderType[]>([]);

  function checkReminders() {
    const today = getTodayKey();
    const due: ReminderType[] = [];

    (["mood", "body", "full"] as ReminderType[]).forEach((type) => {
      const r = checkInReminders[type];
      if (!r.enabled) return;
      // Fire for each time slot that has passed and hasn't been notified today
      const hasSlotDue = r.times.some(
        (t) => isTimePast(t) && r.lastNotifiedDates[t] !== today
      );
      if (hasSlotDue) due.push(type);
    });

    if (due.length === 0) return;

    if (checkInReminders.permissionState === "granted" && typeof Notification !== "undefined") {
      // Fire native notifications
      due.forEach((type) => {
        const r = checkInReminders[type];
        const cfg = REMINDER_CONFIG[type];
        r.times.forEach((t) => {
          if (!isTimePast(t) || r.lastNotifiedDates[t] === today) return;
          try {
            new Notification(cfg.label, {
              body: cfg.body,
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              tag: `checkin-${type}-${t}`,
            });
          } catch {
            // Fallback to in-app banner if native notification fails
          }
          markReminderNotified(type, t, today);
        });
      });
    } else {
      // Show in-app banners (one per type, mark all due slots)
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
  }

  useEffect(() => {
    // Sync permission state with browser reality on mount
    if (typeof Notification !== "undefined") {
      setReminderPermissionState(Notification.permission as "default" | "granted" | "denied");
    }

    checkReminders();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkReminders();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2 max-w-sm mx-auto">
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
              <p className="text-xs text-slate-500 mt-0.5">Ready when you are</p>
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
    </div>
  );
}
