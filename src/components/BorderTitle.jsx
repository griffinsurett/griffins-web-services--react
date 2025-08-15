// src/components/BorderTitle.jsx
// "px-5 py-2 text-sm uppercase tracking-wider mb-6"
import React from "react";
import AnimatedBorder from "./AnimatedBorder";

/**
 * BorderTitle
 * - Delegates all visibility logic to AnimatedBorder.
 * - In view: progress-b-f runs forward; out of view: reverses.
 * - Optional hover sweep overlay for extra flair.
 */
export default function BorderTitle({
  children,
  className = "",
  duration = 1200,                 // ms for the progress sweep
  hoverSweep = true,               // show animated sweep on hover
  pillPadding = "text-sm px-5 py-2 tracking-wider", // spacing around the text
}) {
  return (
    <div className="inline-block mb-3">
      <div className="relative inline-block">
        {/* Always mounted. AnimatedBorder handles visible → forward, not visible → reverse */}
        <AnimatedBorder
          variant="progress-b-f"
          triggers="visible"
          duration={duration}
          borderRadius="rounded-full"
          borderWidth={2}
          color="var(--color-accent)"
          className="inline-block"
          innerClassName={`bg-transparent border-transparent ${pillPadding}`}
        >
          <span className={`uppercase tracking-wider font-semibold primary-text ${className}`}>
            {children}
          </span>
        </AnimatedBorder>

        {/* Optional: hover sweep overlay */}
        {hoverSweep && (
          <div className="absolute inset-0 pointer-events-none">
            <AnimatedBorder
              variant="progress-infinite"
              triggers="hover"
              duration={1200}
              borderRadius="rounded-full"
              borderWidth={2}
              color="var(--color-accent)"
              className="w-full h-full"
              innerClassName="bg-transparent border-transparent px-0 py-0 pointer-events-none"
            >
              <span className="sr-only">Decorative border sweep</span>
            </AnimatedBorder>
          </div>
        )}
      </div>
    </div>
  );
}
