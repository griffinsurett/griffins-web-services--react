// src/components/Menu/HamburgerMenu.jsx
import React from "react";
import Modal from "../Modal";
import UnderlineLink from "../LoopComponents/UnderlineLink";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function HamburgerMenu({ checkboxId = "nav-toggle" }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Sync modal state with checkbox
  React.useEffect(() => {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    const handleChange = () => {
      setIsOpen(checkbox.checked);
    };

    checkbox.addEventListener("change", handleChange);
    // Initialize
    handleChange();

    return () => checkbox.removeEventListener("change", handleChange);
  }, [checkboxId]);

  const handleClose = () => {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setIsOpen(false);
  };

  const handleNavClick = () => {
    // Close the menu when nav item is clicked
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      overlayClass="bg-primary/80"
      className="w-full h-full primary-bg flex items-center justify-center"
      allowScroll={false}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Navigation Menu */}
        <nav className="flex-1 flex items-center justify-center">
          <ul className="flex flex-col items-center space-y-8 text-center">
            {navItems.map((item) => (
              <li key={item.label}>
                <UnderlineLink
                  href={item.href}
                  className="text-3xl md:text-4xl font-bold hover:text-accent transition-colors duration-300"
                  onClick={handleNavClick}
                >
                  {item.label}
                </UnderlineLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Optional footer content in modal */}
        <div className="text-center pb-8 muted-text">
          <p className="text-sm">Ready to transform your online presence?</p>
        </div>
      </div>
    </Modal>
  );
}
