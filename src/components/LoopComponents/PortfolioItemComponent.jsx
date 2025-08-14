// src/components/LoopComponents/PortfolioItemComponent.jsx
import React, { useRef } from "react";
import { useAutoScroll } from "../../hooks/useAutoScroll";

/**
 * Single slide for the 3D carousel, now with a scrollable inner viewport.
 * - Shows the image from the TOP
 * - No cropping (no object-cover); full image is viewable via vertical scroll
 */
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

  // 🔁 Auto-scroll ONLY while active & visible.
  // - Wait startDelay before first start
  // - Slow, “video-like” scroll (top → bottom in ~30s)
  // - ⛔ When the user scrolls, pause and DO NOT resume while this item stays active
  // - 🔄 When it becomes inactive/out-of-view, reset to top for the next cycle
  useAutoScroll({
    ref: viewportRef,
    active: isActive,
    cycleDuration: 30,        // slow scroll (seconds top → bottom)
    loop: false,              // stop at bottom
    startDelay: 1500,         // don't start immediately
    resumeDelay: 0,           // ignored because…
    resumeOnUserInput: false, // ⬅️ never resume during current active cycle
    threshold: 0.35,
    resetOnInactive: true,
  });

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

  return (
    <div
      className={`${slideBase} ${topClass}`}
      style={style}
      data-carousel-item
      data-index={i}
      data-active={isActive ? "true" : "false"}
      onClick={() => i !== activeIndex && onSelect(i)}
    >
      {/* Scrollable viewport that starts at the TOP */}
      <figure
        ref={viewportRef}
        className="
          w-full h-full bg-white
          overflow-y-auto overscroll-contain
          touch-pan-y m-0 p-0
        "
      >
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          draggable={false}
          className="
            block
            w-full h-auto
            select-none
          "
        />
      </figure>
    </div>
  );
}
