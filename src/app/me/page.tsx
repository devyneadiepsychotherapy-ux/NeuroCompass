"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Leaf, Zap, Shield, Sparkles, ListChecks, Plus,
  Trash2, Check, ChevronDown, ChevronUp, X, User, ChevronRight,
  BatteryLow, BatteryMedium, BatteryFull, Heart,
  LayoutGrid, LayoutList,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { SpecialInterest, UserList, EnergyItem, ToolFavorite } from "@/types";
import { TOOLS } from "@/lib/tools-data";
import { ICON_MAP } from "@/lib/icon-map";

// ---------------------------------------------------------------------------
// ND Strengths data
// ---------------------------------------------------------------------------

const ND_STRENGTHS: Record<string, string[]> = {
  ADHD: ["Hyperfocus", "Creativity", "Thinking outside the box"],
  Autism: ["Deep expertise", "Pattern recognition", "Loyalty and honesty"],
  OCD: ["Attention to detail", "Thoroughness", "Commitment"],
  Dyslexia: ["Visual thinking", "Big-picture perspective", "Problem solving"],
  Dyscalculia: ["Creative approaches", "Verbal strengths", "Lateral thinking"],
  Dyspraxia: ["Resilience", "Adaptability", "Empathy"],
};

// ---------------------------------------------------------------------------
// ND Strengths card  (muted sage green)
// ---------------------------------------------------------------------------

