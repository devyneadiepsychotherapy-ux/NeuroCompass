"use client";

import { useEffect } from "react";
import { useTour } from "@/components/layout/TourProvider";

/**
 * /tour: entry point for the guided tour.
 * Immediately activates the TourProvider overlay (which lives in the root
 * layout and persists across navigation), then navigates to the first step.
 */
export default function TourPage() {
  const { startTour } = useTour();

  useEffect(() => {
    startTour();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
