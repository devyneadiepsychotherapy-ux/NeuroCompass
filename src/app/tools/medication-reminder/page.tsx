"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MedicationReminder } from "@/types";
import { cn } from "@/lib/utils";
import { Pill, Plus, Trash2, Check, Edit2, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTodayKey } from "@/lib/utils";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function MedRow({
  med,
  taken,
  onToggle,
  onEdit,
  onDelete,
}: {
  med: MedicationReminder;
  taken: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3 transition-all",
      taken && "opacity-60"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          taken ? "bg-sage-500 border-sage-500" : "border-slate-300 hover:border-sage-400"
        )}
      >
        {taken && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold text-slate-800", taken && "line-through text-slate-400")}>
          {med.name}
        </p>
        <p className="text-xs text-slate-400">{formatTime(med.time)}</p>
      </div>

      {confirmDelete ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Delete?</span>
          <button onClick={onDelete} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Yes</button>
          <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">No</button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-300 hover:text-sage-500 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function MedForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<MedicationReminder>;
  onSave: (name: string, time: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [time, setTime] = useState(initial?.time ?? "08:00");

  return (
    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 space-y-3">
      <input
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
        placeholder="Medication name (e.g. Concerta, Vitamin D)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && name.trim() && onSave(name.trim(), time)}
      />
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Reminder time</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="text-sm font-semibold text-sage-700 bg-white border border-sage-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sage-400 w-full"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => name.trim() && onSave(name.trim(), time)}
          disabled={!name.trim()}
          className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
        >
          Save
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MedicationReminderPage() {
  const {
    medicationReminders,
    medicationTakenDates,
    addMedicationReminder,
    updateMedicationReminder,
    deleteMedicationReminder,
    toggleMedicationTaken,
    medicationShowOnMe,
    medicationShowOnHome,
    setMedicationShowOnMe,
    setMedicationShowOnHome,
  } = useAppStore();

  const today = getTodayKey();
  const takenToday = medicationTakenDates[today] ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const canAdd = medicationReminders.length < 3;

  return (
    <div className="px-4 pt-0 pb-24 space-y-5">
      <div className="pt-3 pb-2 flex items-center gap-3">
        <Link href="/tools" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
            Medication Reminder
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your daily medications</p>
        </div>
        <Pill size={22} className="text-sage-500 ml-auto shrink-0" />
      </div>

      {medicationReminders.length === 0 && !showAdd && (
        <div className="bg-sage-50 border border-sage-100 rounded-2xl p-6 text-center space-y-3">
          <Pill size={32} className="text-sage-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No medications added yet</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Add up to 3 medications with a daily reminder time. A checkoff prompt will appear on your Me page each day.
          </p>
        </div>
      )}

      {medicationReminders.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Today</p>
          {medicationReminders.map((med) =>
            editingId === med.id ? (
              <MedForm
                key={med.id}
                initial={med}
                onSave={(name, time) => {
                  updateMedicationReminder(med.id, { name, time });
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <MedRow
                key={med.id}
                med={med}
                taken={takenToday.includes(med.id)}
                onToggle={() => toggleMedicationTaken(med.id, today)}
                onEdit={() => setEditingId(med.id)}
                onDelete={() => deleteMedicationReminder(med.id)}
              />
            )
          )}
        </div>
      )}

      {showAdd ? (
        <MedForm
          onSave={(name, time) => {
            addMedicationReminder({ name, time });
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      ) : canAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl py-4 text-sm text-slate-500 font-medium hover:border-sage-400 hover:text-sage-600 transition-all"
        >
          <Plus size={16} />
          Add medication{medicationReminders.length > 0 ? ` (${3 - medicationReminders.length} remaining)` : ""}
        </button>
      ) : (
        <p className="text-xs text-center text-slate-400">Maximum 3 medications. Delete one to add another.</p>
      )}

      {medicationReminders.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Show on Me page</p>
                <p className="text-xs text-slate-400">Daily checkoff appears on your profile</p>
              </div>
              <button
                onClick={() => setMedicationShowOnMe(!medicationShowOnMe)}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors shrink-0",
                  medicationShowOnMe ? "bg-sage-500" : "bg-slate-200"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                  medicationShowOnMe ? "left-[22px]" : "left-0.5"
                )} />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Show on Home page</p>
                <p className="text-xs text-slate-400">Daily checkoff appears on the home screen</p>
              </div>
              <button
                onClick={() => setMedicationShowOnHome(!medicationShowOnHome)}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors shrink-0",
                  medicationShowOnHome ? "bg-sage-500" : "bg-slate-200"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
                  medicationShowOnHome ? "left-[22px]" : "left-0.5"
                )} />
              </button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-1.5">
            <p className="text-xs font-semibold text-slate-600">How reminders work</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A banner appears when you open the app after the scheduled time if you haven&apos;t checked off yet. The checkoff can appear on the Me page and/or the home page — toggle above to choose.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
