// src/components/Hero.jsx
import React from "react";
import Button from "../components/Buttons/Button";
import Heading from "../components/Heading";
import { siteData } from "../siteData";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-5 pt-32 pb-20 bg-bg relative">
      <div className="absolute inset-0 hero-gradient-bg"></div>
      <div className="inner-section relative z-10">
        <Heading
          tagName="h1"
          className="mb-2"
          before="Build Your "
          text="Digital Empire"
          textClass="emphasized-text"
          after={` with ${siteData.title}`}
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
