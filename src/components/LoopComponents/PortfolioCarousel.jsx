// PortfolioCarousel.jsx
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable 3D carousel (controlled)
 *
 * Props:
 *  - items: [{ id, title, image }]
 *  - currentIndex: number
 *  - onChange(nextIndex: number): void
 *  - showArrows?: boolean = true
 *  - showDots?: boolean = true   // dots render below the stage
 *  - autoPlay?: boolean = true
 *  - autoPlayInterval?: number = 4000
 *  - pauseOnHover?: boolean = true
 *  - className?: string (extra classes for stage)
 */
export default function PortfolioCarousel({
  items = [],
  currentIndex = 0,
  onChange = () => {},
  showArrows = true,
  showDots = true,
  autoPlay = true,
  autoPlayInterval = 4000,
  pauseOnHover = true,
  className = "",
}) {
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!autoPlay || (pauseOnHover && hovered) || items.length <= 1) return;
    const id = setInterval(() => {
      onChange(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
    }, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, pauseOnHover, hovered, items.length, currentIndex, autoPlayInterval, onChange]);

  const getSizes = () => {
    if (vw < 640) return { centerW: 280, centerH: 190, sideW: 180, sideH: 120 };
    if (vw < 768) return { centerW: 340, centerH: 230, sideW: 220, sideH: 150 };
    if (vw < 1024) return { centerW: 460, centerH: 310, sideW: 290, sideH: 190 };
    if (vw < 1280) return { centerW: 680, centerH: 450, sideW: 420, sideH: 290 };
    return { centerW: 860, centerH: 540, sideW: 520, sideH: 360 };
  };

  const getTranslateDistance = (sideW) => {
    const bleed = vw >= 1536 ? 72 : vw >= 1280 ? 56 : vw >= 1024 ? 40 : 20;
    const edgeGutter = -bleed; // negative = past the edge
    return vw / 2 - sideW / 2 - edgeGutter;
  };

  const getPosition = (index) => {
    const diff = index - currentIndex;
    if (diff === 0) return "center";
    if (diff === -1 || diff === items.length - 1) return "left";
    if (diff === 1 || diff === -(items.length - 1)) return "right";
    return "hidden";
  };

  const { centerW, centerH, sideW, sideH } = getSizes();
  const tx = getTranslateDistance(sideW);

  // Stage height is exactly the center card height (no extra top/bottom)
  const stageBase =
    "relative w-full overflow-visible [perspective:1200px]";

  // Common slide styles; we set top differently per-position below
  const slideBase =
    "absolute left-1/2 overflow-hidden " +
    "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 " +
    "ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform";

  const goToPrevious = () =>
    onChange(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  const goToNext = () =>
    onChange(currentIndex === items.length - 1 ? 0 : currentIndex + 1);

  return (
    <div
      onMouseEnter={() => pauseOnHover && setHovered(true)}
      onMouseLeave={() => pauseOnHover && setHovered(false)}
    >
      {/* Stage */}
      <div
        className={`${stageBase} ${className}`}
        style={{ height: `${centerH}px` }}
      >
        {items.map((item, index) => {
          const pos = getPosition(index);

          // Per-position placement + transform:
          // - center: top-aligned -> top:0; translateY(0)
          // - sides: vertically centered -> top:50%; translateY(-50%)
          let style;
          let topClass = pos === "center" ? "top-0" : "top-1/2";
          let baseTranslate =
            pos === "center" ? "translate(-50%, 0)" : "translate(-50%, -50%)";

          if (pos === "center") {
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
              onClick={() => index !== currentIndex && onChange(index)}
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

      {/* Dots BELOW the stage */}
      {showDots && items.length > 1 && (
        <nav className="mt-6 flex justify-center gap-3" aria-label="Carousel Pagination">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-primary scale-130" : "bg-white/20 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
