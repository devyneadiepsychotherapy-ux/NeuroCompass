"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, ChevronDown, ChevronRight, Heart, Save, Trash2, FolderOpen } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { MindNode } from "@/types";

const COLORS = [
  "bg-sage-100 border-sage-300 text-sage-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800",
  "bg-stone-100 border-stone-300 text-stone-700",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-violet-100 border-violet-300 text-violet-800",
];

const COLOR_SWATCHES = [
  { cls: "bg-sage-100 border-sage-300", label: "Green" },
  { cls: "bg-cyan-100 border-cyan-300", label: "Cyan" },
  { cls: "bg-stone-100 border-stone-300", label: "Stone" },
  { cls: "bg-rose-100 border-rose-300", label: "Rose" },
  { cls: "bg-emerald-100 border-emerald-300", label: "Emerald" },
  { cls: "bg-indigo-100 border-indigo-300", label: "Indigo" },
  { cls: "bg-amber-100 border-amber-300", label: "Amber" },
  { cls: "bg-violet-100 border-violet-300", label: "Violet" },
];

function NodeItem({
  node,
  depth,
  onUpdate,
  onDelete,
  onAddChild,
  onColorChange,
}: {
  node: MindNode;
  depth: number;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onColorChange: (id: string, color: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(node.text);
  const [showPalette, setShowPalette] = useState(false);
  const isRoot = depth === 0;

  const commit = () => {
    if (text.trim()) onUpdate(node.id, text.trim());
    setEditing(false);
  };

  return (
    <div className={cn("relative", depth > 0 && "ml-6 border-l-2 border-slate-200 pl-4 mt-2")}>
      <div className="flex items-start gap-2">
        {node.children.length > 0 && (
          <button onClick={() => setCollapsed(!collapsed)} className="mt-2.5 shrink-0 text-slate-400 hover:text-slate-600">
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
        {node.children.length === 0 && !isRoot && <div className="w-4 shrink-0" />}

        <div className={cn(
          "flex-1 min-w-0 rounded-xl border px-3 py-2 shadow-sm",
          isRoot ? "bg-sage-600 border-sage-600" : node.color,
        )}>
          {editing ? (
            <input
              autoFocus
              className={cn("w-full bg-transparent outline-none text-sm font-medium", isRoot ? "text-white placeholder-sage-200" : "")}
              value={text}
              onChange={e => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === "Enter" && commit()}
            />
          ) : (
            <p
              className={cn("text-sm font-medium cursor-pointer", isRoot ? "text-white" : "")}
              onClick={() => setEditing(true)}
            >
              {node.text || <span className="italic opacity-50">Click to edit</span>}
            </p>
          )}
        </div>

        <div className="flex gap-1 mt-1.5 shrink-0">
          {!isRoot && (
            <div className="relative">
              <button
                onClick={() => setShowPalette(!showPalette)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Change colour"
              >
                <div className={cn("w-3 h-3 rounded-full border", node.color.split(" ").slice(0, 2).join(" "))} />
              </button>
              {showPalette && (
                <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-lg border border-slate-100 p-2 flex flex-wrap gap-1.5 w-28">
                  {COLOR_SWATCHES.map((s, i) => (
                    <button
                      key={i}
                      title={s.label}
                      className={cn("w-5 h-5 rounded-full border-2", s.cls, node.color === COLORS[i] ? "ring-2 ring-offset-1 ring-slate-400" : "")}
                      onClick={() => { onColorChange(node.id, COLORS[i]); setShowPalette(false); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => onAddChild(node.id)}
            className="p-1 rounded-lg hover:bg-sage-100 text-slate-400 hover:text-sage-600 transition-colors"
            title="Add branch"
          >
            <Plus size={14} />
          </button>
          {!isRoot && (
            <button
              onClick={() => onDelete(node.id)}
              className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {!collapsed && node.children.map(child => (
        <NodeItem
          key={child.id}
          node={child}
          depth={depth + 1}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onColorChange={onColorChange}
        />
      ))}
    </div>
  );
}

function updateNode(nodes: MindNode[], id: string, text: string): MindNode[] {
  return nodes.map(n => n.id === id ? { ...n, text } : { ...n, children: updateNode(n.children, id, text) });
}

function deleteNode(nodes: MindNode[], id: string): MindNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, children: deleteNode(n.children, id) }));
}

function addChildNode(nodes: MindNode[], parentId: string, colorIdx: number): MindNode[] {
  return nodes.map(n => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, { id: generateId(), text: "", children: [], color: COLORS[colorIdx % COLORS.length] }] };
    }
    return { ...n, children: addChildNode(n.children, parentId, colorIdx) };
  });
}

function changeNodeColor(nodes: MindNode[], id: string, color: string): MindNode[] {
  return nodes.map(n => n.id === id ? { ...n, color } : { ...n, children: changeNodeColor(n.children, id, color) });
}

const TEMPLATES = [
  { label: "Brain dump", root: "Everything on my mind", branches: ["Work", "Personal", "Worries", "Ideas", "To-do"] },
  { label: "Decision", root: "Decision to make", branches: ["Option A", "Option B", "Pros", "Cons", "How I feel"] },
  { label: "Project plan", root: "Project name", branches: ["Goals", "Steps", "Resources", "Blockers", "Deadline"] },
  { label: "Feelings map", root: "How I'm feeling", branches: ["In my body", "Emotions", "Needs", "Triggers", "Support"] },
];

const EMPTY_TREE: MindNode = { id: "root", text: "Central idea", children: [], color: "" };

export default function MindMapPage() {
  const router = useRouter();
  const { toggleFavorite, isFavorite, savedMindMaps, saveMindMap, deleteSavedMindMap } = useAppStore();
  const favorite = isFavorite("mind-map");
  const [colorIdx, setColorIdx] = useState(0);
  const [tree, setTree] = useState<MindNode>(EMPTY_TREE);
  const [showSaved, setShowSaved] = useState(false);
  const [saveNameInput, setSaveNameInput] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleUpdate = (id: string, text: string) => {
    if (id === "root") setTree(prev => ({ ...prev, text }));
    else setTree(prev => ({ ...prev, children: updateNode(prev.children, id, text) }));
  };

  const handleDelete = (id: string) => {
    setTree(prev => ({ ...prev, children: deleteNode(prev.children, id) }));
  };

  const handleAddChild = (parentId: string) => {
    setTree(prev => {
      if (parentId === "root") {
        const newNode: MindNode = { id: generateId(), text: "", children: [], color: COLORS[colorIdx % COLORS.length] };
        setColorIdx(c => c + 1);
        return { ...prev, children: [...prev.children, newNode] };
      }
      const updated = addChildNode([prev], parentId, colorIdx);
      setColorIdx(c => c + 1);
      return updated[0];
    });
  };

  const handleColorChange = (id: string, color: string) => {
    setTree(prev => ({ ...prev, children: changeNodeColor(prev.children, id, color) }));
  };

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTree({
      id: "root",
      text: t.root,
      children: t.branches.map((b, i) => ({
        id: generateId(),
        text: b,
        children: [],
        color: COLORS[i % COLORS.length],
      })),
      color: "",
    });
    setColorIdx(t.branches.length);
  };

  const reset = () => {
    setTree(EMPTY_TREE);
    setColorIdx(0);
  };

  const handleSave = () => {
    const name = saveNameInput.trim() || tree.text || "Mind map";
    saveMindMap(name, tree, colorIdx);
    setSaveNameInput("");
    setShowSaveInput(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleLoad = (map: typeof savedMindMaps[0]) => {
    setTree(map.tree);
    setColorIdx(map.colorIdx);
    setShowSaved(false);
  };

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Mind Map</h1>
          <p className="text-sm text-slate-500">Visual thinking for ND brains</p>
        </div>
        <button onClick={() => toggleFavorite("mind-map")} className="p-2 rounded-xl hover:bg-slate-100">
          <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-sage-50 to-stone-50 rounded-2xl p-4 border border-sage-100">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>ND tip:</strong> Mind maps work with radial thinking, not linear, which is how many ND brains naturally process. Use it for brain dumps, planning, decisions, or feeling exploration.
        </p>
      </div>

      {/* Templates */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Start from a template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(t => (
            <button key={t.label} onClick={() => applyTemplate(t)}
              className="px-3 py-1.5 bg-cream-50 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-sage-300 hover:text-sage-700 transition-all">
              {t.label}
            </button>
          ))}
          <button onClick={reset} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-500 hover:bg-slate-200 transition-all">
            Clear
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-cream-50 rounded-2xl border border-slate-100 p-4 shadow-sm overflow-x-auto">
        <NodeItem
          node={tree}
          depth={0}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddChild={handleAddChild}
          onColorChange={handleColorChange}
        />
      </div>

      {/* Save / Load */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 transition-all"
          >
            <Save size={15} />
            {savedMsg ? "Saved ✓" : "Save map"}
          </button>
          {savedMindMaps.length > 0 && (
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-2 px-4 py-2 bg-cream-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:border-sage-300 transition-all"
            >
              <FolderOpen size={15} />
              Saved ({savedMindMaps.length})
            </button>
          )}
        </div>

        {showSaveInput && (
          <div className="flex gap-2">
            <input
              autoFocus
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder={`Name (default: "${tree.text}")`}
              value={saveNameInput}
              onChange={e => setSaveNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
            />
            <button onClick={handleSave} className="px-3 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700">
              Save
            </button>
            <button onClick={() => { setShowSaveInput(false); setSaveNameInput(""); }} className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
              Cancel
            </button>
          </div>
        )}

        {showSaved && savedMindMaps.length > 0 && (
          <div className="bg-cream-50 rounded-2xl border border-slate-100 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your saved maps</p>
            {[...savedMindMaps].reverse().map(map => (
              <div key={map.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{map.name}</p>
                  <p className="text-xs text-slate-400">{new Date(map.savedAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleLoad(map)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors font-medium"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteSavedMindMap(map.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs text-slate-500">
          Tap any node to edit. Use <strong>+</strong> to add branches. Tap the colour dot on a node to change its colour. Save your map to come back to it later.
        </p>
      </div>
    </div>
  );
}
