import React from "react";
import { useAnimatedElement } from "../../hooks/useAnimatedElement";

const PrimaryButton = ({ Base = "button", className = "", ...props }) => {
  // IO-driven zoom timing
  const zoom = useAnimatedElement({
    duration: 400,
    delay: 0,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  });

  const classes = [
    "button-transition button-hover-transition",
    "border-2 border-primary",
    "bg-primary text-bg",
    "hover:text-zinc-900",
    "hover:bg-transparent",
    "dark:hover:text-primary-light",
  ].join(" ");

  return (
    <span
      ref={zoom.ref}
      className="inline-block animated-element zoom-in"
      {...zoom.props}   // adds data-visible + CSS vars for the zoom animation
    >
      <Base className={`${classes} ${className}`} {...props} />
    </span>
  );
};

export default PrimaryButton;
