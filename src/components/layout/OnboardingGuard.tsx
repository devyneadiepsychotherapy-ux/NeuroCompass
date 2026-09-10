"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

// Routes a not-yet-onboarded user is allowed to sit on.
const PUBLIC_PREFIXES = ["/onboarding", "/tour"];

/**
 * Route-level onboarding gate. `src/app/page.tsx` already redirects on "/", but
 * every other route rendered without a check, so a first-time user who entered on
 * a deep route (a home-screen app shortcut -> /mood, a notification tap, OS
 * session restore) could use the app having never seen onboarding. The old "/"
 * gate also leaned on StartPageGuard bouncing fresh sessions home, which relies
 * on sessionStorage["nc-session"] being absent -- and that survives a warm
 * WebView resume on Android. This guard covers every route and doesn't depend on
 * it. Renders nothing.
 */
export default function OnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const hydrated = useAppStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hydrated || hasOnboarded) return;
    const path = pathname ?? "/";
    const onPublicRoute = PUBLIC_PREFIXES.some(
      (p) => path === p || path.startsWith(p + "/"),
    );
    if (!onPublicRoute) router.replace("/onboarding");
  }, [hydrated, hasOnboarded, pathname, router]);

  return null;
}
