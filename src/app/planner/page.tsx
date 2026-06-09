"use client";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Task, TaskPriority, RecurType, RewardType, TaskItemType, Appointment, TopPriority, Habit } from "@/types";
import { getTodayKey, formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Plus, Check, Trash2, Star, Clock, ChevronDown, ChevronUp, X, Repeat,
  Eye, EyeOff, Flame, CalendarClock, Target, ListTodo, Activity, Coins,
  ChevronLeft, ChevronRight, Calendar, CalendarDays, Pencil,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const priorityConfig: Record<TaskPriority, { label: string; color: string; xp: number }> = {
  low: { label: "Low", color: "bg-stone-100 text-stone-600", xp: 5 },
  medium: { label: "Medium", color: "bg-cream-100 text-stone-700", xp: 10 },
  high: { label: "High", color: "bg-[#e8d8d2] text-[#8f6559]", xp: 20 },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700", xp: 30 },
};

const DEFAULT_REWARD_AMOUNTS: Record<RewardType, number> = {
  xp: 10,
  coins: 5,
};

const recurOptions: { value: RecurType; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "weekly", label: "Weekly" },
];

const taskTypeConfig: Record<TaskItemType, { label: string; color: string }> = {
  task: { label: "Task", color: "bg-slate-100 text-slate-600" },
  appointment: { label: "Appointment", color: "bg-blue-100 text-blue-700" },
  "time-block": { label: "Time Block", color: "bg-violet-100 text-violet-700" },
};

const CATEGORIES = ["Personal", "Work", "Health", "Self-care", "Admin", "Social", "Other"];
const TIME_ESTIMATES = [5, 10, 15, 20, 30, 45, 60, 90, 120];
const TOP3_LABELS = ["Most Important", "Also Important", "If I Have Energy"];

// ---------------------------------------------------------------------------
// View types and helpers
// ---------------------------------------------------------------------------

type PlannerView = "day" | "week" | "month";

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const dow = d.getDay(); // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow; // shift to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

