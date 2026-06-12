"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check, ChevronLeft, ListChecks, List } from "lucide-react";
import Link from "next/link";

export default function ListsPage() {
  const {
    userLists,
    addUserList,
    deleteUserList,
    addListItem,
    toggleListItem,
    deleteListItem,
  } = useAppStore();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"checklist" | "bullet">("checklist");
  const [openListId, setOpenListId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    addUserList(newListName.trim(), newListType);
    setNewListName("");
    setNewListType("checklist");
    setShowNewForm(false);
  };

  const handleAddItem = (listId: string) => {
    if (!newItemText.trim()) return;
    addListItem(listId, newItemText.trim());
    setNewItemText("");
  };

  const openList = userLists.find((l) => l.id === openListId);

  // Open list detail view
  if (openList) {
    const isBullet = openList.listType === "bullet";
    const doneCount = openList.items.filter((i) => i.checked).length;

    return (
      <div className="min-h-screen pb-24">
        <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setOpenListId(null); setNewItemText(""); }}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800 truncate">{openList.name}</h1>
              {!isBullet && (
                <p className="text-xs text-slate-400">
                  {doneCount} / {openList.items.length} done
                </p>
              )}
            </div>
            <button
              onClick={() => { deleteUserList(openList.id); setOpenListId(null); }}
              className="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {openList.items.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-4">No items yet.</p>
            )}
            {openList.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm"
              >
                {!isBullet ? (
                  <button
                    onClick={() => toggleListItem(openList.id, item.id)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      item.checked
                        ? "bg-sage-500 border-sage-500"
                        : "border-slate-300 hover:border-sage-400"
                    )}
                  >
                    {item.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                  </button>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 ml-1" />
                )}
                <p
                  className={cn(
                    "flex-1 text-sm text-slate-800",
                    !isBullet && item.checked && "line-through text-slate-400"
                  )}
                >
                  {item.text}
                </p>
                <button
                  onClick={() => deleteListItem(openList.id, item.id)}
                  className="p-1 text-slate-200 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add item */}
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              placeholder="Add item…"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem(openList.id)}
            />
            <button
              onClick={() => handleAddItem(openList.id)}
              disabled={!newItemText.trim()}
              className="px-4 py-2.5 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List overview
  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/me"
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-slate-800 flex-1">My Lists</h1>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <Plus size={15} />
            New list
          </button>
        </div>

        {/* New list form */}
        {showNewForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <input
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="List name…"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setNewListType("checklist")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  newListType === "checklist"
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-transparent bg-slate-100 text-slate-500"
                )}
              >
                <ListChecks size={14} />
                Checklist
              </button>
              <button
                onClick={() => setNewListType("bullet")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  newListType === "bullet"
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-transparent bg-slate-100 text-slate-500"
                )}
              >
                <List size={14} />
                Bullet list
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl py-2 transition-all"
              >
                Create
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewListName(""); }}
                className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {userLists.length === 0 && !showNewForm && (
          <div className="text-center py-12">
            <ListChecks size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">No lists yet.</p>
            <p className="text-xs text-slate-300 mt-1">Tap &ldquo;New list&rdquo; to create one.</p>
          </div>
        )}

        {/* Lists */}
        <div className="space-y-2">
          {userLists.map((list) => {
            const isBullet = list.listType === "bullet";
            const doneCount = list.items.filter((i) => i.checked).length;
            return (
              <button
                key={list.id}
                onClick={() => { setOpenListId(list.id); setNewItemText(""); }}
                className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left hover:border-sage-200 active:scale-[0.98] transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
                  {isBullet
                    ? <List size={16} className="text-sage-600" />
                    : <ListChecks size={16} className="text-sage-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{list.name}</p>
                  <p className="text-xs text-slate-400">
                    {list.items.length} item{list.items.length !== 1 ? "s" : ""}
                    {!isBullet && list.items.length > 0 ? ` · ${doneCount} done` : ""}
                  </p>
                </div>
                <ChevronLeft size={14} className="text-slate-300 rotate-180 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
