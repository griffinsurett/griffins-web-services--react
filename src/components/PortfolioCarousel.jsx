// src/components/PortfolioCarousel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCarouselAutoplay from "../hooks/useCarouselAutoplay";
import { useVisibility } from "../hooks/useVisibility";
import PortfolioItemComponent from "./LoopComponents/PortfolioItemComponent";

/**
 * 3D carousel with engagement-aware autoplay.
 *
 * Arrow positioning:
 * - < 1280px: keep arrows just outside the ACTIVE (center) slide
 * - ≥ 1280px: center arrows over the SIDE slides (aligned to tx)
 */
export default function PortfolioCarousel({
  items = [],
  defaultIndex = 0,
  autoplay = true,
  autoAdvanceDelay = 4000,
  showArrows = true,
  showDots = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [index, setIndex] = useState(defaultIndex);

  const scopeId = useMemo(
    () => `carousel-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const inView = useVisibility(containerRef, { threshold: 0.3 });

  const {
    isAutoplayPaused,
    isResumeScheduled,
    userEngaged,
  } = useCarouselAutoplay({
    totalItems: items.length,
    currentIndex: index,
    setIndex,
    autoAdvanceDelay,
    inView: autoplay && inView,
    containerSelector: `[data-autoplay-scope="${scopeId}"]`,
    itemSelector: `[data-autoplay-scope="${scopeId}"] [data-carousel-item]`,
  });

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getSizes = () => {
    if (vw < 640)  return { centerW: 280, centerH: 190, sideW: 180, sideH: 120 };
    if (vw < 768)  return { centerW: 340, centerH: 230, sideW: 220, sideH: 150 };
    if (vw < 1024) return { centerW: 460, centerH: 310, sideW: 290, sideH: 190 };
    if (vw < 1280) return { centerW: 680, centerH: 450, sideW: 420, sideH: 290 };
    return            { centerW: 860, centerH: 540, sideW: 520, sideH: 360 };
  };

  // Distance from stage center to side-slide centers (used for ≥1280px)
  const getTranslateDistance = (sideW) => {
    const bleed =
      vw >= 1536 ? 72 :
      vw >= 1280 ? 56 :
      vw >= 1024 ? 40 : 20;
    const edgeGutter = -bleed;
    return vw / 2 - sideW / 2 - edgeGutter;
  };

  const { centerW, centerH, sideW, sideH } = getSizes();
  const tx = getTranslateDistance(sideW);

  const stageBase = "relative w-full overflow-visible [perspective:1200px]";

  const goToPrevious = () =>
    setIndex(index === 0 ? items.length - 1 : index - 1);
  const goToNext = () =>
    setIndex(index === items.length - 1 ? 0 : index + 1);

  // Arrow geometry
  const arrowDiameter = vw >= 768 ? 48 : 40; // md: w-12 h-12 vs w-10 h-10
  const arrowRadius   = arrowDiameter / 2;
  const gap           = vw >= 1024 ? 20 : 16;

  // Responsive rule:
  // - large (≥1280): align to side-slide centers (±tx)
  // - otherwise: sit just outside the active slide
  const isLarge = vw >= 1280;

  const sideOffsetFromCenterSlide = centerW / 2 + arrowRadius + gap;

  const leftCalc  = isLarge
    ? `calc(50% - ${tx}px)`
    : `calc(50% - ${sideOffsetFromCenterSlide}px)`;

  const rightCalc = isLarge
    ? `calc(50% + ${tx}px)`
    : `calc(50% + ${sideOffsetFromCenterSlide}px)`;

  return (
    <div
      ref={containerRef}
      data-carousel-container
      data-autoplay-scope={scopeId}
      className="w-full"
    >
      {/* Stage */}
      <div
        className={`${stageBase} ${className}`}
        style={{ height: `${centerH}px` }}
      >
        {items.map((item, i) => (
          <PortfolioItemComponent
            key={item.id ?? i}
            item={item}
            i={i}
            activeIndex={index}
            itemsLength={items.length}
            centerW={centerW}
            centerH={centerH}
            sideW={sideW}
            sideH={sideH}
            tx={tx}
            onSelect={setIndex}
          />
        ))}

        {/* Arrows */}
        {showArrows && items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              aria-label="Previous"
              className="absolute z-40 w-10 h-10 md:w-12 md:h-12 rounded-full
                         bg-white/10 border border-white/20 secondary-text backdrop-blur-sm
                         hover:bg-white/20 transition"
              style={{
                left: leftCalc,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <ChevronLeft className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next"
              className="absolute z-40 w-10 h-10 md:w-12 md:h-12 rounded-full
                         bg-white/10 border border-white/20 secondary-text backdrop-blur-sm
                         hover:bg-white/20 transition"
              style={{
                left: rightCalc,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <ChevronRight className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {showDots && items.length > 1 && (
        <nav className="mt-6 flex justify-center gap-3" aria-label="Carousel Pagination">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                i === index ? "bg-primary scale-[1.30]" : "bg-white/20 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </nav>
      )}

      {/* Debug */}
      <div className="mt-4 text-xs opacity-70">
        <div>⏸️ Paused: {isAutoplayPaused ? "✅" : "❌"}</div>
        <div>👤 Engaged: {userEngaged ? "✅" : "❌"}</div>
        <div>⏲️ Resume in 5s: {isResumeScheduled ? "✅" : "❌"}</div>
      </div>
    </div>
  );
}
