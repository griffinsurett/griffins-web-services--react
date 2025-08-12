// src/hooks/useEngagementAutoplay.js
import { useEffect, useRef } from "react";
import useAutoplay from "./useAutoplay";
import { usePauseableState } from "./usePauseableState";
import { useScrollInteraction, useClickInteraction } from "./useInteractions";

export default function useEngagementAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  autoplayTime = 3000,        // number | () => number
  resumeDelay = 5000,
  resumeTriggers = ["scroll", "click-outside", "hover-away"],
  containerSelector = "[data-autoplay-container]",
  itemSelector = "[data-autoplay-item]",
  inView = true,
  nudgeOnResume = false,
  pauseOnEngage = false,       // 🚫 do not pause immediately on engage
  engageOnlyOnActiveItem = false,
  activeItemAttr = "data-active",
}) {
  const {
    isPaused,
    userEngaged,
    isResumeScheduled,
    engageUser,
    handleResumeActivity,
    pause,
    resume,
  } = usePauseableState({
    initialPausedState: false,
    resumeTriggers,
    resumeDelay,
  });

  const { advance, schedule } = useAutoplay({
    totalItems,
    currentIndex,
    setIndex,
    autoplayTime,              // 🔁 remaining video + delay
    enabled: !isPaused && inView,
  });

  // Nudge forward after resuming
  const prevPaused = useRef(isPaused || !inView);
  useEffect(() => {
    const was = prevPaused.current;
    const now = isPaused || !inView;
    if (was && !now && nudgeOnResume) advance();
    prevPaused.current = now;
  }, [isPaused, inView, nudgeOnResume, advance]);

  // Scroll → schedule resume
  useScrollInteraction({
    scrollThreshold: 150,
    debounceDelay: 150,
    onScrollActivity: () => handleResumeActivity("scroll"),
  });

  // Click interactions
  useClickInteraction({
    containerSelector,
    itemSelector,
    onOutsideClick: () => handleResumeActivity("click-outside"),
    onInsideClick: () => {},
    onItemClick: (e, item) => {
      if (engageOnlyOnActiveItem) {
        const isActive = item?.getAttribute?.(activeItemAttr) === "true";
        if (!isActive) return;
      }
      engageUser();
      // 🚫 do NOT pause video/autoplay here; only mark engagement
      if (pauseOnEngage) {
        // kept for API parity; default is false
      }
    },
  });

  // Hover engagement on active items only
  useEffect(() => {
    const items = Array.from(document.querySelectorAll(itemSelector));
    if (!items.length) return;

    const onEnter = (ev) => {
      if (engageOnlyOnActiveItem) {
        const el = ev.currentTarget;
        const isActive = el?.getAttribute?.(activeItemAttr) === "true";
        if (!isActive) return;
      }
      engageUser();
      if (pauseOnEngage) {
        // intentionally noop by default
      }
    };
    const onLeave = () => handleResumeActivity("hover-away");

    items.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      items.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [
    itemSelector,
    activeItemAttr,
    engageOnlyOnActiveItem,
    pauseOnEngage,
    engageUser,
    handleResumeActivity,
    currentIndex,
  ]);

  return {
    isAutoplayPaused: isPaused,
    isResumeScheduled,
    userEngaged,
    pause,
    resume,
    engageUser,
    advance,
    schedule,                  // 👈 allow rescheduling when video progress changes
  };
}
