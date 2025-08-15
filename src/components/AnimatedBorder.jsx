// src/components/AnimatedBorder.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHoverInteraction } from "../hooks/useInteractions";

/**
 * Variants:
 *  - "none"               : no border
 *  - "solid"              : all-at-once border (smooth Tailwind transition)
 *  - "progress"           : sweep 0→100 while active, then FADE OUT on leave/deactivate
 *  - "progress-infinite"  : conic ring, sweeps continuously
 *  - "progress-b-f"       : Forward 0→100 while active, Reverse 100→0 on leave/deactivate
 *
 * Triggers (string or array; any true shows/runs):
 *  - "hover"              : hover-driven
 *  - "always"             : on from mount
 *  - "controlled"         : external `active` controls visibility
 *
 * Optional:
 *  - controller: number | () => number  // provide progress (0..100) yourself
 *  - reverseOn="leave" | "intent" | "never" (overrides default reverse behavior)
 */
const AnimatedBorder = ({
  children,

  // Behavior
  variant = "none",           // "none" | "solid" | "progress" | "progress-infinite" | "progress-b-f"
  triggers = "hover",         // "hover" | "always" | "controlled" | string[]
  active = false,             // for "controlled"

  // Controlled progress (0..100)
  controller,                 // number OR () => number

  // Timings
  duration = 2000,            // ms per sweep (progress variants)
  fadeOutMs = 220,            // ms for progress fade-out

  // Styling
  color = "var(--color-accent)",
  borderRadius = "rounded-3xl",  // tailwind radius class
  borderWidth = 2,               // px or string
  className = "",
  innerClassName = "",

  // Hover behavior
  hoverDelay = 0,
  unhoverIntent,              // optional { enabled, ... } from hook
  reverseOn,                  // "leave" | "intent" | "never" (override)

  // passthrough
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  // ── Setup
  const triggerList = Array.isArray(triggers) ? triggers : [triggers ?? "hover"];
  const triggerSet = new Set(triggerList.map((t) => String(t || "").toLowerCase()));
  const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);

  const wantsHover = triggerSet.has("hover");
  const isAlways = triggerSet.has("always");
  const isControlledTrigger = triggerSet.has("controlled");

  const [hovered, setHovered] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [providedPercent, setProvidedPercent] = useState(
    typeof controller === "number" ? clamp(controller) : 0
  );

  const rafRef = useRef(null);
  const lastTsRef = useRef(0);

  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;

  const isProgress =
    variant === "progress" ||
    variant === "progress-infinite" ||
    variant === "progress-b-f";

  const isInfinite = variant === "progress-infinite";
  const isHovering = wantsHover && hovered;
  const isControlledActive = isControlledTrigger && !!active;

  const controllerIsFn = typeof controller === "function";
  const controllerIsNum = typeof controller === "number";
  const controllerProvided = controllerIsFn || controllerIsNum;

  // Direction (+1 forward, -1 reverse), reverse used only by progress-b-f
  const [dir, setDir] = useState(1);
  const [reversing, setReversing] = useState(false);

  // PROGRESS-only helpers
  const [fadingOut, setFadingOut] = useState(false);
  const [freezeAt, setFreezeAt] = useState(null); // number | null
  const latestPercentRef = useRef(0);
  const [holdAtFull, setHoldAtFull] = useState(false);

  // Triggered = when we should be visibly animating/visible
  const triggered = variant !== "none" && (isAlways || isHovering || isControlledActive);

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

  // Default reverse policy derived from variant (overridable)
  // - progress: never reverse (we fade out)
  // - progress-b-f: reverse on leave by default
  // - progress-infinite: never reverse
  const derivedReversePolicy = useMemo(() => {
    if (reverseOn) return reverseOn;
    if (variant === "progress-b-f" && wantsHover) return "leave";
    return "never";
  }, [reverseOn, variant, wantsHover]);

  // progress-b-f: reverse when deactivated (controlled)
  useEffect(() => {
    if (variant !== "progress-b-f") return;
    if (!isControlledTrigger) return;
    if (controllerProvided) return;

    if (active) {
      setDir(1);
      setReversing(false);
    } else {
      setDir(-1);
      setReversing(true);
    }
  }, [variant, isControlledTrigger, controllerProvided, active]);

  // PROGRESS (controlled): fade out on deactivate
  useEffect(() => {
    if (variant !== "progress") return;
    if (!isControlledTrigger) return;
    if (controllerProvided) return;

    if (active) {
      setFadingOut(false);
      setFreezeAt(null);
      setHoldAtFull(false);
      setDir(1);
    } else {
      setFreezeAt(latestPercentRef.current);
      setFadingOut(true);
      setHoldAtFull(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTsRef.current = 0;
      }
    }
  }, [variant, isControlledTrigger, controllerProvided, active]);

  // Uncontrolled animation runner
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
          } else if (next >= 100) {
            next = 100;
            stopForwardNow = true;
          }
        } else if (next <= 0) {
          next = 0;
          stopReverseNow = true;
        }
        return next;
      });

      if (stopForwardNow && variant === "progress") setHoldAtFull(true);

      if (stopReverseNow || (stopForwardNow && !isInfinite)) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTsRef.current = 0;
        if (stopReverseNow) setReversing(false);
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [dir, duration, isInfinite, variant]
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
      if (!triggered && !reversing && variant !== "progress") {
        setInternalProgress(0);
      }
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [shouldAnimateInternal, step, triggered, reversing, variant]);

  // effective percent
  const effectivePercent = isProgress
    ? clamp(controllerIsFn ? providedPercent : controllerIsNum ? controller : internalProgress)
    : 0;

  // Track latest percent so we can freeze at that value for progress fade-out
  useEffect(() => {
    latestPercentRef.current = effectivePercent;
  }, [effectivePercent]);

  // Fade-out lifecycle for progress
  useEffect(() => {
    if (variant !== "progress") return;
    if (!fadingOut) return;

    const t = setTimeout(() => {
      setFadingOut(false);
      setFreezeAt(null);
      setInternalProgress(0);
      setHoldAtFull(false);
    }, fadeOutMs);

    return () => clearTimeout(t);
  }, [variant, fadingOut, fadeOutMs]);

  // When entering (hover/activate), cancel fade/freeze
  const beginActive = () => {
    setDir(1);
    setReversing(false);
    setFadingOut(false);
    setFreezeAt(null);
  };

  // When leaving (hover) handle per variant
  const handleLeaveVariant = () => {
    if (controllerProvided) return;

    if (variant === "progress-b-f") {
      if (derivedReversePolicy === "leave") {
        setDir(-1);
        setReversing(true);
      }
      return;
    }

    if (variant === "progress") {
      setFreezeAt(latestPercentRef.current);
      setFadingOut(true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTsRef.current = 0;
      }
    }
  };

  // Visibility logic
  const showBorder =
    variant === "progress"
      ? triggered || fadingOut
      : variant !== "none" && (isAlways || isHovering || isControlledActive || reversing);

  // Styles
  const baseMask = {
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
  };

  // Solid: animate opacity + padding via Tailwind transition classes
  const overlayStyleSolid = {
    background: color,
    ...baseMask,
    padding: triggered ? bw : "0px",
    opacity: triggered ? 1 : 0,
  };

  const displayPercent = freezeAt != null ? freezeAt : effectivePercent;

  const overlayStyleProgress = {
    background: `conic-gradient(
      from 0deg,
      ${color} 0deg,
      ${color} ${displayPercent * 3.6}deg,
      transparent ${displayPercent * 3.6}deg,
      transparent 360deg
    )`,
    ...baseMask,
    padding: bw,
    opacity: variant === "progress" ? (triggered ? 1 : 0) : 1,
    transition: variant === "progress" ? `opacity ${fadeOutMs}ms cubic-bezier(.2,0,0,1)` : undefined,
    willChange: variant === "progress" ? "opacity" : undefined,
  };

  // Hover intent plumbing (only matters if reverseOn="intent")
  const mergedUnhoverIntent = useMemo(() => {
    if (!unhoverIntent?.enabled) return unhoverIntent;
    const userCommit = unhoverIntent.onUnhoverCommit;
    const userCancel = unhoverIntent.onUnhoverCancel;
    return {
      ...unhoverIntent,
      onUnhoverCommit: (el, idx, meta) => {
        if (derivedReversePolicy === "intent" && variant === "progress-b-f" && !controllerProvided) {
          setDir(-1);
          setReversing(true);
        }
        userCommit?.(el, idx, meta);
      },
      onUnhoverCancel: (el, idx, meta) => {
        userCancel?.(el, idx, meta);
      },
    };
  }, [unhoverIntent, derivedReversePolicy, variant, controllerProvided]);

  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    hoverDelay,
    unhoverIntent: mergedUnhoverIntent,
  });

  // Mount policy:
  //  - solid: always mount (so it can animate opacity/padding)
  //  - others: mount while active/reversing; for progress also during fadingOut
  const mountOverlay = variant === "solid" ? variant !== "none" : showBorder;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={(e) => {
      if (wantsHover) {
         setHovered(true);
         beginActive();
         handleMouseEnter(e.currentTarget);
       }
       onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
      if (wantsHover) {
         setHovered(false);
         handleLeaveVariant();
         handleMouseLeave(e.currentTarget);
       }
       onMouseLeave?.(e);
      }}
      {...rest}
    >
      {mountOverlay && variant !== "none" && (
        <div
          className={`absolute inset-0 ${borderRadius} pointer-events-none z-20 ${
            variant === "solid"
              ? "transition-all duration-800 ease-in-out"
              : variant === "progress"
              ? "transition-all"
              : ""
          }`}
          style={variant === "solid" ? overlayStyleSolid : overlayStyleProgress}
        />
      )}

      <div className={`relative z-10 overflow-hidden ${borderRadius} ${innerClassName} card-bg`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;
