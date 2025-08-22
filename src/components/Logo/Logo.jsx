import React, { useEffect, useRef, useState } from "react";
import TextLogo from "./TextLogo";
import VideoLogo from "./VideoLogo";
import { useVisibility } from "../../hooks/useVisibility";

/**
 * Logo combines the video logo and the animated text logo.
 * `animateOutText`: when true (default), text hides on forward scroll and shows on backward scroll.
 * When false, text stays visible (no “out” animation).
 */
const Logo = ({
  loading = "lazy",
  trigger = "auto",
  textFadeMs = 1200,
  animateOutText = false,              // ← requested prop name
}) => {
  const textRef = useRef(null);
  const [textHidden, setTextHidden] = useState(false);

  // Always call the hook; gate the behavior by `animateOutText`
  useVisibility(textRef, {
    threshold: 0,
    pauseDelay: textFadeMs,
    onForward:  () => { if (animateOutText) setTextHidden(true); },
    onBackward: () => setTextHidden(false),
  });

  // If animateOutText is turned off at runtime, ensure text is shown
  useEffect(() => {
    if (!animateOutText) setTextHidden(false);
  }, [animateOutText]);

  return (
    <a href="/" className="flex justify-center items-center gap-1.5">
      <VideoLogo
        alt="Griffin's Web Services Animated Logo"
        loading={loading}
        trigger={trigger}
      />
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
