"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { HabitBuilderItem } from "@/types";
import {
  ArrowLeft, Plus, Sprout, RefreshCw, Check, Star,
  Trash2, ChevronDown, ChevronUp, Flame, Heart,
} from "lucide-react";
import { cn, getTodayKey, localDateKey } from "@/lib/utils";

const FREQUENCY_LABELS: Record<HabitBuilderItem["frequency"], string> = {
  daily: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
  "3x": "3× a week",
  "2x": "2× a week",
};

const ANCHOR_PRESETS = [
  "After waking up",
  "After morning coffee/tea",
  "After brushing teeth",
  "After lunch",
  "After work/school",
  "After dinner",
  "Before bed",
];

function getStreakCount(completions: Record<string, "full" | "good-enough">): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localDateKey(d);
    if (completions[key]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ── Creation form ──────────────────────────────────────────────
function HabitCreateForm({ onDone }: { onDone: () => void }) {
  const addHabitBuilderItem = useAppStore((s) => s.addHabitBuilderItem);

  const [type, setType] = useState<"new" | "returning">("new");
  const [name, setName] = useState("");
  const [fullVersion, setFullVersion] = useState("");
  const [goodEnoughVersion, setGoodEnoughVersion] = useState("");
  const [anchor, setAnchor] = useState("");
  const [customAnchor, setCustomAnchor] = useState("");
  const [frequency, setFrequency] = useState<HabitBuilderItem["frequency"]>("daily");
  const [step, setStep] = useState(1); // 1 = type, 2 = details, 3 = versions, 4 = anchor

  const canProceed1 = true;
  const canProceed2 = name.trim().length > 0;
  const canProceed3 = fullVersion.trim().length > 0 && goodEnoughVersion.trim().length > 0;
  const effectiveAnchor = anchor === "__custom__" ? customAnchor : anchor;

  function submit() {
    if (!name.trim() || !fullVersion.trim() || !goodEnoughVersion.trim()) return;
    addHabitBuilderItem({
      type,
      name: name.trim(),
      fullVersion: fullVersion.trim(),
      goodEnoughVersion: goodEnoughVersion.trim(),
      anchor: effectiveAnchor.trim(),
      frequency,
    });
    onDone();
  }

  return (
    <div className="space-y-5">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 py-1">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "rounded-full transition-all",
              s === step ? "w-6 h-2 bg-sage-600" : s < step ? "w-2 h-2 bg-sage-400" : "w-2 h-2 bg-sage-100"
            )}
          />
        ))}
      </div>

      {/* Step 1 -New or returning */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">What kind of habit is this?</p>
            <p className="text-xs text-slate-400">No judgment either way -returning to something counts too.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType("new")}
              className={cn(
                "rounded-2xl p-4 border-2 text-left transition-all",
                type === "new" ? "border-sage-500 bg-sage-50" : "border-slate-100 bg-white"
              )}
            >
              <Sprout size={20} className={cn("mb-2", type === "new" ? "text-sage-600" : "text-slate-400")} />
              <p className={cn("text-sm font-bold", type === "new" ? "text-sage-700" : "text-slate-600")}>Starting fresh</p>
              <p className="text-xs text-slate-400 mt-0.5">A new habit I want to build</p>
            </button>
            <button
              onClick={() => setType("returning")}
              className={cn(
                "rounded-2xl p-4 border-2 text-left transition-all",
                type === "returning" ? "border-sage-500 bg-sage-50" : "border-slate-100 bg-white"
              )}
            >
              <RefreshCw size={20} className={cn("mb-2", type === "returning" ? "text-sage-600" : "text-slate-400")} />
              <p className={cn("text-sm font-bold", type === "returning" ? "text-sage-700" : "text-slate-600")}>Getting back to it</p>
              <p className="text-xs text-slate-400 mt-0.5">Something I've done before</p>
            </button>
          </div>
          {type === "returning" && (
            <div className="bg-sage-50 rounded-xl px-4 py-3 border border-sage-100">
              <p className="text-xs text-sage-700 font-medium">
                Welcome back. The fact that you did it before means your brain already knows how. No shame for the gap.
              </p>
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            className="w-full bg-sage-600 text-white font-bold rounded-xl py-3 text-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2 -Name & frequency */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">Name your habit</p>
            <p className="text-xs text-slate-400">Keep it simple -you know what it means.</p>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "returning" ? "e.g. Morning walk" : "e.g. Daily journal"}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sage-400"
          />
          <div>
            <p className="text-sm font-bold text-slate-700 mb-2">How often?</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(FREQUENCY_LABELS) as [HabitBuilderItem["frequency"], string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFrequency(key)}
                  className={cn(
                    "rounded-xl py-2 px-3 text-xs font-semibold border transition-all",
                    frequency === key
                      ? "bg-sage-600 text-white border-sage-600"
                      : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 font-semibold rounded-xl py-3 text-sm">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceed2}
              className="flex-[2] bg-sage-600 text-white font-bold rounded-xl py-3 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 -Full & good-enough versions */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">Two versions of success</p>
            <p className="text-xs text-slate-400">
              Both count. The good-enough version is there for hard days. Using it is still a win.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center">
                <Check size={11} className="text-white" strokeWidth={3} />
              </span>
              <p className="text-xs font-bold text-slate-700">Full version</p>
              <p className="text-xs text-slate-400">your ideal</p>
            </div>
            <input
              type="text"
              value={fullVersion}
              onChange={(e) => setFullVersion(e.target.value)}
              placeholder={`e.g. 30-minute ${name || "activity"}`}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sage-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <Star size={10} className="text-white" fill="white" strokeWidth={0} />
              </span>
              <p className="text-xs font-bold text-slate-700">Good-enough version</p>
              <p className="text-xs text-slate-400">for hard days</p>
            </div>
            <input
              type="text"
              value={goodEnoughVersion}
              onChange={(e) => setGoodEnoughVersion(e.target.value)}
              placeholder={`e.g. 5-minute ${name || "version"}`}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sage-400"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-600 font-semibold rounded-xl py-3 text-sm">Back</button>
            <button
              onClick={() => setStep(4)}
              disabled={!canProceed3}
              className="flex-[2] bg-sage-600 text-white font-bold rounded-xl py-3 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4 -Anchor */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">Link it to your day <span className="text-slate-400 font-normal">(optional)</span></p>
            <p className="text-xs text-slate-400">
              Attaching a habit to something you already do makes it much easier to remember.
            </p>
          </div>

          <div className="space-y-2">
            {ANCHOR_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAnchor(anchor === preset ? "" : preset)}
                className={cn(
                  "w-full text-left rounded-xl px-4 py-2.5 text-sm border transition-all",
                  anchor === preset
                    ? "bg-sage-50 border-sage-400 text-sage-700 font-semibold"
                    : "bg-white border-slate-100 text-slate-600"
                )}
              >
                {preset}
              </button>
            ))}
            <button
              onClick={() => setAnchor(anchor === "__custom__" ? "" : "__custom__")}
              className={cn(
                "w-full text-left rounded-xl px-4 py-2.5 text-sm border transition-all",
                anchor === "__custom__"
                  ? "bg-sage-50 border-sage-400 text-sage-700 font-semibold"
                  : "bg-white border-slate-100 text-slate-500"
              )}
            >
              Something else…
            </button>
            {anchor === "__custom__" && (
              <input
                type="text"
                value={customAnchor}
                onChange={(e) => setCustomAnchor(e.target.value)}
                placeholder="e.g. After dropping the kids off"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sage-400"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(3)} className="flex-1 bg-slate-100 text-slate-600 font-semibold rounded-xl py-3 text-sm">Back</button>
            <button
              onClick={submit}
              className="flex-[2] bg-sage-600 text-white font-bold rounded-xl py-3 text-sm"
            >
              Add habit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Individual habit card ──────────────────────────────────────
function HabitCard({ habit }: { habit: HabitBuilderItem }) {
  const { logHabitBuilderCompletion, clearHabitBuilderCompletion, deleteHabitBuilderItem } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  const today = getTodayKey();
  const todayStatus = habit.completions[today] ?? null;
  const streak = getStreakCount(habit.completions);

  // Last 7 days for the mini strip
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = localDateKey(d);
    return { key, status: habit.completions[key] ?? null, isToday: key === today };
  });

  function handleLog(level: "full" | "good-enough") {
    if (todayStatus === level) {
      clearHabitBuilderCompletion(habit.id, today);
    } else {
      logHabitBuilderCompletion(habit.id, today, level);
    }
  }

  return (
    <div className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="px-4 py-3.5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center shrink-0 mt-0.5">
          {habit.type === "returning" ? (
            <RefreshCw size={16} className="text-sage-600" />
          ) : (
            <Sprout size={16} className="text-sage-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">{habit.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-slate-400">{FREQUENCY_LABELS[habit.frequency]}</span>
            {habit.anchor && (
              <>
                <span className="text-slate-200">·</span>
                <span className="text-xs text-slate-400">{habit.anchor}</span>
              </>
            )}
            {streak > 0 && (
              <>
                <span className="text-slate-200">·</span>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                  <Flame size={11} fill="currentColor" />
                  {streak}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-300 hover:text-slate-500 transition-colors mt-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* 7-day strip */}
      <div className="px-4 pb-3 flex gap-1.5">
        {last7.map(({ key, status, isToday }) => (
          <div
            key={key}
            className={cn(
              "flex-1 h-2 rounded-full transition-colors",
              status === "full" ? "bg-sage-500" : status === "good-enough" ? "bg-amber-400" : isToday ? "bg-sage-100 border border-sage-300" : "bg-slate-100"
            )}
          />
        ))}
      </div>

      {/* Today's log buttons */}
      <div className="px-4 pb-3.5 flex gap-2">
        <button
          onClick={() => handleLog("full")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all",
            todayStatus === "full"
              ? "bg-sage-500 text-white border-sage-500"
              : "bg-white text-sage-700 border-sage-200 hover:border-sage-400"
          )}
        >
          <Check size={13} strokeWidth={2.5} />
          Done
        </button>
        <button
          onClick={() => handleLog("good-enough")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold border transition-all",
            todayStatus === "good-enough"
              ? "bg-amber-400 text-white border-amber-400"
              : "bg-white text-amber-600 border-amber-200 hover:border-amber-400"
          )}
        >
          <Star size={12} fill={todayStatus === "good-enough" ? "white" : "none"} strokeWidth={2} />
          Good enough
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sage-50 rounded-xl p-3 border border-sage-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Check size={11} className="text-sage-600" strokeWidth={2.5} />
                <p className="text-xs font-bold text-sage-700">Full version</p>
              </div>
              <p className="text-xs text-slate-600">{habit.fullVersion}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={11} className="text-amber-500" fill="currentColor" strokeWidth={0} />
                <p className="text-xs font-bold text-amber-700">Good enough</p>
              </div>
              <p className="text-xs text-slate-600">{habit.goodEnoughVersion}</p>
            </div>
          </div>
          <button
            onClick={() => deleteHabitBuilderItem(habit.id)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
            Remove habit
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function HabitsPage() {
  const router = useRouter();
  const habitBuilderItems = useAppStore((s) => s.habitBuilderItems);
  const { toggleFavorite, isFavorite } = useAppStore();
  const activeHabits = habitBuilderItems.filter((h) => h.active);
  const [showForm, setShowForm] = useState(false);
  const fav = isFavorite("habit-builder");

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
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800">Habit Builder</h1>
        </div>
        <button
          onClick={() => toggleFavorite("habit-builder")}
          className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center"
        >
          <Heart size={17} className={fav ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="w-9 h-9 rounded-xl bg-sage-600 flex items-center justify-center shadow-sm"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Empty state */}
        {activeHabits.length === 0 && !showForm && (
          <div className="text-center py-12 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto">
              <Sprout size={26} className="text-sage-500" />
            </div>
            <p className="text-base font-bold text-slate-700">No habits yet</p>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Add one to get started. Every habit has a full version and a good-enough version for hard days.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-sage-600 text-white font-bold rounded-xl px-5 py-2.5 text-sm mt-2"
            >
              <Plus size={15} />
              Add your first habit
            </button>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-800">New habit</p>
              <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 underline">Cancel</button>
            </div>
            <HabitCreateForm onDone={() => setShowForm(false)} />
          </div>
        )}

        {/* Habit cards */}
        {activeHabits.map((h) => (
          <HabitCard key={h.id} habit={h} />
        ))}

        {/* Legend */}
        {activeHabits.length > 0 && (
          <div className="flex items-center gap-4 px-1 pt-1 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-sage-500" />
              <p className="text-xs text-slate-400">Full</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-amber-400" />
              <p className="text-xs text-slate-400">Good enough</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-slate-100" />
              <p className="text-xs text-slate-400">Not yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
