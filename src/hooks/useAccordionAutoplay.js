// src/hooks/useAccordionAutoplay.js
import { useState, useEffect, useRef, useCallback } from 'react';

const useAccordionAutoplay = (totalItems, initialIndex = 0, autoAdvanceDelay = 3000) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  
  const autoplayTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(window.scrollY);

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimeoutRef.current) clearTimeout(autoplayTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Handle scroll detection for resuming autoplay
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
      
      // If user scrolls significantly, resume autoplay
      if (scrollDelta > 150 && isAutoplayPaused) {
        setIsAutoplayPaused(false);
      }
      
      lastScrollY.current = currentScrollY;
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
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
      const accordionContainer = event.target.closest('[data-accordion-container]');
      const clickedAccordion = event.target.closest('[data-accordion-item]');
      
      if (!accordionContainer || !clickedAccordion) {
        // Clicked outside accordion area, resume autoplay
        setIsAutoplayPaused(false);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Auto-advance logic
  const advanceToNext = useCallback(() => {
    if (!isAutoplayPaused) {
      autoplayTimeoutRef.current = setTimeout(() => {
        if (!isAutoplayPaused) {
          setActiveIndex(prevIndex => (prevIndex + 1) % totalItems);
        }
      }, autoAdvanceDelay);
    }
  }, [isAutoplayPaused, totalItems, autoAdvanceDelay]);

  // Manual selection handler
  const handleManualSelection = useCallback((index) => {
    setActiveIndex(index);
    setIsAutoplayPaused(false); // Continue autoplay from this point
    
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  }, []);

  // Simple hover handlers (just for visual feedback, no autoplay interference)
  const handleAccordionHover = useCallback((index, isHovering) => {
    // Could be used for visual hover effects in the future, but doesn't affect autoplay
  }, []);

  // No special border logic - border always follows video progress
  const shouldShowFullBorder = useCallback(() => {
    return false; // Always show progress border, never full border
  }, []);

  return {
    activeIndex,
    isAutoplayPaused,
    shouldShowFullBorder,
    handleManualSelection,
    handleAccordionHover,
    advanceToNext,
    setActiveIndex
  };
};

export default useAccordionAutoplay;