"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { TOOL_CATEGORIES, TOOLS, Tool } from "@/lib/tools-data";
import { ICON_MAP } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Heart, ChevronRight, MessageCircle, Search, HeartHandshake, ExternalLink, Wrench } from "lucide-react";
import { ToolModal } from "@/components/ToolModal";

// Map category id to a soft background color for the icon container
const CATEGORY_ICON_BG: Record<string, string> = {
  time:          "bg-[#ede8e0]",
  motivation:    "bg-[#f0e8d0]",
  attention:     "bg-[#dde4ec]",
  planning:      "bg-[#e4e8d8]",
  impulsivity:   "bg-[#dce8e4]",
  sensory:       "bg-[#e8ede6]",
  selfcare:      "bg-[#f0e0e4]",
  eating:        "bg-[#f0e4d8]",
  perfectionism: "bg-[#ece0ec]",
  people:        "bg-[#f0eadc]",
  burnout:       "bg-[#f0ddd8]",
  interoception: "bg-[#e4e0ec]",
  emotion:       "bg-[#f0e4e0]",
};

// Left-border accent color per category
const CATEGORY_BORDER_ACCENT: Record<string, string> = {
  time:          "border-l-[#c4bbb0]",
  motivation:    "border-l-[#c8a870]",
  attention:     "border-l-[#9ab0c8]",
  planning:      "border-l-[#8aaa80]",
  impulsivity:   "border-l-[#80b0a8]",
  sensory:       "border-l-[#8aaa88]",
  selfcare:      "border-l-[#c498a8]",
  eating:        "border-l-[#c09278]",
  perfectionism: "border-l-[#b898c0]",
  people:        "border-l-[#c0a878]",
  burnout:       "border-l-[#c88878]",
  interoception: "border-l-[#a898c8]",
  emotion:       "border-l-[#c09490]",
};

// --------------- Recommendation logic ---------------

const KEYWORD_MAP: { keywords: string[]; toolIds: string[] }[] = [
  { keywords: ["can't start", "cant start", "task initiation", "frozen", "stuck"], toolIds: ["task-initiation", "activation-ramp", "freeze-upregulate"] },
  { keywords: ["overwhelmed", "too much", "shutdown"], toolIds: ["freeze-compassion", "pause-practice", "sensory-overload"] },
  { keywords: ["focus", "distracted", "can't concentrate", "cant concentrate", "concentrate"], toolIds: ["pomodoro-nd", "focus-ritual", "attention-anchors"] },
  { keywords: ["anxious", "anxiety", "worry", "worried"], toolIds: ["urge-surfing", "rsd-perfectionism", "pause-practice"] },
  { keywords: ["sensory", "overload", "loud", "bright", "noise"], toolIds: ["sensory-profile", "sensory-soothing-kit", "sensory-overload"] },
  { keywords: ["procrastinat", "avoiding", "avoidance"], toolIds: ["task-initiation", "pinch-motivators", "dopamine-menu"] },
  { keywords: ["tired", "exhausted", "burnout", "burnt out"], toolIds: ["burnout-signs", "burnout-recovery", "energy-accounting"] },
  { keywords: ["eat", "food", "hungry", "forgot to eat", "hunger"], toolIds: ["easy-food", "nd-meals", "eating-routine"] },
  { keywords: ["sad", "down", "low mood"], toolIds: ["dopamine-menu", "pomodoro-nd", "freeze-compassion"] },
  { keywords: ["time", "late", "forgot", "time blind"], toolIds: ["time-timer", "time-anchors", "time-blocking"] },
  { keywords: ["angry", "frustrated", "rsd", "rejection"], toolIds: ["rsd-perfectionism", "urge-surfing", "pause-practice"] },
  { keywords: ["people", "social", "boundary", "saying no", "pleasing"], toolIds: ["boundary-scripts", "fawn-response", "masking-costs"] },
  { keywords: ["body", "pain", "numb", "interoception"], toolIds: ["body-scan", "interoception-basics", "sensory-profile"] },
  { keywords: ["reward", "motivation", "boring", "unmotivated"], toolIds: ["pinch-motivators", "dopamine-menu", "reward-ladder"] },
  { keywords: ["sleep"], toolIds: ["self-care-minimum", "burnout-recovery"] },
  { keywords: ["chore", "clean", "dish", "tidy", "mess"], toolIds: ["chore-hack", "task-breakdown", "body-double"] },
];

