// src/hooks/useAutoScroll.js - FIXED for mobile
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import { 
  useTouchInteraction, 
  useScrollInteraction, 
  usePointerInteraction 
} from "./useInteractions";

/**
 * Auto-scroll a scrollable element while it is active & visible.
 * 🎯 MOBILE FIXED: Now properly handles touch interactions without breaking autoplay
 */
export function useAutoScroll({
  ref,
  active = false,
  speed = 40,           // px/sec or (host)=>px/sec
  cycleDuration = 0,    // seconds; overrides speed when > 0
  loop = false,
  startDelay = 1500,
  resumeDelay = 1200,
  resumeOnUserInput = true, // ✅ CHANGED: default to true for mobile compatibility
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

  // ✅ NEW: Track if user is actively interacting with THIS specific element
  const activelyInteractingRef = useRef(false);

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

  // ✅ FIXED: More selective touch interaction handling
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,
    
    onTouchStart: (e, data) => {
      // ✅ Only pause if the touch is specifically targeting this scrollable element
      const target = e.target;
      const scrollableEl = ref?.current;
      if (scrollableEl && scrollableEl.contains(target)) {
        activelyInteractingRef.current = true;
        pauseNow();
      }
    },
    
    onTouchEnd: (e, data) => {
      // ✅ Only schedule resume if we were actually interacting with this element
      if (activelyInteractingRef.current) {
        activelyInteractingRef.current = false;
        // ✅ Shorter delay for mobile to feel more responsive
        setTimeout(() => {
          maybeScheduleResume();
        }, 300);
      }
    },
    
    onTouchMove: (e, data) => {
      // ✅ Only pause if actively interacting AND moving significantly
      if (activelyInteractingRef.current && data.moved) {
        pauseNow();
      }
    },
    
    onLongPress: (e, data) => {
      // ✅ Only pause for long press if targeting this element
      if (activelyInteractingRef.current) {
        pauseNow();
      }
    },
    
    // Don't prevent default - we want native scroll to work
    preventDefaultOnTouch: false,
  });

  // ✅ IMPROVED: More selective scroll interaction
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef, // ignore our own programmatic scrolls
    wheelSensitivity: 1,
    
    onScrollActivity: (data) => {
      // ✅ Only pause if this is a direct scroll on our element, not page scroll
      if (data.source === 'scroll') {
        // Check if the scroll target is our element or a child
        const scrollableEl = ref?.current;
        if (scrollableEl && document.activeElement && 
            (scrollableEl.contains(document.activeElement) || 
             scrollableEl === document.activeElement)) {
          pauseNow();
          maybeScheduleResume();
        }
      }
    },
    
    onWheelActivity: (data) => {
      // ✅ Wheel events are more intentional, so handle them normally
      pauseNow();
      maybeScheduleResume();
    },
  });

  // ✅ IMPROVED: More selective pointer interaction
  usePointerInteraction({
    elementRef: ref,
    pointerTypes: ['mouse', 'pen'], // handle mouse and pen, but not touch (handled above)
    clickThreshold: 10,
    longPressDelay: 500,
    
    onPointerDown: (e, data) => {
      // ✅ Only pause for mouse/pen if targeting this element
      const target = e.target;
      const scrollableEl = ref?.current;
      if (scrollableEl && scrollableEl.contains(target)) {
        pauseNow();
      }
    },
    
    onPointerUp: (e, data) => {
      maybeScheduleResume();
    },
    
    onPointerMove: (e, data) => {
      // Mouse/pen move while pressed
      if (data.moved) {
        pauseNow();
      }
    },
    
    onPointerClick: (e, data) => {
      // Click (short press without much movement)
      pauseNow();
      maybeScheduleResume();
    },
    
    onPointerLongPress: (e, data) => {
      // Long press with mouse/pen
      pauseNow();
    },
    
    preventDefaultOnPointer: false,
  });

  // ── Cleanup
  useEffect(
    () => () => {
      clearRAF();
      clearStartTimer();
      clearResume();
      activelyInteractingRef.current = false;
    },
    [clearRAF, clearStartTimer, clearResume]
  );

  return { 
    inView, 
    paused, 
    resumeScheduled,
    
    // Additional state for debugging/monitoring
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
  };
}