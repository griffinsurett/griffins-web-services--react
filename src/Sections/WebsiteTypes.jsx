// src/Sections/WebsiteTypes.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import EnhancedAccordionItem from "../components/LoopComponents/EnhancedAccordionItem";
import VideoPlayer from "../components/VideoPlayer";
import useAccordionAutoplay from "../hooks/useAccordionAutoplay";
import { useVisibility } from "../hooks/useVisibility";
import EarRape from "../assets/Black-Microwave-Earrape.mp4";
import Heading from "../components/Heading";

import BorderTitle from "../components/BorderTitle";

const demoVideo = EarRape;

const WebsiteTypes = () => {
  const sectionRef = useRef(null);

  const websiteTypes = [
    { icon: "🚀", title: "Landing Pages", description: "High-converting single-page websites designed to capture leads and drive specific actions for your marketing campaigns.", videoSrc: demoVideo },
    { icon: "🏢", title: "Small Business Websites", description: "Professional websites that establish credibility and help local businesses attract and retain customers online.", videoSrc: demoVideo },
    { icon: "💼", title: "Personal Portfolio Websites", description: "Showcase your work, skills, and achievements with a stunning portfolio that makes you stand out from the competition.", videoSrc: demoVideo },
    { icon: "✍️", title: "Blogs", description: "Content-focused websites with easy-to-use publishing tools to share your expertise and build your audience.", videoSrc: demoVideo },
    { icon: "🛒", title: "E-Commerce Websites", description: "Complete online stores with shopping carts, secure payments, inventory management, and everything you need to sell online.", videoSrc: demoVideo },
    { icon: "🏛️", title: "Large Corporate Websites", description: "Enterprise-level websites with advanced functionality, multi-user management, and scalable architecture for growing companies.", videoSrc: demoVideo },
    { icon: "⚙️", title: "Custom Full-Stack Applications", description: "Bespoke web applications tailored to your unique business processes, with custom databases and advanced functionality.", videoSrc: demoVideo },
  ];

  // Just need IO to know when the section is visible
  const isInView = useVisibility(sectionRef, {
     threshold: 0.3,
     onForward: () => {},
     onBackward: () => {},
   });

  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);

  // Delay AFTER the slide finishes
  const autoAdvanceDelay = 3000;

  // Compute time-left for the active video + delay (ms)
  const autoplayTime = useMemo(
    () => () => {
      const v = desktopVideoRef.current || mobileVideoRef.current;
      if (!v || !isFinite(v.duration)) return autoAdvanceDelay;
      const remaining = Math.max(0, (v.duration - v.currentTime) * 1000);
      return remaining + autoAdvanceDelay;
    },
    [autoAdvanceDelay]
  );

  const {
    activeIndex,
    isAutoplayPaused,
    userEngaged,
    isResumeScheduled,
    handleManualSelection,
    handleVideoEnded,
    reschedule, // we’ll call via a ref so the reset effect doesn’t re-run
  } = useAccordionAutoplay({
    totalItems: websiteTypes.length,
    initialIndex: 0,
    inView: isInView,
    radioName: "website-types",
    autoplayTime, // remaining video + delay
  });

  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const advanceTimeoutRef = useRef(null);

  // Keep latest reschedule without retriggering the reset effect
  const rescheduleRef = useRef(reschedule);
  useEffect(() => {
    rescheduleRef.current = reschedule;
  }, [reschedule]);

  // Reset & play ONLY when the ACTIVE INDEX changes
  useEffect(() => {
    if (isTransitioning || !isInView) return;

    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const timer = setTimeout(() => {
      const desktopVideo = desktopVideoRef.current;
      const mobileVideo = mobileVideoRef.current;

      [desktopVideo, mobileVideo].forEach((video) => {
        if (video) {
          video.currentTime = 0;
          setProgress(0);
          video.play().catch(() => {});
        }
      });

      // schedule timer based on fresh video duration (don’t rebind effect)
      rescheduleRef.current?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeIndex, isTransitioning, isInView]); // ❗ no dependency on `reschedule`

  const handleTimeUpdate = () => {
    const v = desktopVideoRef.current || mobileVideoRef.current;
    if (!v?.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    // Recompute auto-advance timing as user scrubs/plays
    rescheduleRef.current?.();
  };

  const handleEnded = () => {
    setProgress(100);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    if (isInView) handleVideoEnded();
  };

  const handleVideoLoad = () => {
    setProgress(0);
    rescheduleRef.current?.(); // duration is now known
  };

  // Radio change (native)
  const handleRadioChange = () => {
    setIsTransitioning(true);
    setProgress(0);
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setTimeout(() => setIsTransitioning(false), 150);
  };

  const handleVideoClick = () => {
    // mark engagement only; do NOT pause the video
    handleManualSelection();
  };

  return (
    <section ref={sectionRef} className="outer-section secondary-bg relative">
      <div className="section-dim-border"></div>
      <div className="inner-section">
        <div className="text-section">
          <BorderTitle>Website Types</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before="Websites We "
            text="Build"
            textClass="emphasized-text"
          />
          <p className="large-text">
            From simple landing pages to complex web applications - we create
            websites tailored to your specific needs and industry.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12" data-accordion-container>
          {/* Left: Accordion list */}
          <div className="flex flex-col space-y-4">
            {websiteTypes.map((websiteType, i) => (
              <EnhancedAccordionItem
                key={i}
                data={websiteType}
                isActive={activeIndex === i}
                progress={progress}
                onToggle={handleRadioChange}
                shouldShowFullBorder={false}
                index={i}
                name="website-types"
                value={i.toString()}
                className="transition-all duration-300"
              >
                {/* Mobile video for active item */}
                {activeIndex === i && (
                  <VideoPlayer
                    key={`mobile-${i}-${activeIndex}`}
                    ref={mobileVideoRef}
                    src={websiteType.videoSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onLoadedData={handleVideoLoad}
                    onClick={handleVideoClick}
                    desktop={false}
                  />
                )}
              </EnhancedAccordionItem>
            ))}
          </div>

          {/* Right: Desktop video for active item */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <div
                className="transition-all duration-500 ease-in-out"
                data-video-container
                data-active="true"
              >
                <VideoPlayer
                  key={`desktop-${activeIndex}`}
                  ref={desktopVideoRef}
                  src={websiteTypes[activeIndex].videoSrc}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  onLoadedData={handleVideoLoad}
                  onClick={handleVideoClick}
                  desktop={true}
                  className="shadow-2xl shadow-accent/20"
                />

                <div className="mt-6 p-6 card-bg rounded-xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="icon-small card-icon-color">
                      {websiteTypes[activeIndex].icon}
                    </div>
                    <h3 className="h3">{websiteTypes[activeIndex].title}</h3>
                  </div>
                  <p className="secondary-text leading-relaxed">
                    {websiteTypes[activeIndex].description}
                  </p>

                  {/* Debug */}
                  <div className="mt-4 text-xs opacity-75 bg-zinc-800 p-2 rounded">
                    <div>👁️ In View: {isInView ? "✅" : "❌"}</div>
                    <div>⏸️ Autoplay Paused: {isAutoplayPaused ? "✅" : "❌"}</div>
                    <div>👤 Engaged: {userEngaged ? "✅" : "❌"}</div>
                    <div>⏲️ Resume Scheduled: {isResumeScheduled ? "✅" : "❌"}</div>
                    <div>🎪 Active Index: {activeIndex}</div>
                    <div>📊 Progress: {Math.round(progress)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* end right column */}
        </div>
      </div>
    </section>
  );
};

export default WebsiteTypes;
