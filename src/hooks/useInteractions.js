// src/hooks/useInteractions.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Resolve the host we should listen on.
 * - If elementRef is provided and current exists → use it.
 * - Otherwise fall back to window.
 */
function resolveHost(elementRef) {
  return elementRef?.current || window;
}

function getPositionForHost(host) {
  // Window → use scrollY; element → use scrollTop
  return host === window ? window.scrollY : host.scrollTop || 0;
}

/** ──────────────────────────────────────────────────────────────────────────
 * Scroll (window OR element) with direction detection and debounced end
 *
 * Options:
 * - elementRef?: ref to a scrollable element; default is window
 * - scrollThreshold: min absolute delta (px) to count as activity
 * - debounceDelay: ms of inactivity to emit onScrollEnd
 * - trustedOnly: require real user input on wheel handler (isTrusted); scroll
 *                events don’t reliably set isTrusted, so we rely on deltas.
 * - internalFlagRef?: ref<boolean> that, if true, causes the handler to ignore
 *                     this scroll event (useful when YOU set scrollTop).
 * - onScrollActivity: fires when |delta| > threshold; receives {dir, delta, pos}
 * - onScrollUp / onScrollDown: directional callbacks
 * - onScrollStart / onScrollEnd: lifecycle of a scroll “burst”
 * - onDirectionChange: fired when direction flips between up/down
 *
 * Returns:
 * - getCurrentPos(): number
 * - getLastPos(): number
 * - getLastDir(): "up" | "down" | "none"
 * - isScrolling(): boolean
 */
