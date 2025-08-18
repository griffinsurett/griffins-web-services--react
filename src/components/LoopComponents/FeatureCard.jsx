// src/components/LoopComponents/FeatureCard.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder";
import IconListItem from "./IconListItem";

export default function FeatureCard({
  data,
  className = "",
  ringDuration = 800, // keep the border sweep snappy
}) {
  const { icon, title, description } = data;

  return (
    <AnimatedBorder
      variant="progress-b-f"
      triggers="hover"
      duration={ringDuration}
      borderRadius="rounded-3xl"
      borderWidth={2}
      // Slow down the hover lift/transform without touching the ring speed
      className={`group text-center outer-card-transition outer-card-hover-transition !duration-[900ms] ease-out ${className}`}
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
  );
}
