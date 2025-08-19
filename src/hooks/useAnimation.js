// src/hooks/useAnimation.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEngagedByTriggers } from "./useEngagedByTriggers";
import { useReversibleProgress } from "./useReversibleProgress";

/**
 * useAnimation (project-wide)
 * Generic animation orchestrator that composes visibility, hover and a progress engine.
 *
 * Params
 *  - mode: "forwardOnly" | "backAndForth" | "infinite"  (progress engine)
 *  - duration: number (ms) for a full sweep of progress engine
 *  - followEngagement: boolean (default true) — when true, engine starts/stops with engagement
 *
 *  - triggers: "hover" | "visible" | "always" | "controlled" | string[]
 *  - active: boolean (for "controlled")
 *  - hoverDelay, unhoverIntent
 *  - visibleRootMargin, visibilityOptions
 *
 *  - controller: number | () => number   // external progress source (overrides engine percent)
 *  - onMouseEnter, onMouseLeave: passthrough handlers
 *
 * Returns
 *  {
 *    hostRef,
 *    // engagement
 *    engaged, inView, hovered,
 *    wantsHover, wantsVisible, isAlways, isControlledTrigger,
 *    justEngaged, justDisengaged,
 *
 *    // progress
 *    percent, reversing,
 *    setEngineEngaged, reverseOnce, reset,
 *
 *    // handlers to attach
 *    onEnter, onLeave
 *  }
 */
export function useAnimation({
  // Engine
  mode = "forwardOnly",
  duration = 2000,
  followEngagement = true,

  // Triggers/visibility
  triggers = "hover",
  active = false,
  hoverDelay = 0,
  unhoverIntent,
  visibleRootMargin = 100,
  visibilityOptions,

  // External progress controller
  controller,

  // Optional passthrough events
  onMouseEnter,
  onMouseLeave,
} = {}) {
  const hostRef = useRef(null);

  // ── Central trigger resolution (hover/visible/always/controlled)
  const {
    engaged,
    inView,
    hovered,
    wantsHover,
    wantsVisible,
    isAlways,
    isControlledTrigger,
    justEngaged,
    justDisengaged,
    onEnter: engagedEnter,
    onLeave: engagedLeave,
  } = useEngagedByTriggers({
    ref: hostRef,
    triggers,
    active,
    hoverDelay,
    unhoverIntent,
    visibleRootMargin,
    visibilityOptions,
  });

  // ── Progress engine (generic; no component-specific policies here)
  const {
    percent: internalPercent,
    reversing,
    setEngaged: setEngineEngaged,
    reverseOnce,
    reset,
  } = useReversibleProgress({ duration, mode });

  // Start/stop engine with engagement if asked to
  useEffect(() => {
    if (!followEngagement) return;
    setEngineEngaged(!!engaged);
  }, [followEngagement, engaged, setEngineEngaged]);

  // External controller override
  const controllerIsFn = typeof controller === "function";
  const controllerIsNum = typeof controller === "number";
  const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);
  const [providedPercent, setProvidedPercent] = useState(
    controllerIsNum ? clamp(controller) : 0
  );
  useEffect(() => {
    if (controllerIsNum) setProvidedPercent(clamp(controller));
  }, [controllerIsNum, controller]);
  useEffect(() => {
    if (!controllerIsFn) return;
    let raf;
    const tick = () => {
      try { setProvidedPercent(clamp(controller())); } catch {}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [controllerIsFn, controller]);

  const percent = controllerIsFn || controllerIsNum ? providedPercent : internalPercent;

  // Passthrough handlers (no policies)
  const onEnter = useCallback(
    (e) => {
      onMouseEnter?.(e);
      engagedEnter(e);
    },
    [onMouseEnter, engagedEnter]
  );
  const onLeave = useCallback(
    (e) => {
      onMouseLeave?.(e);
      engagedLeave(e);
    },
    [onMouseLeave, engagedLeave]
  );

  return {
    hostRef,
    engaged,
    inView,
    hovered,
    wantsHover,
    wantsVisible,
    isAlways,
    isControlledTrigger,
    justEngaged,
    justDisengaged,

    percent,
    reversing,
    setEngineEngaged,
    reverseOnce,
    reset,

    onEnter,
    onLeave,
  };
}
