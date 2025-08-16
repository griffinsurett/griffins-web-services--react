// src/components/About.jsx
import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";
import Heading from "../components/Heading";
import { siteData } from "../siteData";

const About = () => {
  const Services = [
    { icon: "💭", title: "Dream", description: "We turn your ideas..." },
    { icon: "🎨", title: "Design", description: "Custom web design..." },
    { icon: "⚡", title: "Develop", description: "Fast, secure..." },
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
