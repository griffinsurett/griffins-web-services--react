// src/Sections/WebsiteTypes.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import EnhancedAccordionItem from "../components/LoopComponents/EnhancedAccordionItem";
import VideoPlayer from "../components/VideoPlayer";
import { useAnimatedElement } from "../hooks/useAnimatedElement";
import useEngagementAutoplay from "../hooks/useEngagementAutoplay";
import EarRape from "../assets/Black-Microwave-Earrape.mp4";
import Heading from "../components/Heading";
import BorderTitle from "../components/BorderTitle";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper"; // ⬅️ add this import

const demoVideo = EarRape;

const WebsiteTypes = () => {
  const sectionRef = useRef(null);

   const websiteTypes = [
    { icon: "🚀", title: "Landing Pages",            description: "High-converting single-page websites designed to capture leads and drive specific actions for your marketing campaigns.",     videoSrc: demoVideo },
    { icon: "🛠️", title: "Custom Websites", description: "Fully custom sites built around your brand and workflow—unique UX, motion, integrations, and back-end logic tailored end-to-end.", videoSrc: demoVideo},
    { icon: "🏢", title: "Small Business Websites",  description: "Professional websites that establish credibility and help local businesses attract and retain customers online.",            videoSrc: demoVideo },
    { icon: "💼", title: "Personal Portfolio Websites", description: "Showcase your work, skills, and achievements with a stunning portfolio that makes you stand out from the competition.", videoSrc: demoVideo },
    { icon: "✍️", title: "Blogs",                    description: "Content-focused websites with easy-to-use publishing tools to share your expertise and build your audience.",              videoSrc: demoVideo },
    { icon: "🛒", title: "E-Commerce Websites",      description: "Complete online stores with shopping carts, secure payments, inventory management, and everything you need to sell online.", videoSrc: demoVideo },
    { icon: "🤝", title: "Restaurant Websites",      description: "Websites designed specifically for restaurants, featuring menus, reservations, and online ordering.",   videoSrc: demoVideo },
    { icon: "🏛️", title: "Large Corporate Websites", description: "Enterprise-level websites with advanced functionality, multi-user management, and scalable architecture for growing companies.", videoSrc: demoVideo },
    { icon: "⚙️", title: "Custom Full-Stack Applications", description: "Bespoke web applications tailored to your unique business processes, with custom databases and advanced functionality.", videoSrc: demoVideo },
  ];

  // Just need IO to know when the section is visible
  const isInView = useAnimatedElement({
    ref: sectionRef,
    duration: 500,
    delay: 0,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    threshold: 0.25,
    rootMargin: "0px 0px -20% 0px", // start fading out before fully leaving
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

  // ===== INLINE ACCORDION AUTOPLAY LOGIC =====
  const [activeIndex, setActiveIndex] = useState(0);
  const radioName = "website-types";

  const suppressEngageRef = useRef(false);
  const engageRef = useRef(null);

  const selectIndex = useCallback(
    (index) => {
      const input = document.querySelector(
        `input[type="radio"][name="${radioName}"][value="${index}"]`
      );
      if (input) {
        suppressEngageRef.current = true;
        input.click(); // semantic + fires 'change'
      }
    },
    [radioName]
  );

  const core = useEngagementAutoplay({
    totalItems: websiteTypes.length,
    currentIndex: activeIndex,
    setIndex: selectIndex,
    autoplayTime,
    resumeDelay: 5000,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    containerSelector: "[data-accordion-container], [data-video-container]",
    itemSelector: "[data-accordion-item], [data-video-container]",
    inView: isInView,
    pauseOnEngage: false,
    engageOnlyOnActiveItem: true,
    activeItemAttr: "data-active",
  });

  useEffect(() => {
    engageRef.current = core.engageUser;
  }, [core.engageUser]);

  // Listen to native radio changes
  useEffect(() => {
    const radios = Array.from(
      document.querySelectorAll(`input[type="radio"][name="${radioName}"]`)
    );

    const onChange = (e) => {
      if (!e.target.checked) return;
      const idx = parseInt(e.target.value, 10);
      setActiveIndex(Number.isFinite(idx) ? idx : 0);

      if (suppressEngageRef.current) {
        suppressEngageRef.current = false;
      } else {
        // mark engagement (so when the video ends, we pause autoplay)
        engageRef.current?.();
      }
    };

    radios.forEach((r) => r.addEventListener("change", onChange));

    const checked = radios.find((r) => r.checked);
    if (checked) {
      const idx = parseInt(checked.value, 10);
      setActiveIndex(Number.isFinite(idx) ? idx : 0);
    } else if (websiteTypes.length > 0) {
      selectIndex(0);
    }

    return () =>
      radios.forEach((r) => r.removeEventListener("change", onChange));
  }, [radioName, selectIndex, websiteTypes.length]);

  const handleManualSelection = () => {
    // clicking video/controls: just mark engagement
    core.engageUser();
  };

  const handleVideoEnded = useCallback(() => {
    core.beginGraceWindow(); // tell the engine we're in the delay/grace window
  }, [core.beginGraceWindow]);

  const isAutoplayPaused = core.isAutoplayPaused;
  const userEngaged = core.userEngaged;
  const isResumeScheduled = core.isResumeScheduled;
  const reschedule = core.schedule; // call when video timing changes
  // ===== END INLINE ACCORDION AUTOPLAY LOGIC =====

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

      // schedule timer based on fresh video duration (don't rebind effect)
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
    <section
      ref={sectionRef}
      className="outer-section bg-bg2 relative"
      id="website-types"
    >
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

        <div className="max-2-primary" data-accordion-container>
          {/* Left: Accordion list */}
          <div className="flex flex-col space-y-4">
            {websiteTypes.map((websiteType, idx) => (
              <AnimatedElementWrapper
                key={idx}
                variant="fade-in"
                animationDuration={600}
                animationDelay={idx * 300} // ⬅️ same stagger you had
                threshold={0}
                rootMargin="0px 0px -50px 0px" // early trigger
                once={false}
              >
                <EnhancedAccordionItem
                  key={idx}
                  data={websiteType}
                  isActive={activeIndex === idx}
                  progress={progress}
                  onToggle={handleRadioChange}
                  shouldShowFullBorder={false}
                  index={idx}
                  name="website-types"
                  value={idx.toString()}
                  className="transition-all duration-300"
                >
                  {/* Mobile video for active item */}
                  {activeIndex === idx && (
                    <VideoPlayer
                      key={`mobile-${idx}-${activeIndex}`}
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
              </AnimatedElementWrapper>
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
                <AnimatedElementWrapper
                variant="fade-in"
                animationDuration={900}
                animationDelay={300}
                threshold={0.2}
                rootMargin="0px 0px -50px 0px"
                once={false}
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
                </AnimatedElementWrapper>

                {/* Debug */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4 text-xs opacity-75 bg-zinc-800 p-2 rounded">
                    <div>👁️ In View: {isInView ? "✅" : "❌"}</div>
                    <div>
                      ⏸️ Autoplay Paused: {isAutoplayPaused ? "✅" : "❌"}
                    </div>
                    <div>👤 Engaged: {userEngaged ? "✅" : "❌"}</div>
                    <div>
                      ⏲️ Resume Scheduled: {isResumeScheduled ? "✅" : "❌"}
                    </div>
                    <div>🎪 Active Index: {activeIndex}</div>
                    <div>📊 Progress: {Math.round(progress)}%</div>
                  </div>
                )}
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
