"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Plus, X, ChevronDown, ChevronUp, Heart, Eye, Music, Crosshair, Wind, Utensils, RefreshCw, Activity, Thermometer, Zap, Leaf, Shield } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { LucideIcon } from "lucide-react";

const SENSES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "sight",    label: "Sight / Visual",              icon: Eye },
  { key: "sound",    label: "Sound / Auditory",            icon: Music },
  { key: "touch",    label: "Touch / Tactile",             icon: Crosshair },
  { key: "smell",    label: "Smell / Olfactory",           icon: Wind },
  { key: "taste",    label: "Taste / Gustatory",           icon: Utensils },
  { key: "movement", label: "Movement / Vestibular",       icon: RefreshCw },
  { key: "body",     label: "Body Position / Proprioception", icon: Activity },
  { key: "internal", label: "Internal / Interoception",    icon: Thermometer },
];

const TRIGGER_EXAMPLES: Record<string, string[]> = {
  sight: ["Fluorescent lighting", "Cluttered spaces", "Busy patterns", "Bright screens", "Certain colours", "Bright lights", "Fluorescent lights", "Flashing lights", "Direct sunlight"],
  sound: ["Background chatter", "Sudden loud sounds", "High-pitched noises", "TV on in background", "Busy/crowded spaces", "Echoes", "People chewing", "Repetitive constant sounds"],
  touch: ["Certain fabric textures", "Tags in clothing", "Light unexpected touch", "Wet hands", "Sticky surfaces or substances", "Moisture/dampness", "Hot and cold things (temperature sensitivity)"],
  smell: ["Strong perfume", "Cleaning products", "Food smells", "Candles", "Chemical smells", "Food going bad or rotting", "Garbage smells", "Smoke and pollution"],
  taste: ["Mixed textures", "Strong flavours", "Certain temperatures", "Certain textures", "Unfamiliar foods", "Bitter foods", "Spicy foods"],
  movement: ["Crowded spaces", "Riding in back seat", "Elevators", "Spinning"],
  body: ["Tight clothing", "Sitting still for long", "Being touched lightly"],
  internal: ["Hunger (not always noticed)", "Full bladder (delayed signal)", "Rapid heartbeat"],
};

const SOOTHER_EXAMPLES: Record<string, string[]> = {
  sight: ["Dim warm lighting", "Green/nature scenes", "Tidy space", "Sunglasses", "Natural light", "Calming photos or art", "Soft colours"],
  sound: ["Noise-cancelling headphones", "White/brown noise", "Lo-fi music", "Silence", "Binaural beats", "Nature sounds", "Soundscapes", "Calming music"],
  touch: ["Weighted blanket", "Soft textures", "Deep pressure", "Fidget tools", "Gardening", "Crafting", "Playing with clay"],
  smell: ["Unscented products", "Lavender or familiar safe scents", "Fresh air", "Eucalyptus", "Scented candles"],
  taste: ["Crunchy snacks", "Familiar safe foods", "Cold drinks", "Gum or chewing"],
  movement: ["Rocking", "Bouncing", "Swinging", "Slow rhythmic movement", "Dancing"],
  body: ["Tight hug or compression", "Weighted vest/blanket", "Stretching", "Heavy work"],
  internal: ["Deep belly breathing", "Cold water on face", "Slow meals", "Regular check-in reminders"],
};

const ACCOMMODATOR_EXAMPLES: Record<string, string[]> = {
  sight: ["Wear tinted glasses indoors", "Use warm-toned lightbulbs", "Keep a tidy desk zone"],
  sound: ["Use headphones in shared spaces", "Request quiet work areas", "Give heads up before loud sounds"],
  touch: ["Remove tags from clothing", "Choose seam-free socks", "Keep comfort textures nearby"],
  smell: ["Request fragrance-free environments", "Carry personal familiar scent", "Ventilate rooms"],
  taste: ["Batch prep safe foods", "Keep safe snacks accessible", "Communicate food needs"],
  movement: ["Take movement breaks", "Use a wobble cushion or standing desk", "Stim freely in safe spaces"],
  body: ["Wear compression clothing", "Schedule body breaks", "Communicate touch preferences"],
  internal: ["Set eating/drinking reminders", "Use bathroom break reminders", "Track patterns in check-in log"],
};

type TabKey = "triggers" | "soothers" | "accommodators";

const TAB_CONFIG: { key: TabKey; label: string; icon: LucideIcon; color: string; description: string }[] = [
  {
    key: "triggers",
    label: "Triggers",
    icon: Zap,
    color: "bg-red-100 text-red-700 border-red-300",
    description: "Sensory input that causes distress, overwhelm, or dysregulation",
  },
  {
    key: "soothers",
    label: "Soothers",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    description: "Sensory input that calms, regulates, or restores your nervous system",
  },
  {
    key: "accommodators",
    label: "Accommodators",
    icon: Shield,
    color: "bg-sage-100 text-sage-700 border-sage-300",
    description: "Changes, tools, or strategies that reduce sensory impact",
  },
];

