// src/components/Carousel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCarouselAutoplay from "../hooks/useCarouselAutoplay";
import { useVisibility } from "../hooks/useVisibility";
import { useSideDragNavigation } from "../hooks/useInteractions";

/**
 * Simple 2D carousel with seamless infinite looping (via head/tail clones).
 * Layout: [arrow] [viewport] [arrow]
 *
 * `slidesPerView` supports responsive breakpoints, e.g. { base: 1, md: 2, lg: 3 }
 */
export default function Carousel({
  items = [],
  renderItem = () => null,
  slidesPerView = { base: 1, md: 2, lg: 3 },
  gap = 24,
  defaultIndex = 0,      // page index (real)
  autoplay = true,
  autoAdvanceDelay = 4000,
  showArrows = true,
  showDots = true,
  drag = true,
  className = "",
  debug = false,
}) {
  const containerRef = useRef(null);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);
  const trackRef = useRef(null);

  // viewport width for responsive SPV calc
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // resolve responsive slides-per-view
  const spv = useMemo(() => {
    const bp = [
      { key: "base", min: 0 },
      { key: "sm", min: 640 },
      { key: "md", min: 768 },
      { key: "lg", min: 1024 },
      { key: "xl", min: 1280 },
      { key: "2xl", min: 1536 },
    ];
    let current = slidesPerView.base ?? 1;
    for (const { key, min } of bp) {
      if (vw >= min && slidesPerView[key] != null) current = slidesPerView[key];
    }
    return Math.max(1, Number(current) || 1);
  }, [vw, slidesPerView]);

  // chunk items into pages of size spv (real pages)
  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < items.length; i += spv) out.push(items.slice(i, i + spv));
    return out.length ? out : [[]];
  }, [items, spv]);

  const pageCount = pages.length;

  // ── Infinite loop plumbing: clones + virtual index
  // displayPages = [lastClone, ...pages, firstClone] when pageCount > 1
  const displayPages = useMemo(() => {
    if (pageCount <= 1) return pages;
    return [pages[pageCount - 1], ...pages, pages[0]];
  }, [pages, pageCount]);

  const displayCount = displayPages.length;

  // virtual index (points into displayPages)
  const [vIndex, setVIndex] = useState(1); // 1 == first real page
  // snap to default real page on mount/changes
  useEffect(() => {
    const safeDefault = Math.min(Math.max(defaultIndex, 0), Math.max(pageCount - 1, 0));
    setVIndex(pageCount > 1 ? safeDefault + 1 : 0);
  }, [pageCount, defaultIndex]);

  // real page index derived from vIndex
  const realIndex = pageCount > 1 ? ((vIndex - 1 + pageCount) % pageCount) : 0;

  // scope for engagement hooks
  const scopeId = useMemo(
    () => `carousel-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  // autoplay only when visible
  const inView = useVisibility(containerRef, { threshold: 0.3 });

  const setRealPage = (i) => {
    if (pageCount <= 1) return;
    const normalized = ((i % pageCount) + pageCount) % pageCount;
    setVIndex(normalized + 1); // map real -> virtual
  };

  const { isAutoplayPaused, isResumeScheduled, userEngaged } = useCarouselAutoplay({
    totalItems: pageCount,
    currentIndex: realIndex,
    setIndex: setRealPage,
    autoAdvanceDelay,
    inView: autoplay && inView,
    containerSelector: `[data-autoplay-scope="${scopeId}"]`,
    itemSelector: `[data-autoplay-scope="${scopeId}"] [data-carousel-item]`,
  });

  // paging helpers (always move the virtual index)
  const goPrev = () => setVIndex((i) => (pageCount > 1 ? i - 1 : i));
  const goNext = () => setVIndex((i) => (pageCount > 1 ? i + 1 : i));

  // ── HoverGuard: block hover on cards while the track is animating
  const TRANSITION_MS = 500; // sync with duration-500
  const [transitioning, setTransitioning] = useState(false);
  const [instant, setInstant] = useState(false); // disable transition when snapping from clones

  useEffect(() => {
    if (instant) return; // don't show guard for instant snaps
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), TRANSITION_MS + 50);
    return () => clearTimeout(t);
  }, [vIndex, instant]);

  // When we hit a clone, snap (no transition) to the corresponding real page.
  useEffect(() => {
    if (pageCount <= 1) return;
    if (vIndex === 0 || vIndex === displayCount - 1) {
      // schedule after the transition finishes
      const onEnd = () => {
        let target = vIndex;
        if (vIndex === 0) target = pageCount;            // last real
        if (vIndex === displayCount - 1) target = 1;     // first real
        setInstant(true);
        setVIndex(target);
        // Two RAFs to ensure DOM has applied transform before re-enabling transition
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setInstant(false));
        });
      };
      const el = trackRef.current;
      if (!el) return;
      const handler = () => onEnd();
      el.addEventListener("transitionend", handler, { once: true });
      return () => el.removeEventListener("transitionend", handler);
    }
  }, [vIndex, pageCount, displayCount]);

  // side-only drag/tap
  useSideDragNavigation({
    enabled: drag && pageCount > 1,
    leftElRef: leftZoneRef,
    rightElRef: rightZoneRef,
    onLeft: goPrev,
    onRight: goNext,
    dragThreshold: Math.max(40, Math.round(vw * 0.05)),
    tapThreshold: 12,
  });

  const withArrows = showArrows && pageCount > 1;

  return (
    <div
      ref={containerRef}
      data-autoplay-scope={scopeId}
      className={`relative w-full ${className}`}
    >
      {/* Layout: [arrow] [viewport] [arrow] */}
      <div
        className={`relative grid items-center gap-x-4 md:gap-x-6 ${
          withArrows ? "grid-cols-[auto_1fr_auto]" : "grid-cols-1"
        }`}
      >
        {/* Left arrow (outside) */}
        {withArrows && (
          <div className="flex items-center justify-center">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full
                         bg-white/10 border border-white/20 secondary-text backdrop-blur-sm
                         hover:bg-white/20 transition"
            >
              <ChevronLeft className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        )}

        {/* Viewport */}
        <div className="relative overflow-hidden">
          {/* Track */}
          <div
            ref={trackRef}
            className={`relative z-20 flex ${
              instant ? "" : "transition-transform duration-500 ease-in-out"
            }`}
            style={{
              width: `${(pageCount > 1 ? displayCount : 1) * 100}%`,
              transform:
                pageCount > 1
                  ? `translateX(-${(vIndex * 100) / displayCount}%)`
                  : "translateX(0%)",
            }}
          >
            {(pageCount > 1 ? displayPages : pages).map((page, i, arr) => (
              <div
                key={`page-${i}`}
                data-carousel-item
                data-active={
                  pageCount > 1
                    ? (i === vIndex ? "true" : "false")
                    : (i === 0 ? "true" : "false")
                }
                className="shrink-0"
                style={{ width: `${100 / (pageCount > 1 ? arr.length : 1)}%` }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${spv}, minmax(0, 1fr))`,
                    gap,
                  }}
                >
                  {page.map((item, j) => (
                    <div key={`item-${i}-${j}`} className="min-w-0">
                      {renderItem(item, (i - 1) * spv + j /* approximate index */)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* HoverGuard (blocks card hover during slide) */}
          {transitioning && (
            <div className="absolute inset-0 z-30 pointer-events-auto" aria-hidden="true" />
          )}

          {/* Side-only DRAG ZONES (above guard, inside viewport) */}
          {drag && pageCount > 1 && (
            <>
              <div
                ref={leftZoneRef}
                className="absolute top-0 left-0 h-full z-40 cursor-grab touch-pan-x select-none"
                style={{ width: "32%" }}
                aria-hidden="true"
              />
              <div
                ref={rightZoneRef}
                className="absolute top-0 right-0 h-full z-40 cursor-grab touch-pan-x select-none"
                style={{ width: "32%" }}
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {/* Right arrow (outside) */}
        {withArrows && (
          <div className="flex items-center justify-center">
            <button
              onClick={goNext}
              aria-label="Next"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full
                         bg-white/10 border border-white/20 secondary-text backdrop-blur-sm
                         hover:bg-white/20 transition"
            >
              <ChevronRight className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Dots (reflect REAL index) */}
      {showDots && pageCount > 1 && (
        <nav className="mt-6 flex justify-center gap-3" aria-label="Carousel Pagination">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setRealPage(i)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                i === realIndex ? "bg-primary scale-[1.30]" : "bg-white/20 hover:bg-white/50"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </nav>
      )}

      {/* Debug */}
      {debug && (
        <div className="mt-4 text-xs opacity-70">
          <div>⏸️ Paused: {isAutoplayPaused ? "✅" : "❌"}</div>
          <div>👤 Engaged: {userEngaged ? "✅" : "❌"}</div>
          <div>⏲️ Resume in 5s: {isResumeScheduled ? "✅" : "❌"}</div>
          <div>📱 spv: {spv}</div>
          <div>📄 real pages: {pageCount}</div>
          <div>🧭 vIndex: {vIndex}</div>
          <div>🔁 realIndex: {realIndex}</div>
          <div>🧩 displayCount: {displayCount}</div>
        </div>
      )}
    </div>
  );
}
