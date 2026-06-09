"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SpecialInterest } from "@/types";
import { cn } from "@/lib/utils";
import {
  Sparkles, Plus, Pencil, Trash2, X, ChevronLeft, Check,
} from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Intensity = SpecialInterest["intensity"];

const INTENSITY_OPTIONS: { value: Intensity; label: string; color: string; bg: string; border: string }[] = [
  { value: "casual",      label: "Casual",      color: "text-white",      bg: "bg-stone-500",  border: "border-stone-600" },
  { value: "active",      label: "Active",       color: "text-[#8f6559]",  bg: "bg-[#e8d8d2]",  border: "border-[#c4a090]" },
  { value: "hyperfocused",label: "Hyperfocused", color: "text-red-700",    bg: "bg-red-100",    border: "border-red-300" },
];

const INTENSITY_BADGE: Record<Intensity, string> = {
  casual:       "bg-stone-100 text-stone-600",
  active:       "bg-[#e8d8d2] text-[#8f6559]",
  hyperfocused: "bg-red-100 text-red-700",
};

// ---------------------------------------------------------------------------
// Add / Edit form
// ---------------------------------------------------------------------------

function InterestForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<SpecialInterest>;
  onSave: (data: Omit<SpecialInterest, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [intensity, setIntensity] = useState<Intensity>(initial?.intensity ?? "active");
  const [startDate, setStartDate] = useState(initial?.startDate ?? new Date().toISOString().split("T")[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || undefined, intensity, startDate });
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-slate-700">{initial?.name ? "Edit Interest" : "New Interest"}</p>

      <input
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-stone-100"
        placeholder="What are you into?"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <input
        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-stone-100"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Intensity</p>
        <div className="flex gap-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setIntensity(opt.value)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                intensity === opt.value
                  ? `${opt.bg} ${opt.color} ${opt.border}`
                  : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Started</p>
        <input
          type="date"
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-stone-100"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-stone-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interest card
// ---------------------------------------------------------------------------

function InterestCard({
  interest,
  onEdit,
  onDelete,
}: {
  interest: SpecialInterest;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const opt = INTENSITY_OPTIONS.find((o) => o.value === interest.intensity)!;

  return (
    <div className={cn(
      "rounded-2xl p-4 border space-y-2",
      interest.intensity === "hyperfocused"
        ? "bg-red-50 border-red-200"
        : interest.intensity === "active"
        ? "bg-[#f5efec] border-[#d4b8b0]"
        : "bg-stone-50 border-stone-200"
    )}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm leading-snug">{interest.name}</p>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", INTENSITY_BADGE[interest.intensity])}>
              {opt.label}
            </span>
          </div>
          {interest.description && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{interest.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-1.5">
            Since {new Date(interest.startDate).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <>
              <span className="text-xs text-slate-500">Delete?</span>
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
              <button onClick={onEdit} className="p-1 text-stone-400 hover:text-slate-600 transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => setConfirmDelete(true)} className="p-1 text-stone-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SpecialInterestsPage() {
  const { specialInterests, addSpecialInterest, updateSpecialInterest, deleteSpecialInterest } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...specialInterests].sort((a, b) => {
    const order: Record<Intensity, number> = { hyperfocused: 0, active: 1, casual: 2 };
    return order[a.intensity] - order[b.intensity];
  });

  const hyperfocused = sorted.filter((i) => i.intensity === "hyperfocused");
  const active = sorted.filter((i) => i.intensity === "active");
  const casual = sorted.filter((i) => i.intensity === "casual");

  return (
    <div className="px-4 pt-12 pb-24 space-y-5 min-h-screen bg-stone-100">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">My Special Interests</h1>
          <p className="text-sm text-slate-500">Your special interests are a superpower</p>
        </div>
      </div>

      {/* Affirming banner */}
      <div className="bg-gradient-to-r from-rose-50 to-stone-100 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
        <Sparkles size={20} className="text-rose-400 shrink-0" />
        <p className="text-sm text-slate-700 leading-relaxed">
          The things your brain hyperfocuses on are not distractions. They are your brain caring deeply. Track what you're loving right now.
        </p>
      </div>

      {/* Add button or form */}
      {showForm ? (
        <InterestForm
          onSave={(data) => { addSpecialInterest(data); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-2xl py-4 text-sm text-stone-500 font-medium hover:border-rose-400 hover:text-rose-600 transition-all"
        >
          <Plus size={16} />
          Add Interest
        </button>
      )}

      {/* Empty state */}
      {specialInterests.length === 0 && !showForm && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center space-y-2">
          <p className="text-2xl">✨</p>
          <p className="font-semibold text-slate-700 text-sm">What are you into right now?</p>
          <p className="text-xs text-slate-400 leading-relaxed">Add your current obsessions, hobbies, and deep dives.</p>
        </div>
      )}

      {/* Hyperfocused */}
      {hyperfocused.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-red-600 uppercase tracking-wider px-1">Currently Hyperfocused</p>
          {hyperfocused.map((i) =>
            editingId === i.id ? (
              <InterestForm
                key={i.id}
                initial={i}
                onSave={(data) => { updateSpecialInterest(i.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <InterestCard
                key={i.id}
                interest={i}
                onEdit={() => setEditingId(i.id)}
                onDelete={() => deleteSpecialInterest(i.id)}
              />
            )
          )}
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#8f6559] uppercase tracking-wider px-1">Active Interests</p>
          {active.map((i) =>
            editingId === i.id ? (
              <InterestForm
                key={i.id}
                initial={i}
                onSave={(data) => { updateSpecialInterest(i.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <InterestCard
                key={i.id}
                interest={i}
                onEdit={() => setEditingId(i.id)}
                onDelete={() => deleteSpecialInterest(i.id)}
              />
            )
          )}
        </div>
      )}

      {/* Casual */}
      {casual.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">Casual Interests</p>
          {casual.map((i) =>
            editingId === i.id ? (
              <InterestForm
                key={i.id}
                initial={i}
                onSave={(data) => { updateSpecialInterest(i.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <InterestCard
                key={i.id}
                interest={i}
                onEdit={() => setEditingId(i.id)}
                onDelete={() => deleteSpecialInterest(i.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
