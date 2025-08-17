// src/hooks/UseMode.js
import { useEffect, useState } from "react";

/**
 * Theme hook — mirrors how accent color is handled:
 * - Sets `data-theme` + `color-scheme` on <html>
 * - Updates a CSS var `--color-bg` (so the <head> script syncs <meta name="theme-color">)
 * - Persists the user’s choice in localStorage
 *
 * NOTE: index.html already has a MutationObserver that watches `data-theme`/style
 * and updates <meta name="theme-color"> from the computed `--color-bg`.
 */
export function UseMode() {
  // Pick the correct initial value synchronously
  const getInitial = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light") return true;
      if (stored === "dark")  return false;
      return window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      return false; // safe fallback: dark
    }
  };

  const [isLight, setIsLight] = useState(getInitial);

  // Apply to <html> + persist whenever it changes
  useEffect(() => {
    const theme = isLight ? "light" : "dark";
    const root = document.documentElement;

    // Attribute + UA hint
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;

    // Keep a CSS var in sync so the <head> script updates <meta name="theme-color">
    // (Do NOT set the meta tag here—mirror the accent approach by only touching CSS vars.)
    const bg = theme === "light" ? "#fafafa" : "#000000";
    root.style.setProperty("--color-bg", bg);

    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [isLight]);

  // Follow OS changes only if user hasn't explicitly saved a preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e) => {
      try {
        const stored = localStorage.getItem("theme");
        if (stored !== "light" && stored !== "dark") {
          setIsLight(e.matches);
        }
      } catch {}
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return [isLight, setIsLight];
}