function getRecommendations(input: string): Tool[] {
  if (!input.trim()) return [];
  const lower = input.toLowerCase();
  const seen = new Set<string>();
  const results: Tool[] = [];

  // 1. Keyword map matches
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      for (const id of entry.toolIds) {
        if (!seen.has(id)) {
          seen.add(id);
          const tool = TOOLS.find(t => t.id === id);
          if (tool) {
            results.push(tool);
            if (results.length >= 4) return results;
          }
        }
      }
    }
  }

  // 2. Direct text match on title / description (words 3+ chars)
  const words = lower.split(/\s+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    for (const tool of TOOLS) {
      if (seen.has(tool.id)) continue;
      const haystack = `${tool.title} ${tool.description} ${tool.category}`.toLowerCase();
      if (words.some(w => haystack.includes(w))) {
        seen.add(tool.id);
        results.push(tool);
        if (results.length >= 4) break;
      }
    }
  }

  return results;
}

// --------------- Recommendation mini-card ---------------

function RecommendationCard({ tool, onOpen }: { tool: Tool; onOpen: () => void }) {
  const iconBg = CATEGORY_ICON_BG[tool.category] ?? "bg-slate-100";
  const borderAccent = CATEGORY_BORDER_ACCENT[tool.category] ?? "border-l-slate-200";

  const inner = (
    <div className="flex flex-col gap-2 h-full">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
        {(() => { const IC = ICON_MAP[tool.icon]; return IC ? <IC size={14} className="text-current opacity-70" /> : null; })()}
      </div>
      <p className="font-semibold text-slate-800 text-xs leading-snug flex-1">{tool.title}</p>
      <span className="text-xs text-sage-600 font-semibold">Use this tool</span>
    </div>
  );

  const baseClass = cn(
    "text-left w-full bg-white rounded-xl p-3 border border-l-4 border-slate-100 shadow-sm",
    "hover:shadow-md hover:border-slate-200 transition-all active:scale-[0.98]",
    borderAccent
  );

  if (tool.linkTo) {
    return <Link href={tool.linkTo} className={baseClass}>{inner}</Link>;
  }
  return <button onClick={onOpen} className={baseClass}>{inner}</button>;
}

// --------------- Recommendation widget ---------------

