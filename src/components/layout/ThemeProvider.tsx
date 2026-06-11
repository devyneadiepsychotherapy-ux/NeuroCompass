"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { getTheme, THEMES } from "@/lib/themes";
import Link from "next/link";
import { Sparkles, X, Snowflake, Star } from "lucide-react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeTheme = useAppStore((s) => s.activeTheme);
  const pendingLevelUp = useAppStore((s) => s.pendingLevelUp);
  const setPendingLevelUp = useAppStore((s) => s.setPendingLevelUp);
  const theme = getTheme(activeTheme);

  // Apply data-theme to <html> so [data-theme="x"] CSS overrides cascade to all Tailwind classes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  const cssVars = {
    "--bg": theme.background,
    "--card": theme.card,
    "--primary": theme.primary,
    "--secondary": theme.secondary,
    "--text": theme.text,
    "--text-muted": theme.textMuted,
  } as React.CSSProperties;

  return (
    <div style={{ ...cssVars, minHeight: "100vh", background: theme.background }}>
      {children}
      {pendingLevelUp && (
        <LevelUpToast
          data={pendingLevelUp}
          onDismiss={() => setPendingLevelUp(null)}
        />
      )}
    </div>
  );
}

type LevelUpData = {
  level: number;
  gotFreeze: boolean;
  unlockedTheme: string | null;
  nextThemeLevel: number | null;
};

function LevelUpToast({
  data,
  onDismiss,
}: {
  data: LevelUpData;
  onDismiss: () => void;
}) {
  const unlockedTheme = data.unlockedTheme ? THEMES.find((t) => t.id === data.unlockedTheme) : null;

  useEffect(() => {
    const t = setTimeout(onDismiss, 9000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="rounded-2xl shadow-xl border border-lavender-300 bg-white px-4 py-3 space-y-2.5">

        {/* Level up header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-lavender-100 flex items-center justify-center shrink-0 mt-0.5">
            <Star size={17} className="text-lavender-600 fill-lavender-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">Level {data.level}!</p>
            {data.gotFreeze && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Snowflake size={12} className="text-blue-400" />
                <p className="text-xs text-slate-600">You earned a Streak Freeze</p>
              </div>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Theme unlock row */}
        {unlockedTheme && (
          <div
            className="rounded-xl px-3 py-2 flex items-center gap-2.5 border"
            style={{
              background: unlockedTheme.background,
              borderColor: unlockedTheme.primary + "40",
            }}
          >
            <Sparkles size={14} style={{ color: unlockedTheme.primary }} className="shrink-0" />
            <p className="text-xs flex-1" style={{ color: unlockedTheme.text }}>
              New palette unlocked:{" "}
              <span className="font-semibold" style={{ color: unlockedTheme.primary }}>
                {unlockedTheme.name}
              </span>
            </p>
            <Link
              href="/themes"
              className="text-xs font-semibold underline underline-offset-2 shrink-0"
              style={{ color: unlockedTheme.primary }}
              onClick={onDismiss}
            >
              Try it
            </Link>
          </div>
        )}

        {/* No theme unlock - show next hint */}
        {!unlockedTheme && data.nextThemeLevel !== null && (
          <p className="text-xs text-slate-400 pl-12">
            Next theme unlocks at Level {data.nextThemeLevel}
          </p>
        )}
      </div>
    </div>
  );
}
