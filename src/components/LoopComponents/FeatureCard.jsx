// src/components/LoopComponents/FeatureCard.jsx
import React, { useRef } from "react";
import AnimatedBorder from "../AnimatedBorder";
import IconListItem from "./IconListItem";
import { useAnimatedElement } from "../../hooks/useAnimatedElement";

export default function FeatureCard({
  data,
  className = "",
  ringDuration = 800,
  animationMode = "load", // "load" | "scroll"
  animationDuration = 600,
  animationDelay = 0, // For stagger effect when in a list
}) {
  const { icon, title, description } = data;
  const cardRef = useRef(null);

  // Hook up animation
  const { progress, isAnimating, direction } = useAnimatedElement({
    ref: cardRef,
    animation: "scale-in",
    mode: animationMode,
    duration: animationDuration,
    threshold: 0.2,
    rootMargin: "-50px", // Start 50px before entering viewport
    reverse: true,
    once: false,
  });

  return (
    <div
      ref={cardRef}
      className={`animated-element scale-in ${className}`}
      style={{
        "--animation-delay": `${animationDelay}ms`,
        "--animation-progress": `${progress}%`,
        "--animation-progress-decimal": progress / 100,
        "--animation-direction": direction,
        "--animation-duration": `${animationDuration}ms`,
      }}
      data-animating={isAnimating}
      data-animation-direction={direction}
    >
      <AnimatedBorder
        variant="progress-b-f"
        triggers="hover"
        duration={ringDuration}
        borderRadius="rounded-3xl"
        borderWidth={2}
        className="group text-center outer-card-transition outer-card-hover-transition !duration-[900ms] ease-out"
        innerClassName="h-85 mx-auto px-10 flex flex-col justify-center items-center relative card-bg"
      >
        {/* Inner gradient overlay - shows accent hint on hover */}
        <div className="inner-card-style inner-card-transition inner-card-color" />

        <IconListItem
          data={data}
          layout="vertical"
          alignment="center"
          iconClassName="icon-large z-10 mb-5 card-icon-color"
          titleClassName="h3 mb-3 relative z-10"
          titleTag="h3"
          descriptionClassName="text-text leading-relaxed relative z-10"
          descriptionTag="p"
        />
      </AnimatedBorder>
    </div>
  );
}