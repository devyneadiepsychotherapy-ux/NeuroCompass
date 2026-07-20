"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { getTodayKey, xpForLevel } from "@/lib/utils";
import { TOOLS, Tool } from "@/lib/tools-data";
import { ToolModal } from "@/components/ToolModal";
import { getAvatarOption } from "@/app/onboarding/page";
import Link from "next/link";
import {
  Heart, Star, Zap, Flame, Sparkles, Brain, ChevronRight,
  Wind, Shuffle, X, PersonStanding, Snowflake,
  HeartHandshake, ExternalLink, SlidersHorizontal, Check, Pill, Sun, Moon,
} from "lucide-react";
import { ICON_MAP } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const greetings = [
  "Hey, you showed up today. That counts.",
  "Welcome back. You're doing better than you think.",
  "One step at a time. You've got this.",
  "Your brain is different, not broken.",
  "Progress, not perfection. You belong here.",
  "Rest is productive. You are enough.",
  "Neurodivergent brains are creative, empathetic, and powerful.",
];

const ndQuotes = [
  "Your brain works differently, not less.",
  "Rest is not a reward. It is a requirement.",
  "You are allowed to take up space.",
  "Doing your best looks different every day.",
  "Small steps count. Always.",
  "You don't have to earn the right to exist.",
  "Struggling is not the same as failing.",
  "Your needs are valid, even the ones that feel inconvenient.",
  "Masking is exhausting. You are allowed to unmask here.",
  "Asking for help is a form of self-knowledge.",
  "Sensitivity is a superpower, not a flaw.",
  "You are not too much. The world is sometimes too little.",
  "Your pace is the right pace.",
  "Hyperfocus is your brain caring deeply. That matters.",
  "Not finishing something doesn't erase the effort you gave it.",
  "You are not lazy. You are running on a different operating system.",
  "Interest-based motivation is real and valid.",
  "Forgetting is not carelessness. It is how your brain works.",
  "You have survived every hard day so far. That is a hundred percent.",
  "The things that make you different also make you irreplaceable.",
  "You don't have to explain your exhaustion to anyone.",
  "Your emotions are information, not overreactions.",
  "Parallel play counts as socializing. Rest counts as recovery.",
  "You are not broken. You are built differently.",
  "Time blindness is neurological, not a character flaw.",
  "Starting is often the hardest part. One minute is enough.",
  "You are worthy of care on your worst days too.",
  "Regulation before productivity. Always.",
  "Your worth is not your output.",
  "It's okay to need more time. More support. More quiet. More anything.",
  "Joy is always allowed, no matter what is unfinished.",
  "You are not behind. You are on your own timeline.",
  "Stimming is self-regulation. It is a good thing.",
  "Every version of you deserves kindness.",
  "You do not need to perform wellness to deserve rest.",
];

