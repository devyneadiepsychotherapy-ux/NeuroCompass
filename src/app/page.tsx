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
  HeartHandshake, ExternalLink, BatteryLow, BatteryFull,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
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
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 shadow-lg">
      <Snowflake size={18} className="text-blue-400 shrink-0" />
      <p className="text-sm font-semibold text-blue-700 flex-1">Streak saved by a freeze!</p>
      <button onClick={onDismiss} className="text-blue-400 hover:text-blue-600 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Streak card
// ---------------------------------------------------------------------------

function StreakCard({ streak, longestStreak, streakFreezes }: { streak: number; longestStreak: number; streakFreezes: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 shadow-sm p-5" style={{ background: "linear-gradient(135deg, #f5efec 0%, #e8d8d2 100%)" }}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0 shadow-inner">
          <Flame size={34} className="text-[#B8897A] fill-[#d4b8b0]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-black text-[#8f6559] leading-none">{streak}</p>
          <p className="text-base font-bold text-slate-700 mt-0.5">Day Streak!</p>
          <p className="text-xs text-slate-400 mt-1">Best: {longestStreak} days</p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 shrink-0">
          <Snowflake size={13} className="text-blue-400" />
          <span className="text-xs font-semibold text-blue-600">
            {streakFreezes} freeze{streakFreezes !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
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
        style={{ background: "linear-gradient(135deg, #EAE8E5 0%, #DEDAD5 100%)" }}
      >
        <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
          <Wind size={20} className="text-stone-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">Feeling Frozen?</p>
          <p className="text-xs text-slate-500 mt-0.5">Tap to get unstuck</p>
        </div>
        <ChevronRight size={16} className="text-slate-300 shrink-0" />
      </button>
    );
  }

  return (
    <div className="border border-stone-200 rounded-2xl p-5 space-y-4" style={{ background: "linear-gradient(160deg, #EAE8E5 0%, #DEDAD5 100%)" }}>
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
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">What feels easiest right now?</p>
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
    energyDrains, energyRestorers,
  } = useAppStore();
  const router = useRouter();

  // Mount guard - prevents SSR mismatch AND waits for Zustand persist to
  // finish rehydrating from localStorage. In Zustand v5, persist rehydration
  // is async (Promise.resolve) even with synchronous localStorage, so we
  // must not check `hasOnboarded` until onFinishHydration fires.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setMounted(true);
    } else {
      return useAppStore.persist.onFinishHydration(() => setMounted(true));
    }
  }, []);

  // Redirect un-onboarded users; gated on mounted so Zustand has rehydrated
  useEffect(() => {
    if (mounted && !hasOnboarded) {
      router.replace("/onboarding");
    }
  }, [mounted, hasOnboarded, router]);

  useEffect(() => {
    checkAndUpdateStreak();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [openTool, setOpenTool] = useState<Tool | null>(null);

  const handleOpenToolById = (id: string) => {
    const tool = TOOLS.find((t) => t.id === id);
    if (tool) setOpenTool(tool);
  };

  const today = getTodayKey();
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
    <div className="px-4 pt-4 pb-10 space-y-3">
      {/* Overlays */}
      {mounted && showFreezeSaved && <FreezeSavedBanner onDismiss={() => setShowFreezeSaved(false)} />}
      {mounted && showStreakCelebration && (
        <StreakCelebrationModal streak={streak} onDismiss={() => setShowStreakCelebration(false)} />
      )}

      {/* Greeting + XP (full width) */}
      <div className="bg-cream-50 rounded-2xl p-4 border border-sage-100 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5">
              Hi {mounted && userName ? userName : "there"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{greeting}</p>
          </div>
          {mounted && userAvatar && (() => {
            const av = getAvatarOption(userAvatar);
            if (!av) return null;
            const { Icon, bg, iconColor } = av;
            return (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={20} className={iconColor} />
              </div>
            );
          })()}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-sage-600 flex items-center justify-center">
                <Star size={11} className="text-white fill-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Level {displayLevel}</span>
            </div>
            <span className="text-xs font-bold text-sage-600">{displayXp} XP</span>
          </div>
          <div className="w-full bg-sage-100 rounded-full h-1.5">
            <div
              className="bg-sage-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{xpToNext} XP to Level {displayLevel + 1}</p>
        </div>
      </div>

      {/* Streak (right below greeting) */}
      <StreakCard
        streak={mounted ? streak : 0}
        longestStreak={mounted ? longestStreak : 0}
        streakFreezes={mounted ? streakFreezes : 0}
      />

      {/* Quote (wide) + Today snapshot (narrow) */}
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3 bg-gradient-to-br from-rose-50 to-stone-100 rounded-2xl p-4 border border-rose-100 flex flex-col justify-between min-h-[120px]">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Today's reminder</p>
          <blockquote className="mt-2">
            <p className="text-sm text-slate-700 italic leading-relaxed font-medium">"{todayQuote}"</p>
            <footer className="mt-2">
              <span className="text-xs text-slate-400 not-italic">NeuroCompass</span>
            </footer>
          </blockquote>
        </div>
        <div className="col-span-2 flex flex-col gap-3">
          <div className="flex-1 bg-cream-50 rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[56px]">
            <div className="flex items-center gap-1 mb-1">
              <Zap size={12} className="text-[#9B8EC4]" />
              <p className="text-xs text-slate-500 font-medium">Done</p>
            </div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{completedToday}</p>
            <p className="text-xs text-slate-400 mt-0.5">task{completedToday !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Feeling Frozen */}
      <FeelingFrozenCard openTool={handleOpenToolById} />

      {/* Feature highlights: Strengths + Learn */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/strengths"
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col gap-2 hover:border-emerald-300 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Sparkles size={17} className="text-emerald-700" />
            </div>
            <ChevronRight size={14} className="text-slate-300 mt-0.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">My Strengths</p>
            {(profile.ndIdentities.length > 0 || profile.strengths.length > 0) ? (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[...profile.ndIdentities, ...profile.strengths].slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 leading-none">
                    {s}
                  </span>
                ))}
                {([...profile.ndIdentities, ...profile.strengths].length > 3) && (
                  <span className="text-[10px] text-slate-400">
                    +{[...profile.ndIdentities, ...profile.strengths].length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 mt-0.5 font-medium">Add your ND strengths →</p>
            )}
          </div>
        </Link>
        <Link
          href="/psychoed"
          className="bg-gradient-to-br from-sage-50 to-stone-50 border border-sage-200 rounded-2xl p-4 flex flex-col justify-between hover:border-sage-300 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center">
              <Brain size={17} className="text-sage-700" />
            </div>
            <ChevronRight size={14} className="text-slate-300 mt-0.5" />
          </div>
          <div className="mt-3">
            <p className="font-semibold text-slate-800 text-sm">Learn</p>
            <p className="text-xs text-slate-500 mt-0.5">How your brain works</p>
          </div>
        </Link>
      </div>

      {/* My Toolbox (favourites) */}
      <div className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Toolbox</p>
          <Link href="/tools" className="text-xs text-sage-600 font-medium">Browse all</Link>
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
                <div className="flex flex-col items-center gap-1.5 group">
                  <div className="w-14 h-14 rounded-2xl bg-sage-50 border border-sage-100 flex items-center justify-center group-hover:border-sage-300 group-hover:shadow-sm transition-all active:scale-[0.95]">
                    {(() => { const IC = ICON_MAP[tool.icon]; return IC ? <IC size={22} className="text-sage-500" /> : null; })()}
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

      {/* Energy Accounting (compact summary) */}
      <div className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3" style={{ borderColor: '#D8D0C8' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#E4DDD0' }}>
              <Zap size={16} style={{ color: '#9B8A4A' }} />
            </div>
            <p className="text-sm font-semibold text-slate-800">Energy Accounting</p>
          </div>
          <Link href="/me" className="text-xs font-medium" style={{ color: '#9B8A4A' }}>
            {energyDrains.length > 0 || energyRestorers.length > 0 ? 'Edit' : 'Set up'}
          </Link>
        </div>
        {energyDrains.length === 0 && energyRestorers.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Track what drains and restores your energy</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <BatteryLow size={11} className="text-red-400" />
                <p className="text-xs font-semibold text-red-500">Drains</p>
              </div>
              {energyDrains.slice(0, 3).map((d) => (
                <span key={d.id} className="block text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full truncate">
                  {d.label}
                </span>
              ))}
              {energyDrains.length > 3 && (
                <span className="text-xs text-slate-400">+{energyDrains.length - 3} more</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <BatteryFull size={11} className="text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-600">Restorers</p>
              </div>
              {energyRestorers.slice(0, 3).map((r) => (
                <span key={r.id} className="block text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full truncate">
                  {r.label}
                </span>
              ))}
              {energyRestorers.length > 3 && (
                <span className="text-xs text-slate-400">+{energyRestorers.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional Support (compact) */}
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

      {openTool && <ToolModal tool={openTool} onClose={() => setOpenTool(null)} />}
    </div>
  );
}
