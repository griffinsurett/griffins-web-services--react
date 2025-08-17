// src/hooks/UseMode.js
import { useEffect, useState } from "react";

export function UseMode() {
  // Pick the correct initial value synchronously
  const getInitial = () => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light") return true;
      if (stored === "dark") return false;
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
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
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
