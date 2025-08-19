import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import {
  useTouchInteraction,
  useScrollInteraction,
  usePointerInteraction,
} from "./useInteractions";

/**
 * Auto-scroll a scrollable element while it is active & visible.
 * Fixes:
 *  - Mobile: pause immediately on finger move (raw touch listeners).
 *  - Desktop: pause on wheel, trackpad, and scrollbar drag.
 *  - Resume: after resumeDelay AND a quiet period (idleQuietMs) after momentum.
 *  - Single-frame guard so user scrolls aren't masked by our own scrollTo().
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
  idleQuietMs = 160,    // extra quiet time after last user input before resume
} = {}) {
  // ---- internals
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  // programmatic scroll guard (single frame)
  const internalScrollRef = useRef(false);
  const internalUnsetRafRef = useRef(null);

  // interaction & state
  const userInteractingRef = useRef(false);
  const lastUserInputAtRef = useRef(0);
  const startedThisCycleRef = useRef(false);
  const floatTopRef = useRef(0);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  // ---- IO rootMargin
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

  // ---- speed
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

  // single-frame programmatic guard
  const markProgrammaticScroll = useCallback(() => {
    internalScrollRef.current = true;
    if (internalUnsetRafRef.current) {
      cancelAnimationFrame(internalUnsetRafRef.current);
      internalUnsetRafRef.current = null;
    }
    internalUnsetRafRef.current = requestAnimationFrame(() => {
      internalScrollRef.current = false;
      internalUnsetRafRef.current = null;
    });
  }, []);

  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  // hard pause: flip state + cancel RAF
  const pauseNow = useCallback(() => {
    setPaused(true);
    pausedRef.current = true;
    clearResume();
    clearRAF();
  }, [clearRAF, clearResume]);

  const step = useCallback(
    (ts) => {
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

      markProgrammaticScroll();
      try { host.scrollTo({ top: floatTopRef.current, left: 0, behavior: "auto" }); }
      catch { host.scrollTop = Math.floor(floatTopRef.current); }

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
    [ref, active, inView, resolvePxPerSecond, loop, clearRAF, markProgrammaticScroll]
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
    // ensure both resumeDelay AND idleQuietMs after last user input
    clearResume();
    setResumeScheduled(true);
    const scheduledAt = now();

    resumeTimerRef.current = setTimeout(() => {
      const sinceInput = now() - lastUserInputAtRef.current;
      if (!userInteractingRef.current && sinceInput >= idleQuietMs) {
        setResumeScheduled(false);
        startNow(); // restart inner autoscroll (carousel autoplay logic stays separate)
      } else {
        // not quiet yet; retry until quiet
        scheduleResume();
      }
    }, Math.max(0, resumeDelay));
  }, [resumeOnUserInput, resumeDelay, idleQuietMs, startNow, clearResume]);

  // ---- lifecycle
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

  useEffect(() => {
    if (!resetOnInactive) return;
    const host = ref?.current;
    if (!host) return;

    if (!active || !inView) {
      startedThisCycleRef.current = false;
      clearRAF();
      clearResume();
      clearStartTimer();
      internalScrollRef.current = false;
      userInteractingRef.current = false;
      setUserEngaged(false);
      pausedRef.current = false;
      setPaused(false);
      floatTopRef.current = 0;
      try { host.scrollTo({ top: 0, left: 0, behavior: "auto" }); }
      catch { host.scrollTop = 0; }
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer]);

  // ======= INPUT HANDLERS =======

  // 1) Raw touch listeners (mobile belt & suspenders)
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const markInput = () => { lastUserInputAtRef.current = now(); };

    const onTouchStart = () => {
      markInput();
      userInteractingRef.current = true;
      setUserEngaged(true);
      pauseNow();
    };
    const onTouchMove = () => {
      markInput();
      userInteractingRef.current = true;
      setUserEngaged(true);
      if (!pausedRef.current) pauseNow();
    };
    const onTouchEnd = () => {
      markInput();
      userInteractingRef.current = false;
      setUserEngaged(false);
      scheduleResume();
    };
    const onTouchCancel = onTouchEnd;

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [ref, pauseNow, scheduleResume]);

  // 2) Your abstraction (kept) – lower thresholds for trackpads
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 1,
    debounceDelay: 80,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,
    onScrollStart: () => {
      lastUserInputAtRef.current = now();
      userInteractingRef.current = true; setUserEngaged(true); pauseNow();
    },
    onScrollActivity: () => {
      lastUserInputAtRef.current = now();
      userInteractingRef.current = true; setUserEngaged(true);
    },
    onWheelActivity: () => {
      lastUserInputAtRef.current = now();
      userInteractingRef.current = true; setUserEngaged(true); pauseNow();
    },
    onScrollEnd: () => {
      lastUserInputAtRef.current = now();
      userInteractingRef.current = false; setUserEngaged(false); scheduleResume();
    },
  });

  // 3) Raw wheel/scroll listeners (covers scrollbar + any missed paths)
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    let scrollEndT = null;

    const markInput = () => { lastUserInputAtRef.current = now(); };

    const onWheel = () => {
      markInput();
      userInteractingRef.current = true; setUserEngaged(true); pauseNow();
      // wheel end -> handled by scrollEnd too
    };

    const onScroll = () => {
      if (internalScrollRef.current) return; // ignore our own scroll this frame
      markInput();
      userInteractingRef.current = true; setUserEngaged(true); if (!pausedRef.current) pauseNow();
      if (scrollEndT) clearTimeout(scrollEndT);
      scrollEndT = setTimeout(() => {
        markInput();
        userInteractingRef.current = false; setUserEngaged(false); scheduleResume();
      }, idleQuietMs);
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      if (scrollEndT) clearTimeout(scrollEndT);
    };
  }, [ref, pauseNow, scheduleResume, idleQuietMs]);

  // height growth (images)
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
      if (internalUnsetRafRef.current) {
        cancelAnimationFrame(internalUnsetRafRef.current);
        internalUnsetRafRef.current = null;
      }
      internalScrollRef.current = false;
      userInteractingRef.current = false;
      setUserEngaged(false);
    },
    [clearRAF, clearStartTimer, clearResume]
  );

  // debug metrics
  const metrics = useCallback(() => {
    const host = ref?.current;
    const max = host ? Math.max(0, host.scrollHeight - host.clientHeight) : 0;
    const top = host ? host.scrollTop : 0;
    const progress = max > 0 ? top / max : 0;
    return {
      top,
      max,
      progress,
      animating: !!rafRef.current,
      engaged: userInteractingRef.current,
      started: startedThisCycleRef.current,
      internalGuard: internalScrollRef.current,
      lastUserInputAt: lastUserInputAtRef.current,
    };
  }, [ref]);

  return {
    inView,
    paused,
    resumeScheduled,
    engaged: userEngaged,
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
    metrics,
  };
}
