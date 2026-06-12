"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ShopReward } from "@/types";
import { cn } from "@/lib/utils";
import {
  Coins, Gift, ShoppingBag, Trash2, Check, Plus, Film, UtensilsCrossed,
  BookOpen, Sparkles, Gamepad2, Moon, Coffee, Smartphone, TreePine, Palette,
  Star, Package, Heart, Music, Bike, Bath, Pencil, X, Snowflake, Zap,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Icon registry
// ---------------------------------------------------------------------------

const REWARD_ICONS: Record<string, LucideIcon> = {
  Film,
  UtensilsCrossed,
  BookOpen,
  Sparkles,
  Gamepad2,
  Moon,
  Coffee,
  Smartphone,
  TreePine,
  Palette,
  Star,
  Gift,
  Package,
  Heart,
  Music,
  Bike,
  Bath,
  Snowflake,
};

const ICON_OPTIONS = [
  "Film", "UtensilsCrossed", "BookOpen", "Sparkles", "Gamepad2",
  "Moon", "Coffee", "Smartphone", "TreePine", "Palette",
  "Heart", "Star", "Music", "Bike", "Bath", "Gift",
];

function RewardIcon({ name, size = 22 }: { name: string; size?: number }) {
  const IC = REWARD_ICONS[name] ?? Gift;
  return <IC size={size} />;
}

// ---------------------------------------------------------------------------
// Icon grid picker
// ---------------------------------------------------------------------------

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Icon</p>
      <div className="grid grid-cols-8 gap-1.5">
        {ICON_OPTIONS.map((name) => {
          const IC = REWARD_ICONS[name] ?? Gift;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                value === name
                  ? "bg-sage-600 text-white shadow-sm"
                  : "bg-stone-100 text-slate-500 hover:bg-stone-200"
              )}
            >
              <IC size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline edit form (replaces card when editing)
// ---------------------------------------------------------------------------

function EditRewardForm({
  reward,
  onSave,
  onCancel,
}: {
  reward: ShopReward;
  onSave: (updates: Partial<Omit<ShopReward, "id">>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(reward.name);
  const [description, setDescription] = useState(reward.description);
  const [cost, setCost] = useState(reward.cost);
  const [icon, setIcon] = useState(reward.icon);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), cost, icon });
  };

  return (
    <div className="bg-stone-50 border border-sage-300 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">Edit Reward</p>

      <input
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
        placeholder="Reward name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <input
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Cost (coins)</p>
        <input
          type="number"
          min={1}
          max={999}
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
          value={cost}
          onChange={(e) => setCost(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      <IconPicker value={icon} onChange={setIcon} />

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-stone-100 disabled:text-stone-400 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-stone-100 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reward Card
// ---------------------------------------------------------------------------

function RewardCard({
  reward,
  coins,
  okayMode,
  onRedeem,
  onEdit,
  onDelete,
}: {
  reward: ShopReward;
  coins: number;
  okayMode: boolean;
  onRedeem: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const canAfford = okayMode || coins >= reward.cost;
  const [redeemed, setRedeemed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRedeem = () => {
    onRedeem();
    setRedeemed(true);
    setTimeout(() => setRedeemed(false), 1500);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col gap-3 relative">
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {confirmDelete ? (
          <>
            <span className="text-xs text-slate-500 mr-1">Delete?</span>
            <button
              onClick={onDelete}
              className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 rounded-lg bg-stone-200 text-slate-600 text-xs font-semibold hover:bg-stone-300 transition-colors"
            >
              No
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="p-1 text-stone-300 hover:text-sage-500 transition-colors"
              aria-label="Edit reward"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1 text-stone-300 hover:text-red-400 transition-colors"
              aria-label="Delete reward"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-start gap-3 pr-16">
        <div className="w-11 h-11 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
          <RewardIcon name={reward.icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm leading-snug">{reward.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{reward.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm font-bold text-[#B8A96A]">
          <Coins size={14} />
          {reward.cost}
        </span>
        <button
          onClick={handleRedeem}
          disabled={!canAfford}
          className={cn(
            "px-4 py-1.5 rounded-xl text-xs font-semibold transition-all",
            canAfford
              ? "bg-sage-600 text-white hover:bg-sage-700 active:scale-95"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          )}
        >
          {redeemed ? "Redeemed!" : canAfford ? "Redeem" : `Need ${reward.cost} coins`}
          {okayMode && !redeemed && <span className="ml-1 text-[10px] font-normal opacity-70">free</span>}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Purchased reward row
// ---------------------------------------------------------------------------

function PurchasedRow({ reward }: { reward: ShopReward }) {
  const [used, setUsed] = useState(false);

  return (
    <div className={cn(
      "bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all",
      used && "opacity-60"
    )}>
      <button
        onClick={() => setUsed(!used)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          used ? "bg-sage-500 border-sage-500" : "border-stone-300 hover:border-sage-400"
        )}
      >
        {used && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>
      <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600 shrink-0">
        <RewardIcon name={reward.icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold text-slate-800", used && "line-through text-slate-400")}>
          {reward.name}
        </p>
        <p className="text-xs text-slate-400">{reward.description}</p>
      </div>
      <span className="flex items-center gap-0.5 text-xs text-[#B8A96A] font-semibold shrink-0">
        <Coins size={11} />
        {reward.cost}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add custom reward form
// ---------------------------------------------------------------------------

function AddRewardForm({ onAdd }: { onAdd: (r: Omit<ShopReward, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(20);
  const [icon, setIcon] = useState("Gift");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: description.trim(), cost, icon, isCustom: true });
    setName("");
    setDescription("");
    setCost(20);
    setIcon("Gift");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-2xl py-4 text-sm text-stone-500 font-medium hover:border-sage-400 hover:text-sage-600 transition-all"
      >
        <Plus size={16} />
        Add Your Own Reward
      </button>
    );
  }

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Custom Reward</p>
        <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
          <X size={15} />
        </button>
      </div>

      <input
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
        placeholder="Reward name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <input
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Cost (coins)</p>
        <input
          type="number"
          min={1}
          max={999}
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
          value={cost}
          onChange={(e) => setCost(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      <IconPicker value={icon} onChange={setIcon} />

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-stone-100 disabled:text-stone-400 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
        >
          Save Reward
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-stone-100 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ShopPage() {
  const {
    coins, shopRewards, purchasedRewards, streakFreezes,
    purchaseReward, addShopReward, updateShopReward, deleteShopReward,
    okayMode, setOkayMode,
  } = useAppStore();
  const [tab, setTab] = useState<"shop" | "mine">("shop");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayCoins = mounted ? coins : 0;
  const displayFreezes = mounted ? streakFreezes : 0;
  const displayRewards = mounted ? shopRewards : [];
  const purchased = mounted
    ? (purchasedRewards.map((id) => shopRewards.find((r) => r.id === id)).filter(Boolean) as ShopReward[])
    : [];

  return (
    <div className="px-4 pt-4 pb-24 space-y-5 min-h-screen">
      {/* Header */}
      <div className="pt-2 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">Reward Shop</h1>
            <p className="text-sm text-slate-500 mt-1">Spend your coins on treats</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 bg-white/80 border border-gold-400/40 rounded-2xl px-3 py-2">
              <Coins size={16} className="text-[#B8A96A]" />
              <span className="text-base font-bold text-[#9e9158]">{displayCoins}</span>
            </div>
            {displayFreezes > 0 && (
              <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-full px-3 py-1">
                <Snowflake size={12} className="text-sky-500" />
                <span className="text-xs font-semibold text-sky-700">{displayFreezes} freeze{displayFreezes !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Okay Mode banner */}
      {mounted && okayMode && (
        <div className="flex items-center gap-2 bg-sage-100 border border-sage-200 rounded-2xl px-4 py-2.5">
          <Zap size={14} className="text-sage-600 shrink-0" />
          <p className="text-xs font-semibold text-sage-700">Okay Mode is on. Rewards are free today.</p>
        </div>
      )}

      {/* Okay Mode toggle */}
      <div className="bg-sage-50 border border-sage-200 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">Okay Mode</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Need a boost today? Turn on Okay Mode to access your rewards without spending coins.
          </p>
        </div>
        <button
          onClick={() => setOkayMode(!okayMode)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-400",
            okayMode ? "bg-sage-600" : "bg-stone-300"
          )}
          aria-label="Toggle Okay Mode"
          aria-pressed={okayMode}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
              okayMode ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-stone-200 rounded-2xl p-1">
        {(["shop", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
              tab === t
                ? "bg-stone-50 text-slate-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            {t === "shop" ? <ShoppingBag size={15} /> : <Gift size={15} />}
            {t === "shop" ? "Shop" : "My Rewards"}
            {t === "mine" && purchased.length > 0 && (
              <span className="bg-sage-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {purchased.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Shop tab */}
      {tab === "shop" && (
        <div className="space-y-4">
          {displayRewards.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No rewards yet. Add one below.</p>
          )}

          <div className="grid grid-cols-1 gap-3">
            {displayRewards.map((reward) =>
              editingId === reward.id ? (
                <EditRewardForm
                  key={reward.id}
                  reward={reward}
                  onSave={(updates) => {
                    updateShopReward(reward.id, updates);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  coins={displayCoins}
                  okayMode={mounted && okayMode}
                  onRedeem={() => purchaseReward(reward.id)}
                  onEdit={() => setEditingId(reward.id)}
                  onDelete={() => deleteShopReward(reward.id)}
                />
              )
            )}
          </div>

          <AddRewardForm onAdd={addShopReward} />
        </div>
      )}

      {/* My Rewards tab */}
      {tab === "mine" && (
        <div className="space-y-3">
          {purchased.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center">
              <p className="text-3xl mb-2"></p>
              <p className="font-semibold text-slate-700 text-sm">No rewards yet</p>
              <p className="text-xs text-slate-400 mt-1">Redeem something from the shop to see it here.</p>
            </div>
          ) : (
            purchased.map((reward, i) => (
              <PurchasedRow key={`${reward.id}-${i}`} reward={reward} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