export const useScrollInteraction = ({
  elementRef,                // optional; default window
  scrollThreshold = 10,      // px
  debounceDelay = 150,       // ms
  trustedOnly = true,        // only applies to WHEEL (scroll has no isTrusted guarantee)
  internalFlagRef,           // optional: ignore programmatic scrolls when true

  onScrollActivity = () => {},
  onScrollUp = () => {},
  onScrollDown = () => {},
  onScrollStart = () => {},
  onScrollEnd = () => {},
  onDirectionChange = () => {},
} = {}) => {
  const endTimeoutRef   = useRef(null);
  const lastPosRef      = useRef(0);
  const lastDirRef      = useRef("none"); // "up" | "down" | "none"
  const scrollingRef    = useRef(false);
  const hostRef         = useRef(null);

  // initialize lastPos when host mounts
  useEffect(() => {
    const host = resolveHost(elementRef);
    hostRef.current = host;
    lastPosRef.current = getPositionForHost(host);
    return () => { hostRef.current = null; };
  }, [elementRef]);

  const clearEndTimer = useCallback(() => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
  }, []);

  const scheduleEnd = useCallback(() => {
    clearEndTimer();
    endTimeoutRef.current = setTimeout(() => {
      if (scrollingRef.current) {
        scrollingRef.current = false;
        onScrollEnd({
          pos: getPositionForHost(hostRef.current || window),
          dir: lastDirRef.current,
        });
      }
    }, debounceDelay);
  }, [debounceDelay, clearEndTimer, onScrollEnd]);

  const emitActivity = useCallback(
    (deltaRaw) => {
      const host = hostRef.current || window;
      const pos = getPositionForHost(host);
      const delta = Math.abs(deltaRaw);
      if (delta < scrollThreshold) return;

      // Determine direction from raw delta
      const dir = deltaRaw > 0 ? "down" : "up";

      // Begin burst
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        onScrollStart({ pos, dir });
      }

      // Direction change?
      if (dir !== lastDirRef.current && lastDirRef.current !== "none") {
        onDirectionChange({ from: lastDirRef.current, to: dir, pos });
      }
      lastDirRef.current = dir;

      // Callbacks
      onScrollActivity({ dir, delta, pos });
      if (dir === "down") onScrollDown({ delta, pos });
      else onScrollUp({ delta, pos });

      // Debounce end-of-scroll
      scheduleEnd();
    },
    [
      scrollThreshold,
      onScrollStart,
      onScrollActivity,
      onScrollDown,
      onScrollUp,
      onDirectionChange,
      scheduleEnd,
    ]
  );

  // Wheel: immediate direction via deltaY
  useEffect(() => {
    const host = hostRef.current || resolveHost(elementRef);
    hostRef.current = host;

    const onWheel = (e) => {
      if (trustedOnly && !e.isTrusted) return;
      if (internalFlagRef?.current) return; // ignore programmatic sequences you mark
      const dy = e.deltaY || 0;
      if (dy === 0) return;
      emitActivity(dy);
      // Note: not preventing default; the host/window can still scroll naturally.
    };

    host.addEventListener("wheel", onWheel, { passive: true });
    return () => host.removeEventListener("wheel", onWheel);
  }, [elementRef, trustedOnly, internalFlagRef, emitActivity]);

  // Scroll: compute actual position delta (works for window OR element)
  useEffect(() => {
    const host = hostRef.current || resolveHost(elementRef);
    hostRef.current = host;

    const onScroll = () => {
      if (internalFlagRef?.current) return; // ignore your programmatic sets
      const pos = getPositionForHost(host);
      const deltaRaw = pos - lastPosRef.current;
      lastPosRef.current = pos;
      if (deltaRaw !== 0) emitActivity(deltaRaw);
    };

    host.addEventListener("scroll", onScroll, { passive: true });
    return () => host.removeEventListener("scroll", onScroll);
  }, [elementRef, internalFlagRef, emitActivity]);

  // Cleanup
  useEffect(() => () => clearEndTimer(), [clearEndTimer]);

  return {
    getCurrentPos: () => getPositionForHost(hostRef.current || window),
    getLastPos: () => lastPosRef.current,
    getLastDir: () => lastDirRef.current,
    isScrolling: () => !!scrollingRef.current,
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Click (unchanged)
 */
export const useClickInteraction = ({
  containerSelector = "[data-container]",
  itemSelector = "[data-item]",
  onOutsideClick = () => {},
  onInsideClick = () => {},
  onItemClick = () => {},
} = {}) => {
  useEffect(() => {
    const handleGlobalClick = (event) => {
      // ✅ Ignore programmatic clicks (e.g., our autoplay radio .click())
      if (!event.isTrusted) return;

      const container = event.target.closest(containerSelector);
      const item = event.target.closest(itemSelector);

      if (!container) {
        onOutsideClick(event);
      } else {
        onInsideClick(event, container);
        if (item) onItemClick(event, item, container);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [containerSelector, itemSelector, onOutsideClick, onInsideClick, onItemClick]);

  return {
    triggerClick: (selector) => {
      const el = document.querySelector(selector);
      if (el) el.click();
    },
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Hover (unchanged)
 */
export const useHoverInteraction = ({
  onHoverStart = () => {},
  onHoverEnd = () => {},
  hoverDelay = 0,

  // NEW (all optional; disabled by default)
  unhoverIntent,
} = {}) => {
  const hoverTimeoutRef = useRef(null);

  // ── Intent state
  const intentEnabled = !!unhoverIntent?.enabled;
  const intentTimerRef = useRef(null);
  const moveCleanupRef = useRef(null);
  const intentStateRef = useRef({
    active: false,
    elem: null,
    index: null,
    leftAt: 0,
    rect: null,
    minDist: 0,
    reentryGraceMs: 0,
    lastPos: { x: NaN, y: NaN },
    lastDistance: Infinity,
  });

  const clearHoverTimer = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const stopIntentTracking = () => {
    if (moveCleanupRef.current) {
      moveCleanupRef.current();
      moveCleanupRef.current = null;
    }
    if (intentTimerRef.current) {
      clearTimeout(intentTimerRef.current);
      intentTimerRef.current = null;
    }
  };

  const cancelIntent = (reason = "cancel") => {
    if (!intentEnabled) return;
    const s = intentStateRef.current;
    if (!s.active) return;

    stopIntentTracking();
    s.active = false;

    // Optional callback
    unhoverIntent?.onUnhoverCancel?.(s.elem, s.index, { reason });
  };

  const commitIntent = () => {
    const s = intentStateRef.current;
    if (!s.active) return;

    const payload = {
      timeAway: Date.now() - s.leftAt,
      distance: s.lastDistance,
    };

    stopIntentTracking();
    s.active = false;

    unhoverIntent?.onUnhoverCommit?.(s.elem, s.index, payload);
  };

  const padRect = (r, pad) => ({
    left: r.left - pad,
    top: r.top - pad,
    right: r.right + pad,
    bottom: r.bottom + pad,
  });

  const distanceFromRect = (x, y, r) => {
    // 0 if inside, else Euclidean distance to nearest edge corner
    const dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
    const dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
    return Math.hypot(dx, dy);
  };

  const startIntent = (element, index) => {
    if (!intentEnabled) return;

    // Reset any existing intent
    cancelIntent("restart");

    const leaveDelay = Number(unhoverIntent?.leaveDelay ?? 120);
    const reentryGraceMs = Number(unhoverIntent?.reentryGraceMs ?? 250);
    const minOutDistance = Number(unhoverIntent?.minOutDistance ?? 8);
    const boundaryPadding = Number(unhoverIntent?.boundaryPadding ?? 6);

    const rawRect = element?.getBoundingClientRect?.();
    const rect = rawRect ? padRect(rawRect, boundaryPadding) : null;

    const s = intentStateRef.current;
    s.active = true;
    s.elem = element || null;
    s.index = index ?? null;
    s.leftAt = Date.now();
    s.rect = rect;
    s.minDist = minOutDistance;
    s.reentryGraceMs = reentryGraceMs;
    s.lastDistance = Infinity;

    // Track pointer distance relative to padded rect
    const onMove = (e) => {
      if (!s.active) return;
      const x = e.clientX, y = e.clientY;
      s.lastPos = { x, y };

      if (s.rect) {
        const dist = distanceFromRect(x, y, s.rect);
        s.lastDistance = dist;

        // If the pointer comes back inside the padded rect, treat as re-entry
        if (dist === 0 && Date.now() - s.leftAt <= s.reentryGraceMs) {
          cancelIntent("reenter-geom");
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    moveCleanupRef.current = () => window.removeEventListener("pointermove", onMove);

    // Periodically check for commit condition after initial leaveDelay
    const check = () => {
      if (!s.active) return;

      const elapsed = Date.now() - s.leftAt;
      const dist = s.lastDistance;

      if (elapsed >= leaveDelay && dist >= s.minDist) {
        commitIntent();
      } else {
        // keep checking; low frequency is fine
        intentTimerRef.current = setTimeout(check, Math.max(30, leaveDelay / 3));
      }
    };

    intentTimerRef.current = setTimeout(check, leaveDelay);

    // Safety: also cancel if we get an actual hover re-entry event quickly
    // (the consumer calls handleMouseEnter → we cancel there).
  };

  const handleMouseEnter = useCallback(
    (element, index) => {
      clearHoverTimer();
      cancelIntent("enter"); // if intent was pending, cancel

      if (hoverDelay > 0) {
        hoverTimeoutRef.current = setTimeout(
          () => onHoverStart(element, index),
          hoverDelay
        );
      } else {
        onHoverStart(element, index);
      }
    },
    [hoverDelay, onHoverStart]
  );

  const handleMouseLeave = useCallback(
    (element, index) => {
      clearHoverTimer();

      if (hoverDelay > 0) {
        hoverTimeoutRef.current = setTimeout(
          () => onHoverEnd(element, index),
          hoverDelay
        );
      } else {
        onHoverEnd(element, index);
      }

      // Begin intent detection (does not affect onHoverEnd timing)
      startIntent(element, index);
    },
    [hoverDelay, onHoverEnd]
  );

  // Cleanup on unmount
  useEffect(
    () => () => {
      clearHoverTimer();
      stopIntentTracking();
      intentStateRef.current.active = false;
    },
    []
  );

  return {
    handleMouseEnter,
    handleMouseLeave,

    // Optional escape hatch for callers that want to cancel pending intent
    cancelUnhoverIntent: () => cancelIntent("manual"),
  };
};


/** ──────────────────────────────────────────────────────────────────────────
 * NEW: Side-only drag/tap navigation
 *
 * Attaches pointer handlers to two "side zones" (left/right) so users can
 * drag horizontally (or tap) to navigate. The active/center area remains
 * untouched, preserving its vertical scroll behavior.
 *
 * Usage:
 *   const leftRef = useRef(null);
 *   const rightRef = useRef(null);
 *   useSideDragNavigation({
 *     enabled: drag,
 *     leftElRef: leftRef,
 *     rightElRef: rightRef,
 *     onLeft: goPrev,
 *     onRight: goNext,
 *     dragThreshold: 40,
 *     tapThreshold: 12,
 *   });
 */
export const useSideDragNavigation = ({
  enabled = true,
  leftElRef,
  rightElRef,
  onLeft = () => {},
  onRight = () => {},
  dragThreshold = 40,
  tapThreshold = 12,
} = {}) => {
  const stateRef = useRef({
    active: false,
    zone: null,   // "left" | "right"
    id: null,
    startX: 0,
    startY: 0,
    moved: false,
    slid: false,
  });

  const attach = useCallback((el, zone) => {
    if (!el) return () => {};

    const down = (e) => {
      if (!enabled) return;
      const s = stateRef.current;
      s.active = true;
      s.zone   = zone;
      s.id     = e.pointerId;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.moved  = false;
      s.slid   = false;
      el.setPointerCapture?.(e.pointerId);
    };

    const move = (e) => {
      const s = stateRef.current;
      if (!s.active || s.id !== e.pointerId || s.zone !== zone) return;

      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (!s.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) s.moved = true;

      // Let vertical movement scroll the page; only hijack for horizontal intent.
      if (Math.abs(dy) > Math.abs(dx)) return;

      // Horizontal gesture: prevent default to reduce touch scroll jank.
      e.preventDefault?.();

      if (s.slid) return;

      if (Math.abs(dx) >= dragThreshold) {
        if (zone === "left") onLeft();
        else onRight();
        s.slid = true;
      }
    };

    const end = (e) => {
      const s = stateRef.current;
      if (!s.active || s.id !== e.pointerId || s.zone !== zone) return;

      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;

      if (!s.slid && Math.hypot(dx, dy) <= tapThreshold) {
        if (zone === "left") onLeft();
        else onRight();
      }

      try { el.releasePointerCapture?.(s.id); } catch {}
      s.active = false;
      s.zone   = null;
      s.id     = null;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, [enabled, onLeft, onRight, dragThreshold, tapThreshold]);

  useEffect(() => {
    if (!enabled) return;
    const cleanLeft  = attach(leftElRef?.current,  "left");
    const cleanRight = attach(rightElRef?.current, "right");
    return () => {
      cleanLeft && cleanLeft();
      cleanRight && cleanRight();
    };
  }, [enabled, leftElRef, rightElRef, attach]);
};
