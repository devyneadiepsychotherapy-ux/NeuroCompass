"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, X, ShoppingCart, ChevronDown, ChevronUp, ArrowLeft, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

type MealPlan = Record<string, Record<string, string>>;
type ShoppingList = string[];

const STORAGE_KEY = "nd-meal-plan";
const SHOP_KEY = "nd-shopping-list";

const EASY_MEALS = [
  "Eggs (any style)", "Cereal + milk", "Toast + peanut butter", "Yogurt + fruit",
  "Sandwich", "Leftovers", "Frozen meal", "Mac & cheese", "Soup (canned)",
  "Rice + whatever", "Crackers + cheese", "Smoothie", "Oatmeal", "Wrap",
  "Scrambled eggs + toast", "Pasta + sauce", "Stir fry", "Bean bowl",
  "Skip (no appetite)", "Snack plate", "Takeout", "Batch cook leftovers",
];

const SHOP_CATEGORIES = [
  { label: "Produce" },
  { label: "Protein" },
  { label: "Grains" },
  { label: "Dairy" },
  { label: "Pantry" },
  { label: "Snacks" },
  { label: "Frozen" },
  { label: "Other" },
];

export default function MealPlanPage() {
  const { toggleFavorite, isFavorite, savedNDMeals, toggleSavedNDMeal } = useAppStore();
  const favorite = isFavorite("meal-planner");
  const [plan, setPlan] = useState<MealPlan>({});
  const [shopping, setShopping] = useState<ShoppingList>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [editingCell, setEditingCell] = useState<{ day: string; meal: string } | null>(null);
  const [inputText, setInputText] = useState("");
  const [shopInput, setShopInput] = useState("");
  const [showShop, setShowShop] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEY);
      const s = localStorage.getItem(SHOP_KEY);
      if (p) setPlan(JSON.parse(p));
      if (s) setShopping(JSON.parse(s));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    localStorage.setItem(SHOP_KEY, JSON.stringify(shopping));
  }, [plan, shopping, loaded]);

  const setMeal = (day: string, meal: string, value: string) => {
    setPlan(prev => ({
      ...prev,
      [day]: { ...(prev[day] ?? {}), [meal]: value },
    }));
  };

  const getMeal = (day: string, meal: string) => plan[day]?.[meal] ?? "";

  const openEdit = (day: string, meal: string) => {
    setInputText(getMeal(day, meal));
    setEditingCell({ day, meal });
  };

  const commitEdit = () => {
    if (editingCell) setMeal(editingCell.day, editingCell.meal, inputText);
    setEditingCell(null);
    setInputText("");
  };

  // Directly select a meal without relying on inputText state (avoids stale closure bug)
  const selectMealDirectly = (value: string) => {
    if (!editingCell) return;
    setMeal(editingCell.day, editingCell.meal, value);
    setEditingCell(null);
    setInputText("");
  };

  const addShopItem = () => {
    if (!shopInput.trim()) return;
    setShopping(prev => [...prev, shopInput.trim()]);
    setShopInput("");
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const removeShopItem = (idx: number) => {
    setShopping(prev => prev.filter((_, i) => i !== idx));
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
  };

  const clearChecked = () => {
    setShopping(prev => prev.filter((_, i) => !checkedItems.has(i)));
    setCheckedItems(new Set());
  };

  const activeDayPlan = plan[activeDay] ?? {};
  const filledCount = Object.values(plan).reduce((acc, day) => acc + Object.values(day).filter(v => v).length, 0);

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tools" className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Meal Planner</h1>
          <p className="text-sm text-slate-500">{filledCount} meal{filledCount !== 1 ? "s" : ""} planned this week</p>
        </div>
        <button onClick={() => toggleFavorite("meal-planner")} className="p-2 rounded-xl hover:bg-slate-100">
          <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
        </button>
        <button
          onClick={() => setShowShop(!showShop)}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
            showShop ? "bg-emerald-600 text-white border-emerald-600" : "bg-cream-50 text-emerald-700 border-emerald-300")}
        >
          <ShoppingCart size={16} />
          {shopping.length > 0 && <span className="bg-white/30 text-xs px-1.5 py-0.5 rounded-full">{shopping.length}</span>}
        </button>
      </div>

      <div className="bg-gradient-to-br from-stone-100 to-sage-50 rounded-2xl p-4 border border-stone-200">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>ND meal tip: </strong>Aim for &ldquo;good enough&rdquo; meals, not perfect ones. Having a plan reduces the daily decision fatigue of &ldquo;what&apos;s for dinner?&rdquo;, even if you don&apos;t follow it exactly.
        </p>
      </div>

      {/* Shopping list panel */}
      {showShop && (
        <div className="bg-cream-50 rounded-2xl border border-emerald-200 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-800">Shopping List</p>
            {checkedItems.size > 0 && (
              <button onClick={clearChecked} className="text-xs text-red-500 hover:text-red-700 font-medium">
                Remove checked ({checkedItems.size})
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Add item..."
              value={shopInput}
              onChange={e => setShopInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addShopItem()}
            />
            <button onClick={addShopItem} className="bg-emerald-600 text-white px-3 rounded-xl hover:bg-emerald-700">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SHOP_CATEGORIES.map(c => (
              <button key={c.label} onClick={() => { setShopInput(c.label + " "); }}
                className="text-xs px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300">
                {c.label}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {shopping.length === 0 && <p className="text-sm text-slate-400 text-center py-3">No items yet</p>}
            {shopping.map((item, idx) => (
              <div key={idx} className={cn("flex items-center gap-3 py-1.5", checkedItems.has(idx) && "opacity-50")}>
                <button
                  onClick={() => toggleCheck(idx)}
                  className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                    checkedItems.has(idx) ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}
                >
                  {checkedItems.has(idx) && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <p className={cn("text-sm flex-1", checkedItems.has(idx) && "line-through")}>{item}</p>
                <button onClick={() => removeShopItem(idx)} className="text-slate-300 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {DAYS.map(day => {
          const dayPlan = plan[day] ?? {};
          const filled = Object.values(dayPlan).filter(v => v).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-all shrink-0 border",
                activeDay === day
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
              )}
            >
              <span className="text-xs font-semibold">{day.slice(0, 3)}</span>
              {filled > 0 && (
                <span className={cn("text-xs mt-0.5", activeDay === day ? "text-sage-200" : "text-sage-500")}>
                  {filled}/{MEALS.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day meals */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">{activeDay}</p>
        {MEALS.map(meal => {
          const value = getMeal(activeDay, meal);
          const isEditing = editingCell?.day === activeDay && editingCell.meal === meal;

          return (
            <div key={meal} className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex-1">{meal}</span>
              </div>

              {isEditing ? (
                <div className="p-3 space-y-3">
                  <input
                    autoFocus
                    className="w-full border border-sage-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
                    placeholder={`What for ${meal.toLowerCase()}?`}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && commitEdit()}
                  />
                  {/* Go-to meal options */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {(savedNDMeals.length > 0 ? savedNDMeals : EASY_MEALS).map(m => {
                      const isSaved = savedNDMeals.includes(m);
                      return (
                        <div key={m} className="flex items-center gap-0">
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectMealDirectly(m); }}
                            onTouchEnd={(e) => { e.preventDefault(); selectMealDirectly(m); }}
                            className="text-xs px-2.5 py-1.5 bg-sage-50 text-sage-700 rounded-l-full border border-sage-200 active:bg-sage-100"
                          >
                            {m}
                          </button>
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); toggleSavedNDMeal(m); }}
                            onTouchEnd={(e) => { e.preventDefault(); toggleSavedNDMeal(m); }}
                            className={cn(
                              "text-xs px-1.5 py-1.5 rounded-r-full border border-l-0 border-sage-200 transition-colors",
                              isSaved ? "bg-rose-50 text-rose-400" : "bg-sage-50 text-slate-300"
                            )}
                            aria-label={isSaved ? "Remove from go-to" : "Save as go-to"}
                          >
                            ♡
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {savedNDMeals.length === 0 && (
                    <p className="text-[10px] text-slate-400">Tap ♡ to save meals as go-to options — they&apos;ll appear at the top next time.</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCell(null)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm">Cancel</button>
                    <button onClick={commitEdit} className="flex-1 bg-sage-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-sage-700">Save</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => openEdit(activeDay, meal)} className="w-full text-left px-4 py-3">
                  {value ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-800 font-medium">{value}</p>
                      <span className="text-xs text-slate-400">Edit</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Plus size={16} />
                      <p className="text-sm italic">Tap to plan {meal.toLowerCase()}</p>
                    </div>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Week overview */}
      <div className="bg-cream-50 rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700">Week overview</p>
        {DAYS.map(day => {
          const dayPlan = plan[day] ?? {};
          const meals = MEALS.map(m => dayPlan[m]).filter(Boolean);
          return meals.length > 0 ? (
            <div key={day} className="flex items-start gap-3">
              <p className="text-xs font-semibold text-slate-500 w-8 shrink-0 mt-0.5">{day.slice(0, 3)}</p>
              <div className="flex flex-wrap gap-1">
                {meals.map((m, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          ) : null;
        })}
        {filledCount === 0 && <p className="text-xs text-slate-400">No meals planned yet</p>}
      </div>
    </div>
  );
}
