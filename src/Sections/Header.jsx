// src/components/Header.jsx - Only text color update needed
import React from "react";
import HamburgerIcon from "../components/Menu/HamburgerIcon";
import HamburgerMenu from "../components/Menu/HamburgerMenu";
import Logo from "../components/Logo/Logo";
import ThemeControls from "../components/ThemeControls/ThemeControls";

export default function Header() {
  const checkboxId = "nav-toggle";

  return (
    <>
      <header className="fixed inset-x-0 top-0 bg-transparent z-[99999] w-19/20 lg:9/10 mx-auto">
        <div className="flex items-center justify-between py-2">
          <Logo loading="eager" trigger="scroll" animateOutText={true} />

          {/* Hidden checkbox for state */}
          <input id={checkboxId} type="checkbox" className="hidden" />

          <ThemeControls />

          {/* Hamburger/X Button */}
          <HamburgerIcon
            checkboxId={checkboxId}
            className="text-headingtransition-colors duration-300"
          />
        </div>
      </header>

      {/* Navigation Modal */}
      <HamburgerMenu checkboxId={checkboxId} />
    </>
  );
}
