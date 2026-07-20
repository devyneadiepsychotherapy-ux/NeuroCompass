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
  ChevronDown,
  ChevronUp,
  Bell,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { EnergyLevel, PleasantnessLevel, MoodEntry } from "@/types";

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

const bodyAreas = ["Head", "Neck", "Shoulders", "Chest", "Stomach", "Hands", "Hips", "Legs", "Back", "Jaw", "Eyes", "Face"];
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
type StepType = "flow" | "energy" | "matrix" | "body" | "notes" | "done";

type CapacityLevel = "low" | "medium" | "high";
const CAPACITY_OPTIONS: { label: CapacityLevel; energyValue: EnergyLevel; color: string; bg: string }[] = [
  { label: "low",    energyValue: 2, color: "text-rose-500",   bg: "bg-rose-50 border-rose-200"   },
  { label: "medium", energyValue: 3, color: "text-stone-500",  bg: "bg-stone-50 border-stone-200" },
  { label: "high",   energyValue: 4, color: "text-sage-600",   bg: "bg-sage-50 border-sage-200"   },
];

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

// ---------------------------------------------------------------------------
// Past check-ins component
// ---------------------------------------------------------------------------

function PastCheckIns({ entries }: { entries: MoodEntry[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? entries : entries.slice(0, 5);

  const dot = (p: number) =>
    p >= 4 ? "bg-emerald-400" : p >= 3 ? "bg-stone-400" : "bg-rose-400";

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Past check-ins</p>
        <span className="text-xs text-slate-400">{entries.length} total</span>
      </div>

      <div className="space-y-2">
        {displayed.map((entry) => {
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} className="bg-cream-50 rounded-2xl border border-slate-100 overflow-hidden relative transition-colors hover:border-slate-200">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
                style={{ WebkitTapHighlightColor: "transparent" }}
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dot(entry.pleasantness))} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {PLEASANT_LABELS[entry.pleasantness - 1]}
                    {entry.emotions?.length > 0 && (
                      <span className="text-slate-400 font-normal"> · {entry.emotions.slice(0, 2).join(", ")}{entry.emotions.length > 2 ? ` +${entry.emotions.length - 2}` : ""}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(entry.timestamp).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {new Date(entry.timestamp).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {entry.energy && (
                    <span className="text-xs text-slate-400">{ENERGY_OPTIONS.find(o => o.value === entry.energy)?.label}</span>
                  )}
                  {isOpen ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                  {entry.energy && (
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">Energy:</span> {ENERGY_OPTIONS.find(o => o.value === entry.energy)?.label}
                    </p>
                  )}
                  {entry.emotions?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Emotions:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions.map((e) => (
                          <span key={e} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.bodyAreas && entry.bodyAreas.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Body areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.bodyAreas.map((a) => (
                          <span key={a} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.bodyNotes && (
                    <p className="text-xs text-slate-500 italic">{entry.bodyNotes}</p>
                  )}
                  {entry.notes && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-1">Notes:</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {entries.length > 5 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full text-xs text-slate-500 hover:text-slate-700 py-2 border border-slate-200 rounded-xl transition-all hover:bg-slate-50"
        >
          {showAll ? "Show fewer" : `Show all ${entries.length} check-ins`}
        </button>
      )}
    </div>
  );
}

// ── Check-in reminder settings ────────────────────────────────
function CheckInReminderSettings() {
  const { checkInReminders, updateCheckInReminder, addReminderTime, removeReminderTime, setReminderPermissionState } = useAppStore();
  const [open, setOpen] = useState(false);
  // Track which type is showing the "add time" input
  const [addingFor, setAddingFor] = useState<"mood" | "body" | "full" | null>(null);
  const [newTime, setNewTime] = useState("08:00");

  const TYPES = [
    { key: "mood" as const, label: "Mood check-in", sub: "How you're feeling emotionally" },
    { key: "body" as const, label: "Body check-in", sub: "Physical sensations" },
    { key: "full" as const, label: "Full check-in", sub: "Emotions, body scan, and notes" },
  ];

  const anyEnabled = TYPES.some((t) => checkInReminders[t.key].enabled);

  async function requestPermission() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setReminderPermissionState(result as "granted" | "denied" | "default");
  }

  function handleAddTime(key: "mood" | "body" | "full") {
    if (newTime) {
      addReminderTime(key, newTime);
      setAddingFor(null);
      setNewTime("08:00");
    }
  }

  return (
    <div className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <Bell size={16} className={`shrink-0 ${anyEnabled ? "text-sage-600" : "text-slate-400"}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">Reminders</p>
          <p className="text-xs text-slate-400">
            {anyEnabled
              ? TYPES.filter((t) => checkInReminders[t.key].enabled).map((t) => t.label).join(", ")
              : "Set daily reminder times"}
          </p>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">
          {/* Permission prompt */}
          {checkInReminders.permissionState !== "granted" && (
            <div className="bg-sage-50 border border-sage-100 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-600 flex-1">
                {checkInReminders.permissionState === "denied"
                  ? "Notifications blocked. Enable in device settings."
                  : "Allow notifications to get reminders when the app is closed."}
              </p>
              {checkInReminders.permissionState !== "denied" && (
                <button
                  onClick={requestPermission}
                  className="text-xs font-semibold text-sage-700 underline shrink-0"
                >
                  Allow
                </button>
              )}
            </div>
          )}

          {TYPES.map(({ key, label, sub }) => {
            const r = checkInReminders[key];
            return (
              <div key={key} className="space-y-2">
                {/* Header row: label + toggle */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                  <button
                    onClick={() => updateCheckInReminder(key, { enabled: !r.enabled })}
                    className={cn(
                      "w-10 h-6 rounded-full transition-all relative shrink-0",
                      r.enabled ? "bg-sage-500" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
                      r.enabled ? "left-[18px]" : "left-0.5"
                    )} />
                  </button>
                </div>

                {/* Time slots (only when enabled) */}
                {r.enabled && (
                  <div className="pl-0 space-y-1.5">
                    {r.times.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={t}
                          onChange={(e) => {
                            removeReminderTime(key, t);
                            addReminderTime(key, e.target.value);
                          }}
                          className="text-xs font-semibold text-sage-700 bg-white border border-sage-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-sage-400"
                        />
                        {r.times.length > 1 && (
                          <button
                            onClick={() => removeReminderTime(key, t)}
                            className="text-slate-300 hover:text-rose-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add time slot */}
                    {addingFor === key ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="text-xs font-semibold text-sage-700 bg-white border border-sage-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-sage-400"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddTime(key)}
                          className="text-xs font-semibold text-sage-600 bg-sage-50 border border-sage-200 rounded-lg px-2.5 py-1.5 hover:bg-sage-100 transition-all"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingFor(null); setNewTime("08:00"); }}
                          className="text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingFor(key); setNewTime("08:00"); }}
                        className="flex items-center gap-1 text-xs text-sage-600 font-medium hover:text-sage-700 transition-colors"
                      >
                        <Plus size={13} />
                        Add another time
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-xs text-slate-400">
            Reminders appear as banners when you open the app, or as native notifications if allowed above.
          </p>
        </div>
      )}
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
  const [areaDescriptions, setAreaDescriptions] = useState<Record<string, string>>({});
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
    const descParts = selectedAreas
      .filter((a) => areaDescriptions[a]?.trim())
      .map((a) => `${a}: ${areaDescriptions[a].trim()}`);
    const combinedBodyNotes = [...descParts, bodyNotes].filter(Boolean).join(" | ") || undefined;
    addMoodEntry({
      energy,
      pleasantness,
      emotions: selectedEmotions,
      bodyAreas: selectedAreas,
      bodyNotes: combinedBodyNotes,
      notes: notes || undefined,
    });
    addXP(10);
    triggerXp(10);
    setStep("done");
  };

  const startFlow = (selected: FlowType) => {
    setFlow(selected);
    setStep(selected === "body" ? "energy" : "matrix");
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
      setStep("energy");
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
    flow === "body" ? ["energy", "body", "notes"] :
    ["matrix", "body", "notes"];

  const recentEntries = moodEntries.slice(0, 5);

  const resetAll = () => {
    setStep("flow");
    setFlow("both");
    setSelectedEmotions([]);
    setSelectedAreas([]);
    setAreaDescriptions({});
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
            <div className="mt-1">
              <p className="text-sm text-slate-600 font-medium">Body areas:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedAreas.map((area) => (
                  <span key={area} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                    {areaDescriptions[area] ? `${area}: ${areaDescriptions[area]}` : area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-full">
          <PastCheckIns entries={moodEntries.slice(0, 5)} />
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
    <div className="px-4 pt-0 pb-8 space-y-6">
      <div className="pt-3 pb-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>Check-In</h1>
          <p className="text-sm text-slate-500 mt-1.5">No right or wrong answers, just notice.</p>
        </div>
        <Heart size={22} className="text-sage-500 shrink-0 mt-2" />
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
        <div className="space-y-3">
          {/* Full check-in : featured/primary */}
          <button
            onClick={() => startFlow("both")}
            className="w-full text-left rounded-2xl p-5 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--color-sage-50) 0%, var(--color-sage-100) 100%)" }}
          >
            <p className="text-base font-bold text-slate-800">Full check-in</p>
            <p className="text-sm text-slate-500 mt-0.5">Emotions, body scan, and notes</p>
          </button>
          {/* Quick options : smaller, side by side */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => startFlow("mood")}
              className="text-left bg-white border border-slate-100 rounded-2xl p-4 transition-all active:scale-[0.97] hover:border-sage-200"
            >
              <Heart size={16} className="text-sage-500 mb-2" />
              <p className="text-sm font-semibold text-slate-800">Mood only</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">How you&apos;re feeling</p>
            </button>
            <button
              onClick={() => startFlow("body")}
              className="text-left bg-white border border-slate-100 rounded-2xl p-4 transition-all active:scale-[0.97] hover:border-sage-200"
            >
              <Zap size={16} className="text-sage-500 mb-2" />
              <p className="text-sm font-semibold text-slate-800">Body only</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">Physical sensations</p>
            </button>
          </div>
        </div>
      )}

      {/* Reminder settings : collapsible, only on flow step */}
      {step === "flow" && <CheckInReminderSettings />}

      {/* Past check-ins : always visible on flow step */}
      {step === "flow" && moodEntries.length > 0 && (
        <PastCheckIns entries={moodEntries} />
      )}

      {/* Step: Energy (body-only flow) */}
      {step === "energy" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Energy Level</h2>
            <p className="text-sm text-slate-500">How is your physical and mental energy right now?</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CAPACITY_OPTIONS.map(({ label, energyValue, color, bg }) => {
              const active = energy === energyValue;
              return (
                <button
                  key={label}
                  onClick={() => { setEnergy(energyValue); setStep("body"); }}
                  className={cn(
                    "flex flex-col items-center gap-3 py-6 rounded-2xl border-2 font-semibold text-sm capitalize transition-all active:scale-[0.97]",
                    active ? `${bg} border-current ${color}` : "bg-cream-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  <span className="text-2xl">
                    {label === "low" ? "🔋" : label === "medium" ? "⚡" : "✨"}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("flow")}
              className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition-all">
              Back
            </button>
            <button onClick={() => setStep("body")}
              className="flex-1 border border-slate-200 text-slate-600 rounded-2xl py-3 font-semibold hover:bg-slate-50 transition-all text-sm">
              Skip energy &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step: Emotion matrix */}
      {step === "matrix" && (
        <div className="space-y-5">
          {/* Energy */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Energy Level</p>
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
            <div className="flex flex-wrap justify-center gap-2">
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
          {selectedAreas.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">How does each area feel? (optional)</p>
              {selectedAreas.map((area) => (
                <div key={area} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 w-[76px] shrink-0">{area}</span>
                  <input
                    type="text"
                    placeholder="How does it feel?"
                    value={areaDescriptions[area] ?? ""}
                    onChange={(e) => setAreaDescriptions((prev) => ({ ...prev, [area]: e.target.value }))}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-400 bg-stone-50"
                  />
                </div>
              ))}
            </div>
          )}

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
              <div className="mt-1">
                <p className="text-sm text-slate-600 font-medium">Body areas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedAreas.map((area) => (
                    <span key={area} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                      {areaDescriptions[area] ? `${area}: ${areaDescriptions[area]}` : area}
                    </span>
                  ))}
                </div>
                {bodyNotes.trim() && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">{bodyNotes}</p>
                )}
              </div>
            )}
            {selectedAreas.length === 0 && bodyNotes.trim() && (
              <p className="text-sm text-slate-600">Body notes: <strong>{bodyNotes}</strong></p>
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
