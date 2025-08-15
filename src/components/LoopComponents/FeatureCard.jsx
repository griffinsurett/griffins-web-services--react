// src/components/LoopComponents/FeatureCard.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder";

export default function FeatureCard({
  data,
  className = "",
  ringDuration = 800, // keep the border sweep snappy
}) {
  const { icon, title, description } = data;

  return (
    <AnimatedBorder
      variant="progress"
      triggers="hover"
      duration={ringDuration}
      borderRadius="rounded-3xl"
      borderWidth={2}
      // Slow down the hover lift/transform without touching the ring speed
      className={`group text-center outer-card-transition outer-card-hover-transition !duration-[900ms] ease-out ${className}`}
      innerClassName="h-85 mx-auto px-10 flex flex-col justify-center items-center"
    >
      <div className="icon-large z-10 mb-5 card-icon-color">{icon}</div>
      <h3 className="h3 mb-3 relative z-10">{title}</h3>
      <p className="secondary-text leading-relaxed relative z-10">
        {description}
      </p>
    </AnimatedBorder>
  );
}
