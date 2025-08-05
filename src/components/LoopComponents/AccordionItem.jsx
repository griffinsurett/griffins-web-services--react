// src/components/LoopComponents/AccordionItem.jsx
import React from "react";

/**
 * Single accordion entry (only `data` prop!)
 */
function AccordionItem({ data }) {
  const { question, answer } = data;
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className={`outer-card-color cursor-pointer rounded-2xl transition-all main-duration overflow-hidden ${
        isOpen
          ? "border border-accent shadow-xl shadow-accent/10"
          : "border border-accent/20"
      }`}
    >
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-card transition-colors main-duration focus:outline-none"
      >
        <h3 className="h3 pr-4">{question}</h3>
        <div
          className={`flex-shrink-0 icon-xsmall transition-all main-duration ${
            isOpen ? "card-icon-color rotate-45" : "bg-accent/20 rotate-0"
          }`}
        >
          <svg
            className={`w-4 h-4 ${isOpen ? "" : "text-accent"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all main-duration ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-5">
          <div className="w-full h-px bg-accent/20 mb-4" />
          <p className="secondary-text leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default AccordionItem;
