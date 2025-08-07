// src/components/AnimatedBorderCard.jsx
import React from "react";

const AnimatedBorderCard = ({
  children,
  isActive = false,
  progress = 0,
  showFullBorder = false,
  borderRadius = "rounded-3xl",
  borderWidth = "1px",
  className = "",
  innerClassName = "",
  ...props
}) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {/* Animated progress border overlay or full border */}
      {isActive && (
        <div 
          className={`absolute inset-0 ${borderRadius} pointer-events-none`}
          style={{
            background: showFullBorder 
              ? 'var(--color-accent)' // Full border for manual selection/hover
              : `conic-gradient(
                  from 0deg,
                  var(--color-accent) 0deg,
                  var(--color-accent) ${progress * 3.6}deg,
                  transparent ${progress * 3.6}deg,
                  transparent 360deg
                )`, // Progress border for autoplay/animations
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: borderWidth
          }}
        />
      )}

      {/* Inner content with background that creates the border illusion */}
      <div className={`card-bg ${borderRadius} overflow-hidden relative z-10 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorderCard;