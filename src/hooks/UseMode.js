// hooks/UseMode.jsx
import { useState, useEffect } from 'react';

export function UseMode() {
  // start false (dark), then correct on mount
  const [isLight, setIsLight] = useState(false);

  // 1. On mount, read localStorage or OS and update state
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsLight(true);
    } else if (stored === 'dark') {
      setIsLight(false);
    } else {
      setIsLight(
        window.matchMedia('(prefers-color-scheme: light)').matches
      );
    }
  }, []);

  // 2. Whenever isLight changes, apply to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    const theme = isLight ? 'light' : 'dark';

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [isLight]);

  // 3. Listen for OS-level preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => setIsLight(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return [isLight, setIsLight];
}
