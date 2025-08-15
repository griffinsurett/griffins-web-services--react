// src/components/buttons/SecondaryButton.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder";

/** Secondary always uses the AnimatedBorder load effect. */
const SecondaryButton = ({
  Base,
  className = "",
  animatedBorder = {
    color: "var(--color-accent)",
    duration: 800,
    borderWidth: 2,
    borderRadius: "rounded-full",
  },
  ...props
}) => {
  const {
    color = "var(--color-accent)",
    duration = 800,
    borderWidth = 2,
    borderRadius = "rounded-full",
  } = animatedBorder || {};

  const innerClasses =
    `bg-transparent text-white ${borderRadius} ` +
    `hover:bg-accent hover:text-black`;

  return (
    <AnimatedBorder
      variant="progress"
      triggers="always"          // run once on mount
      duration={duration}
      color={color}
      borderWidth={borderWidth}
      borderRadius={borderRadius}
      className="inline-block"
      innerClassName={`bg-transparent shadow-none p-0 ${borderRadius}`}
    >
      <Base className={`${innerClasses} ${className}`} {...props} />
    </AnimatedBorder>
  );
};

export default SecondaryButton;
