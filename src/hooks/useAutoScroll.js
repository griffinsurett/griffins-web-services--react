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
 * - Cancel RAF immediately on user engagement.
 * - Resume only after interaction ends + resumeDelay.
 * - Programmatic guard so our own scroll events don't look like user input.
 * - Sub-pixel accumulator, dt clamp, ResizeObserver retry.
 * - No UA sniffing; single scrollTo path with fallback.
 */
export function useAutoScroll({
  ref,
  active = false,
  speed = 40,           // px/sec or (host)=>px/sec
  cycleDuration = 0,    // seconds; overrides speed when > 0
  loop = false,
  startDelay = 1500,
  resumeDelay = 900,
  resumeOnUserInput = true,
  threshold = 0.3,
  visibleRootMargin = 0,
  resetOnInactive = true,
} = {}) {
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  // Flags/accumulators
  const internalScrollRef = useRef(false);         // ignore our own scrolls
  const programmaticUnsetTimerRef = useRef(null);  // delayed unset for mobile
  const userInteractingRef = useRef(false);        // true during user control
  const startedThisCycleRef = useRef(false);
  const floatTopRef = useRef(0);                   // sub-pixel accumulator

  // "paused" as state + ref (so step() sees it synchronously)
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

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

  // Keep the “programmatic” guard up long enough for deferred scroll events
  const setProgrammaticGuard = useCallback((ms = 220) => {
    internalScrollRef.current = true;
    if (programmaticUnsetTimerRef.current) {
      clearTimeout(programmaticUnsetTimerRef.current);
    }
    programmaticUnsetTimerRef.current = setTimeout(() => {
      internalScrollRef.current = false;
      programmaticUnsetTimerRef.current = null;
    }, ms);
  }, []);

  // Immediate pause that also stops the RAF loop
  const pauseNow = useCallback(() => {
    setPaused(true);
    pausedRef.current = true;
    clearResume();
    clearRAF();               // 🔴 stop the animation right away
  }, [clearRAF, clearResume]);

  // Resume logic (only if user is not interacting)
  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return;
    if (userInteractingRef.current) return;
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      if (!userInteractingRef.current) {
        setResumeScheduled(false);
        setPaused(false);
        pausedRef.current = false;
        // restart immediately if still active & in view
        if (ref?.current && active && inView) {
          startNow();
        }
      }
    }, Math.max(0, resumeDelay));
  }, [resumeDelay, resumeOnUserInput, active, inView]);

  const step = useCallback(
    (ts) => {
      // bail out if paused (extra safety)
      if (pausedRef.current) return;

      const host = ref?.current;
      if (!host) return;

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      const dtClamped = Math.min(0.05, Math.max(0, dt)); // <= 50ms/frame

      const max = Math.max(0, host.scrollHeight - host.clientHeight);
      if (max <= 0) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (floatTopRef.current === 0 && host.scrollTop > 0) {
        floatTopRef.current = host.scrollTop;
      }

      const pps = resolvePxPerSecond(host);
      const delta = pps * dtClamped;
      floatTopRef.current = Math.min(max, floatTopRef.current + delta);

      setProgrammaticGuard(); // mark this scroll as ours

      try {
        // Single path (no UA sniff). Fallback if needed.
        host.scrollTo({ top: floatTopRef.current, left: 0, behavior: "auto" });
      } catch {
        host.scrollTop = Math.floor(floatTopRef.current);
      }

      if (floatTopRef.current >= max - 0.5) {
        if (loop) {
          floatTopRef.current = 0;
          try { host.scrollTo({ top: 0, left: 0, behavior: "auto" }); }
          catch { host.scrollTop = 0; }
        } else {
          clearRAF();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [ref, resolvePxPerSecond, loop, clearRAF, setProgrammaticGuard]
  );

  const startNow = useCallback(() => {
    clearRAF();
    const host = ref?.current;
    if (host) {
      floatTopRef.current = host.scrollTop || 0;
      startedThisCycleRef.current = true;
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step, ref, clearRAF]);

  // Start/stop with a delayed first start per active+visible cycle
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

  // Reset when inactive/out-of-view
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
      userInteractingRef.current = false;
      setPaused(false);
      pausedRef.current = false;
      floatTopRef.current = 0;
      try { host.scrollTo({ top: 0, left: 0, behavior: "auto" }); }
      catch { host.scrollTop = 0; }
      requestAnimationFrame(() => (internalScrollRef.current = false));
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ======= INPUT HANDLERS =======

  // TOUCH
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,

    onTouchStart: () => {
      userInteractingRef.current = true;
      pauseNow();           // 🔴 stop RAF immediately
    },

    onTouchMove: (e, data) => {
      if (data.moved) {
        userInteractingRef.current = true;
        // already paused; nothing else needed
      }
    },

    onTouchEnd: () => {
      userInteractingRef.current = false;
      scheduleResume();
    },

    onLongPress: () => {
      userInteractingRef.current = true;
      pauseNow();
    },

    preventDefaultOnTouch: false,
  });

  // SCROLL
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,

    onScrollStart: () => {
      userInteractingRef.current = true;
      pauseNow();
    },
    onScrollActivity: () => {
      userInteractingRef.current = true;
    },
    onWheelActivity: () => {
      userInteractingRef.current = true;
      pauseNow();
    },
    onScrollEnd: () => {
      userInteractingRef.current = false;
      scheduleResume();
    },
  });

  // POINTER (mouse/pen)
  usePointerInteraction({
    elementRef: ref,
    pointerTypes: ["mouse", "pen"],
    clickThreshold: 10,
    longPressDelay: 500,

    onPointerDown: () => {
      userInteractingRef.current = true;
      pauseNow();
    },
    onPointerMove: (e, data) => {
      if (data.moved) userInteractingRef.current = true;
    },
    onPointerUp: () => {
      userInteractingRef.current = false;
      scheduleResume();
    },
    onPointerClick: () => {
      userInteractingRef.current = false;
      scheduleResume();
    },
    onPointerLongPress: () => {
      userInteractingRef.current = true;
      pauseNow();
    },

    preventDefaultOnPointer: false,
  });

  // Watch content height changes (e.g., images loading)
  useEffect(() => {
    const el = ref?.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastMax = Math.max(0, el.scrollHeight - el.clientHeight);
    const ro = new ResizeObserver(() => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      if (max > lastMax + 1) {
        lastMax = max;
        setContentVersion((v) => v + 1);
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
      userInteractingRef.current = false;
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
