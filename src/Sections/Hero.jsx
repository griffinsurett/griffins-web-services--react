// src/components/Hero.jsx
import React, { useState } from "react";
import Button from "../components/Buttons/Button";
import Heading from "../components/Heading";
import { siteData } from "../siteData";

const heroTaglines = [
  { before: "Get a Website That ", emphasized: "Actually Sells", after: " for Your Business" },
  { before: "Build Your ", emphasized: "Digital Empire", after: " with Griffin's Web Services" },
  // { before: "Transform Your Business with a ", emphasized: "High-Performance Website", after: " That Converts" },
  { before: "Leave Your Competition ", emphasized: "In the Dust", after: " with a Blazing Fast Website" },
  { before: "Your Business Deserves a ", emphasized: "Professional Website", after: " That Delivers." },
  { before: "Boost Your Business with a ", emphasized: "Lightning-Fast Website" },
  { before: "Get a High-Performing Website That ", emphasized: "Loads in Seconds", after: " — Not Minutes" }
];

const Hero = () => {
  // Pick a random tagline once per mount (no slideshow)
  const [currentTagline] = useState(() =>
    Math.floor(Math.random() * heroTaglines.length)
  );

  const tagline = heroTaglines[currentTagline];

  return (
    <section className="min-h-screen flex items-center justify-center text-center px-5 pt-32 pb-20 bg-bg relative">
      <div className="absolute inset-0 hero-gradient-bg"></div>
      <div className="inner-section relative z-10 text-left lg:text-center">
        <Heading
          tagName="h1"
          className="mb-2"
          before={tagline.before}
          text={tagline.emphasized}
          textClass="emphasized-text"
          after={tagline.after}
        />
        <p className="hero-text text-text mb-8 max-w-4xl mx-auto">
          {siteData.description}
        </p>
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button variant="primary" href="#contact">
              Get Started Today ✨
            </Button>
            <Button variant="secondary" href="#projects">
              View Our Work 👀
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
