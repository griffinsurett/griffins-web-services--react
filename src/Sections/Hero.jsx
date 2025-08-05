// src/components/Hero.jsx
import React from "react";
import Button from "../components/Button";
import { siteData } from "../siteData";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-5 pt-32 pb-20 primary-bg relative">
      {/* Dark gradient background */}
      <div className="absolute inset-0 hero-gradient-bg"></div>
      <div className="inner-section relative z-10">
        <h1 className="h1 mb-2">
          Build Your <span className="text-accent-heading">Digital Empire</span>{" "}
          with {siteData.title}
        </h1>
        <p className="hero-text secondary-text mb-10 max-w-4xl mx-auto">
          {siteData.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Button variant="primary">Get Started Today ✨</Button>
          <Button variant="secondary">View Our Work 👀</Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
