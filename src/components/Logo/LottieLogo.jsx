// src/components/Logo/LottieLogo.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import lottie from "lottie-web";
import { useVisibility } from "../../hooks/animations/useVisibility";

// Import your Lottie JSON file
import LOGO_ANIMATION from "../../../public/Lotties/Animation_logo_small_size.json";
// Or if you prefer to load it as a path:
// const LOGO_ANIMATION_PATH = "/lotties/Animation_logo_small_size.json";

/**
 * LottieLogo - Drop-in replacement for VideoLogo using Lottie
 * Maintains the same props and behavior as VideoLogo
 */
export default function LottieLogo({
  alt = "",
  className = "logo-class",
  mediaClasses = "block w-[35px] p-0 m-0 md:w-[40px] lg:w-[45px] h-auto",
  loading = "lazy",
  trigger = "auto", // "auto" | "scroll" | "visible"
  respectReducedMotion = true,
}) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastDirection = useRef(null);
  
  const [activated, setActivated] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);

  // Detect if the page can scroll (run on client after mount)
  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  // Resolve effective trigger
  const effectiveTrigger = useMemo(() => {
    if (trigger === "scroll" || trigger === "visible") return trigger;
    return pageScrollable ? "scroll" : "visible";
  }, [trigger, pageScrollable]);

  // Reduced motion guard
  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Visibility detection
  const visible = useVisibility(containerRef, {
    threshold: 0,
    rootMargin: "0px",
    once: true,
  });

  // Initialize Lottie animation
  useEffect(() => {
    if (!containerRef.current) return;
    if (prefersReduced) return; // Don't load animation if reduced motion

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg", // Can change to "canvas" for better performance
      loop: true,
      autoplay: false,
      animationData: LOGO_ANIMATION, // Use the imported JSON directly
      // OR if loading from path:
      // path: LOGO_ANIMATION_PATH,
    });

    // Set initial speed
    animationRef.current.setSpeed(0.5);
    
    // Start from first frame
    animationRef.current.goToAndStop(0, true);

    return () => {
      animationRef.current?.destroy();
    };
  }, [prefersReduced]);

  // Handle scroll-triggered animation
  useEffect(() => {
    if (effectiveTrigger !== "scroll") return;
    if (!visible) return; // Wait until visible at least once
    if (prefersReduced) return;

    const handleScroll = () => {
      const anim = animationRef.current;
      if (!anim) return;

      const currentScrollY = window.pageYOffset || window.scrollY;
      const lastScrollY = handleScroll.lastScrollY || 0;
      const deltaY = currentScrollY - lastScrollY;
      handleScroll.lastScrollY = currentScrollY;

      if (Math.abs(deltaY) < 1) return; // Ignore tiny movements

      // First scroll down - activate
      if (!activated && deltaY > 0) {
        setActivated(true);
      }

      if (!activated) return;

      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        // Scrolling down - play forward
        if (lastDirection.current !== 'forward') {
          anim.setDirection(1); // Forward direction
          anim.play();
          lastDirection.current = 'forward';
        }
      } else if (deltaY < 0) {
        // Scrolling up - play reverse (THIS JUST WORKS WITH LOTTIE!)
        if (lastDirection.current !== 'reverse') {
          anim.setDirection(-1); // Reverse direction
          anim.play();
          lastDirection.current = 'reverse';
        }
      }

      // Pause after inactivity
      pauseTimeout.current = setTimeout(() => {
        anim.pause();
        lastDirection.current = null;
      }, 100);
    };

    // Handle wheel events for smoother response
    const handleWheel = (e) => {
      const anim = animationRef.current;
      if (!anim) return;

      const deltaY = e.deltaY;

      // First scroll down - activate
      if (!activated && deltaY > 0) {
        setActivated(true);
      }

      if (!activated) return;

      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        // Wheel down - play forward
        if (lastDirection.current !== 'forward') {
          anim.setDirection(1);
          anim.play();
          lastDirection.current = 'forward';
        }
      } else if (deltaY < 0) {
        // Wheel up - play reverse
        if (lastDirection.current !== 'reverse') {
          anim.setDirection(-1);
          anim.play();
          lastDirection.current = 'reverse';
        }
      }

      // Pause after inactivity
      pauseTimeout.current = setTimeout(() => {
        anim.pause();
        lastDirection.current = null;
      }, 100);
    };

    // Initialize scroll position
    handleScroll.lastScrollY = window.pageYOffset || window.scrollY;

    // Add listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(pauseTimeout.current);
    };
  }, [effectiveTrigger, visible, activated, prefersReduced]);

  // Handle visibility-triggered animation
  useEffect(() => {
    if (effectiveTrigger !== "visible") return;
    if (prefersReduced) return;
    
    const anim = animationRef.current;
    if (!anim) return;

    if (visible) {
      // Start playing forward when visible
      anim.setDirection(1);
      anim.play();
    }
  }, [effectiveTrigger, visible, prefersReduced]);

  // Handle activation for scroll mode
  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll") {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger]);

  // Show static state for reduced motion
  if (prefersReduced) {
    return (
      <div 
        className={`${className} ${mediaClasses}`}
        aria-label={alt}
        style={{ 
          width: '35px', 
          height: '35px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* You could put a static SVG or image here for reduced motion */}
        <span style={{ fontSize: '24px' }}>🎯</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${className} ${mediaClasses}`}
      aria-label={alt}
    />
  );
}