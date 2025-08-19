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
 * - Cancels RAF immediately on user engagement (touch/pointer/scroll start)
 * - Resumes only after interaction ends + resumeDelay
 * - Ignores our own programmatic scroll events (guard window)
 * - Sub-pixel accumulator + dt clamp for smoothness
 * - Retries start when content height grows (images)
 * - No UA sniffing (single scrollTo path with fallback)
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
  // ---- internals
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const internalScrollRef = useRef(false);         // guard: programmatic scrolls
  const programmaticUnsetTimerRef = useRef(null);  // delayed unset for mobile ordering
  const userInteractingRef = useRef(false);        // true while user is acting
  const startedThisCycleRef = useRef(false);
  const floatTopRef = useRef(0);                   // sub-pixel accumulator

  // state + ref so step() sees "paused" synchronously
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false); // for debug panel only
  const [contentVersion, setContentVersion] = useState(0);

  // ---- Intersection visibility
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

  // ---- speed resolver
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

  // ---- helpers
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

  // keep guard true a bit longer so deferred scroll events don't look like user input
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

  // hard pause: flip state + cancel RAF
  const pauseNow = useCallback(() => {
    setPaused(true);
    pausedRef.current = true;
    clearResume();
    clearRAF(); // 🔴 stop immediately
  }, [clearRAF, clearResume]);

  const step = useCallback(
    (ts) => {
      // extra safety: do nothing if paused or no longer active/inView
      if (pausedRef.current || !active || !inView) return;

      const host = ref?.current;
      if (!host) return;

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      const dtClamped = Math.min(0.05, Math.max(0, dt)); // <= 50ms

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
    [ref, active, inView, resolvePxPerSecond, loop, clearRAF, setProgrammaticGuard]
  );

  const startNow = useCallback(() => {
    clearRAF();
    const host = ref?.current;
    if (host) {
      floatTopRef.current = host.scrollTop || 0;
      startedThisCycleRef.current = true;
      pausedRef.current = false;
      setPaused(false);
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step, ref, clearRAF]);

  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return;
    if (userInteractingRef.current) return;
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      if (!userInteractingRef.current) {
        setResumeScheduled(false);
        startNow(); // restart immediately if still active/inView
      }
    }, Math.max(0, resumeDelay));
  }, [resumeOnUserInput, resumeDelay, startNow, clearResume]);

  // ---- start/stop lifecycle
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
  }, [active, inView, paused, startDelay, startNow, clearRAF, clearStartTimer, contentVersion]);

  // reset when inactive/out of view
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
      setUserEngaged(false);
      pausedRef.current = false;
      setPaused(false);
      floatTopRef.current = 0;
      try { host.scrollTo({ top: 0, left: 0, behavior: "auto" }); }
      catch { host.scrollTop = 0; }
      requestAnimationFrame(() => (internalScrollRef.current = false));
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ======= INPUT HANDLERS (ALL in the hook) =======

  // touch
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,
    onTouchStart: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onTouchMove: (e, data) => { if (data.moved) { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); } },
    onTouchEnd: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
    onLongPress: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    preventDefaultOnTouch: false,
  });

  // scroll (including wheel)
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,
    onScrollStart: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onScrollActivity: () => { userInteractingRef.current = true; setUserEngaged(true); },
    onWheelActivity: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onScrollEnd: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
  });

  // pointer (mouse/pen)
  usePointerInteraction({
    elementRef: ref,
    pointerTypes: ["mouse", "pen"],
    clickThreshold: 10,
    longPressDelay: 500,
    onPointerDown: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onPointerMove: (e, data) => { if (data.moved) { userInteractingRef.current = true; setUserEngaged(true); } },
    onPointerUp: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
    onPointerClick: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
    onPointerLongPress: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    preventDefaultOnPointer: false,
  });

  // height growth (late images)
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

  // cleanup
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
      setUserEngaged(false);
    },
    [clearRAF, clearStartTimer, clearResume]
  );

  // optional on-demand metrics for debugging
  const metrics = useCallback(() => {
    const host = ref?.current;
    const max = host ? Math.max(0, host.scrollHeight - host.clientHeight) : 0;
    const top = host ? host.scrollTop : 0;
    const progress = max > 0 ? top / max : 0;
    return {
      top,
      max,
      progress,                  // 0..1
      animating: !!rafRef.current,
      engaged: userInteractingRef.current,
      started: startedThisCycleRef.current,
      internalGuard: internalScrollRef.current,
    };
  }, [ref]);

  // public API (no imperative calls required by the component)
  return {
    inView,
    paused,
    resumeScheduled,
    engaged: userEngaged,        // mirrors userInteractingRef for UI
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
    // optional debug helpers:
    metrics,
  };
}
