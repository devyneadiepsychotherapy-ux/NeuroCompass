"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAppStore, defaultTopPriorities } from "@/store/useAppStore";
import { Task, TaskPriority, RecurType, RewardType, TaskItemType, Appointment, TopPriority, Habit } from "@/types";
import { getTodayKey, formatMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Plus, Check, Trash2, Star, Clock, ChevronDown, ChevronUp, X, Repeat,
  Eye, EyeOff, Flame, CalendarClock, Target, ListTodo, Activity, Coins,
  ChevronLeft, ChevronRight, Calendar, CalendarDays, Pencil, UtensilsCrossed,
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
  task: { label: "Activity", color: "bg-slate-100 text-slate-600" },
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

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const year = d.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil((((d.getTime() - jan1.getTime()) / 86400000) + jan1.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

/** Recurring tasks reset each day — only treat as done if completed today. */
function isTaskDone(task: Task): boolean {
  if (task.status !== "done") return false;
  if (task.recurType) {
    const today = getTodayKey();
    return (task.completedAt?.startsWith(today)) ?? false;
  }
  return true;
}

function formatTimeStr(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function addOneHour(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcDurationMins(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
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
    <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-black/5">
      {(["day", "week", "month"] as PlannerView[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize",
            active === v ? "bg-sage-100 text-sage-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
  const todayKey = getTodayKey();
  const isToday = dateKey(date) === todayKey;

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onNavigate(navigateDate(date, view, -1))}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        aria-label="Previous"
      >
        <ChevronLeft size={16} />
      </button>

      {view !== "day" && (
        <span className="font-[family-name:var(--font-fraunces)] italic text-base text-slate-700 text-center flex-1">
          {formatDateLabel(date, view)}
        </span>
      )}

      {view === "day" && (
        <div className="flex-1 flex justify-center">
          {isToday ? (
            <span className="font-[family-name:var(--font-fraunces)] italic text-sm text-sage-600 uppercase tracking-wider">TODAY</span>
          ) : (
            <button
              onClick={() => onNavigate(new Date())}
              className="font-[family-name:var(--font-fraunces)] italic text-sm text-sage-600 hover:text-sage-700 transition-colors px-3 py-1 rounded-lg hover:bg-sage-50 uppercase tracking-wider"
            >
              Back to Today
            </button>
          )}
        </div>
      )}

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

function WeekView({ date, onDayClick }: { date: Date; onDayClick?: (d: Date) => void }) {
  const { tasks, appointments } = useAppStore();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const todayKey = getTodayKey();
  const weekDays = getWeekDays(date);

  const hasAnythingThisWeek = weekDays.some((day) => {
    const key = dateKey(day);
    return (
      appointments.some((a) => a.date === key && (!a.showOn || a.showOn.includes("week"))) ||
      tasks.some((t) => taskMatchesView(t, "week") && t.dueDate === key)
    );
  });

  return (
    <div>
      {!hasAnythingThisWeek && (
        <p className="text-sm text-slate-400 italic mb-4">Nothing scheduled this week.</p>
      )}
      <div className="space-y-1">
        {weekDays.map((day, i) => {
          const key = dateKey(day);
          const pendingTasks = tasks.filter(
            (t) => taskMatchesView(t, "week") && !isTaskDone(t) && t.dueDate === key
          );
          const doneTasks = tasks.filter(
            (t) => taskMatchesView(t, "week") && isTaskDone(t) && t.dueDate === key
          );
          const dayAppts = appointments.filter(
            (a) => a.date === key && (!a.showOn || a.showOn.includes("week"))
          );
          const taskCount = pendingTasks.length + doneTasks.length;
          const isToday = key === todayKey;
          const isExpanded = expandedDay === key;
          const hasAnything = dayAppts.length > 0 || taskCount > 0;

          const isWeekend = i >= 5;
          return (
            <div key={key} className={cn(
              "flex items-start gap-3 py-1.5 px-2 rounded-r-xl transition-colors",
              isToday
                ? "border-l-2 border-sage-400 bg-sage-50/60 pl-3"
                : isWeekend
                ? "border-l-2 pl-3"
                : "border-l-2 border-slate-200/60 pl-3"
            )}
            style={isWeekend && !isToday ? { borderLeftColor: "#C4909A55" } : undefined}
            >
              {/* Day label — tap to go to that day */}
              <button
                className="w-9 shrink-0 pt-0.5 text-left"
                onClick={() => onDayClick?.(day)}
              >
                <span className={cn("text-[9px] font-bold uppercase block leading-none",
                  isToday ? "text-sage-600" : isWeekend ? "text-[#C4909A]" : "text-slate-500")}>
                  {WEEK_DAY_LABELS[i]}
                </span>
                <span className={cn("text-sm font-bold leading-snug",
                  isToday ? "text-sage-700" : isWeekend ? "text-[#8f6559]" : "text-slate-700")}>
                  {day.getDate()}
                </span>
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                {!hasAnything && (
                  <span className="text-xs text-slate-400">—</span>
                )}

                <div className="space-y-0.5">
                  {dayAppts.map((appt) => {
                    const c = appt.color ?? DEFAULT_APPT_COLOR;
                    return (
                      <div key={appt.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
                        <span className="text-sm text-slate-700 truncate">{appt.title}</span>
                        {appt.startTime && !appt.allDay && (
                          <span className="text-xs text-slate-400 shrink-0">{appt.startTime}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {taskCount > 0 && (
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : key)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
                  >
                    {taskCount} task{taskCount !== 1 ? "s" : ""}
                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                )}

                {isExpanded && taskCount > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {[...pendingTasks, ...doneTasks].map((task) => (
                      <div key={task.id} className={cn("flex items-center gap-2", isTaskDone(task) && "opacity-50")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isTaskDone(task) ? "bg-sage-400" : "bg-slate-300")} />
                        <span className={cn("text-xs text-slate-700", isTaskDone(task) && "line-through text-slate-400")}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month View
// ---------------------------------------------------------------------------

const MONTH_DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MonthView({ date, onDaySelect }: { date: Date; onDaySelect: (d: Date) => void }) {
  const { tasks, appointments } = useAppStore();
  const cells = getMonthGrid(date);
  const todayKey = getTodayKey();

  return (
    <div className="py-1 pb-6">
      <div className="grid grid-cols-7 mb-2">
        {MONTH_DAY_HEADERS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-[9px] font-bold uppercase tracking-wider pb-1",
              i >= 5 ? "text-[#C4909A]" : "text-slate-500"
            )}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const colIndex = i % 7;
          const isWeekend = colIndex >= 5;
          if (!cell) return <div key={`empty-${i}`} className={cn("h-10 rounded-lg", isWeekend && "bg-[#f0e8e5]/40")} />;
          const key = dateKey(cell);
          const dayTaskCount = tasks.filter(
            (t) => taskMatchesView(t, "month") && t.dueDate === key && !isTaskDone(t)
          ).length;
          const dayAppts = appointments.filter(
            (a) => a.date === key && (!a.showOn || a.showOn.includes("month"))
          );
          const hasContent = dayAppts.length > 0 || dayTaskCount > 0;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              onClick={() => onDaySelect(cell)}
              className={cn(
                "h-10 flex flex-col items-center justify-center rounded-lg text-sm font-semibold transition-all",
                isToday
                  ? "bg-sage-600 text-white shadow-sm"
                  : isWeekend
                  ? "bg-[#f0e8e5]/50 text-[#8f6559] hover:bg-[#ede0db]/70"
                  : "text-slate-700 hover:bg-white/70"
              )}
            >
              <span>{cell.getDate()}</span>
              {hasContent && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayAppts.slice(0, 2).map((a) => (
                    <span
                      key={a.id}
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: isToday ? "rgba(255,255,255,0.9)" : (a.color ?? DEFAULT_APPT_COLOR) }}
                    />
                  ))}
                  {dayTaskCount > 0 && (
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isToday ? "bg-white/80" : "bg-slate-400")} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weekly / Monthly focus list
// ---------------------------------------------------------------------------

function FocusList({
  weekKey,
  monthKey,
}: { weekKey?: string; monthKey?: string }) {
  const {
    weeklyFocus, addWeeklyFocusItem, toggleWeeklyFocusItem, deleteWeeklyFocusItem,
    monthlyGoals, addMonthlyGoalItem, toggleMonthlyGoalItem, deleteMonthlyGoalItem,
  } = useAppStore();
  const [input, setInput] = useState("");

  const key = weekKey ?? monthKey ?? "";
  const isWeekly = !!weekKey;
  const items = isWeekly ? (weeklyFocus[key] ?? []) : (monthlyGoals[key] ?? []);
  const addItem = isWeekly ? addWeeklyFocusItem : addMonthlyGoalItem;
  const toggleItem = isWeekly ? toggleWeeklyFocusItem : toggleMonthlyGoalItem;
  const deleteItem = isWeekly ? deleteWeeklyFocusItem : deleteMonthlyGoalItem;

  const handleAdd = () => {
    const t = input.trim();
    if (!t) return;
    addItem(key, t);
    setInput("");
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-slate-400 italic">Nothing added yet.</p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 group">
          <button
            onClick={() => toggleItem(key, item.id)}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              item.done ? "bg-sage-500 border-sage-500" : "border-slate-500 hover:border-sage-500"
            )}
          >
            {item.done && <Check size={10} className="text-white" />}
          </button>
          <span className={cn("text-sm flex-1", item.done ? "line-through text-slate-400" : "text-slate-700")}>
            {item.text}
          </span>
          <button onClick={() => deleteItem(key, item.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={isWeekly ? "Add a weekly focus..." : "Add a monthly goal..."}
          className="flex-1 text-sm bg-white/40 rounded-xl px-3 py-2 outline-none placeholder:text-sage-700/60 text-slate-700 focus:bg-white/60 transition-colors font-medium"
        />
        <button onClick={handleAdd} className="text-sage-600 hover:text-sage-800 transition-colors">
          <Plus size={16} />
        </button>
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
  tint,
  headerTint,
  card,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  visible?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
  tint?: string;
  headerTint?: string;
  card?: boolean;
}) {
  return (
    <div className="pt-5 pb-1">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-[family-name:var(--font-fraunces)] italic text-sm text-slate-500">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 transition-all"
            aria-label={`Hide ${title}`}
          >
            <EyeOff size={15} />
          </button>
        </div>
      </div>
      {card ? (
        <div className="bg-white/60 rounded-2xl px-3 py-2 shadow-sm">
          {children}
        </div>
      ) : children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule section
// ---------------------------------------------------------------------------

const REMINDER_OPTIONS = [
  { label: "No reminder", value: undefined as number | undefined },
  { label: "At time", value: 0 },
  { label: "5 min before", value: 5 },
  { label: "10 min before", value: 10 },
  { label: "15 min before", value: 15 },
  { label: "30 min before", value: 30 },
  { label: "1 hour before", value: 60 },
];

function requestNotificationPermission() {
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function scheduleNotification(title: string, fireAt: Date) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const msUntil = fireAt.getTime() - Date.now();
  if (msUntil < 0) return;
  setTimeout(() => {
    new Notification("NeuroCompass Reminder", { body: title, icon: "/icon-192.png" });
  }, msUntil);
}

function ScheduleSection({ selectedDate }: { selectedDate: Date }) {
  const { appointments, addAppointment, deleteAppointment, updateAppointment } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [showOn, setShowOn] = useState<("day" | "week" | "month")[]>(["day", "week", "month"]);
  const [reminderMins, setReminderMins] = useState<number | undefined>(undefined);
  const [color, setColor] = useState(DEFAULT_APPT_COLOR);

  // Lock body scroll when any overlay is open
  useEffect(() => {
    if (showForm) {
      const y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, y);
      };
    }
  }, [showForm]);

  const selectedKey = dateKey(selectedDate);
  const dayAppointments = appointments.filter((a) => a.date === selectedKey);

  const toggleShowOn = (view: "day" | "week" | "month") => {
    setShowOn((prev) =>
      prev.includes(view) ? prev.filter((v) => v !== view) : [...prev, view]
    );
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    addAppointment({
      date: selectedKey,
      startTime: allDay ? "" : startTime,
      endTime: allDay ? undefined : (endTime || undefined),
      allDay: allDay || undefined,
      title: title.trim(),
      notes: notes.trim() || undefined,
      showOn,
      reminderMinsBefore: allDay ? undefined : reminderMins,
      color,
    });
    if (!allDay && reminderMins !== undefined) {
      requestNotificationPermission();
      const [h, m] = startTime.split(":").map(Number);
      const fireAt = new Date(selectedDate);
      fireAt.setHours(h, m - reminderMins, 0, 0);
      scheduleNotification(title.trim(), fireAt);
    }
    setTitle("");
    setNotes("");
    setAllDay(false);
    setStartTime("09:00");
    setEndTime("10:00");
    setShowOn(["day", "week", "month"]);
    setReminderMins(undefined);
    setColor(DEFAULT_APPT_COLOR);
    setShowForm(false);
  };

  // Split into all-day and timed, sort timed by start time
  const allDayAppts = dayAppointments.filter((a) => a.allDay || !a.startTime);
  const timedAppts = dayAppointments
    .filter((a) => !a.allDay && a.startTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const PX_PER_HOUR = 40; // px per hour — compact
  const MIN_BLOCK = 32; // enough for one readable line
  const gridRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressGhost, setPressGhost] = useState<number | null>(null); // minutes from midnight

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTimeStr = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleGridTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (showForm) return;
    const touch = e.touches[0];
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    // getBoundingClientRect() is already viewport-relative (scroll-adjusted)
    // so we do NOT add scrollTop — that would double-count it
    const relY = touch.clientY - rect.top;
    const rawMins = gridStartHour * 60 + (relY / PX_PER_HOUR) * 60;
    const snapped = Math.round(rawMins / 30) * 30;
    const clamped = Math.max(0, Math.min(23 * 60 + 30, snapped));
    longPressTimer.current = setTimeout(() => {
      const endMins = Math.min(24 * 60, clamped + 60);
      setStartTime(minutesToTimeStr(clamped));
      setEndTime(minutesToTimeStr(endMins));
      setShowForm(true);
      setPressGhost(null);
    }, 500);
    setPressGhost(clamped);
  };

  const handleGridTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setPressGhost(null);
  };

  // Time grid range — start at exact hour of first appt, end 30min after last
  const gridStartHour = timedAppts.length
    ? Math.max(0, Math.floor(toMinutes(timedAppts[0].startTime) / 60))
    : 8;
  const lastAppt = timedAppts[timedAppts.length - 1];
  const gridEndHour = timedAppts.length
    ? Math.min(24, Math.ceil((lastAppt.endTime ? toMinutes(lastAppt.endTime) : toMinutes(lastAppt.startTime) + 60) / 60))
    : 20;
  const gridHeight = (gridEndHour - gridStartHour) * PX_PER_HOUR;
  const hourLabels = Array.from({ length: gridEndHour - gridStartHour + 1 }, (_, i) => gridStartHour + i);

  return (
    <div className="space-y-2">
      {dayAppointments.length === 0 && !showForm && (
        <p className="text-sm text-slate-500 italic">No appointments yet for today.</p>
      )}

      {/* All-day events */}
      {allDayAppts.map((appt) => (
        <AppointmentRow
          key={appt.id}
          appt={appt}
          onDelete={() => deleteAppointment(appt.id)}
          onUpdate={(updates) => updateAppointment(appt.id, updates)}
        />
      ))}

      {/* Time grid */}
      {timedAppts.length > 0 && (
        <div className="overflow-y-auto max-h-[240px] overflow-x-visible rounded-xl" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <div
          ref={gridRef}
          className="relative overflow-visible select-none"
          style={{ height: gridHeight }}
          onTouchStart={handleGridTouchStart}
          onTouchEnd={handleGridTouchEnd}
          onTouchMove={handleGridTouchEnd}
        >
          {/* Hour lines */}
          {hourLabels.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-center gap-2 pointer-events-none"
              style={{ top: (hour - gridStartHour) * PX_PER_HOUR }}
            >
              <span className="text-[9px] font-semibold w-9 text-right shrink-0 leading-none" style={{ color: "#4a7c59" }}>
                {`${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`}
              </span>
              <div className="flex-1 border-t" style={{ borderColor: "rgba(74,124,89,0.25)" }} />
            </div>
          ))}

          {/* Half-hour lines */}
          {hourLabels.slice(0, -1).map((hour) => (
            <div
              key={`h${hour}`}
              className="absolute pointer-events-none border-t"
              style={{ top: (hour - gridStartHour) * PX_PER_HOUR + PX_PER_HOUR / 2, left: 44, right: 0, borderColor: "rgba(74,124,89,0.1)" }}
            />
          ))}

          {/* Long-press ghost indicator */}
          {pressGhost !== null && (
            <div
              className="absolute left-11 right-0 h-7 rounded-lg pointer-events-none z-20 flex items-center px-2"
              style={{
                top: (pressGhost - gridStartHour * 60) / 60 * PX_PER_HOUR,
                background: "rgba(74,124,89,0.15)",
                border: "1.5px dashed rgba(74,124,89,0.5)",
              }}
            >
              <span className="text-[10px] font-semibold" style={{ color: "#4a7c59" }}>
                {minutesToTimeStr(pressGhost)}
              </span>
            </div>
          )}

          {/* Current time indicator */}
          {(() => {
            const now = new Date();
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const gridStartMins = gridStartHour * 60;
            const gridEndMins = gridEndHour * 60;
            if (nowMins < gridStartMins || nowMins > gridEndMins) return null;
            const top = (nowMins - gridStartMins) / 60 * PX_PER_HOUR;
            return (
              <div className="absolute z-20 pointer-events-none flex items-center" style={{ top, left: 36, right: 0 }}>
                <div className="w-2 h-2 rounded-full shrink-0 -ml-1" style={{ background: "#4a7c59" }} />
                <div className="flex-1 h-px" style={{ background: "#4a7c59", opacity: 0.7 }} />
              </div>
            );
          })()}

          {/* Appointments — absolutely positioned on grid */}
          {timedAppts.map((appt) => {
            const apptStart = toMinutes(appt.startTime);
            const durationMins = appt.endTime ? calcDurationMins(appt.startTime, appt.endTime) : 60;
            const top = (apptStart - gridStartHour * 60) / 60 * PX_PER_HOUR + 2;
            const height = Math.max(MIN_BLOCK, Math.round(durationMins / 60 * PX_PER_HOUR) - 4);
            return (
              <div
                key={appt.id}
                className="absolute z-10"
                style={{ top, height, left: 44, right: 0 }}
              >
                <AppointmentRow
                  appt={appt}
                  onDelete={() => deleteAppointment(appt.id)}
                  onUpdate={(updates) => updateAppointment(appt.id, updates)}
                  blockHeight={height}
                />
              </div>
            );
          })}
        </div>
        </div>
      )}

      {showForm && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 px-4 pb-6" onClick={() => setShowForm(false)}>
        <div className="bg-cream-50 border border-slate-200 rounded-2xl w-full max-w-lg max-h-[82vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-y-auto overscroll-contain p-4 space-y-3 flex-1">
          {/* Title */}
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Appointment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          {/* All day toggle */}
          <button
            type="button"
            onClick={() => setAllDay(!allDay)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all w-fit",
              allDay
                ? "border-sage-400 bg-sage-50 text-sage-700"
                : "border-transparent bg-slate-100 text-slate-500"
            )}
          >
            <div
              className={cn(
                "w-3 h-3 rounded border-2 flex items-center justify-center shrink-0",
                allDay ? "bg-sage-500 border-sage-500" : "border-slate-300"
              )}
            >
              {allDay && <Check size={7} className="text-white" strokeWidth={3} />}
            </div>
            All day
          </button>

          {/* Start / End time */}
          {!allDay && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Start time</label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setEndTime(addOneHour(e.target.value));
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">End time</label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          )}
          {!allDay && calcDuration(startTime, endTime) && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={11} />
              {calcDuration(startTime, endTime)}
            </p>
          )}
          {/* Notes */}
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {/* Reminder */}
          {!allDay && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Reminder</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              value={reminderMins === undefined ? "" : String(reminderMins)}
              onChange={(e) => setReminderMins(e.target.value === "" ? undefined : Number(e.target.value))}
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value === undefined ? "" : String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          )}
          {/* Show On */}
          <div>
            <p className="text-xs text-slate-400 mb-1.5">Show on</p>
            <div className="flex gap-2">
              {(["day", "week", "month"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleShowOn(v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all",
                    showOn.includes(v)
                      ? "border-sage-400 bg-sage-50 text-sage-700"
                      : "border-transparent bg-slate-100 text-slate-500"
                  )}
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded border-2 flex items-center justify-center shrink-0",
                      showOn.includes(v) ? "bg-sage-500 border-sage-500" : "border-slate-300"
                    )}
                  >
                    {showOn.includes(v) && <Check size={7} className="text-white" strokeWidth={3} />}
                  </div>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Colour */}
          <div>
            <p className="text-xs text-slate-400 mb-1.5">Colour</p>
            <div className="flex gap-2 flex-wrap">
              {APPT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  style={{ background: c.hex }}
                  className="w-7 h-7 rounded-full transition-all flex items-center justify-center"
                  title={c.label}
                >
                  {color === c.hex && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>
          {/* Sticky footer — always visible */}
          <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-slate-100 shrink-0">
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
        </div>
      , document.body)}
      {!showForm && (
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

function AppointmentRow({
  appt,
  onDelete,
  onUpdate,
  blockHeight,
}: {
  appt: Appointment;
  onDelete: () => void;
  onUpdate: (updates: Partial<Omit<Appointment, "id" | "createdAt">>) => void;
  blockHeight?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(appt.title);
  const [editAllDay, setEditAllDay] = useState(appt.allDay ?? false);
  const [editStartTime, setEditStartTime] = useState(appt.startTime);
  const [editEndTime, setEditEndTime] = useState(appt.endTime ?? "");
  const [editNotes, setEditNotes] = useState(appt.notes ?? "");
  const [editShowOn, setEditShowOn] = useState<("day" | "week" | "month")[]>(
    appt.showOn ?? ["day", "week", "month"]
  );
  const [editReminderMins, setEditReminderMins] = useState<number | undefined>(appt.reminderMinsBefore);
  const [editColor, setEditColor] = useState(appt.color ?? DEFAULT_APPT_COLOR);

  // Lock body scroll when edit overlay is open
  useEffect(() => {
    if (showEdit) {
      const y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, y);
      };
    }
  }, [showEdit]);

  const toggleEditShowOn = (view: "day" | "week" | "month") => {
    setEditShowOn((prev) =>
      prev.includes(view) ? prev.filter((v) => v !== view) : [...prev, view]
    );
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate({
      title: editTitle.trim(),
      allDay: editAllDay || undefined,
      startTime: editAllDay ? "" : editStartTime,
      endTime: editAllDay ? undefined : (editEndTime || undefined),
      color: editColor,
      notes: editNotes.trim() || undefined,
      showOn: editShowOn,
      reminderMinsBefore: editAllDay ? undefined : editReminderMins,
    });
    if (editReminderMins !== undefined) {
      requestNotificationPermission();
      const [h, m] = editStartTime.split(":").map(Number);
      const fireAt = new Date(appt.date + "T00:00:00");
      fireAt.setHours(h, m - editReminderMins, 0, 0);
      scheduleNotification(editTitle.trim(), fireAt);
    }
    setShowEdit(false);
    setExpanded(false);
  };

  const openEdit = () => {
    setEditTitle(appt.title);
    setEditAllDay(appt.allDay ?? false);
    setEditStartTime(appt.startTime);
    setEditEndTime(appt.endTime ?? "");
    setEditNotes(appt.notes ?? "");
    setEditShowOn(appt.showOn ?? ["day", "week", "month"]);
    setEditReminderMins(appt.reminderMinsBefore);
    setEditColor(appt.color ?? DEFAULT_APPT_COLOR);
    setShowEdit(true);
    setExpanded(false);
  };

  const timeLabel = appt.allDay
    ? "All day"
    : appt.endTime
    ? `${formatTimeStr(appt.startTime)} – ${formatTimeStr(appt.endTime)}`
    : appt.startTime ? formatTimeStr(appt.startTime) : "All day";

  const editOverlay = showEdit && createPortal(
      <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/30 px-4 pb-6" onClick={() => setShowEdit(false)}>
      <div className="bg-cream-50 border border-slate-200 rounded-2xl w-full max-w-lg max-h-[82vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="overflow-y-auto overscroll-contain p-4 space-y-3 flex-1">
        <input
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="Appointment title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        {/* All day toggle */}
        <button
          type="button"
          onClick={() => setEditAllDay(!editAllDay)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all w-fit",
            editAllDay
              ? "border-sage-400 bg-sage-50 text-sage-700"
              : "border-transparent bg-slate-100 text-slate-500"
          )}
        >
          <div
            className={cn(
              "w-3 h-3 rounded border-2 flex items-center justify-center shrink-0",
              editAllDay ? "bg-sage-500 border-sage-500" : "border-slate-300"
            )}
          >
            {editAllDay && <Check size={7} className="text-white" strokeWidth={3} />}
          </div>
          All day
        </button>

        {!editAllDay && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Start time</label>
            <input
              type="time"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
              value={editStartTime}
              onChange={(e) => {
                setEditStartTime(e.target.value);
                setEditEndTime(addOneHour(e.target.value));
              }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">End time</label>
            <input
              type="time"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </div>
        </div>
        )}
        {!editAllDay && calcDuration(editStartTime, editEndTime) && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={11} />
            {calcDuration(editStartTime, editEndTime)}
          </p>
        )}
        <input
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="Notes (optional)"
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
        />
        {!editAllDay && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">Reminder</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
            value={editReminderMins === undefined ? "" : String(editReminderMins)}
            onChange={(e) => setEditReminderMins(e.target.value === "" ? undefined : Number(e.target.value))}
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={opt.value === undefined ? "" : String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        )}
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Show on</p>
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => toggleEditShowOn(v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all",
                  editShowOn.includes(v)
                    ? "border-sage-400 bg-sage-50 text-sage-700"
                    : "border-transparent bg-slate-100 text-slate-500"
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded border-2 flex items-center justify-center shrink-0",
                    editShowOn.includes(v) ? "bg-sage-500 border-sage-500" : "border-slate-300"
                  )}
                >
                  {editShowOn.includes(v) && <Check size={7} className="text-white" strokeWidth={3} />}
                </div>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Colour */}
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Colour</p>
          <div className="flex gap-2 flex-wrap">
            {APPT_COLOR_OPTIONS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setEditColor(c.hex)}
                style={{ background: c.hex }}
                className="w-7 h-7 rounded-full transition-all flex items-center justify-center"
                title={c.label}
              >
                {editColor === c.hex && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

      </div>
        {/* Sticky footer — always visible */}
        <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-slate-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={!editTitle.trim()}
            className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl py-2.5 transition-all"
          >
            Save
          </button>
          <button
            onClick={() => setShowEdit(false)}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
      </div>
  , document.body);

  const cardColor = appt.color ?? DEFAULT_APPT_COLOR;
  const colorOpt = APPT_COLOR_OPTIONS.find((c) => c.hex === cardColor) ?? APPT_COLOR_OPTIONS[0];
  const minH = blockHeight ?? 52;

  return (
    <>
    {editOverlay}
    <div
      className="rounded-xl overflow-hidden flex items-stretch"
      style={{ minHeight: minH, background: colorOpt.bg }}
    >
      {/* Left accent bar */}
      <div className="w-1 shrink-0" style={{ background: cardColor }} />

      {/* Content */}
      <div className={cn("flex-1 flex flex-col justify-center", blockHeight && blockHeight < 40 ? "px-2 py-1" : "px-3 py-2.5")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-none truncate">{appt.title}</p>
            {(!blockHeight || blockHeight >= 40) && (
              <p className="text-xs mt-0.5 font-medium leading-none" style={{ color: cardColor }}>{timeLabel}</p>
            )}
            {appt.notes && expanded && (
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{appt.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
            {appt.notes && (
              <button onClick={() => setExpanded(!expanded)} className="p-1 text-slate-500 hover:text-slate-700">
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
            <button onClick={openEdit} className="p-1 text-slate-600 hover:text-sage-700 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} className="p-1 text-slate-600 hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Top 3 Priorities section
// ---------------------------------------------------------------------------

function Top3Section({ date }: { date: string }) {
  const { topPrioritiesByDate, updateTopPriority } = useAppStore();
  const priorities = topPrioritiesByDate[date] ?? defaultTopPriorities;

  return (
    <div className="space-y-2">
      {priorities.map((priority, idx) => (
        <Top3Item
          key={priority.id}
          priority={priority}
          label={TOP3_LABELS[idx]}
          index={idx}
          onUpdate={(updates) => updateTopPriority(date, priority.id, updates)}
        />
      ))}
    </div>
  );
}

const TOP3_XP = [20, 15, 10];

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
  const { addXP, addCoins } = useAppStore();
  const [toast, setToast] = useState<string | null>(null);
  const [editingReward, setEditingReward] = useState(false);
  const [draftAmt, setDraftAmt] = useState<string>("");
  const accentColors = ["border-l-sage-500", "border-l-[#B8897A]", "border-l-[#C4909A]"];
  const accentBgColors = ["bg-sage-500", "bg-[#B8897A]", "bg-[#C4909A]"];
  const rewardAmt = priority.rewardAmount ?? TOP3_XP[index];
  const rewardType = priority.rewardType ?? "xp";

  const handleToggle = () => {
    if (!priority.completed) {
      if (rewardType === "coins") addCoins(rewardAmt);
      else addXP(rewardAmt);
      setToast(`+${rewardAmt} ${rewardType === "coins" ? "Coins" : "XP"}`);
      setTimeout(() => setToast(null), 1500);
    }
    onUpdate({ completed: !priority.completed });
  };

  const openRewardEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftAmt(String(rewardAmt));
    setEditingReward(true);
  };

  const saveReward = () => {
    const n = parseInt(draftAmt);
    if (!isNaN(n) && n > 0) onUpdate({ rewardAmount: n });
    setEditingReward(false);
  };

  return (
    <div className={cn("py-3 relative", priority.completed && "opacity-50")}>
      {toast && (
        <div className="absolute -top-7 left-10 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 animate-fade-in-up whitespace-nowrap">
          {toast}
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("w-1 h-8 rounded-full shrink-0", accentBgColors[index])} />
        <button
          onClick={handleToggle}
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
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          />
        </div>

        {!priority.completed && priority.text && (
          <button
            onClick={openRewardEdit}
            className="text-[10px] text-[#B8A96A] font-semibold flex items-center gap-0.5 shrink-0 hover:opacity-70 transition-opacity"
          >
            <Star size={9} fill="currentColor" />
            {rewardAmt} {rewardType === "coins" ? "Coins" : "XP"}
            <Pencil size={7} className="ml-0.5 opacity-50" />
          </button>
        )}
      </div>

      {/* Editable reward row */}
      {editingReward && (
        <div className="flex items-center gap-2 mt-2 pl-8">
          <input
            type="number"
            min={1}
            className="w-16 bg-white/70 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 text-center focus:outline-none focus:border-sage-400"
            value={draftAmt}
            onChange={(e) => setDraftAmt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveReward(); if (e.key === "Escape") setEditingReward(false); }}
            autoFocus
          />
          <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-semibold">
            <button
              className={cn("px-2 py-1 transition-colors", rewardType === "xp" ? "bg-[#B8A96A] text-white" : "bg-white/70 text-slate-500")}
              onClick={() => onUpdate({ rewardType: "xp" })}
            >XP</button>
            <button
              className={cn("px-2 py-1 transition-colors", rewardType === "coins" ? "bg-[#B8A96A] text-white" : "bg-white/70 text-slate-500")}
              onClick={() => onUpdate({ rewardType: "coins" })}
            >Coins</button>
          </div>
          <button onClick={saveReward} className="text-sage-600">
            <Check size={14} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Habits section
// ---------------------------------------------------------------------------

function HabitsSection({ selectedDate }: { selectedDate: Date }) {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitToday } = useAppStore();
  const [showInput, setShowInput] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const today = dateKey(selectedDate);

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    addHabit(newHabitName.trim());
    setNewHabitName("");
    setShowInput(false);
  };

  return (
    <div>
      {habits.length === 0 && !showInput && (
        <p className="text-sm text-slate-400 italic">Add habits to track each day.</p>
      )}

      {habits.map((habit, idx) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          today={today}
          index={idx}
          onToggle={() => toggleHabitToday(habit.id, today)}
          onUpdate={(name) => updateHabit(habit.id, name)}
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

const HABIT_ACCENT_COLORS = ["#6B8F71", "#C4909A", "#C9A96E", "#8B9BB4", "#A89B8C", "#7BA7A0", "#D4A27A"];

function HabitRow({
  habit,
  today,
  index,
  onToggle,
  onUpdate,
  onDelete,
}: {
  habit: Habit;
  today: string;
  index: number;
  onToggle: () => void;
  onUpdate: (name: string) => void;
  onDelete: () => void;
}) {
  const { addXP } = useAppStore();
  const doneToday = habit.completedDates.includes(today);
  const [xpToast, setXpToast] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    onToggle();
    if (!doneToday) {
      addXP(5);
      if (toastRef.current) clearTimeout(toastRef.current);
      setXpToast(true);
      toastRef.current = setTimeout(() => setXpToast(false), 1500);
    }
  };

  const startEdit = () => {
    setEditName(habit.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (editName.trim()) onUpdate(editName.trim());
    setEditing(false);
  };

  useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  const accentColor = HABIT_ACCENT_COLORS[index % HABIT_ACCENT_COLORS.length];

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

  // Last 7 days for the dot tracker
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  return (
    <div className={cn("py-1 relative flex items-start gap-2", doneToday && "opacity-70")}>
      {xpToast && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 animate-fade-in-up whitespace-nowrap">
          +5 XP
        </div>
      )}

      {/* Left accent bar */}
      <div className="w-0.5 self-stretch rounded-full shrink-0 mt-0.5" style={{ background: accentColor, opacity: doneToday ? 1 : 0.5 }} />

      <div className="flex-1">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
            doneToday ? "bg-emerald-500 border-emerald-500" : "border-slate-500 hover:border-emerald-500"
          )}
        >
          {doneToday && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        {editing ? (
          <input
            ref={inputRef}
            className="flex-1 bg-white border border-sage-300 rounded-lg px-2 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <p className={cn("flex-1 text-sm font-medium text-slate-800", doneToday && "line-through text-slate-400")}>
            {habit.name}
          </p>
        )}

        {!editing && streak > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-[#B8897A]">
            <Flame size={12} fill="currentColor" />
            {streak}
          </span>
        )}

        {!editing && (
          <button onClick={startEdit} className="p-1 text-slate-600 hover:text-sage-700 transition-colors">
            <Pencil size={13} />
          </button>
        )}

        {!editing && (
          <button onClick={onDelete} className="p-1 text-slate-600 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* 7-day dot tracker */}
      {!editing && (
        <div className="flex gap-1 mt-1 ml-8">
          {last7.map((dayKey, i) => {
            const done = habit.completedDates.includes(dayKey);
            const isToday = dayKey === today;
            return (
              <div
                key={i}
                className="w-5 h-2 rounded-sm transition-all"
                style={{
                  background: done ? accentColor : isToday ? "#cbd5e1" : "#e2e8f0",
                  opacity: done ? 1 : isToday ? 1 : 0.5 + (i * 0.07),
                  outline: isToday && !done ? `1.5px solid ${accentColor}55` : undefined,
                }}
              />
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meal Plan Section
// ---------------------------------------------------------------------------

const DEFAULT_MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MEAL_PRESETS: Record<string, string[]> = {
  Breakfast: ["Oatmeal", "Toast & eggs", "Yogurt & fruit", "Cereal", "Smoothie", "Pancakes", "Avocado toast", "Granola"],
  Lunch: ["Sandwich", "Salad", "Soup", "Leftovers", "Wrap", "Pasta", "Rice bowl", "Sushi"],
  Dinner: ["Pasta", "Stir fry", "Chicken & veg", "Pizza", "Tacos", "Soup", "Rice & beans", "Roast veg"],
  Snack: ["Fruit", "Crackers & cheese", "Nuts", "Yogurt", "Hummus & veg", "Granola bar", "Chocolate", "Popcorn"],
};

function getMealCategory(slot: string) {
  if (slot.toLowerCase().startsWith("snack")) return "Snack";
  return slot;
}

function MealPlanSection({ selectedDate }: { selectedDate: Date }) {
  const dk = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const [plan, setPlan] = useState<Record<string, string>>({});
  const [extraSlots, setExtraSlots] = useState<string[]>([]);
  const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({});
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [addingOption, setAddingOption] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nd-meal-plan-v2");
      setPlan(raw ? (JSON.parse(raw)[dk] ?? {}) : {});
      const extRaw = localStorage.getItem("nd-meal-extra-slots");
      if (extRaw) setExtraSlots(JSON.parse(extRaw));
      const optRaw = localStorage.getItem("nd-meal-options");
      if (optRaw) setCustomOptions(JSON.parse(optRaw));
    } catch { /* ignore */ }
  }, [dk]);

  const persistPlan = (next: Record<string, string>) => {
    setPlan(next);
    try {
      const raw = localStorage.getItem("nd-meal-plan-v2");
      const all = raw ? JSON.parse(raw) : {};
      all[dk] = next;
      localStorage.setItem("nd-meal-plan-v2", JSON.stringify(all));
    } catch { /* ignore */ }
  };

  const handleSelectMeal = (slot: string, meal: string) => {
    persistPlan({ ...plan, [slot]: meal });
    setEditingSlot(null);
    setAddingOption(false);
    setCustomInput("");
    setSaveForFuture(false);
  };

  const handleClearMeal = (slot: string) => {
    const next = { ...plan };
    delete next[slot];
    persistPlan(next);
  };

  const handleAddCustom = (slot: string) => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (saveForFuture) {
      const cat = getMealCategory(slot);
      const updated = { ...customOptions, [cat]: [...(customOptions[cat] ?? []), trimmed] };
      setCustomOptions(updated);
      localStorage.setItem("nd-meal-options", JSON.stringify(updated));
    }
    handleSelectMeal(slot, trimmed);
  };

  const addExtraSnack = () => {
    const next = [...extraSlots, `Snack ${extraSlots.length + 2}`];
    setExtraSlots(next);
    localStorage.setItem("nd-meal-extra-slots", JSON.stringify(next));
  };

  const removeExtraSlot = (slot: string) => {
    const next = extraSlots.filter((s) => s !== slot);
    setExtraSlots(next);
    localStorage.setItem("nd-meal-extra-slots", JSON.stringify(next));
    handleClearMeal(slot);
  };

  const allSlots = [...DEFAULT_MEAL_SLOTS, ...extraSlots];

  return (
    <div className="space-y-2">
      {allSlots.map((slot) => {
        const cat = getMealCategory(slot);
        const presets = MEAL_PRESETS[cat] ?? MEAL_PRESETS.Snack;
        const customs = customOptions[cat] ?? [];
        const allOptions = [...presets, ...customs];
        const isEditing = editingSlot === slot;
        const current = plan[slot];
        const isExtra = extraSlots.includes(slot);

        return (
          <div key={slot} className="bg-white/60 rounded-2xl shadow-sm">
            {/* Slot row */}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest w-20 shrink-0">{slot}</p>
              <span className={cn("flex-1 text-sm", current ? "font-medium text-slate-700" : "text-slate-500")}>
                {current ?? "Tap + to plan"}
              </span>
              {current && (
                <button type="button" onClick={() => handleClearMeal(slot)} className="text-slate-500 hover:text-rose-500 transition-colors p-1">
                  <X size={12} />
                </button>
              )}
              {isExtra && !current && (
                <button type="button" onClick={() => removeExtraSlot(slot)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <X size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => { setEditingSlot(isEditing ? null : slot); setAddingOption(false); setCustomInput(""); setSaveForFuture(false); }}
                className="text-slate-600 hover:text-sage-700 transition-colors p-1"
              >
                {isEditing ? <ChevronUp size={14} /> : <Plus size={14} />}
              </button>
            </div>

            {/* Picker */}
            {isEditing && (
              <div className="border-t border-slate-200/60 px-3 pb-3 pt-2 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {allOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectMeal(slot, opt)}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded-full border transition-all",
                        current === opt
                          ? "bg-sage-500 text-white border-sage-500"
                          : "bg-white border-slate-200 text-slate-600 hover:border-sage-300"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {addingOption ? (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        autoFocus
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:border-sage-400"
                        placeholder="Type a meal name..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddCustom(slot);
                          if (e.key === "Escape") { setAddingOption(false); setCustomInput(""); setSaveForFuture(false); }
                        }}
                      />
                      <button type="button" onClick={() => handleAddCustom(slot)} className="bg-sage-500 text-white text-xs px-3 py-1.5 rounded-xl font-semibold shrink-0">
                        Select
                      </button>
                      <button type="button" onClick={() => { setAddingOption(false); setCustomInput(""); setSaveForFuture(false); }} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer w-fit">
                      <input type="checkbox" checked={saveForFuture} onChange={(e) => setSaveForFuture(e.target.checked)} className="w-3.5 h-3.5 accent-sage-500" />
                      <span className="text-[10px] text-slate-400">Save to my options for next time</span>
                    </label>
                  </div>
                ) : (
                  <button type="button" onClick={() => setAddingOption(true)} className="flex items-center gap-1 text-xs text-sage-600 font-medium hover:text-sage-700 transition-colors">
                    <Plus size={11} /> Add custom meal
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" onClick={addExtraSnack} className="flex items-center gap-1.5 text-xs text-sage-600 font-medium hover:text-sage-700 transition-colors pt-0.5">
        <Plus size={11} /> Add another snack
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Schedule Item Modal
// ---------------------------------------------------------------------------

type ScheduleItemType = "appointment" | "activity" | "time-block";

const scheduleTypeConfig: Record<ScheduleItemType, { label: string; color: string }> = {
  appointment: { label: "Appointment", color: "bg-blue-100 text-blue-700" },
  activity:    { label: "Activity",    color: "bg-sage-100 text-sage-700" },
  "time-block":{ label: "Time Block",  color: "bg-violet-100 text-violet-700" },
};

const APPT_COLOR_OPTIONS = [
  { hex: "#5e8272", bg: "#d6e5d8", label: "Sage" },
  { hex: "#4d7a80", bg: "#cde4e6", label: "Teal" },
  { hex: "#7a8fb8", bg: "#dce3f5", label: "Slate Blue" },
  { hex: "#9B8EC4", bg: "#e8e4f5", label: "Lavender" },
  { hex: "#C4929A", bg: "#f5e4e6", label: "Dusty Rose" },
  { hex: "#B8897A", bg: "#f0ddd8", label: "Terracotta" },
  { hex: "#B8A96A", bg: "#f0ead4", label: "Gold" },
  { hex: "#8a9e7a", bg: "#dce8d4", label: "Moss" },
];
const DEFAULT_APPT_COLOR = APPT_COLOR_OPTIONS[0].hex;

function AddScheduleModal({
  onClose,
  selectedDate,
}: {
  onClose: () => void;
  selectedDate: Date;
}) {
  const { addAppointment } = useAppStore();
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<ScheduleItemType>("appointment");
  const [date, setDate] = useState(dateKey(selectedDate));
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [showOn, setShowOn] = useState<("day" | "week" | "month")[]>(["day", "week", "month"]);
  const [reminderMins, setReminderMins] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(DEFAULT_APPT_COLOR);

  const toggleShowOn = (view: "day" | "week" | "month") => {
    setShowOn((prev) =>
      prev.includes(view) ? prev.filter((v) => v !== view) : [...prev, view]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !date) return;
    const selectedKey = date;
    addAppointment({
      date: selectedKey,
      type: itemType,
      allDay: allDay || undefined,
      startTime: allDay ? "" : startTime,
      endTime: allDay ? undefined : (endTime || undefined),
      color,
      title: title.trim(),
      notes: notes.trim() || undefined,
      showOn,
      reminderMinsBefore: allDay ? undefined : reminderMins,
    });
    if (!allDay && reminderMins !== undefined) {
      requestNotificationPermission();
      const [h, m] = startTime.split(":").map(Number);
      const fireAt = new Date(date + "T00:00:00");
      fireAt.setHours(h, m - reminderMins, 0, 0);
      scheduleNotification(title.trim(), fireAt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-0">
      <div className="bg-cream-50 rounded-t-3xl w-full max-w-lg p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Add to Schedule</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Title */}
        <input
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {/* Date */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Date</p>
          <input
            type="date"
            className="w-full min-h-[44px] border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Type</p>
          <div className="flex gap-2">
            {(Object.keys(scheduleTypeConfig) as ScheduleItemType[]).map((t) => (
              <button
                key={t}
                onClick={() => setItemType(t)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  itemType === t
                    ? "border-sage-500 " + scheduleTypeConfig[t].color
                    : "border-transparent bg-slate-50 text-slate-500"
                )}
              >
                {scheduleTypeConfig[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* All day toggle */}
        <button
          type="button"
          onClick={() => setAllDay(!allDay)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all w-fit",
            allDay
              ? "border-sage-400 bg-sage-50 text-sage-700"
              : "border-transparent bg-slate-100 text-slate-500"
          )}
        >
          <div
            className={cn(
              "w-3 h-3 rounded border-2 flex items-center justify-center shrink-0",
              allDay ? "bg-sage-500 border-sage-500" : "border-slate-300"
            )}
          >
            {allDay && <Check size={7} className="text-white" strokeWidth={3} />}
          </div>
          All day
        </button>

        {/* Time */}
        {!allDay && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Start</label>
                <input
                  type="time"
                  className="w-full min-h-[44px] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setEndTime(addOneHour(e.target.value));
                  }}
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

        {/* Reminder */}
        {!allDay && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Reminder</p>
            <select
              className="w-full min-h-[44px] border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-white"
              value={reminderMins === undefined ? "" : String(reminderMins)}
              onChange={(e) => setReminderMins(e.target.value === "" ? undefined : Number(e.target.value))}
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value === undefined ? "" : String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
          placeholder="Notes (optional)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

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

        {/* Colour */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Colour</p>
          <div className="flex gap-2 flex-wrap">
            {APPT_COLOR_OPTIONS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                style={{ background: c.hex }}
                className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                title={c.label}
              >
                {color === c.hex && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !date}
          className="w-full bg-sage-600 hover:bg-sage-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-2xl py-3 transition-all"
        >
          Add to Schedule
        </button>
      </div>
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
  const [duration, setDuration] = useState(taskToEdit?.duration ?? "");
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ?? "");
  const [isRecurring, setIsRecurring] = useState(taskToEdit?.isRecurring ?? false);
  const [recurType, setRecurType] = useState<RecurType>(taskToEdit?.recurType ?? "daily");
  const [category, setCategory] = useState(taskToEdit?.category ?? "Personal");
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>(taskToEdit?.timeEstimate);
  const [rewardType, setRewardType] = useState<RewardType>(taskToEdit?.rewardType ?? "xp");
  const [rewardAmount, setRewardAmount] = useState(taskToEdit?.xpReward ?? 10);
  const [showOn, setShowOn] = useState<("day" | "week" | "month")[]>(
    taskToEdit?.showOn ?? ["day", "week", "month"]
  );
  const [carryOver, setCarryOver] = useState(taskToEdit?.carryOver ?? false);

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
        type: "task",
        duration: duration.trim() || undefined,
        xpReward: rewardAmount,
        rewardType,
        dueDate: dueDate || undefined,
        isRecurring,
        recurType: isRecurring ? recurType : undefined,
        timeEstimate,
        category,
        showOn,
        carryOver: carryOver || undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        description,
        priority,
        type: "task",
        duration: duration.trim() || undefined,
        status: "todo",
        xpReward: rewardAmount,
        rewardType,
        dueDate: dueDate || undefined,
        isRecurring,
        recurType: isRecurring ? recurType : undefined,
        tags: [],
        timeEstimate,
        category,
        showOn,
        carryOver: carryOver || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center p-0">
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

        {/* Duration */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Duration</p>
          <input
            className="w-full min-h-[44px] border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g. 30 min, 1 hour"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

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

        {/* Carry over */}
        <div>
          <button
            onClick={() => setCarryOver(!carryOver)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
              carryOver
                ? "bg-[#dde4ec] text-[#4a607a] border-[#b8c8d8]"
                : "bg-slate-100 text-slate-600 border-transparent"
            )}
          >
            <Repeat size={15} />
            Carry over
          </button>
          {carryOver && (
            <p className="text-xs text-slate-400 mt-1.5 ml-1">
              This task will reappear on days after its due date.
            </p>
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
  const isDone = isTaskDone(task);
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
    <div className={cn("py-1 relative", isDone && "opacity-60")}>
      {toast && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 animate-fade-in-up whitespace-nowrap">
          {toast}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleComplete}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              isDone ? "bg-sage-500 border-sage-500" : "border-slate-300 hover:border-sage-400"
            )}
          >
            {isDone && <Check size={10} className="text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <p
              className={cn(
                "text-sm font-medium text-slate-800 leading-tight",
                isDone && "line-through text-slate-400"
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", cfg.color)}>
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
              {taskType === "task" && (task.rewardType === "coins" ? (
                <span className="text-xs text-[#B8A96A] font-medium flex items-center gap-0.5">
                  <Coins size={10} />
                  +{task.xpReward}
                </span>
              ) : (
                <span className="text-xs text-[#B8A96A] font-medium flex items-center gap-0.5">
                  <Star size={10} fill="currentColor" />
                  +{task.xpReward} XP
                </span>
              ))}
              {taskType === "task" && (
                <button
                  onClick={(e) => { e.stopPropagation(); updateTask(task.id, { carryOver: !task.carryOver }); }}
                  className={cn(
                    "flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-medium transition-all",
                    task.carryOver
                      ? "bg-[#dde4ec] text-[#4a607a]"
                      : "bg-slate-100 text-slate-400 hover:text-slate-600"
                  )}
                  title={task.carryOver ? "Carry over: on" : "Carry over: off"}
                >
                  <Repeat size={9} />
                  Carry over
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {task.description && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
            <button
              onClick={() => setShowEdit(true)}
              className="p-1 text-slate-600 hover:text-sage-700 transition-colors"
              aria-label="Edit activity"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 text-slate-600 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {expanded && task.description && (
          <p className="mt-1 text-xs text-slate-500 ml-7 leading-relaxed">{task.description}</p>
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
    if (filter === "done") return isTaskDone(t);
    if (!taskMatchesView(t, activeView)) return false;
    if (filter === "today") {
      if (isTaskDone(t)) return false;
      if (!t.dueDate) return true;                 // no due date: always show
      if (t.dueDate > selKey) return false;        // future task: hide
      if (t.dueDate === selKey) return true;       // today's task: show
      return t.carryOver === true;                 // past task: show only if carry-over
    }
    return !isTaskDone(t);
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

      <div>
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
  const { sectionVisibility, toggleSection, streak } = useAppStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="px-4 pt-0 pb-10">
      {/* Header */}
      <div className="pt-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
            <h1 className="text-3xl font-bold text-slate-800 leading-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
              {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{greeting}, let&apos;s plan your day</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-11 h-11 rounded-2xl bg-sage-600 flex items-center justify-center shadow-md hover:bg-sage-700 transition-all active:scale-95"
            >
              <Plus size={22} className="text-white" />
            </button>
            {mounted && streak > 0 && (
              <div className="flex items-center gap-1 bg-terracotta-100 text-terracotta-600 px-2.5 py-1 rounded-full">
                <Flame size={12} />
                <span className="text-xs font-bold">{streak} day{streak !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View toggle + date navigation */}
      <div className="space-y-1.5">
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
                  meal: "Meal Plan",
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
              card
            >
              <ScheduleSection selectedDate={selectedDate} />
            </Section>
          )}

          {/* Top 3 Priorities */}
          {(!mounted || sectionVisibility.top3) && (
            <Section
              id="top3"
              icon={<Target size={16} />}
              title="Top 3 Priorities"
              onToggle={() => toggleSection("top3")}
              card
            >
              <Top3Section date={dateKey(selectedDate)} />
            </Section>
          )}

          {/* Tasks */}
          {(!mounted || sectionVisibility.tasks) && (
            <Section
              id="tasks"
              icon={<ListTodo size={16} />}
              title="Tasks"
              onToggle={() => toggleSection("tasks")}
              card
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
              card
            >
              <HabitsSection selectedDate={selectedDate} />
            </Section>
          )}

          {/* Meal Plan */}
          {(!mounted || sectionVisibility.meal !== false) && (
            <Section
              id="meal"
              icon={<UtensilsCrossed size={16} />}
              title="Meal Plan"
              onToggle={() => toggleSection("meal")}
            >
              <MealPlanSection selectedDate={selectedDate} />
            </Section>
          )}
        </>
      )}

      {/* Week view */}
      {activeView === "week" && (() => {
        const todayWeekKey = getWeekKey(new Date());
        const isThisWeek = getWeekKey(selectedDate) === todayWeekKey;
        const weekLabel = isThisWeek ? "This Week" : formatDateLabel(selectedDate, "week");
        return (
          <div>
            <div className="pt-5 pb-1">
              <h2 className="font-[family-name:var(--font-fraunces)] italic text-sm text-slate-600 mb-3">{weekLabel}</h2>
              <div className="bg-white/60 rounded-2xl shadow-sm px-3 py-2">
                <WeekView date={selectedDate} onDayClick={handleDaySelect} />
              </div>
            </div>
            <div className="pt-6 pb-1">
              <h2 className="font-[family-name:var(--font-fraunces)] italic text-sm text-slate-600 mb-3">Weekly Focus</h2>
              <FocusList weekKey={getWeekKey(selectedDate)} />
            </div>
          </div>
        );
      })()}

      {/* Month view */}
      {activeView === "month" && (() => {
        const now = new Date();
        const isThisMonth = selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();
        const monthLabel = isThisMonth ? "This Month" : selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        return (
          <div>
            <div className="pt-5 pb-1">
              <h2 className="font-[family-name:var(--font-fraunces)] italic text-sm text-slate-600 mb-3">{monthLabel}</h2>
              <div className="bg-white/60 rounded-2xl shadow-sm px-2 py-3">
                <MonthView date={selectedDate} onDaySelect={handleDaySelect} />
              </div>
            </div>
            <div className="pt-6 pb-1">
              <h2 className="font-[family-name:var(--font-fraunces)] italic text-sm text-slate-600 mb-3">Monthly Intentions</h2>
              <FocusList monthKey={getMonthKey(selectedDate)} />
            </div>
          </div>
        );
      })()}

      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} />}
      {showScheduleModal && (
        <AddScheduleModal
          onClose={() => setShowScheduleModal(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
