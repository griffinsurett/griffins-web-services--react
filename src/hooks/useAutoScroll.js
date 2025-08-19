// src/hooks/useAutoScroll.js - MOBILE INITIALIZATION FIX
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
  resumeOnUserInput = false,
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
  
  // ✅ ADD: Mobile detection
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
           window.innerWidth <= 768;
  }, []);

  const [paused, setPaused] = useState(false);
  const [resumeScheduled, setResumeScheduled] = useState(false);

  // ✅ ADD: Debug state for mobile
  const [debugInfo, setDebugInfo] = useState({});

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

  // ✅ FIXED: More aggressive visibility detection for mobile
  const inView = useVisibility(ref, { 
    threshold: isMobile ? 0.1 : threshold, // ✅ Lower threshold for mobile
    rootMargin: isMobile ? "50px" : rootMargin, // ✅ Larger margin for mobile
    once: false // ✅ Ensure we keep checking visibility
  });

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

  // ✅ ENHANCED: Better mobile scroll detection and RAF handling
  const step = useCallback(
    (ts) => {
      const host = ref?.current;
      if (!host) {
        // ✅ Better cleanup on mobile when element disappears
        clearRAF();
        return;
      }

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;

      // ✅ MOBILE FIX: Force reflow calculation on mobile
      if (isMobile) {
        host.offsetHeight; // Force reflow
      }

      const max = Math.max(0, host.scrollHeight - host.clientHeight);
      
      // ✅ DEBUG: Track scroll info on mobile
      if (isMobile && process.env.NODE_ENV === 'development') {
        setDebugInfo({
          scrollHeight: host.scrollHeight,
          clientHeight: host.clientHeight,
          max,
          currentScrollTop: host.scrollTop,
          pps: resolvePxPerSecond(host),
          dt,
          timestamp: ts
        });
      }

      if (max <= 0) {
        // ✅ No scrollable content, but keep trying on mobile
        if (isMobile) {
          rafRef.current = requestAnimationFrame(step);
        }
        return;
      }

      const pps = resolvePxPerSecond(host);
      const next = host.scrollTop + pps * dt;

      internalScrollRef.current = true;
      
      try {
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
      } catch (error) {
        // ✅ Handle mobile scroll errors gracefully
        console.warn('AutoScroll error on mobile:', error);
        internalScrollRef.current = false;
        clearRAF();
        return;
      }

      requestAnimationFrame(() => (internalScrollRef.current = false));
      rafRef.current = requestAnimationFrame(step);
    },
    [ref, resolvePxPerSecond, loop, clearRAF, isMobile]
  );

  const startNow = useCallback(() => {
    clearRAF();
    const host = ref?.current;
    
    if (!host) return;

    // ✅ MOBILE FIX: Ensure element is ready and has scrollable content
    if (isMobile) {
      // Force a layout calculation
      const rect = host.getBoundingClientRect();
      const hasContent = host.scrollHeight > host.clientHeight;
      
      if (!hasContent) {
        // ✅ Retry after a short delay on mobile
        setTimeout(() => {
          if (active && inView && !paused && ref?.current) {
            startNow();
          }
        }, 100);
        return;
      }
    }

    startedThisCycleRef.current = true;
    rafRef.current = requestAnimationFrame(step);
  }, [step, ref, clearRAF, active, inView, paused, isMobile]);

  // ✅ ENHANCED: Better mobile timing and retry logic
  useEffect(() => {
    clearRAF();
    clearStartTimer();

    if (active && inView && !paused) {
      const effectiveStartDelay = isMobile ? Math.max(startDelay, 2000) : startDelay; // ✅ Longer delay on mobile
      
      if (!startedThisCycleRef.current) {
        startTimerRef.current = setTimeout(() => {
          if (active && inView && !paused) {
            startNow();
            
            // ✅ MOBILE: Retry mechanism if first attempt fails
            if (isMobile) {
              setTimeout(() => {
                if (active && inView && !paused && !rafRef.current) {
                  console.log('AutoScroll retry on mobile');
                  startNow();
                }
              }, 1000);
            }
          }
        }, effectiveStartDelay);
      } else {
        startNow();
      }
    }

    return () => {
      clearRAF();
      clearStartTimer();
    };
  }, [active, inView, paused, startDelay, startNow, clearRAF, clearStartTimer, isMobile]);

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
      
      // ✅ MOBILE: More reliable reset
      if (isMobile) {
        setTimeout(() => {
          if (host && host.scrollTop !== 0) {
            host.scrollTop = 0;
          }
          internalScrollRef.current = false;
        }, 50);
      } else {
        host.scrollTop = 0;
        requestAnimationFrame(() => (internalScrollRef.current = false));
      }
      
      setPaused(false);
    }
  }, [active, inView, resetOnInactive, ref, clearRAF, clearResume, clearStartTimer, isMobile]);

  // ✅ MOBILE: Only add touch interactions if resumeOnUserInput is true
  useTouchInteraction({
    elementRef: resumeOnUserInput ? ref : null, // ✅ Conditional attachment
    tapThreshold: 8,
    longPressDelay: 600,
    
    onTouchStart: (e, data) => {
      if (resumeOnUserInput) pauseNow();
    },
    
    onTouchEnd: (e, data) => {
      if (resumeOnUserInput) maybeScheduleResume();
    },
    
    onTouchMove: (e, data) => {
      if (resumeOnUserInput && data.moved) {
        pauseNow();
      }
    },
    
    onLongPress: (e, data) => {
      if (resumeOnUserInput) pauseNow();
    },
    
    preventDefaultOnTouch: false,
  });

  useScrollInteraction({
    elementRef: resumeOnUserInput ? ref : null, // ✅ Conditional attachment
    scrollThreshold: 5,
    debounceDelay: 100,
    trustedOnly: true,
    internalFlagRef: internalScrollRef,
    wheelSensitivity: 1,
    
    onScrollActivity: (data) => {
      if (resumeOnUserInput) {
        pauseNow();
        maybeScheduleResume();
      }
    },
    
    onScrollStart: (data) => {
      if (resumeOnUserInput) pauseNow();
    },
    
    onScrollEnd: (data) => {
      if (resumeOnUserInput) maybeScheduleResume();
    },
    
    onWheelActivity: (data) => {
      if (resumeOnUserInput) {
        pauseNow();
        maybeScheduleResume();
      }
    },
  });

  usePointerInteraction({
    elementRef: resumeOnUserInput ? ref : null, // ✅ Conditional attachment
    pointerTypes: ['mouse', 'pen'],
    clickThreshold: 10,
    longPressDelay: 500,
    
    onPointerDown: (e, data) => {
      if (resumeOnUserInput) pauseNow();
    },
    
    onPointerUp: (e, data) => {
      if (resumeOnUserInput) maybeScheduleResume();
    },
    
    onPointerMove: (e, data) => {
      if (resumeOnUserInput && data.moved) {
        pauseNow();
      }
    },
    
    onPointerClick: (e, data) => {
      if (resumeOnUserInput) {
        pauseNow();
        maybeScheduleResume();
      }
    },
    
    onPointerLongPress: (e, data) => {
      if (resumeOnUserInput) pauseNow();
    },
    
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

  // ✅ Mobile debug info in development
  useEffect(() => {
    if (isMobile && process.env.NODE_ENV === 'development') {
      console.log('AutoScroll Debug:', {
        active,
        inView,
        paused,
        hasScrollableContent: ref?.current ? ref.current.scrollHeight > ref.current.clientHeight : false,
        isAnimating: !!rafRef.current,
        debugInfo
      });
    }
  }, [active, inView, paused, isMobile, debugInfo]);

  return { 
    inView, 
    paused, 
    resumeScheduled,
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
    // ✅ Mobile debug info
    debugInfo: isMobile ? debugInfo : null,
  };
}