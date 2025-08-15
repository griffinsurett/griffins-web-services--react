// src/components/UnderlineLink.jsx
import React from "react";
import Button from "../Buttons/Button";

const UnderlineLink = ({ href, children, className = "", ...props }) => (
  <Button
    href={href}
    variant="link"
    className={`
      relative inline-flex items-center group
      bg-transparent hover:bg-transparent
      primary-text hover:text-accent
      !shadow-none     !hover:shadow-none
      !transform-none  !hover:transform-none   
      px-0 py-0
      ${className}
    `}
    {...props}
  >
    {children}
    <span
      className="
        absolute bottom-0 left-0 h-0.5 w-0 bg-accent
        transition-all duration-450
        group-hover:w-full
      "
    />
  </Button>
);

export default UnderlineLink;
