"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DURATIONS = [5, 10, 15, 20, 25, 30];

const AFFIRMATIONS = [
  "Your focus is growing",
  "One moment at a time",
  "You're doing great",
  "Stay with it",
  "Small steps, big growth",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(s: number) {
  const total = Math.max(0, Math.ceil(s));
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const sec = (total % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function getElapsed(session: NonNullable<ReturnType<typeof useAppStore.getState>["focusSession"]>): number {
  const wallElapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000;
  const currentPause = session.isPaused && session.pausedAt
    ? (Date.now() - new Date(session.pausedAt).getTime()) / 1000
    : 0;
  return wallElapsed - session.totalPausedSeconds - currentPause;
}

// ---------------------------------------------------------------------------
// SVG Plant stages
// ---------------------------------------------------------------------------

function PlantSVG({ progress }: { progress: number }) {
  // progress: 0–1
  const pct = progress * 100;

  // Stage thresholds
  const stage = pct < 20 ? 0 : pct < 40 ? 1 : pct < 60 ? 2 : pct < 80 ? 3 : 4;

  // Shared palette
  const stemColor = "#4a7c3f";
  const leafDark = "#3d6b33";
  const leafMid = "#5d9451";
  const leafLight = "#85b67a";
  const flowerCenter = "#f5c842";
  const petalColor = "#f9a8d4";
  const earthColor = "#c8a97e";
  const earthDark = "#a07850";

  return (
    <svg
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ transition: "all 1.2s ease-in-out" }}
      aria-hidden="true"
    >
      {/* Soil / ground */}
      <ellipse cx="100" cy="240" rx="52" ry="12" fill={earthDark} opacity="0.5" />
      <ellipse cx="100" cy="236" rx="48" ry="10" fill={earthColor} />

      {/* Stage 0 (0-20%): seedling - tiny sprout, 2 small leaves */}
      {stage === 0 && (
        <g style={{ transition: "opacity 0.8s ease" }}>
          {/* Thin stem */}
          <line x1="100" y1="236" x2="100" y2="210" stroke={stemColor} strokeWidth="3" strokeLinecap="round" />
          {/* Left leaf */}
          <ellipse cx="90" cy="216" rx="10" ry="5" fill={leafMid} transform="rotate(-30 90 216)" />
          {/* Right leaf */}
          <ellipse cx="110" cy="216" rx="10" ry="5" fill={leafMid} transform="rotate(30 110 216)" />
          {/* Tiny bud tip */}
          <circle cx="100" cy="209" r="3" fill={leafLight} />
        </g>
      )}

      {/* Stage 1 (20-40%): small plant - short stem, 4 leaves */}
      {stage === 1 && (
        <g style={{ transition: "opacity 0.8s ease" }}>
          <line x1="100" y1="236" x2="100" y2="188" stroke={stemColor} strokeWidth="4" strokeLinecap="round" />
          {/* Lower pair */}
          <ellipse cx="85" cy="224" rx="14" ry="6" fill={leafDark} transform="rotate(-35 85 224)" />
          <ellipse cx="115" cy="224" rx="14" ry="6" fill={leafDark} transform="rotate(35 115 224)" />
          {/* Upper pair */}
          <ellipse cx="88" cy="204" rx="13" ry="6" fill={leafMid} transform="rotate(-25 88 204)" />
          <ellipse cx="112" cy="204" rx="13" ry="6" fill={leafMid} transform="rotate(25 112 204)" />
          {/* Tip */}
          <ellipse cx="100" cy="186" rx="6" ry="9" fill={leafLight} />
        </g>
      )}

      {/* Stage 2 (40-60%): growing plant - taller, more leaves, bud forming */}
      {stage === 2 && (
        <g style={{ transition: "opacity 0.8s ease" }}>
          <line x1="100" y1="236" x2="100" y2="162" stroke={stemColor} strokeWidth="5" strokeLinecap="round" />
          {/* Bottom pair */}
          <ellipse cx="80" cy="228" rx="18" ry="7" fill={leafDark} transform="rotate(-40 80 228)" />
          <ellipse cx="120" cy="228" rx="18" ry="7" fill={leafDark} transform="rotate(40 120 228)" />
          {/* Mid pair */}
          <ellipse cx="82" cy="206" rx="16" ry="7" fill={leafMid} transform="rotate(-30 82 206)" />
          <ellipse cx="118" cy="206" rx="16" ry="7" fill={leafMid} transform="rotate(30 118 206)" />
          {/* Upper pair */}
          <ellipse cx="86" cy="182" rx="13" ry="6" fill={leafLight} transform="rotate(-20 86 182)" />
          <ellipse cx="114" cy="182" rx="13" ry="6" fill={leafLight} transform="rotate(20 114 182)" />
          {/* Bud */}
          <ellipse cx="100" cy="160" rx="7" ry="10" fill="#d4a8e0" />
          <ellipse cx="100" cy="156" rx="5" ry="6" fill="#c084cf" />
        </g>
      )}

      {/* Stage 3 (60-80%): flowering - full stem, open flower */}
      {stage === 3 && (
        <g style={{ transition: "opacity 0.8s ease" }}>
          <line x1="100" y1="236" x2="100" y2="144" stroke={stemColor} strokeWidth="5" strokeLinecap="round" />
          {/* Leaves */}
          <ellipse cx="76" cy="226" rx="20" ry="8" fill={leafDark} transform="rotate(-42 76 226)" />
          <ellipse cx="124" cy="226" rx="20" ry="8" fill={leafDark} transform="rotate(42 124 226)" />
          <ellipse cx="78" cy="202" rx="18" ry="7" fill={leafMid} transform="rotate(-32 78 202)" />
          <ellipse cx="122" cy="202" rx="18" ry="7" fill={leafMid} transform="rotate(32 122 202)" />
          <ellipse cx="82" cy="178" rx="15" ry="6" fill={leafLight} transform="rotate(-22 82 178)" />
          <ellipse cx="118" cy="178" rx="15" ry="6" fill={leafLight} transform="rotate(22 118 178)" />
          {/* Flower petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse
              key={deg}
              cx={100 + 14 * Math.cos((deg * Math.PI) / 180)}
              cy={142 + 14 * Math.sin((deg * Math.PI) / 180)}
              rx="8"
              ry="5"
              fill={petalColor}
              transform={`rotate(${deg} ${100 + 14 * Math.cos((deg * Math.PI) / 180)} ${142 + 14 * Math.sin((deg * Math.PI) / 180)})`}
            />
          ))}
          {/* Flower center */}
          <circle cx="100" cy="142" r="9" fill={flowerCenter} />
          <circle cx="100" cy="142" r="5" fill="#e8a800" />
        </g>
      )}

      {/* Stage 4 (80-100%): full lush plant/tree */}
      {stage === 4 && (
        <g style={{ transition: "opacity 0.8s ease" }}>
          {/* Trunk */}
          <rect x="94" y="180" width="12" height="56" rx="6" fill={earthDark} />
          {/* Lower canopy */}
          <ellipse cx="100" cy="196" rx="52" ry="32" fill={leafDark} />
          {/* Mid canopy */}
          <ellipse cx="100" cy="172" rx="44" ry="30" fill={leafMid} />
          {/* Upper canopy */}
          <ellipse cx="100" cy="150" rx="34" ry="26" fill={leafLight} />
          {/* Top cluster */}
          <ellipse cx="100" cy="132" rx="22" ry="18" fill="#a3d48a" />
          {/* Small flowers scattered */}
          <circle cx="78" cy="168" r="5" fill={petalColor} />
          <circle cx="122" cy="160" r="5" fill={petalColor} />
          <circle cx="94" cy="148" r="4" fill={petalColor} />
          <circle cx="110" cy="175" r="4" fill={petalColor} />
          <circle cx="86" cy="182" r="3.5" fill="#fde68a" />
          <circle cx="116" cy="185" r="3.5" fill="#fde68a" />
          {/* Flower centers */}
          <circle cx="78" cy="168" r="2.5" fill={flowerCenter} />
          <circle cx="122" cy="160" r="2.5" fill={flowerCenter} />
          <circle cx="94" cy="148" r="2" fill={flowerCenter} />
          <circle cx="110" cy="175" r="2" fill={flowerCenter} />
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function xpForMinutes(mins: number): number {
  if (mins >= 20) return 50;
  if (mins >= 15) return 30;
  if (mins >= 10) return 20;
  return 10;
}

export default function FocusFriendPage() {
  const {
    focusSession,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    resetFocusSession,
    addXP,
    favorites,
    toggleFavorite,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isFavourited = mounted && favorites.some((f) => f.toolId === "focus-friend");

  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [, forceUpdate] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [completionMsg, setCompletionMsg] = useState("");
  const [xpToast, setXpToast] = useState<number | null>(null);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate affirmation every 8s while running
  useEffect(() => {
    if (!focusSession?.isActive || focusSession.isPaused) return;
    const t = setInterval(() => {
      setAffirmationIndex((i) => (i + 1) % AFFIRMATIONS.length);
    }, 8000);
    return () => clearInterval(t);
  }, [focusSession?.isActive, focusSession?.isPaused]);

  // Detect completion
  useEffect(() => {
    if (!focusSession?.isActive || focusSession.isPaused) return;
    const elapsed = getElapsed(focusSession);
    if (elapsed >= focusSession.durationSeconds) {
      const mins = focusSession.selectedMinutes ?? Math.round(focusSession.durationSeconds / 60);
      const earned = xpForMinutes(mins);
      resetFocusSession();
      setCompletionMsg("Session complete. Well done.");
      addXP(earned);
      setXpToast(earned);
      setTimeout(() => setXpToast(null), 3000);
    }
  });

  const handleStart = useCallback(() => {
    const mins = showCustom ? (parseInt(customInput) || 25) : selectedMinutes;
    setCompletionMsg("");
    startFocusSession(mins * 60, mins);
    addXP(5);
    setXpToast(5);
    setTimeout(() => setXpToast(null), 2000);
  }, [showCustom, customInput, selectedMinutes, startFocusSession, addXP]);

  const handleReset = useCallback(() => {
    resetFocusSession();
    setCompletionMsg("");
  }, [resetFocusSession]);

  const activeFocusSession = mounted ? focusSession : null;
  const isActive = activeFocusSession?.isActive ?? false;
  const isPaused = activeFocusSession?.isPaused ?? false;

  const elapsed = isActive ? getElapsed(activeFocusSession!) : 0;
  const remaining = isActive
    ? Math.max(0, activeFocusSession!.durationSeconds - elapsed)
    : (showCustom ? (parseInt(customInput) || selectedMinutes) : selectedMinutes) * 60;
  const progress = isActive
    ? Math.min(1, elapsed / activeFocusSession!.durationSeconds)
    : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* XP toast */}
      {xpToast !== null && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#9B8EC4] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none"
          style={{ animation: "fadeIn 0.3s ease" }}
        >
          +{xpToast} XP
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-2">
        <Link
          href="/tools"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sage-100 transition-colors"
          aria-label="Back to tools"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <h1 className="text-base font-semibold text-slate-700 ml-3 flex-1">The Grove</h1>
        <button
          onClick={() => toggleFavorite("focus-friend")}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sage-100 transition-colors"
          aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart
            size={20}
            className={isFavourited ? "text-rose-500 fill-rose-500" : "text-slate-400"}
          />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-10">

        {/* Plant */}
        <div className="w-48 h-64 mt-4 mb-2">
          <PlantSVG progress={progress} />
        </div>

        {/* Affirmation or completion */}
        <div className="h-8 flex items-center justify-center mb-4">
          {completionMsg ? (
            <p className="text-sm text-sage-600 font-medium text-center">{completionMsg}</p>
          ) : isActive ? (
            <p
              key={affirmationIndex}
              className="text-sm text-sage-500 italic text-center"
              style={{ animation: "fadeIn 1s ease" }}
            >
              {AFFIRMATIONS[affirmationIndex]}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic text-center">
              Set your focus time to begin
            </p>
          )}
        </div>

        {/* Timer */}
        <p
          className={cn(
            "font-mono font-bold tabular-nums leading-none mb-6",
            isActive ? "text-6xl text-slate-800" : "text-5xl text-slate-400"
          )}
        >
          {formatTime(remaining)}
        </p>

        {/* Duration selector - only shown when no active session */}
        {!isActive && (
          <div className="w-full max-w-xs space-y-3 mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setSelectedMinutes(m); setShowCustom(false); }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                    !showCustom && selectedMinutes === m
                      ? "bg-sage-600 text-white border-sage-600 shadow-sm"
                      : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                  )}
                >
                  {m}m
                </button>
              ))}
              <button
                onClick={() => setShowCustom(true)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  showCustom
                    ? "bg-sage-600 text-white border-sage-600 shadow-sm"
                    : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
                )}
              >
                Custom
              </button>
            </div>
            {showCustom && (
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="e.g. 20"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sage-400"
                  style={{ background: "var(--color-white, #fdfaf5)" }}
                />
                <span className="text-sm text-slate-400">min</span>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isActive && (
            <button
              onClick={handleStart}
              className="bg-sage-600 text-white font-semibold rounded-2xl px-8 py-3 text-base hover:bg-sage-700 transition-all active:scale-[0.97] shadow-sm"
            >
              {completionMsg ? "Start again" : "Begin session"}
            </button>
          )}

          {isActive && (
            <>
              <button
                onClick={isPaused ? resumeFocusSession : pauseFocusSession}
                className="bg-sage-600 text-white font-semibold rounded-2xl px-7 py-3 text-base hover:bg-sage-700 transition-all active:scale-[0.97] shadow-sm"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={handleReset}
                className="bg-cream-100 text-slate-600 font-medium rounded-2xl px-5 py-3 text-base hover:bg-cream-200 transition-all active:scale-[0.97] border border-slate-200"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {/* Paused indicator */}
        {isPaused && (
          <p className="mt-4 text-xs text-slate-400 italic">Session paused</p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
