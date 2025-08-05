// src/components/Header.jsx - Only text color update needed
import React from "react";
import HamburgerIcon from "./Menu/HamburgerIcon";
import HamburgerMenu from "./Menu/HamburgerMenu";
import Logo from "./Logo/Logo";

export default function Header() {
  const checkboxId = "nav-toggle";

  return (
    <>
      <header className="fixed inset-x-0 top-0 bg-transparent z-[99999] w-19/20 lg:9/10 mx-auto">
        <div className="flex items-center justify-between py-2">
          <a href="/" className="text-2xl font-bold text-primary">
           <Logo loading="eager"/>
          </a>
          
          {/* Hidden checkbox for state */}
          <input
            id={checkboxId}
            type="checkbox"
            className="hidden"
          />
          
          {/* Hamburger/X Button */}
          <HamburgerIcon
            checkboxId={checkboxId}
            className="text-primary transition-colors duration-300"
          />
        </div>
      </header>

      {/* Navigation Modal */}
      <HamburgerMenu checkboxId={checkboxId} />
    </>
  );
}