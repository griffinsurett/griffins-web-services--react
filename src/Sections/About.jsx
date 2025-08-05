// src/components/About.jsx
import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";
import { siteData } from "../siteData";

const About = () => {
  const Services = [
    {
      icon: "🎨",
      title: "Design",
      description:
        "Custom web design that reflects your brand and converts visitors into customers. We create beautiful, user-friendly interfaces that make lasting impressions.",
    },
    {
      icon: "⚡",
      title: "Develop",
      description:
        "Fast, secure, and scalable websites built with modern technology. From simple landing pages to complex e-commerce platforms, we bring your vision to life.",
    },
    {
      icon: "🛠️",
      title: "Ongoing Support",
      description:
        "24/7 maintenance, updates, and support to keep your website running smoothly. We're your long-term partner in digital growth and success.",
    },
  ];

  return (
    <section className="outer-section bg-secondary relative">
      <div className="section-dim-border"></div>
      <div className="inner-section">
        <div className="text-section">
          <h2 className="h2 mb-6">
            Who We <span className="text-accent-heading">Are</span>
          </h2>
          <p className="large-text">
            {siteData.title} is your trusted partner in digital transformation.
            We combine creative design, cutting-edge development, and ongoing
            support to help businesses thrive online.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {Services.map((item, idx) => (
            <FeatureCard key={idx} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
