// src/hooks/useVisibility.js
import { useEffect, useRef, useState } from "react";

/**
 * useVisibility(ref, options)
 * ----------------------------------------
 * Returns a boolean indicating whether the element is currently in the viewport
 * (or `true` once it's ever been seen if `once: true`).
 *
 * It also supports optional scroll direction callbacks (onForward / onBackward)
 * and menu checkbox syncing (for header menus).
 */
export function useVisibility(
  ref,
  {
    // IntersectionObserver options
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    once = false,               // if true, return true after the first entry and stop observing

    // Callbacks for entering/leaving the IO threshold
    onEnter,
    onExit,

    // Optional scroll-direction behaviors (ported from useScrollAnimation)
    onForward,                  // called on downward scroll
    onBackward,                 // called on upward scroll near top
    pauseDelay = 100,           // debounce between direction callbacks
    restoreAtTopOffset = 100,   // show-on-up only when near top
    menuCheckboxId = "nav-toggle",
  } = {}
) {
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  // Intersection Observer
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const isIn = entry.isIntersecting;
        setVisible(isIn);
        if (isIn) {
          if (!seen) setSeen(true);
          onEnter?.(entry);
          if (once) io.disconnect();
        } else {
          onExit?.(entry);
        }
      },
      { root, rootMargin, threshold }
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, root, rootMargin, threshold, once, onEnter, onExit]);

  // Direction-aware scroll handlers (only if callbacks provided)
  const pauseTimeout = useRef(null);
  const lastY = useRef(typeof window !== "undefined" ? window.pageYOffset : 0);

  useEffect(() => {
    const wantsDirection = typeof onForward === "function" || typeof onBackward === "function";
    if (!wantsDirection) return;

    function handleMovement(deltaY) {
      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        onForward?.();
      } else if (deltaY < 0) {
        if (window.pageYOffset <= restoreAtTopOffset) onBackward?.();
      }

      pauseTimeout.current = setTimeout(() => {}, pauseDelay);
    }

    function onWheel(e) {
      handleMovement(e.deltaY || 0);
    }
    function onScroll() {
      const y = window.pageYOffset;
      handleMovement(y - lastY.current);
      lastY.current = y;
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(pauseTimeout.current);
    };
  }, [onForward, onBackward, pauseDelay, restoreAtTopOffset]);

  // Optional: react to a menu checkbox toggling (force show/hide behavior)
  useEffect(() => {
    if (!menuCheckboxId) return;
    const box = document.getElementById(menuCheckboxId);
    if (!box) return;

    const syncMenu = () => {
      if (box.checked) {
        onBackward?.();
      } else {
        if (window.pageYOffset > restoreAtTopOffset) onForward?.();
        else onBackward?.();
      }
    };

    box.addEventListener("change", syncMenu);
    // initialize once on mount
    syncMenu();

    return () => box.removeEventListener("change", syncMenu);
  }, [menuCheckboxId, onForward, onBackward, restoreAtTopOffset]);

  // For `once: true`, return "have we ever been visible?"
  return once ? seen : visible;
}
