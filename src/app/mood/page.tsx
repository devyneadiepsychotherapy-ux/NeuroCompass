"use client";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import {
  Heart,
  BatteryWarning,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
  Frown,
  Meh,
  Smile,
  SmilePlus,
  type LucideIcon,
} from "lucide-react";
import { EnergyLevel, PleasantnessLevel } from "@/types";

// Emotion matrix quadrants (based on Russell's circumplex model)
const emotions: Record<string, { x: PleasantnessLevel; y: EnergyLevel }> = {
  // High energy, pleasant
  "Excited":          { x: 5, y: 5 },
  "Joy":              { x: 5, y: 5 },
  "Joyful":           { x: 5, y: 4 },
  "Enthusiastic":     { x: 4, y: 5 },
  "Hopeful":          { x: 4, y: 4 },
  // High energy, unpleasant
  "Anxious":          { x: 2, y: 5 },
  "Angry":            { x: 1, y: 5 },
  "Fear":             { x: 1, y: 5 },
  "Panic":            { x: 1, y: 5 },
  "Overwhelmed":      { x: 1, y: 4 },
  "Frustrated":       { x: 2, y: 4 },
  "Annoyed":          { x: 2, y: 4 },
  "Worried":          { x: 2, y: 4 },
  // Low energy, pleasant
  "Calm":             { x: 4, y: 2 },
  "Content":          { x: 5, y: 2 },
  "Peaceful":         { x: 4, y: 1 },
  "Grateful":         { x: 5, y: 3 },
  "Gratitude":        { x: 5, y: 2 },
  "Satisfied":        { x: 5, y: 2 },
  "Relaxed":          { x: 4, y: 2 },
  // Low energy, unpleasant
  "Sad":              { x: 2, y: 2 },
  "Exhausted":        { x: 1, y: 1 },
  "Numb":             { x: 2, y: 1 },
  "Tired":            { x: 2, y: 1 },
  "Lonely":           { x: 1, y: 2 },
  "Grief":            { x: 1, y: 2 },
  "Disinterest":      { x: 2, y: 2 },
  // Middle / ND-specific
  "Neutral":          { x: 3, y: 3 },
  "Curious":          { x: 4, y: 3 },
  "Disgust":          { x: 2, y: 3 },
  "Bored":            { x: 3, y: 2 },
  "Focused":          { x: 3, y: 4 },
  "Dissociated":      { x: 2, y: 3 },
  "Sensory overload": { x: 1, y: 3 },
};

const bodyAreas = ["Head", "Neck", "Shoulders", "Chest", "Stomach", "Hands", "Legs", "Back", "Jaw", "Eyes", "Face"];
const bodyNotePrompts = [
  "Heart racing?", "Tight chest?", "Heavy limbs?", "Tingly?", "Tense jaw?",
  "Stomach tight?", "Shaky?", "Foggy?", "Numb?", "Restless?"
];

// ---- Icon configs ----

type EnergyOption = { label: string; value: EnergyLevel; icon: LucideIcon; color: string };
type PleasantOption = { label: string; value: PleasantnessLevel; icon: LucideIcon; color: string };

const ENERGY_OPTIONS: EnergyOption[] = [
  { label: "Very Low",  value: 1, icon: BatteryWarning, color: "text-rose-400"   },
  { label: "Low",       value: 2, icon: BatteryLow,     color: "text-orange-400" },
  { label: "Moderate",  value: 3, icon: BatteryMedium,  color: "text-stone-400"  },
  { label: "High",      value: 4, icon: BatteryFull,    color: "text-sage-400"   },
  { label: "Very High", value: 5, icon: Zap,            color: "text-sage-600"   },
];

const PLEASANT_OPTIONS: PleasantOption[] = [
  { label: "Very Unpleasant", value: 1, icon: Frown,     color: "text-rose-500"  },
  { label: "Unpleasant",      value: 2, icon: Frown,     color: "text-rose-300"  },
  { label: "Neutral",         value: 3, icon: Meh,       color: "text-stone-400" },
  { label: "Pleasant",        value: 4, icon: Smile,     color: "text-sage-400"  },
  { label: "Very Pleasant",   value: 5, icon: SmilePlus, color: "text-sage-600"  },
];

const PLEASANT_LABELS = ["Very Unpleasant", "Unpleasant", "Neutral", "Pleasant", "Very Pleasant"];

