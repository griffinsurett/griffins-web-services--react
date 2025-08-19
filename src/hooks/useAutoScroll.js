// src/hooks/useAutoScroll.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import {
  useTouchInteraction,
  useScrollInteraction,
  usePointerInteraction,
} from "./useInteractions";

export function useAutoScroll({
  ref,
  active = false,
  speed = 40,
  cycleDuration = 0,
  loop = false,
  startDelay = 1500,
  resumeDelay = 900,
  resumeOnUserInput = true,
  threshold = 0.3,
  visibleRootMargin = 0,
  resetOnInactive = true,
} = {}) {
  // Internals
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  // 🔐 Programmatic guard (ONE FRAME ONLY)
  const internalScrollRef = useRef(false);
  const internalUnsetRafRef = useRef(null);

  const userInteractingRef = useRef(false);
  const startedThisCycleRef = useRef(false);
  const floatTopRef = useRef(0);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  // IO rootMargin
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

  // Speed resolver
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

  // Helpers
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

  // 🏷️ mark exactly ONE frame as programmatic
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

  const pauseNow = useCallback(() => {
    setPaused(true);
    pausedRef.current = true;
    clearResume();
    clearRAF(); // stop immediately
  }, [clearRAF, clearResume]);

  const step = useCallback(
    (ts) => {
      if (pausedRef.current || !active || !inView) return;
      const host = ref?.current;
      if (!host) return;

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      const dtClamped = Math.min(0.05, Math.max(0, dt));

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
    if (userInteractingRef.current) return; // still moving (drag or momentum)
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      if (!userInteractingRef.current) {
        setResumeScheduled(false);
        startNow(); // restart auto-scroll
      }
    }, Math.max(0, resumeDelay));
  }, [resumeOnUserInput, resumeDelay, startNow, clearResume]);

  // Start/stop lifecycle
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

  // ====== INPUT HANDLERS (hook-owned) ======

  // Touch: pause on start/move; resume after idle
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,
    onTouchStart: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onTouchMove: (_, data) => { if (data.moved) { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); } },
    onTouchEnd: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
    onLongPress: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    preventDefaultOnTouch: false,
  });

  // Scroll abstraction (kept, but made more sensitive)
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 1,
    debounceDelay: 80,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,
    onScrollStart: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onScrollActivity: () => { userInteractingRef.current = true; setUserEngaged(true); },
    onWheelActivity: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onScrollEnd: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
  });

  // 🔒 Raw listeners so mobile momentum / trackpad / scrollbar are always caught
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const SCROLL_IDLE = 160;  // ms without events = idle (handles iOS momentum)
    const WHEEL_IDLE  = 160;

    let scrollIdleT = null;
    let wheelIdleT = null;

    const onScroll = () => {
      // ignore if it's OUR programmatic scroll from this frame
      if (internalScrollRef.current) return;
      userInteractingRef.current = true; setUserEngaged(true);
      pauseNow();
      if (scrollIdleT) clearTimeout(scrollIdleT);
      scrollIdleT = setTimeout(() => {
        userInteractingRef.current = false; setUserEngaged(false);
        scheduleResume();
      }, SCROLL_IDLE);
    };

    const onWheel = () => {
      userInteractingRef.current = true; setUserEngaged(true);
      pauseNow();
      if (wheelIdleT) clearTimeout(wheelIdleT);
      wheelIdleT = setTimeout(() => {
        userInteractingRef.current = false; setUserEngaged(false);
        scheduleResume();
      }, WHEEL_IDLE);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      if (scrollIdleT) clearTimeout(scrollIdleT);
      if (wheelIdleT) clearTimeout(wheelIdleT);
    };
  }, [ref, pauseNow, scheduleResume]);

  // Height growth (late images)
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

  // Debug metrics
  const metrics = useCallback(() => {
    const host = ref?.current;
    const max = host ? Math.max(0, host.scrollHeight - host.clientHeight) : 0;
    const top = host ? host.scrollTop : 0;
    const progress = max > 0 ? top / max : 0;
    return {
      top, max, progress,
      animating: !!rafRef.current,
      engaged: userInteractingRef.current,
      started: startedThisCycleRef.current,
      internalGuard: internalScrollRef.current,
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
