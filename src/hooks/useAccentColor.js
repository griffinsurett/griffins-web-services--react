// src/hooks/useAccentColor.js - UPDATED VERSION
import { useEffect, useState } from "react";

// Define all accent colors in JavaScript (no CSS dependency)
const ACCENT_COLORS = [
  "var(--main-accent)", // Main default (keep this one in CSS too)
  "var(--color-teal-500)", // Teal (also in CSS)
  "var(--color-emerald-500)", // Emerald
  "var(--color-pink-500)", // Pink
  "var(--color-orange-500)", // Orange
  "var(--color-amber-500)", // Amber
];

export function useAccentColor() {
  const [accent, setAccent] = useState("");

  useEffect(() => {
    // 1) Pick initial: localStorage > default > first option
    const stored = localStorage.getItem("accent");
    const initial = 
      (stored && ACCENT_COLORS.includes(stored) && stored) ||
      ACCENT_COLORS[0]; // Always use first as default

    setAccent(initial);
    
    // 2) Set CSS custom property immediately
    const root = document.documentElement;
    root.style.setProperty("--color-accent", initial);
  }, []);

  // 3) Update CSS var + persist whenever accent changes
  useEffect(() => {
    if (!accent) return;
    const root = document.documentElement;
    root.style.setProperty("--color-accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  return [accent, setAccent, ACCENT_COLORS];
}

// Export colors for other components that might need them
export { ACCENT_COLORS };