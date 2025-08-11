// src/hooks/useAccordionAutoplay.js
import { useCallback, useState } from "react";
import useEngagementAutoplay from "./useEngagementAutoplay";

/**
 * Accordion-specific autoplay wrapper (Website Types).
 * Adds media-end behavior: pauses if engaged, otherwise advances after 1s.
 */
export default function useAccordionAutoplay({
  totalItems,
  initialIndex = 0,
  autoAdvanceDelay = 3000,
  inView = true,
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const core = useEngagementAutoplay({
    totalItems,
    currentIndex: activeIndex,
    setIndex: setActiveIndex,
    interval: autoAdvanceDelay,
    resumeDelay: 5000,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    containerSelector: "[data-accordion-container], [data-video-container]",
    itemSelector: "[data-accordion-item], [data-video-container]",
    inView,
    nudgeOnResume: true,
  });

  const handleManualSelection = (index) => {
    core.engageUser();
    setActiveIndex(index);
  };

  const handleVideoEnded = useCallback(() => {
    if (core.userEngaged) {
      core.pause();
    } else {
      setTimeout(core.advance, 1000);
    }
  }, [core]);

  return {
    activeIndex,
    setActiveIndex,
    isAutoplayPaused: core.isAutoplayPaused,
    isResumeScheduled: core.isResumeScheduled,
    userEngaged: core.userEngaged,
    handleManualSelection,
    handleAccordionHover: core.onMouseEnter, // optional direct binding
    shouldShowFullBorder: () => false,
    handleVideoEnded,
    advanceToNext: core.advance,
  };
}
