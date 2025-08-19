// ============================================================================
// src/components/SmoothScrollCarousel.jsx - HAS AUTOPLAY → USES useEngagementAutoplay
// ============================================================================

import React, { useRef, useEffect, useState, useMemo, forwardRef } from "react";
import { useVisibility } from "../hooks/useVisibility";
import useEngagementAutoplay from "../hooks/useEngagementAutoplay";

/**
 * SmoothScrollCarousel - Component WITH autoplay functionality
 * ✅ CORRECT: Uses useEngagementAutoplay because IT has autoplay
 */
const SmoothScrollCarousel = forwardRef(({
  items = [],
  renderItem = () => null,
  
  // Behavior
  speed = 30,
  duplicateCount = 3,
  autoplay = true,
  pauseOnHover = true,
  pauseOnEngage = true,
  
  // Layout
  gap = 24,
  itemWidth = 120,
  gradientMask = true,
  gradientWidth = { base: 48, md: 80 },
  threshold = 0.3,
  
  // Interaction
  onItemInteraction,
  resumeDelay = 3000,
  resumeTriggers = ["scroll", "click-outside", "hover-away"],
  
  // Styling
  className = "",
  trackClassName = "",
}, ref) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [currentOffset, setCurrentOffset] = useState(0);

  // Generate unique scope ID
  const scopeId = useMemo(
    () => `smooth-carousel-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // Expose ref to parent
  React.useImperativeHandle(ref, () => ({
    container: containerRef.current,
    track: trackRef.current,
    getCurrentOffset: () => currentOffset,
    setOffset: setCurrentOffset,
  }));

  // ✅ VISIBILITY: Check if carousel itself is in view
  const inView = useVisibility(containerRef, { threshold });

  // Duplicate items for infinite scroll
  const duplicatedItems = useMemo(() => {
    const result = [];
    for (let i = 0; i < duplicateCount; i++) {
      result.push(...items.map((item, idx) => ({ 
        ...item, 
        _duplicateIndex: i, 
        _originalIndex: idx 
      })));
    }
    return result;
  }, [items, duplicateCount]);

  const totalWidth = items.length * itemWidth;

  // ✅ CORRECT: useEngagementAutoplay IN THE COMPONENT THAT HAS AUTOPLAY
  const {
    isAutoplayPaused,
    isResumeScheduled,
    userEngaged,
    engageUser,
    pause,
    resume,
  } = useEngagementAutoplay({
    totalItems: items.length,
    currentIndex: Math.floor(Math.abs(currentOffset) / itemWidth) % items.length,
    setIndex: () => {}, // Carousel handles its own animation
    autoplayTime: 50, // Fast for smooth animation
    resumeDelay,
    resumeTriggers,
    
    // ✅ SELECTORS: Target this specific carousel
    containerSelector: `[data-autoplay-scope="${scopeId}"]`,
    itemSelector: `[data-autoplay-scope="${scopeId}"] [data-smooth-item]`,
    
    inView: autoplay && inView,
    pauseOnEngage,
    engageOnlyOnActiveItem: false,
    activeItemAttr: "data-active",
  });

  // ✅ ANIMATION: Controlled by engagement system
  useEffect(() => {
    if (!autoplay || !inView || isAutoplayPaused) return;

    let animationId;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentOffset((prev) => {
        let newOffset = prev - speed * deltaTime;
        if (Math.abs(newOffset) >= totalWidth) {
          newOffset = newOffset + totalWidth;
        }
        return newOffset;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [autoplay, inView, isAutoplayPaused, speed, totalWidth]);

  // Handle item interaction
  const handleItemInteraction = (item, index, interactionType) => {
    if (pauseOnEngage) {
      engageUser();
    }
    onItemInteraction?.(item, index, interactionType);
  };

  // Responsive gradient width
  const getGradientWidth = () => {
    if (typeof window === "undefined") return gradientWidth.base;
    const vw = window.innerWidth;
    return vw >= 768 ? gradientWidth.md : gradientWidth.base;
  };

  return (
    <div
      ref={containerRef}
      data-autoplay-scope={scopeId}
      className={`relative w-full overflow-hidden ${className}`}
      data-smooth-carousel
    >
      {/* Gradient masks */}
      {gradientMask && (
        <>
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none"
            style={{ width: `${getGradientWidth()}px` }}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none"
            style={{ width: `${getGradientWidth()}px` }}
          />
        </>
      )}

      {/* Carousel container */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => {
          if (pauseOnHover) {
            engageUser();
          }
        }}
        onMouseLeave={() => {
          // The engagement system handles hover-away
        }}
      >
        <div
          ref={trackRef}
          className={`flex items-center ${trackClassName}`}
          style={{
            transform: `translateX(${currentOffset}px)`,
            width: "max-content",
            gap: `${gap}px`,
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item._originalIndex}-${item._duplicateIndex}-${index}`}
              data-smooth-item
              className="flex-shrink-0"
              onMouseEnter={() => handleItemInteraction(item, index, 'hover')}
            >
              {renderItem(item, index, {
                isActive: false,
                onInteraction: (type) => handleItemInteraction(item, index, type),
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 text-xs bg-black/50 text-white p-2 rounded pointer-events-none z-50">
          <div>🎠 Autoplay: {autoplay ? 'ON' : 'OFF'}</div>
          <div>👁️ InView: {inView ? 'YES' : 'NO'}</div>
          <div>⏸️ Paused: {isAutoplayPaused ? 'YES' : 'NO'}</div>
          <div>👤 Engaged: {userEngaged ? 'YES' : 'NO'}</div>
          <div>⏲️ Resume: {isResumeScheduled ? 'YES' : 'NO'}</div>
        </div>
      )}
    </div>
  );
});

SmoothScrollCarousel.displayName = 'SmoothScrollCarousel';

export default SmoothScrollCarousel;