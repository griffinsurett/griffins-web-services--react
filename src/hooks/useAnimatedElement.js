// src/hooks/useAnimatedElement.js
import { useEffect, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";

/**
 * Minimal "visibility-only" animation driver.
 * - Animates IN when entering viewport
 * - Animates OUT when leaving viewport
 * - Repeats forever (unless once=true is passed to useVisibility)
 *
 * Assumes your CSS transitions between states using data attributes:
 *   .animated-element.scale-in { opacity:0; transform:scale(.96);
 *     transition: transform var(--animation-duration) ease, opacity var(--animation-duration) ease; }
 *   .animated-element.scale-in[data-visible="true"]  { opacity:1; transform:scale(1); }
 *   .animated-element.scale-in[data-visible="false"] { opacity:0; transform:scale(.96); }
 */
export function useAnimatedElement({
  ref,
  animation = "scale-in",
  mode = "load",          // kept for API compatibility; only "load" behavior here
  duration = 600,         // ms
  threshold = 0.2,
  // number (-50) becomes "0px 0px -50px 0px"
  rootMargin = "50px",
  // kept for API compat; CSS decides whether reverse looks animated
  reverse = true,
  // pass true if you really want a single fire; otherwise infinite
  once = false,
  onStart,
  onComplete,   // NOTE: not timed; if you need exact end, listen for transitionend in the component
  onReverse,
} = {}) {
  const elementRef = ref || useRef(null);

  // normalize rootMargin for IntersectionObserver
  const ioRootMargin =
    typeof rootMargin === "number" ? `0px 0px ${rootMargin}px 0px` : String(rootMargin || "0px");

  // visibility (pass through "once" exactly as requested)
  const inView = useVisibility(elementRef, { threshold, rootMargin: ioRootMargin, once });

  // simple bookkeeping (optional outputs)
  const [direction, setDirection] = useState("forward"); // "forward" | "reverse"
  const prevInViewRef = useRef(false);

  // apply static classes & duration
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const classes = String(animation).trim().split(/\s+/).filter(Boolean);
    el.classList.add("animated-element", ...classes);
    el.style.setProperty("--animation-duration", `${duration}ms`);

    return () => {
      el.classList.remove("animated-element", ...classes);
      el.style.removeProperty("--animation-duration");
      el.style.removeProperty("--animation-direction");
      el.removeAttribute("data-visible");
    };
  }, [animation, duration]);

  // core: toggle visibility attrs on enter/exit
  useEffect(() => {
    if (mode !== "load") return; // only "load" semantics here

    const el = elementRef.current;
    if (!el) return;

    const prev = prevInViewRef.current;
    const justEntered = inView && !prev;
    const justExited  = !inView && prev;

    if (justEntered) {
      setDirection("forward");
      el.dataset.visible = "true";
      el.style.setProperty("--animation-direction", "forward");
      onStart?.();
      onComplete?.(); // fire immediately; remove if you rely on precise timing
    }

    if (justExited) {
      setDirection("reverse");
      el.dataset.visible = "false";
      el.style.setProperty("--animation-direction", "reverse");
      onReverse?.();
    }

    // if neither edge, still reflect current visibility
    if (!justEntered && !justExited) {
      el.dataset.visible = inView ? "true" : "false";
    }

    prevInViewRef.current = inView;
  }, [inView, mode, onStart, onComplete, onReverse]);

  // return a familiar shape; progress is binary here (0/100)
  return {
    ref: elementRef,
    inView,
    progress: inView ? 100 : 0,
    isAnimating: inView,           // with transition-based CSS, "animating" === visible state
    hasAnimated: inView,           // simple alias; keep if your callers read it
    direction,                     // "forward" | "reverse"
  };
}
