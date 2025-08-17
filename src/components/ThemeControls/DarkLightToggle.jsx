import React from "react";
import { CircleCheckbox } from "./checkboxes/CircleCheckbox";
import { UseMode } from "../../hooks/UseMode.js";

export default function ThemeToggle() {
  const [isLight, setIsLight] = UseMode();

  return (
    <div className="flex items-center gap-2">
      <CircleCheckbox
        checked={isLight}
        onChange={(e) => setIsLight(e.target.checked)}
        aria-label="Toggle light mode"
        className="faded-bg"
      >
        <div className="light:block dark:hidden">
<svg width="27" height="27" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="18" fill="var(--color-primary)"/>
  <g stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round">
    <line x1="50" y1="15" x2="50" y2="25"/>
    <line x1="50" y1="75" x2="50" y2="85"/>
    <line x1="15" y1="50" x2="25" y2="50"/>
    <line x1="75" y1="50" x2="85" y2="50"/>
    <line x1="25.86" y1="25.86" x2="32.32" y2="32.32"/>
    <line x1="67.68" y1="67.68" x2="74.14" y2="74.14"/>
    <line x1="25.86" y1="74.14" x2="32.32" y2="67.68"/>
    <line x1="67.68" y1="32.32" x2="74.14" y2="25.86"/>
  </g>
</svg>
        </div>
      </CircleCheckbox>
    </div>
  );
}
