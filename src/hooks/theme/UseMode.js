// src/hooks/theme/UseMode.js
import { useEffect, useMemo } from "react";
import useLocalStorageState from "../useLocalStorageState";

/**
 * Theme hook — mirrors how accent color is handled:
 * - Sets `data-theme` + `color-scheme` on <html>
 * - Updates CSS var `--color-bg` for the <meta name="theme-color"> updater
 * - Persists the user's choice in localStorage
 * - Uses semi-transparent equivalent colors for mobile status bar
 */
export function UseMode() {
  // Initial: localStorage > OS preference (light?) > dark fallback
  const [theme, setTheme] = useLocalStorageState(
    "theme",
    () => {
      try {
        return window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
      } catch {
        return "dark";
      }
    },
    { raw: true, validate: (v) => v === "light" || v === "dark" }
  );

  const isLight = theme === "light";
  const setIsLight = (val) => setTheme(val ? "light" : "dark");

  // Calculate semi-transparent equivalent colors for theme-color meta tag
  // Since theme-color doesn't support alpha, we simulate bg-bg/50 with solid colors
  const themeColors = useMemo(() => ({
    light: "#f5f5f5", // Equivalent to 50% opacity #fafafa over white
    dark: "#0a0a0a",  // Equivalent to 50% opacity #000000 over typical dark UI
  }), []);

  // Apply to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    const t = isLight ? "light" : "dark";
    
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;
    
    // Set the theme color for mobile status bar (simulating bg-bg/50)
    root.style.setProperty("--color-bg", themeColors[t]);
  }, [isLight, themeColors]);

  // Follow OS changes only if user hasn't explicitly saved a preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e) => {
      try {
        const stored = localStorage.getItem("theme");
        if (stored !== "light" && stored !== "dark") {
          setTheme(e.matches ? "light" : "dark");
        }
      } catch {}
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setTheme]);

  return [isLight, setIsLight];
}