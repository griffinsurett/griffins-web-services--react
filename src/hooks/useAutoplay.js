// src/hooks/useAutoplay.js
import { useEffect, useRef, useCallback } from "react";

/**
 * Very small hook: advances an index on an interval.
 * No pause, no resume, no engagement awareness.
 */
export default function useAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  interval = 4000,
  loop = true,
  enabled = true,
}) {
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    if (totalItems <= 1) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalItems) {
      setIndex(loop ? 0 : totalItems - 1);
    } else {
      setIndex(nextIndex);
    }
  }, [currentIndex, setIndex, totalItems, loop]);

  const schedule = useCallback(() => {
    clearTimer();
    if (enabled && totalItems > 1) {
      timerRef.current = setTimeout(advance, interval);
    }
  }, [enabled, totalItems, interval, advance, clearTimer]);

  useEffect(() => {
    schedule();
    return clearTimer;
  }, [schedule, clearTimer]);

  return { schedule, clearTimer, advance };
}
