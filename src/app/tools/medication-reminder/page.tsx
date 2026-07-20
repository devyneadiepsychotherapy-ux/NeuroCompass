"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MedicationReminder } from "@/types";
import { cn } from "@/lib/utils";
import { Pill, Plus, Trash2, Check, Edit2, ArrowLeft, Sun, Moon, Minus } from "lucide-react";
import Link from "next/link";
import { getTodayKey } from "@/lib/utils";

type Schedule = "morning" | "evening" | "both";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// Returns the tracking key(s) for a med + slot
function takenKey(id: string, slot?: "morning" | "evening") {
  return slot ? `${id}-${slot}` : id;
}

// Check if a slot of a med is taken
function isSlotTaken(takenToday: string[], med: MedicationReminder, slot?: "morning" | "evening") {
  return takenToday.includes(takenKey(med.id, slot));
}

// ---------------------------------------------------------------------------
// MedRow
// ---------------------------------------------------------------------------

function MedRow({
  med,
  takenToday,
  onToggle,
  onEdit,
  onDelete,
}: {
  med: MedicationReminder;
  takenToday: string[];
  onToggle: (slot?: "morning" | "evening") => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const schedule = med.schedule ?? "morning";
  const isBoth = schedule === "both";

  const SlotButton = ({ slot, icon, label, time }: {
    slot?: "morning" | "evening";
    icon: React.ReactNode;
    label: string;
    time: string;
  }) => {
    const taken = isSlotTaken(takenToday, med, slot);
    return (
      <button
        onClick={() => onToggle(slot)}
        className={cn(
          "flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border-2 transition-all text-left",
          taken
            ? "bg-sage-50 border-sage-300"
            : "bg-white border-slate-200 hover:border-sage-300"
        )}
      >
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          taken ? "bg-sage-500 border-sage-500" : "border-slate-300"
        )}>
          {taken && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {icon}
            <span className={cn("text-xs font-semibold", taken ? "text-sage-600" : "text-slate-500")}>
              {label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{formatTime(time)}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 space-y-2">
      <div className="flex items-center gap-3">
        <Pill size={14} className="text-sage-400 shrink-0" />
        <p className="flex-1 text-sm font-semibold text-slate-800">{med.name}</p>
        {med.xpReward !== undefined && med.xpReward > 0 && (
          <span className="text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
            +{med.xpReward} XP
          </span>
        )}
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

      {isBoth ? (
        <div className="flex gap-2">
          <SlotButton
            slot="morning"
            icon={<Sun size={11} className="text-amber-400" />}
            label="Morning"
            time={med.time}
          />
          <SlotButton
            slot="evening"
            icon={<Moon size={11} className="text-indigo-400" />}
            label="Evening"
            time={med.eveningTime ?? "20:00"}
          />
        </div>
      ) : (
        <div>
          {(() => {
            const taken = isSlotTaken(takenToday, med);
            return (
              <button
                onClick={() => onToggle()}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all border-2",
                  taken ? "bg-sage-50 border-sage-200" : "bg-white border-slate-200 hover:border-sage-300"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  taken ? "bg-sage-500 border-sage-500" : "border-slate-300"
                )}>
                  {taken && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  {schedule === "morning"
                    ? <Sun size={12} className="text-amber-400" />
                    : <Moon size={12} className="text-indigo-400" />}
                  <span className={cn("text-sm flex-1", taken ? "line-through text-slate-400" : "text-slate-700 font-medium")}>
                    {formatTime(med.time)}
                  </span>
                  {taken && <span className="text-xs text-sage-500 font-semibold shrink-0">Done</span>}
                </div>
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MedForm
// ---------------------------------------------------------------------------

function MedForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<MedicationReminder>;
  onSave: (data: Omit<MedicationReminder, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [schedule, setSchedule] = useState<Schedule>(initial?.schedule ?? "morning");
  const [time, setTime] = useState(initial?.time ?? "08:00");
  const [eveningTime, setEveningTime] = useState(initial?.eveningTime ?? "20:00");
  const [xpReward, setXpReward] = useState(initial?.xpReward ?? 5);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      time,
      eveningTime: schedule === "both" ? eveningTime : undefined,
      schedule,
      xpReward,
    });
  };

  return (
    <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 space-y-4">
      {/* Name */}
      <input
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
        placeholder="Medication name (e.g. Concerta, Vitamin D)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && name.trim() && handleSave()}
      />

      {/* Schedule */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Schedule</p>
        <div className="flex gap-2">
          {(["morning", "evening", "both"] as Schedule[]).map((s) => (
            <button
              key={s}
              onClick={() => setSchedule(s)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                schedule === s
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-white text-slate-500 border-stone-200 hover:border-sage-300"
              )}
            >
              {s === "morning" && <Sun size={12} />}
              {s === "evening" && <Moon size={12} />}
              {s === "both" && <><Sun size={11} /><Moon size={11} /></>}
              {s === "morning" ? "Morning" : s === "evening" ? "Evening" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Times */}
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
            <Sun size={11} className="text-amber-400" />
            {schedule === "evening" ? "Time" : "Morning time"}
          </p>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-sm font-semibold text-sage-700 bg-white border border-sage-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sage-400 w-full"
          />
        </div>
        {schedule === "both" && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
              <Moon size={11} className="text-indigo-400" />
              Evening time
            </p>
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              className="text-sm font-semibold text-sage-700 bg-white border border-sage-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-sage-400 w-full"
            />
          </div>
        )}
      </div>

      {/* XP reward */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Points reward per dose</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setXpReward(Math.max(0, xpReward - 5))}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-sage-300 transition-colors"
          >
            <Minus size={14} />
          </button>
          <div className="flex-1 text-center">
            <span className="text-lg font-bold text-slate-800">{xpReward}</span>
            <span className="text-xs text-slate-400 ml-1">XP</span>
          </div>
          <button
            onClick={() => setXpReward(Math.min(50, xpReward + 5))}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-sage-300 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {xpReward === 0 && (
          <p className="text-xs text-slate-400 text-center mt-1">No points awarded</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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
            Add up to 3 medications with morning, evening, or both reminders. Each check-off earns XP.
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
                onSave={(data) => {
                  updateMedicationReminder(med.id, data);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <MedRow
                key={med.id}
                med={med}
                takenToday={takenToday}
                onToggle={(slot) => toggleMedicationTaken(med.id, today, slot)}
                onEdit={() => setEditingId(med.id)}
                onDelete={() => deleteMedicationReminder(med.id)}
              />
            )
          )}
        </div>
      )}

      {showAdd ? (
        <MedForm
          onSave={(data) => {
            addMedicationReminder(data);
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

      {/* Settings */}
      {medicationReminders.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Show on Me page</p>
                <p className="text-xs text-slate-400">Daily checkoff on your profile</p>
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
                <p className="text-xs text-slate-400">Daily checkoff on the home screen</p>
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
              A banner appears when you open the app after the scheduled time if you haven&apos;t checked off yet. Checking off a dose earns the XP you set per medication.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
