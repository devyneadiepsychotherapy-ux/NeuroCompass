"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { generateId, getTodayKey } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Plus, X, Heart, CheckSquare, Calendar } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

type Quadrant = "do" | "schedule" | "delegate" | "eliminate";

interface MatrixTask {
  id: string;
  title: string;
  quadrant: Quadrant;
}

const QUADRANTS: { key: Quadrant; label: string; subtitle: string; emoji: string; color: string; cardColor: string; tagColor: string; description: string }[] = [
  {
    key: "do",
    label: "Do First",
    subtitle: "Urgent + Important",
    emoji: "🔴",
    color: "border-red-300 bg-red-50",
    cardColor: "bg-red-50 border-red-200",
    tagColor: "bg-red-100 text-red-700",
    description: "Crisis, deadlines, urgent problems. These need your attention NOW.",
  },
  {
    key: "schedule",
    label: "Schedule",
    subtitle: "Not Urgent + Important",
    emoji: "🟡",
    color: "border-stone-300 bg-stone-50",
    cardColor: "bg-stone-50 border-stone-200",
    tagColor: "bg-stone-100 text-stone-600",
    description: "Goals, planning, growth. These make your future easier. Block time for them.",
  },
  {
    key: "delegate",
    label: "Delegate",
    subtitle: "Urgent + Not Important",
    emoji: "🔵",
    color: "border-blue-300 bg-blue-50",
    cardColor: "bg-blue-50 border-blue-200",
    tagColor: "bg-blue-100 text-blue-700",
    description: "Interruptions, some emails. Can someone else handle this?",
  },
  {
    key: "eliminate",
    label: "Eliminate",
    subtitle: "Not Urgent + Not Important",
    emoji: "⚪",
    color: "border-slate-300 bg-slate-50",
    cardColor: "bg-slate-50 border-slate-200",
    tagColor: "bg-slate-100 text-slate-600",
    description: "Time wasters, trivial tasks. Drop these guilt-free.",
  },
];

