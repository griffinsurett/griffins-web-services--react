// src/hooks/useAnimatedElement.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useVisibility } from "./useVisibility";
import { useScrollInteraction } from "./useInteractions";
import { useReversibleProgress } from "./useReversibleProgress";

/**
 * useAnimatedElement - Drive CSS animations via visibility and scroll
 * 
 * @param {Object} options
 * @param {React.RefObject} options.ref - Element to animate
 * @param {string} options.animation - CSS animation class name(s)
 * @param {string} options.mode - "load" | "scroll"
 * @param {number} options.duration - Animation duration in ms
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string|number} options.rootMargin - IO rootMargin for early/late trigger
 * @param {boolean} options.reverse - Allow reverse on scroll up/exit
 * @param {boolean} options.once - Only animate once
 * @param {Function} options.onStart - Animation start callback
 * @param {Function} options.onComplete - Animation complete callback
 * @param {Function} options.onReverse - Animation reverse callback
 */
export function useAnimatedElement({
  ref,
  animation = "scale-in",
  mode = "load",
  duration = 1000,
  threshold = 0.3,
  rootMargin = "0px",
  reverse = true,
  once = false,
  onStart,
  onComplete,
  onReverse,
} = {}) {
  const elementRef = ref || useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationStartedRef = useRef(false);

  // Visibility detection
  const inView = useVisibility(elementRef, {
    threshold,
    rootMargin,
    once: once && mode === "load",
  });

  // Progress engine for reversible animations
  const { 
    percent, 
    reversing, 
    setEngaged, 
    reverseOnce, 
    reset 
  } = useReversibleProgress({
    duration,
    mode: reverse ? "backAndForth" : "forwardOnly",
  });

  // Scroll-based progress tracking
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollDirRef = useRef("none");

  // Calculate scroll-based progress
  const calculateScrollProgress = useCallback(() => {
    const el = elementRef.current;
    if (!el || mode !== "scroll") return 0;

    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const screenCenter = windowHeight / 2;
    
    // Progress based on element center vs screen center
    // 0 = element below screen center
    // 50 = element at screen center
    // 100 = element above screen center
    const offset = screenCenter - elementCenter;
    const maxOffset = screenCenter + rect.height / 2;
    const progress = Math.max(0, Math.min(100, (offset / maxOffset) * 50 + 50));
    
    return progress;
  }, [mode, elementRef]);

  // Scroll interaction for scroll mode
  useScrollInteraction({
    elementRef: null, // Use window
    scrollThreshold: 1,
    debounceDelay: 16, // ~60fps
    
    onScrollActivity: useCallback(({ dir }) => {
      if (mode !== "scroll" || !inView) return;
      
      const progress = calculateScrollProgress();
      setScrollProgress(progress);
      scrollDirRef.current = dir;
      
      // Update element based on scroll
      const el = elementRef.current;
      if (el) {
        el.style.setProperty("--animation-progress", `${progress}%`);
        el.style.setProperty("--animation-progress-decimal", progress / 100);
        el.style.setProperty("--animation-direction", dir === "down" ? "forward" : "reverse");
      }
    }, [mode, inView, calculateScrollProgress, elementRef]),
  });

  // Apply animation classes and properties
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Add animation classes
    const animationClasses = animation.split(" ");
    el.classList.add("animated-element", ...animationClasses);

    // Set initial CSS custom properties
    el.style.setProperty("--animation-duration", `${duration}ms`);

    return () => {
      // Cleanup
      el.classList.remove("animated-element", ...animationClasses);
      el.style.removeProperty("--animation-progress");
      el.style.removeProperty("--animation-progress-decimal");
      el.style.removeProperty("--animation-direction");
      el.style.removeProperty("--animation-duration");
    };
  }, [animation, duration, elementRef]);

  // Handle load mode animation
  useEffect(() => {
    if (mode !== "load") return;
    
    const el = elementRef.current;
    if (!el) return;

    if (inView && !hasAnimated) {
      setEngaged(true);
      if (!animationStartedRef.current) {
        animationStartedRef.current = true;
        onStart?.();
      }
    } else if (!inView && reverse && hasAnimated && !once) {
      reverseOnce();
      onReverse?.();
    }

    // Update progress
    el.style.setProperty("--animation-progress", `${percent}%`);
    el.style.setProperty("--animation-progress-decimal", percent / 100);
    el.style.setProperty("--animation-direction", reversing ? "reverse" : "forward");

    // Check completion
    if (percent >= 100 && !hasAnimated) {
      setHasAnimated(true);
      onComplete?.();
    }
  }, [mode, inView, percent, reversing, hasAnimated, once, reverse, setEngaged, reverseOnce, onStart, onComplete, onReverse, elementRef]);

  // Handle scroll mode animation  
  useEffect(() => {
    if (mode !== "scroll") return;
    
    if (scrollProgress > 0 && !animationStartedRef.current) {
      animationStartedRef.current = true;
      onStart?.();
    }
    
    if (scrollProgress >= 100 && !hasAnimated) {
      setHasAnimated(true);
      onComplete?.();
    } else if (scrollProgress <= 0 && hasAnimated && reverse) {
      setHasAnimated(false);
      onReverse?.();
    }
  }, [mode, scrollProgress, hasAnimated, reverse, onStart, onComplete, onReverse]);

  // Reset when leaving view (for non-once animations)
  useEffect(() => {
    if (once && hasAnimated) return;
    
    if (!inView && mode === "load" && !once) {
      reset();
      setHasAnimated(false);
      animationStartedRef.current = false;
    }
  }, [inView, mode, once, hasAnimated, reset]);

  return {
    ref: elementRef,
    inView,
    progress: mode === "load" ? percent : scrollProgress,
    isAnimating: mode === "load" ? (percent > 0 && percent < 100) : (scrollProgress > 0 && scrollProgress < 100),
    hasAnimated,
    direction: mode === "load" ? (reversing ? "reverse" : "forward") : scrollDirRef.current,
  };
}