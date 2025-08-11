// src/hooks/useCarouselAutoplay.js
import useEngagementAutoplay from "./useEngagementAutoplay";

/**
 * Carousel-specific engagement-aware autoplay wrapper.
 * Pauses on engage (hover/click) of the ACTIVE slide only,
 * resumes 5s after disengage.
 */
export default function useCarouselAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  autoAdvanceDelay = 4000,
  inView = true,
  containerSelector = "[data-portfolio-section], [data-carousel-container]",
  itemSelector = "[data-carousel-item]",
}) {
  return useEngagementAutoplay({
    totalItems,
    currentIndex,
    setIndex,
    interval: autoAdvanceDelay,
    resumeDelay: 5000,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    containerSelector,
    itemSelector,
    inView,
    nudgeOnResume: true,
    pauseOnEngage: true,
    engageOnlyOnActiveItem: true,     // 👈 key behavior
    activeItemAttr: "data-active",    // 👈 reads the attribute we added
  });
}
