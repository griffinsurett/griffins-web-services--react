// src/hooks/useScrollAnimation.js
import { useEffect, useState, useRef } from "react";

export function useScrollAnimation(
  ref,
  {
    // intersection‐observer threshold for “in view”
    threshold           = 0.1,
    // called on any downward scroll (hide)
    onForward           = () => {},
    // called on upward scroll or menu‐open (show)
    onBackward          = () => {},
    // debounce between calls (ms)
    pauseDelay          = 100,
    // px from top to still count as “at top”
    restoreAtTopOffset  = 100,
    // OPTIONAL: the id of your menu’s <input type="checkbox" />
    menuCheckboxId      = "headerMenu-toggle",
  } = {}
) {
  const [inView, setInView] = useState(false);
  const pauseTimeout = useRef();
  const lastY = useRef(
    typeof window !== "undefined" ? window.pageYOffset : 0
  );

  // ── 1) wait until element scrolls into view, then start scroll/wheel logic
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  // ── 2) scroll & wheel → hide/show based on deltaY & offset
  useEffect(() => {
    if (!inView) return;

    function handleMovement(deltaY) {
      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        // scrolling down → hide
        onForward();
      } else if (deltaY < 0) {
        // scrolling up → only show if near top
        if (window.pageYOffset <= restoreAtTopOffset) {
          onBackward();
        }
      }

      pauseTimeout.current = setTimeout(() => {
        // optional: onPause()
      }, pauseDelay);
    }

    function onWheel(e) {
      handleMovement(e.deltaY);
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
  }, [inView, onForward, onBackward, pauseDelay, restoreAtTopOffset]);

  // ── 3) watch your menu checkbox → force “show” on open, revert on close
  useEffect(() => {
    if (!menuCheckboxId) return;
    const box = document.getElementById(menuCheckboxId);
    if (!box) return;

    const syncMenu = () => {
      if (box.checked) {
        // menu just opened → show
        onBackward();
      } else {
        // menu just closed → mirror scroll‐position
        if (window.pageYOffset > restoreAtTopOffset) {
          onForward();
        } else {
          onBackward();
        }
      }
    };

    box.addEventListener("change", syncMenu);
    // initialize on mount
    syncMenu();

    return () => box.removeEventListener("change", syncMenu);
  }, [menuCheckboxId, onForward, onBackward, restoreAtTopOffset]);

  return inView;
}
