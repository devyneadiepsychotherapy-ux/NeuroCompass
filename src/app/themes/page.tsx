"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { THEMES, ThemeId } from "@/lib/themes";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function ThemeSwatch({ colors }: { colors: string[] }) {
  return (
    <div className="flex rounded-lg overflow-hidden h-7 w-16 shrink-0 border border-black/10">
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
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
        className="sticky top-0 z-10 border-b border-slate-100 px-4 py-3 flex items-center gap-3"
        style={{ background: "var(--background)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Themes</h1>
      </div>

      <div className="px-4 pt-5 space-y-2">
        <p className="text-xs text-slate-400 mb-4 px-1">
          Unlock new themes as you level up. New themes unlock at levels 2, 3, 5, 7, and 10.
        </p>

        {THEMES.map((theme) => {
          const unlocked = userLevel >= theme.unlockLevel;
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => unlocked && setActiveTheme(theme.id as ThemeId)}
              disabled={!unlocked}
              className={cn(
                "w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                isActive
                  ? "bg-sage-50 border-sage-300 shadow-sm"
                  : unlocked
                  ? "bg-white border-slate-100 hover:border-slate-200"
                  : "bg-white border-slate-100 opacity-50 cursor-not-allowed"
              )}
            >
              {/* Swatch */}
              <div className="relative shrink-0">
                <ThemeSwatch colors={theme.preview} />
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                    <Lock size={12} className="text-slate-500" />
                  </div>
                )}
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-sage-800" : "text-slate-700"
                  )}
                >
                  {theme.name}
                </p>
                {!unlocked && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unlocks at Level {theme.unlockLevel}
                  </p>
                )}
                {unlocked && !isActive && (
                  <p className="text-xs text-slate-400 mt-0.5">Tap to apply</p>
                )}
                {isActive && (
                  <p className="text-xs text-sage-600 font-medium mt-0.5">Active</p>
                )}
              </div>

              {/* Active checkmark or lock */}
              {isActive && (
                <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center shrink-0">
                  <Check size={13} className="text-white" strokeWidth={2.5} />
                </div>
              )}
              {!unlocked && (
                <Lock size={14} className="text-slate-300 shrink-0" />
              )}
            </button>
          );
        })}

        {/* Next unlock hint */}
        {(() => {
          const nextTheme = THEMES.find((t) => t.unlockLevel > userLevel);
          if (!nextTheme) return null;
          return (
            <p className="text-xs text-slate-400 mt-3 px-1">
              Next unlock:{" "}
              <span className="font-semibold text-slate-500">{nextTheme.name}</span>{" "}
              at Level {nextTheme.unlockLevel}
            </p>
          );
        })()}
      </div>
    </div>
  );
}
