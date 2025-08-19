// src/hooks/useAutoScroll.js - FIXED FOR MOBILE
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import { 
  useTouchInteraction, 
  useScrollInteraction, 
  usePointerInteraction 
} from "./useInteractions";

/**
 * Auto-scroll a scrollable element while it is active & visible.
 * 🎯 MOBILE FIXED: Now properly handles touch without breaking autoplay
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
} = {}) => {
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const internalScrollRef = useRef(false);   // marks programmatic scrolls
  const startedThisCycleRef = useRef(false); // first start per active+visible cycle?

  const [paused, setPaused] = useState(false); // pause due to user input
  const [resumeScheduled, setResumeScheduled] = useState(false);

  // ✅ NEW: Track if user is actively scrolling vs just touching
  const userScrollingRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

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
      userScrollingRef.current = false; // ✅ Reset user scrolling state
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ✅ FIXED: SMARTER TOUCH INTERACTION
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 15, // ✅ Increased - only pause if they really moved
    longPressDelay: 800, // ✅ Longer delay
    
    onTouchStart: (e, data) => {
      // ✅ Record touch start position and time
      touchStartRef.current = {
        x: data.x,
        y: data.y,
        time: Date.now()
      };
      userScrollingRef.current = false; // Reset scroll state
      // ✅ DON'T pause immediately - wait to see if they actually scroll
    },
    
    onTouchMove: (e, data) => {
      // ✅ Only pause if they're actually scrolling (moved significantly in Y direction)
      if (data.moved && Math.abs(data.deltaY) > 10) {
        if (!userScrollingRef.current) {
          userScrollingRef.current = true;
          pauseNow();
        }
      }
    },
    
    onTouchEnd: (e, data) => {
      const touchDuration = Date.now() - touchStartRef.current.time;
      
      // ✅ Only try to resume if user was actually scrolling
      if (userScrollingRef.current) {
        maybeScheduleResume();
      }
      // ✅ For quick taps (under 200ms, no movement), don't pause at all
      else if (touchDuration < 200 && !data.moved) {
        // This was just a quick tap, don't interfere with auto-scroll
        return;
      }
      
      userScrollingRef.current = false;
    },
    
    onLongPress: (e, data) => {
      // ✅ Long press definitely pauses (user is likely selecting text)
      pauseNow();
    },
    
    // Don't prevent default - we want native scroll to work
    preventDefaultOnTouch: false,
  });

  // ✅ CENTRALIZED SCROLL INTERACTION (unchanged - this works fine)
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef, // ignore our own programmatic scrolls
    wheelSensitivity: 1,
    
    onScrollActivity: (data) => {
      pauseNow();
      maybeScheduleResume();
    },
    
    onScrollStart: (data) => {
      pauseNow();
    },
    
    onScrollEnd: (data) => {
      maybeScheduleResume();
    },
    
    onWheelActivity: (data) => {
      pauseNow();
      maybeScheduleResume();
    },
  });

  // ✅ CENTRALIZED POINTER INTERACTION (unchanged - this works fine)
  usePointerInteraction({
    elementRef: ref,
    pointerTypes: ['mouse', 'pen'], // handle mouse and pen, but not touch (handled above)
    clickThreshold: 10,
    longPressDelay: 500,
    
    onPointerDown: (e, data) => {
      pauseNow();
    },
    
    onPointerUp: (e, data) => {
      maybeScheduleResume();
    },
    
    onPointerMove: (e, data) => {
      if (data.moved) {
        pauseNow();
      }
    },
    
    onPointerClick: (e, data) => {
      pauseNow();
      maybeScheduleResume();
    },
    
    onPointerLongPress: (e, data) => {
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