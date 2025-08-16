// src/hooks/useScrollTriggeredVideo.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";

/**
 * useScrollTriggeredVideo(containerRef, videoRef, menuCheckboxIdOrOptions?, options?)
 *
 * Back-compat:
 *  - 3rd arg as string = menuCheckboxId
 *  - Or pass an object: { menuCheckboxId, threshold, visibleRootMargin }
 *  - Or (legacy style) 4th arg as options while 3rd is a string id
 */
export function useScrollTriggeredVideo(
  containerRef,
  videoRef,
  menuCheckboxIdOrOptions = "headerMenu-toggle",
  maybeOptions
) {
  // ── normalize args
  let menuCheckboxId = "headerMenu-toggle";
  let opts = {};
  if (typeof menuCheckboxIdOrOptions === "string" || menuCheckboxIdOrOptions == null) {
    menuCheckboxId = menuCheckboxIdOrOptions ?? "headerMenu-toggle";
    opts = maybeOptions ?? {};
  } else {
    opts = menuCheckboxIdOrOptions || {};
    menuCheckboxId = opts.menuCheckboxId ?? "headerMenu-toggle";
  }

  const {
    threshold = 0.1,
    visibleRootMargin = 0, // number | string | {top,right,bottom,left}
  } = opts;

  // ── normalize rootMargin like other hooks
  const rootMargin = useMemo(() => {
    const toPx = (v) => (typeof v === "number" ? `${v}px` : `${v}`);
    if (typeof visibleRootMargin === "number") {
      const n = Math.max(0, visibleRootMargin | 0);
      return `-${n}px 0px -${n}px 0px`; // shrink top & bottom by N px
    }
    if (visibleRootMargin && typeof visibleRootMargin === "object") {
      const { top = 0, right = 0, bottom = 0, left = 0 } = visibleRootMargin;
      return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
    }
    return visibleRootMargin || "0px";
  }, [visibleRootMargin]);

  // ✅ rely on our hook; “once” mimics the old “disconnect on first view”
  const seenOnce = useVisibility(containerRef, { threshold, rootMargin, once: true });

  const [activated, setActivated] = useState(false);
  const pauseTimeout = useRef(null);
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.pageYOffset : 0
  );

  // Scroll & wheel → drive playback (attach once the section has been seen)
  useEffect(() => {
    if (!seenOnce) return;

    function handleMovement(deltaY) {
      const vid = videoRef.current;

      // first scroll down ever → activate
      if (!activated && deltaY > 0) {
        setActivated(true);
        return;
      }
      if (!vid) return;

      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        vid.playbackRate = 0.5;
        vid.play().catch(() => {});
      } else if (deltaY < 0) {
        vid.pause();
        const reverseStep = 0.02;
        vid.currentTime =
          vid.currentTime > reverseStep
            ? vid.currentTime - reverseStep
            : vid.duration;

        if (window.pageYOffset <= 0) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      }

      pauseTimeout.current = setTimeout(() => {
        vid.pause();
      }, 100);
    }

    const onWheel = (e) => handleMovement(e.deltaY || 0);
    const onScroll = () => {
      const y = window.pageYOffset;
      const deltaY = y - lastScrollY.current;
      lastScrollY.current = y;
      handleMovement(deltaY);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(pauseTimeout.current);
    };
  }, [seenOnce, activated, videoRef]);

  // Autoplay as soon as “activated”
  useEffect(() => {
    if (!activated || !videoRef.current) return;
    videoRef.current.playbackRate = 0.5;
    videoRef.current.play().catch(() => {});
  }, [activated, videoRef]);

  // Menu checkbox → reset video to 0 on open
  useEffect(() => {
    if (!menuCheckboxId) return;
    const box = document.getElementById(menuCheckboxId);
    if (!box) return;

    const resetOnOpen = () => {
      if (box.checked && videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    };

    box.addEventListener("change", resetOnOpen);
    // in case it’s already open on mount
    resetOnOpen();

    return () => {
      box.removeEventListener("change", resetOnOpen);
    };
  }, [menuCheckboxId, videoRef]);

  return { activated };
}
