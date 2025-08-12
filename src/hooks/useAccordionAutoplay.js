// src/hooks/useAccordionAutoplay.js
import { useCallback, useEffect, useRef, useState } from "react";
import useEngagementAutoplay from "./useEngagementAutoplay";

/**
 * Native-radio–driven accordion autoplay.
 * - We derive active from radios; autoplay advances by clicking the next radio.
 * - Engagement never pauses video; it only causes us to pause AUTOPLAY once the video ends.
 * - Accepts `autoplayTime`: number | () => number (ms), typically (remaining video + delay).
 */
export default function useAccordionAutoplay({
  totalItems,
  initialIndex = 0,
  autoplayTime = 3000,       // number | () => number
  inView = true,
  radioName = "website-types",
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const suppressEngageRef = useRef(false);
  const engageRef = useRef(null);

  const selectIndex = useCallback(
    (index) => {
      const input = document.querySelector(
        `input[type="radio"][name="${radioName}"][value="${index}"]`
      );
      if (input) {
        suppressEngageRef.current = true;
        input.click(); // semantic + fires change
      }
    },
    [radioName]
  );

  const core = useEngagementAutoplay({
    totalItems,
    currentIndex: activeIndex,
    setIndex: selectIndex,
    autoplayTime,                 // 🔁 remaining time + delay (or static)
    resumeDelay: 5000,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    containerSelector: "[data-accordion-container], [data-video-container]",
    itemSelector: "[data-accordion-item], [data-video-container]",
    inView,
    nudgeOnResume: false,
    pauseOnEngage: false,         // 🚫 don’t pause on engage
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
      setActiveIndex(Number.isFinite(idx) ? idx : initialIndex);
    } else if (totalItems > 0) {
      selectIndex(initialIndex);
    }

    return () => radios.forEach((r) => r.removeEventListener("change", onChange));
  }, [radioName, selectIndex, initialIndex, totalItems]);

  const handleManualSelection = () => {
    // clicking video/controls: just mark engagement
    core.engageUser();
  };

  const handleVideoEnded = useCallback(() => {
    // If engaged, pause AUTOPLAY now; otherwise advance after 1s
    if (core.userEngaged) {
      core.pause();
    } else {
      setTimeout(core.advance, 1000);
    }
  }, [core]);

  return {
    activeIndex,
    isAutoplayPaused: core.isAutoplayPaused,
    isResumeScheduled: core.isResumeScheduled,
    userEngaged: core.userEngaged,
    handleManualSelection,
    handleVideoEnded,
    advanceToNext: core.advance,
    reschedule: core.schedule, // 👈 call when video time changes
    shouldShowFullBorder: () => false,
  };
}
