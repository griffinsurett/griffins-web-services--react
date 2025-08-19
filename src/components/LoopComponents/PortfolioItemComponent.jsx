// src/components/LoopComponents/PortfolioItemComponent.jsx
import React, { useRef } from "react";
import { useAutoScroll } from "../../hooks/useAutoScroll";

export default function PortfolioItemComponent({
  item,
  i,
  activeIndex,
  itemsLength,
  centerW,
  centerH,
  sideW,
  sideH,
  tx,
  onSelect,
}) {
  const viewportRef = useRef(null);

  const slideBase =
    "absolute left-1/2 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] " +
    "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform";

  // Position logic (wrap-around)
  const diff = i - activeIndex;
  let pos = "hidden";
  if (diff === 0) pos = "center";
  else if (diff === -1 || diff === itemsLength - 1) pos = "left";
  else if (diff === 1 || diff === -(itemsLength - 1)) pos = "right";

  const isActive = pos === "center";
  const topClass = isActive ? "top-0" : "top-1/2";
  const baseTranslate = isActive ? "translate(-50%, 0)" : "translate(-50%, -50%)";

  // ✅ SOLUTION 2: Detect mobile and bypass IntersectionObserver
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Auto-scroll ONLY while active & visible. When inactive, it resets to top.
  useAutoScroll({
    ref: viewportRef,
    active: isActive,
    cycleDuration: 30,        // slow scroll (seconds top → bottom)
    loop: false,              // stop at bottom
    startDelay: 1500,
    resumeDelay: 0,
    resumeOnUserInput: false, // never resume during current active cycle
    // ✅ For mobile, assume active items are always visible
    threshold: isMobile ? 0.001 : 0.35, // Nearly 0% for mobile vs 35% for desktop
    visibleRootMargin: 0,
    resetOnInactive: true,
  });

  // ✅ Optional: Add debugging to verify it's working
  React.useEffect(() => {
    if (isActive && isMobile) {
      console.log('📱 Mobile Auto-scroll Active:', {
        isActive,
        isMobile,
        threshold: 0.001,
        elementExists: !!viewportRef.current,
        scrollHeight: viewportRef.current?.scrollHeight,
        clientHeight: viewportRef.current?.clientHeight,
        canScroll: (viewportRef.current?.scrollHeight || 0) > (viewportRef.current?.clientHeight || 0)
      });
    }
  }, [isActive, isMobile]);

  let style;
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

  // Only the ACTIVE slide should allow inner scrolling and capture touch/wheel.
  const viewportClassesActive = `
    w-full h-full bg-primary-light
    overflow-y-auto overscroll-contain
    touch-pan-y m-0 p-0
  `;
  const viewportClassesInactive = `
    w-full h-full bg-primary-light
    overflow-hidden pointer-events-none select-none
    m-0 p-0
  `;

  return (
    <div
      className={`${slideBase} ${topClass}`}
      style={style}
      data-carousel-item
      data-index={i}
      data-active={isActive ? "true" : "false"}
      // Clicking a side slide selects it; pointer events remain enabled on container
      onClick={() => i !== activeIndex && onSelect(i)}
    >
      {/* Scrollable viewport only when ACTIVE. Inactive viewports do not intercept scroll. */}
      <figure
        ref={viewportRef}
        className={isActive ? viewportClassesActive : viewportClassesInactive}
        aria-hidden={isActive ? "false" : "true"}
        tabIndex={isActive ? 0 : -1}
      >
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          draggable={false}
          className="block w-full h-auto select-none"
        />
      </figure>
    </div>
  );
}