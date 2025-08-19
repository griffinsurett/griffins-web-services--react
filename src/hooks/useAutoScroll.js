// src/hooks/useAutoScroll.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import { useTouchInteraction, useScrollInteraction } from "./useInteractions";

/**
 * Auto-scroll a scrollable element while it is active & visible.
 * Now uses centralized interaction hooks for better maintainability.
 *
 * Options:
 *  - ref:              React ref to a scrollable element (required)
 *  - active:           boolean — only run when true
 *  - speed:            px per second OR (host) => px/sec
 *  - cycleDuration:    seconds to go from top → bottom (overrides `speed` when > 0)
 *  - loop:             when reaching bottom, reset to top and continue (while active)
 *  - startDelay:       ms before FIRST start each time the item becomes active+visible
 *  - resumeDelay:      ms after disengage (wheel/scroll/touch/click) to resume
 *  - resumeOnUserInput:boolean — if false, do NOT resume after user input (default false)
 *  - threshold:        threshold to consider "visible"
 *  - visibleRootMargin:number|string|object — IO rootMargin for early/late inView
 *  - resetOnInactive:  when active=false OR inView=false, snap back to top
 */
export function useAutoScroll({
  ref,
  active = false,
  speed = 40,           // px/sec or (host)=>px/sec
  cycleDuration = 0,    // seconds; overrides speed when > 0
  loop = false,
  startDelay = 1500,
  resumeDelay = 1200,
  resumeOnUserInput = false,
  threshold = 0.3,
  visibleRootMargin = 0,   // control the visible band using IO rootMargin
  resetOnInactive = true,
} = {}) {
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const internalScrollRef = useRef(false);   // marks programmatic scrolls
  const startedThisCycleRef = useRef(false); // first start per active+visible cycle?

  const [paused, setPaused] = useState(false); // pause due to user input
  const [resumeScheduled, setResumeScheduled] = useState(false);

  // ── normalize IO rootMargin
  const toPx = (v) => (typeof v === "number" ? `${v}px` : `${v}`);
  const rootMargin = useMemo(() => {
    if (typeof visibleRootMargin === "number") {
      const n = Math.max(0, visibleRootMargin | 0);
      return `-${n}px 0px -${n}px 0px`; // shrink top & bottom by N
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

  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return; // respect no-resume mode
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      setResumeScheduled(false);
      setPaused(false);
      // After resume, start immediately (no extra startDelay).
    }, resumeDelay);
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

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000; // seconds
      lastTsRef.current = ts;

      const max = Math.max(0, host.scrollHeight - host.clientHeight);
      if (max <= 0) return; // nothing to scroll

      const pps = resolvePxPerSecond(host); // px/sec
      const next = host.scrollTop + pps * dt;

      internalScrollRef.current = true; // mark as programmatic
      if (next >= max) {
        if (loop) {
          host.scrollTop = 0;
        } else {
          host.scrollTop = max;
          requestAnimationFrame(() => (internalScrollRef.current = false));
          clearRAF();
          return;
        }
      } else {
        host.scrollTop = next;
      }
      requestAnimationFrame(() => (internalScrollRef.current = false));

      rafRef.current = requestAnimationFrame(step);
    },
    [ref, resolvePxPerSecond, loop, clearRAF]
  );

  const startNow = useCallback(() => {
    clearRAF();
    if (ref?.current) {
      startedThisCycleRef.current = true;
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step, ref, clearRAF]);

  // ── Start/stop with a delayed *first* start per active+visible cycle
  useEffect(() => {
    clearRAF();
    clearStartTimer();

    if (active && inView && !paused) {
      if (!startedThisCycleRef.current) {
        startTimerRef.current = setTimeout(() => {
          if (active && inView && !paused) startNow();
        }, Math.max(0, startDelay));
      } else {
        startNow(); // already started once this cycle — no extra delay
      }
    }

    return () => {
      clearRAF();
      clearStartTimer();
    };
  }, [active, inView, paused, startDelay, startNow, clearRAF, clearStartTimer]);

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
      host.scrollTop = 0;
      requestAnimationFrame(() => (internalScrollRef.current = false));
      setPaused(false); // clear paused for next cycle
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ✅ CENTRALIZED TOUCH INTERACTION
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8, // smaller threshold for scroll elements
    onTouchStart: (e, data) => {
      pauseNow();
    },
    onTouchEnd: (e, data) => {
      maybeScheduleResume();
    },
    onTouchMove: (e, data) => {
      // Only pause if they're actually moving significantly
      if (data.moved) {
        pauseNow();
      }
    },
    // Don't prevent default - we want native scroll to work
    preventDefaultOnTouch: false,
  });

  // ✅ CENTRALIZED SCROLL INTERACTION
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5, // sensitive to small scroll movements
    debounceDelay: 100, // quick response
    trustedOnly: true,
    internalFlagRef: internalScrollRef, // ignore our own programmatic scrolls
    
    onScrollActivity: (data) => {
      // Any real user scroll should pause
      pauseNow();
      maybeScheduleResume();
    },
    
    onScrollStart: (data) => {
      // User started scrolling
      pauseNow();
    },
    
    onScrollEnd: (data) => {
      // User finished scrolling - maybe resume
      maybeScheduleResume();
    },
  });

  // ── Additional pointer events for mouse interactions
  useEffect(() => {
    const host = ref?.current;
    if (!host) return;

    // These handle mouse-specific interactions that aren't covered by touch/scroll
    const onPointerDown = (e) => {
      // Only handle mouse events (not touch, which is handled above)
      if (e.pointerType === 'mouse') {
        pauseNow();
      }
    };

    const onPointerUp = (e) => {
      if (e.pointerType === 'mouse') {
        maybeScheduleResume();
      }
    };

    // Handle mouse wheel separately from scroll (for immediate response)
    const onWheel = (e) => {
      if (!e.isTrusted) return;
      pauseNow();
      maybeScheduleResume();
    };

    host.addEventListener("pointerdown", onPointerDown, { passive: true });
    host.addEventListener("pointerup", onPointerUp, { passive: true });
    host.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("wheel", onWheel);
    };
  }, [ref, pauseNow, maybeScheduleResume]);

  // ── Cleanup
  useEffect(
    () => () => {
      clearRAF();
      clearStartTimer();
      clearResume();
    },
    [clearRAF, clearStartTimer, clearResume]
  );

  return { inView, paused, resumeScheduled };
}