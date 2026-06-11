"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import { Tool } from "@/lib/tools-data";
import { ICON_MAP } from "@/lib/icon-map";
import { cn, getTodayKey } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Heart, X, CheckCircle, Copy, Trash2, RotateCcw, Plus, Rocket } from "lucide-react";

// ─────────────────────────────────────────────
// HELPER: Guided step-through widget
// ─────────────────────────────────────────────
function TapThrough({
  steps,
  completionMessage = "You did it.",
  actionLabel = "Done, next step",
  onComplete,
}: {
  steps: string[];
  completionMessage?: string;
  actionLabel?: string;
  onComplete?: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [complete, setComplete] = useState(false);

  if (complete) {
    return (
      <div className="bg-sage-50 rounded-2xl p-5 text-center border border-sage-100">
        <CheckCircle size={28} className="text-sage-500 mx-auto mb-2" />
        <p className="text-sage-700 font-semibold">{completionMessage}</p>
        <button
          onClick={() => { setCurrent(0); setComplete(false); }}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Start again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Step {current + 1} of {steps.length}</span>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn("w-1.5 h-1.5 rounded-full", i < current ? "bg-sage-400" : i === current ? "bg-sage-600" : "bg-slate-200")}
            />
          ))}
        </div>
      </div>
      <p className="text-slate-800 font-medium leading-relaxed">{steps[current]}</p>
      <button
        onClick={() => {
          if (current < steps.length - 1) {
            setCurrent((c) => c + 1);
          } else {
            setComplete(true);
            onComplete?.();
          }
        }}
        className="w-full bg-sage-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-sage-700 transition-all"
      >
        {current < steps.length - 1 ? actionLabel : "Complete"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPER: Small add-input + saved list pattern
// ─────────────────────────────────────────────
function SavedList({
  items,
  onAdd,
  onRemove,
  placeholder,
  emptyLabel,
  renderItem,
}: {
  items: { id: string }[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  placeholder: string;
  emptyLabel: string;
  renderItem: (item: { id: string }) => ReactNode;
}) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              onAdd(text.trim());
              setText("");
            }
          }}
        />
        <button
          onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(""); } }}
          className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">{emptyLabel}</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-2 bg-cream-50 border border-slate-100 rounded-xl px-3 py-2.5">
              <span className="text-sm text-slate-700 leading-relaxed flex-1">{renderItem(item)}</span>
              <button onClick={() => onRemove(item.id)} className="shrink-0 mt-0.5">
                <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TOOL SUB-COMPONENTS (need own useState)
// ─────────────────────────────────────────────