type FlowType = "both" | "mood" | "body";
type StepType = "flow" | "matrix" | "body" | "notes" | "done";

function XpToast({ amount }: { amount: number }) {
  return (
    <div
      key={amount + Date.now()}
      className="fixed top-16 left-1/2 z-50 flex items-center gap-1.5 bg-[#9B8EC4] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg animate-fade-in-out pointer-events-none"
      style={{ transform: "translateX(-50%)" }}
    >
      <Heart size={13} className="fill-white" />
      +{amount} XP
    </div>
  );
}

export default function MoodPage() {
  const { addMoodEntry, moodEntries, addXP } = useAppStore();
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerXp = (amount: number) => {
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    setXpFlash(amount);
    xpTimerRef.current = setTimeout(() => setXpFlash(null), 1500);
  };

  useEffect(() => () => { if (xpTimerRef.current) clearTimeout(xpTimerRef.current); }, []);

  const [flow, setFlow] = useState<FlowType>("both");
  const [step, setStep] = useState<StepType>("flow");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [pleasantness, setPleasantness] = useState<PleasantnessLevel>(3);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [bodyNotes, setBodyNotes] = useState("");
  const [notes, setNotes] = useState("");

  const toggleEmotion = (e: string) => {
    setSelectedEmotions(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
    );
  };

  const toggleArea = (a: string) => {
    setSelectedAreas(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = () => {
    addMoodEntry({
      energy,
      pleasantness,
      emotions: selectedEmotions,
      bodyAreas: selectedAreas,
      bodyNotes,
      notes,
    });
    addXP(10);
    triggerXp(10);
    setStep("done");
  };

  const startFlow = (selected: FlowType) => {
    setFlow(selected);
    setStep(selected === "body" ? "body" : "matrix");
  };

  const nextFromMatrix = () => {
    if (flow === "mood") {
      setStep("notes");
    } else {
      setStep("body");
    }
  };

  const backFromBody = () => {
    if (flow === "body") {
      setStep("flow");
    } else {
      setStep("matrix");
    }
  };

  const backFromNotes = () => {
    if (flow === "mood") {
      setStep("matrix");
    } else {
      setStep("body");
    }
  };

  // Derive visible steps for progress bar
  const visibleSteps: StepType[] =
    flow === "mood" ? ["matrix", "notes"] :
    flow === "body" ? ["body", "notes"] :
    ["matrix", "body", "notes"];

  const recentEntries = moodEntries.slice(0, 5);

  const resetAll = () => {
    setStep("flow");
    setFlow("both");
    setSelectedEmotions([]);
    setSelectedAreas([]);
    setBodyNotes("");
    setNotes("");
    setEnergy(3);
    setPleasantness(3);
  };

  if (step === "done") {
    return (
      <div className="px-4 pt-20 pb-8 flex flex-col items-center gap-6">
        {xpFlash && <XpToast amount={xpFlash} />}
        <div className="text-center space-y-3">
          <Heart size={40} className="text-sage-400 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Check-in complete</h2>
          <p className="text-slate-500 leading-relaxed max-w-xs">
            Thank you for checking in with yourself. Noticing your inner world takes courage.
          </p>
        </div>
        <div className="bg-sage-50 rounded-2xl p-4 w-full border border-sage-100">
          <p className="text-sm font-semibold text-sage-700 mb-1">You noted:</p>
          {(flow === "both" || flow === "mood") && (
            <>
              <p className="text-sm text-slate-600">
                Energy: {ENERGY_OPTIONS.find(o => o.value === energy)?.label}
              </p>
              <p className="text-sm text-slate-600">
                Feeling: {PLEASANT_LABELS[pleasantness - 1]}
              </p>
            </>
          )}
          {selectedEmotions.length > 0 && (
            <p className="text-sm text-slate-600 mt-1">
              Emotions: {selectedEmotions.join(", ")}
            </p>
          )}
          {selectedAreas.length > 0 && (
            <p className="text-sm text-slate-600 mt-1">
              Body: {selectedAreas.join(", ")}
            </p>
          )}
        </div>
        <div className="w-full space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recent entries</p>
          {recentEntries.map((entry) => (
            <div key={entry.id} className="bg-cream-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full shrink-0", entry.pleasantness >= 4 ? "bg-emerald-400" : entry.pleasantness >= 3 ? "bg-stone-400" : "bg-rose-400")} />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {PLEASANT_LABELS[entry.pleasantness - 1]}
                  {entry.emotions?.length > 0 && ` · ${entry.emotions.slice(0, 2).join(", ")}`}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(entry.timestamp).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={resetAll}
          className="w-full border border-sage-300 text-sage-700 rounded-2xl py-3 font-semibold hover:bg-sage-50 transition-all"
        >
          New check-in
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mood Check-In</h1>
        <p className="text-sm text-slate-500">No right or wrong answers. Just notice.</p>
      </div>

      {/* Progress (only after flow is selected) */}
      {step !== "flow" && (
        <div className="flex gap-2">
          {visibleSteps.map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                step === s
                  ? "bg-sage-500"
                  : visibleSteps.indexOf(step) > visibleSteps.indexOf(s)
                  ? "bg-sage-300"
                  : "bg-slate-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Flow selector */}
      {step === "flow" && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-700">What would you like to check in with today?</p>
          <div className="space-y-3">
            <button
              onClick={() => startFlow("both")}
              className="w-full text-left bg-cream-50 border border-sage-200 hover:border-sage-400 rounded-2xl p-4 transition-all active:scale-[0.98]"
            >
              <p className="font-semibold text-slate-800">Full check-in</p>
              <p className="text-sm text-slate-500 mt-0.5">Emotions, body scan, and notes</p>
            </button>
            <button
              onClick={() => startFlow("mood")}
              className="w-full text-left bg-cream-50 border border-rose-200 hover:border-rose-400 rounded-2xl p-4 transition-all active:scale-[0.98]"
            >
              <p className="font-semibold text-slate-800">Mood check-in only</p>
              <p className="text-sm text-slate-500 mt-0.5">How you're feeling emotionally</p>
            </button>
            <button
              onClick={() => startFlow("body")}
              className="w-full text-left bg-cream-50 border border-emerald-200 hover:border-emerald-400 rounded-2xl p-4 transition-all active:scale-[0.98]"
            >
              <p className="font-semibold text-slate-800">Body check-in only</p>
              <p className="text-sm text-slate-500 mt-0.5">Physical sensations and interoception</p>
            </button>
          </div>
        </div>
      )}

      {/* Step: Emotion matrix */}
      {step === "matrix" && (
        <div className="space-y-5">
          {/* Energy */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Energy level right now</p>
            <div className="flex gap-2 flex-wrap">
              {ENERGY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = energy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setEnergy(opt.value)}
                    className={cn(
                      "flex-1 min-w-[calc(20%-8px)] flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
                      active
                        ? "bg-sage-600 text-white border-sage-600"
                        : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                    )}
                  >
                    <Icon size={18} className={active ? "text-white" : opt.color} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pleasantness */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">How pleasant does this feel?</p>
            <div className="flex gap-2 flex-wrap">
              {PLEASANT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = pleasantness === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPleasantness(opt.value)}
                    className={cn(
                      "flex-1 min-w-[calc(20%-8px)] flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
                      active
                        ? "bg-sage-600 text-white border-sage-600"
                        : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                    )}
                  >
                    <Icon size={18} className={active ? "text-white" : opt.color} />
                    <span className="text-center">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual quadrant map */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Which emotions fit right now? (pick any)</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-stone-100 rounded-2xl p-3 border border-stone-200">
                <p className="text-xs font-semibold text-stone-600 mb-2">High energy, unpleasant</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(emotions).filter(([, v]) => v.y >= 4 && v.x <= 2).map(([name]) => (
                    <button key={name} onClick={() => toggleEmotion(name)}
                      className={cn("text-xs px-2 py-1 rounded-full transition-all", selectedEmotions.includes(name) ? "bg-stone-500 text-white" : "bg-cream-50 text-slate-600 border border-stone-200")}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-sage-50 rounded-2xl p-3 border border-sage-100">
                <p className="text-xs font-semibold text-sage-700 mb-2">High energy, pleasant</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(emotions).filter(([, v]) => v.y >= 4 && v.x >= 4).map(([name]) => (
                    <button key={name} onClick={() => toggleEmotion(name)}
                      className={cn("text-xs px-2 py-1 rounded-full transition-all", selectedEmotions.includes(name) ? "bg-sage-500 text-white" : "bg-cream-50 text-slate-600 border border-sage-200")}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Low energy, unpleasant</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(emotions).filter(([, v]) => v.y <= 2 && v.x <= 2).map(([name]) => (
                    <button key={name} onClick={() => toggleEmotion(name)}
                      className={cn("text-xs px-2 py-1 rounded-full transition-all", selectedEmotions.includes(name) ? "bg-slate-600 text-white" : "bg-cream-50 text-slate-600 border border-slate-200")}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 mb-2">Low energy, pleasant</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(emotions).filter(([, v]) => v.y <= 2 && v.x >= 4).map(([name]) => (
                    <button key={name} onClick={() => toggleEmotion(name)}
                      className={cn("text-xs px-2 py-1 rounded-full transition-all", selectedEmotions.includes(name) ? "bg-emerald-500 text-white" : "bg-cream-50 text-slate-600 border border-emerald-200")}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Middle / ND-specific */}
            <div className="mt-2 bg-stone-50 rounded-2xl p-3 border border-stone-200">
              <p className="text-xs font-semibold text-stone-600 mb-2">Neutral / ND-specific</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(emotions).filter(([, v]) => v.y === 3 || (v.x >= 2 && v.x <= 4 && v.y >= 2 && v.y <= 4)).map(([name]) => (
                  <button key={name} onClick={() => toggleEmotion(name)}
                    className={cn("text-xs px-2 py-1 rounded-full transition-all", selectedEmotions.includes(name) ? "bg-stone-500 text-white" : "bg-cream-50 text-stone-600 border border-stone-200")}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("flow")}
              className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition-all">
              Back
            </button>
            <button onClick={nextFromMatrix}
              className="flex-1 bg-sage-600 text-white font-semibold rounded-2xl py-3 hover:bg-sage-700 transition-all">
              {flow === "mood" ? "Next: Notes" : "Next: Body Check"} &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step: Body check */}
      {step === "body" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Body Check-In</h2>
            <p className="text-sm text-slate-500">Interoception: notice what you feel physically. This is a skill that can be practiced.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Where do you notice sensation?</p>
            <div className="grid grid-cols-4 gap-2">
              {bodyAreas.map((area) => (
                <button key={area} onClick={() => toggleArea(area)}
                  className={cn(
                    "py-2 px-3 rounded-xl text-sm font-medium transition-all border",
                    selectedAreas.includes(area)
                      ? "bg-sage-600 text-white border-sage-600"
                      : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                  )}>
                  {area}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Quick body prompts (tap any that apply)</p>
            <div className="flex flex-wrap gap-2">
              {bodyNotePrompts.map((p) => (
                <button key={p} onClick={() => setBodyNotes(prev => prev ? prev + ", " + p.replace("?", "") : p.replace("?", ""))}
                  className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full hover:bg-sage-100 hover:text-sage-700 transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Body notes (optional)</p>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
              rows={3}
              placeholder="Describe any physical sensations..."
              value={bodyNotes}
              onChange={(e) => setBodyNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={backFromBody}
              className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition-all">
              Back
            </button>
            <button onClick={() => setStep("notes")}
              className="flex-1 bg-sage-600 text-white font-semibold rounded-2xl py-3 hover:bg-sage-700 transition-all">
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step: Notes */}
      {step === "notes" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Any thoughts?</h2>
            <p className="text-sm text-slate-500">Optional. Just for you. No judgement here.</p>
          </div>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            rows={6}
            placeholder="What's on your mind? What happened today? What do you need?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
            <p className="text-sm font-semibold text-sage-700 mb-2">Your check-in summary</p>
            {(flow === "both" || flow === "mood") && (
              <>
                <p className="text-sm text-slate-600">Energy: <strong>{ENERGY_OPTIONS.find(o => o.value === energy)?.label}</strong></p>
                <p className="text-sm text-slate-600">Feeling: <strong>{PLEASANT_LABELS[pleasantness - 1]}</strong></p>
              </>
            )}
            {selectedEmotions.length > 0 && (
              <p className="text-sm text-slate-600">Emotions: <strong>{selectedEmotions.join(", ")}</strong></p>
            )}
            {selectedAreas.length > 0 && (
              <p className="text-sm text-slate-600">Body: <strong>{selectedAreas.join(", ")}</strong></p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={backFromNotes}
              className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition-all">
              Back
            </button>
            <button onClick={handleSubmit}
              className="flex-1 bg-sage-600 text-white font-semibold rounded-2xl py-3 hover:bg-sage-700 transition-all">
              Save Check-In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
