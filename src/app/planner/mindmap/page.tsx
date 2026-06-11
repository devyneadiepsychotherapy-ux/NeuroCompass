"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Plus, X, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
  color: string;
}

const COLORS = [
  "bg-sage-100 border-sage-300 text-sage-800",
  "bg-cyan-100 border-cyan-300 text-cyan-800",
  "bg-stone-100 border-stone-300 text-stone-700",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-indigo-100 border-indigo-300 text-indigo-800",
];

function NodeItem({
  node,
  depth,
  onUpdate,
  onDelete,
  onAddChild,
}: {
  node: MindNode;
  depth: number;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(node.text);
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

const TEMPLATES = [
  { label: "Brain dump", root: "Everything on my mind", branches: ["Work", "Personal", "Worries", "Ideas", "To-do"] },
  { label: "Decision", root: "Decision to make", branches: ["Option A", "Option B", "Pros", "Cons", "How I feel"] },
  { label: "Project plan", root: "Project name", branches: ["Goals", "Steps", "Resources", "Blockers", "Deadline"] },
  { label: "Feelings map", root: "How I'm feeling", branches: ["In my body", "Emotions", "Needs", "Triggers", "Support"] },
];

export default function MindMapPage() {
  const { toggleFavorite, isFavorite } = useAppStore();
  const favorite = isFavorite("mind-map");
  const [colorIdx, setColorIdx] = useState(0);
  const [tree, setTree] = useState<MindNode>({
    id: "root",
    text: "Central idea",
    children: [],
    color: "",
  });

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
    setTree({ id: "root", text: "Central idea", children: [], color: "" });
    setColorIdx(0);
  };

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tools" className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
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
        />
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs text-slate-500">
          Tap any node to edit it. Use <strong>+</strong> to add branches. Mind maps are not saved between sessions, screenshot to keep your work.
        </p>
      </div>
    </div>
  );
}
