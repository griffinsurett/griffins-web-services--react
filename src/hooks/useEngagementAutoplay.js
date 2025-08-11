// src/hooks/useEngagementAutoplay.js
import { useEffect, useRef } from "react";
import useAutoplay from "./useAutoplay";
import { usePauseableState } from "./usePauseableState";
import { useScrollInteraction, useClickInteraction } from "./useInteractions";

export default function useEngagementAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  interval = 4000,
  resumeDelay = 5000,
  resumeTriggers = ["scroll", "click-outside", "hover-away"],
  containerSelector = "[data-autoplay-container]",
  itemSelector = "[data-autoplay-item]",
  inView = true,
  nudgeOnResume = true,
  pauseOnEngage = false,
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

  const { advance } = useAutoplay({
    totalItems,
    currentIndex,
    setIndex,
    interval,
    enabled: !isPaused && inView,
  });

  // Nudge forward after resuming from paused/hidden state
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

  // Clicks:
  // - outside → schedule resume
  // - item click → engage only if active (when requested)
  useClickInteraction({
    containerSelector,
    itemSelector,
    onOutsideClick: () => handleResumeActivity("click-outside"),
    onInsideClick: () => {}, // don't blanket-engage on container clicks
    onItemClick: (e, item) => {
      if (engageOnlyOnActiveItem) {
        const isActive = item?.getAttribute?.(activeItemAttr) === "true";
        if (!isActive) return;
      }
      engageUser();
      if (pauseOnEngage) pause();
    },
  });

  // Hover on items only → engage if (active); leave → schedule resume
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
      if (pauseOnEngage) pause();
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
    // Rebind when active slide changes or DOM could have updated
  }, [
    itemSelector,
    activeItemAttr,
    engageOnlyOnActiveItem,
    pauseOnEngage,
    engageUser,
    handleResumeActivity,
    pause,
    currentIndex, // 👈 ensures we re-read active flags per render
  ]);

  return {
    isAutoplayPaused: isPaused,
    isResumeScheduled,
    userEngaged,
    pause,
    resume,
    engageUser,
    advance,
  };
}
