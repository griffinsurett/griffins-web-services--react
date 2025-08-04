// src/hooks/useAccentColor.js
import { useState, useEffect } from 'react';

// only list the *additional* accents here
const OTHER_ACCENTS = [
  '#10b981',
  '#ec4899',
  "#FF5F1F",
  '#f59e0b',
  // …etc…
];

export function useAccentColor() {
  // dynamic list: default from CSS + the extras
  const [accents, setAccents] = useState([]);
  // current selection
  const [accent, setAccent]   = useState("");

  useEffect(() => {
    const root       = document.documentElement;
    // read your default straight from global.css
    const cssDefault = getComputedStyle(root)
      .getPropertyValue('--color-accent')
      .trim();

    // merge into one unique list, default first
    const list = cssDefault
      ? [cssDefault, ...OTHER_ACCENTS.filter(c => c !== cssDefault)]
      : [...OTHER_ACCENTS];

    setAccents(list);

    // pick initial: stored > cssDefault > first extra
    const stored = localStorage.getItem('accent');
    if (stored && list.includes(stored)) {
      setAccent(stored);
    } else if (cssDefault) {
      setAccent(cssDefault);
    } else {
      setAccent(list[0] || "");
    }
  }, []);

  // whenever accent changes, write it back
  useEffect(() => {
    if (!accent) return;
    document.documentElement.style.setProperty('--color-accent', accent);
    localStorage.setItem('accent', accent);
  }, [accent]);

  return [accent, setAccent, accents];
}