function EmotionWheelTool() {
  const cx = 200, cy = 200;
  const r1 = 55;   // core outer radius
  const r2 = 115;  // secondary outer radius
  const r3 = 188;  // tertiary outer radius

  const EMOTIONS = [
    { name: "Joy",      color: "#F6D56C", textColor: "#7A5A00", secondary: [
      { name: "Happy",       color: "#FBE897", tertiary: ["Joyful",     "Elated"]      },
      { name: "Content",     color: "#FAE0A0", tertiary: ["Peaceful",   "Satisfied"]   },
      { name: "Excited",     color: "#F8CF55", tertiary: ["Eager",      "Thrilled"]    },
    ]},
    { name: "Surprise", color: "#A8D8B9", textColor: "#2A5A3A", secondary: [
      { name: "Amazed",      color: "#BDE8CB", tertiary: ["Astonished", "Awed"]        },
      { name: "Confused",    color: "#C5E4D0", tertiary: ["Bewildered", "Perplexed"]   },
      { name: "Startled",    color: "#B0E0C4", tertiary: ["Shocked",    "Stunned"]     },
    ]},
    { name: "Fear",     color: "#9DC3E6", textColor: "#1A3D5C", secondary: [
      { name: "Anxious",     color: "#B4D0E8", tertiary: ["Worried",    "Nervous"]     },
      { name: "Scared",      color: "#A8C8E0", tertiary: ["Terrified",  "Helpless"]    },
      { name: "Overwhelmed", color: "#90B8DC", tertiary: ["Paralysed",  "Drained"]     },
    ]},
    { name: "Sadness",  color: "#B0C4DE", textColor: "#2A3B5C", secondary: [
      { name: "Lonely",      color: "#C0CFEA", tertiary: ["Isolated",   "Abandoned"]   },
      { name: "Grief",       color: "#B8CADF", tertiary: ["Devastated", "Crushed"]     },
      { name: "Hurt",        color: "#A8BCDA", tertiary: ["Wounded",    "Betrayed"]    },
    ]},
    { name: "Disgust",  color: "#B5C99A", textColor: "#3A4A2A", secondary: [
      { name: "Discomfort",  color: "#C4D6AE", tertiary: ["Uneasy",     "Revolted"]    },
      { name: "Repulsed",    color: "#BBC9A2", tertiary: ["Horrified",  "Nauseated"]   },
      { name: "Contempt",    color: "#A8BC90", tertiary: ["Scornful",   "Dismissive"]  },
    ]},
    { name: "Anger",    color: "#E8A09A", textColor: "#6A1A1A", secondary: [
      { name: "Frustrated",  color: "#EDB8B0", tertiary: ["Annoyed",    "Agitated"]    },
      { name: "Irritated",   color: "#E8AEA8", tertiary: ["Impatient",  "Resentful"]   },
      { name: "Furious",     color: "#E09090", tertiary: ["Enraged",    "Livid"]       },
    ]},
  ];

  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const n = EMOTIONS.length;
  const coreSlice = (2 * Math.PI) / n;

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  const describeRing = (cx: number, cy: number, ri: number, ro: number, start: number, end: number) => {
    const c1 = Math.cos(start), s1 = Math.sin(start);
    const c2 = Math.cos(end),   s2 = Math.sin(end);
    return [
      `M ${cx + ri * c1} ${cy + ri * s1}`,
      `L ${cx + ro * c1} ${cy + ro * s1}`,
      `A ${ro} ${ro} 0 0 1 ${cx + ro * c2} ${cy + ro * s2}`,
      `L ${cx + ri * c2} ${cy + ri * s2}`,
      `A ${ri} ${ri} 0 0 0 ${cx + ri * c1} ${cy + ri * s1} Z`,
    ].join(" ");
  };

  const radialLabel = (tx: number, ty: number, mid: number, text: string, size: number, fill: string, weight = "600") => {
    const deg = mid * 180 / Math.PI;
    return (
      <text
        x={tx} y={ty}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size} fontWeight={weight} fill={fill}
        transform={`rotate(${deg}, ${tx}, ${ty})`}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {text}
      </text>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">Tap a segment to identify how you feel</p>
      <div className="w-full">
        <svg viewBox="0 0 400 400" style={{ width: "100%", display: "block" }}>
          {EMOTIONS.map((emotion, i) => {
            const cStart = i * coreSlice - Math.PI / 2;
            const cEnd = cStart + coreSlice;
            const cMid = (cStart + cEnd) / 2;
            const isCore = selectedEmotion === emotion.name;
            const cTR = r1 * 0.65;

            return (
              <g key={emotion.name}>
                {/* Core slice */}
                <path
                  d={describeArc(cx, cy, r1, cStart, cEnd)}
                  fill={emotion.color} stroke="white" strokeWidth="2"
                  opacity={selectedEmotion && !isCore ? 0.35 : 1}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  onClick={() => setSelectedEmotion(isCore ? null : emotion.name)}
                />
                {radialLabel(cx + cTR * Math.cos(cMid), cy + cTR * Math.sin(cMid), cMid, emotion.name, 9, emotion.textColor)}

                {emotion.secondary.map((sec, j) => {
                  const secSlice = coreSlice / emotion.secondary.length;
                  const sStart = cStart + j * secSlice;
                  const sEnd = sStart + secSlice;
                  const sMid = (sStart + sEnd) / 2;
                  const isSec = selectedEmotion === sec.name;
                  const sTR = r1 + (r2 - r1) * 0.5;

                  return (
                    <g key={sec.name}>
                      <path
                        d={describeRing(cx, cy, r1 + 1, r2, sStart, sEnd)}
                        fill={sec.color} stroke="white" strokeWidth="1.5"
                        opacity={selectedEmotion && !isSec ? 0.35 : 1}
                        style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                        onClick={() => setSelectedEmotion(isSec ? null : sec.name)}
                      />
                      {radialLabel(cx + sTR * Math.cos(sMid), cy + sTR * Math.sin(sMid), sMid, sec.name, 6.5, "#333")}

                      {sec.tertiary.map((ter, k) => {
                        const terSlice = secSlice / sec.tertiary.length;
                        const tStart = sStart + k * terSlice;
                        const tEnd = tStart + terSlice;
                        const tMid = (tStart + tEnd) / 2;
                        const isTer = selectedEmotion === ter;
                        const tTR = r2 + (r3 - r2) * 0.5;

                        return (
                          <g key={ter}>
                            <path
                              d={describeRing(cx, cy, r2 + 1, r3, tStart, tEnd)}
                              fill={sec.color + "99"} stroke="white" strokeWidth="1"
                              opacity={selectedEmotion && !isTer ? 0.35 : 1}
                              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                              onClick={() => setSelectedEmotion(isTer ? null : ter)}
                            />
                            {radialLabel(cx + tTR * Math.cos(tMid), cy + tTR * Math.sin(tMid), tMid, ter, 5.5, "#444", "500")}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* Center circle */}
          <circle cx={cx} cy={cy} r="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
        </svg>
      </div>
      {selectedEmotion ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-center">
          <p className="text-xl font-bold text-slate-800">{selectedEmotion}</p>
          <p className="text-sm text-slate-500 mt-1">That&apos;s what you&apos;re noticing.</p>
          <button onClick={() => setSelectedEmotion(null)} className="mt-2 text-xs text-slate-400 underline">Clear</button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center">Tap any segment to identify how you feel</p>
      )}
    </div>
  );
}

function EmotionMatrixTool() {
  const [marker, setMarker] = useState<{ qx: number; qy: number; px: number; py: number } | null>(null);
  const QUADRANTS = [
    { qx: 0, qy: 1, label: "High energy\nUnpleasant", sublabel: "Tense / Anxious", bg: "#FBF0EE", border: "#E8C4BC" },
    { qx: 1, qy: 1, label: "High energy\nPleasant",   sublabel: "Excited / Happy", bg: "#F0F7EF", border: "#B8D4B5" },
    { qx: 0, qy: 0, label: "Low energy\nUnpleasant",  sublabel: "Sad / Bored",     bg: "#F0F2F8", border: "#C0CAE0" },
    { qx: 1, qy: 0, label: "Low energy\nPleasant",    sublabel: "Calm / Content",  bg: "#F8F5EF", border: "#D8CEB8" },
  ];

  const handleQuadrantClick = (e: React.MouseEvent<HTMLDivElement>, qx: number, qy: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setMarker({ qx, qy, px, py });
  };

  const activeQ = marker ? QUADRANTS.find(q => q.qx === marker.qx && q.qy === marker.qy) : null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">Where are you right now?</p>
        <p className="text-xs text-slate-500">Tap anywhere in a quadrant to place yourself</p>
      </div>
      <div className="relative">
        <div className="text-center text-xs text-slate-400 mb-1 font-medium">↑ High Energy</div>
        <div className="flex items-center gap-1">
          <div className="text-xs text-slate-400 font-medium w-14 text-center leading-tight flex-shrink-0"
            style={{ writingMode: "vertical-rl" as const, transform: "rotate(180deg)", height: 140 }}>
            Unpleasant ←
          </div>
          <div className="flex-1 grid grid-cols-2 gap-1">
            {QUADRANTS.map((q) => (
              <div key={`${q.qx}-${q.qy}`}
                className="relative rounded-xl border cursor-pointer select-none overflow-hidden"
                style={{ height: 120, background: q.bg, borderColor: q.border }}
                onClick={(e) => handleQuadrantClick(e, q.qx, q.qy)}>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  <p className="text-xs font-semibold text-slate-600 text-center leading-tight whitespace-pre-line">{q.label}</p>
                  <p className="text-[10px] text-slate-400 text-center mt-0.5">{q.sublabel}</p>
                </div>
                {marker && marker.qx === q.qx && marker.qy === q.qy && (
                  <div className="absolute w-5 h-5 rounded-full bg-slate-700 border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${marker.px}%`, top: `${marker.py}%` }} />
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 font-medium w-14 text-center leading-tight flex-shrink-0"
            style={{ writingMode: "vertical-rl" as const, height: 140 }}>
            → Pleasant
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 mt-1 font-medium">↓ Low Energy</div>
      </div>
      {activeQ ? (
        <div className="rounded-2xl px-5 py-4 text-center border" style={{ background: activeQ.bg, borderColor: activeQ.border }}>
          <p className="text-base font-bold text-slate-800">{activeQ.sublabel}</p>
          <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{activeQ.label}</p>
          <button onClick={() => setMarker(null)} className="mt-2 text-xs text-slate-400 underline">Clear</button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center">Tap a quadrant to mark where you are</p>
      )}
    </div>
  );
}

function FeelingsThermometerTool() {
  const [level, setLevel] = useState<number | null>(null);
  const LEVELS = [
    { n: 1,  label: "Calm",        color: "#6DB56D" },
    { n: 2,  label: "Peaceful",    color: "#7EC07E" },
    { n: 3,  label: "Relaxed",     color: "#8FCC8F" },
    { n: 4,  label: "Okay",        color: "#C4CC7A" },
    { n: 5,  label: "Unsettled",   color: "#D9CC66" },
    { n: 6,  label: "Worried",     color: "#E8C46A" },
    { n: 7,  label: "Anxious",     color: "#E8A85A" },
    { n: 8,  label: "Stressed",    color: "#E87A5A" },
    { n: 9,  label: "Overwhelmed", color: "#D85A4A" },
    { n: 10, label: "Crisis",      color: "#C03030" },
  ];
  const activeLevel = level !== null ? LEVELS[level - 1] : null;
  // Tube spans y=18 to y=228 (height=210). Fill rises from y=228 upward.
  const TUBE_TOP = 18;
  const TUBE_BOTTOM = 228;
  const TUBE_H = TUBE_BOTTOM - TUBE_TOP; // 210
  const BULB_CY = 256;
  const BULB_R = 22;
  const fillHeight = level !== null ? (level / 10) * TUBE_H : 0;
  const mercuryTop = TUBE_BOTTOM - fillHeight;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">How intense does this feeling feel?</p>
      <div className="flex items-start justify-center gap-4">

        {/* ── Actual thermometer SVG ── */}
        <svg width="72" height="300" viewBox="0 0 72 300" style={{ flexShrink: 0 }}>
          <defs>
            {/* Clip path = tube + bulb combined so mercury flows seamlessly */}
            <clipPath id="therm-clip">
              <rect x="27" y={TUBE_TOP} width="18" height={TUBE_H + 4} rx="9" />
              <circle cx="36" cy={BULB_CY} r={BULB_R} />
            </clipPath>
          </defs>

          {/* Glass tube — empty background */}
          <rect x="27" y={TUBE_TOP} width="18" height={TUBE_H} rx="9"
            fill="#F0F0F0" stroke="#D0D0D0" strokeWidth="1.5" />

          {/* Bulb — empty background */}
          <circle cx="36" cy={BULB_CY} r={BULB_R}
            fill="#E4E4E4" stroke="#D0D0D0" strokeWidth="1.5" />

          {/* Mercury fill — clipped to tube+bulb shape */}
          <g clipPath="url(#therm-clip)">
            <rect
              x="20" y={mercuryTop}
              width="32" height={300 - mercuryTop}
              fill={activeLevel?.color ?? "#E4E4E4"}
              style={{ transition: "y 0.4s ease, height 0.4s ease, fill 0.4s ease" }}
            />
          </g>

          {/* Tube outline drawn over fill */}
          <rect x="27" y={TUBE_TOP} width="18" height={TUBE_H} rx="9"
            fill="none" stroke="#C0C0C0" strokeWidth="1.5" />
          {/* Bulb outline drawn over fill */}
          <circle cx="36" cy={BULB_CY} r={BULB_R}
            fill="none" stroke="#C0C0C0" strokeWidth="1.5" />

          {/* Glass shine (left highlight stripe) */}
          <rect x="29.5" y={TUBE_TOP + 4} width="5" height={TUBE_H - 8} rx="2.5"
            fill="white" opacity="0.5" />

          {/* Tick marks */}
          {LEVELS.map((l) => {
            const y = TUBE_BOTTOM - (l.n / 10) * TUBE_H;
            return (
              <g key={l.n}>
                <line x1="45" y1={y} x2={l.n % 5 === 0 ? 54 : 50} y2={y}
                  stroke="#B0B0B0" strokeWidth={l.n % 5 === 0 ? 1.5 : 1} />
                {l.n % 5 === 0 && (
                  <text x="57" y={y + 3.5} fontSize="9" fill="#999" fontWeight="600">{l.n}</text>
                )}
              </g>
            );
          })}

          {/* Level number inside bulb */}
          <text x="36" y={BULB_CY + 5} textAnchor="middle" fontSize="13"
            fill={level !== null ? "white" : "#bbb"} fontWeight="800">
            {level ?? "·"}
          </text>
        </svg>

        {/* Level buttons */}
        <div className="flex flex-col gap-1.5 pt-1">
          {[...LEVELS].reverse().map((l) => {
            const active = level === l.n;
            return (
              <button key={l.n} onClick={() => setLevel(l.n)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? l.color + "28" : "#f8f8f8",
                  border: `1.5px solid ${active ? l.color : "#e5e7eb"}`,
                  minWidth: 148,
                }}>
                <span className="text-sm font-bold w-4 text-slate-400">{l.n}</span>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="text-xs font-semibold" style={{ color: active ? "#333" : "#777" }}>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeLevel ? (
        <div className="rounded-2xl px-5 py-4 text-center border"
          style={{ background: activeLevel.color + "15", borderColor: activeLevel.color + "55" }}>
          <p className="text-3xl font-bold" style={{ color: activeLevel.color }}>{level}</p>
          <p className="text-base font-semibold text-slate-800 mt-0.5">{activeLevel.label}</p>
          <button onClick={() => setLevel(null)} className="mt-2 text-xs text-slate-400 underline">Clear</button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center">Tap a level to fill the thermometer</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────
export function ToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const {
    toggleFavorite, isFavorite,
    dopamineMenuItems, addDopamineMenuItem, removeDopamineMenuItem,
    rewardLadder, addRewardLadderItem, removeRewardLadderItem,
    attentionAnchors, addAttentionAnchor, removeAttentionAnchor,
    timeAnchorsData, addTimeAnchor, removeTimeAnchor,
    mvscList, addMVSCItem, removeMVSCItem, toggleMVSCToday,
    habitStacks, addHabitStack, removeHabitStack,
    boundaryScripts, addBoundaryScript, removeBoundaryScript,
    burnoutRecoveryPlan, updateBurnoutRecoveryPlan,
    addBurnoutPhase2Activity, updateBurnoutPhase2Activity, removeBurnoutPhase2Activity,
    sensoryContingencyPlan, updateSensoryContingencyPlan,
    energyLog, addEnergyLogEntry, removeEnergyLogEntry,
    energyDrains, addEnergyDrain, removeEnergyDrain,
    energyRestorers, addEnergyRestorer, removeEnergyRestorer,
    arfidAccommodations, addArfidAccommodation, removeArfidAccommodation,
    savedNDMeals, toggleSavedNDMeal,
    focusRitual, setFocusRitual,
    sensoryDiet, setSensoryDiet,
    easyFoodList, setEasyFoodList,
    eatingRoutine, setEatingRoutine,
    personalBurnoutSigns, addPersonalBurnoutSign, removePersonalBurnoutSign,
  } = useAppStore();

  const fav = isFavorite(tool.id);
  const isBrainDump = tool.id === "brain-dump";
  const hasTimer = !!tool.content.timerMinutes;
  const defaultSeconds = (tool.content.timerMinutes ?? 25) * 60;

  // ── Main timer state ──────────────────────
  const [timerSeconds, setTimerSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  // ── Brain dump state ──────────────────────
  const [brainDumpText, setBrainDumpText] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── General step checklist ────────────────
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const [promptResponses, setPromptResponses] = useState<Record<number, string>>({});

  // ── time-timer: working-on label ──────────
  const [workingOn, setWorkingOn] = useState("");

  // ── body-double: partner name ─────────────
  const [bdWith, setBdWith] = useState("");

  // ── time-blocking: session blocks ─────────
  const [blocks, setBlocks] = useState<Array<{ id: string; time: string; task: string; color: string }>>([]);
  const [blkTime, setBlkTime] = useState("");
  const [blkTask, setBlkTask] = useState("");
  const [blkColor, setBlkColor] = useState("blue");

  // ── time-anchors: add form ────────────────
  const [taLabel, setTaLabel] = useState("");
  const [taTime, setTaTime] = useState("");

  // ── task-breakdown: dynamic steps ─────────
  const [tbMain, setTbMain] = useState("");
  const [tbSteps, setTbSteps] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [tbNew, setTbNew] = useState("");

  // ── weekly-review: textarea per step ─────
  const [wrAnswers, setWrAnswers] = useState<Record<number, string>>({});

  // ── pause-practice: 90s breathing timer ──
  const [ppSec, setPpSec] = useState(90);
  const [ppRunning, setPpRunning] = useState(false);
  const [ppDone, setPpDone] = useState(false);

  // ── urge-surfing: custom timer ────────────
  const [usSec, setUsSec] = useState(20 * 60);
  const [usRunning, setUsRunning] = useState(false);
  const [usDone, setUsDone] = useState(false);
  const [usTotal, setUsTotal] = useState(20 * 60);

  // ── pomodoro: session tracking ────────────
  const [pomSessions, setPomSessions] = useState(0);
  const [pomMode, setPomMode] = useState<"work" | "break">("work");
  const prevTimerDone = useRef(false);

  // ── dopamine-menu: add form ───────────────
  const [dmCat, setDmCat] = useState("Appetizers");
  const [dmText, setDmText] = useState("");

  // ── reward-ladder: add form ───────────────
  const [rlLevel, setRlLevel] = useState("small");
  const [rlTask, setRlTask] = useState("");
  const [rlReward, setRlReward] = useState("");

  // ── attention-anchors: add text ───────────
  const [aaText, setAaText] = useState("");

  // ── self-care-minimum: add form ───────────
  const [mvscNew, setMvscNew] = useState("");

  // ── habit-stack: add form ─────────────────
  const [hsAnchor, setHsAnchor] = useState("");
  const [hsNew, setHsNew] = useState("");

  // ── boundary-scripts: add form ───────────
  const [bsText, setBsText] = useState("");

  // ── needs-inventory: session checklist ───
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set());
  const [customNeed, setCustomNeed] = useState("");
  const [extraNeeds, setExtraNeeds] = useState<string[]>([]);

  // ── burnout-signs: symptom checklist ─────
  const [burnoutChecked, setBurnoutChecked] = useState<Set<number>>(new Set());

  // ── energy log: add form ──────────────────
  const [elLabel, setElLabel] = useState("");
  const [elType, setElType] = useState<"drain" | "restore">("drain");

  // ── energy profile: add form ──────────────
  const [epDrainLabel, setEpDrainLabel] = useState("");
  const [epDrainValue, setEpDrainValue] = useState<number>(5);
  const [epRestoreLabel, setEpRestoreLabel] = useState("");
  const [epRestoreValue, setEpRestoreValue] = useState<number>(5);

  // ── body-scan: step-by-step ───────────────
  const [bsStep, setBsStep] = useState(0);
  const [bsNotes, setBsNotes] = useState<Record<number, string>>({});
  const [bsComplete, setBsComplete] = useState(false);

  // ── thirst-hunger: daily check-in ────────
  const [ate, setAte] = useState(false);
  const [drank, setDrank] = useState(false);
  const [checkedHunger, setCheckedHunger] = useState(false);

  // ── reflection textareas (per step) ──────
  const [rsdAnswers, setRsdAnswers] = useState<Record<number, string>>({});
  const [maskAnswers, setMaskAnswers] = useState<Record<number, string>>({});
  const [fawnAnswers, setFawnAnswers] = useState<Record<number, string>>({});

  // ── done-better-perfect: shipped! ────────
  const [shipped, setShipped] = useState(false);

  // ── arfid-support: checked accommodations (session) + new item ──
  const [arfidChecked, setArfidChecked] = useState<Set<string>>(new Set());
  const [arfidNew, setArfidNew] = useState("");

  // ── nd-meals: active tab + custom meal input ──
  const [ndMealsTab, setNdMealsTab] = useState<"browse" | "saved">("browse");
  const [ndCustomMeal, setNdCustomMeal] = useState("");

  // ── focus-ritual: persisted ritual textarea ────────────
  const [focusRitualDraft, setFocusRitualDraft] = useState(focusRitual);

  // ── sensory-diet: per-category custom inputs ──────────
  const [sdCustomInputs, setSdCustomInputs] = useState<Record<string, string>>({});

  // ── easy-food: per-category custom inputs ─────────────
  const [efCustomInputs, setEfCustomInputs] = useState<Record<string, string>>({});

  // ── eating-routine: persisted textarea ────────────────
  const [eatingRoutineDraft, setEatingRoutineDraft] = useState(eatingRoutine);

  // ── burnout-signs: personal warning sign input ────────
  const [burnoutSignDraft, setBurnoutSignDraft] = useState("");

  // ── burnout-recovery: phase 1 custom drop item input ──
  const [brDropCustomInput, setBrDropCustomInput] = useState("");
  // ── burnout-recovery: phase 2 new activity input ──────
  const [brP2NewActivity, setBrP2NewActivity] = useState("");

  // ── sensory-contingency-plan: contact inputs ──────────
  const [scpContactDraft, setScpContactDraft] = useState({ name: "", phone: "", notes: "" });
  // ── sensory-contingency-plan: custom warning / soother inputs ──
  const [scpWarnCustomInput, setScpWarnCustomInput] = useState("");
  const [scpSoothCustomInput, setScpSoothCustomInput] = useState("");

  // ── thirst-hunger-cues: session cue checkboxes ────────
  const [thirstCues, setThirstCues] = useState<Set<string>>(new Set());
  const [hungerCues, setHungerCues] = useState<Set<string>>(new Set());

  // ─────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────

  // Main timer countdown
  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) { setRunning(false); setTimerDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Auto-start timer for chore-hack (2-minute reset)
  useEffect(() => {
    if (tool.id !== "chore-hack") return;
    const t = setTimeout(() => setRunning(true), 600);
    return () => clearTimeout(t);
  }, [tool.id]);

  // Pomodoro session tracking
  useEffect(() => {
    if (!tool.id.includes("pomodoro")) return;
    if (timerDone && !prevTimerDone.current && pomMode === "work") {
      setPomSessions((s) => s + 1);
    }
    prevTimerDone.current = timerDone;
  }, [timerDone, pomMode, tool.id]);

  // Pause-practice timer
  useEffect(() => {
    if (!ppRunning) return;
    const id = setInterval(() => {
      setPpSec((s) => {
        if (s <= 1) { setPpRunning(false); setPpDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [ppRunning]);

  // Urge-surfing timer
  useEffect(() => {
    if (!usRunning) return;
    const id = setInterval(() => {
      setUsSec((s) => {
        if (s <= 1) { setUsRunning(false); setUsDone(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [usRunning]);

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────
  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const resetTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setRunning(false);
    setTimerDone(false);
  };

  const timerProgress = defaultSeconds > 0 ? ((defaultSeconds - timerSeconds) / defaultSeconds) * 100 : 0;

  const toggleStep = (i: number) =>
    setStepsDone((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const handleCopy = () => {
    navigator.clipboard.writeText(brainDumpText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    if (confirmClear) { setBrainDumpText(""); setConfirmClear(false); }
    else setConfirmClear(true);
  };

  // Breathing circle for pause-practice
  const ppElapsed = 90 - ppSec;
  const ppCycle = ppRunning ? ppElapsed % 12 : 0;
  const ppScale = ppRunning
    ? ppCycle < 4 ? 0.7 + (ppCycle / 4) * 0.6
    : ppCycle < 6 ? 1.3
    : 1.3 - ((ppCycle - 6) / 6) * 0.6
    : 0.8;
  const ppBreathText = !ppRunning ? "" : ppCycle < 4 ? "Breathe in..." : ppCycle < 6 ? "Hold..." : "Breathe out...";

  // Wave progress for urge-surfing
  const usProgress = usTotal > 0 ? ((usTotal - usSec) / usTotal) * 100 : 0;
  const usPhaseText = usProgress < 40 ? "The urge is rising..." : usProgress < 70 ? "At its peak. You are still here." : "Beginning to ease. Keep going.";

  // Energy log for today
  const today = getTodayKey();
  const todayEnergy = energyLog.filter((e) => e.date === today);
  const drains = todayEnergy.filter((e) => e.type === "drain").length;
  const restores = todayEnergy.filter((e) => e.type === "restore").length;

  // Burnout compassionate response
  const burnoutCount = burnoutChecked.size;
  const burnoutResponse =
    burnoutCount === 0 ? "Checking in is wise. No major warning signs right now."
    : burnoutCount <= 2 ? "A few signs showing. Build in extra rest where you can."
    : burnoutCount <= 3 ? "Several warning signs. Consider reducing demands soon."
    : "Most warning signs present. Please prioritize rest and support right now. You matter.";

  // MVSC today check
  const mvscTodayDone = (id: string) => {
    const item = mvscList.find((i) => i.id === id);
    return item ? item.completedDates.includes(today) : false;
  };

  // Predefined needs for needs-inventory
  const PREDEFINED_NEEDS = [
    "Rest", "Sleep", "Food", "Water", "Movement", "Quiet time",
    "Connection", "Alone time", "Creativity", "Play", "Help",
    "Validation", "Routine", "Stimulation", "Safety", "Comfort",
  ];

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(need)) next.delete(need); else next.add(need);
      return next;
    });
  };

  // Dopamine menu categories matching tool variants
  const DM_CATS = ["Appetizers", "Main courses", "Desserts", "Sides"];

  // Reward ladder levels
  const RL_LEVELS = ["small", "medium", "big"];

  // Block color options
  const BLOCK_COLORS: Record<string, string> = {
    blue: "bg-blue-100 border-blue-200 text-blue-700",
    purple: "bg-purple-100 border-purple-200 text-purple-700",
    green: "bg-sage-100 border-sage-200 text-sage-700",
    amber: "bg-stone-100 border-stone-200 text-stone-600",
  };
  const BLOCK_LABELS: Record<string, string> = { blue: "Admin", purple: "Creative", green: "Recovery", amber: "Other" };

  // Sensory diet categories and predefined activities
  const SENSORY_DIET_CATS = [
    { key: "proprioceptive", label: "Proprioceptive", desc: "Deep pressure and heavy work",
      activities: ["Weighted blanket", "Wall push-ups", "Carrying heavy items", "Squeezing a stress ball", "Jumping or bouncing", "Stretching"] },
    { key: "vestibular", label: "Vestibular", desc: "Movement and balance",
      activities: ["Gentle rocking", "Swinging", "Walking", "Lying flat and still", "Slow swaying", "Head rolls"] },
    { key: "tactile", label: "Tactile", desc: "Touch and texture",
      activities: ["Fidget toys", "Soft fabric", "Warm bath or shower", "Smooth stones or putty", "Self-massage", "Sand or sensory bin"] },
    { key: "auditory", label: "Auditory", desc: "Sound regulation",
      activities: ["White noise", "Lo-fi music", "Silence", "Nature sounds", "Noise-cancelling headphones", "Upbeat energising music"] },
    { key: "visual", label: "Visual", desc: "Sight and environment",
      activities: ["Dim lighting", "Natural light", "Nature imagery", "Tidy uncluttered space", "Soft warm colours", "Candles or fairy lights"] },
    { key: "oral", label: "Oral", desc: "Taste and oral input",
      activities: ["Chewing gum", "Crunchy snacks", "Warm drinks", "Sour candy", "Strong mints", "Sucking on ice"] },
  ];

  // Easy food categories with starter suggestions
  const EASY_FOOD_CATS = [
    { key: "no-cook", label: "No-cook options",
      suggestions: ["Cheese and crackers", "Yogurt", "Fresh fruit", "Deli meat", "Cereal with milk", "Nut butter on bread", "Hummus and veg", "Granola bar"] },
    { key: "five-minute", label: "5-minute meals",
      suggestions: ["Scrambled eggs", "Instant noodles", "Toast with toppings", "Microwaved beans", "Frozen meal", "Tinned soup", "Microwave rice with anything"] },
    { key: "comfort", label: "Comfort foods",
      suggestions: ["Mac and cheese", "Toast with butter", "Soup", "Plain pasta", "Rice with soy sauce", "Bowl of cereal", "Grilled cheese"] },
    { key: "safe", label: "My safe foods", suggestions: [] },
  ];

  // Thirst and hunger cue lists for thirst-hunger-cues tool
  const THIRST_CUES = ["Dry mouth or lips", "Headache", "Brain fog", "Feeling irritable", "Dark urine", "Haven't needed the bathroom recently"];
  const HUNGER_CUES = ["Stomach growling", "Low energy or fatigue", "Difficulty concentrating", "Irritability or mood shift", "Light-headedness", "Thinking about food"];

  // Sensory diet helpers
  const toggleSensoryDietItem = (cat: string, item: string) => {
    const current = sensoryDiet[cat] ?? [];
    const next = current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
    setSensoryDiet({ ...sensoryDiet, [cat]: next });
  };
  const addSensoryDietCustom = (cat: string, item: string) => {
    const current = sensoryDiet[cat] ?? [];
    if (!current.includes(item)) setSensoryDiet({ ...sensoryDiet, [cat]: [...current, item] });
  };

  // Easy food helpers
  const toggleEasyFoodItem = (cat: string, item: string) => {
    const current = easyFoodList[cat] ?? [];
    const next = current.includes(item) ? current.filter((x) => x !== item) : [...current, item];
    setEasyFoodList({ ...easyFoodList, [cat]: next });
  };
  const addEasyFoodCustom = (cat: string, item: string) => {
    const current = easyFoodList[cat] ?? [];
    if (!current.includes(item)) setEasyFoodList({ ...easyFoodList, [cat]: [...current, item] });
  };

  // ─────────────────────────────────────────
  // SUPPRESS DEFAULTS FOR SPECIFIC TOOLS
  // (tools where we render steps differently in the interactive panel)
  // ─────────────────────────────────────────
  const suppressDefaultSteps = ["fawn-response", "rsd-perfectionism", "masking-costs", "weekly-review", "body-scan", "burnout-signs", "focus-ritual", "easy-food", "eating-routine", "emotion-wheel", "emotion-matrix", "feelings-thermometer"].includes(tool.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="bg-cream-50 rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-cream-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(() => { const IC = ICON_MAP[tool.icon]; return IC ? <IC size={20} className="text-sage-600" /> : null; })()}
            <h2 className="font-bold text-slate-800 text-lg">{tool.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(tool.id)}
              className={cn("p-2 rounded-xl transition-all", fav ? "text-rose-500" : "text-slate-300 hover:text-rose-400")}
            >
              <Heart size={20} fill={fav ? "currentColor" : "none"} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 pb-24">

          {/* Intro */}
          {tool.content.intro && !isBrainDump && (
            <p className="text-slate-600 leading-relaxed">{tool.content.intro}</p>
          )}

          {/* ══════════════════════════════════
              INTERACTIVE PANELS BY TOOL ID
              ══════════════════════════════════ */}

          {/* ── time-timer: working-on label ── */}
          {tool.id === "time-timer" && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Working on:</p>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="What are you working on right now?"
                value={workingOn}
                onChange={(e) => setWorkingOn(e.target.value)}
              />
              {workingOn && running && (
                <div className="bg-sage-50 border border-sage-100 rounded-xl px-4 py-2 text-center">
                  <p className="text-sm text-sage-700 font-medium">Working on: {workingOn}</p>
                </div>
              )}
            </div>
          )}

          {/* ── time-anchors: saved anchors + add form ── */}
          {tool.id === "time-anchors" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My day anchors</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="Anchor label (e.g. Lunch)"
                  value={taLabel}
                  onChange={(e) => setTaLabel(e.target.value)}
                />
                <input
                  type="time"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  value={taTime}
                  onChange={(e) => setTaTime(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (taLabel.trim() && taTime) {
                      addTimeAnchor(taLabel.trim(), taTime);
                      setTaLabel(""); setTaTime("");
                    }
                  }}
                  className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              {timeAnchorsData.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No anchors yet. Add one above.</p>
              ) : (
                <div className="space-y-1.5">
                  {timeAnchorsData
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((anchor) => (
                      <div key={anchor.id} className="flex items-center justify-between bg-cream-50 border border-slate-100 rounded-xl px-3 py-2.5">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{anchor.label}</span>
                          <span className="text-xs text-slate-400 ml-2">{anchor.time}</span>
                        </div>
                        <button onClick={() => removeTimeAnchor(anchor.id)}>
                          <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── time-blocking: day block builder ── */}
          {tool.id === "time-blocking" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Today's blocks</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="time"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  value={blkTime}
                  onChange={(e) => setBlkTime(e.target.value)}
                />
                <input
                  className="flex-1 min-w-0 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="What is this block for?"
                  value={blkTask}
                  onChange={(e) => setBlkTask(e.target.value)}
                />
                <select
                  className="border border-slate-200 rounded-xl px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-cream-50"
                  value={blkColor}
                  onChange={(e) => setBlkColor(e.target.value)}
                >
                  {Object.entries(BLOCK_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (blkTask.trim()) {
                      setBlocks((b) => [...b, { id: Math.random().toString(36).slice(2), time: blkTime, task: blkTask.trim(), color: blkColor }]);
                      setBlkTask(""); setBlkTime("");
                    }
                  }}
                  className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              {blocks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No blocks yet. Build your day above.</p>
              ) : (
                <div className="space-y-1.5">
                  {blocks
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((blk) => (
                      <div key={blk.id} className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl border", BLOCK_COLORS[blk.color])}>
                        <div className="flex items-center gap-2">
                          {blk.time && <span className="text-xs font-mono font-medium opacity-70">{blk.time}</span>}
                          <span className="text-sm font-medium">{blk.task}</span>
                          <span className="text-xs opacity-60">{BLOCK_LABELS[blk.color]}</span>
                        </div>
                        <button onClick={() => setBlocks((b) => b.filter((x) => x.id !== blk.id))}>
                          <Trash2 size={13} className="opacity-50 hover:opacity-80 transition-opacity" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── body-double: partner + affirming message ── */}
          {tool.id === "body-double" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Who are you working with?</p>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="Name, virtual session, study-with-me video..."
                value={bdWith}
                onChange={(e) => setBdWith(e.target.value)}
              />
              {running && (
                <div className="bg-sage-50 border border-sage-100 rounded-xl px-4 py-3 text-center">
                  <p className="text-sm text-sage-700 font-medium">
                    {bdWith ? `You are not alone. ${bdWith} is with you.` : "You are not alone. Keep going."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── task-initiation: guided step-through ── */}
          {tool.id === "task-initiation" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Guided mode</p>
              <TapThrough
                steps={tool.content.steps}
                completionMessage="You started. That was the hardest part."
                actionLabel="I did this, next step"
              />
            </div>
          )}

          {/* ── dopamine-menu: personal menu builder ── */}
          {tool.id === "dopamine-menu" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My personal menu</p>
              <div className="flex gap-2">
                <select
                  className="border border-slate-200 rounded-xl px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-cream-50"
                  value={dmCat}
                  onChange={(e) => setDmCat(e.target.value)}
                >
                  {DM_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="Add your own item..."
                  value={dmText}
                  onChange={(e) => setDmText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && dmText.trim()) { addDopamineMenuItem(dmCat, dmText.trim()); setDmText(""); }
                  }}
                />
                <button
                  onClick={() => { if (dmText.trim()) { addDopamineMenuItem(dmCat, dmText.trim()); setDmText(""); } }}
                  className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              {dopamineMenuItems.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Your personal items will appear here.</p>
              ) : (
                <div className="space-y-1">
                  {DM_CATS.map((cat) => {
                    const catItems = dopamineMenuItems.filter((i) => i.category === cat);
                    if (!catItems.length) return null;
                    return (
                      <div key={cat}>
                        <p className="text-xs text-slate-400 font-medium mt-2 mb-1">{cat}</p>
                        {catItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 mb-1">
                            <span className="text-sm text-slate-700">{item.text}</span>
                            <button onClick={() => removeDopamineMenuItem(item.id)}>
                              <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── reward-ladder: build your ladder ── */}
          {tool.id === "reward-ladder" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My reward ladder</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    className="border border-slate-200 rounded-xl px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-cream-50"
                    value={rlLevel}
                    onChange={(e) => setRlLevel(e.target.value)}
                  >
                    {RL_LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)} task</option>)}
                  </select>
                </div>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="Task (e.g. file taxes)"
                  value={rlTask}
                  onChange={(e) => setRlTask(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    placeholder="Reward (e.g. favourite coffee)"
                    value={rlReward}
                    onChange={(e) => setRlReward(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (rlTask.trim() && rlReward.trim()) {
                        addRewardLadderItem(rlLevel, rlTask.trim(), rlReward.trim());
                        setRlTask(""); setRlReward("");
                      }
                    }}
                    className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {rewardLadder.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Your rewards will appear here.</p>
              ) : (
                <div className="space-y-1.5">
                  {rewardLadder.map((item) => (
                    <div key={item.id} className="flex items-start justify-between bg-cream-50 border border-slate-100 rounded-xl px-3 py-2.5 gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium",
                            item.level === "big" ? "bg-stone-100 text-stone-600" :
                            item.level === "medium" ? "bg-sage-100 text-sage-700" : "bg-slate-100 text-slate-600"
                          )}>{item.level}</span>
                          <span className="text-sm text-slate-600">{item.task}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Reward: {item.reward}</p>
                      </div>
                      <button onClick={() => removeRewardLadderItem(item.id)}>
                        <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors mt-1" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── activation-ramp: guided step-through ── */}
          {tool.id === "activation-ramp" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Guided ramp</p>
              <TapThrough
                steps={tool.content.steps}
                completionMessage="Your nervous system is warmed up. Begin."
                actionLabel="Done this, next"
              />
            </div>
          )}

          {/* ── freeze-upregulate: guided step-through ── */}
          {tool.id === "freeze-upregulate" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Guided steps</p>
              <TapThrough
                steps={tool.content.steps}
                completionMessage="You moved through it. Gentle re-entry."
                actionLabel="I did this"
              />
            </div>
          )}

          {/* ── freeze-compassion: guided step-through ── */}
          {tool.id === "freeze-compassion" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Guided steps</p>
              <TapThrough
                steps={tool.content.steps}
                completionMessage="You offered yourself care. That matters."
                actionLabel="Next"
              />
            </div>
          )}

          {/* ── pomodoro-nd: session counter + mode display ── */}
          {tool.id === "pomodoro-nd" && (
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-medium">Sessions today</p>
                <p className="text-2xl font-bold text-slate-700 mt-0.5">{pomSessions}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPomMode("work")}
                  className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
                    pomMode === "work" ? "bg-sage-600 text-white border-sage-600" : "bg-cream-50 text-slate-600 border-slate-200")}
                >
                  Work
                </button>
                <button
                  onClick={() => setPomMode("break")}
                  className={cn("px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
                    pomMode === "break" ? "bg-[#B8897A] text-white border-[#B8897A]" : "bg-cream-50 text-slate-600 border-slate-200")}
                >
                  Break
                </button>
              </div>
            </div>
          )}

          {/* ── focus-ritual: tap-through + saved ritual ── */}
          {tool.id === "focus-ritual" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Ritual mode</p>
              <TapThrough
                steps={tool.content.steps}
                completionMessage="Ritual complete. Start your task now."
                actionLabel="Done"
              />
            </div>
          )}

          {tool.id === "focus-ritual" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My Focus Ritual</p>
              <p className="text-xs text-slate-500">Write your personal pre-focus steps in your own words. Saved across sessions.</p>
              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none leading-relaxed"
                rows={5}
                placeholder={"e.g.\n1. Make tea\n2. Put on focus playlist\n3. Clear my desk\n4. Take 3 deep breaths\n5. Open the one thing I'm working on"}
                value={focusRitualDraft}
                onChange={(e) => setFocusRitualDraft(e.target.value)}
              />
              <button
                onClick={() => setFocusRitual(focusRitualDraft)}
                className="w-full bg-sage-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-sage-700 transition-all"
              >
                Save ritual
              </button>
              {focusRitual.length > 0 && focusRitual === focusRitualDraft && (
                <p className="text-xs text-slate-400 text-center">Saved.</p>
              )}
            </div>
          )}

          {/* ── attention-anchors: saved personal anchors ── */}
          {tool.id === "attention-anchors" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My attention anchors</p>
              <SavedList
                items={attentionAnchors}
                onAdd={addAttentionAnchor}
                onRemove={removeAttentionAnchor}
                placeholder="What helps you refocus? (e.g. fidget cube, brown noise)"
                emptyLabel="Add the things that help you return to focus."
                renderItem={(item) => (item as typeof attentionAnchors[0]).text}
              />
            </div>
          )}

          {/* ── task-breakdown: main task + dynamic steps ── */}
          {tool.id === "task-breakdown" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Break it down</p>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 font-medium"
                placeholder="What is the big task?"
                value={tbMain}
                onChange={(e) => setTbMain(e.target.value)}
              />
              {tbMain && (
                <>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                      placeholder="First tiny step..."
                      value={tbNew}
                      onChange={(e) => setTbNew(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tbNew.trim()) {
                          setTbSteps((s) => [...s, { id: Math.random().toString(36).slice(2), text: tbNew.trim(), done: false }]);
                          setTbNew("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (tbNew.trim()) {
                          setTbSteps((s) => [...s, { id: Math.random().toString(36).slice(2), text: tbNew.trim(), done: false }]);
                          setTbNew("");
                        }
                      }}
                      className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {tbSteps.length > 0 && (
                    <div className="space-y-1.5">
                      {tbSteps.map((step, i) => (
                        <div
                          key={step.id}
                          className={cn("flex items-start gap-3 p-3 rounded-xl border transition-all",
                            step.done ? "bg-sage-50 border-sage-100" : "bg-cream-50 border-slate-100")}
                        >
                          <button
                            onClick={() => setTbSteps((s) => s.map((x) => x.id === step.id ? { ...x, done: !x.done } : x))}
                            className={cn("mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                              step.done ? "bg-sage-500 border-sage-500" : "border-slate-300")}
                          >
                            {step.done && <CheckCircle size={12} className="text-white" />}
                          </button>
                          <span className={cn("text-sm leading-relaxed flex-1", step.done ? "text-slate-400 line-through" : "text-slate-700")}>
                            {i + 1}. {step.text}
                          </span>
                          <button onClick={() => setTbSteps((s) => s.filter((x) => x.id !== step.id))}>
                            <Trash2 size={13} className="text-slate-200 hover:text-rose-400 transition-colors mt-0.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── weekly-review: structured textarea form ── */}
          {tool.id === "weekly-review" && tool.content.steps && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">This week's review</p>
              {tool.content.steps.map((question, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-sm text-slate-700">{question}</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                    rows={3}
                    placeholder="Your reflection..."
                    value={wrAnswers[i] ?? ""}
                    onChange={(e) => setWrAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── pause-practice: 90s breathing timer ── */}
          {tool.id === "pause-practice" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">60 second pause</p>
              <div className="bg-sage-50 rounded-2xl p-6 border border-sage-100 text-center space-y-4">
                {ppRunning && (
                  <div className="pb-2">
                    <div
                      className="w-20 h-20 rounded-full bg-sage-300 mx-auto"
                      style={{ transform: `scale(${ppScale})`, transition: "transform 1s linear" }}
                    />
                    <p className="text-sage-600 font-medium mt-4">{ppBreathText}</p>
                  </div>
                )}
                <p className="text-4xl font-mono font-bold text-sage-700">{fmt(ppSec)}</p>
                <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sage-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${90 > 0 ? ((90 - ppSec) / 90) * 100 : 0}%` }}
                  />
                </div>
                {ppDone ? (
                  <div className="space-y-3">
                    <p className="text-emerald-700 font-medium">You paused. You chose. Well done.</p>
                    <button onClick={() => { setPpSec(90); setPpDone(false); }} className="bg-cream-50 border border-sage-200 text-sage-600 px-4 py-2 rounded-xl text-sm font-medium">
                      <RotateCcw size={14} className="inline mr-1" /> Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setPpRunning((r) => !r)}
                      className="bg-sage-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-sage-700 transition-all"
                    >
                      {ppRunning ? "Pause" : ppSec < 90 ? "Resume" : "Start pause"}
                    </button>
                    {ppSec < 90 && (
                      <button onClick={() => { setPpSec(90); setPpRunning(false); setPpDone(false); }} className="bg-cream-50 border border-slate-200 text-slate-500 px-4 py-2.5 rounded-xl text-sm">
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── urge-surfing: custom timer with wave visual ── */}
          {tool.id === "urge-surfing" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Surf the urge</p>
              <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 space-y-4">
                <div className="flex gap-2 justify-center flex-wrap">
                  {[10, 15, 20, 30].map((m) => (
                    <button
                      key={m}
                      onClick={() => { setUsSec(m * 60); setUsTotal(m * 60); setUsRunning(false); setUsDone(false); }}
                      className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                        usTotal === m * 60 && !usRunning ? "bg-teal-600 text-white border-teal-600" : "bg-cream-50 text-slate-600 border-teal-200"
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Wave progress bar */}
                <div className="relative w-full h-14 bg-teal-100 rounded-xl overflow-hidden border border-teal-200">
                  <div
                    className="absolute bottom-0 left-0 h-full bg-gradient-to-r from-teal-300 to-teal-200 transition-all duration-1000"
                    style={{ width: `${usProgress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-medium text-teal-800 relative z-10 px-3 text-center">{usDone ? "You rode the wave." : usRunning ? usPhaseText : "Ready when you are."}</p>
                  </div>
                </div>

                <p className="text-4xl font-mono font-bold text-teal-700 text-center">{fmt(usSec)}</p>

                {usDone ? (
                  <div className="text-center space-y-3">
                    <p className="text-emerald-700 font-medium text-sm">You stayed with it without acting on it. That is real skill.</p>
                    <button onClick={() => { setUsSec(usTotal); setUsDone(false); }} className="bg-cream-50 border border-teal-200 text-teal-600 px-4 py-2 rounded-xl text-sm font-medium">
                      <RotateCcw size={14} className="inline mr-1" /> Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setUsRunning((r) => !r)}
                      className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700 transition-all"
                    >
                      {usRunning ? "Pause" : usSec < usTotal ? "Resume" : "Start surfing"}
                    </button>
                    {usSec < usTotal && (
                      <button onClick={() => { setUsSec(usTotal); setUsRunning(false); setUsDone(false); }} className="bg-cream-50 border border-slate-200 text-slate-500 px-4 py-2.5 rounded-xl text-sm">
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── wind-down / task-transition: tap-through ── */}
          {tool.id === "wind-down" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Transition guide</p>
              <TapThrough
                steps={tool.content.steps}
                completionMessage="Task closed. Ready for the next."
                actionLabel="Done"
              />
            </div>
          )}

          {/* ── self-care-minimum: personal MVSC list ── */}
          {tool.id === "self-care-minimum" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My minimum list</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="Add a minimum self-care item..."
                  value={mvscNew}
                  onChange={(e) => setMvscNew(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && mvscNew.trim()) { addMVSCItem(mvscNew.trim()); setMvscNew(""); } }}
                />
                <button
                  onClick={() => { if (mvscNew.trim()) { addMVSCItem(mvscNew.trim()); setMvscNew(""); } }}
                  className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              {mvscList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Add your personal bare-minimum self-care items.</p>
              ) : (
                <div className="space-y-1.5">
                  {mvscList.map((item) => {
                    const done = mvscTodayDone(item.id);
                    return (
                      <div key={item.id} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all",
                        done ? "bg-sage-50 border-sage-100" : "bg-cream-50 border-slate-100")}>
                        <button
                          onClick={() => toggleMVSCToday(item.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                            done ? "bg-sage-500 border-sage-500" : "border-slate-300")}>
                            {done && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className={cn("text-sm", done ? "text-slate-400 line-through" : "text-slate-700")}>{item.text}</span>
                        </button>
                        <button onClick={() => removeMVSCItem(item.id)} className="ml-2">
                          <Trash2 size={13} className="text-slate-200 hover:text-rose-400 transition-colors" />
                        </button>
                      </div>
                    );
                  })}
                  <p className="text-xs text-slate-400 text-center pt-1">Resets each day.</p>
                </div>
              )}
            </div>
          )}

          {/* ── habit-stack: anchor + new habit pairs ── */}
          {tool.id === "habit-stack" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My habit stacks</p>
              <div className="space-y-2">
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="Anchor habit (e.g. After I make coffee)"
                  value={hsAnchor}
                  onChange={(e) => setHsAnchor(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    placeholder="New habit (e.g. I take my meds)"
                    value={hsNew}
                    onChange={(e) => setHsNew(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      if (hsAnchor.trim() && hsNew.trim()) {
                        addHabitStack(hsAnchor.trim(), hsNew.trim());
                        setHsAnchor(""); setHsNew("");
                      }
                    }}
                    className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {habitStacks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Your habit stacks will appear here.</p>
              ) : (
                <div className="space-y-1.5">
                  {habitStacks.map((stack) => (
                    <div key={stack.id} className="flex items-start justify-between bg-cream-50 border border-slate-100 rounded-xl px-3 py-2.5 gap-2">
                      <p className="text-sm text-slate-700 flex-1 leading-relaxed">
                        <span className="text-slate-400">{stack.anchor}, </span>
                        {stack.newHabit}
                      </p>
                      <button onClick={() => removeHabitStack(stack.id)}>
                        <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors mt-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── done-better-perfect: tap-through + Ship it! ── */}
          {tool.id === "done-better-perfect" && tool.content.steps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Guided reframe</p>
              {shipped ? (
                <div className="bg-gradient-to-br from-stone-100 to-sage-50 rounded-2xl p-6 text-center border border-stone-200">
                  <Rocket size={32} className="text-sage-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-slate-800">You shipped it.</p>
                  <p className="text-sm text-slate-600 mt-1">That took courage. Done and out there is worth more than perfect and never finished.</p>
                  <button onClick={() => setShipped(false)} className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline">Start again</button>
                </div>
              ) : (
                <TapThrough
                  steps={tool.content.steps}
                  completionMessage="All reframes complete."
                  actionLabel="Got it, next"
                  onComplete={() => setShipped(true)}
                />
              )}
            </div>
          )}

          {/* ── rsd-perfectionism: steps with reflection textareas ── */}
          {tool.id === "rsd-perfectionism" && tool.content.steps && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Guided reflection</p>
              {tool.content.steps.map((step, i) => (
                <div key={i} className="space-y-2 border-l-2 border-rose-100 pl-4">
                  <p className="text-sm text-slate-700">{step}</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none leading-relaxed"
                    rows={2}
                    placeholder="What comes up for you?"
                    value={rsdAnswers[i] ?? ""}
                    onChange={(e) => setRsdAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── boundary-scripts: personal scripts library ── */}
          {tool.id === "boundary-scripts" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My personal scripts</p>
              <div className="space-y-2">
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none leading-relaxed"
                  rows={2}
                  placeholder="Write a boundary phrase that feels true to you..."
                  value={bsText}
                  onChange={(e) => setBsText(e.target.value)}
                />
                <button
                  onClick={() => { if (bsText.trim()) { addBoundaryScript(bsText.trim()); setBsText(""); } }}
                  disabled={!bsText.trim()}
                  className={cn("w-full py-2 rounded-xl text-sm font-medium transition-all border",
                    bsText.trim() ? "bg-sage-600 text-white border-sage-600 hover:bg-sage-700" : "bg-cream-50 text-slate-300 border-slate-200 cursor-not-allowed"
                  )}
                >
                  Save to my library
                </button>
              </div>
              {boundaryScripts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Your saved scripts will appear here.</p>
              ) : (
                <div className="space-y-1.5">
                  {boundaryScripts.map((script) => (
                    <div key={script.id} className="flex items-start justify-between bg-cream-50 border border-slate-100 rounded-xl px-3 py-2.5 gap-2">
                      <p className="text-sm text-slate-700 flex-1 leading-relaxed italic">"{script.text}"</p>
                      <button onClick={() => removeBoundaryScript(script.id)}>
                        <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors mt-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── fawn-response: steps with inline textareas ── */}
          {tool.id === "fawn-response" && tool.content.steps && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Explore and reflect</p>
              {tool.content.steps.map((step, i) => (
                <div key={i} className="space-y-2 border-l-2 border-stone-200 pl-4">
                  <p className="text-sm text-slate-700">{step}</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none leading-relaxed"
                    rows={2}
                    placeholder="What does this bring up for you?"
                    value={fawnAnswers[i] ?? ""}
                    onChange={(e) => setFawnAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── needs-inventory: needs checklist ── */}
          {tool.id === "needs-inventory" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">What do you need right now?</p>
              <div className="flex flex-wrap gap-2">
                {[...PREDEFINED_NEEDS, ...extraNeeds].map((need) => (
                  <button
                    key={need}
                    onClick={() => toggleNeed(need)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedNeeds.has(need)
                        ? "bg-sage-600 text-white border-sage-600"
                        : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                    )}
                  >
                    {need}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  placeholder="Add a custom need..."
                  value={customNeed}
                  onChange={(e) => setCustomNeed(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customNeed.trim()) {
                      setExtraNeeds((n) => [...n, customNeed.trim()]);
                      setCustomNeed("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customNeed.trim()) { setExtraNeeds((n) => [...n, customNeed.trim()]); setCustomNeed(""); }
                  }}
                  className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              {selectedNeeds.size > 0 && (
                <div className="bg-sage-50 border border-sage-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-sage-700 font-medium">Noticing: {Array.from(selectedNeeds).join(", ")}</p>
                  <p className="text-xs text-slate-500 mt-1">These are real needs. They deserve attention.</p>
                </div>
              )}
            </div>
          )}

          {/* ── burnout-signs: symptom checklist ── */}
          {tool.id === "burnout-signs" && tool.content.steps && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Which signs are you experiencing?</p>
              <div className="space-y-2">
                {tool.content.steps.map((sign, i) => {
                  const checked = burnoutChecked.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => setBurnoutChecked((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i); else next.add(i);
                        return next;
                      })}
                      className={cn("w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all",
                        checked ? "bg-rose-50 border-rose-200" : "bg-cream-50 border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                        checked ? "bg-rose-500 border-rose-500" : "border-slate-300"
                      )}>
                        {checked && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={cn("text-sm leading-relaxed", checked ? "text-rose-800" : "text-slate-600")}>{sign}</span>
                    </button>
                  );
                })}
              </div>
              <div className={cn("rounded-xl px-4 py-3 border text-sm leading-relaxed",
                burnoutCount === 0 ? "bg-sage-50 border-sage-100 text-sage-700"
                : burnoutCount <= 2 ? "bg-stone-100 border-stone-200 text-stone-700"
                : "bg-rose-50 border-rose-100 text-rose-800"
              )}>
                {burnoutResponse}
              </div>
            </div>
          )}

          {/* ── burnout-recovery: two-phase recovery plan ── */}
          {tool.id === "burnout-recovery" && (() => {
            const defaultDropItems = [
              "Work or school tasks",
              "Social obligations",
              "Household chores",
              "Self-care routines beyond basics",
              "Hobbies",
              "Responding to messages",
              "Cooking (switch to easy foods)",
              "Exercise",
            ];
            const defaultWarnSigns = [
              "Exhaustion after small tasks",
              "Irritability or low frustration tolerance",
              "Sleep disruption",
              "Meltdown or shutdown increase",
              "Physical symptoms (headaches, body aches)",
            ];
            const toggleDropItem = (label: string) => {
              const checked = burnoutRecoveryPlan.phase1DropChecked ?? [];
              updateBurnoutRecoveryPlan({
                phase1DropChecked: checked.includes(label)
                  ? checked.filter((x) => x !== label)
                  : [...checked, label],
              });
            };
            const addCustomDrop = () => {
              if (!brDropCustomInput.trim()) return;
              updateBurnoutRecoveryPlan({
                phase1DropCustom: [...(burnoutRecoveryPlan.phase1DropCustom ?? []), brDropCustomInput.trim()],
              });
              setBrDropCustomInput("");
            };
            const removeCustomDrop = (label: string) => {
              updateBurnoutRecoveryPlan({
                phase1DropCustom: (burnoutRecoveryPlan.phase1DropCustom ?? []).filter((x) => x !== label),
                phase1DropChecked: (burnoutRecoveryPlan.phase1DropChecked ?? []).filter((x) => x !== label),
              });
            };
            const toggleWarnSign = (label: string) => {
              const checked = burnoutRecoveryPlan.phase2WarnChecked ?? [];
              updateBurnoutRecoveryPlan({
                phase2WarnChecked: checked.includes(label)
                  ? checked.filter((x) => x !== label)
                  : [...checked, label],
              });
            };
            const addP2Activity = () => {
              if (!brP2NewActivity.trim()) return;
              addBurnoutPhase2Activity(brP2NewActivity.trim());
              setBrP2NewActivity("");
            };
            return (
              <div className="space-y-6">
                {/* PHASE 1 */}
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-semibold text-slate-800">Phase 1: Dropping Demands</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">During burnout recovery, the first step is radically reducing demands, not pushing through. This phase is about identifying what you can let go of.</p>
                  </div>

                  {/* Drop checklist */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Things I can drop or delay</p>
                    <div className="space-y-1.5">
                      {[...defaultDropItems, ...(burnoutRecoveryPlan.phase1DropCustom ?? [])].map((label) => {
                        const isCustom = (burnoutRecoveryPlan.phase1DropCustom ?? []).includes(label);
                        const checked = (burnoutRecoveryPlan.phase1DropChecked ?? []).includes(label);
                        return (
                          <div key={label} className="flex items-center gap-2.5">
                            <button
                              onClick={() => toggleDropItem(label)}
                              className={cn("w-4.5 h-4.5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                checked ? "bg-sage-500 border-sage-500" : "border-slate-300 bg-white"
                              )}
                              style={{ width: 18, height: 18, minWidth: 18 }}
                            >
                              {checked && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
                            </button>
                            <span className={cn("text-sm flex-1", checked ? "line-through text-slate-400" : "text-slate-700")}>{label}</span>
                            {isCustom && (
                              <button onClick={() => removeCustomDrop(label)}>
                                <Trash2 size={12} className="text-slate-300 hover:text-rose-400 transition-colors" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300"
                        placeholder="Add your own..."
                        value={brDropCustomInput}
                        onChange={(e) => setBrDropCustomInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addCustomDrop(); }}
                      />
                      <button onClick={addCustomDrop} className="bg-sage-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-sage-700 transition-all">
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Support needs */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">My support needs right now</p>
                    <textarea
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                      rows={2}
                      placeholder="What do I need from others right now?"
                      value={burnoutRecoveryPlan.phase1SupportNeeds ?? ""}
                      onChange={(e) => updateBurnoutRecoveryPlan({ phase1SupportNeeds: e.target.value })}
                    />
                  </div>

                  {/* Minimum viable day */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">My minimum viable day</p>
                    <textarea
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                      rows={2}
                      placeholder="What does just surviving look like? (Just existing is enough.)"
                      value={burnoutRecoveryPlan.phase1MinimumViableDay ?? ""}
                      onChange={(e) => updateBurnoutRecoveryPlan({ phase1MinimumViableDay: e.target.value })}
                    />
                  </div>

                  {/* Phase 1 notes */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes</p>
                    <textarea
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                      rows={2}
                      placeholder="Anything else about Phase 1..."
                      value={burnoutRecoveryPlan.phase1Notes ?? ""}
                      onChange={(e) => updateBurnoutRecoveryPlan({ phase1Notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-widest">When you feel ready</span>
                  </div>
                </div>

                {/* PHASE 2 */}
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-semibold text-slate-800">Phase 2: Gentle Reintroduction</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Once you feel some stability returning, start adding ONE small thing at a time. Go slowly: rushing recovery leads to relapse.</p>
                  </div>

                  {/* Activities list */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Activities to reintroduce</p>
                    {(burnoutRecoveryPlan.phase2Activities ?? []).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">No activities yet. Add one below.</p>
                    )}
                    <div className="space-y-2.5">
                      {(burnoutRecoveryPlan.phase2Activities ?? []).map((activity) => (
                        <div key={activity.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-slate-700 font-medium flex-1">{activity.name}</span>
                            <button onClick={() => removeBurnoutPhase2Activity(activity.id)}>
                              <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
                            </button>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {(["not-ready", "maybe-soon", "ready"] as const).map((r) => (
                              <button
                                key={r}
                                onClick={() => updateBurnoutPhase2Activity(activity.id, { readiness: r })}
                                className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                                  activity.readiness === r
                                    ? r === "ready" ? "bg-sage-500 text-white border-sage-500"
                                      : r === "maybe-soon" ? "bg-amber-400 text-white border-amber-400"
                                      : "bg-slate-400 text-white border-slate-400"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                )}
                              >
                                {r === "not-ready" ? "Not Ready" : r === "maybe-soon" ? "Maybe Soon" : "Ready to Try"}
                              </button>
                            ))}
                          </div>
                          <input
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
                            placeholder="Start date (when feels right)"
                            value={activity.startDate}
                            onChange={(e) => updateBurnoutPhase2Activity(activity.id, { startDate: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300"
                        placeholder="Add an activity..."
                        value={brP2NewActivity}
                        onChange={(e) => setBrP2NewActivity(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addP2Activity(); }}
                      />
                      <button onClick={addP2Activity} className="bg-sage-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-sage-700 transition-all">
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Warning signs of overdoing it */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Warning signs I'm overdoing it</p>
                    <p className="text-xs text-slate-400">Check the ones that apply to you as personal reminders.</p>
                    <div className="space-y-1.5">
                      {defaultWarnSigns.map((label) => {
                        const checked = (burnoutRecoveryPlan.phase2WarnChecked ?? []).includes(label);
                        return (
                          <div key={label} className="flex items-center gap-2.5">
                            <button
                              onClick={() => toggleWarnSign(label)}
                              className={cn("rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                checked ? "bg-rose-400 border-rose-400" : "border-slate-300 bg-white"
                              )}
                              style={{ width: 18, height: 18, minWidth: 18 }}
                            >
                              {checked && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
                            </button>
                            <span className={cn("text-sm", checked ? "text-rose-500 font-medium" : "text-slate-700")}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Phase 2 notes */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes</p>
                    <textarea
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                      rows={2}
                      placeholder="Anything else about Phase 2..."
                      value={burnoutRecoveryPlan.phase2Notes ?? ""}
                      onChange={(e) => updateBurnoutRecoveryPlan({ phase2Notes: e.target.value })}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400">All changes saved automatically.</p>
              </div>
            );
          })()}

          {/* ── sensory-contingency-plan ── */}
          {tool.id === "sensory-contingency-plan" && (() => {
            const defaultWarnSigns = [
              "Sound sensitivity increasing",
              "Light hurting my eyes",
              "Skin feeling irritated or hypersensitive",
              "Difficulty filtering conversation",
              "Urge to flee or escape",
              "Stimming increasing",
              "Feeling 'fuzzy' or disconnected",
            ];
            const defaultSoothers = [
              "Noise-cancelling headphones",
              "Sunglasses",
              "Fidget",
              "Snack",
              "Water",
              "Comfort item",
              "Earplugs",
              "Cap or hat",
              "Phone for music",
            ];
            const toggleWarn = (label: string) => {
              const checked = sensoryContingencyPlan.earlyWarningChecked ?? [];
              updateSensoryContingencyPlan({
                earlyWarningChecked: checked.includes(label)
                  ? checked.filter((x) => x !== label)
                  : [...checked, label],
              });
            };
            const addCustomWarn = () => {
              if (!scpWarnCustomInput.trim()) return;
              updateSensoryContingencyPlan({
                earlyWarningCustom: [...(sensoryContingencyPlan.earlyWarningCustom ?? []), scpWarnCustomInput.trim()],
              });
              setScpWarnCustomInput("");
            };
            const removeCustomWarn = (label: string) => {
              updateSensoryContingencyPlan({
                earlyWarningCustom: (sensoryContingencyPlan.earlyWarningCustom ?? []).filter((x) => x !== label),
                earlyWarningChecked: (sensoryContingencyPlan.earlyWarningChecked ?? []).filter((x) => x !== label),
              });
            };
            const toggleSoother = (label: string) => {
              const checked = sensoryContingencyPlan.soothersChecked ?? [];
              updateSensoryContingencyPlan({
                soothersChecked: checked.includes(label)
                  ? checked.filter((x) => x !== label)
                  : [...checked, label],
              });
            };
            const addCustomSoother = () => {
              if (!scpSoothCustomInput.trim()) return;
              updateSensoryContingencyPlan({
                soothersCustom: [...(sensoryContingencyPlan.soothersCustom ?? []), scpSoothCustomInput.trim()],
              });
              setScpSoothCustomInput("");
            };
            const removeCustomSoother = (label: string) => {
              updateSensoryContingencyPlan({
                soothersCustom: (sensoryContingencyPlan.soothersCustom ?? []).filter((x) => x !== label),
                soothersChecked: (sensoryContingencyPlan.soothersChecked ?? []).filter((x) => x !== label),
              });
            };
            const addContact = () => {
              if (!scpContactDraft.name.trim()) return;
              const contacts = sensoryContingencyPlan.supportContacts ?? [];
              if (contacts.length >= 3) return;
              updateSensoryContingencyPlan({
                supportContacts: [...contacts, { id: Math.random().toString(36).slice(2), ...scpContactDraft }],
              });
              setScpContactDraft({ name: "", phone: "", notes: "" });
            };
            const removeContact = (id: string) => {
              updateSensoryContingencyPlan({
                supportContacts: (sensoryContingencyPlan.supportContacts ?? []).filter((c) => c.id !== id),
              });
            };
            return (
              <div className="space-y-5">
                {/* 1. Exit plan */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Exit Plan</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                    rows={3}
                    placeholder="If I need to leave, I will... (signal, excuse, route)"
                    value={sensoryContingencyPlan.exitPlan ?? ""}
                    onChange={(e) => updateSensoryContingencyPlan({ exitPlan: e.target.value })}
                  />
                </div>

                {/* 2. Early warning signs */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Early Warning Signs</p>
                  <p className="text-xs text-slate-400">Check the signs that apply to you.</p>
                  <div className="space-y-1.5">
                    {[...defaultWarnSigns, ...(sensoryContingencyPlan.earlyWarningCustom ?? [])].map((label) => {
                      const isCustom = (sensoryContingencyPlan.earlyWarningCustom ?? []).includes(label);
                      const checked = (sensoryContingencyPlan.earlyWarningChecked ?? []).includes(label);
                      return (
                        <div key={label} className="flex items-center gap-2.5">
                          <button
                            onClick={() => toggleWarn(label)}
                            className={cn("rounded border-2 flex items-center justify-center shrink-0 transition-all",
                              checked ? "bg-amber-400 border-amber-400" : "border-slate-300 bg-white"
                            )}
                            style={{ width: 18, height: 18, minWidth: 18 }}
                          >
                            {checked && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
                          </button>
                          <span className={cn("text-sm flex-1", checked ? "text-amber-600 font-medium" : "text-slate-700")}>{label}</span>
                          {isCustom && (
                            <button onClick={() => removeCustomWarn(label)}>
                              <Trash2 size={12} className="text-slate-300 hover:text-rose-400 transition-colors" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300"
                      placeholder="Add your own warning sign..."
                      value={scpWarnCustomInput}
                      onChange={(e) => setScpWarnCustomInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addCustomWarn(); }}
                    />
                    <button onClick={addCustomWarn} className="bg-sage-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-sage-700 transition-all">
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* 3. Soothers to bring */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Soothers to Bring</p>
                  <p className="text-xs text-slate-400">Check what you pack.</p>
                  <div className="space-y-1.5">
                    {[...defaultSoothers, ...(sensoryContingencyPlan.soothersCustom ?? [])].map((label) => {
                      const isCustom = (sensoryContingencyPlan.soothersCustom ?? []).includes(label);
                      const checked = (sensoryContingencyPlan.soothersChecked ?? []).includes(label);
                      return (
                        <div key={label} className="flex items-center gap-2.5">
                          <button
                            onClick={() => toggleSoother(label)}
                            className={cn("rounded border-2 flex items-center justify-center shrink-0 transition-all",
                              checked ? "bg-sage-500 border-sage-500" : "border-slate-300 bg-white"
                            )}
                            style={{ width: 18, height: 18, minWidth: 18 }}
                          >
                            {checked && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
                          </button>
                          <span className={cn("text-sm flex-1", checked ? "text-sage-700 font-medium" : "text-slate-700")}>{label}</span>
                          {isCustom && (
                            <button onClick={() => removeCustomSoother(label)}>
                              <Trash2 size={12} className="text-slate-300 hover:text-rose-400 transition-colors" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300"
                      placeholder="Add your own soother..."
                      value={scpSoothCustomInput}
                      onChange={(e) => setScpSoothCustomInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addCustomSoother(); }}
                    />
                    <button onClick={addCustomSoother} className="bg-sage-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-sage-700 transition-all">
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* 4. Support contacts */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Support Contacts (up to 3)</p>
                  {(sensoryContingencyPlan.supportContacts ?? []).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-1">No contacts added yet.</p>
                  )}
                  <div className="space-y-2">
                    {(sensoryContingencyPlan.supportContacts ?? []).map((contact) => (
                      <div key={contact.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 flex-1">
                            <p className="text-sm font-semibold text-slate-700">{contact.name}</p>
                            {contact.phone && <p className="text-xs text-slate-500">{contact.phone}</p>}
                            {contact.notes && <p className="text-xs text-slate-500 italic">{contact.notes}</p>}
                          </div>
                          <button onClick={() => removeContact(contact.id)}>
                            <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(sensoryContingencyPlan.supportContacts ?? []).length < 3 && (
                    <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <input
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
                        placeholder="Name"
                        value={scpContactDraft.name}
                        onChange={(e) => setScpContactDraft((d) => ({ ...d, name: e.target.value }))}
                      />
                      <input
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
                        placeholder="Phone number"
                        value={scpContactDraft.phone}
                        onChange={(e) => setScpContactDraft((d) => ({ ...d, phone: e.target.value }))}
                      />
                      <input
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sage-300"
                        placeholder="What they know (e.g. will leave with me without questions)"
                        value={scpContactDraft.notes}
                        onChange={(e) => setScpContactDraft((d) => ({ ...d, notes: e.target.value }))}
                      />
                      <button
                        onClick={addContact}
                        disabled={!scpContactDraft.name.trim()}
                        className="w-full bg-sage-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-sage-700 transition-all disabled:opacity-40"
                      >
                        Add Contact
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Recovery plan */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Recovery Plan</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none leading-relaxed"
                    rows={3}
                    placeholder="After a sensory-intense environment, I recover by..."
                    value={sensoryContingencyPlan.recoveryPlan ?? ""}
                    onChange={(e) => updateSensoryContingencyPlan({ recoveryPlan: e.target.value })}
                  />
                </div>

                <p className="text-xs text-slate-400">All changes saved automatically.</p>
              </div>
            );
          })()}

          {/* ── energy-accounting: profile + daily log ── */}
          {tool.id === "energy-accounting" && (
            <div className="space-y-5">

              {/* Energy Profile */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Your Energy Profile</p>
                <p className="text-xs text-slate-500">Build your personal list of what drains and restores you. This stays saved over time.</p>

                {/* Drains */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold" style={{ color: '#8f6559' }}>Drains</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      placeholder="What drains your energy?"
                      value={epDrainLabel}
                      onChange={(e) => setEpDrainLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && epDrainLabel.trim()) {
                          addEnergyDrain({ label: epDrainLabel.trim(), intensity: "medium", value: epDrainValue });
                          setEpDrainLabel("");
                        }
                      }}
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-slate-400 w-4 text-right">{epDrainValue}</span>
                      <input
                        type="range" min={1} max={10} step={1}
                        value={epDrainValue}
                        onChange={(e) => setEpDrainValue(Number(e.target.value))}
                        className="w-16 accent-rose-400"
                      />
                    </div>
                    <button
                      onClick={() => { if (epDrainLabel.trim()) { addEnergyDrain({ label: epDrainLabel.trim(), intensity: "medium", value: epDrainValue }); setEpDrainLabel(""); } }}
                      className="px-3 py-2 rounded-xl text-sm font-medium bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Slider: 1 (barely drains) → 10 (completely drains)</p>
                  {energyDrains.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {energyDrains.map((d) => (
                        <span key={d.id} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ color: '#8f6559', background: '#C4897A22', border: '1px solid #8f655966' }}>
                          {d.label}
                          {d.value !== undefined && (
                            <span className="font-bold opacity-70">−{d.value}</span>
                          )}
                          <button onClick={() => removeEnergyDrain(d.id)} className="ml-0.5 opacity-60 hover:opacity-100">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Restorers */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold" style={{ color: '#4d6e5e' }}>Restorers</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-200"
                      placeholder="What restores your energy?"
                      value={epRestoreLabel}
                      onChange={(e) => setEpRestoreLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && epRestoreLabel.trim()) {
                          addEnergyRestorer({ label: epRestoreLabel.trim(), intensity: "medium", value: epRestoreValue });
                          setEpRestoreLabel("");
                        }
                      }}
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-slate-400 w-4 text-right">{epRestoreValue}</span>
                      <input
                        type="range" min={1} max={10} step={1}
                        value={epRestoreValue}
                        onChange={(e) => setEpRestoreValue(Number(e.target.value))}
                        className="w-16 accent-sage-500"
                      />
                    </div>
                    <button
                      onClick={() => { if (epRestoreLabel.trim()) { addEnergyRestorer({ label: epRestoreLabel.trim(), intensity: "medium", value: epRestoreValue }); setEpRestoreLabel(""); } }}
                      className="px-3 py-2 rounded-xl text-sm font-medium bg-sage-100 text-sage-700 border border-sage-200 hover:bg-sage-200 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Slider: 1 (slight boost) → 10 (fully recharging)</p>
                  {energyRestorers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {energyRestorers.map((r) => (
                        <span key={r.id} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ color: '#4d6e5e', background: '#7FA88222', border: '1px solid #4d6e5e66' }}>
                          {r.label}
                          {r.value !== undefined && (
                            <span className="font-bold opacity-70">+{r.value}</span>
                          )}
                          <button onClick={() => removeEnergyRestorer(r.id)} className="ml-0.5 opacity-60 hover:opacity-100">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Today's Log */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Today's log</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    placeholder="What drained or restored you today?"
                    value={elLabel}
                    onChange={(e) => setElLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && elLabel.trim()) { addEnergyLogEntry(elLabel.trim(), elType); setElLabel(""); }
                    }}
                  />
                  <button
                    onClick={() => setElType((t) => t === "drain" ? "restore" : "drain")}
                    className={cn("px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                      elType === "drain" ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-sage-100 text-sage-700 border-sage-200"
                    )}
                  >
                    {elType === "drain" ? "Drain" : "Restore"}
                  </button>
                  <button
                    onClick={() => { if (elLabel.trim()) { addEnergyLogEntry(elLabel.trim(), elType); setElLabel(""); } }}
                    className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {todayEnergy.length > 0 ? (
                  <div className="space-y-1.5">
                    {todayEnergy.map((entry) => (
                      <div key={entry.id} className={cn("flex items-center justify-between p-2.5 rounded-xl border",
                        entry.type === "drain" ? "bg-rose-50 border-rose-100" : "bg-sage-50 border-sage-100"
                      )}>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold", entry.type === "drain" ? "text-rose-500" : "text-sage-600")}>{entry.type === "drain" ? "−" : "+"}</span>
                          <span className="text-sm text-slate-700">{entry.label}</span>
                        </div>
                        <button onClick={() => removeEnergyLogEntry(entry.id)}>
                          <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
                        </button>
                      </div>
                    ))}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                      <p className="text-xs text-slate-500">
                        <span className="text-rose-600 font-medium">{drains} drain{drains !== 1 ? "s" : ""}</span>
                        {" vs "}
                        <span className="text-sage-600 font-medium">{restores} restore{restores !== 1 ? "s" : ""}</span>
                        {restores > drains ? " You are topping up." : drains > restores ? " More deposits needed." : " Balanced."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">No entries yet today.</p>
                )}
              </div>
            </div>
          )}

          {/* ── masking-costs: steps with reflection textareas ── */}
          {tool.id === "masking-costs" && tool.content.steps && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Reflection</p>
              {tool.content.steps.map((step, i) => (
                <div key={i} className="space-y-2 border-l-2 border-purple-100 pl-4">
                  <p className="text-sm text-slate-700">{step}</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none leading-relaxed"
                    rows={2}
                    placeholder="Your reflection..."
                    value={maskAnswers[i] ?? ""}
                    onChange={(e) => setMaskAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── body-scan: step-by-step navigator ── */}
          {tool.id === "body-scan" && tool.content.steps && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Body scan</p>
              {bsComplete ? (
                <div className="bg-sage-50 rounded-2xl p-5 text-center border border-sage-100">
                  <CheckCircle size={28} className="text-sage-500 mx-auto mb-2" />
                  <p className="text-sage-700 font-semibold">Scan complete. Thank you for checking in.</p>
                  <button onClick={() => { setBsStep(0); setBsNotes({}); setBsComplete(false); }} className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline">Start again</button>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Area {bsStep + 1} of {tool.content.steps.length}</span>
                    <div className="flex gap-1">
                      {tool.content.steps.map((_, i) => (
                        <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < bsStep ? "bg-sage-400" : i === bsStep ? "bg-sage-600" : "bg-slate-200")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{tool.content.steps[bsStep]}</p>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-300 resize-none"
                    rows={2}
                    placeholder="What do you notice here? (or skip)"
                    value={bsNotes[bsStep] ?? ""}
                    onChange={(e) => setBsNotes((n) => ({ ...n, [bsStep]: e.target.value }))}
                  />
                  <button
                    onClick={() => {
                      if (bsStep < (tool.content.steps?.length ?? 1) - 1) setBsStep((s) => s + 1);
                      else setBsComplete(true);
                    }}
                    className="w-full bg-sage-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-sage-700 transition-all"
                  >
                    {bsStep < (tool.content.steps?.length ?? 1) - 1 ? "Next body area" : "Complete scan"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── thirst-hunger: daily check-in + cue explorer ── */}
          {tool.id === "thirst-hunger-cues" && (
            <div className="space-y-5">
              {/* Basic check-in */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Today's check-in</p>
                <div className="space-y-2">
                  {[
                    { label: "I have eaten at least once today", value: ate, set: setAte },
                    { label: "I have had water today", value: drank, set: setDrank },
                    { label: "I checked in with my body's signals", value: checkedHunger, set: setCheckedHunger },
                  ].map(({ label, value, set }) => (
                    <button
                      key={label}
                      onClick={() => set(!value)}
                      className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
                        value ? "bg-sage-50 border-sage-200" : "bg-cream-50 border-slate-100 hover:border-sage-200"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        value ? "bg-sage-500 border-sage-500" : "border-slate-300"
                      )}>
                        {value && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className={cn("text-sm", value ? "text-sage-700" : "text-slate-600")}>{label}</span>
                    </button>
                  ))}
                </div>
                {ate && drank && checkedHunger && (
                  <div className="bg-sage-50 border border-sage-100 rounded-xl px-4 py-3 text-center">
                    <p className="text-sm text-sage-700 font-medium">All checked. You are taking care of yourself.</p>
                  </div>
                )}
              </div>

              {/* Thirst signals */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Thirst signals I notice right now</p>
                <p className="text-xs text-slate-500">Check any that apply. These may mean your body needs water.</p>
                <div className="space-y-1.5">
                  {THIRST_CUES.map((cue) => {
                    const checked = thirstCues.has(cue);
                    return (
                      <button
                        key={cue}
                        onClick={() => setThirstCues((prev) => { const n = new Set(prev); if (n.has(cue)) n.delete(cue); else n.add(cue); return n; })}
                        className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
                          checked ? "bg-blue-50 border-blue-200" : "bg-cream-50 border-slate-100 hover:border-blue-200"
                        )}
                      >
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          checked ? "bg-blue-500 border-blue-500" : "border-slate-300"
                        )}>
                          {checked && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <span className={cn("text-sm", checked ? "text-blue-700" : "text-slate-600")}>{cue}</span>
                      </button>
                    );
                  })}
                </div>
                {thirstCues.size > 0 && (
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                    You may be thirsty. Try drinking some water now.
                  </p>
                )}
              </div>

              {/* Hunger signals */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Hunger signals I notice right now</p>
                <p className="text-xs text-slate-500">Check any that apply. These may mean your body needs food.</p>
                <div className="space-y-1.5">
                  {HUNGER_CUES.map((cue) => {
                    const checked = hungerCues.has(cue);
                    return (
                      <button
                        key={cue}
                        onClick={() => setHungerCues((prev) => { const n = new Set(prev); if (n.has(cue)) n.delete(cue); else n.add(cue); return n; })}
                        className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
                          checked ? "bg-stone-100 border-stone-200" : "bg-cream-50 border-slate-100 hover:border-stone-200"
                        )}
                      >
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                          checked ? "bg-sage-500 border-sage-500" : "border-slate-300"
                        )}>
                          {checked && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <span className={cn("text-sm", checked ? "text-stone-700" : "text-slate-600")}>{cue}</span>
                      </button>
                    );
                  })}
                </div>
                {hungerCues.size > 0 && (
                  <p className="text-xs text-stone-600 bg-stone-100 rounded-xl px-3 py-2 border border-stone-200">
                    You may be hungry. Try eating something, even something small.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── arfid-support: psychoeducation + accommodation checklist ── */}
          {tool.id === "arfid-support" && (() => {
            const PREDEFINED_ACCOMMODATIONS = [
              "Food chaining (gradually expanding safe foods)",
              "Separating foods on the plate",
              "Predictable mealtimes",
              "Removing pressure around trying new foods",
              "Having a safe food always available",
              "Texture modifications (blending, removing skins)",
              "Temperature preferences honoured",
              "Eating alone when social pressure is too much",
              "Using familiar brands and packaging",
              "Meal planning around safe foods",
              "Working with a feeding therapist",
              "Nutritional supplements to fill gaps",
            ];
            const toggleArfid = (item: string) =>
              setArfidChecked((prev) => {
                const next = new Set(prev);
                if (next.has(item)) next.delete(item); else next.add(item);
                return next;
              });
            return (
              <div className="space-y-4">
                <div className="bg-stone-100 border border-stone-200 rounded-2xl px-4 py-4 space-y-2">
                  <p className="text-sm font-semibold text-stone-700">What is ARFID?</p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    ARFID involves significantly limited food intake due to sensory features, fear of aversive consequences (choking, vomiting), or low interest in food. It is not a phase and it is not willpower. It is more common in autistic and ADHD brains.
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Picky eating on a spectrum is also a valid ND experience. Texture, temperature, smell, and appearance all matter. Your body is communicating real information.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Accommodation strategies</p>
                  <p className="text-xs text-slate-400">Tap to mark strategies that feel helpful for you.</p>
                  {PREDEFINED_ACCOMMODATIONS.map((item) => {
                    const checked = arfidChecked.has(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleArfid(item)}
                        className={cn("w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all",
                          checked ? "bg-stone-100 border-stone-200" : "bg-cream-50 border-slate-100 hover:border-stone-200"
                        )}
                      >
                        <div className={cn("mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                          checked ? "bg-sage-500 border-sage-500" : "border-slate-300"
                        )}>
                          {checked && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <span className={cn("text-sm leading-relaxed", checked ? "text-stone-700" : "text-slate-700")}>{item}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">My saved accommodations</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
                      placeholder="Add your own strategy..."
                      value={arfidNew}
                      onChange={(e) => setArfidNew(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && arfidNew.trim()) {
                          addArfidAccommodation(arfidNew.trim());
                          setArfidNew("");
                        }
                      }}
                    />
                    <button
                      onClick={() => { if (arfidNew.trim()) { addArfidAccommodation(arfidNew.trim()); setArfidNew(""); } }}
                      className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {arfidAccommodations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Your personal strategies will be saved here.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {arfidAccommodations.map((item) => (
                        <div key={item} className="flex items-start justify-between bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5 gap-2">
                          <span className="text-sm text-slate-700 flex-1 leading-relaxed">{item}</span>
                          <button onClick={() => removeArfidAccommodation(item)}>
                            <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors mt-0.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-stone-100 to-sage-50 rounded-2xl p-4 border border-stone-200 text-center">
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    Your food needs are real and valid. Working around them is not weakness. It is good self-knowledge.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ── nd-meals: browseable meals by effort + save + custom ── */}
          {tool.id === "nd-meals" && (() => {
            const MEALS: { effort: string; items: string[] }[] = [
              {
                effort: "No-cook / 2 minutes",
                items: [
                  "Cheese and crackers",
                  "Peanut butter on bread",
                  "Yogurt with granola",
                  "Fruit and nut butter",
                  "Cereal with milk",
                  "Hummus and veggies or pita",
                ],
              },
              {
                effort: "5-10 minutes",
                items: [
                  "Scrambled eggs",
                  "Quesadilla",
                  "Avocado toast",
                  "Instant noodles with an egg",
                  "Rice cakes with toppings",
                  "Smoothie",
                  "Toast with beans",
                ],
              },
              {
                effort: "15-20 minutes",
                items: [
                  "Pasta with jar sauce",
                  "Fried rice (frozen rice + egg + soy sauce)",
                  "Grilled cheese",
                  "Microwave baked potato",
                  "Canned soup with bread",
                  "Stir-fry with frozen veg",
                ],
              },
            ];
            const allSaved = MEALS.flatMap((g) => g.items).filter((m) => savedNDMeals.includes(m));
            const extraSaved = savedNDMeals.filter((m) => !MEALS.flatMap((g) => g.items).includes(m));
            return (
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2">
                  {(["browse", "saved"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setNdMealsTab(tab)}
                      className={cn("px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                        ndMealsTab === tab
                          ? "bg-sage-600 text-white border-sage-600"
                          : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                      )}
                    >
                      {tab === "browse" ? "Browse meals" : `Saved (${savedNDMeals.length})`}
                    </button>
                  ))}
                </div>

                {ndMealsTab === "browse" && (
                  <div className="space-y-5">
                    {MEALS.map((group) => (
                      <div key={group.effort} className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.effort}</p>
                        {group.items.map((meal) => {
                          const saved = savedNDMeals.includes(meal);
                          return (
                            <div
                              key={meal}
                              className="flex items-center justify-between bg-cream-50 border border-slate-100 rounded-xl px-3 py-2.5"
                            >
                              <span className="text-sm text-slate-700">{meal}</span>
                              <button
                                onClick={() => toggleSavedNDMeal(meal)}
                                className={cn("p-1.5 rounded-lg transition-all", saved ? "text-rose-500" : "text-slate-300 hover:text-rose-400")}
                                aria-label={saved ? "Remove from saved" : "Save meal"}
                              >
                                <Heart size={16} fill={saved ? "currentColor" : "none"} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add your own</p>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                          placeholder="Your go-to meal..."
                          value={ndCustomMeal}
                          onChange={(e) => setNdCustomMeal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && ndCustomMeal.trim()) {
                              toggleSavedNDMeal(ndCustomMeal.trim());
                              setNdCustomMeal("");
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (ndCustomMeal.trim()) {
                              toggleSavedNDMeal(ndCustomMeal.trim());
                              setNdCustomMeal("");
                            }
                          }}
                          className="bg-sage-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {ndMealsTab === "saved" && (
                  <div className="space-y-2">
                    {savedNDMeals.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Tap the heart on any meal to save it here.</p>
                    ) : (
                      <>
                        {[...allSaved, ...extraSaved].map((meal) => (
                          <div
                            key={meal}
                            className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5"
                          >
                            <span className="text-sm text-slate-700">{meal}</span>
                            <button
                              onClick={() => toggleSavedNDMeal(meal)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 transition-all"
                              aria-label="Remove from saved"
                            >
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-slate-400 text-center pt-1">Tap the heart to remove.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── sensory-diet: interactive category builder ── */}
          {tool.id === "sensory-diet" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">My Sensory Diet</p>
                <p className="text-xs text-slate-500 mt-0.5">Check activities that work for you. Add your own below each category.</p>
              </div>
              {SENSORY_DIET_CATS.map(({ key, label, desc, activities }) => {
                const selected = sensoryDiet[key] ?? [];
                const customItems = selected.filter((item) => !activities.includes(item));
                return (
                  <div key={key} className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activities.map((activity) => {
                        const checked = selected.includes(activity);
                        return (
                          <button
                            key={activity}
                            onClick={() => toggleSensoryDietItem(key, activity)}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
                              checked ? "bg-sage-600 text-white border-sage-600" : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                            )}
                          >
                            {activity}
                          </button>
                        );
                      })}
                      {customItems.map((item) => (
                        <span key={item} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border bg-sage-100 text-sage-700 border-sage-200">
                          {item}
                          <button onClick={() => toggleSensoryDietItem(key, item)} className="hover:opacity-60"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                        placeholder="Add your own..."
                        value={sdCustomInputs[key] ?? ""}
                        onChange={(e) => setSdCustomInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                        onKeyDown={(e) => {
                          const val = (sdCustomInputs[key] ?? "").trim();
                          if (e.key === "Enter" && val) { addSensoryDietCustom(key, val); setSdCustomInputs((prev) => ({ ...prev, [key]: "" })); }
                        }}
                      />
                      <button
                        onClick={() => {
                          const val = (sdCustomInputs[key] ?? "").trim();
                          if (val) { addSensoryDietCustom(key, val); setSdCustomInputs((prev) => ({ ...prev, [key]: "" })); }
                        }}
                        className="bg-sage-600 text-white px-2.5 py-1.5 rounded-xl hover:bg-sage-700 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {Object.values(sensoryDiet).some((v) => v.length > 0) && (
                <p className="text-xs text-slate-400 text-center">Selections saved automatically.</p>
              )}
            </div>
          )}

          {/* ── easy-food: personal food list builder ── */}
          {tool.id === "easy-food" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">My Easy Food List</p>
                <p className="text-xs text-slate-500 mt-0.5">Tap to add foods that work for you. Add your own in any category.</p>
              </div>
              {EASY_FOOD_CATS.map(({ key, label, suggestions }) => {
                const selected = easyFoodList[key] ?? [];
                const customItems = selected.filter((item) => !suggestions.includes(item));
                return (
                  <div key={key} className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((item) => {
                          const checked = selected.includes(item);
                          return (
                            <button
                              key={item}
                              onClick={() => toggleEasyFoodItem(key, item)}
                              className={cn(
                                "text-xs px-3 py-1.5 rounded-full font-medium border transition-all",
                                checked ? "bg-sage-600 text-white border-sage-600" : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                              )}
                            >
                              {item}
                            </button>
                          );
                        })}
                        {customItems.map((item) => (
                          <span key={item} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border bg-stone-100 text-stone-600 border-stone-200">
                            {item}
                            <button onClick={() => toggleEasyFoodItem(key, item)} className="hover:opacity-60"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    {suggestions.length === 0 && customItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Your safe foods will appear here.</p>
                    )}
                    {suggestions.length === 0 && customItems.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customItems.map((item) => (
                          <span key={item} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border bg-stone-100 text-stone-600 border-stone-200">
                            {item}
                            <button onClick={() => toggleEasyFoodItem(key, item)} className="hover:opacity-60"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                        placeholder="Add your own..."
                        value={efCustomInputs[key] ?? ""}
                        onChange={(e) => setEfCustomInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                        onKeyDown={(e) => {
                          const val = (efCustomInputs[key] ?? "").trim();
                          if (e.key === "Enter" && val) { addEasyFoodCustom(key, val); setEfCustomInputs((prev) => ({ ...prev, [key]: "" })); }
                        }}
                      />
                      <button
                        onClick={() => {
                          const val = (efCustomInputs[key] ?? "").trim();
                          if (val) { addEasyFoodCustom(key, val); setEfCustomInputs((prev) => ({ ...prev, [key]: "" })); }
                        }}
                        className="bg-sage-600 text-white px-2.5 py-1.5 rounded-xl hover:bg-sage-700 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {Object.values(easyFoodList).some((v) => v.length > 0) && (
                <p className="text-xs text-slate-400 text-center">Saved automatically.</p>
              )}
            </div>
          )}

          {/* ── eating-routine: persisted routine textarea ── */}
          {tool.id === "eating-routine" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">My Eating Routine</p>
              <p className="text-xs text-slate-500">Write your planned eating schedule. Saves across sessions.</p>
              <textarea
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none leading-relaxed"
                rows={6}
                placeholder={"e.g.\nBreakfast: 9am - granola bar or yogurt\nLunch: 1pm - something easy, no decisions\nDinner: 6pm - whatever is quick\nSnack: if I notice I'm hungry"}
                value={eatingRoutineDraft}
                onChange={(e) => setEatingRoutineDraft(e.target.value)}
              />
              <button
                onClick={() => setEatingRoutine(eatingRoutineDraft)}
                className="w-full bg-sage-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-sage-700 transition-all"
              >
                Save routine
              </button>
              {eatingRoutine.length > 0 && eatingRoutine === eatingRoutineDraft && (
                <p className="text-xs text-slate-400 text-center">Saved.</p>
              )}
            </div>
          )}

          {/* ── burnout-signs: personal warning signs ── */}
          {tool.id === "burnout-signs" && (
            <div className="space-y-3 pt-1">
              <p className="text-sm font-semibold text-slate-700">My personal warning signs</p>
              <p className="text-xs text-slate-500">Save signs that are specific to you. Persisted across sessions.</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="e.g. I stop replying to messages"
                  value={burnoutSignDraft}
                  onChange={(e) => setBurnoutSignDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && burnoutSignDraft.trim()) {
                      addPersonalBurnoutSign(burnoutSignDraft.trim());
                      setBurnoutSignDraft("");
                    }
                  }}
                />
                <button
                  onClick={() => { if (burnoutSignDraft.trim()) { addPersonalBurnoutSign(burnoutSignDraft.trim()); setBurnoutSignDraft(""); } }}
                  className="bg-rose-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
              {personalBurnoutSigns.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-1">Add warning signs specific to you.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {personalBurnoutSigns.map((sign) => (
                    <span key={sign} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border bg-rose-50 text-rose-700 border-rose-200">
                      {sign}
                      <button onClick={() => removePersonalBurnoutSign(sign)} className="hover:opacity-60"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── emotion-wheel: interactive SVG wheel ── */}
          {tool.id === "emotion-wheel" && <EmotionWheelTool />}

          {/* ── emotion-matrix: fillable 2×2 quadrant ── */}
          {tool.id === "emotion-matrix" && <EmotionMatrixTool />}

          {/* ── feelings-thermometer: visual SVG thermometer ── */}
          {tool.id === "feelings-thermometer" && <FeelingsThermometerTool />}

          {/* ══════════════════════════════════
              EXISTING CONTENT SECTIONS
              ══════════════════════════════════ */}

          {/* Brain Dump special mode */}
          {isBrainDump && (
            <div className="space-y-3">
              <p className="text-slate-600 leading-relaxed">{tool.content.intro}</p>
              <textarea
                className="w-full h-56 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none leading-relaxed"
                placeholder="Write everything here. No filter, no order. Just get it out..."
                value={brainDumpText}
                onChange={(e) => setBrainDumpText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!brainDumpText}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                    brainDumpText ? "bg-cream-50 text-sage-600 border-sage-200 hover:bg-sage-50" : "bg-cream-50 text-slate-300 border-slate-200 cursor-not-allowed"
                  )}
                >
                  <Copy size={14} />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!brainDumpText}
                  className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                    confirmClear ? "bg-red-50 text-red-600 border-red-200"
                    : brainDumpText ? "bg-cream-50 text-slate-500 border-slate-200 hover:bg-slate-50"
                    : "bg-cream-50 text-slate-300 border-slate-200 cursor-not-allowed"
                  )}
                >
                  <Trash2 size={14} />
                  {confirmClear ? "Tap again to clear" : "Clear"}
                </button>
                {confirmClear && (
                  <button onClick={() => setConfirmClear(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500 border border-slate-200 hover:bg-slate-50">Cancel</button>
                )}
              </div>
            </div>
          )}

          {/* Timer */}
          {hasTimer && (
            <div className="bg-sage-50 rounded-2xl p-5 text-center border border-sage-100 space-y-4">
              {tool.id === "chore-hack" && !timerDone && (
                <p className="text-sm text-sage-600 font-medium">Your 2-minute reset is running. Go!</p>
              )}
              <p className={cn(
                "text-5xl font-mono font-bold transition-colors",
                timerDone ? "text-emerald-600" : "text-sage-700"
              )}>
                {fmt(timerSeconds)}
              </p>
              <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden">
                <div className="bg-sage-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${timerProgress}%` }} />
              </div>

              {timerDone ? (
                <div className="space-y-3">
                  <p className="text-emerald-700 font-medium text-sm">
                    {tool.id === "pomodoro-nd" && pomMode === "work"
                      ? `Session ${pomSessions} complete. Take a break.`
                      : "You did it. Take a breath. You showed up."}
                  </p>
                  {tool.id === "pomodoro-nd" && pomMode === "work" && (
                    <div className="flex gap-2 justify-center flex-wrap">
                      {[5, 17, 20].map((m) => (
                        <button key={m} onClick={() => { setPomMode("break"); resetTimer(m); }} className="bg-stone-100 text-stone-700 border border-stone-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-50 transition-all">
                          {m}m break
                        </button>
                      ))}
                      <button onClick={() => { setPomMode("work"); resetTimer(tool.content.timerMinutes ?? 25); }} className="bg-sage-100 text-sage-700 border border-sage-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-sage-50 transition-all">
                        Continue work
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => resetTimer(tool.content.timerMinutes ?? 25)}
                    className="flex items-center gap-2 mx-auto bg-cream-50 text-sage-600 border border-sage-200 px-5 py-2 rounded-xl text-sm font-medium hover:bg-sage-50 transition-all"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              ) : (
                <>
                  {tool.id !== "chore-hack" && (
                    <div className="flex gap-2 justify-center flex-wrap">
                      {(tool.id === "pomodoro-nd" ? [5, 25, 52, 90] : [5, 10, 15, 25, 52]).map((m) => (
                        <button
                          key={m}
                          onClick={() => resetTimer(m)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            timerSeconds === m * 60 && !running ? "bg-sage-600 text-white" : "bg-cream-50 text-slate-600 border border-sage-200"
                          )}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setRunning(!running)}
                      className="bg-sage-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-sage-700 transition-all"
                    >
                      {running ? "Pause" : timerSeconds < defaultSeconds ? "Resume" : "Start"}
                    </button>
                    {timerSeconds < defaultSeconds && (
                      <button
                        onClick={() => resetTimer(tool.content.timerMinutes ?? 25)}
                        className="bg-cream-50 text-slate-500 border border-slate-200 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Variants */}
          {tool.content.variants && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Options</p>
              {tool.content.variants.map((v, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="font-semibold text-slate-800 text-sm">{v.label}</p>
                  <p className="text-sm text-slate-500 mt-1">{v.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Steps (default interactive checkboxes) */}
          {tool.content.steps && !isBrainDump && !suppressDefaultSteps && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Steps</p>
              {tool.content.steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => toggleStep(i)}
                  className={cn(
                    "w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all",
                    stepsDone.includes(i) ? "bg-sage-50 border-sage-200" : "bg-cream-50 border-slate-100 hover:border-sage-200"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    stepsDone.includes(i) ? "bg-sage-500 border-sage-500" : "border-slate-300"
                  )}>
                    {stepsDone.includes(i) && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className={cn("text-sm leading-relaxed", stepsDone.includes(i) ? "text-slate-400 line-through" : "text-slate-700")}>
                    {step}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Brain dump steps (reference only) */}
          {tool.content.steps && isBrainDump && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">How to use</p>
              {tool.content.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2">
                  <span className="text-sage-400 mt-0.5 shrink-0 text-sm font-bold">{i + 1}.</span>
                  <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* Prompts with textareas */}
          {tool.content.prompts && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Reflection prompts</p>
              {tool.content.prompts.map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
                    <p className="text-sm text-slate-700 italic">{p}</p>
                  </div>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none leading-relaxed"
                    rows={3}
                    placeholder="Your response..."
                    value={promptResponses[i] ?? ""}
                    onChange={(e) => setPromptResponses((prev) => ({ ...prev, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {tool.content.tips && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Tips</p>
              {tool.content.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sage-400 mt-0.5 shrink-0">•</span>
                  <p className="text-sm text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* Affirmation */}
          {tool.content.affirmation && (
            <div className="bg-gradient-to-br from-sage-50 to-rose-50 rounded-2xl p-4 border border-sage-100 text-center">
              <p className="text-sm text-slate-700 italic leading-relaxed">
                {tool.content.affirmation}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
