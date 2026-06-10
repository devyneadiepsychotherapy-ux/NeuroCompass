"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tour steps
// ---------------------------------------------------------------------------

type TourStep = {
  path: string;
  heading: string;
  body: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    path: "/",
    heading: "Home",
    body: "This is your home. You'll see your streak, quick tools, and everything at a glance.",
  },
  {
    path: "/",
    heading: "Sidebar",
    body: "Tap the menu icon at the top left to open the sidebar. From here you can navigate home, switch themes, access settings, and learn about NeuroCompass.",
  },
  {
    path: "/tools",
    heading: "Tools",
    body: "Browse all your tools here. Use the search bar to find what you need, or browse by category. Tap the heart icon on any tool to favourite it; favourited tools appear on your Home and Me pages.",
  },
  {
    path: "/shop",
    heading: "Shop",
    body: "Spend your coins on rewards you've set for yourself. You earned them.",
  },
  {
    path: "/me",
    heading: "Your Me Page",
    body: "Your Me page has your ND strengths, a sensory profile summary, your lists, and special interests, all in one place.",
  },
  {
    path: "/",
    heading: "You're all set",
    body: "Come back to tools any time you need support.",
  },
];

const TOTAL = TOUR_STEPS.length;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type TourContextType = {
  startTour: () => void;
};

const TourContext = createContext<TourContextType>({ startTour: () => {} });

export function useTour() {
  return useContext(TourContext);
}

// ---------------------------------------------------------------------------
// Overlay card
// ---------------------------------------------------------------------------

function TourOverlay({
  stepIndex,
  onNext,
  onExit,
}: {
  stepIndex: number;
  onNext: () => void;
  onExit: () => void;
}) {
  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOTAL - 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-20 pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-sage-600" />
            <span className="text-xs font-semibold text-sage-600 tracking-wide uppercase">
              Guided Tour
            </span>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
            aria-label="Exit tour"
          >
            <X size={13} />
            Exit tour
          </button>
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center gap-1.5 px-5 pt-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                i === stepIndex
                  ? "w-5 h-1.5 bg-sage-500"
                  : i < stepIndex
                  ? "w-1.5 h-1.5 bg-sage-300"
                  : "w-1.5 h-1.5 bg-stone-200"
              )}
            />
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {stepIndex + 1} / {TOTAL}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 pt-3 pb-5 flex flex-col gap-4">
          <div>
            <p className="text-base font-bold text-slate-800 mb-1">{step.heading}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-sage-600 hover:bg-sage-700 active:scale-[0.98] text-white font-semibold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLast ? "Start exploring" : "Next"}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TourProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Navigate whenever the active step changes.
  useEffect(() => {
    if (isActive) {
      router.push(TOUR_STEPS[stepIndex].path);
    }
  }, [isActive, stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTour = useCallback(() => {
    setStepIndex(0);
    setIsActive(true);
  }, []);

  const handleNext = useCallback(() => {
    if (stepIndex === TOTAL - 1) {
      setIsActive(false);
      router.push("/");
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex, router]);

  const handleExit = useCallback(() => {
    setIsActive(false);
    router.push("/");
  }, [router]);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      {isActive && (
        <TourOverlay
          stepIndex={stepIndex}
          onNext={handleNext}
          onExit={handleExit}
        />
      )}
    </TourContext.Provider>
  );
}
