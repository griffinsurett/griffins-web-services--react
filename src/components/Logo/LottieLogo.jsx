// src/components/Logo/LottieLogo.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import lottie from "lottie-web";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useScrollInteraction } from "../../hooks/animations/useInteractions";

// Static poster image
import POSTER_SRC from "../../assets/GWS-animated.png";
// Import Lottie JSON directly
import LOGO_ANIMATION from "../../Lotties/Animation_logo_small_size.json";

/**
 * LottieLogo - Simple version that mirrors VideoLogo behavior
 */
export default function LottieLogo({
  alt = "",
  className = "logo-class", 
  mediaClasses = "block w-[35px] p-0 m-0 md:w-[40px] lg:w-[45px] h-auto",
  loading = "lazy",
  trigger = "auto",
  respectReducedMotion = true,
}) {
  const containerRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastScrollTime = useRef(0);
  
  const [activated, setActivated] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);

  // Detect if page can scroll
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
  const seenOnce = useVisibility(containerRef, {
    threshold: 0.1,
    rootMargin: "0px",
    once: true,
  });

  const visible = useVisibility(containerRef, {
    threshold: 0,
    rootMargin: "0px", 
    once: false,
  });

  // Final activation decision
  const shouldActivate = prefersReduced
    ? false
    : effectiveTrigger === "scroll"
    ? seenOnce
    : visible;

  // Initialize Lottie when activated
  useEffect(() => {
    if (!shouldActivate || !lottieContainerRef.current || animationRef.current) return;

    console.log('Loading Lottie animation...');
    
    try {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: LOGO_ANIMATION,
      });

      animationRef.current.setSpeed(0.5);
      animationRef.current.goToAndStop(0, true);
      
      console.log('Lottie animation loaded successfully');
    } catch (error) {
      console.error('Failed to load Lottie:', error);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [shouldActivate]);

  // Simple scroll handling
  const handleMovement = useMemo(
    () => (deltaY) => {
      const anim = animationRef.current;
      const now = Date.now();
      lastScrollTime.current = now;

      console.log('Scroll detected:', deltaY, 'Animation exists:', !!anim);

      if (!anim) return;

      // Clear any existing pause timeout
      clearTimeout(pauseTimeout.current);

      // First scroll down ever → activate
      if (!activated && deltaY > 0) {
        setActivated(true);
        console.log('Lottie activated by scroll');
      }

      if (!activated) return;

      if (deltaY > 0) {
        // Scrolling down - play forward
        console.log('Playing FORWARD');
        anim.setDirection(1);
        if (anim.isPaused) {
          anim.play();
        }
      } else if (deltaY < 0) {
        // Scrolling up - play reverse  
        console.log('Playing REVERSE');
        anim.setDirection(-1);
        if (anim.isPaused) {
          anim.play();
        }
      }

      // Pause after scroll stops
      pauseTimeout.current = setTimeout(() => {
        if (now === lastScrollTime.current && anim) {
          anim.pause();
          console.log('Paused after scroll ended');
        }
      }, 200);
    },
    [activated]
  );

  // Scroll detection for scroll mode
  useScrollInteraction({
    elementRef: null,
    scrollThreshold: 1,
    debounceDelay: 8,
    trustedOnly: true,
    wheelSensitivity: 1,

    onScrollActivity: (effectiveTrigger === "scroll" && seenOnce)
      ? ({ dir, delta }) => {
          const deltaY = dir === "down" ? delta : -delta;
          handleMovement(deltaY);
        }
      : undefined,

    onWheelActivity: (effectiveTrigger === "scroll" && seenOnce)
      ? ({ deltaY }) => {
          handleMovement(deltaY);
        }
      : undefined,
  });

  // Handle visibility mode
  useEffect(() => {
    if (effectiveTrigger !== "visible") return;
    if (!animationRef.current) return;

    if (visible) {
      console.log('Visibility triggered - playing forward');
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [effectiveTrigger, visible]);

  // Handle initial activation for scroll mode
  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll") {
      console.log('Initial activation - playing forward');
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(pauseTimeout.current);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {!shouldActivate ? (
        <img
          src={POSTER_SRC}
          alt={alt}
          loading={loading}
          className={`${className} ${mediaClasses}`}
        />
      ) : (
        <div 
          ref={lottieContainerRef}
          className={`${className} ${mediaClasses}`}
          aria-label={alt}
        />
      )}
    </div>
  );
}