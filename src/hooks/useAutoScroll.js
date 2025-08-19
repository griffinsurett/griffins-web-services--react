// src/hooks/useAutoScroll.js - MOBILE DEBUG & FIX
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";
import { 
  useTouchInteraction, 
  useScrollInteraction, 
  usePointerInteraction 
} from "./useInteractions";

export function useAutoScroll({
  ref,
  active = false,
  speed = 40,
  cycleDuration = 0,
  loop = false,
  startDelay = 1500,
  resumeDelay = 1200,
  resumeOnUserInput = false, // ✅ Keep as false for portfolio
  threshold = 0.3,
  visibleRootMargin = 0,
  resetOnInactive = true,
} = {}) {
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const internalScrollRef = useRef(false);
  const startedThisCycleRef = useRef(false);

  const [paused, setPaused] = useState(false);
  const [resumeScheduled, setResumeScheduled] = useState(false);

  // ✅ DEBUG: Add mobile detection
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }, []);

  // ✅ DEBUG: Add state logging for mobile
  const [debugInfo, setDebugInfo] = useState({});
  
  useEffect(() => {
    if (isMobile) {
      setDebugInfo({
        active,
        paused,
        hasRAF: !!rafRef.current,
        hasStartTimer: !!startTimerRef.current,
        startedThisCycle: startedThisCycleRef.current,
        elementExists: !!ref?.current,
        scrollable: ref?.current ? ref.current.scrollHeight > ref.current.clientHeight : false,
      });
    }
  }, [active, paused, isMobile, ref]);

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

  // ✅ FIXED: Force visibility to true if element exists and active (bypass IO issues on mobile)
  const rawInView = useVisibility(ref, { threshold, rootMargin });
  const inView = useMemo(() => {
    // On mobile, if we have an element and it's active, assume it's visible
    if (isMobile && ref?.current && active) {
      return true;
    }
    return rawInView;
  }, [isMobile, ref, active, rawInView]);

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
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTsRef.current = 0;
  }, []);

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  }, []);

  const clearResume = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    setResumeScheduled(false);
  }, []);

  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return;
    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      setResumeScheduled(false);
      setPaused(false);
    }, resumeDelay);
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

  // ✅ FIXED: More robust animation step for mobile
  const step = useCallback(
    (ts) => {
      const host = ref?.current;
      if (!host) {
        clearRAF();
        return;
      }

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;

      const max = Math.max(0, host.scrollHeight - host.clientHeight);
      if (max <= 0) {
        clearRAF();
        return;
      }

      const pps = resolvePxPerSecond(host);
      if (pps <= 0) {
        clearRAF();
        return;
      }

      const next = host.scrollTop + pps * dt;

      // ✅ MOBILE FIX: More robust programmatic scroll detection
      internalScrollRef.current = true;
      
      if (next >= max) {
        if (loop) {
          host.scrollTop = 0;
        } else {
          host.scrollTop = max;
          // ✅ Use setTimeout instead of rAF for cleanup on mobile
          setTimeout(() => {
            internalScrollRef.current = false;
          }, 16);
          clearRAF();
          return;
        }
      } else {
        host.scrollTop = next;
      }
      
      // ✅ Clean up internal flag
      setTimeout(() => {
        internalScrollRef.current = false;
      }, 16);

      // ✅ Continue animation
      rafRef.current = requestAnimationFrame(step);
    },
    [ref, resolvePxPerSecond, loop, clearRAF]
  );

  const startNow = useCallback(() => {
    clearRAF();
    const host = ref?.current;
    
    if (!host) {
      console.warn('[useAutoScroll] No element to scroll');
      return;
    }

    const max = host.scrollHeight - host.clientHeight;
    if (max <= 0) {
      console.warn('[useAutoScroll] Element not scrollable', { 
        scrollHeight: host.scrollHeight, 
        clientHeight: host.clientHeight 
      });
      return;
    }

    // ✅ DEBUG logging for mobile
    if (isMobile) {
      console.log('[useAutoScroll] Starting on mobile', {
        scrollHeight: host.scrollHeight,
        clientHeight: host.clientHeight,
        maxScroll: max,
        cycleDuration,
        speed: resolvePxPerSecond(host)
      });
    }

    startedThisCycleRef.current = true;
    
    // ✅ MOBILE FIX: Force first frame immediately
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
  }, [step, ref, clearRAF, cycleDuration, resolvePxPerSecond, isMobile]);

  // ✅ FIXED: More aggressive start logic for mobile
  useEffect(() => {
    clearRAF();
    clearStartTimer();

    const shouldStart = active && inView && !paused;
    
    // ✅ DEBUG: Log conditions on mobile
    if (isMobile) {
      console.log('[useAutoScroll] Effect conditions:', {
        active,
        inView,
        paused,
        shouldStart,
        startedThisCycle: startedThisCycleRef.current
      });
    }

    if (shouldStart) {
      if (!startedThisCycleRef.current) {
        // ✅ MOBILE FIX: Shorter delay on mobile for better responsiveness
        const delay = isMobile ? Math.max(500, startDelay) : startDelay;
        
        startTimerRef.current = setTimeout(() => {
          if (active && inView && !paused) {
            startNow();
          }
        }, delay);
      } else {
        // ✅ MOBILE FIX: Immediate restart if already started this cycle
        startNow();
      }
    }

    return () => {
      clearRAF();
      clearStartTimer();
    };
  }, [active, inView, paused, startDelay, startNow, clearRAF, clearStartTimer, isMobile]);

  // ✅ Reset logic (unchanged but with mobile logging)
  useEffect(() => {
    if (!resetOnInactive) return;
    const host = ref?.current;
    if (!host) return;

    if (!active || !inView) {
      if (isMobile) {
        console.log('[useAutoScroll] Resetting on mobile:', { active, inView });
      }
      
      startedThisCycleRef.current = false;
      clearRAF();
      clearResume();
      clearStartTimer();
      internalScrollRef.current = true;
      host.scrollTop = 0;
      setTimeout(() => {
        internalScrollRef.current = false;
      }, 16);
      setPaused(false);
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer, isMobile]);

  // ✅ MOBILE FIX: Only register interaction handlers if resumeOnUserInput is true
  const shouldRegisterInteractions = resumeOnUserInput;

  // Touch interaction (only if needed)
  useTouchInteraction({
    elementRef: shouldRegisterInteractions ? ref : { current: null },
    tapThreshold: 8,
    longPressDelay: 600,
    onTouchStart: shouldRegisterInteractions ? pauseNow : () => {},
    onTouchEnd: shouldRegisterInteractions ? maybeScheduleResume : () => {},
    onTouchMove: shouldRegisterInteractions ? (e, data) => {
      if (data.moved) pauseNow();
    } : () => {},
    onLongPress: shouldRegisterInteractions ? pauseNow : () => {},
    preventDefaultOnTouch: false,
  });

  // Scroll interaction (only if needed)
  useScrollInteraction({
    elementRef: shouldRegisterInteractions ? ref : { current: null },
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,
    onScrollActivity: shouldRegisterInteractions ? (data) => {
      pauseNow();
      maybeScheduleResume();
    } : () => {},
    onScrollStart: shouldRegisterInteractions ? pauseNow : () => {},
    onScrollEnd: shouldRegisterInteractions ? maybeScheduleResume : () => {},
    onWheelActivity: shouldRegisterInteractions ? (data) => {
      pauseNow();
      maybeScheduleResume();
    } : () => {},
  });

  // Pointer interaction (only if needed)
  usePointerInteraction({
    elementRef: shouldRegisterInteractions ? ref : { current: null },
    pointerTypes: ['mouse', 'pen'],
    clickThreshold: 10,
    longPressDelay: 500,
    onPointerDown: shouldRegisterInteractions ? pauseNow : () => {},
    onPointerUp: shouldRegisterInteractions ? maybeScheduleResume : () => {},
    onPointerMove: shouldRegisterInteractions ? (e, data) => {
      if (data.moved) pauseNow();
    } : () => {},
    onPointerClick: shouldRegisterInteractions ? (e, data) => {
      pauseNow();
      maybeScheduleResume();
    } : () => {},
    onPointerLongPress: shouldRegisterInteractions ? pauseNow : () => {},
    preventDefaultOnPointer: false,
  });

  useEffect(
    () => () => {
      clearRAF();
      clearStartTimer();
      clearResume();
    },
    [clearRAF, clearStartTimer, clearResume]
  );

  // ✅ DEBUG: Console log for mobile debugging
  useEffect(() => {
    if (isMobile && process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        console.log('[useAutoScroll] Mobile Debug:', debugInfo);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile, debugInfo]);

  return { 
    inView, 
    paused, 
    resumeScheduled,
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
    // ✅ DEBUG: Expose debug info
    debugInfo: isMobile ? debugInfo : null,
  };
}