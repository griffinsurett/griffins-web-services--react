// src/components/LoopComponents/LabelIcon.jsx
import React from "react";

export default function LabelIcon({
  tech,
  index,
  isActive = false,
  onTouch,
  onMouseEnter,
  className = "",
}) {
  const itemKey = `${tech.name}-${index}`;

  return (
    <div
      data-tech-item
      className={`group flex flex-col items-center flex-shrink-0 ${className}`}
    >
      {/* Logo container */}
      <div
        className="
          relative
          p-3 md:p-4
          transition-all duration-300
          group-hover:scale-110
          cursor-pointer
          select-none
        "
        // Mobile touch handlers
        onTouchStart={(e) => {
          // e.preventDefault();
          onTouch?.(tech.name, index);
        }}
        // Desktop mouse handlers
        onMouseEnter={() => {
          onMouseEnter?.();
        }}
      >
        {/* Glow effect on hover or mobile active */}
        <div
          className={`
            absolute inset-0
            bg-accent/30
            blur-2xl
            transition-opacity duration-300
            rounded-full
            ${isActive 
              ? "opacity-100" 
              : "opacity-0 group-hover:opacity-100"
            }
          `}
        />

        {/* Icon */}
        <div 
          className={`
            relative text-heading transition-opacity duration-300
            ${isActive 
              ? "opacity-100" 
              : "opacity-70 group-hover:opacity-100"
            }
          `}
        >
          {tech.icon}
        </div>
      </div>

      {/* Tech name - visible on hover OR mobile active */}
      <div
        className={`
          mt-2
          text-xs md:text-sm
          text-muted
          transition-all duration-300
          whitespace-nowrap
          ${isActive 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          }
        `}
      >
        {tech.name}
      </div>
    </div>
  );
}