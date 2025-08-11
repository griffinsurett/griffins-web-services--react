// src/components/PortfolioCarousel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCarouselAutoplay from "../hooks/useCarouselAutoplay";
import { useVisibility } from "../hooks/useVisibility";

/**
 * Self-contained 3D carousel with engagement-aware autoplay.
 *
 * Props:
 *  - items: [{ id, title, image }]
 *  - defaultIndex?: number = 0
 *  - autoplay?: boolean = true
 *  - autoAdvanceDelay?: number = 4000
 *  - showArrows?: boolean = true
 *  - showDots?: boolean = true
 *  - className?: string
 *
 * Notes:
 *  - Engagement is SLIDE-scoped (only active/center slide pauses).
 *  - Autoplay resumes 5s after disengage.
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

  // Unique scope so our hook binds only within this instance
  const scopeId = useMemo(
    () => `carousel-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // Local visibility (hard-pause when the carousel is off-screen)
  const inView = useVisibility(containerRef, { threshold: 0.3 });

  // Engagement-aware autoplay for this carousel instance
  const {
    isAutoplayPaused,
    isResumeScheduled,
    userEngaged,
    pause,
    resume,
    advance,
  } = useCarouselAutoplay({
    totalItems: items.length,
    currentIndex: index,
    setIndex,
    autoAdvanceDelay,
    inView: autoplay && inView, // disable entirely if autoplay={false}
    containerSelector: `[data-autoplay-scope="${scopeId}"]`,
    itemSelector: `[data-autoplay-scope="${scopeId}"] [data-carousel-item]`,
  });

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getSizes = () => {
    if (vw < 640) return { centerW: 280, centerH: 190, sideW: 180, sideH: 120 };
    if (vw < 768) return { centerW: 340, centerH: 230, sideW: 220, sideH: 150 };
    if (vw < 1024) return { centerW: 460, centerH: 310, sideW: 290, sideH: 190 };
    if (vw < 1280) return { centerW: 680, centerH: 450, sideW: 420, sideH: 290 };
    return { centerW: 860, centerH: 540, sideW: 520, sideH: 360 };
  };

  const getTranslateDistance = (sideW) => {
    const bleed = vw >= 1536 ? 72 : vw >= 1280 ? 56 : vw >= 1024 ? 40 : 20;
    const edgeGutter = -bleed;
    return vw / 2 - sideW / 2 - edgeGutter;
  };

  const getPosition = (i) => {
    const diff = i - index;
    if (diff === 0) return "center";
    if (diff === -1 || diff === items.length - 1) return "left";
    if (diff === 1 || diff === -(items.length - 1)) return "right";
    return "hidden";
  };

  const { centerW, centerH, sideW, sideH } = getSizes();
  const tx = getTranslateDistance(sideW);

  const stageBase = "relative w-full overflow-visible [perspective:1200px]";
  const slideBase =
    "absolute left-1/2 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] " +
    "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform";

  const goToPrevious = () =>
    setIndex(index === 0 ? items.length - 1 : index - 1);
  const goToNext = () =>
    setIndex(index === items.length - 1 ? 0 : index + 1);

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
        {items.map((item, i) => {
          const pos = getPosition(i);
          const isActive = pos === "center";

          let style;
          let topClass = isActive ? "top-0" : "top-1/2";
          let baseTranslate =
            isActive ? "translate(-50%, 0)" : "translate(-50%, -50%)";

          if (isActive) {
            style = {
              width: `${centerW}px`,
              height: `${centerH}px`,
              transform: `${baseTranslate} scale(1) rotateY(0deg)`,
              zIndex: 30,
              opacity: 1,
            };
          } else if (pos === "left") {
            style = {
              width: `${sideW}px`,
              height: `${sideH}px`,
              transform: `${baseTranslate} translateX(-${tx}px) scale(0.9) rotateY(22deg)`,
              zIndex: 20,
              opacity: 0.5,
              filter: "brightness(0.75)",
            };
          } else if (pos === "right") {
            style = {
              width: `${sideW}px`,
              height: `${sideH}px`,
              transform: `${baseTranslate} translateX(${tx}px) scale(0.9) rotateY(-22deg)`,
              zIndex: 20,
              opacity: 0.5,
              filter: "brightness(0.75)",
            };
          } else {
            style = {
              width: `${sideW}px`,
              height: `${sideH}px`,
              transform: `${baseTranslate} scale(0)`,
              zIndex: 10,
              opacity: 0,
              pointerEvents: "none",
            };
          }

          return (
            <div
              key={item.id}
              className={`${slideBase} ${topClass}`}
              style={style}
              data-carousel-item
              data-index={i}
              data-active={isActive ? "true" : "false"} // used by the hook for slide-scoped engagement
              onClick={() => i !== index && setIndex(i)}
            >
              <figure className="w-full h-full bg-white">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </figure>
            </div>
          );
        })}

        {/* Arrows */}
        {showArrows && items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              aria-label="Previous"
              className="absolute left-3 top-3 lg:left-8 lg:top-1/2 lg:-translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 secondary-text backdrop-blur-sm hover:bg-white/20 transition"
            >
              <ChevronLeft className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next"
              className="absolute right-3 top-3 lg:right-8 lg:top-1/2 lg:-translate-y-1/2 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border border-white/20 secondary-text backdrop-blur-sm hover:bg-white/20 transition"
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
                i === index ? "bg-primary scale-130" : "bg-white/20 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </nav>
      )}

      {/* (Optional) Debug */}
      <div className="mt-4 text-xs opacity-70">
        <div>⏸️ Paused: {isAutoplayPaused ? "✅" : "❌"}</div>
        <div>👤 Engaged: {userEngaged ? "✅" : "❌"}</div>
        <div>⏲️ Resume in 5s: {isResumeScheduled ? "✅" : "❌"}</div>
      </div>
    </div>
  );
}