export default function SensoryProfilePage() {
  const { sensoryProfile, updateSensoryProfile, toggleFavorite, isFavorite } = useAppStore();
  const favorite = isFavorite("sensory-profile");
  const [activeTab, setActiveTab] = useState<TabKey>("triggers");
  const [expandedSense, setExpandedSense] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [activeSenseInput, setActiveSenseInput] = useState<string | null>(null);

  const getItems = (senseKey: string): string[] =>
    sensoryProfile[activeTab][senseKey] ?? [];

  const addItem = (senseKey: string, text: string) => {
    if (!text.trim()) return;
    updateSensoryProfile({
      ...sensoryProfile,
      [activeTab]: {
        ...sensoryProfile[activeTab],
        [senseKey]: [...(sensoryProfile[activeTab][senseKey] ?? []), text.trim()],
      },
    });
  };

  const removeItem = (senseKey: string, idx: number) => {
    updateSensoryProfile({
      ...sensoryProfile,
      [activeTab]: {
        ...sensoryProfile[activeTab],
        [senseKey]: (sensoryProfile[activeTab][senseKey] ?? []).filter((_, i) => i !== idx),
      },
    });
  };

  const addExample = (senseKey: string, example: string) => {
    const items = getItems(senseKey);
    if (!items.includes(example)) addItem(senseKey, example);
  };

  const tab = TAB_CONFIG.find(t => t.key === activeTab)!;
  const exampleMap =
    activeTab === "triggers"
      ? TRIGGER_EXAMPLES
      : activeTab === "soothers"
      ? SOOTHER_EXAMPLES
      : ACCOMMODATOR_EXAMPLES;

  const totalItems = SENSES.reduce((acc, s) => acc + getItems(s.key).length, 0);

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tools" className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">Sensory Profile</h1>
          <p className="text-sm text-slate-500">Map your sensory world</p>
        </div>
        <button onClick={() => toggleFavorite("sensory-profile")} className="p-2 rounded-xl hover:bg-slate-100">
          <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-sage-50 rounded-2xl p-4 border border-green-100">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>Your sensory needs are valid.</strong> This profile helps you understand what overwhelms you, what helps, and what changes support your nervous system.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TAB_CONFIG.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5",
              activeTab === t.key ? t.color : "bg-cream-50 text-slate-500 border-slate-200"
            )}
          >
            <t.icon size={13} className="opacity-80" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-cream-50 rounded-xl px-4 py-3 border border-slate-100">
        <p className="text-sm text-slate-600">{tab.description}</p>
        <p className="text-xs text-slate-400 mt-1">
          {totalItems} item{totalItems !== 1 ? "s" : ""} logged across all senses
        </p>
      </div>

      {/* Senses */}
      <div className="space-y-3">
        {SENSES.map(sense => {
          const items = getItems(sense.key);
          const examples = (exampleMap[sense.key] ?? []).filter(e => !items.includes(e));
          const isOpen = expandedSense === sense.key;

          return (
            <div key={sense.key} className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedSense(isOpen ? null : sense.key)}
                className="w-full text-left p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-sage-50 flex items-center justify-center shrink-0">
                  <sense.icon size={16} className="text-sage-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{sense.label}</p>
                  <p className="text-xs text-slate-400">
                    {items.length} item{items.length !== 1 ? "s" : ""} logged
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp size={16} className="text-slate-400" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
                  {/* Current items */}
                  {items.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {items.map((item, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border",
                            tab.color
                          )}
                        >
                          {item}
                          <button onClick={() => removeItem(sense.key, idx)} className="hover:opacity-60">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Custom input */}
                  {activeSenseInput === sense.key ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                        placeholder={`Add ${
                          activeTab === "triggers"
                            ? "trigger"
                            : activeTab === "soothers"
                            ? "soother"
                            : "accommodation"
                        }...`}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            addItem(sense.key, inputText);
                            setInputText("");
                            setActiveSenseInput(null);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          addItem(sense.key, inputText);
                          setInputText("");
                          setActiveSenseInput(null);
                        }}
                        className="bg-sage-600 text-white px-3 rounded-xl hover:bg-sage-700"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setInputText("");
                          setActiveSenseInput(null);
                        }}
                        className="border border-slate-200 text-slate-500 px-3 rounded-xl hover:bg-slate-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSenseInput(sense.key)}
                      className="flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium"
                    >
                      <Plus size={15} /> Add your own
                    </button>
                  )}

                  {/* Examples */}
                  {examples.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Tap to add common {activeTab}:</p>
                      <div className="flex flex-wrap gap-2">
                        {examples.map(ex => (
                          <button
                            key={ex}
                            onClick={() => addExample(sense.key, ex)}
                            className="text-xs px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full border border-slate-200 hover:border-sage-300 hover:text-sage-700 transition-all"
                          >
                            + {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {Object.values(sensoryProfile).some(tab =>
        Object.values(tab).some((arr: unknown) => (arr as string[]).length > 0)
      ) && (
        <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
          <p className="text-sm font-semibold text-sage-700 mb-2">Your sensory profile is taking shape</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            This profile can be shared with therapists, occupational therapists, or trusted people in your life to help them understand your sensory needs.
          </p>
        </div>
      )}
    </div>
  );
}
