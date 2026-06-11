"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { THEMES, Theme, ThemeId } from "@/lib/themes";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mini UI mockup showing a theme's actual colours */
function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-black/10"
      style={{ background: theme.background }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ background: theme.primary }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full" style={{ background: theme.card, opacity: 0.8 }} />
          <div className="text-[9px] font-bold" style={{ color: theme.card }}>NeuroCompass</div>
        </div>
        <div className="w-12 h-2 rounded-full" style={{ background: theme.card, opacity: 0.4 }} />
      </div>

      {/* Body */}
      <div className="p-2.5 space-y-1.5">
        {/* Card row */}
        <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: theme.card }}>
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: theme.primary }} />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 rounded-full w-3/4" style={{ background: theme.text, opacity: 0.7 }} />
            <div className="h-1 rounded-full w-1/2" style={{ background: theme.textMuted, opacity: 0.5 }} />
          </div>
        </div>
        {/* Second card */}
        <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: theme.card }}>
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: theme.secondary }} />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 rounded-full w-2/3" style={{ background: theme.text, opacity: 0.7 }} />
            <div className="h-1 rounded-full w-1/3" style={{ background: theme.textMuted, opacity: 0.5 }} />
          </div>
          <div className="px-1.5 py-0.5 rounded-full text-[7px] font-bold" style={{ background: theme.primary, color: theme.card }}>
            XP
          </div>
        </div>
        {/* Bottom nav strip */}
        <div className="flex justify-around pt-1">
          {[theme.primary, theme.textMuted, theme.textMuted, theme.textMuted, theme.textMuted].map((c, i) => (
            <div key={i} className="w-5 h-1.5 rounded-full" style={{ background: c, opacity: i === 0 ? 1 : 0.35 }} />
          ))}
        </div>
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
          Unlock new themes by levelling up: levels 2, 3, 5, 10, then every 5 after that. Each card shows exactly what that theme looks like.
        </p>

        {THEMES.map((theme) => {
          const unlocked = userLevel >= theme.unlockLevel;
          const isActive = activeTheme === theme.id;

          return (
            <div
              key={theme.id}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all",
                isActive ? "border-[3px]" : "border",
              )}
              style={{
                borderColor: isActive ? theme.primary : "rgba(0,0,0,0.08)",
              }}
            >
              {/* Preview */}
              <div className="relative">
                <ThemePreview theme={theme} />

                {/* Locked overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1.5"
                    style={{ background: "rgba(0,0,0,0.45)" }}>
                    <Lock size={20} className="text-white" />
                    <span className="text-white text-xs font-semibold">Unlocks at Level {theme.unlockLevel}</span>
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div
                className="flex items-center justify-between px-3 py-2.5"
                style={{ background: theme.card }}
              >
                <div>
                  <p className="text-sm font-bold" style={{ color: theme.text }}>{theme.name}</p>
                  {!unlocked && (
                    <p className="text-[11px]" style={{ color: theme.textMuted }}>
                      Level {theme.unlockLevel} · {theme.unlockLevel - userLevel} level{theme.unlockLevel - userLevel !== 1 ? "s" : ""} away
                    </p>
                  )}
                  {isActive && (
                    <p className="text-[11px] font-semibold" style={{ color: theme.primary }}>Active</p>
                  )}
                </div>

                {unlocked && !isActive && (
                  <button
                    onClick={() => setActiveTheme(theme.id as ThemeId)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: theme.primary, color: theme.card }}
                  >
                    Apply
                  </button>
                )}
                {isActive && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.primary }}>
                    <Check size={14} style={{ color: theme.card }} strokeWidth={2.5} />
                  </div>
                )}
                {!unlocked && (
                  <Lock size={14} style={{ color: theme.textMuted }} />
                )}
              </div>
            </div>
          );
        })}

        {/* Next unlock hint */}
        {(() => {
          const nextTheme = THEMES.find((t) => t.unlockLevel > userLevel);
          if (!nextTheme) return null;
          return (
            <p className="text-xs text-slate-400 mt-2 px-1">
              Next unlock: <span className="font-semibold text-slate-500">{nextTheme.name}</span> at Level {nextTheme.unlockLevel}
            </p>
          );
        })()}
      </div>
    </div>
  );
}
