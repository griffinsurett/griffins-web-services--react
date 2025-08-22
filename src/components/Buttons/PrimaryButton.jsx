import React from "react";
import { useAnimatedElement } from "../../hooks/useAnimatedElement";

const PrimaryButton = ({ Base = "button", className = "", ...props }) => {
  const anim = useAnimatedElement({
    duration: 400,
    delay: 0,
    threshold: 0,
    rootMargin: "0px 0px -15% 0px",
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
    <div ref={anim.ref} className="block w-full lg:w-auto">
      <Base
        className={`animated-element zoom-in w-full ${classes} ${className}`}
        style={anim.style}
        {...props}
      />
    </div>
  );
};

export default PrimaryButton;
