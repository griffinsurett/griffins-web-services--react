import React, { useState } from "react";
import PortfolioCarousel from "../components/LoopComponents/PortfolioCarousel";
import Placeholder from "../assets/placeholder.jpg"

export default function PortfolioSection() {
  const items = [
    { id: 1, title: "E-commerce", image: Placeholder },
    { id: 2, title: "Restaurant", image: Placeholder },
    { id: 3, title: "Corporate",  image: Placeholder },
    { id: 4, title: "Portfolio",  image: Placeholder },
    { id: 5, title: "Blog",       image: Placeholder },
    { id: 6, title: "Landing",    image: Placeholder },
    { id: 7, title: "SaaS",       image: Placeholder },
  ];

  const [index, setIndex] = useState(0);

  return (
    <section className="w-screen overflow-x-hidden outer-section bg-secondary relative">
      <div className="inner-section">
        <header className="text-section">
          <div className="border-title">Our Projects</div>
          <h2 className="h2 text-white mb-6">
            Our <span className="emphasized-text">Portfolio</span>
          </h2>
          <p className="large-text mx-auto">
            Discover the websites we've crafted for businesses across different industries
          </p>
        </header>

        <PortfolioCarousel
          items={items}
          currentIndex={index}
          onChange={setIndex}
          showArrows={false}
          showDots={true}
          autoPlay={true}
          autoPlayInterval={4000}
          pauseOnHover={true}
        />
      </div>
    </section>
  );
}
