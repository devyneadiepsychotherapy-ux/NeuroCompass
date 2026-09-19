import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function xpForLevel(level: number): number {
  return level * 100;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getTodayKey(): string {
  return localDateKey(new Date());
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Races a promise against a timeout. Deliberately kept dependency-free and in
 * this always-statically-loaded module rather than a dynamically-imported
 * one: a "Requesting..." button that guards its native call with a timeout
 * living *inside* the dynamically-imported module it awaits doesn't actually
 * protect against the dynamic import() itself hanging (e.g. its chunk's
 * network fetch stalling) - that hang happens before the guarded code is
 * ever reached. Import this from the click handler instead and wrap the
 * whole thing, import included, so nothing between "tap" and "result" is
 * unbounded.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
