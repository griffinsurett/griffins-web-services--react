import React, { forwardRef } from "react";

/**
 * Pure presentational TextLogo.
 * Parent controls visibility via the `hidden` prop.
 */
const TextLogo = forwardRef(function TextLogo(
  {
    title = "",
    className = "",
    firstClass = "text-2xl lg:text-3xl -ml-[0.1rem] leading-wide font-bold",
    restClass  = "font-light text-accent uppercase text-xs lg:text-sm p-0 m-0 tracking-wider",
    fadeDuration = 1200,
    hidden = false,
    ...rest
  },
  ref
) {
  const [firstWord, ...others] = (title || "").split(" ");
  const restOfTitle = others.join(" ");

  return (
    <div
      ref={ref}
      {...rest}
      className={`
        ${className}
        transition-opacity duration-[${fadeDuration}ms]
        transition-transform duration-[${fadeDuration}ms]
        ease-in-out transform
        ${hidden ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
      `}
    >
      <span className={firstClass} style={{ lineHeight: "normal" }}>
        {firstWord}
      </span>
      {restOfTitle && (
        <span className={restClass} style={{ lineHeight: "normal" }}>
          {" "}{restOfTitle}
        </span>
      )}
    </div>
  );
});

export default TextLogo;
