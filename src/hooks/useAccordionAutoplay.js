// src/hooks/useAccordionAutoplay.js
import { useCallback, useEffect, useRef } from "react";
import { usePauseableState, useAutoAdvance } from "./usePauseableState";
import {
  useScrollInteraction,
  useClickInteraction,
  useHoverInteraction,
} from "./useInteractions";

const useAccordionAutoplay = (totalItems, initialIndex = 0, autoAdvanceDelay = 3000) => {
  // Pause/engagement + centralized resume scheduler
  const {
    isPaused: isAutoplayPaused,
    userEngaged,
    shouldPauseAfterVideo,
    isResumeScheduled,
    engageUser,
    pauseAfterVideoIfEngaged,
    handleResumeActivity,
  } = usePauseableState({
    initialPausedState: false,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    resumeDelay: 5000,
  });

  // Indexing
  const { activeIndex, setActiveIndex, goToIndex } = useAutoAdvance({
    totalItems,
    initialIndex,
    autoAdvanceDelay,
    loop: true,
  });

  // Interactions → schedule resume via centralized logic
  useScrollInteraction({
    scrollThreshold: 150,
    debounceDelay: 150,
    onScrollActivity: () => handleResumeActivity("scroll"),
  });

  useClickInteraction({
    containerSelector: "[data-accordion-container], [data-video-container]",
    itemSelector: "[data-accordion-item], [data-video-container]",
    onOutsideClick: () => handleResumeActivity("click-outside"),
    onInsideClick: () => engageUser(),
    onItemClick: () => engageUser(),
  });

  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    onHoverStart: () => engageUser(),
    onHoverEnd: () => handleResumeActivity("hover-away"),
    hoverDelay: 0,
  });

  // Advance helpers
  const advanceToNext = useCallback(() => {
    if (!isAutoplayPaused) {
      const nextIndex = (activeIndex + 1) % totalItems;
      goToIndex(nextIndex);
    }
  }, [isAutoplayPaused, activeIndex, totalItems, goToIndex]);

  // On video end:
  // - pause if engaged
  // - else advance after 1s
  const handleVideoEnded = useCallback(() => {
    const didPause = pauseAfterVideoIfEngaged();
    if (!didPause) setTimeout(advanceToNext, 1000);
  }, [pauseAfterVideoIfEngaged, advanceToNext]);

  // When the centralized scheduler resumes autoplay, nudge to next item
  const prevPausedRef = useRef(isAutoplayPaused);
  useEffect(() => {
    if (prevPausedRef.current && !isAutoplayPaused) {
      advanceToNext();
    }
    prevPausedRef.current = isAutoplayPaused;
  }, [isAutoplayPaused, advanceToNext]);

  // Manual selection
  const handleManualSelection = useCallback(
    (index) => {
      goToIndex(index);
      engageUser();
    },
    [goToIndex, engageUser]
  );

  // Presentational extras
  const handleAccordionHover = useCallback(
    (index, isHovering) =>
      isHovering ? handleMouseEnter(null, index) : handleMouseLeave(null, index),
    [handleMouseEnter, handleMouseLeave]
  );

  const shouldShowFullBorder = () => false;

  return {
    activeIndex,
    isAutoplayPaused,
    isResumeScheduled,
    userEngaged,
    shouldPauseAfterVideo,
    shouldShowFullBorder,
    handleManualSelection,
    handleAccordionHover,
    handleVideoEnded,
    advanceToNext,
    setActiveIndex,
  };
};

export default useAccordionAutoplay;
