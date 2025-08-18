// src/components/LoopComponents/CheckListItem.jsx
import React from "react";

export default function CheckListItem({ 
  children,
  className = "",
  checkmarkColor = "text-primary",
  checkmarkBgColor = "bg-primary/20",
  textClassName = "text-text text-sm leading-relaxed"
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className={`w-5 h-5 rounded-full ${checkmarkBgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <svg className={`w-3 h-3 ${checkmarkColor}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className={textClassName}>{children}</span>
    </div>
  );
}