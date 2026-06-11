"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// If the app has been in the background for longer than this, redirect to home on re-open
const BACKGROUND_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function StartPageGuard() {
  const router = useRouter();

  useEffect(() => {
    // Fresh session (new tab / PWA cold start) → go home
    if (!sessionStorage.getItem("nc-session")) {
      sessionStorage.setItem("nc-session", "1");
      router.replace("/");
    }

    // Track background time; redirect home if away long enough
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        sessionStorage.setItem("nc-hidden-at", Date.now().toString());
      } else if (document.visibilityState === "visible") {
        const hiddenAt = sessionStorage.getItem("nc-hidden-at");
        if (hiddenAt && Date.now() - parseInt(hiddenAt) > BACKGROUND_TIMEOUT_MS) {
          router.replace("/");
        }
        sessionStorage.removeItem("nc-hidden-at");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [router]);

  return null;
}
