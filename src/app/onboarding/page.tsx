"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useTour } from "@/components/layout/TourProvider";
import {
  Compass, Cat, Star, Moon, Leaf, Zap, Sparkles, Mountain,
  Flower2, BookOpen, Music, Gamepad2, Heart, Telescope, Feather, Waves,
  ArrowRight, Check, Wrench, Gift, Flame, Repeat, Coins,
  ShoppingBag, CalendarDays, User, Bell, BellRing, BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Avatar options
// ---------------------------------------------------------------------------

type AvatarOption = {
  id: string;
  label: string;
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
};

const AVATARS: AvatarOption[] = [
  { id: "cat",       label: "Cat",       Icon: Cat,       bg: "bg-stone-100",   iconColor: "text-stone-600"   },
  { id: "star",      label: "Star",      Icon: Star,      bg: "bg-lavender-100",  iconColor: "text-lavender-600"  },
  { id: "moon",      label: "Moon",      Icon: Moon,      bg: "bg-indigo-100",  iconColor: "text-indigo-500"  },
  { id: "leaf",      label: "Leaf",      Icon: Leaf,      bg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { id: "zap",       label: "Lightning", Icon: Zap,       bg: "bg-stone-100",  iconColor: "text-stone-500"  },
  { id: "sparkles",  label: "Sparkles",  Icon: Sparkles,  bg: "bg-pink-100",    iconColor: "text-pink-500"    },
  { id: "mountain",  label: "Mountain",  Icon: Mountain,  bg: "bg-stone-200",   iconColor: "text-stone-600"   },
  { id: "flower",    label: "Flower",    Icon: Flower2,   bg: "bg-rose-100",    iconColor: "text-rose-500"    },
  { id: "compass",   label: "Compass",   Icon: Compass,   bg: "bg-sage-100",    iconColor: "text-sage-700"    },
  { id: "book",      label: "Book",      Icon: BookOpen,  bg: "bg-blue-100",    iconColor: "text-blue-600"    },
  { id: "music",     label: "Music",     Icon: Music,     bg: "bg-violet-100",  iconColor: "text-violet-600"  },
  { id: "gamepad",   label: "Gamepad",   Icon: Gamepad2,  bg: "bg-cyan-100",    iconColor: "text-cyan-600"    },
  { id: "heart",     label: "Heart",     Icon: Heart,     bg: "bg-red-100",     iconColor: "text-red-500"     },
  { id: "telescope", label: "Telescope", Icon: Telescope, bg: "bg-sky-100",     iconColor: "text-sky-600"     },
  { id: "feather",   label: "Feather",   Icon: Feather,   bg: "bg-teal-100",    iconColor: "text-teal-600"    },
  { id: "waves",     label: "Waves",     Icon: Waves,     bg: "bg-blue-50",     iconColor: "text-blue-400"    },
];

export function getAvatarOption(id: string): AvatarOption | undefined {
  return AVATARS.find((a) => a.id === id);
}

// ---------------------------------------------------------------------------
// Step 1: Welcome
// ---------------------------------------------------------------------------

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 text-center">
      <div className="w-20 h-20 rounded-3xl bg-sage-100 border border-sage-200 flex items-center justify-center mb-6 shadow-sm">
        <Compass size={40} className="text-sage-700" />
      </div>

      <p className="text-sm font-semibold text-sage-600 tracking-widest uppercase mb-3">
        NeuroCompass
      </p>

      <h1 className="text-3xl font-bold text-slate-800 leading-tight mb-4">
        Welcome to NeuroCompass
      </h1>

      <p className="text-base text-slate-500 leading-relaxed max-w-xs mb-10">
        A compassionate space built for neurodivergent minds. Let's get to know you a little.
      </p>

      <button
        onClick={onNext}
        className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700 active:scale-[0.97] text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-md transition-all"
      >
        Get Started
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Name
// ---------------------------------------------------------------------------

function StepName({
  name,
  onNameChange,
  onNext,
  onSkip,
}: {
  name: string;
  onNameChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-3">
          What should we call you?
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          This is just for you. Use whatever feels right: a name, a nickname, or anything you'd like.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Alex, they/them, Starfish..."
          className="w-full border-2 border-sage-200 focus:border-sage-500 rounded-2xl px-5 py-4 text-lg text-slate-800 placeholder-slate-300 bg-cream-50 focus:outline-none transition-colors"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onNext()}
        />

        <button
          onClick={onNext}
          className="mt-6 w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
        >
          Next
        </button>

        <button
          onClick={onSkip}
          className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: App Overview
// ---------------------------------------------------------------------------

type OverviewMode = "tldr" | "detail" | "tutorial";

const OVERVIEW_TOPICS = [
  {
    icon: Wrench,
    bg: "bg-stone-100",
    color: "text-stone-600",
    heading: "Tools & Recommendations",
    tldr: "Search what you're struggling with and we'll recommend the right tools for you.",
    detail: "The Tools section has 50+ interactive tools built for ADHD, autism, and other ND experiences. On the Tools page, type what you're struggling with into the search bar and we'll surface the most relevant tools. You can filter by category or browse everything. Each tool is designed to be low-effort to start.",
    tutorial: "The Tools section has 50+ interactive tools for ADHD, autism, and other ND experiences. At the top of the tools page, type what you're struggling with and we'll suggest the best tools for you.",
  },
  {
    icon: Zap,
    bg: "bg-[#ebe8f5]",
    color: "text-[#8478aa]",
    heading: "XP & Levelling Up",
    tldr: "Earn XP by using tools, logging mood, completing tasks, and focusing.",
    detail: "XP is earned through everyday app actions: logging your mood, completing planner tasks, using tools, and running focus sessions. As you accumulate XP, you level up. Each level is a small marker of consistent effort. There's no pressure to grind; the system rewards whatever you actually do. Your current level is shown on your home screen.",
    tutorial: "You earn XP by logging your mood, completing planner tasks, using tools, and focusing. As your XP builds up, you level up. Your current level is shown on your home screen.",
  },
  {
    icon: Star,
    bg: "bg-[#ebe8f5]",
    color: "text-[#8478aa]",
    heading: "Coins & Spending Them",
    tldr: "Earn coins by completing planner tasks, then spend them on rewards you create.",
    detail: "Coins are earned through the planner: when you create a task, you set how many coins it gives you on completion. The harder or more dreaded the task, the more coins you can assign. Coins are spent in the Shop on rewards you choose: a snack, a nap, or guilt-free screen time. It's a way to make task completion feel genuinely rewarding.",
    tutorial: "Coins are earned through task rewards in the planner. You set how many coins each task gives you when you complete it. Spend them in the Shop on rewards you choose.",
  },
  {
    icon: Heart,
    bg: "bg-rose-100",
    color: "text-rose-500",
    heading: "Favouriting Tools",
    tldr: "Tap the heart on any tool to pin it to your home screen for quick access.",
    detail: "Every tool has a heart icon you can tap to favourite it. Favourited tools appear in the My Tools section on your home screen, so you don't have to dig through the full list every time. Over time, your home screen becomes a personalised toolkit of the things that actually help you. You can unfavourite any time.",
    tutorial: "Tap the heart on any tool to add it to your My Tools section on the home screen. Quick access to the tools that work best for you.",
  },
  {
    icon: Gift,
    bg: "bg-violet-100",
    color: "text-violet-600",
    heading: "Shop & Rewards",
    tldr: "Spend coins on rewards you design yourself: anything that feels like a treat to you.",
    detail: "The Shop is where coins turn into real-life rewards. A few examples come pre-loaded (like a fancy coffee or a movie night), but the real power is in creating your own. Any reward that feels motivating to you can go in the Shop: a particular snack, a guilt-free nap, 30 minutes of a game. You set the coin cost for each one.",
    tutorial: "Spend your coins in the Shop on real-life rewards you choose, like a movie night, a fancy coffee, or guilt-free screen time. You can edit the pre-loaded rewards or add your own custom ones.",
  },
  {
    icon: Flame,
    bg: "bg-[#f5efec]",
    color: "text-[#8f6559]",
    heading: "Streaks & Streak Freezes",
    tldr: "Open the app daily to build your streak. A freeze auto-saves you if you miss a day.",
    detail: "Your streak counts how many consecutive days you've opened NeuroCompass. Missing a day uses up a streak freeze if you have one, so your streak is saved automatically. You earn a freeze every 7 days just by showing up, or you can buy one in the Shop for 30 coins. Streaks are meant to be encouraging, not punishing. The freeze system is there so a hard day doesn't wipe your progress.",
    tutorial: "Open the app every day to build your streak. If you miss a day, a streak freeze saves it for you. You earn a freeze every 7 days, or buy one in the shop for 30 coins.",
  },
  {
    icon: ShoppingBag,
    bg: "bg-amber-100",
    color: "text-amber-600",
    heading: "Okay Mode",
    tldr: "Turn on Okay Mode on the Shop page to access rewards for free when you need a boost.",
    detail: "Okay Mode is a setting on the Shop page for moments when you're struggling and need support without earning it first. When turned on, you can claim any reward for free. It's designed for hard days when the usual system feels like too much of an ask.",
    tutorial: "Okay Mode lives on the Shop page. When you're having a rough time and need support now, turn it on to access any reward for free, no coins needed.",
  },
  {
    icon: CalendarDays,
    bg: "bg-blue-100",
    color: "text-blue-600",
    heading: "Planner Views",
    tldr: "The Planner now has Day, Week, and Month views so you can plan at whatever scale works for you.",
    detail: "The Planner has three views to match how you naturally think about time: Day, Week, and Month. Switch between them depending on what you need, whether that's zooming in on today or getting a broader picture of what's coming. All views stay in sync as you add and complete tasks.",
    tutorial: "The Planner now has Day, Week, and Month views. Switch between them to plan at the scale that works best for your brain, whether you need to zoom into today or see the whole month ahead.",
  },
  {
    icon: User,
    bg: "bg-indigo-100",
    color: "text-indigo-600",
    heading: "Me Page",
    tldr: "Your Me page is your personal hub: ND strengths and sensory profile summary, all in one place.",
    detail: "The Me page is your personal neurodivergent profile, bringing together your ND strengths and a summary of your sensory profile. Your sensory profile is built in Tools and displayed in summary form here, so your key sensory info is always close at hand.",
    tutorial: "Your Me page is your personal hub. Your ND strengths and sensory profile summary live here in one place.",
  },
];

const MODE_LABELS: Record<OverviewMode, string> = {
  tldr: "TLDR",
  detail: "In Detail",
  tutorial: "Tutorial",
};

function StepOverview({ onNext, onTutorial }: { onNext: () => void; onTutorial: () => void }) {
  const [mode, setMode] = useState<OverviewMode>("tldr");

  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-5">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">
            Here&apos;s what&apos;s inside
          </h2>
          <button
            onClick={onNext}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium shrink-0 mt-1.5"
          >
            I&apos;ll figure it out
          </button>
        </div>

        {/* Mode toggle: 3 pills */}
        <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
          {(["tldr", "detail", "tutorial"] as OverviewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all",
                mode === m
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* TLDR mode */}
        {mode === "tldr" && (
          <>
            <div className="flex flex-col gap-2">
              {OVERVIEW_TOPICS.map(({ icon: Icon, bg, color, heading, tldr }) => (
                <div key={heading} className="bg-cream-50 border border-slate-100 rounded-2xl p-4 flex gap-3 shadow-sm">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", bg)}>
                    <Icon size={15} className={color} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">{heading}</p>
                    <p className="text-sm text-slate-700 leading-snug">{tldr}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onNext}
              className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
            >
              Sounds good, let&apos;s go!
            </button>
          </>
        )}

        {/* In Detail mode */}
        {mode === "detail" && (
          <>
            <div className="flex flex-col gap-3">
              {OVERVIEW_TOPICS.map(({ icon: Icon, bg, color, heading, detail }) => (
                <div key={heading} className="bg-cream-50 border border-slate-100 rounded-2xl p-4 flex gap-3 shadow-sm">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", bg)}>
                    <Icon size={17} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{heading}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onNext}
              className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
            >
              Sounds good, let&apos;s go!
            </button>
          </>
        )}

        {/* Tutorial mode */}
        {mode === "tutorial" && (
          <div className="flex flex-col gap-4">
            <div className="bg-cream-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center shrink-0">
                <Compass size={22} className="text-sage-700" />
              </div>
              <p className="text-lg font-bold text-slate-800">Take the guided tour</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                We&apos;ll walk you through the real app, page by page. You&apos;ll see what each section does as you go, with a floating guide card at the bottom of the screen.
              </p>
              <p className="text-xs text-slate-400">
                You can exit the tour at any time.
              </p>
            </div>
            <button
              onClick={onTutorial}
              className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Let&apos;s go
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onNext}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-1 text-center"
            >
              Skip tour, just finish setup
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Avatar
// ---------------------------------------------------------------------------

function StepAvatar({
  selectedAvatar,
  onSelect,
  onFinish,
  onSkip,
}: {
  selectedAvatar: string;
  onSelect: (id: string) => void;
  onFinish: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen px-6 py-14">
      <div className="max-w-sm mx-auto w-full flex flex-col h-full">
        <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">
          Choose your avatar
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Pick something that feels like you. You can always change this later.
        </p>

        <div className="grid grid-cols-4 gap-3 flex-1">
          {AVATARS.map(({ id, label, Icon, bg, iconColor }) => {
            const selected = selectedAvatar === id;
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                aria-label={label}
                className={cn(
                  "flex flex-col items-center gap-1.5 group",
                )}
              >
                <div
                  className={cn(
                    "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
                    bg,
                    selected
                      ? "ring-2 ring-sage-500 ring-offset-2 scale-105 shadow-md"
                      : "hover:scale-105 hover:shadow-sm active:scale-[0.97]"
                  )}
                >
                  {selected ? (
                    <Check size={28} className={iconColor} strokeWidth={2.5} />
                  ) : (
                    <Icon size={28} className={iconColor} />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={onFinish}
            disabled={!selectedAvatar}
            className="w-full bg-sage-600 hover:bg-sage-700 disabled:bg-stone-200 disabled:text-stone-400 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
          >
            Finish
          </button>
          <button
            onClick={onSkip}
            className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Notification style
// ---------------------------------------------------------------------------

type NotifStyle = 'cheerleader' | 'gentle' | 'silent';

const NOTIF_OPTIONS: { id: NotifStyle; label: string; desc: string; Icon: React.ElementType }[] = [
  {
    id: 'cheerleader',
    label: 'Cheerleader',
    desc: 'Regular encouragement, streak reminders, and celebration alerts',
    Icon: BellRing,
  },
  {
    id: 'gentle',
    label: 'Gentle Reminders',
    desc: 'Occasional check-ins and important reminders only',
    Icon: Bell,
  },
  {
    id: 'silent',
    label: 'Silent',
    desc: 'No notifications',
    Icon: BellOff,
  },
];

function StepNotification({
  selected,
  onSelect,
  onNext,
}: {
  selected: NotifStyle;
  onSelect: (v: NotifStyle) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto w-full flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
          How would you like to be supported?
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed -mt-2">
          You can always change this later in Settings.
        </p>
        <div className="flex flex-col gap-2">
          {NOTIF_OPTIONS.map(({ id, label, desc, Icon }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                  active
                    ? "bg-sage-50 border-sage-300 shadow-sm"
                    : "bg-cream-50 border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                  active ? "bg-sage-100" : "bg-stone-100"
                )}>
                  <Icon size={19} className={active ? "text-sage-600" : "text-slate-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", active ? "text-sage-800" : "text-slate-700")}>
                    {label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
                </div>
                {active && (
                  <div className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 -mt-1">
          Notification delivery coming soon
        </p>
        <button
          onClick={onNext}
          className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 6: First task
// ---------------------------------------------------------------------------

function StepFirstTask({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { addTask } = useAppStore();
  const [title, setTitle] = useState("");
  const [recurring, setRecurring] = useState(false);

  const handleAdd = () => {
    const t = title.trim();
    if (!t) { onNext(); return; }
    addTask({
      title: t,
      priority: "medium",
      type: "task",
      status: "todo",
      isRecurring: recurring,
      recurType: recurring ? "weekly" : undefined,
      tags: [],
      xpReward: 10,
    });
    onNext();
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto w-full flex flex-col justify-center flex-1 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">Add your first task</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Something you want to get done this week, or a regular habit you want to track.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Reply to emails, Go for a walk..."
            className="w-full border-2 border-sage-200 focus:border-sage-500 rounded-2xl px-5 py-4 text-base text-slate-800 placeholder-slate-300 bg-cream-50 focus:outline-none transition-colors"
            autoFocus
          />
          <button
            onClick={() => setRecurring((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              recurring
                ? "bg-sage-50 border-sage-300 text-sage-700"
                : "bg-cream-50 border-slate-200 text-slate-400"
            )}
          >
            <Repeat size={14} />
            {recurring ? "Repeats weekly" : "Make it weekly recurring"}
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
        >
          {title.trim() ? "Add task & continue" : "Skip for now"}
          <ArrowRight size={16} className="inline ml-2" />
        </button>
        <button onClick={onSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center py-1">
          Skip
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 7: First reward
// ---------------------------------------------------------------------------

function StepFirstReward({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { addShopReward } = useAppStore();
  const [name, setName] = useState("");
  const [cost, setCost] = useState(20);

  const handleAdd = () => {
    const n = name.trim();
    if (!n) { onNext(); return; }
    addShopReward({ name: n, description: "", cost, icon: "Gift", isCustom: true });
    onNext();
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto w-full flex flex-col justify-center flex-1 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">Add your first reward</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Something that feels genuinely good to you: a snack, a nap, screen time, a treat. You earn it with coins from completing tasks.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Fancy coffee, 30 min gaming, Movie night..."
            className="w-full border-2 border-sage-200 focus:border-sage-500 rounded-2xl px-5 py-4 text-base text-slate-800 placeholder-slate-300 bg-cream-50 focus:outline-none transition-colors"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <Coins size={16} className="text-[#B8A96A] shrink-0" />
            <p className="text-sm text-slate-600 shrink-0">Coin cost:</p>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => setCost(v)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all",
                    cost === v
                      ? "bg-sage-600 text-white border-sage-600"
                      : "bg-cream-50 text-slate-500 border-slate-200 hover:border-sage-300"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all"
        >
          {name.trim() ? "Add reward & continue" : "Skip for now"}
          <ArrowRight size={16} className="inline ml-2" />
        </button>
        <button onClick={onSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center py-1">
          Skip
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 8: First habit
// ---------------------------------------------------------------------------

function StepFirstHabit({ onFinish, onSkip }: { onFinish: () => void; onSkip: () => void }) {
  const { addHabit } = useAppStore();
  const [name, setName] = useState("");

  const handleAdd = () => {
    const n = name.trim();
    if (!n) { onFinish(); return; }
    addHabit(n);
    onFinish();
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto w-full flex flex-col justify-center flex-1 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">Set a daily habit</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Something small you want to do every day. You can track streaks for it in the Habits section.
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Drink water, Go outside, Take meds..."
            className="w-full border-2 border-sage-200 focus:border-sage-500 rounded-2xl px-5 py-4 text-base text-slate-800 placeholder-slate-300 bg-cream-50 focus:outline-none transition-colors"
            autoFocus
          />
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-base py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {name.trim() ? "Add habit & finish" : "Skip & finish"}
          <Check size={16} />
        </button>
        <button onClick={onSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center py-1">
          Skip
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress dots
// ---------------------------------------------------------------------------

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center gap-1.5 pt-8 z-10">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
        <div
          key={s}
          className={cn(
            "rounded-full transition-all duration-300",
            s === step
              ? "w-5 h-2 bg-sage-500"
              : s < step
              ? "w-2 h-2 bg-sage-300"
              : "w-2 h-2 bg-stone-200"
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main onboarding page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, setNotificationStyle } = useAppStore();
  const { startTour: launchTour } = useTour();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [notifStyle, setNotifStyle] = useState<NotifStyle>('gentle');

  const finish = (finalName: string, finalAvatar: string, finalNotif: NotifStyle) => {
    setNotificationStyle(finalNotif);
    completeOnboarding(finalName.trim(), finalAvatar);
    router.replace("/");
  };

  const startTour = () => {
    setNotificationStyle(notifStyle);
    completeOnboarding(name.trim(), avatar);
    launchTour();
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {step > 1 && <ProgressDots step={step} />}

      {step === 1 && (
        <StepWelcome onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepName
          name={name}
          onNameChange={setName}
          onNext={() => setStep(3)}
          onSkip={() => { setName(""); setStep(3); }}
        />
      )}

      {step === 3 && (
        <StepAvatar
          selectedAvatar={avatar}
          onSelect={setAvatar}
          onFinish={() => setStep(4)}
          onSkip={() => setStep(4)}
        />
      )}

      {step === 4 && (
        <StepNotification
          selected={notifStyle}
          onSelect={setNotifStyle}
          onNext={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <StepOverview onNext={() => setStep(6)} onTutorial={startTour} />
      )}

      {step === 6 && (
        <StepFirstTask onNext={() => setStep(7)} onSkip={() => setStep(7)} />
      )}

      {step === 7 && (
        <StepFirstReward onNext={() => setStep(8)} onSkip={() => setStep(8)} />
      )}

      {step === 8 && (
        <StepFirstHabit onFinish={() => finish(name, avatar, notifStyle)} onSkip={() => finish(name, avatar, notifStyle)} />
      )}
    </div>
  );
}
