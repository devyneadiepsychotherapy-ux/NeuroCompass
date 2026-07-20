"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const DM_CATS = ["Appetizers", "Main courses", "Desserts", "Sides"];

const DM_SUGGESTIONS: Record<string, string[]> = {
  "Appetizers": ["Doodle", "Stretch", "Listen to a song", "Look outside", "Pet an animal", "Make a funny face"],
  "Main courses": ["Walk", "Creative project", "Call a friend", "Cook something", "Dance", "Rewatch a comfort episode"],
  "Desserts": ["Gaming", "Bubble bath", "Special coffee", "Favourite food"],
  "Sides": ["Background music", "Fidget toy", "Comfy clothes", "Snack", "Change of location"],
};

export default function DopamineMenuPage() {
  const router = useRouter();
  const { dopamineMenuItems, addDopamineMenuItem, removeDopamineMenuItem } = useAppStore();
  const [dmCat, setDmCat] = useState(DM_CATS[0]);
  const [dmText, setDmText] = useState("");

  const handleAdd = () => {
    if (dmText.trim()) {
      addDopamineMenuItem(dmCat, dmText.trim());
      setDmText("");
    }
  };

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sage-100 transition-colors shrink-0"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dopamine Menu</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Build your personal go-to list for motivation boosts
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-stone-100 to-sage-50 rounded-2xl p-4 border border-stone-200">
        <p className="text-sm text-slate-700 leading-relaxed">
          A menu of activities that boost dopamine, organized by how much energy they take. Build your personal list below.
        </p>
        <p className="text-xs text-stone-500 mt-2 font-medium italic">
          &ldquo;Your dopamine needs are real. Meeting them is self-care, not self-indulgence.&rdquo;
        </p>
      </div>

      {/* Add item */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Add to your menu</p>
        <div className="flex gap-2">
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-cream-50"
            value={dmCat}
            onChange={(e) => setDmCat(e.target.value)}
          >
            {DM_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Your activity..."
            value={dmText}
            onChange={(e) => setDmText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <button
            onClick={handleAdd}
            className="bg-sage-600 text-white px-3 py-2 rounded-xl hover:bg-sage-700 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Starter suggestions */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starter ideas</p>
        {DM_CATS.map((cat) => (
          <div key={cat}>
            <p className="text-xs text-slate-400 font-medium mb-1.5">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {DM_SUGGESTIONS[cat].map((s) => (
                <button
                  key={s}
                  onClick={() => addDopamineMenuItem(cat, s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Personal menu */}
      {dopamineMenuItems.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">My menu</p>
          {DM_CATS.map((cat) => {
            const catItems = dopamineMenuItems.filter((i) => i.category === cat);
            if (!catItems.length) return null;
            return (
              <div key={cat}>
                <p className="text-xs text-slate-400 font-medium mb-1">{cat}</p>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-xl px-3 py-2">
                      <span className="text-sm text-slate-700">{item.text}</span>
                      <button onClick={() => removeDopamineMenuItem(item.id)}>
                        <Trash2 size={13} className="text-slate-300 hover:text-rose-400 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
          <p className="text-3xl mb-2"></p>
          <p className="text-slate-600 font-medium">Your menu is empty</p>
          <p className="text-sm text-slate-400 mt-1">Add activities above or tap the starter ideas</p>
        </div>
      )}
    </div>
  );
}
