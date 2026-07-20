"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const pct = progress * 100;
  const stage = pct < 20 ? 0 : pct < 40 ? 1 : pct < 60 ? 2 : pct < 80 ? 3 : 4;

  return (
    <svg
      viewBox="0 0 200 280"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ transition: "all 1.2s ease-in-out" }}
      aria-hidden="true"
    >
      <defs>
        {/* Soil gradient */}
        <radialGradient id="soilGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#8b6340" />
        </radialGradient>
        {/* Leaf gradients */}
        <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ab04c" />
          <stop offset="100%" stopColor="#2d6a1f" />
        </linearGradient>
        <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ecb6a" />
          <stop offset="100%" stopColor="#4a8c30" />
        </linearGradient>
        <linearGradient id="leafGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8d878" />
          <stop offset="100%" stopColor="#5fa040" />
        </linearGradient>
        {/* Stem gradient */}
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3a6b28" />
          <stop offset="40%" stopColor="#5c9040" />
          <stop offset="100%" stopColor="#3a6b28" />
        </linearGradient>
        {/* Petal gradients */}
        <radialGradient id="petalGrad" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#fce4f0" />
          <stop offset="100%" stopColor="#f472b6" />
        </radialGradient>
        <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
        {/* Bud gradient */}
        <radialGradient id="budGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e0b0f0" />
          <stop offset="100%" stopColor="#9333ea" />
        </radialGradient>
      </defs>

      {/* ── Soil pot ── */}
      {/* Pot body */}
      <path d="M 60 252 Q 58 270 72 272 L 128 272 Q 142 270 140 252 Z" fill="#b5651d" />
      <path d="M 60 252 Q 58 270 72 272 L 128 272 Q 142 270 140 252 Z" fill="#8b4513" opacity="0.3" />
      {/* Pot rim */}
      <path d="M 55 248 Q 55 256 100 256 Q 145 256 145 248 Q 145 242 100 242 Q 55 242 55 248 Z" fill="#cd853f" />
      <path d="M 58 247 Q 58 253 100 253 Q 142 253 142 247" fill="none" stroke="#a0522d" strokeWidth="1" opacity="0.5" />
      {/* Soil surface */}
      <ellipse cx="100" cy="246" rx="40" ry="7" fill="url(#soilGrad)" />
      <ellipse cx="100" cy="244" rx="38" ry="5" fill="#b8935a" opacity="0.6" />
      {/* Small soil pebbles */}
      <circle cx="82" cy="243" r="2.5" fill="#9a7040" opacity="0.7" />
      <circle cx="115" cy="244" r="2" fill="#9a7040" opacity="0.7" />
      <circle cx="96" cy="246" r="1.5" fill="#7a5530" opacity="0.8" />

      {/* ── STAGE 0: Seedling / first sprout ── */}
      {stage === 0 && (
        <g>
          {/* Slight curved stem */}
          <path d="M 100 244 C 100 235 98 228 99 218" stroke="url(#stemGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Left cotyledon */}
          <path d="M 99 226 C 90 220 82 221 80 226 C 82 232 92 232 99 226 Z" fill="url(#leafGrad2)" />
          <line x1="99" y1="226" x2="82" y2="226" stroke="#3a6b28" strokeWidth="0.8" opacity="0.7" />
          {/* Right cotyledon */}
          <path d="M 100 226 C 109 220 117 221 119 226 C 117 232 107 232 100 226 Z" fill="url(#leafGrad2)" />
          <line x1="100" y1="226" x2="118" y2="226" stroke="#3a6b28" strokeWidth="0.8" opacity="0.7" />
          {/* Tiny growing tip */}
          <path d="M 99 218 C 96 214 96 210 99 208 C 102 210 102 214 100 218 Z" fill="url(#leafGrad3)" />
          {/* Dewdrop */}
          <ellipse cx="116" cy="223" rx="2" ry="2.5" fill="#a8d8f0" opacity="0.6" />
        </g>
      )}

      {/* ── STAGE 1: Young plant ── */}
      {stage === 1 && (
        <g>
          {/* Main stem with gentle curve */}
          <path d="M 100 244 C 100 235 101 220 100 200 C 99 192 100 186 100 184" stroke="url(#stemGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Lower left leaf */}
          <path d="M 100 232 C 88 228 76 222 72 214 C 74 210 80 212 86 218 C 90 222 96 228 100 232 Z" fill="url(#leafGrad1)" />
          <path d="M 100 232 C 88 224 78 216 72 214" stroke="#2d6a1f" strokeWidth="1" fill="none" opacity="0.6" />
          {/* Lower right leaf */}
          <path d="M 100 232 C 112 228 124 222 128 214 C 126 210 120 212 114 218 C 110 222 104 228 100 232 Z" fill="url(#leafGrad1)" />
          <path d="M 100 232 C 112 224 122 216 128 214" stroke="#2d6a1f" strokeWidth="1" fill="none" opacity="0.6" />
          {/* Upper left leaf */}
          <path d="M 100 210 C 90 206 80 198 78 190 C 80 186 86 188 91 194 C 95 198 98 206 100 210 Z" fill="url(#leafGrad2)" />
          <path d="M 100 210 C 90 202 82 194 78 190" stroke="#3a6b28" strokeWidth="0.8" fill="none" opacity="0.6" />
          {/* Upper right leaf */}
          <path d="M 100 210 C 110 206 120 198 122 190 C 120 186 114 188 109 194 C 105 198 102 206 100 210 Z" fill="url(#leafGrad2)" />
          <path d="M 100 210 C 110 202 118 194 122 190" stroke="#3a6b28" strokeWidth="0.8" fill="none" opacity="0.6" />
          {/* Terminal leaf bud */}
          <path d="M 100 184 C 96 178 95 172 98 168 C 101 167 103 170 102 176 C 101 180 100 184 100 184 Z" fill="url(#leafGrad3)" />
          <line x1="100" y1="184" x2="99" y2="170" stroke="#3a8020" strokeWidth="0.8" opacity="0.6" />
        </g>
      )}

      {/* ── STAGE 2: Growing plant with bud ── */}
      {stage === 2 && (
        <g>
          {/* Slightly leaning stem */}
          <path d="M 100 244 C 100 232 101 215 101 198 C 101 182 100 168 100 156" stroke="url(#stemGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Bottom left */}
          <path d="M 101 234 C 85 228 70 218 66 206 C 68 200 76 204 84 212 C 90 218 97 228 101 234 Z" fill="url(#leafGrad1)" />
          <path d="M 101 234 C 86 224 72 210 66 206" stroke="#2d6a1f" strokeWidth="1.2" fill="none" opacity="0.55" />
          {/* Bottom right */}
          <path d="M 100 234 C 116 228 131 218 135 206 C 133 200 125 204 117 212 C 111 218 103 228 100 234 Z" fill="url(#leafGrad1)" />
          <path d="M 100 234 C 115 224 129 210 135 206" stroke="#2d6a1f" strokeWidth="1.2" fill="none" opacity="0.55" />
          {/* Mid left */}
          <path d="M 101 212 C 87 207 74 198 71 188 C 73 183 80 186 87 193 C 93 199 98 207 101 212 Z" fill="url(#leafGrad2)" />
          <path d="M 101 212 C 88 204 76 192 71 188" stroke="#3a6b28" strokeWidth="1" fill="none" opacity="0.55" />
          {/* Mid right */}
          <path d="M 100 212 C 114 207 127 198 130 188 C 128 183 121 186 114 193 C 108 199 102 207 100 212 Z" fill="url(#leafGrad2)" />
          <path d="M 100 212 C 113 204 125 192 130 188" stroke="#3a6b28" strokeWidth="1" fill="none" opacity="0.55" />
          {/* Upper left */}
          <path d="M 101 190 C 90 185 80 177 78 168 C 80 163 87 166 92 173 C 96 178 99 185 101 190 Z" fill="url(#leafGrad3)" />
          {/* Upper right */}
          <path d="M 100 190 C 111 185 121 177 123 168 C 121 163 114 166 109 173 C 105 178 101 185 100 190 Z" fill="url(#leafGrad3)" />
          {/* Bud */}
          <path d="M 100 156 C 96 150 94 144 97 138 C 100 134 103 138 103 144 C 103 150 101 155 100 156 Z" fill="url(#budGrad)" />
          {/* Bud sepals */}
          <path d="M 100 156 C 96 152 93 148 94 144" stroke="#4a7c3f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 100 156 C 104 152 107 148 106 144" stroke="#4a7c3f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* ── STAGE 3: Full plant with open flower ── */}
      {stage === 3 && (
        <g>
          {/* Main curved stem */}
          <path d="M 100 244 C 100 230 102 210 101 190 C 100 172 100 158 100 140" stroke="url(#stemGrad)" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Leaves : alternating, with veins */}
          <path d="M 101 232 C 82 226 66 214 62 200 C 64 194 73 198 82 207 C 89 214 97 226 101 232 Z" fill="url(#leafGrad1)" />
          <path d="M 101 232 C 84 220 70 206 62 200" stroke="#2d6a1f" strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M 100 232 C 119 226 135 214 139 200 C 137 194 128 198 119 207 C 112 214 103 226 100 232 Z" fill="url(#leafGrad1)" />
          <path d="M 100 232 C 117 220 131 206 139 200" stroke="#2d6a1f" strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M 101 208 C 85 203 71 193 68 181 C 70 175 78 179 86 187 C 92 193 98 203 101 208 Z" fill="url(#leafGrad2)" />
          <path d="M 101 208 C 86 198 74 186 68 181" stroke="#3a6b28" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M 100 208 C 116 203 130 193 133 181 C 131 175 123 179 115 187 C 109 193 102 203 100 208 Z" fill="url(#leafGrad2)" />
          <path d="M 100 208 C 115 198 127 186 133 181" stroke="#3a6b28" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M 101 182 C 88 177 78 168 76 158 C 78 153 85 156 91 163 C 96 168 99 177 101 182 Z" fill="url(#leafGrad3)" />
          <path d="M 100 182 C 113 177 123 168 125 158 C 123 153 116 156 110 163 C 105 168 101 177 100 182 Z" fill="url(#leafGrad3)" />
          {/* Flower : 8 petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const px = 100 + 17 * Math.cos(rad);
            const py = 140 + 17 * Math.sin(rad);
            return (
              <ellipse
                key={i}
                cx={px} cy={py}
                rx="10" ry="6"
                fill="url(#petalGrad)"
                transform={`rotate(${deg} ${px} ${py})`}
              />
            );
          })}
          {/* Petal highlights */}
          {[22, 112, 202, 292].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const px = 100 + 14 * Math.cos(rad);
            const py = 140 + 14 * Math.sin(rad);
            return (
              <ellipse key={i} cx={px} cy={py} rx="5" ry="3.5" fill="#fce7f3" opacity="0.7"
                transform={`rotate(${deg} ${px} ${py})`} />
            );
          })}
          {/* Flower center */}
          <circle cx="100" cy="140" r="11" fill="url(#centerGrad)" />
          <circle cx="100" cy="140" r="7" fill="#f59e0b" />
          {/* Pollen dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return <circle key={i} cx={100 + 5 * Math.cos(rad)} cy={140 + 5 * Math.sin(rad)} r="1.2" fill="#92400e" />;
          })}
        </g>
      )}

      {/* ── STAGE 4: Full lush blooming plant ── */}
      {stage === 4 && (
        <g>
          {/* Central trunk */}
          <path d="M 100 244 C 100 228 100 210 100 190 C 100 172 100 155 100 138" stroke="url(#stemGrad)" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Left branch */}
          <path d="M 100 195 C 88 188 76 182 66 174" stroke="url(#stemGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Right branch */}
          <path d="M 100 195 C 112 188 124 182 134 174" stroke="url(#stemGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Left sub-branch */}
          <path d="M 80 183 C 72 177 64 170 58 162" stroke="url(#stemGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Right sub-branch */}
          <path d="M 120 183 C 128 177 136 170 142 162" stroke="url(#stemGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Large base leaves */}
          <path d="M 101 236 C 80 228 62 214 58 198 C 60 191 70 196 80 206 C 88 214 97 228 101 236 Z" fill="url(#leafGrad1)" />
          <path d="M 101 236 C 82 222 66 206 58 198" stroke="#2d6a1f" strokeWidth="1.2" fill="none" opacity="0.45" />
          <path d="M 100 236 C 121 228 139 214 143 198 C 141 191 131 196 121 206 C 113 214 103 228 100 236 Z" fill="url(#leafGrad1)" />
          <path d="M 100 236 C 119 222 135 206 143 198" stroke="#2d6a1f" strokeWidth="1.2" fill="none" opacity="0.45" />

          {/* Mid leaves on main stem */}
          <path d="M 101 212 C 84 206 70 196 66 184 C 68 178 77 182 85 190 C 91 196 98 206 101 212 Z" fill="url(#leafGrad2)" />
          <path d="M 100 212 C 117 206 131 196 135 184 C 133 178 124 182 116 190 C 110 196 102 206 100 212 Z" fill="url(#leafGrad2)" />

          {/* Branch leaves */}
          <path d="M 72 179 C 62 174 53 165 51 155 C 53 150 60 153 66 160 C 70 165 71 173 72 179 Z" fill="url(#leafGrad2)" />
          <path d="M 68 177 C 57 172 48 163 46 153" stroke="#3a6b28" strokeWidth="1" fill="none" opacity="0.45" />
          <path d="M 128 179 C 138 174 147 165 149 155 C 147 150 140 153 134 160 C 130 165 129 173 128 179 Z" fill="url(#leafGrad2)" />

          <path d="M 62 165 C 52 159 44 149 43 140 C 45 135 52 138 57 145 C 61 150 62 159 62 165 Z" fill="url(#leafGrad3)" />
          <path d="M 138 165 C 148 159 156 149 157 140 C 155 135 148 138 143 145 C 139 150 138 159 138 165 Z" fill="url(#leafGrad3)" />

          {/* Upper leaves near main flower */}
          <path d="M 101 164 C 90 159 80 151 78 142 C 80 137 87 140 93 147 C 97 152 100 159 101 164 Z" fill="url(#leafGrad3)" />
          <path d="M 100 164 C 111 159 121 151 123 142 C 121 137 114 140 108 147 C 104 152 101 159 100 164 Z" fill="url(#leafGrad3)" />

          {/* Main central flower */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const px = 100 + 18 * Math.cos(rad);
            const py = 136 + 18 * Math.sin(rad);
            return (
              <ellipse key={i} cx={px} cy={py} rx="11" ry="6.5"
                fill="url(#petalGrad)" transform={`rotate(${deg} ${px} ${py})`} />
            );
          })}
          <circle cx="100" cy="136" r="12" fill="url(#centerGrad)" />
          <circle cx="100" cy="136" r="8" fill="#f59e0b" />
          {[0, 51, 102, 153, 204, 255, 306].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return <circle key={i} cx={100 + 5.5 * Math.cos(rad)} cy={136 + 5.5 * Math.sin(rad)} r="1.4" fill="#92400e" />;
          })}

          {/* Left branch small flower */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const px = 63 + 10 * Math.cos(rad);
            const py = 158 + 10 * Math.sin(rad);
            return <ellipse key={i} cx={px} cy={py} rx="7" ry="4.5"
              fill="url(#petalGrad)" transform={`rotate(${deg} ${px} ${py})`} />;
          })}
          <circle cx="63" cy="158" r="7" fill="url(#centerGrad)" />
          <circle cx="63" cy="158" r="4.5" fill="#f59e0b" />

          {/* Right branch small flower */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const px = 138 + 10 * Math.cos(rad);
            const py = 158 + 10 * Math.sin(rad);
            return <ellipse key={i} cx={px} cy={py} rx="7" ry="4.5"
              fill="url(#petalGrad)" transform={`rotate(${deg} ${px} ${py})`} />;
          })}
          <circle cx="138" cy="158" r="7" fill="url(#centerGrad)" />
          <circle cx="138" cy="158" r="4.5" fill="#f59e0b" />

          {/* Dewdrops on leaves */}
          <ellipse cx="132" cy="193" rx="2.5" ry="3" fill="#bde8f8" opacity="0.65" />
          <ellipse cx="72" cy="205" rx="2" ry="2.5" fill="#bde8f8" opacity="0.55" />
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

function playCompletionAlert() {
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    play(880, 0, 0.25);
    play(1100, 0.28, 0.25);
    play(880, 0.56, 0.4);
    if (navigator.vibrate) navigator.vibrate([150, 80, 150, 80, 300]);
  } catch { /* silently ignore */ }
}

export default function FocusGardenPage() {
  const router = useRouter();
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

  const isFavourited = mounted && favorites.some((f) => f.toolId === "focus-garden");

  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [, forceUpdate] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [completionMsg, setCompletionMsg] = useState("");
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      if (soundEnabled) playCompletionAlert();
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
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sage-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-base font-semibold text-slate-700 ml-3 flex-1">The Focus Garden</h1>
        <button
          onClick={() => toggleFavorite("focus-garden")}
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

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled((v) => !v)}
          className={cn(
            "mt-5 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all",
            soundEnabled
              ? "bg-sage-50 border-sage-200 text-sage-700"
              : "bg-slate-50 border-slate-200 text-slate-400"
          )}
        >
          <span>{soundEnabled ? "🔔" : "🔕"}</span>
          {soundEnabled ? "Sound & vibration on" : "Sound & vibration off"}
        </button>
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
