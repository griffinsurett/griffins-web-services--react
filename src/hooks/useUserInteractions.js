// src/hooks/useUserInteractions.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Generic hook for tracking user scroll interactions
 * @param {Object} config - Configuration object
 * @param {number} config.scrollThreshold - Minimum scroll delta to trigger callback
 * @param {number} config.debounceDelay - Debounce delay for scroll events
 * @param {Function} config.onScrollActivity - Callback when significant scroll is detected
 * @returns {Object} Scroll interaction state and handlers
 */
export const useScrollInteraction = ({
  scrollThreshold = 150,
  debounceDelay = 150,
  onScrollActivity = () => {}
} = {}) => {
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
      
      // If user scrolls significantly, trigger callback
      if (scrollDelta > scrollThreshold) {
        onScrollActivity({ scrollDelta, currentScrollY, lastScrollY: lastScrollY.current });
      }
      
      lastScrollY.current = currentScrollY;
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        lastScrollY.current = window.scrollY;
      }, debounceDelay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [scrollThreshold, debounceDelay, onScrollActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return {
    getCurrentScrollY: () => window.scrollY,
    getLastScrollY: () => lastScrollY.current
  };
};

/**
 * Generic hook for tracking click interactions outside/inside specific elements
 * @param {Object} config - Configuration object
 * @param {string} config.containerSelector - CSS selector for container element
 * @param {string} config.itemSelector - CSS selector for item elements
 * @param {Function} config.onOutsideClick - Callback when clicking outside container
 * @param {Function} config.onInsideClick - Callback when clicking inside container
 * @param {Function} config.onItemClick - Callback when clicking on specific item
 * @returns {Object} Click interaction handlers
 */
export const useClickInteraction = ({
  containerSelector = '[data-container]',
  itemSelector = '[data-item]',
  onOutsideClick = () => {},
  onInsideClick = () => {},
  onItemClick = () => {}
} = {}) => {
  
  useEffect(() => {
    const handleGlobalClick = (event) => {
      const containerElement = event.target.closest(containerSelector);
      const itemElement = event.target.closest(itemSelector);
      
      if (!containerElement) {
        // Clicked outside container
        onOutsideClick(event);
      } else {
        // Clicked inside container
        onInsideClick(event, containerElement);
        
        if (itemElement) {
          // Clicked on specific item
          onItemClick(event, itemElement, containerElement);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [containerSelector, itemSelector, onOutsideClick, onInsideClick, onItemClick]);

  return {
    // Could add programmatic click handlers here if needed
    triggerClick: useCallback((selector) => {
      const element = document.querySelector(selector);
      if (element) element.click();
    }, [])
  };
};

/**
 * Generic hook for tracking hover interactions
 * @param {Object} config - Configuration object
 * @param {Function} config.onHoverStart - Callback when hover starts
 * @param {Function} config.onHoverEnd - Callback when hover ends
 * @param {number} config.hoverDelay - Delay before triggering hover callbacks
 * @returns {Object} Hover interaction handlers
 */
export const useHoverInteraction = ({
  onHoverStart = () => {},
  onHoverEnd = () => {},
  hoverDelay = 0
} = {}) => {
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback((element, index) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      onHoverStart(element, index);
    }, hoverDelay);
  }, [onHoverStart, hoverDelay]);

  const handleMouseLeave = useCallback((element, index) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      onHoverEnd(element, index);
    }, hoverDelay);
  }, [onHoverEnd, hoverDelay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return {
    handleMouseEnter,
    handleMouseLeave
  };
};

/**
 * Generic hook for managing paused/active states with user interactions
 * @param {Object} config - Configuration object
 * @param {boolean} config.initialPausedState - Initial paused state
 * @param {Array} config.resumeTriggers - Array of trigger types that resume activity
 * @returns {Object} Pause state and control functions
 */
export const usePauseableState = ({
  initialPausedState = false,
  resumeTriggers = ['scroll', 'click-outside', 'hover-away']
} = {}) => {
  const [isPaused, setIsPaused] = useState(initialPausedState);
  const [userEngaged, setUserEngaged] = useState(false);
  const [shouldPauseAfterVideo, setShouldPauseAfterVideo] = useState(false);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    setShouldPauseAfterVideo(false); // Clear pending pause when resuming
  }, []);

  const toggle = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Mark user as engaged (clicked or hovered on item)
  const engageUser = useCallback(() => {
    setUserEngaged(true);
    setShouldPauseAfterVideo(true); // Schedule pause after current video ends
  }, []);

  // Mark user as disengaged (clicked away, hovered away, scrolled)
  const disengageUser = useCallback(() => {
    setUserEngaged(false);
    setShouldPauseAfterVideo(false);
  }, []);

  // Pause after video ends if user was engaged
  const pauseAfterVideoIfEngaged = useCallback(() => {
    if (shouldPauseAfterVideo && userEngaged) {
      pause();
    }
  }, [shouldPauseAfterVideo, userEngaged, pause]);

  // Auto-resume logic based on triggers
  const handleResumeActivity = useCallback((triggerType) => {
    if (resumeTriggers.includes(triggerType) && isPaused) {
      disengageUser(); // User is no longer engaged
      resume();
    }
  }, [resumeTriggers, isPaused, resume, disengageUser]);

  return {
    isPaused,
    userEngaged,
    shouldPauseAfterVideo,
    pause,
    resume,
    toggle,
    engageUser,
    disengageUser,
    pauseAfterVideoIfEngaged,
    handleResumeActivity
  };
};

/**
 * Generic hook for managing auto-advancing states (carousels, slideshows, etc.)
 * @param {Object} config - Configuration object
 * @param {number} config.totalItems - Total number of items to cycle through
 * @param {number} config.initialIndex - Initial active index
 * @param {number} config.autoAdvanceDelay - Delay between auto-advances
 * @param {boolean} config.loop - Whether to loop back to start after last item
 * @returns {Object} Auto-advance state and control functions
 */
export const useAutoAdvance = ({
  totalItems = 0,
  initialIndex = 0,
  autoAdvanceDelay = 3000,
  loop = true
} = {}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const autoAdvanceTimeoutRef = useRef(null);

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoAdvance = useCallback((delay = autoAdvanceDelay) => {
    clearAutoAdvanceTimeout();
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      setActiveIndex(prevIndex => {
        if (loop) {
          return (prevIndex + 1) % totalItems;
        } else {
          return prevIndex < totalItems - 1 ? prevIndex + 1 : prevIndex;
        }
      });
    }, delay);
  }, [autoAdvanceDelay, totalItems, loop, clearAutoAdvanceTimeout]);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < totalItems) {
      setActiveIndex(index);
      clearAutoAdvanceTimeout();
    }
  }, [totalItems, clearAutoAdvanceTimeout]);

  const goToNext = useCallback(() => {
    const nextIndex = loop 
      ? (activeIndex + 1) % totalItems 
      : Math.min(activeIndex + 1, totalItems - 1);
    goToIndex(nextIndex);
  }, [activeIndex, totalItems, loop, goToIndex]);

  const goToPrevious = useCallback(() => {
    const prevIndex = loop
      ? activeIndex === 0 ? totalItems - 1 : activeIndex - 1
      : Math.max(activeIndex - 1, 0);
    goToIndex(prevIndex);
  }, [activeIndex, totalItems, loop, goToIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoAdvanceTimeout();
    };
  }, [clearAutoAdvanceTimeout]);

  return {
    activeIndex,
    setActiveIndex,
    goToIndex,
    goToNext,
    goToPrevious,
    scheduleAutoAdvance,
    clearAutoAdvanceTimeout
  };
};