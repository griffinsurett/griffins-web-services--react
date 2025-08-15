// src/Sections/PortfolioSection.jsx
import React, { useRef } from "react";
import PortfolioCarousel from "../components/PortfolioCarousel";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import Placeholder from "../assets/placeholder.jpg";
import ProntoDesktop from "../assets/ProntoJunkRemoval/pronto-desktop.jpg"
import FariasDesktop from "../assets/FariasDemolition/Farias-Desktop.jpg"
import JSVDesktop from "../assets/JSV-Quick-Solar/JSV-Desktop.jpg"
import BorderTitle from "../components/BorderTitle";

export default function PortfolioSection() {
  const sectionRef = useRef(null);

  const items = [
    { id: 1, title: "Pronto Junk Removal", image: ProntoDesktop },
    { id: 2, title: "Faria's Demolition", image: FariasDesktop },
    { id: 3, title: "JSV Quick Solar",  image: JSVDesktop },
    // { id: 4, title: "Corporate",  image: Placeholder },
  ];

  // Keep section-specific concerns here (e.g., header animations)
  useScrollAnimation(sectionRef, {
    threshold: 0.3,
    onForward: () => {},
    onBackward: () => {},
  });

  return (
    <section
      ref={sectionRef}
      className="w-screen overflow-x-hidden outer-section bg-secondary relative"
      data-portfolio-section
    >
            <div className="section-color-border"></div>

      <div className="inner-section">
        <header className="text-section">
          <BorderTitle>Our Projects</BorderTitle>
          <h2 className="h2 text-white mb-6">
            Our <span className="emphasized-text">Portfolio</span>
          </h2>
          <p className="large-text mx-auto">
            Discover the websites we've crafted for businesses across different industries
          </p>
        </header>

        {/* Carousel owns its autoplay/engagement */}
        <PortfolioCarousel items={items} autoAdvanceDelay={4000} autoplay />
      </div>
    </section>
  );
}
