// src/components/buttons/PrimaryButton.jsx
import React from "react";
import AnimatedElementWrapper from "../AnimatedElementWrapper";

const PrimaryButton = ({ Base, className = "", ...props }) => {
  const classes = [
    "button-transition button-hover-transition",
    "border-2 border-primary",
    "bg-primary text-bg",

    // Light-mode hover (keep text dark, make bg transparent)
    "hover:text-zinc-900",
    "hover:bg-transparent",

    // Dark-mode hover (override only in dark)
    "dark:hover:text-primary-light",
  ].join(" ");

  return (
  //   <AnimatedElementWrapper
  //     variant="zoom-in"
  //     animationDuration={400}
  //     animationDelay={200} // ⬅️ same stagger you had
  //     threshold={0.2}
  //     className="w-full lg:w-auto"
  //   rootMargin="0px 0px -50px 0px" // early trigger
  //   once={false}
  // >
    <Base className={`${classes} ${className}`} {...props} />
  // </AnimatedElementWrapper>
  )
};

export default PrimaryButton;