function getMonthGrid(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6; // Sunday = index 6
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatDateLabel(date: Date, view: PlannerView): string {
  if (view === "day") {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }
  if (view === "week") {
    const days = getWeekDays(date);
    const s = days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const e = days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${s} - ${e}`;
  }
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function navigateDate(date: Date, view: PlannerView, dir: 1 | -1): Date {
  const d = new Date(date);
  if (view === "day") d.setDate(d.getDate() + dir);
  else if (view === "week") d.setDate(d.getDate() + dir * 7);
  else d.setMonth(d.getMonth() + dir);
  return d;
}

function taskMatchesView(task: Task, view: PlannerView): boolean {
  if (!task.showOn || task.showOn.length === 0) return true;
  return task.showOn.includes(view);
}

function formatTimeStr(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function calcDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin <= 0) return "";
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min`;
}

// ---------------------------------------------------------------------------
// View Toggle
// ---------------------------------------------------------------------------

function ViewToggle({ active, onChange }: { active: PlannerView; onChange: (v: PlannerView) => void }) {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
      {(["day", "week", "month"] as PlannerView[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
            active === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date Navigation
// ---------------------------------------------------------------------------

function DateNavigation({
  date,
  view,
  onNavigate,
}: {
  date: Date;
  view: PlannerView;
  onNavigate: (d: Date) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onNavigate(navigateDate(date, view, -1))}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        aria-label="Previous"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-semibold text-slate-700 text-center flex-1">
        {formatDateLabel(date, view)}
      </span>
      <button
        onClick={() => onNavigate(navigateDate(date, view, 1))}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        aria-label="Next"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week View
// ---------------------------------------------------------------------------

const WEEK_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeekView({ date }: { date: Date }) {
  const { tasks } = useAppStore();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const todayKey = getTodayKey();
  const weekDays = getWeekDays(date);

  return (
    <div className="space-y-2">
      {weekDays.map((day, i) => {
        const key = dateKey(day);
        const pendingTasks = tasks.filter(
          (t) => taskMatchesView(t, "week") && t.status !== "done" && t.dueDate === key
        );
        const doneTasks = tasks.filter(
          (t) => taskMatchesView(t, "week") && t.status === "done" && t.dueDate === key
        );
        const totalCount = pendingTasks.length + doneTasks.length;
        const isToday = key === todayKey;
        const isExpanded = expandedDay === key;

        return (
          <div key={key} className="bg-cream-50 border border-slate-100 rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all text-left"
              onClick={() => setExpandedDay(isExpanded ? null : key)}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0",
                  isToday ? "bg-sage-600 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                <span className="text-[9px] font-bold uppercase leading-none">{WEEK_DAY_LABELS[i]}</span>
                <span className="text-sm font-bold leading-tight">{day.getDate()}</span>
              </div>
              <span className="flex-1 text-sm text-slate-500">
                {totalCount === 0
                  ? "No tasks"
                  : `${pendingTasks.length} task${pendingTasks.length !== 1 ? "s" : ""}${
                      doneTasks.length > 0 ? `, ${doneTasks.length} done` : ""
                    }`}
              </span>
              {totalCount > 0 &&
                (isExpanded ? (
                  <ChevronUp size={14} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-slate-400 shrink-0" />
                ))}
            </button>
            {isExpanded && totalCount > 0 && (
              <div className="px-4 pb-3 pt-3 space-y-2 border-t border-slate-100">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month View
// ---------------------------------------------------------------------------

const MONTH_DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MonthView({ date, onDaySelect }: { date: Date; onDaySelect: (d: Date) => void }) {
  const { tasks } = useAppStore();
  const cells = getMonthGrid(date);
  const todayKey = getTodayKey();

  return (
    <div className="bg-cream-50 border border-slate-100 rounded-2xl p-4">
      <div className="grid grid-cols-7 mb-3">
        {MONTH_DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="aspect-square" />;
          const key = dateKey(cell);
          const dayTaskCount = tasks.filter(
            (t) => taskMatchesView(t, "month") && t.dueDate === key && t.status !== "done"
          ).length;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              onClick={() => onDaySelect(cell)}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all",
                isToday
                  ? "bg-sage-600 text-white hover:bg-sage-700"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <span>{cell.getDate()}</span>
              {dayTaskCount > 0 && (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mt-0.5 shrink-0",
                    isToday ? "bg-white/70" : "bg-sage-400"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper with hide/show
// ---------------------------------------------------------------------------

function Section({
  id,
  icon,
  title,
  onToggle,
  children,
  action,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  visible?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {action}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
            aria-label={`Hide ${title}`}
          >
            <EyeOff size={15} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule section
// ---------------------------------------------------------------------------

function ScheduleSection() {
  const { appointments, addAppointment, deleteAppointment } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState("09:00");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addAppointment({ time, title: title.trim(), notes: notes.trim() || undefined });
    setTitle("");
    setNotes("");
    setTime("09:00");
    setShowForm(false);
  };

  return (
    <div className="space-y-2">
      {appointments.length === 0 && !showForm && (
        <p className="text-sm text-slate-400 italic">No appointments yet for today.</p>
      )}

      {appointments.map((appt) => (
        <AppointmentRow key={appt.id} appt={appt} onDelete={() => deleteAppointment(appt.id)} />
      ))}

      {showForm ? (
        <div className="bg-cream-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex gap-3">
            <input
              type="time"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <input
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="Appointment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl py-2 transition-all"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium py-1"
        >
          <Plus size={15} />
          Add appointment
        </button>
      )}
    </div>
  );
}

function AppointmentRow({ appt, onDelete }: { appt: Appointment; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="bg-cream-50 border border-slate-100 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono font-semibold text-sage-600 min-w-[60px]">
          {formatTime(appt.time)}
        </span>
        <p className="flex-1 text-sm font-medium text-slate-800">{appt.title}</p>
        <div className="flex items-center gap-1">
          {appt.notes && (
            <button onClick={() => setExpanded(!expanded)} className="p-1 text-slate-300 hover:text-slate-500">
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
          <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {expanded && appt.notes && (
        <p className="mt-1.5 text-xs text-slate-500 ml-[72px] leading-relaxed">{appt.notes}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top 3 Priorities section
// ---------------------------------------------------------------------------

function Top3Section() {
  const { topPriorities, updateTopPriority } = useAppStore();

  return (
    <div className="space-y-2">
      {topPriorities.map((priority, idx) => (
        <Top3Item
          key={priority.id}
          priority={priority}
          label={TOP3_LABELS[idx]}
          index={idx}
          onUpdate={(updates) => updateTopPriority(priority.id, updates)}
        />
      ))}
    </div>
  );
}

function Top3Item({
  priority,
  label,
  index,
  onUpdate,
}: {
  priority: TopPriority;
  label: string;
  index: number;
  onUpdate: (updates: Partial<Omit<TopPriority, "id">>) => void;
}) {
  const accentColors = ["border-l-sage-500", "border-l-[#B8897A]", "border-l-rose-300"];

  return (
    <div
      className={cn(
        "bg-cream-50 border border-slate-100 border-l-4 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all",
        accentColors[index],
        priority.completed && "opacity-60"
      )}
    >
      <button
        onClick={() => onUpdate({ completed: !priority.completed })}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          priority.completed ? "bg-sage-500 border-sage-500" : "border-slate-300 hover:border-sage-400"
        )}
      >
        {priority.completed && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <input
          className={cn(
            "w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-300 focus:outline-none",
            priority.completed && "line-through text-slate-400"
          )}
          placeholder="What matters most today?"
          value={priority.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Habits section
// ---------------------------------------------------------------------------

function HabitsSection() {
  const { habits, addHabit, deleteHabit, toggleHabitToday } = useAppStore();
  const [showInput, setShowInput] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const today = getTodayKey();

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim());
    setNewHabitName("");
    setShowInput(false);
  };

  return (
    <div className="space-y-2">
      {habits.length === 0 && !showInput && (
        <p className="text-sm text-slate-400 italic">Add habits to track each day.</p>
      )}

      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          today={today}
          onToggle={() => toggleHabitToday(habit.id)}
          onDelete={() => deleteHabit(habit.id)}
        />
      ))}

      {showInput ? (
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="New habit name..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setShowInput(false);
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newHabitName.trim()}
            className="px-4 py-2 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Add
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium py-1"
        >
          <Plus size={15} />
          Add habit
        </button>
      )}
    </div>
  );
}

function HabitRow({
  habit,
  today,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  today: string;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { addXP } = useAppStore();
  const doneToday = habit.completedDates.includes(today);
  const [xpToast, setXpToast] = useState(false);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = () => {
    onToggle();
    if (!doneToday) {
      addXP(5);
      if (toastRef.current) clearTimeout(toastRef.current);
      setXpToast(true);
      toastRef.current = setTimeout(() => setXpToast(false), 1500);
    }
  };

  useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  const streak = (() => {
    if (habit.completedDates.length === 0) return 0;
    const sorted = [...habit.completedDates].sort().reverse();
    let count = 0;
    let cursor = new Date(today);
    for (const d of sorted) {
      const dDate = new Date(d);
      const diff = Math.round((cursor.getTime() - dDate.getTime()) / 86400000);
      if (diff === 0) {
        count++;
        cursor = new Date(d);
        cursor.setDate(cursor.getDate() - 1);
      } else if (diff === 1) {
        count++;
        cursor = dDate;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return count;
  })();

  return (
    <div
      className={cn(
        "bg-cream-50 border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all relative",
        doneToday && "bg-emerald-50 border-emerald-100"
      )}
    >
      {xpToast && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 animate-fade-in-up whitespace-nowrap">
          +5 XP
        </div>
      )}
      <button
        onClick={handleToggle}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          doneToday ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-emerald-400"
        )}
      >
        {doneToday && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>

      <p className={cn("flex-1 text-sm font-medium text-slate-800", doneToday && "line-through text-slate-400")}>
        {habit.name}
      </p>

      {streak > 0 && (
        <span className="flex items-center gap-1 text-xs font-semibold text-[#B8897A]">
          <Flame size={12} fill="currentColor" />
          {streak}
        </span>
      )}

      <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / Edit Task Modal
// ---------------------------------------------------------------------------

function AddTaskModal({ onClose, taskToEdit }: { onClose: () => void; taskToEdit?: Task }) {
  const { addTask, editTask } = useAppStore();
  const isEditing = !!taskToEdit;

  const [title, setTitle] = useState(taskToEdit?.title ?? "");
  const [description, setDescription] = useState(taskToEdit?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority ?? "medium");
  const [taskType, setTaskType] = useState<TaskItemType>(taskToEdit?.type ?? "task");
  const [duration, setDuration] = useState(taskToEdit?.duration ?? "");
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ?? getTodayKey());
  const [isRecurring, setIsRecurring] = useState(taskToEdit?.isRecurring ?? false);
  const [recurType, setRecurType] = useState<RecurType>(taskToEdit?.recurType ?? "daily");
  const [category, setCategory] = useState(taskToEdit?.category ?? "Personal");
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>(taskToEdit?.timeEstimate);
  const [rewardType, setRewardType] = useState<RewardType>(taskToEdit?.rewardType ?? "xp");
  const [rewardAmount, setRewardAmount] = useState(taskToEdit?.xpReward ?? 10);
  const [showOn, setShowOn] = useState<("day" | "week" | "month")[]>(
    taskToEdit?.showOn ?? ["day", "week", "month"]
  );
  const [startTime, setStartTime] = useState(taskToEdit?.startTime ?? "");
  const [endTime, setEndTime] = useState(taskToEdit?.endTime ?? "");

  const toggleShowOn = (view: "day" | "week" | "month") => {
    setShowOn((prev) =>
      prev.includes(view) ? prev.filter((v) => v !== view) : [...prev, view]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (isEditing && taskToEdit) {
      editTask(taskToEdit.id, {
        title: title.trim(),
        description,
        priority,
        type: taskType,
        duration: duration.trim() || undefined,
        xpReward: rewardAmount,
        rewardType,
        dueDate,
        isRecurring,
        recurType: isRecurring ? recurType : undefined,
        timeEstimate,
        category,
        showOn,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        description,
        priority,
        type: taskType,
        duration: duration.trim() || undefined,
        status: "todo",
        xpReward: rewardAmount,
        rewardType,
        dueDate,
        isRecurring,
        recurType: isRecurring ? recurType : undefined,
        tags: [],
        timeEstimate,
        category,
        showOn,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-0">
      <div className="bg-cream-50 rounded-t-3xl w-full max-w-lg p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{isEditing ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <input
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="What do you want to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
          placeholder="Optional description or notes..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Type</p>
          <div className="flex gap-2">
            {(["task", "appointment", "time-block"] as TaskItemType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTaskType(t)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  taskType === t
                    ? "border-sage-500 " + taskTypeConfig[t].color
                    : "border-transparent bg-slate-50 text-slate-500"
                )}
              >
                {taskTypeConfig[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Start / End Time — appointment & time-block only */}
        {(taskType === "appointment" || taskType === "time-block") && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Start</label>
                <input
                  type="time"
                  className="w-full min-h-[44px] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">End</label>
                <input
                  type="time"
                  className="w-full min-h-[44px] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            {calcDuration(startTime, endTime) && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={11} />
                {calcDuration(startTime, endTime)}
              </p>
            )}
          </div>
        )}

        {/* Duration — task type only */}
        {taskType === "task" && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Duration</p>
            <input
              className="w-full min-h-[44px] border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="e.g. 30 min, 1 hour"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        )}

        {/* Priority */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Priority</p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(priorityConfig) as [TaskPriority, typeof priorityConfig.low][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={cn(
                    "rounded-xl py-2 text-xs font-semibold border-2 transition-all",
                    priority === key
                      ? "border-sage-500 " + cfg.color
                      : "border-transparent bg-slate-50 text-slate-500"
                  )}
                >
                  {cfg.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Reward */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Reward on completion
          </p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {(["xp", "coins"] as RewardType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setRewardType(t);
                    setRewardAmount(DEFAULT_REWARD_AMOUNTS[t]);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                    rewardType === t
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t === "xp" ? (
                    <>
                      <Star size={11} fill="currentColor" className="text-[#9B8EC4]" /> XP
                    </>
                  ) : (
                    <>
                      <Coins size={11} className="text-[#B8A96A]" /> Coins
                    </>
                  )}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={999}
              className="w-20 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400 text-center"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <span className="text-xs text-slate-400">{rewardType === "xp" ? "XP" : "coins"}</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  category === c
                    ? "bg-sage-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Time estimate */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Time estimate
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_ESTIMATES.map((t) => (
              <button
                key={t}
                onClick={() => setTimeEstimate(timeEstimate === t ? undefined : t)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  timeEstimate === t ? "bg-sage-600 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {formatMinutes(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Due date</p>
          <input
            type="date"
            className="border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Show on */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Show on</p>
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => toggleShowOn(v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-medium border-2 transition-all",
                  showOn.includes(v)
                    ? "border-sage-400 bg-sage-50 text-sage-700"
                    : "border-transparent bg-slate-100 text-slate-500"
                )}
              >
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0",
                    showOn.includes(v) ? "bg-sage-500 border-sage-500" : "border-slate-300"
                  )}
                >
                  {showOn.includes(v) && <Check size={8} className="text-white" strokeWidth={3} />}
                </div>
                {v.charAt(0).toUpperCase() + v.slice(1)} view
              </button>
            ))}
          </div>
        </div>

        {/* Recurring */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecurring(!isRecurring)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              isRecurring
                ? "bg-sage-100 text-sage-700 border-sage-300"
                : "bg-slate-100 text-slate-600 border-transparent"
            )}
          >
            <Repeat size={15} />
            Recurring
          </button>
          {isRecurring && (
            <select
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none"
              value={recurType}
              onChange={(e) => setRecurType(e.target.value as RecurType)}
            >
              {recurOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="w-full bg-sage-600 hover:bg-sage-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-2xl py-3 transition-all"
        >
          {isEditing ? "Save Changes" : "Add Task"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Card
// ---------------------------------------------------------------------------

function TaskCard({ task }: { task: Task }) {
  const { completeTask, deleteTask, updateTask, addXP } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cfg = priorityConfig[task.priority];
  const isDone = task.status === "done";
  const taskType = task.type ?? "task";

  const handleComplete = () => {
    if (isDone) {
      updateTask(task.id, { status: "todo", completedAt: undefined });
    } else {
      const msg = task.rewardType === "coins" ? `+${task.xpReward} coins` : `+${task.xpReward} XP`;
      setToast(msg);
      setTimeout(() => setToast(null), 1500);
      completeTask(task.id);
      addXP(5);
    }
  };

  return (
    <div
      className={cn(
        "bg-cream-50 rounded-2xl border transition-all shadow-sm relative",
        isDone ? "border-slate-100 opacity-60" : "border-slate-100 hover:border-sage-200"
      )}
    >
      {toast && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 animate-fade-in-up whitespace-nowrap">
          {toast}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={handleComplete}
            className={cn(
              "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              isDone ? "bg-sage-500 border-sage-500" : "border-slate-300 hover:border-sage-400"
            )}
          >
            {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium text-slate-800 leading-snug",
                isDone && "line-through text-slate-400"
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.color)}>
                {cfg.label}
              </span>
              {taskType !== "task" && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", taskTypeConfig[taskType].color)}>
                  {taskTypeConfig[taskType].label}
                </span>
              )}
              {(task.startTime || task.endTime) && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {task.startTime ? formatTimeStr(task.startTime) : ""}
                  {task.startTime && task.endTime ? " – " : ""}
                  {task.endTime ? formatTimeStr(task.endTime) : ""}
                </span>
              )}
              {task.duration && !task.startTime && !task.endTime && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {task.duration}
                </span>
              )}
              {task.category && <span className="text-xs text-slate-400">{task.category}</span>}
              {task.timeEstimate && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {formatMinutes(task.timeEstimate)}
                </span>
              )}
              {task.isRecurring && (
                <span className="flex items-center gap-1 text-xs text-sage-500">
                  <Repeat size={11} />
                  {recurOptions.find((r) => r.value === task.recurType)?.label}
                </span>
              )}
              {task.rewardType === "coins" ? (
                <span className="text-xs text-[#B8A96A] font-medium flex items-center gap-0.5">
                  <Coins size={10} />
                  +{task.xpReward}
                </span>
              ) : (
                <span className="text-xs text-[#B8A96A] font-medium flex items-center gap-0.5">
                  <Star size={10} fill="currentColor" />
                  +{task.xpReward} XP
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {task.description && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            <button
              onClick={() => setShowEdit(true)}
              className="p-1 text-slate-300 hover:text-sage-500 transition-colors"
              aria-label="Edit task"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 text-slate-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {expanded && task.description && (
          <p className="mt-2 text-sm text-slate-500 ml-9 leading-relaxed">{task.description}</p>
        )}
      </div>
      {showEdit && <AddTaskModal onClose={() => setShowEdit(false)} taskToEdit={task} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tasks section
// ---------------------------------------------------------------------------

function TasksSection({
  onAddTask,
  activeView,
  selectedDate,
}: {
  onAddTask: () => void;
  activeView: PlannerView;
  selectedDate: Date;
}) {
  const { tasks } = useAppStore();
  const [filter, setFilter] = useState<"all" | "today" | "done">("today");
  const today = getTodayKey();
  const selKey = dateKey(selectedDate);

  const filtered = tasks.filter((t) => {
    if (filter === "done") return t.status === "done";
    if (!taskMatchesView(t, activeView)) return false;
    if (filter === "today") return (!t.dueDate || t.dueDate === selKey) && t.status !== "done";
    return t.status !== "done";
  });

  const doneTodayCount = tasks.filter((t) => t.completedAt?.startsWith(today)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {doneTodayCount} done today · {filtered.length} remaining
        </p>
        <div className="flex gap-1.5">
          {(["today", "all", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                filter === f
                  ? "bg-sage-600 text-white"
                  : "bg-cream-50 text-slate-500 border border-slate-200 hover:border-sage-300"
              )}
            >
              {f === "today" ? "Today" : f === "all" ? "All" : "Done"}
            </button>
          ))}
        </div>
      </div>

      {filter === "today" && tasks.length === 0 && (
        <div className="bg-gradient-to-br from-sage-50 to-stone-100 rounded-2xl p-5 text-center">
          <p className="font-semibold text-slate-700 text-sm">Start somewhere</p>
          <p className="text-xs text-slate-500 mt-1">Even one small task is progress.</p>
          <button
            onClick={onAddTask}
            className="mt-3 bg-sage-600 text-white px-5 py-1.5 rounded-2xl text-xs font-medium hover:bg-sage-700 transition-all"
          >
            Add your first task
          </button>
        </div>
      )}

      {filtered.length === 0 && tasks.length > 0 && (
        <div className="bg-cream-50 rounded-2xl p-5 text-center border border-slate-100">
          <p className="font-semibold text-slate-700 text-sm">
            {filter === "done" ? "No completed tasks yet" : "All caught up!"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === "done"
              ? "Complete a task to see it here"
              : "Great work! Add a new task anytime."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PlannerPage() {
  const { sectionVisibility, toggleSection } = useAppStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<PlannerView>("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => setMounted(true), []);

  const hiddenSections = mounted
    ? Object.entries(sectionVisibility)
        .filter(([, v]) => !v)
        .map(([k]) => k as keyof typeof sectionVisibility)
    : [];

  const handleDaySelect = (d: Date) => {
    setSelectedDate(d);
    setActiveView("day");
  };

  return (
    <div className="px-4 pt-4 pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Planner</h1>
        <button
          onClick={() => setShowTaskModal(true)}
          className="w-11 h-11 rounded-2xl bg-sage-600 flex items-center justify-center shadow-md hover:bg-sage-700 transition-all active:scale-95"
        >
          <Plus size={22} className="text-white" />
        </button>
      </div>

      {/* View toggle + date navigation */}
      <div className="space-y-3">
        <ViewToggle active={activeView} onChange={setActiveView} />
        <DateNavigation date={selectedDate} view={activeView} onNavigate={setSelectedDate} />
      </div>

      {/* Day view */}
      {activeView === "day" && (
        <>
          {/* Hidden section chips */}
          {hiddenSections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hiddenSections.map((key) => {
                const labels: Record<string, string> = {
                  schedule: "Schedule",
                  top3: "Top 3",
                  tasks: "Tasks",
                  habits: "Habits",
                };
                return (
                  <button
                    key={key}
                    onClick={() => toggleSection(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cream-50 border border-slate-200 text-slate-500 hover:border-sage-300 hover:text-sage-600 transition-all"
                  >
                    <Eye size={12} />
                    Show {labels[key]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Schedule */}
          {(!mounted || sectionVisibility.schedule) && (
            <Section
              id="schedule"
              icon={<CalendarClock size={16} />}
              title="Schedule"
              onToggle={() => toggleSection("schedule")}
            >
              <ScheduleSection />
            </Section>
          )}

          {/* Top 3 Priorities */}
          {(!mounted || sectionVisibility.top3) && (
            <Section
              id="top3"
              icon={<Target size={16} />}
              title="Top 3 Priorities"
              onToggle={() => toggleSection("top3")}
            >
              <Top3Section />
            </Section>
          )}

          {/* Tasks */}
          {(!mounted || sectionVisibility.tasks) && (
            <Section
              id="tasks"
              icon={<ListTodo size={16} />}
              title="Tasks"
              onToggle={() => toggleSection("tasks")}
              action={
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1 text-xs text-sage-600 font-medium hover:text-sage-700 transition-all"
                >
                  <Plus size={13} />
                  Add task
                </button>
              }
            >
              <TasksSection
                onAddTask={() => setShowTaskModal(true)}
                activeView={activeView}
                selectedDate={selectedDate}
              />
            </Section>
          )}

          {/* Habits */}
          {(!mounted || sectionVisibility.habits) && (
            <Section
              id="habits"
              icon={<Activity size={16} />}
              title="Habits"
              onToggle={() => toggleSection("habits")}
            >
              <HabitsSection />
            </Section>
          )}
        </>
      )}

      {/* Week view */}
      {activeView === "week" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                <CalendarDays size={16} />
              </span>
              <h2 className="text-base font-bold text-slate-800">This Week</h2>
            </div>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1 text-xs text-sage-600 font-medium hover:text-sage-700 transition-all"
            >
              <Plus size={13} />
              Add task
            </button>
          </div>
          <WeekView date={selectedDate} />
        </div>
      )}

      {/* Month view */}
      {activeView === "month" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              <Calendar size={16} />
            </span>
            <h2 className="text-base font-bold text-slate-800">Monthly View</h2>
          </div>
          <MonthView date={selectedDate} onDaySelect={handleDaySelect} />
        </div>
      )}

      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} />}
    </div>
  );
}