const MICRO_TASKS = [
  "Get a glass of water",
  "Open one tab",
  "Write one word",
  "Stand up and stretch",
  "Text one person",
  "Put on a song",
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

// ---------------------------------------------------------------------------
// Streak Celebration Modal
// ---------------------------------------------------------------------------

function StreakCelebrationModal({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-28" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-sm rounded-3xl border border-stone-200 shadow-2xl p-8 flex flex-col items-center gap-5 text-center" style={{ background: "linear-gradient(160deg, #f5efec 0%, #ece7e4 60%, #e0d8d4 100%)" }}>
        <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center">
          <Flame size={44} className="text-[#B8897A] fill-[#d4b8b0]" />
        </div>
        <div>
          <p className="text-5xl font-black text-[#8f6559] leading-none">{streak}</p>
          <p className="text-xl font-bold text-slate-800 mt-1.5">Day Streak!</p>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed max-w-[220px]">
          You showed up today. That counts.
        </p>
        <button
          onClick={onDismiss}
          className="w-full bg-[#B8897A] text-white font-bold rounded-2xl py-3.5 text-base hover:bg-[#a87a6b] transition-all active:scale-[0.97] shadow-sm"
        >
          Keep it going!
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Freeze Saved Banner
// ---------------------------------------------------------------------------

function FreezeSavedBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 shadow-lg">
      <Snowflake size={18} className="text-slate-400 shrink-0" />
      <p className="text-sm font-semibold text-slate-700 flex-1">Streak saved by a freeze!</p>
      <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streak card
// ---------------------------------------------------------------------------

function StreakCard({ streak, longestStreak, streakFreezes, quote }: {
  streak: number; longestStreak: number; streakFreezes: number; quote?: string;
}) {
  return (
    <div className="rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, var(--color-cream-50) 0%, var(--color-cream-100) 100%)" }}>
      {/* Background flame decoration */}
      <div className="absolute right-4 top-6 opacity-10">
        <Flame size={80} className="text-[#B8897A] fill-[#B8897A]" />
      </div>
      <div className="flex items-center gap-4 relative px-5 pt-5 pb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-black text-slate-700 leading-none">{streak}</p>
            <Flame size={22} className="text-[#B8897A] fill-[#d4b8b0] mb-1" />
          </div>
          <p className="text-sm font-bold text-slate-700 mt-0.5 opacity-80">day streak</p>
          <p className="text-xs text-slate-500 mt-1">Best: {longestStreak} days</p>
        </div>
        <span className="text-xs font-semibold text-slate-400 shrink-0">
          {streakFreezes} freeze{streakFreezes !== 1 ? "s" : ""}
        </span>
      </div>
      {quote && (
        <div className="border-t border-cream-200 px-5 py-3">
          <p className="text-[10px] font-semibold text-sage-600 uppercase tracking-wide mb-1">Today&apos;s thought</p>
          <p className="text-xs text-slate-500 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feeling Frozen card
// ---------------------------------------------------------------------------

type FrozenOption = null | "breathe" | "stand" | "tell-me";

function FeelingFrozenCard({ openTool }: { openTool: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [activeOption, setActiveOption] = useState<FrozenOption>(null);

  // Breathe state
  const [breatheCount, setBreatheCount] = useState(0);
  const [breathePhase, setBreathePhase] = useState<"idle" | "counting" | "hold" | "done">("idle");
  const breatheRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stand state
  const [standStep, setStandStep] = useState(0);
  const [smallestStep, setSmallestStep] = useState("");

  // Tell me state
  const [microTask, setMicroTask] = useState<string | null>(null);
  const [oneThing, setOneThing] = useState("");
  const [oneThingPhase, setOneThingPhase] = useState<"input" | "breakdown" | "done">("input");
  const [smallestFirstStep, setSmallestFirstStep] = useState("");

  // Auto-count breaths
  useEffect(() => {
    if (breathePhase !== "counting") return;
    if (breatheCount >= 30) { setBreathePhase("hold"); return; }
    breatheRef.current = setTimeout(() => setBreatheCount((c) => c + 1), 600);
    return () => { if (breatheRef.current) clearTimeout(breatheRef.current); };
  }, [breathePhase, breatheCount]);

  const reset = () => {
    setExpanded(false);
    setActiveOption(null);
    setBreatheCount(0);
    setBreathePhase("idle");
    setStandStep(0);
    setSmallestStep("");
    setMicroTask(null);
    setOneThing("");
    setOneThingPhase("input");
    setSmallestFirstStep("");
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-4 border border-stone-200 rounded-2xl p-4 hover:border-stone-300 hover:shadow-md transition-all active:scale-[0.98] text-left"
        style={{ background: "linear-gradient(135deg, var(--color-stone-100) 0%, var(--color-stone-200) 100%)" }}
      >
        <Wind size={20} className="text-stone-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">Feeling Frozen?</p>
          <p className="text-xs text-slate-500 mt-0.5">Tap to get unstuck</p>
        </div>
        <ChevronRight size={16} className="text-slate-300 shrink-0" />
      </button>
    );
  }

  return (
    <div className="border border-stone-200 rounded-2xl p-5 space-y-4" style={{ background: "linear-gradient(160deg, var(--color-stone-100) 0%, var(--color-stone-200) 100%)" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-slate-800 text-base">
          {activeOption === null ? "Let's get you unstuck"
            : activeOption === "breathe" ? "Wake your body up"
            : activeOption === "stand" ? "Can I stand up?"
            : "Tell me what to do"}
        </h3>
        <button onClick={reset} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-stone-200 transition-all shrink-0">
          <X size={16} />
        </button>
      </div>

      {activeOption === null && (
        <>
          <p className="text-sm text-slate-600 leading-relaxed -mt-2">
            Paralysis is real and it's not your fault. Your brain is overwhelmed. Let's take one tiny step.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">What feels easiest right now?</p>
            {[
              { icon: Wind, label: "Wake your body up", action: () => setActiveOption("breathe") },
              { icon: PersonStanding, label: "Move my body for 2 minutes", action: () => openTool("activation-ramp") },
              { icon: PersonStanding, label: "Can I stand up?", action: () => setActiveOption("stand") },
              { icon: Shuffle, label: "Tell me what to do", action: () => setActiveOption("tell-me") },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action}
                className="w-full flex items-center gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 hover:bg-stone-200 transition-all active:scale-[0.98] text-left"
              >
                <Icon size={17} className="text-stone-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </button>
            ))}
          </div>
          <button onClick={reset} className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1 transition-colors">
            I just needed to see this
          </button>
        </>
      )}

      {/* Breathe flow */}
      {activeOption === "breathe" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Try 30 fast breaths. Breathe in and out rapidly through your nose, then take one big inhale and hold for 15 seconds. Release slowly. Repeat 2 to 3 rounds. This raises your heart rate and oxygen to help break the freeze.
          </p>
          {breathePhase === "idle" && (
            <button onClick={() => setBreathePhase("counting")}
              className="w-full bg-sage-600 text-white font-bold rounded-xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.97]"
            >
              Start 30 breaths
            </button>
          )}
          {breathePhase === "counting" && (
            <div className="text-center space-y-2">
              <p className="text-5xl font-black text-sage-600 leading-none">{breatheCount}</p>
              <p className="text-xs text-slate-500">breaths of 30</p>
              <div className="w-full bg-sage-100 rounded-full h-2">
                <div className="bg-sage-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(breatheCount / 30) * 100}%` }} />
              </div>
            </div>
          )}
          {breathePhase === "hold" && (
            <div className="space-y-3 text-center">
              <p className="text-base font-bold text-slate-800">30 breaths done!</p>
              <p className="text-sm text-slate-600 leading-relaxed">Now take one big inhale and hold for 15 seconds. Then release slowly.</p>
              <button onClick={() => setBreathePhase("done")}
                className="w-full bg-sage-600 text-white font-bold rounded-xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.97]"
              >
                Released
              </button>
            </div>
          )}
          {breathePhase === "done" && (
            <div className="space-y-3 text-center">
              <p className="text-base font-bold text-sage-700">Nice work.</p>
              <p className="text-sm text-slate-600 leading-relaxed">Repeat 2 to 3 rounds if you can. Your body is waking up.</p>
              <button onClick={() => { setBreathePhase("idle"); setBreatheCount(0); }}
                className="w-full bg-sage-100 text-sage-700 font-semibold rounded-xl py-2.5 text-sm hover:bg-sage-200 transition-all border border-sage-200"
              >
                Another round
              </button>
            </div>
          )}
          <button onClick={() => { setActiveOption(null); setBreathePhase("idle"); setBreatheCount(0); }}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1 transition-colors"
          >
            Back to options
          </button>
        </div>
      )}

      {/* Stand flow */}
      {activeOption === "stand" && (
        <div className="space-y-4">
          {standStep === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">Just stand up. That's it. One foot, then the other. You're already moving.</p>
              <button onClick={() => setStandStep(1)} className="w-full bg-sage-600 text-white font-bold rounded-xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.97]">
                I'm standing
              </button>
            </div>
          )}
          {standStep === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">Now take 3 steps. Anywhere. Just 3.</p>
              <button onClick={() => setStandStep(2)} className="w-full bg-sage-600 text-white font-bold rounded-xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.97]">
                Done
              </button>
            </div>
          )}
          {standStep === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">Nice. What's the smallest thing you can do toward your task?</p>
              <input
                type="text" placeholder="e.g. open my laptop, write one word..."
                value={smallestStep} onChange={(e) => setSmallestStep(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
              />
              <button onClick={reset} disabled={!smallestStep.trim()}
                className="w-full bg-sage-600 text-white font-bold rounded-xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.97] disabled:opacity-40"
              >
                I'll do that now
              </button>
            </div>
          )}
          <button onClick={() => { setActiveOption(null); setStandStep(0); setSmallestStep(""); }}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1 transition-colors"
          >
            Back to options
          </button>
        </div>
      )}

      {/* Tell me flow */}
      {activeOption === "tell-me" && (
        <div className="space-y-4">
          {microTask === null && oneThingPhase === "input" && (
            <>
              <button onClick={() => setMicroTask(MICRO_TASKS[Math.floor(Math.random() * MICRO_TASKS.length)])}
                className="w-full flex items-center gap-3 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 hover:bg-stone-200 transition-all active:scale-[0.98] text-left"
              >
                <Shuffle size={17} className="text-stone-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700">Pick something random for me</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-stone-200" />
                <p className="text-xs text-stone-500 font-semibold">or</p>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">What is the ONE thing you need to do today?</p>
                <input type="text" placeholder="Write it here..." value={oneThing} onChange={(e) => setOneThing(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
                />
                <button onClick={() => oneThing.trim() && setOneThingPhase("breakdown")} disabled={!oneThing.trim()}
                  className="w-full bg-sage-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-sage-700 transition-all active:scale-[0.97] disabled:opacity-40"
                >
                  Break it down
                </button>
              </div>
              <button onClick={() => setActiveOption(null)} className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1 transition-colors">
                Back to options
              </button>
            </>
          )}
          {microTask !== null && (
            <div className="space-y-3">
              <div className="bg-stone-100 border border-stone-300 rounded-xl px-4 py-3 flex items-center gap-2">
                <Zap size={14} className="text-stone-600 shrink-0" />
                <p className="text-sm font-semibold text-stone-800">{microTask}</p>
              </div>
              <button onClick={() => setMicroTask(null)} className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-medium py-1 transition-colors">
                Try a different one
              </button>
              <button onClick={reset} className="w-full bg-sage-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-sage-700 transition-all active:scale-[0.97]">
                I'll do that now
              </button>
            </div>
          )}
          {oneThingPhase === "breakdown" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">Got it: <span className="font-semibold text-slate-800">{oneThing}</span></p>
              <p className="text-sm font-medium text-slate-700">What's the smallest possible first step?</p>
              <input type="text" placeholder="Even opening the file counts..." value={smallestFirstStep} onChange={(e) => setSmallestFirstStep(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
              />
              <button onClick={() => smallestFirstStep.trim() && setOneThingPhase("done")} disabled={!smallestFirstStep.trim()}
                className="w-full bg-sage-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-sage-700 transition-all active:scale-[0.97] disabled:opacity-40"
              >
                That's my first step
              </button>
            </div>
          )}
          {oneThingPhase === "done" && (
            <div className="space-y-3 text-center">
              <p className="text-base font-bold text-sage-700">Start with just that one step.</p>
              <div className="bg-stone-100 border border-stone-200 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{smallestFirstStep}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Nothing else. Just this. You've got it.</p>
              <button onClick={reset} className="w-full bg-sage-600 text-white font-bold rounded-xl py-2.5 text-sm hover:bg-sage-700 transition-all active:scale-[0.97]">
                I'll do that now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Energy quick-log widget (shared across home + me page)
// ---------------------------------------------------------------------------

const ENERGY_LEVELS = [
  { label: "Low",    value: 2 as const, emoji: "🔋", color: "text-rose-500",  activeBg: "bg-rose-50 border-rose-300"   },
  { label: "Medium", value: 3 as const, emoji: "⚡", color: "text-stone-500", activeBg: "bg-stone-100 border-stone-300" },
  { label: "High",   value: 4 as const, emoji: "✨", color: "text-sage-600",  activeBg: "bg-sage-50 border-sage-300"   },
] as const;

function EnergyWidget({ todayEnergy, onLog }: { todayEnergy?: number; onLog: (v: 2 | 3 | 4) => void }) {
  return (
    <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 space-y-2">
      <div>
        <p className="text-sm font-semibold text-slate-700">Energy Level</p>
        <p className="text-xs text-slate-400 mt-0.5">How is your physical and mental energy right now?</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ENERGY_LEVELS.map(({ label, value, emoji, activeBg }) => {
          const active = todayEnergy === value;
          return (
            <button
              key={value}
              onClick={() => onLog(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all active:scale-[0.96]",
                active ? activeBg : "bg-cream-50 border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              <span className="text-xl">{emoji}</span>
              {label}
              {active && <Check size={10} className="text-current" />}
            </button>
          );
        })}
      </div>
      {todayEnergy && (
        <p className="text-xs text-slate-400 text-center">Logged for today</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home page customize panel
// ---------------------------------------------------------------------------

const HOME_SECTIONS: { key: keyof import("@/types").HomeVisibility; label: string; desc: string }[] = [
  { key: "streak",          label: "Streak",             desc: "Your daily app-open streak" },
  { key: "energyWidget",    label: "Energy check-in",    desc: "Quick Low/Medium/High energy log" },
  { key: "medicationWidget",label: "Medication checkoff",desc: "Today's medication checkboxes" },
  { key: "quote",           label: "Daily quote",        desc: "A neurodivergent-affirming thought" },
  { key: "frozen",          label: "Feeling Frozen",     desc: "Quick tools to get unstuck" },
  { key: "toolbox",         label: "My Toolbox",         desc: "Your favourited tools" },
  { key: "learn",           label: "Learn",              desc: "Psychoeducation & how your brain works" },
  { key: "support",         label: "Professional Support", desc: "Links to ND therapists and coaches" },
];

function CustomizePanel({ visibility, onToggle, onClose }: {
  visibility: import("@/types").HomeVisibility;
  onToggle: (k: keyof import("@/types").HomeVisibility) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-auto bg-white rounded-t-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100dvh-80px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <p className="text-base font-bold text-slate-800">Customise Home</p>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {/* Scrollable content — pb-24 clears the bottom nav */}
        <div className="overflow-y-auto px-5 pt-3 pb-24 space-y-1">
          {HOME_SECTIONS.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className="w-full flex items-center gap-3 py-3 text-left"
            >
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all",
                visibility[key] ? "bg-sage-500 border-sage-500" : "border-slate-300"
              )}>
                {visibility[key] && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const {
    profile, tasks, favorites,
    streak, longestStreak, checkAndUpdateStreak,
    hasOnboarded, userName, userAvatar,
    showStreakCelebration, setShowStreakCelebration,
    showFreezeSaved, setShowFreezeSaved,
    streakFreezes,
    _hasHydrated,
    addXP, dailyEnergyLogs, logDailyEnergy,
    homeVisibility, toggleHomeSection,
    medicationReminders, medicationTakenDates, toggleMedicationTaken, medicationShowOnHome,
  } = useAppStore();
  const router = useRouter();

  // _hasHydrated is set to true by onRehydrateStorage in the store once
  // Zustand persist has finished reading from localStorage. Using store state
  // is more reliable than useAppStore.persist.hasHydrated() in Zustand v5.
  const mounted = _hasHydrated;

  // Redirect un-onboarded users; gated on mounted so Zustand has rehydrated
  useEffect(() => {
    if (mounted && !hasOnboarded) {
      router.replace("/onboarding");
    }
  }, [mounted, hasOnboarded, router]);

  useEffect(() => {
    if (mounted) checkAndUpdateStreak();
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const [openTool, setOpenTool] = useState<Tool | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  const handleOpenToolById = (id: string) => {
    const tool = TOOLS.find((t) => t.id === id);
    if (tool) setOpenTool(tool);
  };

  const today = getTodayKey();
  const todayEnergy = dailyEnergyLogs[today];

  const handleEnergyLog = (value: 2 | 3 | 4) => {
    logDailyEnergy(today, value);
    addXP(2);
  };

  const todayMedTaken = medicationTakenDates[today] ?? [];
  const todayTasks = tasks.filter(
    (t) => t.status !== "done" && (!t.dueDate || t.dueDate === today)
  );
  const completedToday = mounted ? tasks.filter((t) => t.completedAt?.startsWith(today)).length : 0;
  const greeting = greetings[new Date().getDay() % greetings.length];
  const displayLevel = mounted ? profile.level : 1;
  const displayXp = mounted ? profile.totalXp : 0;
  const xpInLevel = displayXp % xpForLevel(displayLevel);
  const xpProgress = (xpInLevel / xpForLevel(displayLevel)) * 100;
  const xpToNext = xpForLevel(displayLevel) - xpInLevel;
  const todayQuote = ndQuotes[getDayOfYear() % ndQuotes.length];
  const favTools = mounted ? TOOLS.filter((t) => favorites.some((f) => f.toolId === t.id)) : [];

  // Before Zustand has hydrated: show a blank page matching the app background
  // so there's no flash. This resolves in one microtask once the store rehydrates.
  if (!mounted) return <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }} />;
  // After mount, if not onboarded the redirect effect above is in-flight - show nothing.
  if (!hasOnboarded) return null;

  return (
    <div className="px-4 pt-0 pb-10 space-y-3">
      {/* Overlays */}
      {mounted && showFreezeSaved && <FreezeSavedBanner onDismiss={() => setShowFreezeSaved(false)} />}
      {mounted && showStreakCelebration && (
        <StreakCelebrationModal streak={streak} onDismiss={() => setShowStreakCelebration(false)} />
      )}
      {mounted && showCustomize && (
        <CustomizePanel
          visibility={homeVisibility}
          onToggle={toggleHomeSection}
          onClose={() => setShowCustomize(false)}
        />
      )}

      {/* Greeting header : flush with nav, breathing room inside */}
      <div className="-mx-4 px-4 pt-3 pb-5 relative overflow-hidden" style={{ background: "linear-gradient(to bottom, var(--background) 0%, transparent 100%)" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              {new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-3xl font-bold text-slate-800 mt-1 leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
              {mounted && userName ? `Hey, ${userName}` : "Hey there"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{greeting}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {mounted && userAvatar && (() => {
              const av = getAvatarOption(userAvatar);
              if (!av) return null;
              const { Icon, iconColor } = av;
              return <Icon size={32} className={iconColor} />;
            })()}
            <button
              onClick={() => setShowCustomize(true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Customise home page"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
        {/* XP bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Star size={11} className="text-sage-500 fill-sage-500" />
              <span className="text-xs font-semibold text-slate-500">Level {displayLevel}</span>
            </div>
            <span className="text-xs font-bold text-sage-600">{displayXp} XP · {xpToNext} to next</span>
          </div>
          <div className="w-full bg-sage-200/60 rounded-full h-1.5">
            <div
              className="bg-sage-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak + Quote (merged into one card) */}
      {homeVisibility.streak && (
        <StreakCard
          streak={mounted ? streak : 0}
          longestStreak={mounted ? longestStreak : 0}
          streakFreezes={mounted ? streakFreezes : 0}
          quote={homeVisibility.quote ? todayQuote : undefined}
        />
      )}
      {!homeVisibility.streak && homeVisibility.quote && (
        <div className="rounded-2xl px-4 py-3.5 border-l-4 border-sage-300" style={{ background: "linear-gradient(135deg, var(--color-sage-50) 0%, var(--color-sage-100) 100%)" }}>
          <p className="text-xs font-semibold text-sage-600 mb-1">Today&apos;s thought</p>
          <p className="text-sm text-slate-600 italic leading-relaxed">&ldquo;{todayQuote}&rdquo;</p>
        </div>
      )}

      {/* Medication checkoff */}
      {homeVisibility.medicationWidget && medicationShowOnHome && medicationReminders.length === 0 && (
        <Link
          href="/tools/medication-reminder"
          className="flex items-center gap-3 bg-white/70 border border-dashed border-slate-200 rounded-2xl p-4 hover:border-sage-300 transition-colors"
        >
          <Pill size={16} className="text-slate-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-500">Set up medication reminders</p>
            <p className="text-xs text-slate-400">Track daily meds and earn XP for taking them</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
        </Link>
      )}
      {homeVisibility.medicationWidget && medicationShowOnHome && medicationReminders.length > 0 && (
        <div className="bg-white/70 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill size={14} className="text-sage-500 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">Medications today</p>
            </div>
            <Link href="/tools/medication-reminder" className="text-xs text-sage-600 font-medium">Manage</Link>
          </div>
          <div className="space-y-1.5">
            {medicationReminders.map((med) => {
              const isBoth = med.schedule === "both";
              if (isBoth) {
                return (
                  <div key={med.id} className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 px-1">{med.name}</p>
                    <div className="flex gap-2">
                      {(["morning", "evening"] as const).map((slot) => {
                        const key = `${med.id}-${slot}`;
                        const taken = todayMedTaken.includes(key);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleMedicationTaken(med.id, today, slot)}
                            className={cn(
                              "flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border transition-all text-left",
                              taken ? "bg-sage-50 border-sage-200" : "bg-white border-slate-200 hover:border-sage-300"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                              taken ? "bg-sage-500 border-sage-500" : "border-slate-300"
                            )}>
                              {taken && <Check size={8} className="text-white" strokeWidth={3} />}
                            </div>
                            {slot === "morning" ? <Sun size={11} className="text-amber-400" /> : <Moon size={11} className="text-indigo-400" />}
                            <span className={cn("text-xs font-medium flex-1 capitalize", taken ? "line-through text-slate-400" : "text-slate-600")}>
                              {slot}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const taken = todayMedTaken.includes(med.id);
              return (
                <button
                  key={med.id}
                  onClick={() => toggleMedicationTaken(med.id, today)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all border",
                    taken ? "bg-sage-50 border-sage-200" : "bg-white border-slate-200 hover:border-sage-300"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    taken ? "bg-sage-500 border-sage-500" : "border-slate-300"
                  )}>
                    {taken && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn("text-sm flex-1", taken ? "line-through text-slate-400" : "text-slate-700 font-medium")}>
                    {med.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Energy quick-log */}
      {homeVisibility.energyWidget && (
        <EnergyWidget todayEnergy={todayEnergy} onLog={handleEnergyLog} />
      )}

      {/* Feeling Frozen */}
      {homeVisibility.frozen && <FeelingFrozenCard openTool={handleOpenToolById} />}

      {/* My Toolbox (favourites) */}
      {homeVisibility.toolbox && (
        <div className="p-4 rounded-3xl" style={{ background: "linear-gradient(135deg, var(--color-sage-50) 0%, var(--color-sage-100) 100%)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-700">My Toolbox</p>
            <Link href="/tools" className="text-xs text-sage-600 font-semibold">Browse all</Link>
          </div>
          {favTools.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Heart size={18} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">
                Heart your favourite tools to pin them here
              </p>
              <Link href="/tools" className="text-xs text-sage-600 font-medium underline underline-offset-2 mt-1">
                Browse tools
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {favTools.map((tool) => {
                const card = (
                  <div className="flex flex-col items-center gap-1.5 group active:scale-[0.95] transition-all">
                    <div className="w-12 h-12 flex items-center justify-center">
                      {(() => { const IC = ICON_MAP[tool.icon]; return IC ? <IC size={24} className="text-sage-500" /> : null; })()}
                    </div>
                    <p className="text-xs font-medium text-slate-600 text-center leading-tight w-full px-0.5 truncate">{tool.title}</p>
                  </div>
                );
                return tool.linkTo ? (
                  <Link key={tool.id} href={tool.linkTo}>{card}</Link>
                ) : (
                  <button key={tool.id} onClick={() => setOpenTool(tool)} className="w-full">
                    {card}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Learn */}
      {homeVisibility.learn && (
        <Link
          href="/psychoed"
          className="bg-gradient-to-br from-sage-50 to-stone-50 border border-sage-200 rounded-2xl p-4 flex items-center gap-4 hover:border-sage-300 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Brain size={20} className="text-sage-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-slate-800 text-sm">Learn</p>
            <p className="text-xs text-slate-500 mt-0.5">How your brain works</p>
          </div>
          <ChevronRight size={16} className="text-slate-300 shrink-0" />
        </Link>
      )}

      {/* Professional Support */}
      {homeVisibility.support && (
        <div className="bg-sage-50 rounded-2xl p-4 border border-sage-200 space-y-3">
          <div className="flex items-center gap-2">
            <HeartHandshake size={15} className="text-sage-600 shrink-0" />
            <p className="text-sm font-semibold text-slate-800">Need professional support?</p>
          </div>
          <div className="space-y-2">
            {[
              { label: "ND Therapists", desc: "Find ND-affirming therapists (US and Canada)", href: "https://ndtherapists.com/" },
              { label: "ND Practitioners", desc: "Browse practitioners and coaches (Worldwide)", href: "https://neurodivergentpractitioners.org/" },
              { label: "Willow Creek Counselling & Psychotherapy", desc: "ND-affirming counselling in Ontario (virtual sessions available)", href: "https://www.willowcreekcounselling.com/" },
            ].map(({ label, desc, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/70 border border-sage-200 rounded-xl px-3 py-2.5 hover:border-sage-400 hover:shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
                </div>
                <ExternalLink size={12} className="text-sage-500 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {openTool && <ToolModal tool={openTool} onClose={() => setOpenTool(null)} />}
    </div>
  );
}
