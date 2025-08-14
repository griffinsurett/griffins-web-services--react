// src/components/BorderTitle.jsx
// "px-5 py-2 text-sm uppercase tracking-wider mb-6"
import React, { useEffect, useRef, useState } from "react";
import AnimatedBorder from "./AnimatedBorder";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

/**
 * BorderTitle
 * - First time in view: run a single progress sweep, fading text in.
 * - After that: keep a solid ring lit (always on).
 * - Optional: on hover, show a subtle sweep overlay.
 */
export default function BorderTitle({
  children,
  className = "",
  duration = 1200,          // ms for first sweep + text fade
  hoverSweep = true,        // show animated sweep on hover
  pillPadding = "text-sm px-5 py-2 tracking-wider" // spacing around the text
}) {
  const hostRef = useRef(null);

  // one-time “seen” flag + transient “animating now” state
  const [hasPlayed, setHasPlayed] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Use your IO helper just to know when we’ve entered once
  const seen = useScrollAnimation(hostRef, {
    threshold: 0.25,
    onForward: () => {},
    onBackward: () => {},
    pauseDelay: duration
  });

  // Kick off the one-time animation when first seen
  useEffect(() => {
    if (!hasPlayed && seen) {
      setAnimating(true);
      const t = setTimeout(() => {
        setAnimating(false);
        setHasPlayed(true);
      }, duration + 50);
      return () => clearTimeout(t);
    }
  }, [seen, hasPlayed, duration]);

  // The text fades in while animating; then stays visible
  const textVisible = animating || hasPlayed;

  return (
    <div ref={hostRef} className="inline-block mb-6">
      <div className="relative inline-block">
        {/* Base: persist solid ring after first play */}
        {hasPlayed && (
          <AnimatedBorder
            variant="solid"
            triggers="always"
            borderRadius="rounded-full"
            borderWidth={2}
            color="var(--color-accent)"
            className="inline-block"
            innerClassName={`bg-transparent border-transparent ${pillPadding}`}
          >
            <span
              className={`uppercase tracking-wider font-semibold text-accent ${className}`}
              style={{ opacity: 1 }}
            >
              {children}
            </span>
          </AnimatedBorder>
        )}

        {/* First-run progress sweep (and text fade) */}
        {animating && (
          <AnimatedBorder
            variant="progress"
            triggers="always"
            duration={duration}
            borderRadius="rounded-full"
            borderWidth={2}
            color="var(--color-accent)"
            className="inline-block"
            innerClassName={`bg-transparent border-transparent ${pillPadding}`}
          >
            <span
              className={`uppercase tracking-wider font-semibold primary-text ${className}`}
              style={{
                opacity: textVisible ? 1 : 0,
                transition: `opacity ${duration}ms ease`
              }}
            >
              {children}
            </span>
          </AnimatedBorder>
        )}

        {/* Optional: hover sweep overlay (keeps base ring visible) */}
        {hasPlayed && hoverSweep && (
          <div className="absolute inset-0 pointer-events-none">
            <AnimatedBorder
              variant="progress-infinite"
              triggers="hover"
              duration={1200}
              borderRadius="rounded-full"
              borderWidth={2}
              color="var(--color-accent)"
              className="w-full h-full"
              innerClassName="bg-transparent border-transparent px-0 py-0 pointer-events-none"
            >
              {/* empty child; purely decorative overlay */}
              <span className="sr-only">Decorative border sweep</span>
            </AnimatedBorder>
          </div>
        )}
      </div>
    </div>
  );
}
