// src/components/TextLogo.jsx
import React, { useRef, useState } from "react";
import { useVisibility } from "../../hooks/useVisibility";

export default function TextLogo({
  title = "",
  className = "",
  firstClass = "text-2xl lg:text-3xl -ml-[0.1rem] font-medium",
  restClass  = "font-light text-accent uppercase text-xs lg:text-sm p-0 m-0 tracking-wider",
  fadeDuration = 1200,  
}) {
  const [firstWord, ...others] = title.split(" ");
  const restOfTitle = others.join(" ");
  const [hidden, setHidden] = useState(false);
  const ref = useRef(null);

  // hide when scrolling down, show when scrolling up
  useVisibility(ref, {
     threshold: 0,
     pauseDelay: fadeDuration,
     onForward:  () => setHidden(true),
     onBackward: () => setHidden(false),
  });

  return (
    <div
      ref={ref}
      className={`
        ${className}
        transition-opacity duration-[${fadeDuration}ms]
        transition-transform duration-[${fadeDuration}ms]
        ease-in-out transform
        ${hidden
          ? "opacity-0 -translate-y-4"
          : "opacity-100 translate-y-0"
        }
      `}
    >
      <span className={firstClass} style={{ lineHeight: "normal" }}>{firstWord}</span>
      {restOfTitle && <span className={restClass} style={{ lineHeight: "normal" }}> {restOfTitle}</span>}
    </div>
  );
}
