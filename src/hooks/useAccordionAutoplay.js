// src/hooks/useAccordionAutoplay.js
import { useState, useEffect, useRef, useCallback } from 'react';

const useAccordionAutoplay = (totalItems, initialIndex = 0, autoAdvanceDelay = 3000) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [userInteractionState, setUserInteractionState] = useState({
    hoveredIndex: null,
    manuallySelectedIndex: null,
    lastInteractionTime: null
  });
  
  const autoplayTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(window.scrollY);
  const interactionTimeoutRef = useRef(null);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimeoutRef.current) clearTimeout(autoplayTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };
  }, []);

  // Handle scroll detection for resuming autoplay
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
      
      // If user scrolls significantly (more than 150px), resume autoplay
      if (scrollDelta > 150 && isAutoplayPaused) {
        setIsAutoplayPaused(false);
        setUserInteractionState({
          hoveredIndex: null,
          manuallySelectedIndex: null,
          lastInteractionTime: null
        });
      }
      
      lastScrollY.current = currentScrollY;
      
      // Clear existing timeout and set new one
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        // Scroll has stopped, update last position
        lastScrollY.current = window.scrollY;
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isAutoplayPaused]);

  // Handle global clicks to resume autoplay
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // Check if click is outside accordion area
      const accordionContainer = event.target.closest('[data-accordion-container]');
      const clickedAccordion = event.target.closest('[data-accordion-item]');
      
      if (!accordionContainer || !clickedAccordion) {
        // Clicked outside accordion area, resume autoplay
        setIsAutoplayPaused(false);
        setUserInteractionState({
          hoveredIndex: null,
          manuallySelectedIndex: null,
          lastInteractionTime: null
        });
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Auto-advance logic with delay
  const advanceToNext = useCallback(() => {
    if (!isAutoplayPaused) {
      // Add delay before advancing to next accordion
      autoplayTimeoutRef.current = setTimeout(() => {
        if (!isAutoplayPaused) {
          setActiveIndex(prevIndex => (prevIndex + 1) % totalItems);
        }
      }, autoAdvanceDelay);
    }
  }, [isAutoplayPaused, totalItems, autoAdvanceDelay]);

  // Manual selection handler for specific index
  const handleManualSelection = useCallback((index) => {
    setActiveIndex(index);
    setIsAutoplayPaused(true);
    setUserInteractionState(prev => ({
      ...prev,
      manuallySelectedIndex: index,
      lastInteractionTime: Date.now()
    }));

    // Clear any existing autoplay timeout
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  }, []);

  // Hover handlers for specific index
  const handleAccordionHover = useCallback((index, isHovering) => {
    setUserInteractionState(prev => ({
      ...prev,
      hoveredIndex: isHovering ? index : null
    }));
    
    if (isHovering) {
      setIsAutoplayPaused(true);
    } else {
      // Small delay before resuming to prevent flickering
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        // Use a function to get the latest state
        setUserInteractionState(currentState => {
          // Only resume if we're not hovering any item and haven't manually selected this item
          if (currentState.hoveredIndex === null && 
              currentState.manuallySelectedIndex !== activeIndex) {
            setIsAutoplayPaused(false);
            // Clear manual selection state when resuming autoplay
            return {
              ...currentState,
              manuallySelectedIndex: null
            };
          }
          return currentState;
        });
      }, 500);
    }
  }, [activeIndex]);

  // Determine if we should show full border for a specific index
  const shouldShowFullBorder = useCallback((index) => {
    return (userInteractionState.manuallySelectedIndex === index) || 
           (userInteractionState.hoveredIndex === index);
  }, [userInteractionState.manuallySelectedIndex, userInteractionState.hoveredIndex]);

  return {
    activeIndex,
    isAutoplayPaused,
    shouldShowFullBorder,
    handleManualSelection,
    handleAccordionHover,
    advanceToNext,
    setActiveIndex // For external control if needed
  };
};

export default useAccordionAutoplay;