export default function EisenhowerPage() {
  const { toggleFavorite, isFavorite, addTask: storeAddTask, addAppointment } = useAppStore();
  const favorite = isFavorite("eisenhower-matrix");
  const [tasks, setTasks] = useState<MatrixTask[]>([]);
  const [inputText, setInputText] = useState("");
  const [targetQuadrant, setTargetQuadrant] = useState<Quadrant>("do");
  const [showInput, setShowInput] = useState(false);
  const [addedToday, setAddedToday] = useState<Set<string>>(new Set());
  const [schedulePickerId, setSchedulePickerId] = useState<string | null>(null);
  const [scheduleDateInput, setScheduleDateInput] = useState("");
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());

  const addMatrixTask = () => {
    if (!inputText.trim()) return;
    setTasks(prev => [...prev, { id: generateId(), title: inputText.trim(), quadrant: targetQuadrant }]);
    setInputText("");
    setShowInput(false);
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const moveTask = (id: string, quadrant: Quadrant) => setTasks(prev => prev.map(t => t.id === id ? { ...t, quadrant } : t));

  const handleAddToToday = (task: MatrixTask) => {
    storeAddTask({ title: task.title, priority: "high", status: "todo", xpReward: 10, isRecurring: false, dueDate: getTodayKey(), tags: [] });
    setAddedToday(prev => new Set(prev).add(task.id));
  };

  const handleSchedule = (task: MatrixTask) => {
    if (!scheduleDateInput) return;
    addAppointment({ date: scheduleDateInput, startTime: "", title: task.title, type: "activity" });
    setScheduledIds(prev => new Set(prev).add(task.id));
    setSchedulePickerId(null);
    setScheduleDateInput("");
  };

  return (
    <div className="px-4 pt-12 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/tools" className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Eisenhower Matrix</h1>
          <p className="text-sm text-slate-500">Prioritize by urgency × importance</p>
        </div>
        <button onClick={() => toggleFavorite("eisenhower-matrix")} className="p-2 rounded-xl hover:bg-slate-100">
          <Heart size={20} className={favorite ? "text-rose-400 fill-rose-400" : "text-slate-400"} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-sage-50 to-stone-100 rounded-2xl p-4 border border-sage-100">
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>ND tip:</strong> Everything can feel urgent when you have ADHD. Use this matrix to reality-check, does this actually need to happen TODAY, or does it just feel that way?
        </p>
      </div>

      {/* Add task button */}
      <button
        onClick={() => setShowInput(!showInput)}
        className="w-full flex items-center gap-3 bg-cream-50 border border-slate-200 hover:border-sage-300 rounded-2xl p-4 transition-all"
      >
        <div className="w-9 h-9 rounded-xl bg-sage-600 flex items-center justify-center">
          <Plus size={18} className="text-white" />
        </div>
        <span className="font-medium text-slate-700">Add a task to sort</span>
      </button>

      {showInput && (
        <div className="bg-cream-50 rounded-2xl border border-sage-200 p-4 space-y-4 shadow-sm">
          <input
            autoFocus
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="What's the task?"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addMatrixTask()}
          />
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Which quadrant?</p>
            <div className="grid grid-cols-2 gap-2">
              {QUADRANTS.map(q => (
                <button
                  key={q.key}
                  onClick={() => setTargetQuadrant(q.key)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    targetQuadrant === q.key ? q.color + " border-current" : "bg-cream-50 border-slate-200"
                  )}
                >
                  <p className="text-sm font-semibold text-slate-800">{q.emoji} {q.label}</p>
                  <p className="text-xs text-slate-500">{q.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowInput(false)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={addMatrixTask} disabled={!inputText.trim()} className="flex-1 bg-sage-600 text-white rounded-xl py-2.5 font-semibold disabled:bg-slate-200 disabled:text-slate-400 hover:bg-sage-700">Add</button>
          </div>
        </div>
      )}

      {/* Matrix */}
      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map(q => {
          const qTasks = tasks.filter(t => t.quadrant === q.key);
          return (
            <div key={q.key} className={cn("rounded-2xl border-2 p-3 min-h-36", q.color)}>
              <div className="mb-3">
                <p className="font-bold text-slate-800 text-sm">{q.emoji} {q.label}</p>
                <p className="text-xs text-slate-500">{q.subtitle}</p>
              </div>
              <div className="space-y-2">
                {qTasks.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2">{q.description}</p>
                )}
                {qTasks.map(task => (
                  <div key={task.id} className="bg-cream-50 rounded-xl px-3 py-2 shadow-sm border border-white space-y-1.5">
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-slate-700 flex-1 leading-snug">{task.title}</p>
                      <button onClick={() => removeTask(task.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                    {q.key === "do" && (
                      <button
                        onClick={() => handleAddToToday(task)}
                        disabled={addedToday.has(task.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-default transition-colors w-full"
                      >
                        <CheckSquare size={11} />
                        {addedToday.has(task.id) ? "Added to today ✓" : "Add to today's tasks"}
                      </button>
                    )}
                    {q.key === "schedule" && (
                      <div className="space-y-1">
                        {scheduledIds.has(task.id) ? (
                          <span className="flex items-center gap-1 text-xs text-stone-500 px-1">
                            <Calendar size={11} /> Scheduled ✓
                          </span>
                        ) : schedulePickerId === task.id ? (
                          <div className="flex gap-1">
                            <input
                              type="date"
                              className="flex-1 text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sage-400"
                              value={scheduleDateInput}
                              onChange={e => setScheduleDateInput(e.target.value)}
                            />
                            <button
                              onClick={() => handleSchedule(task)}
                              disabled={!scheduleDateInput}
                              className="text-xs px-2 py-1 rounded-lg bg-sage-600 text-white disabled:opacity-40"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setSchedulePickerId(null); setScheduleDateInput(""); }}
                              className="text-xs px-2 py-1 rounded-lg border border-stone-200 text-slate-500"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSchedulePickerId(task.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors w-full"
                          >
                            <Calendar size={11} />
                            Schedule in planner
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Move tasks section */}
      {tasks.length > 0 && (
        <div className="bg-cream-50 rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-slate-700">Move a task</p>
          {tasks.map(task => {
            const currentQ = QUADRANTS.find(q => q.key === task.quadrant)!;
            return (
              <div key={task.id} className="flex items-center gap-3">
                <span className={cn("text-xs px-2 py-1 rounded-full font-medium shrink-0", currentQ.tagColor)}>{currentQ.emoji}</span>
                <p className="text-sm text-slate-700 flex-1 truncate">{task.title}</p>
                <select
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600"
                  value={task.quadrant}
                  onChange={e => moveTask(task.id, e.target.value as Quadrant)}
                >
                  {QUADRANTS.map(q => <option key={q.key} value={q.key}>{q.label}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">Add tasks above to populate your matrix</p>
        </div>
      )}
    </div>
  );
}
