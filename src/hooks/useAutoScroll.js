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
 * Mobile/desktop fixes:
 *  - Pause immediately on ANY user scroll (touch drag, trackpad, scrollbar).
 *  - Single-frame programmatic guard (never masks real user scrolls).
 *  - Resume only after interaction ends + resumeDelay (debounced).
 *  - Sub-pixel accumulator, dt clamp, ResizeObserver retry.
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

  // guard to ignore OUR programmatic scrolls (cleared next frame)
  const internalScrollRef = useRef(false);
  const internalUnsetRafRef = useRef(null);

  const userInteractingRef = useRef(false);
  const startedThisCycleRef = useRef(false);
  const floatTopRef = useRef(0); // sub-pixel accumulator

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  // ---- IO visibility
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

  // ---- px/sec resolver
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

  // Mark next scroll as programmatic for ONE rAF only
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
    clearRAF(); // hard stop
  }, [clearRAF, clearResume]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return;
    if (userInteractingRef.current) return;
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      if (!userInteractingRef.current) {
        setResumeScheduled(false);
        startNow();
      }
    }, Math.max(0, resumeDelay));
  }, [resumeOnUserInput, resumeDelay, startNow, clearResume]);

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

      // our own scroll (ignore in onScroll)
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

  // rebind startNow with current step
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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

  // ======= INPUT HANDLERS (abstractions) =======
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,
    onTouchStart: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onTouchMove: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    onTouchEnd: () => { userInteractingRef.current = false; setUserEngaged(false); scheduleResume(); },
    onLongPress: () => { userInteractingRef.current = true; setUserEngaged(true); pauseNow(); },
    preventDefaultOnTouch: false,
  });

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

  // ======= RAW LISTENERS: guarantee mobile & scrollbar behavior =======
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    let scrollEndT = null;
    let wheelEndT = null;
    let touchEndT = null;

    // Always pause on any wheel (trackpad)
    const onWheel = () => {
      userInteractingRef.current = true; setUserEngaged(true); pauseNow();
      if (wheelEndT) clearTimeout(wheelEndT);
      wheelEndT = setTimeout(() => {
        userInteractingRef.current = false; setUserEngaged(false); scheduleResume();
      }, 140);
    };

    // Pause on any scroll that is not ours (covers scrollbar drag + mobile scrolling)
    const onScroll = () => {
      if (internalScrollRef.current) return; // ignore our own rAF scroll this frame
      userInteractingRef.current = true; setUserEngaged(true); pauseNow();
      if (scrollEndT) clearTimeout(scrollEndT);
      scrollEndT = setTimeout(() => {
        userInteractingRef.current = false; setUserEngaged(false); scheduleResume();
      }, 120);
    };

    // Mobile: explicit touch listeners (capture so we see them first)
    let lastTouchY = null;
    const onTouchStart = (e) => {
      lastTouchY = e.touches?.[0]?.clientY ?? null;
      userInteractingRef.current = true; setUserEngaged(true); pauseNow();
      if (touchEndT) { clearTimeout(touchEndT); touchEndT = null; }
    };
    const onTouchMove = (e) => {
      const y = e.touches?.[0]?.clientY ?? null;
      if (y !== null && lastTouchY !== null && Math.abs(y - lastTouchY) > 2) {
        userInteractingRef.current = true; setUserEngaged(true); pauseNow();
      }
      lastTouchY = y;
    };
    const onTouchEnd = () => {
      // wait a tick for momentum to finish; scroll handler will also debounce
      if (touchEndT) clearTimeout(touchEndT);
      touchEndT = setTimeout(() => {
        userInteractingRef.current = false; setUserEngaged(false); scheduleResume();
      }, 160);
    };

    const supportsScrollEnd = "onscrollend" in el;
    const onScrollEnd = () => {
      userInteractingRef.current = false; setUserEngaged(false); scheduleResume();
    };

    el.addEventListener("wheel", onWheel, { passive: true, capture: true });
    el.addEventListener("scroll", onScroll, { passive: true, capture: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true, capture: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    if (supportsScrollEnd) {
      el.addEventListener("scrollend", onScrollEnd, { passive: true, capture: true });
    }

    return () => {
      el.removeEventListener("wheel", onWheel, { capture: true });
      el.removeEventListener("scroll", onScroll, { capture: true });
      el.removeEventListener("touchstart", onTouchStart, { capture: true });
      el.removeEventListener("touchmove", onTouchMove, { capture: true });
      el.removeEventListener("touchend", onTouchEnd, { capture: true });
      if (supportsScrollEnd) el.removeEventListener("scrollend", onScrollEnd, { capture: true });
      if (scrollEndT) clearTimeout(scrollEndT);
      if (wheelEndT) clearTimeout(wheelEndT);
      if (touchEndT) clearTimeout(touchEndT);
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

  // Debug metrics for your overlay
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
