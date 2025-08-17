// src/hooks/useAccentColor.js
import { useEffect, useState } from "react";

function parseCssList(val) {
  return (val || "")
    .split(/[, \n\r\t]+/)
    .map(s => s.trim())
    .filter(Boolean);
}
function dedupe(list) {
  const seen = new Set();
  return list.filter(c => (seen.has(c) ? false : (seen.add(c), true)));
}

const FALLBACK_ACCENTS = [
  "var(--main-accent)",
  "#10b981", // emerald
  "#ec4899", // pink
  "#ff5f1f", // orange
  "#f59e0b", // amber
];

export function useAccentColor() {
  const [accents, setAccents] = useState([]);
  const [accent, setAccent] = useState("");

  // Read variables from :root (may be empty if CSS not loaded yet)
  const readFromCss = () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const cssDefault = styles.getPropertyValue("--color-accent").trim();
    const rawOptions = styles.getPropertyValue("--accent-options").trim();
    const options = parseCssList(rawOptions);
    return { cssDefault, options };
  };

  useEffect(() => {
    const root = document.documentElement;
    const { cssDefault, options } = readFromCss();

    // Use CSS list if present; otherwise fallback (first paint on prod can be too early)
    let list = options.length ? options : FALLBACK_ACCENTS.slice();

    // Always expose the computed default as a swatch (so “main accent” can’t disappear)
    if (cssDefault) list = [cssDefault, ...list];

    list = dedupe(list);
    setAccents(list);

    // Pick initial value: stored > cssDefault > first option
    const stored = localStorage.getItem("accent");
    const initial =
      (stored && list.includes(stored) && stored) ||
      cssDefault ||
      list[0] ||
      "";

    if (initial) {
      setAccent(initial);
      if (initial !== cssDefault) {
        root.style.setProperty("--color-accent", initial);
      }
    }

    // If CSS wasn't ready (no options yet), retry once after window 'load'
    if (!options.length) {
      const onLoad = () => {
        const late = readFromCss().options;
        if (late.length) {
          const { cssDefault: cssDef2 } = readFromCss();
          let merged = dedupe([cssDef2, ...late]);
          setAccents(merged);
        }
        window.removeEventListener("load", onLoad);
      };
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  // Persist & apply whenever user picks a new accent
  useEffect(() => {
    if (!accent) return;
    document.documentElement.style.setProperty("--color-accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  return [accent, setAccent, accents];
}
