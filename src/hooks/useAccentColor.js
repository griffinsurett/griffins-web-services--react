// src/hooks/useAccentColor.js
import { useEffect, useState } from "react";

/** Parse a CSS list that may be comma OR space separated */
function parseCssList(val) {
  return (val || "")
    .split(/[, \n\r\t]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

/** Return a deduped array preserving first occurrence */
function dedupe(list) {
  const seen = new Set();
  return list.filter(c => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
}

export function useAccentColor() {
  const [accents, setAccents] = useState([]);
  const [accent, setAccent] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    // 1) Get default + list from CSS
    const cssDefault = styles.getPropertyValue("--color-accent").trim();
    const optionsRaw = styles.getPropertyValue("--accent-options").trim();

    // 2) Build list (CSS-only). If none provided, fall back to just the default.
    let list = parseCssList(optionsRaw);
    if (!list.length && cssDefault) list = [cssDefault];
    list = dedupe(list);

    setAccents(list);

    // 3) Pick initial: localStorage > CSS default > first option
    const stored = localStorage.getItem("accent");
    const initial =
      (stored && list.includes(stored) && stored) ||
      (cssDefault && list.includes(cssDefault) && cssDefault) ||
      list[0] ||
      "";

    if (initial) {
      setAccent(initial);
      // Ensure the DOM reflects the initial (if different from cssDefault)
      if (initial !== cssDefault) {
        root.style.setProperty("--color-accent", initial);
      }
    }
  }, []);

  // 4) Whenever accent changes, update CSS var + persist
  useEffect(() => {
    if (!accent) return;
    const root = document.documentElement;
    root.style.setProperty("--color-accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  return [accent, setAccent, accents];
}
