// src/components/buttons/PrimaryButton.jsx
import React from "react";

const PrimaryButton = ({ Base, className = "", ...props }) => {
  const classes =
    [
      "button-transition button-hover-transition",
      "border-2 border-primary",
      "bg-primary text-bg",

      // Light-mode hover (keep text dark, make bg transparent)
      "hover:text-zinc-900",
      "hover:bg-transparent",

      // Dark-mode hover (override only in dark)
      "dark:hover:text-white",
    ].join(" ");

  return <Base className={`${classes} ${className}`} {...props} />;
};

export default PrimaryButton;
