// src/components/AnimatedBorder.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHoverInteraction } from "../hooks/useInteractions";

/**
 * Variants:
 *  - "none"               : no border
 *  - "solid"              : all-at-once border
 *  - "progress"           : conic ring, one sweep (0→100) then hold
 *  - "progress-infinite"  : conic ring, sweeps continuously
 *
 * Triggers (string or array; any true shows/runs):
 *  - "hover"              : hover-activated, reverses on leave (default)
 *  - "hover-no-reverse"   : hover-activated, **no reverse** on leave
 *  - "always"             : on from mount (no reverse)
 *  - "controlled"         : external `active` controls visibility (no reverse)
 *
 * Controlled progress (0..100):
 *  - controller: number | () => number
 *
 * Reverse policy:
 *  - If `reverseOn` prop is omitted, it’s derived from triggers:
 *      • includes "hover"            → "leave"
 *      • includes "hover-no-reverse" → "never"
 *      • otherwise                   → "never"
 *  - You can still override with reverseOn="leave" | "intent" | "never"
 */
const AnimatedBorder = ({
  children,

  // Behavior
  variant = "none",           // "none" | "solid" | "progress" | "progress-infinite"
  triggers = "hover",         // "hover" | "hover-no-reverse" | "always" | "controlled" | string[]
  active = false,             // used by "controlled"

  // Controlled progress (0..100)
  controller,                 // number OR () => number

  // Uncontrolled animation timing
  duration = 2000,            // ms per sweep

  // Styling
  color = "var(--color-accent)",
  borderRadius = "rounded-3xl",
  borderWidth = 2,            // px or string
  className = "",
  innerClassName = "",

  // Hover behavior
  hoverDelay = 0,
  unhoverIntent,              // optional { enabled, ... } from hook
  reverseOn,                  // optional override: "leave" | "intent" | "never"

  // passthrough DOM events
  onMouseEnter,
  onMouseLeave,

  ...rest
}) => {
  // ── Setup
  const triggerList = Array.isArray(triggers) ? triggers : [triggers ?? "hover"];
  const triggerSet = new Set(triggerList.map((t) => String(t || "").toLowerCase()));
  const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);

  // Extended hover modes
  const hoverNoReverse = triggerSet.has("hover-no-reverse");
  const wantsHover = triggerSet.has("hover") || hoverNoReverse;

  const [hovered, setHovered] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [providedPercent, setProvidedPercent] = useState(
    typeof controller === "number" ? clamp(controller) : 0
  );

  const rafRef = useRef(null);
  const lastTsRef = useRef(0);

  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;
  const isProgress = variant === "progress" || variant === "progress-infinite";
  const isInfinite = variant === "progress-infinite";

  const isAlways = triggerSet.has("always");
  const isHovering = wantsHover && hovered;
  const isControlled = triggerSet.has("controlled") && !!active;

  const controllerIsFn = typeof controller === "function";
  const controllerIsNum = typeof controller === "number";
  const controllerProvided = controllerIsFn || controllerIsNum;

  // Reverse-on-leave state
  const [reversing, setReversing] = useState(false);
  const [dir, setDir] = useState(1); // +1 forward, -1 reverse

  // Only considered “triggered” when visible drivers are active
  const triggered = variant !== "none" && (isAlways || isHovering || isControlled);

  // Keep providedPercent in sync for numeric controller
  useEffect(() => {
    if (controllerIsNum) setProvidedPercent(clamp(controller));
  }, [controllerIsNum, controller]);

  // Poll controller() while actively triggered
  useEffect(() => {
    if (!(triggered && isProgress && controllerIsFn)) return;
    let frame;
    const tick = () => {
      try {
        setProvidedPercent(clamp(controller()));
      } catch {}
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [triggered, isProgress, controllerIsFn, controller]);

  // Internal animation (uncontrolled)
  const shouldAnimateInternal =
    isProgress && !controllerProvided && (triggered || reversing);

  const step = useCallback(
    (ts) => {
      const last = lastTsRef.current || ts;
      const dt = ts - last;
      lastTsRef.current = ts;

      let stopReverseNow = false;
      let stopForwardNow = false;

      setInternalProgress((p) => {
        const delta = (dt / duration) * 100 * (dir >= 0 ? 1 : -1);
        let next = p + delta;

        if (dir >= 0) {
          if (isInfinite) {
            next = next % 100;
            if (next < 0) next += 100;
          } else {
            if (next >= 100) {
              next = 100;
              stopForwardNow = true;
            }
          }
        } else {
          if (next <= 0) {
            next = 0;
            stopReverseNow = true;
          }
        }
        return next;
      });

      if (stopReverseNow || (stopForwardNow && !isInfinite)) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTsRef.current = 0;
        if (stopReverseNow) setReversing(false);
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [dir, duration, isInfinite]
  );

  useEffect(() => {
    if (shouldAnimateInternal) {
      if (!rafRef.current) {
        lastTsRef.current = 0;
        rafRef.current = requestAnimationFrame(step);
      }
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = 0;
      if (!triggered && !reversing) setInternalProgress(0);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [shouldAnimateInternal, step, triggered, reversing]);

  const effectivePercent = isProgress
    ? clamp(controllerIsFn ? providedPercent : controllerIsNum ? controller : internalProgress)
    : 0;

  // Border shows while triggered or while reversing animation is finishing
  const showBorder =
    variant !== "none" && (isAlways || isHovering || isControlled || reversing);

  // Derived default reverse policy (unless user overrode via prop)
  const derivedReversePolicy = useMemo(() => {
    if (reverseOn) return reverseOn; // explicit override
    if (hoverNoReverse) return "never";
    if (wantsHover) return "leave";
    return "never"; // always/controlled/non-hover → never reverse
  }, [reverseOn, hoverNoReverse, wantsHover]);

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

  // ── Hover wiring (with optional unhover intent)
  const mergedUnhoverIntent = useMemo(() => {
    if (!unhoverIntent?.enabled) return unhoverIntent;
    const userCommit = unhoverIntent.onUnhoverCommit;
    const userCancel = unhoverIntent.onUnhoverCancel;

    return {
      ...unhoverIntent,
      onUnhoverCommit: (el, idx, meta) => {
        if (derivedReversePolicy === "intent" && isProgress && !controllerProvided) {
          setDir(-1);
          setReversing(true);
        }
        userCommit?.(el, idx, meta);
      },
      onUnhoverCancel: (el, idx, meta) => {
        userCancel?.(el, idx, meta);
      },
    };
  }, [unhoverIntent, derivedReversePolicy, isProgress, controllerProvided]);

  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    hoverDelay,
    unhoverIntent: mergedUnhoverIntent,
  });

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={(e) => {
        setHovered(true);
        setDir(1);
        setReversing(false);
        onMouseEnter?.(e);
        handleMouseEnter(e.currentTarget);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);

        // Reverse only for hover modes, and only per the derived policy.
        if (isProgress && !controllerProvided) {
          if (derivedReversePolicy === "leave") {
            setDir(-1);
            setReversing(true);
          }
          // "intent": handled in mergedUnhoverIntent on commit
          // "never": do nothing
        }

        handleMouseLeave(e.currentTarget);
      }}
      {...rest}
    >
      {showBorder && variant !== "none" && (
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