function ToolRecommendationWidget({ onOpenTool }: { onOpenTool: (tool: Tool) => void }) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const recommendations = getRecommendations(query);
  const hasInput = query.trim().length > 0;
  const hasResults = recommendations.length > 0;

  return (
    <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={16} className="text-sage-600 shrink-0" />
        <p className="text-sm font-semibold text-slate-700">What are you struggling with?</p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="e.g. I can't start tasks, feeling overwhelmed, sensory overload..."
          value={query}
          onChange={handleChange}
        />
      </div>

      {hasInput && (
        <div className="mt-3">
          {hasResults ? (
            <div className="grid grid-cols-2 gap-2">
              {recommendations.map(tool => (
                <RecommendationCard
                  key={tool.id}
                  tool={tool}
                  onOpen={() => onOpenTool(tool)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-2">
              Try describing how you&apos;re feeling and I&apos;ll find the right tool for you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// --------------- Main ToolCard ---------------

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: () => void }) {
  const { isFavorite } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cat = TOOL_CATEGORIES.find(c => c.id === tool.category);
  const iconBg = CATEGORY_ICON_BG[tool.category] ?? "bg-slate-100";
  const borderAccent = CATEGORY_BORDER_ACCENT[tool.category] ?? "border-l-slate-200";

  const inner = (
    <>
      {/* Icon */}
      {(() => { const IC = ICON_MAP[tool.icon]; return IC ? <IC size={20} className="text-slate-400 shrink-0" /> : null; })()}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-800 text-sm leading-snug">{tool.title}</p>
          {mounted && isFavorite(tool.id) && <Heart size={11} className="text-rose-400 fill-rose-400" />}
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.description}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {cat && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cat.color)}>
              {cat.label}
            </span>
          )}
          {tool.linkTo && (
            <span className="text-xs bg-sage-50 text-sage-600 border border-sage-200 px-2 py-0.5 rounded-full font-medium">
              interactive
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={15} className="text-slate-300 mt-0.5 shrink-0" />
    </>
  );

  const baseClass = cn(
    "w-full text-left bg-cream-50 rounded-2xl p-4 border border-l-4 border-slate-100 shadow-sm",
    "hover:shadow-md hover:border-slate-200 transition-all active:scale-[0.98] flex items-center gap-3",
    borderAccent
  );

  if (tool.linkTo) {
    return <Link href={tool.linkTo} className={baseClass}>{inner}</Link>;
  }

  return <button onClick={onOpen} className={baseClass}>{inner}</button>;
}

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const { favorites, addXp } = useAppStore();
  const awardedToolsRef = useRef<Set<string>>(new Set());
  useEffect(() => setMounted(true), []);

  const openTool = (tool: Tool) => {
    if (!tool.linkTo) {
      setSelectedTool(tool);
      if (!awardedToolsRef.current.has(tool.id)) {
        awardedToolsRef.current.add(tool.id);
        addXp(5);
      }
    }
  };

  const filtered = TOOLS.filter((t) => {
    const matchCat = !activeCategory || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const favTools = TOOLS.filter(t => favorites.some(f => f.toolId === t.id));

  return (
    <div className="px-4 pt-0 pb-8 space-y-5">
      <div className="pt-3 pb-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>Tools</h1>
          <p className="text-sm text-slate-500 mt-1.5">ND-affirming tools for every challenge</p>
        </div>
        <Wrench size={22} className="text-sage-500 shrink-0 mt-2" />
      </div>

      {/* Recommendation widget */}
      <ToolRecommendationWidget onOpenTool={openTool} />

      {/* Search */}
      <input
        className="w-full bg-cream-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
        placeholder="Search tools..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category scroll */}
      {!search && (
        <div className="-mx-4">
          <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn("shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                !activeCategory ? "bg-sage-600 text-white" : "bg-cream-50 text-slate-600 border border-slate-200")}>
              All
            </button>
            {TOOL_CATEGORIES.map((cat) => {
              const CatIC = ICON_MAP[cat.icon];
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                    isActive ? "bg-sage-600 text-white" : cat.color
                  )}>
                  {CatIC && <CatIC size={12} className="opacity-80" />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorites */}
      {mounted && favTools.length > 0 && !search && !activeCategory && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">Your Favourites</p>
          <div className="space-y-2">
            {favTools.map(t => <ToolCard key={t.id} tool={t} onOpen={() => openTool(t)} />)}
          </div>
        </div>
      )}

      {/* Tool list */}
      <div>
        {activeCategory && (
          <p className="text-sm font-bold text-slate-700 mb-3">
            {TOOL_CATEGORIES.find(c => c.id === activeCategory)?.label}
            <span className="ml-2 text-slate-400 font-normal text-xs">{filtered.length} tools</span>
          </p>
        )}
        {search && (
          <p className="text-xs text-slate-500 mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{search}&quot;</p>
        )}
        <div className="space-y-2">
          {filtered.map(t => <ToolCard key={t.id} tool={t} onOpen={() => openTool(t)} />)}
          {filtered.length === 0 && (
            <div className="bg-cream-50 rounded-2xl p-6 text-center border border-slate-100">
              <p className="text-slate-400">No tools found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Support */}
      <div className="bg-sage-50 rounded-2xl p-5 border border-sage-200 space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake size={18} className="text-sage-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-800">Need Professional Support?</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          These tools are a great start, and sometimes working with a professional makes all the difference.
        </p>
        <div className="space-y-2">
          {[
            { label: "ND Therapists Directory", desc: "Find neurodivergent-affirming therapists (US and Canada)", href: "https://ndtherapists.com/" },
            { label: "ND Practitioners", desc: "Browse neurodivergent practitioners and coaches (Worldwide)", href: "https://neurodivergentpractitioners.org/" },
            { label: "Willow Creek Counselling & Psychotherapy", desc: "ND-affirming counselling in Ontario (virtual sessions available)", href: "https://www.willowcreekcounselling.com/" },
          ].map(({ label, desc, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/70 border border-sage-200 rounded-xl px-4 py-3 hover:border-sage-400 hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <ExternalLink size={14} className="text-sage-500 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {selectedTool && <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />}
    </div>
  );
}
