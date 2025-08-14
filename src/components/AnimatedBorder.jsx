// src/components/AnimatedBorder.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Variants:
 *  - "none"               : no border
 *  - "solid"              : all-at-once border
 *  - "progress"           : conic ring, one sweep (0→100) then hold
 *  - "progress-infinite"  : conic ring, sweeps continuously
 *
 * Triggers (any true = show):
 *  - "hover" | "always" | "controlled"
 *
 * Controlled value:
 *  - controller: number | () => number      (0..100)
 *      - If number: we render that fill.
 *      - If function: we poll it via rAF while active/visible.
 *      - If omitted: we auto-animate based on variant.
 */
const AnimatedBorder = ({
  children,

  // Behavior
  variant = "none", // "none" | "solid" | "progress" | "progress-infinite"
  triggers = "hover", // string | string[]
  active = false, // used by "controlled" trigger

  // Controlled progress (0..100)
  controller, // number OR () => number

  // Uncontrolled animation timing
  duration = 2000, // ms per sweep

  // Styling
  color = "var(--color-accent)",
  borderRadius = "rounded-3xl",
  borderWidth = 2, // px or string
  className = "",
  innerClassName = "",

  // passthrough events
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  // normalize triggers
  const triggerList = Array.isArray(triggers)
    ? triggers
    : [triggers ?? "hover"];
  const triggerSet = new Set(
    triggerList.map((t) => String(t || "").toLowerCase())
  );

  const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);

  const [hovered, setHovered] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [providedPercent, setProvidedPercent] = useState(
    typeof controller === "number" ? clamp(controller) : 0
  );

  const rafRef = useRef(null); // internal sweep
  const pullRef = useRef(null); // controller() polling
  const lastTsRef = useRef(0);

  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;
  const isProgress = variant === "progress" || variant === "progress-infinite";
  const isInfinite = variant === "progress-infinite";

  const isAlways = triggerSet.has("always");
  const wantsHover = triggerSet.has("hover");
  const isHovering = wantsHover && hovered;
  const isControlled = triggerSet.has("controlled") && !!active;

  const triggered =
    variant !== "none" && (isAlways || isHovering || isControlled);

  const controllerIsFn = typeof controller === "function";
  const controllerIsNum = typeof controller === "number";

  // keep providedPercent in sync for numeric controller
  useEffect(() => {
    if (controllerIsNum) setProvidedPercent(clamp(controller));
  }, [controllerIsNum, controller]);

  // poll controller() while active/visible
  useEffect(() => {
    if (!(triggered && isProgress && controllerIsFn)) return;
    let frame;
    const tick = () => {
      try {
        setProvidedPercent(clamp(controller()));
      } catch {
        /* ignore */
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    pullRef.current = frame;
    return () => {
      if (pullRef.current) cancelAnimationFrame(pullRef.current);
      pullRef.current = null;
    };
  }, [triggered, isProgress, controllerIsFn, controller]);

  // internal sweep (only when no controller is provided)
  const needsInternalProgress =
    triggered && isProgress && !controllerIsFn && !controllerIsNum;

  const step = useCallback(
    (ts) => {
      if (!needsInternalProgress) return;
      const last = lastTsRef.current || ts;
      const dt = ts - last;
      lastTsRef.current = ts;

      let nextVal = 0;
      setInternalProgress((p) => {
        const inc = (dt / duration) * 100;
        nextVal = p + inc;
        return isInfinite
          ? nextVal >= 100
            ? nextVal % 100
            : nextVal
          : nextVal >= 100
          ? 100
          : nextVal;
      });

      if (!isInfinite && nextVal >= 100) {
        rafRef.current = null; // stop after one sweep
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    },
    [needsInternalProgress, duration, isInfinite]
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

  const effectivePercent = isProgress
    ? clamp(
        controllerIsFn
          ? providedPercent
          : controllerIsNum
          ? controller
          : internalProgress
      )
    : 0;

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
      : isProgress
      ? {
          background: `conic-gradient(
            from 0deg,
            ${color} 0deg,
            ${color} ${effectivePercent * 3.6}deg,
            transparent ${effectivePercent * 3.6}deg,
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

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      {triggered && variant !== "none" && (
        <div
          className={`absolute inset-0 ${borderRadius} pointer-events-none`}
          style={overlayStyle}
        />
      )}

      <div
        className={`card-bg ${borderRadius} overflow-hidden relative z-10 ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;
