// src/hooks/useAutoScroll.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import {
  useTouchInteraction,
  useScrollInteraction,
  usePointerInteraction,
} from "./useInteractions";

/**
 * Auto-scroll a scrollable element while it is active & visible.
 *
 * Mobile fixes:
 *  - Do NOT pause on mere touchstart (only on real move/long-press).
 *  - Keep a "programmatic" guard TRUE slightly longer so our own scroll
 *    events don't look like user input (prevents the "tiny nudge then stop").
 *  - Use a floating accumulator for sub-pixel deltas (smoother on iOS).
 *  - Retry start when content height grows (image loading).
 */
export function useAutoScroll({
  ref,
  active = false,
  speed = 40,           // px/sec or (host)=>px/sec
  cycleDuration = 0,    // seconds; overrides speed when > 0
  loop = false,
  startDelay = 1500,
  resumeDelay = 1000,
  resumeOnUserInput = true,  // allow resume after incidental touches
  threshold = 0.3,
  visibleRootMargin = 0,
  resetOnInactive = true,
} = {}) {
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  // Guard to mark our own programmatic scrolls so interaction hooks ignore them
  const internalScrollRef = useRef(false);
  const programmaticUnsetTimerRef = useRef(null);

  const startedThisCycleRef = useRef(false);
  const floatTopRef = useRef(0); // sub-pixel accumulator

  const [paused, setPaused] = useState(false);
  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  const isMobileUA =
    typeof navigator !== "undefined" &&
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");

  // ── normalize IO rootMargin
  const toPx = (v) => (typeof v === "number" ? `${v}px` : `${v}`);
  const rootMargin = useMemo(() => {
    if (typeof visibleRootMargin === "number") {
      const n = Math.max(0, visibleRootMargin | 0);
      return `-${n}px 0px -${n}px 0px`;
    }
    if (visibleRootMargin && typeof visibleRootMargin === "object") {
      const { top = 0, right = 0, bottom = 0, left = 0 } = visibleRootMargin;
      return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
    }
    return visibleRootMargin || "0px";
  }, [visibleRootMargin]);

  // ── visibility via our hook
  const inView = useVisibility(ref, { threshold, rootMargin });

  const resolvePxPerSecond = useCallback(
    (host) => {
      if (!host) return 0;
      if (cycleDuration && cycleDuration > 0) {
        const max = Math.max(0, host.scrollHeight - host.clientHeight);
        return max > 0 ? max / cycleDuration : 0;
      }
      return typeof speed === "function"
        ? Math.max(1, speed(host))
        : Number(speed) || 0;
    },
    [speed, cycleDuration]
  );

  const clearRAF = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = 0;
  }, []);

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    startTimerRef.current = null;
  }, []);

  const clearResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
    setResumeScheduled(false);
  }, []);

  const setProgrammaticGuard = useCallback((ms = 220) => {
    // Keep the guard true long enough to cover async scroll events on mobile
    internalScrollRef.current = true;
    if (programmaticUnsetTimerRef.current) {
      clearTimeout(programmaticUnsetTimerRef.current);
    }
    programmaticUnsetTimerRef.current = setTimeout(() => {
      internalScrollRef.current = false;
      programmaticUnsetTimerRef.current = null;
    }, ms);
  }, []);

  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return;
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      setResumeScheduled(false);
      setPaused(false);
    }, Math.max(0, resumeDelay));
  }, [resumeDelay, resumeOnUserInput, clearResume]);

  // ── Centralized pause/resume handlers
  const pauseNow = useCallback(() => {
    setPaused(true);
    clearResume();
  }, [clearResume]);

  const maybeScheduleResume = useCallback(() => {
    if (resumeOnUserInput) {
      scheduleResume();
    }
  }, [resumeOnUserInput, scheduleResume]);

  const step = useCallback(
    (ts) => {
      const host = ref?.current;
      if (!host) return;

      // dt with clamp to avoid big jumps after tab-throttle
      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      const dtClamped = Math.min(0.05, Math.max(0, dt)); // up to 50ms/frame

      const max = Math.max(0, host.scrollHeight - host.clientHeight);
      if (max <= 0) {
        // Nothing to scroll yet; keep checking (image might still load)
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      // Initialize accumulator to current position if first frame
      if (floatTopRef.current === 0 && host.scrollTop > 0) {
        floatTopRef.current = host.scrollTop;
      }

      const pps = resolvePxPerSecond(host); // px/sec
      const delta = pps * dtClamped;
      floatTopRef.current = Math.min(max, floatTopRef.current + delta);

      setProgrammaticGuard(); // mark outbound scroll as ours

      try {
        if (isMobileUA && typeof host.scrollTo === "function") {
          host.scrollTo({ top: floatTopRef.current, left: 0, behavior: "auto" });
        } else {
          host.scrollTop = floatTopRef.current;
        }
      } catch {
        host.scrollTop = Math.floor(floatTopRef.current);
      }

      if (floatTopRef.current >= max - 0.5) {
        if (loop) {
          floatTopRef.current = 0;
          try {
            host.scrollTo({ top: 0, left: 0, behavior: "auto" });
          } catch {
            host.scrollTop = 0;
          }
        } else {
          clearRAF();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [ref, resolvePxPerSecond, loop, clearRAF, isMobileUA, setProgrammaticGuard]
  );

  const startNow = useCallback(() => {
    clearRAF();
    const host = ref?.current;
    if (host) {
      // reset accumulator to actual top
      floatTopRef.current = host.scrollTop || 0;
      startedThisCycleRef.current = true;
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step, ref, clearRAF]);

  // ── Start/stop with delayed *first* start per active+visible cycle
  useEffect(() => {
    clearRAF();
    clearStartTimer();

    if (active && inView && !paused) {
      if (!startedThisCycleRef.current) {
        startTimerRef.current = setTimeout(() => {
          if (active && inView && !paused) startNow();
        }, Math.max(0, startDelay));
      } else {
        startNow();
      }
    }

    return () => {
      clearRAF();
      clearStartTimer();
    };
    // include contentVersion so we retry after images grow height
  }, [
    active,
    inView,
    paused,
    startDelay,
    startNow,
    clearRAF,
    clearStartTimer,
    contentVersion,
  ]);

  // ── Reset to top when item becomes inactive or out of view
  useEffect(() => {
    if (!resetOnInactive) return;
    const host = ref?.current;
    if (!host) return;

    if (!active || !inView) {
      startedThisCycleRef.current = false;
      clearRAF();
      clearResume();
      clearStartTimer();
      internalScrollRef.current = true;
      floatTopRef.current = 0;
      try {
        host.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
        host.scrollTop = 0;
      }
      requestAnimationFrame(() => (internalScrollRef.current = false));
      setPaused(false);
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ✅ TOUCH: don't pause on *start*, only on real move/long-press
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,
    onTouchStart: () => {}, // IMPORTANT: no pause here
    onTouchEnd: () => {
      maybeScheduleResume();
    },
    onTouchMove: (e, data) => {
      if (data.moved) pauseNow();
    },
    onLongPress: () => {
      pauseNow();
    },
    preventDefaultOnTouch: false,
  });

  // ✅ SCROLL: respect internal programmatic guard
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,
    onScrollActivity: () => {
      pauseNow();
      maybeScheduleResume();
    },
    onScrollStart: () => {
      pauseNow();
    },
    onScrollEnd: () => {
      maybeScheduleResume();
    },
    onWheelActivity: () => {
      pauseNow();
      maybeScheduleResume();
    },
  });

  // ✅ POINTER
  usePointerInteraction({
    elementRef: ref,
    pointerTypes: ["mouse", "pen"],
    clickThreshold: 10,
    longPressDelay: 500,
    onPointerDown: () => pauseNow(),
    onPointerUp: () => maybeScheduleResume(),
    onPointerMove: (e, data) => {
      if (data.moved) pauseNow();
    },
    onPointerClick: () => {
      pauseNow();
      maybeScheduleResume();
    },
    onPointerLongPress: () => pauseNow(),
    preventDefaultOnPointer: false,
  });

  // Watch content height changes (e.g., images loading in)
  useEffect(() => {
    const el = ref?.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastMax = Math.max(0, el.scrollHeight - el.clientHeight);

    const ro = new ResizeObserver(() => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      if (max > lastMax + 1) {
        lastMax = max;
        setContentVersion((v) => v + 1); // trigger restart attempt
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  // Cleanup
  useEffect(
    () => () => {
      clearRAF();
      clearStartTimer();
      clearResume();
      if (programmaticUnsetTimerRef.current) {
        clearTimeout(programmaticUnsetTimerRef.current);
        programmaticUnsetTimerRef.current = null;
      }
    },
    [clearRAF, clearStartTimer, clearResume]
  );

  return {
    inView,
    paused,
    resumeScheduled,
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
  };
}
