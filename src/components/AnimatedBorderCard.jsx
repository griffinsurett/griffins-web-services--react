// src/components/AnimatedBorderCard.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";

const AnimatedBorderCard = ({
  children,
  // existing API
  isActive = false,
  progress = 0,
  showFullBorder = false,
  borderRadius = "rounded-3xl",
  borderWidth = "1px",
  className = "",
  innerClassName = "",

  // NEW: built-in hover effects
  hoverProgress = false,           // conic progress ring while hovered
  hoverFull = false,               // solid ring while hovered
  hoverRingDuration = 2000,        // ms per full sweep when hoverProgress is true

  // allow callers to still attach handlers
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [hovered, setHovered] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);

  // drive a looping 0..100 progress while hovered (only if hoverProgress)
  const step = useCallback(
    (ts) => {
      if (!hovered || !hoverProgress) return;
      const last = lastTsRef.current || ts;
      const dt = ts - last;
      lastTsRef.current = ts;

      setInternalProgress((p) => {
        const inc = (dt / hoverRingDuration) * 100;
        const next = p + inc;
        return next >= 100 ? next % 100 : next;
      });

      rafRef.current = requestAnimationFrame(step);
    },
    [hovered, hoverProgress, hoverRingDuration]
  );

  useEffect(() => {
    if (hovered && hoverProgress) {
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
  }, [hovered, hoverProgress, step]);

  // decide what to render
  const hoveredShowsOverlay = (hoverFull || hoverProgress) && hovered;
  const shouldShowOverlay = isActive || hoveredShowsOverlay;

  const useProgress =
    (isActive && !showFullBorder) || (hoverProgress && hovered);

  const useFull =
    (isActive && showFullBorder) || (hoverFull && hovered);

  const effectiveProgress = isActive ? progress : internalProgress;

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
      {shouldShowOverlay && (
        <div
          className={`absolute inset-0 ${borderRadius} pointer-events-none`}
          style={{
            background: useFull
              ? "var(--color-accent)"
              : `conic-gradient(
                  from 0deg,
                  var(--color-accent) 0deg,
                  var(--color-accent) ${effectiveProgress * 3.6}deg,
                  transparent ${effectiveProgress * 3.6}deg,
                  transparent 360deg
                )`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            padding: borderWidth,
          }}
        />
      )}

      {/* Inner content with background that creates the border illusion */}
      <div className={`card-bg ${borderRadius} overflow-hidden relative z-10 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorderCard;
