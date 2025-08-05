// src/components/VideoLogo.jsx
import { useRef } from "react";
import { useScrollTriggeredVideo } from "../../hooks/useScrollTriggeredVideo";

import POSTER_SRC from "../../assets/GWS-animated.png";
import VIDEO_SRC from "../../assets/GWS-animated.webm";
// const mediaClasses = "block w-[30px] md:w-[40px] lg:w-[43px] h-auto";

export default function VideoLogo({ alt = "", className = "logo-class", mediaClasses = "block w-[35px] p-0 m-0 md:w-[40px] lg:w-[45px] h-auto", loading = "lazy" }) {
  const containerRef = useRef(null);
  const videoRef     = useRef(null);

  const { activated } = useScrollTriggeredVideo(containerRef, videoRef);

  return (
    <div ref={containerRef}>
      {!activated ? (
        <img
          src={POSTER_SRC}
          alt={alt}
          loading={loading}
          className={`${className} ${mediaClasses}`}
        />
      ) : (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          className={`${className} ${mediaClasses}`}
        />
      )}
    </div>
  );
}
