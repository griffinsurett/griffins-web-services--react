// src/components/LoopComponents/CircleImageItem/CircleImageItem.jsx
import React from "react";

export default function CircleImageItem({
  src,                 // e.g. t.image
  letter,              // e.g. t.avatar ("S", "A", etc.) if no image
  alt = "",
  size = "sm",         // "sm" | "md" | "lg"
  className = "",
}) {
  const sizeMap = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" };
  const sizeClasses = sizeMap[size] ?? sizeMap.sm;

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 ${sizeClasses} flex items-center justify-center ${className}`}
      aria-label={alt}
      title={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
          loading="eager"
          width="56"
          height="56"
        />
      ) : (
        <span className="text-sm font-semibold">{letter ?? "?"}</span>
      )}
    </div>
  );
}
