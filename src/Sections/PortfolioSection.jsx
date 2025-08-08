import React, { useState } from "react";
import PortfolioCarousel from "../components/LoopComponents/PortfolioCarousel";

export default function PortfolioSection() {
  const items = [
    { id: 1, title: "E-commerce", image: "https://via.placeholder.com/1600x1000/4F46E5/FFFFFF?text=E-commerce+Site" },
    { id: 2, title: "Restaurant", image: "https://via.placeholder.com/1600x1000/7C3AED/FFFFFF?text=Restaurant+Site" },
    { id: 3, title: "Corporate",  image: "https://via.placeholder.com/1600x1000/059669/FFFFFF?text=Corporate+Site" },
    { id: 4, title: "Portfolio",  image: "https://via.placeholder.com/1600x1000/DC2626/FFFFFF?text=Portfolio+Site" },
    { id: 5, title: "Blog",       image: "https://via.placeholder.com/1600x1000/EA580C/FFFFFF?text=Blog+Site" },
    { id: 6, title: "Landing",    image: "https://via.placeholder.com/1600x1000/0891B2/FFFFFF?text=Landing+Page" },
    { id: 7, title: "SaaS",       image: "https://via.placeholder.com/1600x1000/7E22CE/FFFFFF?text=SaaS+Dashboard" },
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
