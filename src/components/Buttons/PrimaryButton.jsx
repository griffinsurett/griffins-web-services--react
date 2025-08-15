// src/components/buttons/PrimaryButton.jsx
import React from "react";

const PrimaryButton = ({ Base, className = "", ...props }) => {
  const classes =
    "button-transition button-hover-transition border-2 border-accent bg-accent text-black " +
    "hover:bg-primary-secondary hover:text-white hover:bg-transparent";
  return <Base className={`${classes} ${className}`} {...props} />;
};

export default PrimaryButton;
