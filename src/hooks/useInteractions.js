// src/hooks/useInteractions.js
import { useState, useEffect, useRef, useCallback } from "react";

/** Scroll */
export const useScrollInteraction = ({
  scrollThreshold = 150,
  debounceDelay = 150,
  onScrollActivity = () => {},
} = {}) => {
  const scrollTimeoutRef = useRef(null);
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY.current);

      if (delta > scrollThreshold) {
        onScrollActivity({
          scrollDelta: delta,
          currentScrollY,
          lastScrollY: lastScrollY.current,
        });
      }

      lastScrollY.current = currentScrollY;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        lastScrollY.current = window.scrollY;
      }, debounceDelay);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [scrollThreshold, debounceDelay, onScrollActivity]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return {
    getCurrentScrollY: () => window.scrollY,
    getLastScrollY: () => lastScrollY.current,
  };
};

/** Click */
export const useClickInteraction = ({
  containerSelector = "[data-container]",
  itemSelector = "[data-item]",
  onOutsideClick = () => {},
  onInsideClick = () => {},
  onItemClick = () => {},
} = {}) => {
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // ✅ Ignore programmatic clicks (e.g., our autoplay radio .click())
      if (!event.isTrusted) return;

      const container = event.target.closest(containerSelector);
      const item = event.target.closest(itemSelector);

      if (!container) {
        onOutsideClick(event);
      } else {
        onInsideClick(event, container);
        if (item) onItemClick(event, item, container);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [containerSelector, itemSelector, onOutsideClick, onInsideClick, onItemClick]);

  return {
    triggerClick: (selector) => {
      const el = document.querySelector(selector);
      if (el) el.click();
    },
  };
};


/** Hover */
export const useHoverInteraction = ({
  onHoverStart = () => {},
  onHoverEnd = () => {},
  hoverDelay = 0,
} = {}) => {
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback(
    (element, index) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => onHoverStart(element, index), hoverDelay);
    },
    [onHoverStart, hoverDelay]
  );

  const handleMouseLeave = useCallback(
    (element, index) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => onHoverEnd(element, index), hoverDelay);
    },
    [onHoverEnd, hoverDelay]
  );

  useEffect(() => () => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current), []);

  return { handleMouseEnter, handleMouseLeave };
};
