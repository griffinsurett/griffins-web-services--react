// src/hooks/useAccentColor.js - UPDATED VERSION
import { useEffect, useState } from "react";

// Define all accent colors in JavaScript (no CSS dependency)
const ACCENT_COLORS = [
  "#5e76f6", // Main default (keep this one in CSS too)
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#ff5f1f", // Orange
  "#f59e0b", // Amber
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