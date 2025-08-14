// src/components/AnimatedBorderCard.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * A tiny border engine with two variants and three trigger modes.
 *
 * Props:
 *  - variant:    "none" | "solid" | "progress"
 *  - trigger:    "hover" | "always" | "controlled"
 *  - active:     boolean (when trigger="controlled")
 *  - progress:   number 0..100 (optional; only used for progress+controlled)
 *  - duration:   ms per sweep when internally animating (default 2000)
 *  - loop:       whether internal progress loops (default true)
 *  - color:      CSS color for the ring (default var(--color-accent))
 *  - borderRadius, borderWidth, className, innerClassName: styling
 */
const AnimatedBorderCard = ({
  children,

  // Behavior
  variant = "none",            // "none" | "solid" | "progress"
  trigger = "hover",           // "hover" | "always" | "controlled"
  active = false,              // used when trigger="controlled"

  // Progress control
  progress,                    // 0..100 (if controlled progress)
  duration = 2000,             // ms per sweep when internally animated
  loop = true,                 // loop internal progress

  // Styling
  color = "var(--color-accent)",
  borderRadius = "rounded-3xl",
  borderWidth = 2,             // px or string
  className = "",
  innerClassName = "",

  // Pass-through events still work
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [hovered, setHovered] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);

  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;

  // Trigger resolution
  const triggered =
    variant !== "none" &&
    (trigger === "always" ||
      (trigger === "hover" && hovered) ||
      (trigger === "controlled" && !!active));

  // Should we animate internally?
  const needsInternalProgress =
    triggered && variant === "progress" && (progress == null);

  // Internal RAF loop for progress variant
  const step = useCallback(
    (ts) => {
      if (!needsInternalProgress) return;
      const last = lastTsRef.current || ts;
      const dt = ts - last;
      lastTsRef.current = ts;

      setInternalProgress((p) => {
        const inc = (dt / duration) * 100;
        const next = p + inc;
        if (loop) return next >= 100 ? next % 100 : next;
        return next >= 100 ? 100 : next;
      });

      if (!loop && internalProgress >= 100) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    },
    [needsInternalProgress, duration, loop, internalProgress]
  );

  useEffect(() => {
    if (needsInternalProgress) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(step);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = 0;
      setInternalProgress(0);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [needsInternalProgress, step]);

  const effectiveProgress =
    variant === "progress"
      ? (progress != null ? progress : internalProgress)
      : 0;

  // Compose overlay style
  const overlayStyle =
    variant === "solid"
      ? {
          background: color,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: bw,
        }
      : variant === "progress"
      ? {
          background: `conic-gradient(
            from 0deg,
            ${color} 0deg,
            ${color} ${effectiveProgress * 3.6}deg,
            transparent ${effectiveProgress * 3.6}deg,
            transparent 360deg
          )`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: bw,
        }
      : {};

  const handleEnter = (e) => {
    setHovered(true);
    onMouseEnter?.(e);
  };
  const handleLeave = (e) => {
    setHovered(false);
    onMouseLeave?.(e);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {triggered && variant !== "none" && (
        <div
          className={`absolute inset-0 ${borderRadius} pointer-events-none`}
          style={overlayStyle}
        />
      )}

      <div className={`card-bg ${borderRadius} overflow-hidden relative z-10 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorderCard;
