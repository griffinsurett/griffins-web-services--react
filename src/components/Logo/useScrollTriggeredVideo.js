// src/hooks/useScrollTriggeredVideo.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useScrollInteraction } from "../../hooks/animations/useInteractions";

/**
 * useScrollTriggeredVideo(containerRef, videoRef, menuCheckboxIdOrOptions?, options?)
 *
 * Back-compat:
 *  - 3rd arg as string = menuCheckboxId
 *  - Or pass an object: { menuCheckboxId, threshold, visibleRootMargin }
 *  - Or (legacy style) 4th arg as options while 3rd is a string id
 */
export function useScrollTriggeredVideo(
  containerRef,
  videoRef,
  menuCheckboxIdOrOptions = "headerMenu-toggle",
  maybeOptions
) {
  // ── normalize args
  let menuCheckboxId = "headerMenu-toggle";
  let opts = {};
  if (
    typeof menuCheckboxIdOrOptions === "string" ||
    menuCheckboxIdOrOptions == null
  ) {
    menuCheckboxId = menuCheckboxIdOrOptions ?? "headerMenu-toggle";
    opts = maybeOptions ?? {};
  } else {
    opts = menuCheckboxIdOrOptions || {};
    menuCheckboxId = opts.menuCheckboxId ?? "headerMenu-toggle";
  }

  const {
    threshold = 0.1,
    visibleRootMargin = 0, // number | string | {top,right,bottom,left}
  } = opts;

  // ── normalize rootMargin like other hooks
  const rootMargin = useMemo(() => {
    const toPx = (v) => (typeof v === "number" ? `${v}px` : `${v}`);
    if (typeof visibleRootMargin === "number") {
      const n = Math.max(0, visibleRootMargin | 0);
      return `-${n}px 0px -${n}px 0px`; // shrink top & bottom by N px
    }
    if (visibleRootMargin && typeof visibleRootMargin === "object") {
      const { top = 0, right = 0, bottom = 0, left = 0 } = visibleRootMargin;
      return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
    }
    return visibleRootMargin || "0px";
  }, [visibleRootMargin]);

  // ✅ rely on our hook; "once" mimics the old "disconnect on first view"
  const seenOnce = useVisibility(containerRef, {
    threshold,
    rootMargin,
    once: true,
  });

  const [activated, setActivated] = useState(false);
  const pauseTimeout = useRef(null);
  const isPlaying = useRef(false);
  const lastScrollTime = useRef(0);
  const reverseAnimationFrame = useRef(null);

  // ✅ FIXED: Improved scroll handling with proper BACKWARD PLAYBACK
  const handleMovement = useMemo(
    () => (deltaY) => {
      const vid = videoRef.current;
      const now = Date.now();
      lastScrollTime.current = now;

      // Clear any existing pause timeout since we're actively scrolling
      clearTimeout(pauseTimeout.current);
      // Cancel any ongoing reverse animation
      if (reverseAnimationFrame.current) {
        cancelAnimationFrame(reverseAnimationFrame.current);
        reverseAnimationFrame.current = null;
      }

      // First scroll down ever → activate
      if (!activated && deltaY > 0) {
        setActivated(true);
        return;
      }
      if (!vid) return;

      console.log('Scroll deltaY:', deltaY, 'Current time:', vid.currentTime);

      const scrollSpeed = Math.abs(deltaY);
      
      if (deltaY > 0) {
        // Scrolling down - play forward
        console.log('Scrolling DOWN - playing forward');
        
        // Stop any reverse playback
        if (vid.playbackRate < 0) {
          vid.pause();
        }
        
        if (vid.paused || !isPlaying.current) {
          vid.play().catch(() => {});
          isPlaying.current = true;
        }
        
        // Set positive playback rate for forward play
        const forwardRate = Math.min(Math.max(scrollSpeed / 20, 0.5), 2.0);
        vid.playbackRate = forwardRate;
        console.log('Forward playback rate:', forwardRate);
        
      } else if (deltaY < 0) {
        // Scrolling up - play backward
        console.log('Scrolling UP - playing BACKWARD');
        
        // Try using negative playbackRate for smooth reverse
        try {
          if (vid.paused || !isPlaying.current) {
            vid.play().catch(() => {});
            isPlaying.current = true;
          }
          
          // Set negative playback rate for backward play
          const backwardRate = -Math.min(Math.max(scrollSpeed / 20, 0.5), 2.0);
          vid.playbackRate = backwardRate;
          console.log('Backward playback rate:', backwardRate);
          
        } catch (error) {
          // Fallback: manual reverse animation if negative playbackRate isn't supported
          console.log('Negative playbackRate not supported, using manual reverse');
          vid.pause();
          isPlaying.current = false;
          
          const animateReverse = () => {
            if (vid.currentTime > 0) {
              const rewindSpeed = Math.min(Math.max(scrollSpeed / 30, 0.03), 0.1);
              vid.currentTime = Math.max(vid.currentTime - rewindSpeed, 0);
              reverseAnimationFrame.current = requestAnimationFrame(animateReverse);
            }
          };
          animateReverse();
        }
        
        // If we're at the very top of the page, ensure we're at the beginning
        if (window.pageYOffset <= 10) {
          console.log('At top of page - ensuring video at start');
          vid.currentTime = 0;
        }
      }

      // ✅ Pause after scroll ends
      pauseTimeout.current = setTimeout(() => {
        if (now === lastScrollTime.current && vid) {
          vid.pause();
          isPlaying.current = false;
          // Cancel any ongoing reverse animation
          if (reverseAnimationFrame.current) {
            cancelAnimationFrame(reverseAnimationFrame.current);
            reverseAnimationFrame.current = null;
          }
          console.log('Auto-paused after scroll ended');
        }
      }, 300);
    },
    [activated, videoRef]
  );

  // ✅ FIXED: More responsive scroll detection
  useScrollInteraction({
    elementRef: null, // Use window (default)
    scrollThreshold: 1, // Very sensitive to any scroll
    debounceDelay: 8, // Reduced for more responsive feel (~120fps)
    trustedOnly: true,
    wheelSensitivity: 1,

    // Only attach when the section has been seen once
    onScrollActivity: seenOnce
      ? ({ dir, delta }) => {
          // Convert direction to deltaY for compatibility
          const deltaY = dir === "down" ? delta : -delta;
          handleMovement(deltaY);
        }
      : undefined,

    onWheelActivity: seenOnce
      ? ({ deltaY }) => {
          handleMovement(deltaY);
        }
      : undefined,
  });

  // Autoplay as soon as "activated" and handle video events
  useEffect(() => {
    if (!activated || !videoRef.current) return;
    const vid = videoRef.current;
    
    // Start playing forward
    vid.playbackRate = 0.5;
    vid.play().catch(() => {});
    isPlaying.current = true;

    // Handle video reaching boundaries during playback
    const handleTimeUpdate = () => {
      // If playing backward and reached the beginning, pause
      if (vid.playbackRate < 0 && vid.currentTime <= 0) {
        vid.pause();
        vid.currentTime = 0;
        isPlaying.current = false;
        console.log('Reached beginning during reverse play');
      }
      // If playing forward and reached the end, loop or pause
      else if (vid.playbackRate > 0 && vid.currentTime >= vid.duration - 0.1) {
        // For looping behavior during scroll-controlled playback
        if (isPlaying.current) {
          vid.currentTime = 0;
        }
      }
    };

    vid.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      vid.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activated, videoRef]);

  // Menu checkbox → reset video to 0 on open
  useEffect(() => {
    if (!menuCheckboxId) return;
    const box = document.getElementById(menuCheckboxId);
    if (!box) return;

    const resetOnOpen = () => {
      if (box.checked && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
        isPlaying.current = false;
      }
    };

    box.addEventListener("change", resetOnOpen);
    // in case it's already open on mount
    resetOnOpen();

    return () => {
      box.removeEventListener("change", resetOnOpen);
    };
  }, [menuCheckboxId, videoRef]);

  // Cleanup pause timeout on unmount
  useEffect(
    () => () => {
      clearTimeout(pauseTimeout.current);
      if (reverseAnimationFrame.current) {
        cancelAnimationFrame(reverseAnimationFrame.current);
      }
    },
    []
  );

  return { activated };
}