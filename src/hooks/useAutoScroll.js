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
 * Mobile-specific fixes:
 *  - Do NOT pause on mere touchstart (only on meaningful move/long-press).
 *  - Use scrollBy/scrollTo on mobile UAs for more reliable programmatic scroll.
 *  - Watch content size with ResizeObserver; if image height loads late,
 *    we retry starting the animation automatically.
 *
 * Options:
 *  - ref:              React ref to a scrollable element (required)
 *  - active:           boolean — only run when true
 *  - speed:            px per second OR (host) => px/sec
 *  - cycleDuration:    seconds to go from top → bottom (overrides `speed` when > 0)
 *  - loop:             when reaching bottom, reset to top and continue (while active)
 *  - startDelay:       ms before FIRST start each time the item becomes active+visible
 *  - resumeDelay:      ms after disengage (wheel/scroll/touch/click) to resume
 *  - resumeOnUserInput:boolean — if false, do NOT resume after user input
 *  - threshold:        threshold to consider "visible"
 *  - visibleRootMargin:number|string|object — IO rootMargin for early/late inView
 *  - resetOnInactive:  when active=false OR inView=false, snap back to top
 */
export function useAutoScroll({
  ref,
  active = false,
  speed = 40, // px/sec or (host)=>px/sec
  cycleDuration = 0, // seconds; overrides speed when > 0
  loop = false,
  startDelay = 1500,
  resumeDelay = 1200,
  resumeOnUserInput = true, // ✅ allow resume on touch after a short delay
  threshold = 0.3,
  visibleRootMargin = 0,
  resetOnInactive = true,
} = {}) {
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const internalScrollRef = useRef(false); // marks programmatic scrolls
  const startedThisCycleRef = useRef(false); // first start per active+visible cycle?

  const [paused, setPaused] = useState(false); // pause due to user input
  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [contentVersion, setContentVersion] = useState(0); // bump when scrollHeight grows

  // ── UA heuristic for mobile
  const isMobileUA =
    typeof navigator !== "undefined" &&
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");

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
    if (!resumeOnUserInput) return;
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      setResumeScheduled(false);
      setPaused(false);
    }, Math.max(0, resumeDelay));
  }, [resumeDelay, resumeOnUserInput, clearResume]);

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
      if (max <= 0) {
        // nothing to scroll — keep checking until content grows
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const pps = resolvePxPerSecond(host); // px/sec
      const delta = pps * dt;
      const next = host.scrollTop + delta;

      internalScrollRef.current = true; // mark as programmatic

      // ✅ Mobile-friendly programmatic scroll
      try {
        if (isMobileUA && typeof host.scrollBy === "function") {
          const remaining = max - host.scrollTop;
          const stepDelta = Math.min(delta, Math.max(0, remaining));
          host.scrollBy({ top: stepDelta, left: 0, behavior: "auto" });
        } else if (isMobileUA && typeof host.scrollTo === "function") {
          host.scrollTo({ top: Math.min(next, max), left: 0, behavior: "auto" });
        } else {
          host.scrollTop = Math.min(next, max);
        }
      } catch {
        // Fallback
        host.scrollTop = Math.min(next, max);
      }

      // End/loop handling
      if (host.scrollTop >= max - 0.5) {
        if (loop) {
          host.scrollTop = 0;
        } else {
          requestAnimationFrame(() => (internalScrollRef.current = false));
          clearRAF();
          return;
        }
      }

      requestAnimationFrame(() => (internalScrollRef.current = false));
      rafRef.current = requestAnimationFrame(step);
    },
    [ref, resolvePxPerSecond, loop, clearRAF, isMobileUA]
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
    // NOTE: include contentVersion so we retry after image/height growth
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
      host.scrollTop = 0;
      requestAnimationFrame(() => (internalScrollRef.current = false));
      setPaused(false); // clear paused for next cycle
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ✅ CENTRALIZED TOUCH INTERACTION (mobile-safe)
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,

    // IMPORTANT: do NOT pause on mere touchstart (prevents accidental cancel on page scroll)
    onTouchStart: () => {},

    onTouchEnd: () => {
      maybeScheduleResume();
    },

    onTouchMove: (e, data) => {
      // Only pause if they're actually moving significantly *on the element*
      if (data.moved) {
        pauseNow();
      }
    },

    onLongPress: () => {
      pauseNow();
    },

    preventDefaultOnTouch: false,
  });

  // ✅ CENTRALIZED SCROLL INTERACTION
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,

    onScrollActivity: () => {
      // Real user scroll on this element should pause, but we can resume shortly.
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

  // ✅ CENTRALIZED POINTER INTERACTION
  usePointerInteraction({
    elementRef: ref,
    pointerTypes: ["mouse", "pen"],
    clickThreshold: 10,
    longPressDelay: 500,

    onPointerDown: () => {
      pauseNow();
    },

    onPointerUp: () => {
      maybeScheduleResume();
    },

    onPointerMove: (e, data) => {
      if (data.moved) {
        pauseNow();
      }
    },

    onPointerClick: () => {
      pauseNow();
      maybeScheduleResume();
    },

    onPointerLongPress: () => {
      pauseNow();
    },

    preventDefaultOnPointer: false,
  });

  // Watch content height changes (e.g., images finishing load)
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
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
  };
}
