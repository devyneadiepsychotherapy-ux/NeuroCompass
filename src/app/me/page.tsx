"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain, Leaf, Zap, Shield, Sparkles, ListChecks, Plus,
  Trash2, Check, ChevronDown, ChevronUp, X, User, ChevronRight,
  Heart,
  LayoutGrid, LayoutList,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { SpecialInterest, UserList, ToolFavorite } from "@/types";
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
// ND Strengths card  — clickable, links to /strengths
// ---------------------------------------------------------------------------

function NDStrengthsCard({
  ndIdentities,
  strengths,
}: {
  ndIdentities: string[];
  strengths: string[];
}) {
  const allStrengths = [
    ...strengths,
    ...ndIdentities.flatMap((id) => ND_STRENGTHS[id] ?? []),
  ];
  const hasStrengths = allStrengths.length > 0;

  return (
    <Link
      href="/strengths"
      className="block bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3 active:scale-[0.98] transition-transform"
      style={{ borderColor: "#D0DCCB" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#D8E4D6" }}
          >
            <Brain size={16} style={{ color: "#5E7A6E" }} />
          </div>
          <p className="text-sm font-semibold text-slate-800">ND Strengths</p>
        </div>
        <ChevronRight size={14} className="text-slate-300 shrink-0" />
      </div>

      {!hasStrengths ? (
        <p className="text-sm text-slate-400 italic">
          Tap to explore your strengths
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {allStrengths.slice(0, 8).map((s, i) => (
            <span
              key={i}
              className="text-xs border px-2.5 py-1 rounded-full"
              style={{
                background: "#F0F4EE",
                color: "#5E7A6E",
                borderColor: "#D0DCCB",
              }}
            >
              {s}
            </span>
          ))}
          {allStrengths.length > 8 && (
            <span className="text-xs text-slate-400">
              +{allStrengths.length - 8} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// My Toolbox card  (soft lavender) — 3-col grid, grid/list toggle
// ---------------------------------------------------------------------------

function MyToolboxCard({ favorites }: { favorites: ToolFavorite[] }) {
  const favTools = TOOLS.filter((t) => favorites.some((f) => f.toolId === t.id));
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div
      className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3"
      style={{ borderColor: "#DDD9F0" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#EAE8F2" }}
          >
            <Heart size={16} style={{ color: "#7775A4" }} />
          </div>
          <p className="text-sm font-semibold text-slate-800">My Toolbox</p>
        </div>
        <div className="flex items-center gap-2">
          {favTools.length > 0 && (
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1 rounded transition-all",
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-600"
                    : "text-slate-300 hover:text-slate-500"
                )}
                aria-label="List view"
              >
                <LayoutList size={14} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1 rounded transition-all",
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-600"
                    : "text-slate-300 hover:text-slate-500"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          )}
          <Link
            href="/tools"
            className="text-xs font-medium"
            style={{ color: "#7775A4" }}
          >
            Browse all
          </Link>
        </div>
      </div>

      {favTools.length === 0 ? (
        <div className="text-center py-2 space-y-1">
          <p className="text-sm text-slate-500">
            You haven&apos;t favourited any tools yet.
          </p>
          <Link
            href="/tools"
            className="text-xs font-medium underline underline-offset-2"
            style={{ color: "#7775A4" }}
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
                <p className="flex-1 text-sm font-medium text-slate-700 truncate">
                  {tool.title}
                </p>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </>
            );
            const cls =
              "flex items-center gap-2.5 bg-white/60 border border-slate-100 rounded-xl px-3 py-2 transition-all active:scale-[0.98]";
            const href = tool.linkTo ? `${tool.linkTo}?from=me` : "/tools";
            return (
              <Link
                key={tool.id}
                href={href}
                className={cls}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#DDD9F0")
                }
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {favTools.map((tool) => {
            const IC = ICON_MAP[tool.icon];
            const href = tool.linkTo ? `${tool.linkTo}?from=me` : "/tools";
            return (
              <Link
                key={tool.id}
                href={href}
                className="flex flex-col items-center gap-2 p-3 bg-white/60 border border-slate-100 rounded-xl transition-all active:scale-[0.98]"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#DDD9F0")
                }
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  {IC && <IC size={18} className="text-slate-600 opacity-70" />}
                </div>
                <p className="text-xs font-medium text-slate-700 text-center leading-tight">
                  {tool.title}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sensory Profile Summary card  (soft sage)
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
    <div
      className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3"
      style={{ borderColor: "#C8D8C6" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#DDE4DC" }}
          >
            <Leaf size={16} className="text-green-700" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Sensory Profile</p>
        </div>
        <Link
          href="/tools/sensory-profile?from=me"
          className="text-xs text-sage-600 font-medium"
        >
          {hasAny ? "Edit" : "Build profile"}
        </Link>
      </div>

      {!hasAny ? (
        <div className="text-center py-2 space-y-1">
          <p className="text-sm text-slate-500">
            Map what overwhelms you and what helps.
          </p>
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
                  <span className="text-xs text-slate-400">
                    +{allTriggers.length - 4} more
                  </span>
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
                  <span className="text-xs text-slate-400">
                    +{allSoothers.length - 4} more
                  </span>
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
// Special Interests card  (warm greige)
// ---------------------------------------------------------------------------

const INTENSITY_COLORS: Record<string, string> = {
  casual: "bg-stone-100 text-stone-600",
  active: "bg-[#e8e0d8] text-[#8f6559]",
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
    <div
      className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3"
      style={{ borderColor: "#D8D0CA" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#E8E0D8" }}
          >
            <Sparkles size={16} style={{ color: "#9B6B60" }} />
          </div>
          <p className="text-sm font-semibold text-slate-800">Special Interests</p>
        </div>
        <Link
          href="/special-interests"
          className="text-xs text-sage-600 font-medium"
        >
          {interests.length > 0 ? "View all" : "Add"}
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
              <p className="text-sm font-medium text-slate-700 truncate">
                {interest.name}
              </p>
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
// My Lists card  (cool neutral)
// ---------------------------------------------------------------------------

const LIST_SUGGESTIONS = [
  "Shows to Watch", "Books to Read", "Things to Research", "Safe Foods",
  "Places to Visit", "Movies to Watch", "Podcasts to Try", "Games to Play",
  "People to Connect With", "Ideas and Projects",
];

function MyListsCard() {
  const {
    userLists,
    addUserList,
    deleteUserList,
    addListItem,
    toggleListItem,
    deleteListItem,
  } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"bullet" | "checklist">(
    "checklist"
  );
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    addUserList(newListName.trim(), newListType);
    setNewListName("");
    setNewListType("checklist");
    setShowNewForm(false);
  };

  const handleAddItem = (listId: string) => {
    const text = newItemText[listId] ?? "";
    if (!text.trim()) return;
    addListItem(listId, text.trim());
    setNewItemText((prev) => ({ ...prev, [listId]: "" }));
  };

  return (
    <div
      className="bg-cream-50 rounded-2xl border shadow-sm p-4 space-y-3"
      style={{ borderColor: "#C8D4E0" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#E2E8F0" }}
          >
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
            New
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
          <div className="flex gap-2">
            <button
              onClick={() => setNewListType("checklist")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                newListType === "checklist"
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-500 border-stone-200 hover:border-violet-300"
              )}
            >
              <Check size={12} />
              Checklist
            </button>
            <button
              onClick={() => setNewListType("bullet")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                newListType === "bullet"
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
              onClick={() => {
                setShowNewForm(false);
                setNewListName("");
                setNewListType("checklist");
              }}
              className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-stone-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {userLists.length === 0 && !showNewForm && (
        <p className="text-xs text-slate-400 text-center py-2">
          No lists yet. Create one to get started.
        </p>
      )}

      <div className="space-y-2 overflow-y-auto max-h-48">
        {userLists.map((list) => {
          const isExpanded = expandedId === list.id;
          const isBullet = list.listType === "bullet";
          const doneCount = list.items.filter((i) => i.checked).length;
          return (
            <div key={list.id} className="bg-stone-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : list.id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-stone-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {list.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {list.items.length} item{list.items.length !== 1 ? "s" : ""}
                    {!isBullet && doneCount > 0 ? ` · ${doneCount} done` : ""}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteUserList(list.id);
                  }}
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
                        <span className="text-slate-400 text-base leading-none shrink-0 w-5 text-center">
                          •
                        </span>
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
                          {item.checked && (
                            <Check size={10} className="text-white" strokeWidth={3} />
                          )}
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
                        setNewItemText((prev) => ({
                          ...prev,
                          [list.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddItem(list.id)
                      }
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
  const { profile, sensoryProfile, specialInterests, favorites } =
    useAppStore();
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
        <NDStrengthsCard
          ndIdentities={profile.ndIdentities}
          strengths={profile.strengths}
        />
      ) : (
        <div
          className="bg-cream-50 rounded-2xl border h-28 animate-pulse"
          style={{ borderColor: "#D0DCCB" }}
        />
      )}

      {/* My Toolbox */}
      {mounted ? (
        <MyToolboxCard favorites={favorites} />
      ) : (
        <div
          className="bg-cream-50 rounded-2xl border h-20 animate-pulse"
          style={{ borderColor: "#DDD9F0" }}
        />
      )}

      {/* Sensory Profile Summary */}
      {mounted ? (
        <SensoryProfileSummaryCard
          triggers={sensoryProfile.triggers}
          soothers={sensoryProfile.soothers}
        />
      ) : (
        <div
          className="bg-cream-50 rounded-2xl border h-24 animate-pulse"
          style={{ borderColor: "#C8D8C6" }}
        />
      )}

      {/* My Lists + Special Interests (2-col grid) */}
      {mounted ? (
        <div className="grid grid-cols-2 gap-3">
          <SpecialInterestsCard interests={specialInterests} />
          <MyListsCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div
            className="bg-cream-50 rounded-2xl border h-24 animate-pulse"
            style={{ borderColor: "#D8D0CA" }}
          />
          <div
            className="bg-cream-50 rounded-2xl border h-24 animate-pulse"
            style={{ borderColor: "#C8D4E0" }}
          />
        </div>
      )}
    </div>
  );
}