function NDStrengthsCard({ ndIdentities }: { ndIdentities: string[] }) {
  if (ndIdentities.length === 0) {
    return (
      <div className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-2" style={{ borderColor: '#D0DCCB' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#D8E4D6' }}>
            <Brain size={16} style={{ color: '#5E7A6E' }} />
          </div>
          <p className="text-sm font-semibold text-slate-800">ND Strengths</p>
        </div>
        <p className="text-sm text-slate-500">Add your ND identity to see your associated strengths.</p>
        <Link
          href="/strengths"
          className="inline-flex items-center justify-center gap-1.5 mt-2 w-full min-h-[44px] active:scale-[0.98] text-sm font-semibold rounded-xl px-4 py-2.5 transition-all"
          style={{ background: '#E8EDE6', color: '#5E7A6E' }}
        >
          Add your ND strengths
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-4" style={{ borderColor: '#D0DCCB' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#D8E4D6' }}>
          <Brain size={16} style={{ color: '#5E7A6E' }} />
        </div>
        <p className="text-sm font-semibold text-slate-800">ND Strengths</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ndIdentities.flatMap((identity) =>
          (ND_STRENGTHS[identity] ?? []).map((s) => (
            <span
              key={`${identity}-${s}`}
              className="text-xs border px-2.5 py-1 rounded-full"
              style={{ background: '#F0F4EE', color: '#5E7A6E', borderColor: '#D0DCCB' }}
            >
              {s}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Energy Accounting card  (dusty gold)
// ---------------------------------------------------------------------------

const DRAIN_INTENSITY_COLORS: Record<string, string> = {
  low: "bg-orange-50 text-orange-600",
  medium: "bg-red-50 text-red-600",
  high: "bg-red-100 text-red-700",
};

const RESTORE_INTENSITY_COLORS: Record<string, string> = {
  low: "bg-teal-50 text-teal-600",
  medium: "bg-emerald-50 text-emerald-600",
  high: "bg-emerald-100 text-emerald-700",
};

function IntensityIcon({ intensity, type }: { intensity: EnergyItem["intensity"]; type: "drain" | "restore" }) {
  const color = type === "drain" ? "text-red-400" : "text-emerald-500";
  if (intensity === "low") return <BatteryLow size={11} className={color} />;
  if (intensity === "medium") return <BatteryMedium size={11} className={color} />;
  return <BatteryFull size={11} className={color} />;
}

function EnergyColumn({
  title,
  type,
  items,
  onAdd,
  onRemove,
}: {
  title: string;
  type: "drain" | "restore";
  items: EnergyItem[];
  onAdd: (item: Omit<EnergyItem, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [intensity, setIntensity] = useState<EnergyItem["intensity"]>("medium");
  const isDrain = type === "drain";
  const headerColor = isDrain ? "text-red-600" : "text-emerald-600";
  const ringColor = isDrain ? "focus:ring-red-200" : "focus:ring-emerald-200";
  const addBg = isDrain ? "bg-red-50 hover:bg-red-100 text-red-600" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600";
  const activeLevel = isDrain ? "bg-red-500 text-white" : "bg-emerald-500 text-white";
  const intensityColors = isDrain ? DRAIN_INTENSITY_COLORS : RESTORE_INTENSITY_COLORS;

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd({ label: label.trim(), intensity });
    setLabel("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {isDrain
          ? <BatteryLow size={12} className="text-red-500" />
          : <BatteryFull size={12} className="text-emerald-500" />
        }
        <p className={cn("text-xs font-semibold", headerColor)}>{title}</p>
      </div>

      <div className="space-y-1.5 min-h-[2rem]">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-2 py-1.5 border",
              isDrain ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
            )}
          >
            <IntensityIcon intensity={item.intensity} type={type} />
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0", intensityColors[item.intensity])}>
              {item.intensity}
            </span>
            <p className="flex-1 text-xs text-slate-700 truncate">{item.label}</p>
            <button
              onClick={() => onRemove(item.id)}
              className="p-0.5 text-slate-300 hover:text-red-400 transition-colors shrink-0"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <input
          className={cn("w-full border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 bg-white", ringColor)}
          placeholder={isDrain ? "Add drain..." : "Add restorer..."}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <div className="flex gap-1">
          {(["low", "medium", "high"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setIntensity(lvl)}
              className={cn(
                "flex-1 text-[10px] rounded-lg py-1 font-semibold capitalize transition-all",
                intensity === lvl ? activeLevel : "bg-stone-100 text-slate-500 hover:bg-stone-200"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
        <button
          onClick={handleAdd}
          disabled={!label.trim()}
          className={cn(
            "w-full flex items-center justify-center gap-1 text-xs font-semibold rounded-xl py-1.5 transition-all disabled:opacity-40",
            addBg
          )}
        >
          <Plus size={11} />
          Add
        </button>
      </div>
    </div>
  );
}

function EnergyAccountingCard() {
  const {
    energyDrains, energyRestorers,
    addEnergyDrain, removeEnergyDrain,
    addEnergyRestorer, removeEnergyRestorer,
  } = useAppStore();

  return (
    <div className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-4" style={{ borderColor: '#E0D5A8' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EDE5C8' }}>
          <Zap size={16} style={{ color: '#9B8A4A' }} />
        </div>
        <p className="text-sm font-semibold text-slate-800">Energy Accounting</p>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Track activities that drain or restore your energy to understand your patterns.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <EnergyColumn
          title="Energy Drains"
          type="drain"
          items={energyDrains}
          onAdd={addEnergyDrain}
          onRemove={removeEnergyDrain}
        />
        <EnergyColumn
          title="Energy Gains"
          type="restore"
          items={energyRestorers}
          onAdd={addEnergyRestorer}
          onRemove={removeEnergyRestorer}
        />
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">Today&apos;s balance</p>
        <p className="text-xs font-semibold text-slate-700">
          {energyDrains.length} drain{energyDrains.length !== 1 ? "s" : ""},
          {" "}{energyRestorers.length} restorer{energyRestorers.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My Tools card  (soft lavender) — with grid/list toggle
// ---------------------------------------------------------------------------

function MyToolsCard({ favorites }: { favorites: ToolFavorite[] }) {
  const favTools = TOOLS.filter((t) => favorites.some((f) => f.toolId === t.id));
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3" style={{ borderColor: '#DDD9F0' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EAE8F2' }}>
            <Heart size={16} style={{ color: '#7775A4' }} />
          </div>
          <p className="text-sm font-semibold text-slate-800">My Tools</p>
        </div>
        <div className="flex items-center gap-2">
          {favTools.length > 0 && (
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1 rounded transition-all",
                  viewMode === "list" ? "bg-slate-100 text-slate-600" : "text-slate-300 hover:text-slate-500"
                )}
                aria-label="List view"
              >
                <LayoutList size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1 rounded transition-all",
                  viewMode === "grid" ? "bg-slate-100 text-slate-600" : "text-slate-300 hover:text-slate-500"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          )}
          <Link href="/tools" className="text-xs font-medium" style={{ color: '#7775A4' }}>
            Browse all
          </Link>
        </div>
      </div>

      {favTools.length === 0 ? (
        <div className="text-center py-2 space-y-1">
          <p className="text-sm text-slate-500">You haven&apos;t favourited any tools yet.</p>
          <Link
            href="/tools"
            className="text-xs font-medium underline underline-offset-2"
            style={{ color: '#7775A4' }}
          >
            Browse Tools to get started
          </Link>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {favTools.map((tool) => {
            const IC = ICON_MAP[tool.icon];
            const inner = (
              <>
                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                  {IC && <IC size={14} className="text-slate-600 opacity-70" />}
                </div>
                <p className="flex-1 text-sm font-medium text-slate-700 truncate">{tool.title}</p>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </>
            );
            const cls =
              "flex items-center gap-2.5 bg-white/60 border border-slate-100 rounded-xl px-3 py-2 transition-all active:scale-[0.98]";
            const href = tool.linkTo ? `${tool.linkTo}?from=me` : "/tools";
            return (
              <Link key={tool.id} href={href} className={cls} style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#DDD9F0')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {favTools.map((tool) => {
            const IC = ICON_MAP[tool.icon];
            const href = tool.linkTo ? `${tool.linkTo}?from=me` : "/tools";
            return (
              <Link
                key={tool.id}
                href={href}
                className="flex flex-col items-center gap-2 p-3 bg-white/60 border border-slate-100 rounded-xl transition-all active:scale-[0.98]"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#DDD9F0')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  {IC && <IC size={18} className="text-slate-600 opacity-70" />}
                </div>
                <p className="text-xs font-medium text-slate-700 text-center leading-tight">{tool.title}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sensory Profile Summary card
// ---------------------------------------------------------------------------

function SensoryProfileSummaryCard({
  triggers,
  soothers,
}: {
  triggers: Record<string, string[]>;
  soothers: Record<string, string[]>;
}) {
  const allTriggers = Object.values(triggers).flat();
  const allSoothers = Object.values(soothers).flat();
  const hasAny = allTriggers.length > 0 || allSoothers.length > 0;

  return (
    <div className="bg-cream-50 rounded-2xl border border-green-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
            <Leaf size={16} className="text-green-700" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Sensory Profile</p>
        </div>
        <Link href="/tools/sensory-profile?from=me" className="text-xs text-sage-600 font-medium">
          {hasAny ? "Edit" : "Build profile"}
        </Link>
      </div>

      {!hasAny ? (
        <div className="text-center py-2 space-y-1">
          <p className="text-sm text-slate-500">Map what overwhelms you and what helps.</p>
          <Link
            href="/tools/sensory-profile?from=me"
            className="text-xs text-sage-600 font-medium underline underline-offset-2"
          >
            Build your sensory profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Zap size={11} className="text-red-500" />
              <p className="text-xs font-semibold text-red-600">Triggers</p>
            </div>
            {allTriggers.length === 0 ? (
              <p className="text-xs text-slate-400">None added</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {allTriggers.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100"
                  >
                    {t}
                  </span>
                ))}
                {allTriggers.length > 4 && (
                  <span className="text-xs text-slate-400">+{allTriggers.length - 4} more</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Shield size={11} className="text-emerald-500" />
              <p className="text-xs font-semibold text-emerald-600">Soothers</p>
            </div>
            {allSoothers.length === 0 ? (
              <p className="text-xs text-slate-400">None added</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {allSoothers.slice(0, 4).map((s, i) => (
                  <span
                    key={i}
                    className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100"
                  >
                    {s}
                  </span>
                ))}
                {allSoothers.length > 4 && (
                  <span className="text-xs text-slate-400">+{allSoothers.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {hasAny && (
        <Link
          href="/tools/sensory-profile?from=me"
          className="flex items-center gap-0.5 text-xs text-sage-600 font-medium hover:text-sage-700 transition-colors"
        >
          View full profile
          <ChevronRight size={13} />
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Special Interests card  (dusty terracotta)
// ---------------------------------------------------------------------------

const INTENSITY_COLORS: Record<string, string> = {
  casual: "bg-stone-100 text-stone-600",
  active: "bg-[#e8d8d2] text-[#8f6559]",
  hyperfocused: "bg-red-100 text-red-700",
};

const INTENSITY_LABELS: Record<string, string> = {
  casual: "Casual",
  active: "Active",
  hyperfocused: "Hyperfocused",
};

function SpecialInterestsCard({ interests }: { interests: SpecialInterest[] }) {
  const sorted = [...interests].sort((a, b) => {
    const order = { hyperfocused: 0, active: 1, casual: 2 };
    return order[a.intensity] - order[b.intensity];
  });
  const preview = sorted.slice(0, 3);

  return (
    <div className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3" style={{ borderColor: '#E0CCC7' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EDD8D2' }}>
            <Sparkles size={16} style={{ color: '#9B6B60' }} />
          </div>
          <p className="text-sm font-semibold text-slate-800">My Special Interests</p>
        </div>
        <Link href="/special-interests" className="text-xs text-sage-600 font-medium">
          {interests.length > 0 ? "View all" : "Add interests"}
        </Link>
      </div>

      {interests.length === 0 ? (
        <div className="text-center py-2 space-y-1">
          <p className="text-sm text-slate-500">Your special interests are a superpower.</p>
          <Link
            href="/special-interests"
            className="text-xs text-sage-600 font-medium underline underline-offset-2"
          >
            Track what you are loving right now
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {preview.map((interest) => (
            <div key={interest.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide",
                  INTENSITY_COLORS[interest.intensity]
                )}
              >
                {INTENSITY_LABELS[interest.intensity]}
              </span>
              <p className="text-sm font-medium text-slate-700 truncate">{interest.name}</p>
            </div>
          ))}
          {interests.length > 3 && (
            <Link
              href="/special-interests"
              className="text-xs text-slate-400 hover:text-sage-600 transition-colors"
            >
              +{interests.length - 3} more
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// My Lists card
// ---------------------------------------------------------------------------

const LIST_SUGGESTIONS = [
  "Shows to Watch", "Books to Read", "Things to Research", "Safe Foods",
  "Places to Visit", "Movies to Watch", "Podcasts to Try", "Games to Play",
  "People to Connect With", "Ideas and Projects",
];

function MyListsCard() {
  const { userLists, addUserList, deleteUserList, addListItem, toggleListItem, deleteListItem } =
    useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<'bullet' | 'checklist'>('checklist');
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    addUserList(newListName.trim(), newListType);
    setNewListName("");
    setNewListType('checklist');
    setShowNewForm(false);
  };

  const handleAddItem = (listId: string) => {
    const text = newItemText[listId] ?? "";
    if (!text.trim()) return;
    addListItem(listId, text.trim());
    setNewItemText((prev) => ({ ...prev, [listId]: "" }));
  };

  return (
    <div className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <ListChecks size={16} className="text-violet-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">My Lists</p>
        </div>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1 text-xs text-sage-600 font-semibold hover:text-sage-700 transition-colors"
          >
            <Plus size={13} />
            New List
          </button>
        )}
      </div>

      {showNewForm && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-2">
          <input
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
          />
          {/* List type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setNewListType('checklist')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                newListType === 'checklist'
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-500 border-stone-200 hover:border-violet-300"
              )}
            >
              <Check size={12} />
              Checklist
            </button>
            <button
              onClick={() => setNewListType('bullet')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                newListType === 'bullet'
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-500 border-stone-200 hover:border-violet-300"
              )}
            >
              <span className="text-sm leading-none">•</span>
              Bullet list
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LIST_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setNewListName(s)}
                className="text-xs bg-white border border-violet-200 text-violet-700 px-2.5 py-1 rounded-full hover:bg-violet-100 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-stone-100 disabled:text-stone-400 text-white text-sm font-semibold rounded-xl py-2 transition-all"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewForm(false); setNewListName(""); setNewListType('checklist'); }}
              className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-stone-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {userLists.length === 0 && !showNewForm && (
        <p className="text-xs text-slate-400 text-center py-2">No lists yet. Create one to get started.</p>
      )}

      <div className="space-y-2 overflow-y-auto max-h-48">
        {userLists.map((list) => {
          const isExpanded = expandedId === list.id;
          const isBullet = list.listType === 'bullet';
          const doneCount = list.items.filter((i) => i.checked).length;
          return (
            <div key={list.id} className="bg-stone-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : list.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{list.name}</p>
                  <p className="text-xs text-slate-400">
                    {list.items.length} item{list.items.length !== 1 ? "s" : ""}
                    {!isBullet && doneCount > 0 ? ` · ${doneCount} done` : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteUserList(list.id); }}
                  className="p-1 text-stone-300 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
                {isExpanded ? (
                  <ChevronUp size={14} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-stone-200 pt-2">
                  {list.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      {isBullet ? (
                        <span className="text-slate-400 text-base leading-none shrink-0 w-5 text-center">•</span>
                      ) : (
                        <button
                          onClick={() => toggleListItem(list.id, item.id)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            item.checked
                              ? "bg-sage-500 border-sage-500"
                              : "border-stone-300 hover:border-sage-400"
                          )}
                        >
                          {item.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                        </button>
                      )}
                      <p
                        className={cn(
                          "flex-1 text-sm text-slate-700",
                          !isBullet && item.checked && "line-through text-slate-400"
                        )}
                      >
                        {item.text}
                      </p>
                      <button
                        onClick={() => deleteListItem(list.id, item.id)}
                        className="p-0.5 text-stone-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 border border-stone-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
                      placeholder="Add item..."
                      value={newItemText[list.id] ?? ""}
                      onChange={(e) =>
                        setNewItemText((prev) => ({ ...prev, [list.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem(list.id)}
                    />
                    <button
                      onClick={() => handleAddItem(list.id)}
                      disabled={!(newItemText[list.id] ?? "").trim()}
                      className="px-3 py-1.5 bg-sage-600 hover:bg-sage-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Me page
// ---------------------------------------------------------------------------

export default function MePage() {
  const { profile, sensoryProfile, specialInterests, favorites } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-2xl bg-sage-100 flex items-center justify-center">
          <User size={20} className="text-sage-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Me</h1>
          <p className="text-xs text-slate-400">Your profile at a glance</p>
        </div>
      </div>

      {/* ND Strengths */}
      {mounted ? (
        <NDStrengthsCard ndIdentities={profile.ndIdentities} />
      ) : (
        <div className="bg-cream-50 rounded-2xl border h-28 animate-pulse" style={{ borderColor: '#D0DCCB' }} />
      )}

      {/* My Tools */}
      {mounted ? (
        <MyToolsCard favorites={favorites} />
      ) : (
        <div className="bg-cream-50 rounded-2xl border h-20 animate-pulse" style={{ borderColor: '#DDD9F0' }} />
      )}

      {/* Sensory Profile Summary */}
      {mounted ? (
        <SensoryProfileSummaryCard
          triggers={sensoryProfile.triggers}
          soothers={sensoryProfile.soothers}
        />
      ) : (
        <div className="bg-cream-50 rounded-2xl border border-green-100 h-24 animate-pulse" />
      )}

      {/* My Special Interests */}
      {mounted ? (
        <SpecialInterestsCard interests={specialInterests} />
      ) : (
        <div className="bg-cream-50 rounded-2xl border h-24 animate-pulse" style={{ borderColor: '#E0CCC7' }} />
      )}

      {/* My Lists */}
      {mounted && <MyListsCard />}

      {/* Energy Accounting */}
      {mounted ? (
        <EnergyAccountingCard />
      ) : (
        <div className="bg-cream-50 rounded-2xl border h-28 animate-pulse" style={{ borderColor: '#E0D5A8' }} />
      )}
    </div>
  );
}
