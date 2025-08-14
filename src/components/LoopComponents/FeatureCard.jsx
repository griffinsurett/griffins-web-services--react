// src/components/LoopComponents/FeatureCard.jsx
import React from "react";
import AnimatedBorderCard from "../AnimatedBorderCard";

export default function FeatureCard({ data, className = "", ringDuration = 2000 }) {
  const { icon, title, description } = data;

  return (
      <AnimatedBorderCard
      variant="progress"
      trigger="hover"
      duration={ringDuration}
      loop={true}
      borderRadius="rounded-3xl"
      borderWidth={2}
        className={`group text-center outer-card-transition ${className}`}
      innerClassName="h-85 mx-auto px-10 flex flex-col justify-center items-center"
    >
            {/* subtle inner gradient, same as before */}
      <div className="icon-large z-10 mb-5 card-icon-color">{icon}</div>
      <h3 className="h3 mb-3 relative z-10">{title}</h3>
      <p className="secondary-text leading-relaxed relative z-10">{description}</p>
    </AnimatedBorderCard>
  );
}
