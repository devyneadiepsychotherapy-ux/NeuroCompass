"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, X, ChevronRight, Trash2, Check, Heart, Eye, Music, Crosshair, Wind, Utensils, RefreshCw, Activity, Thermometer, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { LucideIcon } from "lucide-react";

function BackLink() {
  const searchParams = useSearchParams();
  const backHref = searchParams.get("from") === "me" ? "/me" : "/tools";
  return (
    <Link href={backHref} className="p-2 rounded-xl hover:bg-slate-100">
      <ArrowLeft size={20} className="text-slate-500" />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SENSES: { key: string; label: string; icon: LucideIcon; prompt: string }[] = [
  { key: "touch",          label: "Touch",          icon: Crosshair,   prompt: "What textures feel calming? (e.g. soft blanket, smooth stone)" },
  { key: "sound",          label: "Sound",          icon: Music,       prompt: "What sounds help you regulate? (e.g. rain, lo-fi music, silence)" },
  { key: "sight",          label: "Sight",          icon: Eye,         prompt: "What visual environments feel calming? (e.g. low lighting, nature, tidy space)" },
  { key: "smell",          label: "Smell",          icon: Wind,        prompt: "What scents help you feel grounded? (e.g. lavender, citrus)" },
  { key: "taste",          label: "Taste",          icon: Utensils,    prompt: "What tastes feel grounding or comforting?" },
  { key: "proprioception", label: "Proprioception", icon: Activity,    prompt: "What deep pressure or movement helps? (e.g. weighted blanket, jumping, stretching)" },
  { key: "vestibular",     label: "Vestibular",     icon: RefreshCw,   prompt: "What movement or stillness helps regulate you? (e.g. rocking, swinging, lying flat)" },
];

const STEPS = ["Senses", "Per sense", "Build kit", "Your kit"];

const SENSE_EXAMPLES: Record<string, string[]> = {
  sight: ["Fairy lights", "Nature photos", "Lava lamp", "Calming colours", "Dim lighting", "Fish tank"],
  sound: ["White noise", "Lo-fi music", "Rain sounds", "Noise-cancelling headphones", "Silence", "Soft music"],
  touch: ["Weighted blanket", "Fidget toys", "Soft fabric", "Warm bath", "Smooth stones", "Putty"],
  smell: ["Lavender", "Familiar scents", "Unscented space", "Essential oils", "Favourite candle", "Fresh air"],
  taste: ["Strong mints", "Sour candy", "Crunchy snacks", "Warm tea", "Chewing gum", "Familiar comfort food"],
  proprioception: ["Rocking", "Swaying", "Walking", "Jumping", "Stretching", "Fidgeting"],
  vestibular: ["Rocking", "Swaying", "Walking", "Jumping", "Stretching", "Fidgeting"],
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagInput({
  items,
  onAdd,
  onRemove,
  placeholder,
  tagColor = "bg-sage-100 text-sage-700 border-sage-200",
}: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
  tagColor?: string;
}) {
  const [input, setInput] = useState("");
  const commit = () => {
    if (input.trim()) { onAdd(input.trim()); setInput(""); }
  };
  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border", tagColor)}>
              {item}
              <button onClick={() => onRemove(i)} className="hover:opacity-60"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") commit(); }}
        />
        <button
          onClick={commit}
          disabled={!input.trim()}
          className="bg-sage-600 text-white px-3 rounded-xl hover:bg-sage-700 disabled:opacity-40 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SensorySoothingKitPage() {
  const { soothingKits, addSoothingKit, updateSoothingKit, deleteSoothingKit, toggleFavorite, isFavorite } = useAppStore();
  const favorite = isFavorite("sensory-soothing-kit");

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [selectedSenses, setSelectedSenses] = useState<string[]>([]);
  const [senseIndex, setSenseIndex] = useState(0);
  const [senseItems, setSenseItems] = useState<Record<string, string[]>>({});
  const [physicalItems, setPhysicalItems] = useState<string[]>([]);
  const [kitName, setKitName] = useState("My Calm Kit");
  const [viewingKit, setViewingKit] = useState<string | null>(null);
  const [editingKit, setEditingKit] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState<Record<string, boolean>>({});

  // Step 0: sense selection
  const toggleSense = (key: string) => {
    setSelectedSenses(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  // Step 1: per-sense items
  const currentSense = SENSES.find(s => s.key === selectedSenses[senseIndex]);
  const addSenseItem = (senseKey: string, value: string) => {
    setSenseItems(prev => ({ ...prev, [senseKey]: [...(prev[senseKey] ?? []), value] }));
  };
  const removeSenseItem = (senseKey: string, idx: number) => {
    setSenseItems(prev => ({ ...prev, [senseKey]: (prev[senseKey] ?? []).filter((_, i) => i !== idx) }));
  };

  // Step 2: physical items
  const addPhysical = (value: string) => setPhysicalItems(prev => [...prev, value]);
  const removePhysical = (idx: number) => setPhysicalItems(prev => prev.filter((_, i) => i !== idx));

  // Save kit
  const saveKit = () => {
    addSoothingKit({
      name: kitName.trim() || "My Calm Kit",
      selectedSenses,
      senseItems,
      physicalItems,
    });
    // reset builder
    setStep(3);
    setSelectedSenses([]);
    setSenseIndex(0);
    setSenseItems({});
    setPhysicalItems([]);
    setKitName("My Calm Kit");
  };

  const activeSense = SENSES.find(s => s.key === selectedSenses[senseIndex]);

  // ---------------------------------------------------------------------------
  // Render: existing kits list (step 3 / default)
  // ---------------------------------------------------------------------------

  if (step === 3 || (step === 0 && soothingKits.length > 0 && !viewingKit && !editingKit)) {
    // After saving, show the saved kits
    const kit = viewingKit ? soothingKits.find(k => k.id === viewingKit) : null;

    if (kit) {
      return (
        <div className="px-4 pt-12 pb-8 space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewingKit(null)} className="p-2 rounded-xl hover:bg-slate-100">
              <ArrowLeft size={20} className="text-slate-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{kit.name}</h1>
              <p className="text-sm text-slate-500">Your soothing kit</p>
            </div>
          </div>

          {kit.selectedSenses.map(sKey => {
            const sense = SENSES.find(s => s.key === sKey);
            const items = kit.senseItems[sKey] ?? [];
            if (!sense || items.length === 0) return null;
            const IC = sense.icon;
            return (
              <div key={sKey} className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <IC size={14} className="text-sage-500" />
                  <p className="font-semibold text-slate-800 text-sm">{sense.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, i) => (
                    <span key={i} className="text-xs bg-sage-50 text-sage-700 px-3 py-1.5 rounded-full border border-sage-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {kit.physicalItems.length > 0 && (
            <div className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingCart size={14} className="text-stone-500" />
                <p className="font-semibold text-slate-800 text-sm">Items to gather</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {kit.physicalItems.map((item, i) => (
                  <span key={i} className="text-xs bg-stone-50 text-stone-600 px-3 py-1.5 rounded-full border border-stone-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (confirmDelete === kit.id) {
                deleteSoothingKit(kit.id);
                setViewingKit(null);
                setConfirmDelete(null);
                setStep(0);
              } else {
                setConfirmDelete(kit.id);
              }
            }}
            className={cn(
              "w-full py-2.5 rounded-xl text-sm font-medium border transition-all",
              confirmDelete === kit.id
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-cream-50 text-slate-500 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Trash2 size={14} className="inline mr-2" />
            {confirmDelete === kit.id ? "Tap again to delete this kit" : "Delete kit"}
          </button>
          {confirmDelete === kit.id && (
            <button onClick={() => setConfirmDelete(null)} className="w-full text-xs text-slate-400 text-center">
              Cancel
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="px-4 pt-12 pb-8 space-y-5">
        <div className="flex items-center gap-3">
          <Suspense fallback={<Link href="/tools" className="p-2 rounded-xl hover:bg-slate-100"><ArrowLeft size={20} className="text-slate-500" /></Link>}>
            <BackLink />
          </Suspense>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Sensory Soothing Kit</h1>
            <p className="text-sm text-slate-500">Your personalised regulation toolkit</p>
          </div>
          <button onClick={() => toggleFavorite("sensory-soothing-kit")} className="p-2 rounded-xl hover:bg-slate-100">
            <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
          </button>
        </div>

        {step === 3 && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700 font-medium">Kit saved. You can build more below.</p>
          </div>
        )}

        <div className="space-y-3">
          {soothingKits.map(k => (
            <button
              key={k.id}
              onClick={() => setViewingKit(k.id)}
              className="w-full text-left bg-cream-50 rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-sage-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-sage-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{k.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {k.selectedSenses.length} sense{k.selectedSenses.length !== 1 ? "s" : ""} covered
                  {k.physicalItems.length > 0 && ` · ${k.physicalItems.length} item${k.physicalItems.length !== 1 ? "s" : ""} to gather`}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>

        <button
          onClick={() => { setStep(0); setSenseIndex(0); setSelectedSenses([]); setSenseItems({}); setPhysicalItems([]); setKitName("My Calm Kit"); }}
          className="w-full bg-sage-600 text-white font-semibold rounded-2xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.98]"
        >
          + Build a new kit
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 0: Sense selection
  // ---------------------------------------------------------------------------

  if (step === 0) {
    return (
      <div className="px-4 pt-12 pb-8 space-y-5">
        <div className="flex items-center gap-3">
          <Suspense fallback={<Link href="/tools" className="p-2 rounded-xl hover:bg-slate-100"><ArrowLeft size={20} className="text-slate-500" /></Link>}>
            <BackLink />
          </Suspense>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Sensory Soothing Kit</h1>
            <p className="text-sm text-slate-500">Step 1 of 4</p>
          </div>
          <button onClick={() => toggleFavorite("sensory-soothing-kit")} className="p-2 rounded-xl hover:bg-slate-100">
            <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn("w-full h-1.5 rounded-full transition-all", i === step ? "bg-sage-500" : i < step ? "bg-sage-300" : "bg-slate-200")} />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-slate-800">Which senses need soothing?</p>
          <p className="text-sm text-slate-500">Pick all that apply. You can always come back and build more kits.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SENSES.map(sense => {
            const IC = sense.icon;
            return (
              <button
                key={sense.key}
                onClick={() => toggleSense(sense.key)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border text-left transition-all",
                  selectedSenses.includes(sense.key)
                    ? "bg-sage-50 border-sage-300"
                    : "bg-cream-50 border-slate-100 hover:border-sage-200"
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-sage-50 flex items-center justify-center shrink-0">
                  <IC size={16} className="text-sage-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{sense.label}</p>
                </div>
                {selectedSenses.includes(sense.key) && (
                  <div className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => { setSenseIndex(0); setStep(1); }}
          disabled={selectedSenses.length === 0}
          className="w-full bg-sage-600 text-white font-semibold rounded-2xl py-3 text-sm hover:bg-sage-700 disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          Next: fill in your kit
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 1: Per-sense prompts
  // ---------------------------------------------------------------------------

  if (step === 1) {
    const isLast = senseIndex >= selectedSenses.length - 1;

    return (
      <div className="px-4 pt-12 pb-8 space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (senseIndex === 0) setStep(0); else setSenseIndex(i => i - 1); }}
            className="p-2 rounded-xl hover:bg-slate-100"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sensory Soothing Kit</h1>
            <p className="text-sm text-slate-500">Step 2 of 4 ({senseIndex + 1}/{selectedSenses.length})</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1">
              <div className={cn("w-full h-1.5 rounded-full transition-all", i <= 1 ? "bg-sage-500" : "bg-slate-200")} />
            </div>
          ))}
        </div>

        {/* Sense progress */}
        <div className="flex gap-1.5">
          {selectedSenses.map((sKey, i) => {
            const s = SENSES.find(x => x.key === sKey);
            const IC = s?.icon;
            return (
              <div key={sKey} className={cn("flex-1 h-8 rounded-xl flex items-center justify-center transition-all", i === senseIndex ? "bg-sage-100 border border-sage-300" : i < senseIndex ? "bg-sage-500" : "bg-slate-100")}>
                {IC && <IC size={14} className={i < senseIndex ? "text-white" : "text-sage-500"} />}
              </div>
            );
          })}
        </div>

        {activeSense && (
          <div className="space-y-4">
            <div className="bg-sage-50 rounded-2xl p-4 border border-sage-100">
              <div className="flex items-center gap-2 mb-1">
                <activeSense.icon size={16} className="text-sage-500" />
                <p className="font-semibold text-slate-800">{activeSense.label}</p>
              </div>
              <p className="text-sm text-slate-600 italic">{activeSense.prompt}</p>
            </div>

            {/* Collapsible examples */}
            {SENSE_EXAMPLES[activeSense.key] && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowExamples((prev) => ({ ...prev, [activeSense.key]: !prev[activeSense.key] }))}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <span>Examples</span>
                  <ChevronRight size={16} className={cn("transition-transform duration-200", showExamples[activeSense.key] ? "rotate-90" : "")} />
                </button>
                {showExamples[activeSense.key] && (
                  <div className="px-4 py-3 bg-white space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {SENSE_EXAMPLES[activeSense.key].map((ex) => {
                        const alreadyAdded = (senseItems[activeSense.key] ?? []).includes(ex);
                        return (
                          <button
                            key={ex}
                            onClick={() => { if (!alreadyAdded) addSenseItem(activeSense.key, ex); }}
                            disabled={alreadyAdded}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-full border transition-all",
                              alreadyAdded
                                ? "bg-sage-100 text-sage-600 border-sage-200 cursor-default"
                                : "bg-sage-50 text-sage-700 border-sage-200 hover:bg-sage-100"
                            )}
                          >
                            {alreadyAdded ? "✓ " : "+ "}{ex}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400">Tap an example to add it to your list.</p>
                  </div>
                )}
              </div>
            )}

            <TagInput
              items={senseItems[activeSense.key] ?? []}
              onAdd={(v) => addSenseItem(activeSense.key, v)}
              onRemove={(i) => removeSenseItem(activeSense.key, i)}
              placeholder={`What helps with ${activeSense.label.toLowerCase()}?`}
            />
          </div>
        )}

        <button
          onClick={() => { if (isLast) setStep(2); else setSenseIndex(i => i + 1); }}
          className="w-full bg-sage-600 text-white font-semibold rounded-2xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.98]"
        >
          {isLast ? "Next: build your kit" : `Next: ${SENSES.find(s => s.key === selectedSenses[senseIndex + 1])?.label}`}
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2: Kit builder (physical items + name)
  // ---------------------------------------------------------------------------

  if (step === 2) {
    return (
      <div className="px-4 pt-12 pb-8 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { setSenseIndex(selectedSenses.length - 1); setStep(1); }} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Build Your Kit</h1>
            <p className="text-sm text-slate-500">Step 3 of 4</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1">
              <div className={cn("w-full h-1.5 rounded-full transition-all", i <= 2 ? "bg-sage-500" : "bg-slate-200")} />
            </div>
          ))}
        </div>

        {/* Summary of sense items */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-800">What you've added so far</p>
          {selectedSenses.map(sKey => {
            const sense = SENSES.find(s => s.key === sKey);
            const items = senseItems[sKey] ?? [];
            if (!sense) return null;
            const IC = sense.icon;
            return (
              <div key={sKey} className="bg-cream-50 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <IC size={13} className="text-sage-500" />
                  <p className="text-sm font-medium text-slate-700">{sense.label}</p>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nothing added</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                      <span key={i} className="text-xs bg-sage-50 text-sage-700 px-2.5 py-1 rounded-full border border-sage-100">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Physical items */}
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-slate-800">Physical items to gather</p>
            <p className="text-sm text-slate-500 mt-0.5">Actual objects for your kit (e.g. fidget cube, ear defenders, sunglasses)</p>
          </div>
          <TagInput
            items={physicalItems}
            onAdd={addPhysical}
            onRemove={removePhysical}
            placeholder="e.g. weighted blanket, noise-cancelling headphones..."
            tagColor="bg-stone-100 text-stone-600 border-stone-200"
          />
        </div>

        {/* Kit name */}
        <div className="space-y-2">
          <p className="font-semibold text-slate-800">Name your kit</p>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. My Calm Kit, Office Kit, Crisis Kit"
            value={kitName}
            onChange={e => setKitName(e.target.value)}
          />
        </div>

        <button
          onClick={saveKit}
          className="w-full bg-sage-600 text-white font-semibold rounded-2xl py-3 text-sm hover:bg-sage-700 transition-all active:scale-[0.98]"
        >
          Save my kit
        </button>
      </div>
    );
  }

  return null;
}
