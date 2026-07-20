"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Heart, Flame, Search, Sparkles, Trophy, Timer } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { LucideIcon } from "lucide-react";

function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100">
      <ArrowLeft size={20} className="text-slate-500" />
    </button>
  );
}

interface BrainFuelMotivator {
  key: string;
  label: string;
  icon: LucideIcon;
  tagline: string;
  questions: string[];
  activationIdeas: string[];
  color: string;
  bgColor: string;
}

const BRAIN_FUEL_MOTIVATORS: BrainFuelMotivator[] = [
  {
    key: "passion",
    label: "Passion",
    icon: Flame,
    tagline: "Does this connect to something you care deeply about?",
    questions: [
      "Does this align with my values or something I love?",
      "Does completing this move me toward something that matters to me?",
      "Can I connect this task to a special interest or bigger purpose?",
    ],
    activationIdeas: [
      "Find your why: even a small connection to something you care about counts",
      "Connect the task to a bigger goal that genuinely matters to you",
      "Ask: who does this help, and do I care about them?",
    ],
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
  },
  {
    key: "interest",
    label: "Interest",
    icon: Search,
    tagline: "Is this topic or task genuinely interesting to you?",
    questions: [
      "Do I find any part of this curious or fascinating?",
      "Would I read about this topic on my own?",
      "Is there a piece of this I actually enjoy?",
    ],
    activationIdeas: [
      "Start with the most interesting angle, not the most logical one",
      "Give yourself permission to explore and discover as you work",
      "Pair the task with a topic or format you already enjoy (podcast, music)",
    ],
    color: "text-stone-600",
    bgColor: "bg-stone-50 border-stone-200",
  },
  {
    key: "novelty",
    label: "Novelty",
    icon: Sparkles,
    tagline: "Is there something new, different, or fresh about this?",
    questions: [
      "Is any part of this new to me?",
      "Can I approach it differently than I have before?",
      "Is the environment or method fresh?",
    ],
    activationIdeas: [
      "Change your environment: cafe, library, different room, outside",
      "Use a new tool, app, or format you haven't tried before",
      "Add a creative constraint: 'Can I do this in half the time?' or 'What if I approached it backwards?'",
    ],
    color: "text-sage-700",
    bgColor: "bg-sage-50 border-sage-200",
  },
  {
    key: "challenge",
    label: "Challenge",
    icon: Trophy,
    tagline: "Is there a challenge, competitive edge, or collaboration?",
    questions: [
      "Is this hard enough to be genuinely engaging?",
      "Can I race against myself or a clock?",
      "Could I do this alongside someone else?",
    ],
    activationIdeas: [
      "Create a personal challenge: beat your last time, hit a new record",
      "Body double: work alongside someone (in person or virtually)",
      "Tell a friend what you're working on and invite them to check in on you",
    ],
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 border-cyan-200",
  },
  {
    key: "urgency",
    label: "Urgency",
    icon: Timer,
    tagline: "Is there a deadline or real time pressure?",
    questions: [
      "Is there a real deadline for this?",
      "Is there a consequence if I don't start soon?",
      "Can I create a meaningful time constraint?",
    ],
    activationIdeas: [
      "Set a timer and commit to working only until it goes off",
      "Tell someone you'll have it done by a specific time",
      "Schedule this task right before something you're looking forward to",
    ],
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
];

type MotivatorState = "present" | "can-add" | "not-available";

export default function BrainFuelPage() {
  const { toggleFavorite, isFavorite } = useAppStore();
  const favorite = isFavorite("pinch-motivators");
  const [taskName, setTaskName] = useState("");
  const [taskEntered, setTaskEntered] = useState(false);
  const [states, setStates] = useState<Record<string, MotivatorState>>({});
  const [showResults, setShowResults] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const setState = (key: string, val: MotivatorState) =>
    setStates((prev) => ({ ...prev, [key]: val }));

  const presentCount = Object.values(states).filter((s) => s === "present").length;
  const canAddCount = Object.values(states).filter((s) => s === "can-add").length;
  const allRated = BRAIN_FUEL_MOTIVATORS.every((m) => states[m.key]);

  const activeMotivators = BRAIN_FUEL_MOTIVATORS.filter((m) => states[m.key] === "present");
  const canAddMotivators = BRAIN_FUEL_MOTIVATORS.filter((m) => states[m.key] === "can-add");

  if (showResults) {
    return (
      <div className="px-4 pt-12 pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Brain Fuel Results</h1>
            {taskName && <p className="text-sm text-slate-500 truncate">Task: {taskName}</p>}
          </div>
          <button onClick={() => toggleFavorite("pinch-motivators")} className="p-2 rounded-xl hover:bg-slate-100">
            <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-sage-50 to-stone-100 rounded-2xl p-5 border border-sage-100 text-center">
          <p className="text-sm text-slate-600 mb-1">Fuel sources active right now</p>
          <p className="text-4xl font-bold text-sage-700">{presentCount} <span className="text-2xl text-slate-400">/ 5</span></p>
          {canAddCount > 0 && (
            <p className="text-sm text-stone-600 mt-2 font-medium">+ {canAddCount} you could activate</p>
          )}
        </div>

        {activeMotivators.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Already working for you</p>
            <div className="space-y-2">
              {activeMotivators.map((m) => (
                <div key={m.key} className={cn("rounded-2xl p-4 border flex items-center gap-3", m.bgColor)}>
                  <m.icon size={18} className={m.color} />
                  <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {canAddMotivators.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Fuel you could activate</p>
            <div className="space-y-3">
              {canAddMotivators.map((m) => (
                <div key={m.key} className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    className="w-full text-left p-4 flex items-center gap-3"
                    onClick={() => setExpanded(expanded === m.key ? null : m.key)}
                  >
                    <m.icon size={18} className={m.color} />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={cn("text-slate-300 transition-transform", expanded === m.key && "rotate-90")}
                    />
                  </button>
                  {expanded === m.key && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                      {m.activationIdeas.map((idea, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-sage-400 shrink-0 mt-0.5">→</span>
                          <p className="text-sm text-slate-600">{idea}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {presentCount === 0 && canAddCount === 0 && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
            <Heart size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No obvious fuel sources right now</p>
            <p className="text-sm text-slate-500 mt-1">That&apos;s okay. This task might need external scaffolding: a body double, timer, or accountability partner.</p>
          </div>
        )}

        <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Remember:</strong> Your ADHD brain needs the right fuel, not more willpower. Activating even one source can make a real difference.
          </p>
        </div>

        <button
          onClick={() => { setStates({}); setShowResults(false); setTaskEntered(false); setTaskName(""); }}
          className="w-full border border-sage-300 text-sage-700 rounded-2xl py-3 font-semibold hover:bg-sage-50 transition-all"
        >
          Try another task
        </button>
      </div>
    );
  }

  if (!taskEntered) {
    return (
      <div className="px-4 pt-12 pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">Brain Fuel</h1>
            <p className="text-sm text-slate-500">Find what activates your ADHD brain right now</p>
          </div>
          <button onClick={() => toggleFavorite("pinch-motivators")} className="p-2 rounded-xl hover:bg-slate-100">
            <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-stone-100 to-sage-50 rounded-2xl p-5 border border-stone-200">
          <p className="text-sm text-slate-700 leading-relaxed">
            Your ADHD brain runs on specific kinds of fuel. Use this to figure out what&apos;s available right now and how to activate more of it.
          </p>
        </div>

        <div className="space-y-3">
          {BRAIN_FUEL_MOTIVATORS.map((m) => (
            <div key={m.key} className={cn("rounded-2xl p-4 border flex items-center gap-4", m.bgColor)}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-cream-50">
                <m.icon size={18} className={m.color} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{m.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.tagline}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">What task are you trying to do?</p>
          <input
            className="w-full bg-cream-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. Write my essay introduction"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <p className="text-xs text-slate-400">Optional: helps you stay focused as you go through</p>
        </div>

        <button
          onClick={() => setTaskEntered(true)}
          className="w-full bg-sage-600 text-white rounded-2xl py-3.5 font-semibold hover:bg-sage-700 transition-all"
        >
          Check my fuel →
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Brain Fuel</h1>
          {taskName && <p className="text-sm text-slate-500 truncate">Task: {taskName}</p>}
        </div>
        <button onClick={() => toggleFavorite("pinch-motivators")} className="p-2 rounded-xl hover:bg-slate-100">
          <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
        </button>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs text-slate-500">For each fuel source, rate whether it&apos;s present, something you could activate, or not available right now.</p>
      </div>

      <div className="space-y-3">
        {BRAIN_FUEL_MOTIVATORS.map((m) => {
          const current = states[m.key];
          const isOpen = expanded === m.key;

          return (
            <div key={m.key} className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-center gap-3"
                onClick={() => setExpanded(isOpen ? null : m.key)}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <m.icon size={18} className={m.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.tagline}</p>
                </div>
                {current && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full border font-medium shrink-0",
                    current === "present" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                    current === "can-add" ? "bg-stone-100 text-stone-600 border-stone-200" :
                    "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    {current === "present" ? "Active" : current === "can-add" ? "Could activate" : "Not available"}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 pt-3 pb-4 space-y-4">
                  <div className="space-y-1">
                    {m.questions.map((q, i) => (
                      <p key={i} className="text-sm text-slate-600 italic">• {q}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Is this fuel source available?</p>
                    <div className="flex flex-col gap-2">
                      {(["present", "can-add", "not-available"] as MotivatorState[]).map((val) => (
                        <button
                          key={val}
                          onClick={() => { setState(m.key, val); setExpanded(null); }}
                          className={cn(
                            "w-full text-left py-2.5 px-4 rounded-xl border text-sm font-medium transition-all",
                            current === val
                              ? val === "present"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400"
                                : val === "can-add"
                                ? "bg-stone-100 text-stone-600 border-stone-300 ring-2 ring-stone-400"
                                : "bg-slate-100 text-slate-600 border-slate-300 ring-2 ring-slate-400"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-sage-300"
                          )}
                        >
                          {val === "present" ? "Yes, it's already there" :
                           val === "can-add" ? "Not yet, but I could activate it" :
                           "Not available for this task"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-cream-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-sm text-slate-600">
          {Object.keys(states).length} of {BRAIN_FUEL_MOTIVATORS.length} rated
        </p>
        <button
          onClick={() => setShowResults(true)}
          disabled={!allRated}
          className="bg-sage-600 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-sage-700 transition-all text-sm"
        >
          See results →
        </button>
      </div>
    </div>
  );
}
