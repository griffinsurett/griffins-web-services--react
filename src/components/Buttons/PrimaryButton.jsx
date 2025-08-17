// src/components/buttons/PrimaryButton.jsx
import React from "react";

const PrimaryButton = ({ Base, className = "", ...props }) => {
  const classes =
    [
      "button-transition button-hover-transition",
      "border-2 border-accent",
      "bg-accent text-zinc-900",

      // Light-mode hover (keep text dark, make bg transparent)
      "hover:text-zinc-900",
      "hover:bg-transparent",

      // Dark-mode hover (override only in dark)
      "dark:hover:text-white",
    ].join(" ");

  return <Base className={`${classes} ${className}`} {...props} />;
};

export default PrimaryButton;
