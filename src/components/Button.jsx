// src/components/Button.jsx
import React from "react";

const Button = ({
  variant = "primary",
  href,
  icon,
  className = "",
  children,
  ...props
}) => {
  // Only apply the shared "button" mechanics for primary/secondary
  const baseClasses =
    "button-style button-transition h4 shadow-accent/30 inline-flex items-center justify-center space-x-2";

  // Define each variant’s full set of classes
  const variantClasses = {
    primary: `${baseClasses} border border-accent bg-accent hover:bg-primary-secondary text-black hover:text-white hover:bg-transparent`,
    secondary: `${baseClasses} border-2 border-accent hover:bg-accent hover:text-black text-white`,
  };

  // Compose: baseButtonClasses only for primary/secondary, plus whatever
  // the caller passed in via className
  const allClasses = `${variantClasses[variant] || ""} ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={allClasses} {...props}>
        {icon}
       {children}
      </a>
    );
  }
  return (
    <button className={allClasses} {...props}>
      {icon}
       {children}
    </button>
  );
};

export default Button;
