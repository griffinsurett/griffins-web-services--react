// src/components/buttons/UnderlineLink.jsx
import React from "react";

/**
 * Underline Link (variant)
 * Minimal inline element with animated underline.
 */
const UnderlineLink = ({
  Base,
  className = "",
  underlineColor = "currentColor",
  underlineHeight = 2,
  underlineOffset = 2,
  underlineOnHover = true,
  ...props
}) => {
  const h = typeof underlineHeight === "number" ? `${underlineHeight}px` : underlineHeight;
  const off = typeof underlineOffset === "number" ? `${underlineOffset}px` : underlineOffset;

  const behavior =
    underlineOnHover
      ? "after:w-0 group-hover:after:w-full focus-visible:after:w-full"
      : "after:w-full";

  return (
    <Base
      kind="link"
      className={[
        "relative group no-underline",
        "after:content-[''] after:absolute after:left-0 after:bottom-[var(--ul-off)]",
        "after:h-[var(--ul-h)] after:bg-[var(--ul-color)]",
        "after:transition-[width] after:duration-300",
        behavior,
        className,
      ].join(" ")}
      style={{
        "--ul-color": underlineColor,
        "--ul-h": h,
        "--ul-off": off,
      }}
      {...props}
    />
  );
};

export default UnderlineLink;
