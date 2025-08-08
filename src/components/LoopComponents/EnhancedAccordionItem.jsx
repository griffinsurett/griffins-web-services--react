// src/components/LoopComponents/EnhancedAccordionItem.jsx
import React from "react";
import AnimatedBorderCard from "../AnimatedBorderCard";

const EnhancedAccordionItem = ({
  data,
  isActive,
  progress = 0,
  onToggle,
  onHover,
  children,
  className = "",
  name, // Radio group name
  value, // Unique value for this accordion item
  index, // Index of this accordion item
  shouldShowFullBorder = false, // New prop to control border type
}) => {
  const { icon, title, description } = data;

  const handleMouseEnter = () => {
    onHover?.(index, true);
  };

  const handleMouseLeave = () => {
    onHover?.(index, false);
  };

  return (
    <div
      className={`group relative ${className}`}
      data-accordion-item
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hidden radio input for semantic accordion behavior */}
      <input
        type="radio"
        id={`accordion-${value}`}
        name={name}
        value={value}
        checked={isActive}
        onChange={onToggle}
        className="absolute -left-[9999px]" // keep it out of flow so no scroll-on-focus
        tabIndex={-1} // don't take focus
        aria-hidden="true" // label still toggles it
        data-accordion-radio
      />

      {/* Using the new AnimatedBorderCard component */}
      <AnimatedBorderCard
        isActive={isActive}
        progress={progress}
        showFullBorder={shouldShowFullBorder}
        className="transition-all duration-100"
      >
        {/* Header - Now a label for the radio input */}
        <label
          htmlFor={`accordion-${value}`}
          className="w-full text-left flex items-center justify-between p-5 hover:bg-card/50 transition-colors duration-300 cursor-pointer relative z-20"
          onMouseDown={(e) => e.preventDefault()} // prevent focus jump
        >
          <div className="flex items-center gap-2">
            <div className="icon-medium card-icon-color">{icon}</div>
            <div>
              <h3 className="h3">{title}</h3>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div
            className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-600 text-xl font-normal leading-none
            ${
              isActive
                ? "bg-accent text-black"
                : "bg-accent/20 group-hover:bg-accent/30 text-accent"
            }
          `}
          >
            <span className="block transform translate-y-[-1px]">
              {isActive ? "−" : "+"}
            </span>
          </div>
        </label>

        {/* Expandable Content */}
        <div
          className={`
            overflow-hidden transition-all duration-500 ease-in-out relative z-20
            ${isActive ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-6 pb-6">
            {/* Divider */}
            <div className="w-full h-px bg-accent/20 mb-4" />

            {/* Description */}
            <p className="secondary-text leading-relaxed mb-6">{description}</p>

            {/* Children (Video player on mobile) */}
            {children && <div className="lg:hidden">{children}</div>}
          </div>
        </div>
      </AnimatedBorderCard>
    </div>
  );
};

export default EnhancedAccordionItem;
