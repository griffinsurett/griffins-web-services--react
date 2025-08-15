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
} = {}) => {
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback(
    (element, index) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => onHoverStart(element, index), hoverDelay);
    },
    [onHoverStart, hoverDelay]
  );

  const handleMouseLeave = useCallback(
    (element, index) => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => onHoverEnd(element, index), hoverDelay);
    },
    [onHoverEnd, hoverDelay]
  );

  useEffect(() => () => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current), []);

  return { handleMouseEnter, handleMouseLeave };
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
