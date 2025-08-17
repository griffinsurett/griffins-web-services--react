// src/hooks/UseMode.js
import { useEffect, useState } from "react";

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

  // Keep browser/OS status bars in sync with theme (like useAccentColor updates the CSS var)
  const setStatusBarMeta = (theme) => {
    try {
      // Match your primary-bg: light ~ off-white, dark ~ black
      const color = theme === "light" ? "var(--color-primary-light)" : "var(--color-primary-dark)";

      // <meta name="theme-color">
      let t = document.querySelector('meta[name="theme-color"]');
      if (!t) {
        t = document.createElement("meta");
        t.setAttribute("name", "theme-color");
        document.head.appendChild(t);
      }
      t.setAttribute("content", color);

      // iOS PWA status bar style (harmless if not a PWA)
      let ios = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!ios) {
        ios = document.createElement("meta");
        ios.setAttribute("name", "apple-mobile-web-app-status-bar-style");
        document.head.appendChild(ios);
      }
      ios.setAttribute("content", theme === "light" ? "default" : "black-translucent");
    } catch {
      /* no-op: SSR or restricted environments */
    }
  };

  // Apply to <html> + persist whenever it changes
  useEffect(() => {
    const theme = isLight ? "light" : "dark";
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    // 🔄 keep the mobile/UA status bar colors in sync with theme
    setStatusBarMeta(theme);
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
