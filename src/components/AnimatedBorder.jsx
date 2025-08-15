// src/components/AnimatedBorder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHoverInteraction } from "../hooks/useInteractions";
import { useVisibility } from "../hooks/useVisibility";
import { useReversibleProgress } from "../hooks/useReversibleProgress";

/**
 * Variants:
 *  - "none"               : no border
 *  - "solid"              : all-at-once border (Tailwind transition)
 *  - "progress"           : sweep 0→100 while engaged, then FADE OUT when disengaged
 *  - "progress-infinite"  : conic ring, sweeps continuously while engaged
 *  - "progress-b-f"       : 0→100 while engaged, 100→0 when disengaged (or hover-intent)
 *
 * Triggers:
 *  - "hover" | "visible" | "always" | "controlled"
 *
 * Optional:
 *  - controller: number | () => number  // external percent 0..100
 *  - reverseOn="leave" | "intent" | "never"  // hover reverse policy (b-f only)
 */
const AnimatedBorder = ({
  children,

  // Behavior
  variant = "none",
  triggers = "hover",
  active = false, // for "controlled"

  // Controlled progress
  controller, // number OR () => number

  // Timings
  duration = 2000,
  fadeOutMs = 220,

  // Styling
  color = "var(--color-accent)",
  borderRadius = "rounded-3xl",
  borderWidth = 2,
  className = "",
  innerClassName = "",

  // Hover behavior
  hoverDelay = 0,
  unhoverIntent,
  reverseOn,

  // passthrough
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  // ── triggers
  const triggerList = Array.isArray(triggers) ? triggers : [triggers ?? "hover"];
  const triggerSet = new Set(triggerList.map((t) => String(t || "").toLowerCase()));

  const wantsHover = triggerSet.has("hover");
  const wantsVisible = triggerSet.has("visible");
  const isAlways = triggerSet.has("always");
  const isControlledTrigger = triggerSet.has("controlled");

  const hostRef = useRef(null);
  const inView = useVisibility(hostRef, { threshold: 0.25 });

  const [hovered, setHovered] = useState(false);
  const isHovering = wantsHover && hovered;
  const isControlledActive = isControlledTrigger && !!active;

  // When are we "engaged" (i.e., should run forward)?
  const engaged =
    variant !== "none" &&
    (isAlways || isHovering || isControlledActive || (wantsVisible && inView));

  // external controller?
  const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);
  const controllerIsFn = typeof controller === "function";
  const controllerIsNum = typeof controller === "number";
  const controllerProvided = controllerIsFn || controllerIsNum;

  // choose hook mode based on variant
  const hookMode =
    variant === "progress-infinite"
      ? "infinite"
      : variant === "progress-b-f"
      ? "backAndForth"
      : "forwardOnly";

  // reversible engine
  const { percent, reversing, setEngaged, reverseOnce, reset } =
    useReversibleProgress({ duration, mode: hookMode });

  // keep external controller in sync (if provided)
  const [providedPercent, setProvidedPercent] = useState(
    controllerIsNum ? clamp(controller) : 0
  );
  useEffect(() => {
    if (controllerIsNum) setProvidedPercent(clamp(controller));
  }, [controllerIsNum, controller]);

  useEffect(() => {
    if (!(engaged && controllerIsFn)) return;
    let raf;
    const tick = () => {
      try {
        setProvidedPercent(clamp(controller()));
      } catch {}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engaged, controllerIsFn, controller]);

  // derive hover reverse policy
  const derivedReversePolicy = useMemo(() => {
    if (reverseOn) return reverseOn;
    if (variant === "progress-b-f" && wantsHover) return "leave";
    return "never";
  }, [reverseOn, variant, wantsHover]);

  // drive the engine from triggers (only when not externally controlled)
  // - progress-b-f / infinite: engage while true; auto-reverse (b-f) when false
  // - progress: engage while true; on false freeze+fade then reset
  const [fadingOut, setFadingOut] = useState(false);
  const [freezeAt, setFreezeAt] = useState(null);
  const latestPercentRef = useRef(0);

  // track latest percent (for freezing)
  const effectivePercent = controllerProvided ? providedPercent : percent;
  useEffect(() => {
    latestPercentRef.current = effectivePercent;
  }, [effectivePercent]);

  useEffect(() => {
    if (controllerProvided) return;

    if (variant === "progress-b-f" || variant === "progress-infinite") {
      setEngaged(!!engaged);
      if (!engaged && variant === "progress-b-f") {
        // ensure we actually reverse even if hover-out is very fast
        reverseOnce();
      }
      return;
    }

    if (variant === "progress") {
      if (engaged) {
        setEngaged(true);
        setFadingOut(false);
        setFreezeAt(null);
      } else {
        setFreezeAt(latestPercentRef.current);
        setFadingOut(true);
        setEngaged(false);
      }
    }
  }, [variant, engaged, controllerProvided, setEngaged, reverseOnce]);

  // finish fade-out for "progress" then reset engine to 0
  useEffect(() => {
    if (variant !== "progress" || !fadingOut) return;
    const t = setTimeout(() => {
      setFadingOut(false);
      setFreezeAt(null);
      reset(); // next engage starts from 0
    }, fadeOutMs);
    return () => clearTimeout(t);
  }, [variant, fadingOut, fadeOutMs, reset]);

  // hover intent plumbing (only matters if reverseOn="intent")
  const mergedUnhoverIntent = useMemo(() => {
    if (!unhoverIntent?.enabled) return unhoverIntent;
    const userCommit = unhoverIntent.onUnhoverCommit;
    const userCancel = unhoverIntent.onUnhoverCancel;
    return {
      ...unhoverIntent,
      onUnhoverCommit: (el, idx, meta) => {
        if (derivedReversePolicy === "intent" && variant === "progress-b-f" && !controllerProvided) {
          reverseOnce();
        }
        userCommit?.(el, idx, meta);
      },
      onUnhoverCancel: (el, idx, meta) => {
        userCancel?.(el, idx, meta);
      },
    };
  }, [unhoverIntent, derivedReversePolicy, variant, controllerProvided, reverseOnce]);

  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    hoverDelay,
    unhoverIntent: mergedUnhoverIntent,
  });

  // explicit hover handlers so reverse feels instant
  const onEnter = (e) => {
    if (wantsHover) {
      setHovered(true);
      if (!controllerProvided) {
        if (variant === "progress") {
          setFadingOut(false);
          setFreezeAt(null);
          setEngaged(true);
        } else if (variant === "progress-b-f" || variant === "progress-infinite") {
          setEngaged(true);
        }
      }
      handleMouseEnter(e.currentTarget);
    }
    onMouseEnter?.(e);
  };

  const onLeave = (e) => {
    if (wantsHover) {
      setHovered(false);
      if (!controllerProvided) {
        if (variant === "progress-b-f") {
          if (derivedReversePolicy === "leave") reverseOnce();
          setEngaged(false); // also disengage so the hook runs the reverse
        } else if (variant === "progress") {
          setFreezeAt(latestPercentRef.current);
          setFadingOut(true);
          setEngaged(false);
        } else if (variant === "progress-infinite") {
          setEngaged(false);
        }
      }
      handleMouseLeave(e.currentTarget);
    }
    onMouseLeave?.(e);
  };

  // visibility logic for mounting
  const showBorder =
    variant === "progress"
      ? engaged || fadingOut
      : variant !== "none" &&
        (isAlways ||
          isHovering ||
          isControlledActive ||
          reversing || // keep mounted while reversing
          (wantsVisible && inView));

  // styles
  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;

  const baseMask = {
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
  };

  const overlayStyleSolid = {
    background: color,
    ...baseMask,
    padding: engaged ? bw : "0px",
    opacity: engaged ? 1 : 0,
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
    opacity: variant === "progress" ? (engaged ? 1 : 0) : 1,
    transition: variant === "progress" ? `opacity ${fadeOutMs}ms cubic-bezier(.2,0,0,1)` : undefined,
    willChange: variant === "progress" ? "opacity" : undefined,
  };

  const mountOverlay = variant === "solid" ? variant !== "none" : showBorder;

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
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
