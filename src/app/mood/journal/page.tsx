"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BookOpen, ChevronLeft, Plus, ChevronDown, ChevronUp, Trash2, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatEntryDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEntryTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

function todayHeading() {
  return new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function XpToast({ amount }: { amount: number }) {
  return (
    <div
      className="fixed top-16 left-1/2 z-50 flex items-center gap-1.5 bg-[#9B8EC4] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg animate-fade-in-out pointer-events-none"
      style={{ transform: "translateX(-50%)" }}
    >
      <Heart size={13} className="fill-white" />
      +{amount} XP
    </div>
  );
}

export default function JournalPage() {
  const { journalEntries, addJournalEntry, deleteJournalEntry, addXP } = useAppStore();
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const xpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (writing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [writing]);

  useEffect(() => () => {
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
  }, []);

  function triggerXp(amount: number) {
    if (xpTimerRef.current) clearTimeout(xpTimerRef.current);
    setXpFlash(amount);
    xpTimerRef.current = setTimeout(() => setXpFlash(null), 1500);
  }

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addJournalEntry(trimmed);
    addXP(5);
    triggerXp(5);
    setDraft("");
    setWriting(false);
  }

  function handleCancel() {
    setDraft("");
    setWriting(false);
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deleteJournalEntry(id);
      setConfirmDelete(null);
      if (expanded === id) setExpanded(null);
    } else {
      setConfirmDelete(id);
    }
  }

  return (
    <div className="px-4 pt-0 pb-28 min-h-screen">
      {xpFlash && <XpToast amount={xpFlash} />}

      {/* Header */}
      <div className="pt-3 pb-4 flex items-center gap-2">
        <Link
          href="/mood"
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors shrink-0"
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold text-slate-800 leading-tight"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Journal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">A calm space for your thoughts</p>
        </div>
        <BookOpen size={18} className="text-sage-400 shrink-0" />
      </div>

      {/* Composer */}
      {writing ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-5">
          <div className="px-4 pt-4 pb-2.5 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-sage-600 uppercase tracking-wide">
              {todayHeading()}
            </p>
          </div>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write whatever's on your mind…"
            className="w-full px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none leading-relaxed bg-white"
            style={{ minHeight: "180px" }}
          />
          <div className="px-4 pb-4 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 border border-slate-200 text-slate-500 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all",
                draft.trim()
                  ? "bg-sage-500 text-white hover:bg-sage-600 active:scale-[0.98]"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              Save entry
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setWriting(true)}
          className="w-full flex items-center gap-3 border border-dashed border-sage-300 rounded-2xl px-4 py-4 mb-5 text-left hover:border-sage-400 hover:bg-sage-50/40 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
            <Plus size={16} className="text-sage-600" />
          </div>
          <span className="text-sm font-medium text-sage-700">New entry</span>
        </button>
      )}

      {/* Entry list */}
      {journalEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
            {journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"}
          </p>
          {journalEntries.map((entry) => {
            const isOpen = expanded === entry.id;
            const preview = entry.content.length > 90
              ? entry.content.slice(0, 90) + "…"
              : entry.content;
            return (
              <div
                key={entry.id}
                className="bg-cream-50 rounded-2xl border border-slate-100 overflow-hidden"
              >
                <button
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                  onClick={() => {
                    setExpanded(isOpen ? null : entry.id);
                    setConfirmDelete(null);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-sage-600 uppercase tracking-wide leading-none">
                      {formatEntryDate(entry.timestamp)}&ensp;·&ensp;{formatEntryTime(entry.timestamp)}
                    </p>
                    {!isOpen && (
                      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                        {preview}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 mt-0.5">
                    {isOpen
                      ? <ChevronUp size={14} className="text-slate-300" />
                      : <ChevronDown size={14} className="text-slate-300" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pt-2">
                      {entry.content}
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
                          confirmDelete === entry.id
                            ? "bg-rose-500 text-white"
                            : "text-slate-400 hover:text-rose-400 hover:bg-rose-50"
                        )}
                      >
                        <Trash2 size={12} />
                        {confirmDelete === entry.id ? "Tap again to confirm" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {journalEntries.length === 0 && !writing && (
        <div className="text-center py-20 space-y-2">
          <BookOpen size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Your journal is empty</p>
          <p className="text-xs text-slate-300">Tap &ldquo;New entry&rdquo; to write your first thought</p>
        </div>
      )}
    </div>
  );
}
