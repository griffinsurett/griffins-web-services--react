// src/Sections/WebsiteTypesSection.jsx
import React from "react";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";
import WebsiteTypes from "../components/WebsiteTypes";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper";

// Keep the marketing/content data here (or import from /data if you prefer)
import EarRape from "../assets/Black-Microwave-Earrape.mp4";
import FeatureCard from "../components/LoopComponents/FeatureCard";
const demoVideo = EarRape;

const WEBSITE_TYPES = [
  { icon: "🚀", title: "Landing Pages", description: "High-converting single-page websites designed to capture leads and drive specific actions for your marketing campaigns.", videoSrc: demoVideo },
  { icon: "🛠️", title: "Custom Websites", description: "Fully custom sites built around your brand and workflow—unique UX, motion, integrations, and back-end logic tailored end-to-end.", videoSrc: demoVideo },
  { icon: "🏢", title: "Small Business Websites", description: "Professional websites that establish credibility and help local businesses attract and retain customers online.", videoSrc: demoVideo },
  { icon: "💼", title: "Personal Portfolio Websites", description: "Showcase your work, skills, and achievements with a stunning portfolio that makes you stand out from the competition.", videoSrc: demoVideo },
  { icon: "✍️", title: "Blogs", description: "Content-focused websites with easy-to-use publishing tools to share your expertise and build your audience.", videoSrc: demoVideo },
  { icon: "🛒", title: "E-Commerce Websites", description: "Complete online stores with shopping carts, secure payments, inventory management, and everything you need to sell online.", videoSrc: demoVideo },
  { icon: "🤝", title: "Restaurant Websites", description: "Websites designed specifically for restaurants, featuring menus, reservations, and online ordering.", videoSrc: demoVideo },
  { icon: "🏛️", title: "Large Corporate Websites", description: "Enterprise-level websites with advanced functionality, multi-user management, and scalable architecture for growing companies.", videoSrc: demoVideo },
  { icon: "⚙️", title: "Custom Full-Stack Applications", description: "Bespoke web applications tailored to your unique business processes, with custom databases and advanced functionality.", videoSrc: demoVideo },
];

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

        {/* Functional component handles all IO + autoplay internally */}
        {/* Will be after videos */}
        {/* <WebsiteTypes types={WEBSITE_TYPES} /> */}
        
        {/* before videos are made */}
        <div className="max-3-secondary">
          {WEBSITE_TYPES.map((item, idx) => (
            <AnimatedElementWrapper
              key={idx}
              variant="scale-in"
              animationDuration={600}
              animationDelay={idx * 300} // ⬅️ same stagger you had
              threshold={0.1}
              rootMargin="0px 0px -10px 0px" // early trigger
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
