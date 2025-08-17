// src/components/About.jsx
import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";
import Heading from "../components/Heading";
import { siteData } from "../siteData";

const About = () => {
   const Services = [
    {
      icon: "💭",
      title: "Dream",
      description:
        "We turn your ideas into stunning digital experiences. Our team collaborates with you to understand your vision and create a website that reflects your brand and engages your audience.",
    },
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
    // {
    //   icon: "🛠️",
    //   title: "Ongoing Support",
    //   description:
    //     "24/7 maintenance, updates, and support to keep your website running smoothly. We're your long-term partner in digital growth and success.",
    // },
  ];

  return (
    <section className="outer-section bg-secondary relative">
      <div className="section-dim-border"></div>
      <div className="inner-section">
        <div className="text-section">
          <Heading
            tagName="h2"
            className="mb-6"
            before="Who We "
            text="Are"
            textClass="emphasized-text"
          />
          <p className="large-text">
            {siteData.title} is your trusted partner in digital transformation...
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
