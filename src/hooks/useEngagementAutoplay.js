// src/hooks/useEngagementAutoplay.js - FIXED VERSION
import { useEffect, useRef, useCallback } from "react";
import useAutoplay from "./useAutoplay";
import { usePauseableState } from "./usePauseableState";
import { useScrollInteraction, useClickInteraction } from "./useInteractions";

/**
 * Engagement-aware autoplay controller with MOBILE TOUCH SUPPORT.
 */
export default function useEngagementAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  autoplayTime = 3000,
  resumeDelay = 5000,
  resumeTriggers = ["scroll", "click-outside", "hover-away", "touch-away"], // ✅ ADD touch-away
  containerSelector = "[data-autoplay-container]",
  itemSelector = "[data-autoplay-item]",
  inView = true,
  pauseOnEngage = false,
  engageOnlyOnActiveItem = false,
  activeItemAttr = "data-active",
}) {
  const graceRef = useRef(false);
  
  const {
    isPaused,
    userEngaged,
    isResumeScheduled,
    engageUser,
    handleResumeActivity,
    pause,
    resume,
  } = usePauseableState({
    initialPausedState: false,
    resumeTriggers,
    resumeDelay,
  });

  // Core timer: schedule/advance only when not paused and in view
  const { advance, schedule } = useAutoplay({
    totalItems,
    currentIndex,
    setIndex,
    autoplayTime,
    enabled: !isPaused && inView,
  });

  // Grace window functionality
  const beginGraceWindow = useCallback(() => {
    graceRef.current = true;
    if (userEngaged && !isPaused) pause();
  }, [userEngaged, isPaused, pause]);

  useEffect(() => {
    graceRef.current = false;
  }, [currentIndex]);

  useEffect(() => {
    if (graceRef.current && userEngaged && !isPaused) pause();
  }, [userEngaged, isPaused, pause]);

  // Scroll interactions
  useScrollInteraction({
    scrollThreshold: 150,
    debounceDelay: 150,
    onScrollActivity: () => handleResumeActivity("scroll"),
  });

  // Click interactions
  useClickInteraction({
    containerSelector,
    itemSelector,
    onOutsideClick: () => handleResumeActivity("click-outside"),
    onInsideClick: () => {},
    onItemClick: (e, item) => {
      if (engageOnlyOnActiveItem) {
        const isActive = item?.getAttribute?.(activeItemAttr) === "true";
        if (!isActive) return;
      }
      engageUser();
      if (pauseOnEngage) pause();
    },
  });

  // ✅ FIXED: Enhanced interaction handling for both DESKTOP and MOBILE
  useEffect(() => {
    const items = Array.from(document.querySelectorAll(itemSelector));
    if (!items.length) return;

    const isEligible = (el) =>
      !!el && (!engageOnlyOnActiveItem || el.getAttribute?.(activeItemAttr) === "true");

    // ✅ DESKTOP: Mouse hover interactions (unchanged)
    const onMouseEnter = (ev) => {
      const host = ev.currentTarget;
      if (!isEligible(host)) return;
      engageUser();
      if (pauseOnEngage) pause();
    };

    const onMouseLeave = (ev) => {
      const nextHost = ev.relatedTarget?.closest?.(itemSelector);
      if (isEligible(nextHost)) return;
      handleResumeActivity("hover-away");
    };

    // ✅ MOBILE: Touch interactions (NEW!)
    const onTouchStart = (ev) => {
      const host = ev.currentTarget;
      if (!isEligible(host)) return;
      engageUser();
      if (pauseOnEngage) pause();
    };

    const onTouchEnd = (ev) => {
      // Small delay to avoid immediate resume on quick taps
      setTimeout(() => {
        handleResumeActivity("touch-away");
      }, 100);
    };

    // ✅ Add event listeners for both mouse AND touch
    items.forEach((el) => {
      // Desktop events
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
      
      // Mobile events
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
    });

    // ✅ Enhanced pointer tracking for both mouse AND touch
    const onPointerMove = (e) => {
      if (!userEngaged) return;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const host = under?.closest?.(itemSelector);
      if (!isEligible(host)) {
        // Different handling for touch vs mouse
        const eventType = e.pointerType === 'touch' ? 'touch-away' : 'hover-away';
        handleResumeActivity(eventType);
      }
    };

    // ✅ Also listen to touchmove for mobile pointer tracking
    const onTouchMove = (e) => {
      if (!userEngaged) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      const under = document.elementFromPoint(touch.clientX, touch.clientY);
      const host = under?.closest?.(itemSelector);
      if (!isEligible(host)) {
        handleResumeActivity("touch-away");
      }
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      items.forEach((el) => {
        // Remove mouse events
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
        
        // Remove touch events
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchend", onTouchEnd);
      });
      
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [
    itemSelector,
    activeItemAttr,
    engageOnlyOnActiveItem,
    pauseOnEngage,
    engageUser,
    handleResumeActivity,
    pause,
    currentIndex,
    userEngaged,
  ]);

  return {
    isAutoplayPaused: isPaused,
    isResumeScheduled,
    userEngaged,
    pause,
    resume,
    engageUser,
    advance,
    schedule,
    beginGraceWindow,
  };
}