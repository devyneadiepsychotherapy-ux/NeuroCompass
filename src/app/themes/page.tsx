"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { THEMES, Theme, ThemeId } from "@/lib/themes";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Abstract colour swatch — feels modern, not like a fake old website */
function ThemePreview({ theme }: { theme: Theme }) {
  const [c1, c2, c3] = theme.preview;
  return (
    <div
      className="w-full h-28 relative overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${theme.background} 0%, ${c1}55 100%)` }}
    >
      {/* Large primary blob — top right */}
      <div
        className="absolute -right-12 -top-12 w-40 h-40 rounded-full"
        style={{ background: c2, opacity: 0.5 }}
      />
      {/* Secondary blob — bottom left */}
      <div
        className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full"
        style={{ background: c3, opacity: 0.35 }}
      />
      {/* Colour chip row */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        {theme.preview.map((color, i) => (
          <div
            key={i}
            className="rounded-full shadow-sm"
            style={{
              background: color,
              width: i === 0 ? 28 : 18,
              height: i === 0 ? 28 : 18,
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const router = useRouter();
  const { profile, activeTheme, setActiveTheme } = useAppStore();
  const userLevel = profile.level;

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b border-black/5 px-4 py-3 flex items-center gap-3"
        style={{ background: "var(--background)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center"
        >
          <ArrowLeft size={18} style={{ color: "var(--text)" }} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>Themes</h1>
      </div>

      <div className="px-4 pt-5 space-y-3">
        <p className="text-xs text-slate-400 px-1">
          Unlock new themes by levelling up. Each card shows that theme&apos;s real colours.
        </p>

        {THEMES.map((theme) => {
          const unlocked = userLevel >= theme.unlockLevel;
          const isActive = activeTheme === theme.id;

          return (
            <div
              key={theme.id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                border: isActive
                  ? `2.5px solid ${theme.primary}`
                  : "1.5px solid rgba(0,0,0,0.08)",
              }}
            >
              {/* Preview swatch */}
              <div className="relative">
                <ThemePreview theme={theme} />

                {/* Locked overlay */}
                {!unlocked && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
                    style={{ background: "rgba(0,0,0,0.42)" }}
                  >
                    <Lock size={20} className="text-white" />
                    <span className="text-white text-xs font-semibold">
                      Unlocks at Level {theme.unlockLevel}
                    </span>
                  </div>
                )}
              </div>

              {/* Info footer — rendered in that theme's own card colour */}
              <div
                className="flex items-center justify-between px-3.5 py-2.5 gap-3"
                style={{ background: theme.card }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight" style={{ color: theme.text }}>
                    {theme.name}
                  </p>
                  {!unlocked && (
                    <p className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                      {theme.unlockLevel - userLevel} level{theme.unlockLevel - userLevel !== 1 ? "s" : ""} away
                    </p>
                  )}
                  {isActive && (
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: theme.primary }}>
                      Active
                    </p>
                  )}
                </div>

                {unlocked && !isActive && (
                  <button
                    onClick={() => setActiveTheme(theme.id as ThemeId)}
                    className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                    style={{ background: theme.primary, color: theme.card }}
                  >
                    Apply
                  </button>
                )}
                {isActive && (
                  <div
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: theme.primary }}
                  >
                    <Check size={13} style={{ color: theme.card }} strokeWidth={2.5} />
                  </div>
                )}
                {!unlocked && (
                  <Lock size={14} className="shrink-0" style={{ color: theme.textMuted }} />
                )}
              </div>
            </div>
          );
        })}

        {/* Next unlock hint */}
        {(() => {
          const next = THEMES.find((t) => t.unlockLevel > userLevel);
          if (!next) return null;
          return (
            <p className="text-xs text-slate-400 mt-2 px-1">
              Next: <span className="font-semibold text-slate-500">{next.name}</span> at Level {next.unlockLevel}
            </p>
          );
        })()}
      </div>
    </div>
  );
}
