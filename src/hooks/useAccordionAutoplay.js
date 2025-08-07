// src/hooks/useAccordionAutoplay.js
import { useCallback, useEffect } from 'react';
import { 
  useScrollInteraction, 
  useClickInteraction, 
  useHoverInteraction, 
  usePauseableState, 
  useAutoAdvance 
} from './useUserInteractions';

const useAccordionAutoplay = (totalItems, initialIndex = 0, autoAdvanceDelay = 3000) => {
  // Use the generic pauseable state hook
  const { 
    isPaused: isAutoplayPaused, 
    userEngaged,
    shouldPauseAfterVideo,
    pause, 
    resume, 
    engageUser,
    disengageUser,
    pauseAfterVideoIfEngaged,
    handleResumeActivity 
  } = usePauseableState({
    initialPausedState: false,
    resumeTriggers: ['scroll', 'click-outside', 'hover-away']
  });

  // Use the generic auto-advance hook
  const {
    activeIndex,
    setActiveIndex,
    goToIndex,
    scheduleAutoAdvance,
    clearAutoAdvanceTimeout
  } = useAutoAdvance({
    totalItems,
    initialIndex,
    autoAdvanceDelay,
    loop: true
  });

  // Use the generic scroll interaction hook
  useScrollInteraction({
    scrollThreshold: 150,
    debounceDelay: 150,
    onScrollActivity: () => {
      handleResumeActivity('scroll');
    }
  });

  // Use the generic click interaction hook
  useClickInteraction({
    containerSelector: '[data-accordion-container], [data-video-container]',
    itemSelector: '[data-accordion-item], [data-video-container]',
    onOutsideClick: () => {
      handleResumeActivity('click-outside');
    },
    onInsideClick: (event, containerElement) => {
      // When clicking inside an accordion item or video container, engage the user
      engageUser();
    },
    onItemClick: (event, itemElement, containerElement) => {
      // When clicking on specific item or video container, engage the user
      engageUser();
    }
  });

  // Use the generic hover interaction hook
  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    onHoverStart: (element, index) => {
      // When hovering over an accordion item, engage the user
      engageUser();
    },
    onHoverEnd: (element, index) => {
      // When hovering away from an accordion item, disengage and potentially resume
      handleResumeActivity('hover-away');
    },
    hoverDelay: 0
  });

  // Auto-advance logic - only used when video ends, not on a timer
  const advanceToNext = useCallback(() => {
    if (!isAutoplayPaused) {
      // Use goToNext instead of scheduleAutoAdvance to advance immediately
      const nextIndex = (activeIndex + 1) % totalItems;
      goToIndex(nextIndex);
    }
  }, [isAutoplayPaused, activeIndex, totalItems, goToIndex]);

  // Enhanced video ended handler - pause if user is engaged
  const handleVideoEnded = useCallback(() => {
    const didPause = pauseAfterVideoIfEngaged();
    
    // Only advance if we didn't pause due to engagement
    if (!didPause) {
      // Add a small delay before advancing to next item
      setTimeout(() => {
        advanceToNext();
      }, 1000);
    }
  }, [pauseAfterVideoIfEngaged, advanceToNext]);

  // Manual selection handler
  const handleManualSelection = useCallback((index) => {
    goToIndex(index);
    engageUser(); // User manually selected, so they're engaged
  }, [goToIndex, engageUser]);

  // Accordion-specific hover handlers (delegated to the generic hover hook)
  const handleAccordionHover = useCallback((index, isHovering) => {
    if (isHovering) {
      handleMouseEnter(null, index);
    } else {
      handleMouseLeave(null, index);
    }
  }, [handleMouseEnter, handleMouseLeave]);

  // No special border logic - border always follows video progress
  const shouldShowFullBorder = useCallback(() => {
    return false; // Always show progress border, never full border
  }, []);

  // Remove the automatic scheduling effect - let videos drive the timing
  // The advancement should only happen when videos actually end

  return {
    activeIndex,
    isAutoplayPaused,
    userEngaged,
    shouldPauseAfterVideo,
    shouldShowFullBorder,
    handleManualSelection,
    handleAccordionHover,
    handleVideoEnded, // New: specific handler for video ended
    advanceToNext,
    setActiveIndex
  };
};

export default useAccordionAutoplay;