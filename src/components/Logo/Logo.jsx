// ──────────────────────────────────────────────────────────────
// Updated Logo.jsx to use LottieLogo
// ──────────────────────────────────────────────────────────────

// src/components/Logo/Logo.jsx
import React, { useEffect, useRef, useState } from "react";
import TextLogo from "./TextLogo";
import LottieLogo from "./LottieLogo"; // Changed from VideoLogo
import { useVisibility } from "../../hooks/animations/useVisibility";

/**
 * Logo combines the Lottie logo and the animated text logo.
 * Now using Lottie instead of video for smoother reverse playback!
 */
const Logo = ({
  loading = "lazy",
  trigger = "auto",
  textFadeMs = 1200,
  animateOutText = false,
}) => {
  const textRef = useRef(null);
  const [textHidden, setTextHidden] = useState(false);

  // Always call the hook; gate the behavior by `animateOutText`
  useVisibility(textRef, {
    threshold: 0,
    pauseDelay: textFadeMs,
    onForward: () => {
      if (animateOutText) setTextHidden(true);
    },
    onBackward: () => setTextHidden(false),
  });

  // If animateOutText is turned off at runtime, ensure text is shown
  useEffect(() => {
    if (!animateOutText) setTextHidden(false);
  }, [animateOutText]);

  return (
    <a href="/" className="flex justify-center items-center gap-1.5">
      {/* <LottieLogo
        alt="Griffin's Web Services Animated Logo"
        loading={loading}
        trigger={trigger}
      /> */}
      <div>
        <TextLogo
          ref={textRef}
          title="Griffin's Web Services"
          className="flex flex-col p-0 m-0"
          fadeDuration={textFadeMs}
          hidden={textHidden}
          loading={loading}
        />
      </div>
    </a>
  );
};

export default Logo;