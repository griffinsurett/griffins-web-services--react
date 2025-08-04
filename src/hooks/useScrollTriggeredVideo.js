import { useEffect, useRef, useState } from "react";

export function useScrollTriggeredVideo(
  containerRef,
  videoRef,
  menuCheckboxId = "headerMenu-toggle"       // ← new optional 3rd arg
) {
  const [inView, setInView] = useState(false);
  const [activated, setActivated] = useState(false);
  const pauseTimeout = useRef(null);
  const lastScrollY = useRef(
    typeof window !== "undefined" ? window.pageYOffset : 0
  );

  // 1️⃣ IntersectionObserver → flag when we see it
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [containerRef]);

  // 2️⃣ Scroll & wheel → drive playback
  useEffect(() => {
    if (!inView) return;

    function handleMovement(deltaY) {
      const vid = videoRef.current;

      // first scroll down ever → activate
      if (!activated && deltaY > 0) {
        setActivated(true);
        return;
      }
      if (!vid) return;

      clearTimeout(pauseTimeout.current);

      if (deltaY > 0) {
        vid.playbackRate = 0.5;
        vid.play().catch(() => {});
      } else if (deltaY < 0) {
        vid.pause();
        const reverseStep = 0.02;
        vid.currentTime =
          vid.currentTime > reverseStep
            ? vid.currentTime - reverseStep
            : vid.duration;

        if (window.pageYOffset <= 0) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      }

      pauseTimeout.current = setTimeout(() => {
        vid.pause();
      }, 100);
    }

    function onWheel(e) {
      handleMovement(e.deltaY);
    }
    function onScroll() {
      const y = window.pageYOffset;
      const deltaY = y - lastScrollY.current;
      lastScrollY.current = y;
      handleMovement(deltaY);
    }

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(pauseTimeout.current);
    };
  }, [inView, activated, videoRef]);

  // 3️⃣ Autoplay as soon as “activated”
  useEffect(() => {
    if (!activated || !videoRef.current) return;
    videoRef.current.playbackRate = 0.5;
    videoRef.current.play().catch(() => {});
  }, [activated, videoRef]);

  // ────────────────────────────────────────────────────────────────────
  // 4️⃣ NEW: listen for your menu checkbox → reset video to 0 on open
  useEffect(() => {
    if (!menuCheckboxId) return;
    const box = document.getElementById(menuCheckboxId);
    if (!box) return;

    const resetOnOpen = () => {
      if (box.checked && videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    };

    box.addEventListener("change", resetOnOpen);
    // in case it’s already open on mount
    resetOnOpen();

    return () => {
      box.removeEventListener("change", resetOnOpen);
    };
  }, [menuCheckboxId, videoRef]);

  return { activated };
}
