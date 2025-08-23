// src/Sections/WebsiteTypesSection.jsx
import React from "react";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper";
import FeatureCard from "../components/LoopComponents/FeatureCard";

import WEBSITE_TYPES from "../websiteTypes";

export default function WebsiteTypesSection() {
  return (
    <section className="outer-section bg-bg2 relative" id="website-types">
      <div className="section-dim-border" />
      <div className="inner-section">
        <div className="text-section">
          <BorderTitle>Website Types</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before="Websites We "
            text="Build"
            textClass="emphasized-text"
          />
          <p className="large-text">
            From simple landing pages to complex web applications — we create
            websites tailored to your specific needs and industry.
          </p>
        </div>

        <div className="max-3-secondary">
          {WEBSITE_TYPES.map((item, idx) => (
            <AnimatedElementWrapper
              key={item.key}
              variant="scale-in"
              animationDuration={600}
              animationDelay={idx * 100}
              threshold={0.1}
              rootMargin="0px 0px -10px 0px"
              once={false}
            >
              <FeatureCard data={item} />
            </AnimatedElementWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
