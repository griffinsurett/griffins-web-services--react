// src/components/buttons/PrimaryButton.jsx
import React from "react";

const PrimaryButton = ({ Base, className = "", ...props }) => {
  const classes =
    "button-transition button-hover-transition border-2 border-accent bg-accent text-zinc-900 " +
    "hover:bg-primary-secondary dark:hover:text-white hover:bg-transparent";
  return <Base className={`${classes} ${className}`} {...props} />;
};

export default PrimaryButton;
