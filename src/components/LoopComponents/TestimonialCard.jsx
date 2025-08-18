// src/components/LoopComponents/TestimonialCard.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder";

export default function TestimonialCard({
  data,
  className = "",
  ringDuration = 800, // keep the border sweep snappy (matches FeatureCard)
}) {
  const { tag, quote, author, role, avatar, rating } = data;

  const RatingStar = ({ i }) => (
    <svg
      key={i}
      className="w-5 h-5 text-accent fill-current"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <AnimatedBorder
      variant="progress"
      triggers="hover"
      duration={ringDuration}
      borderRadius="rounded-3xl"
      borderWidth={2}
      className={`group text-left outer-card-transition !duration-[900ms] ease-out ${className}`}
      innerClassName="px-8 py-8 lg:px-10 lg:py-10 relative card-bg"
    >
      {/* Inner gradient overlay - shows accent hint on hover */}
      <div className="inner-card-style inner-card-transition inner-card-color" />

      <div className="card-icon-color icon-medium mb-5 z-10 relative">❝</div>

      <p className="text-text text-lg leading-relaxed mb-8 italic relative z-10">
        "{quote}"
      </p>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="icon-small card-icon-color">{avatar}</div>
          <div>
            <h4 className="h4">{author}</h4>
            <p className="text-text text-sm">{role}</p>
          </div>
        </div>

        <div className="flex gap-1 text-center justify-center items-center">
          {[...Array(rating)].map((_, i) => (
            <RatingStar key={i} i={i} />
          ))}
        </div>
      </div>
    </AnimatedBorder>
  );
}
