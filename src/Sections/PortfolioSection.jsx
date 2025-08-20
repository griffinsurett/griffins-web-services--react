// src/Sections/PortfolioSection.jsx
import React, { useRef } from "react";
import PortfolioCarousel from "../components/PortfolioCarousel";
import { useVisibility } from "../hooks/useVisibility";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";
import ProntoDesktop from "../assets/ProntoJunkRemoval/pronto-desktop.jpg";
import FariasDesktop from "../assets/FariasDemolition/Farias-Desktop.jpg";
import JSVDesktop from "../assets/JSV-Quick-Solar/JSV-Desktop.jpg";
import PablosDesktop from "../assets/PablosPeakRoofing/Pablos-Desktop.jpg"
import RoonysDesktop from "../assets/RoonysMarketing/Roonys-Desktop.jpg";

export default function PortfolioSection() {
  const sectionRef = useRef(null);

  const items = [
    { id: 1, title: "Pronto Junk Removal", image: ProntoDesktop },
    { id: 2, title: "Roonys Marketing", image: RoonysDesktop },
    { id: 3, title: "Faria's Demolition", image: FariasDesktop },
    { id: 4, title: "Pablo's Peak Roofing", image: PablosDesktop },
    { id: 5, title: "JSV Quick Solar", image: JSVDesktop },
  ];

  useVisibility(sectionRef, {
    threshold: 0.3,
    onForward: () => {},
    onBackward: () => {},
  });

  return (
    <section
      ref={sectionRef}
      className="w-screen overflow-x-hidden outer-section bg-bg relative"
      id="projects"
      data-portfolio-section
    >
      <div className="section-color-border"></div>

      <div className="inner-section">
        <header className="text-section">
          <BorderTitle>Our Projects</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before="Our "
            text="Portfolio"
            textClass="emphasized-text"
          />
          <p className="large-text mx-auto">
            Discover the websites we've crafted for businesses across different
            industries
          </p>
        </header>

        <PortfolioCarousel items={items} autoAdvanceDelay={6000} autoplay />
      </div>
    </section>
  );
}
