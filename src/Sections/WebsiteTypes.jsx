// src/components/WebsiteTypes.jsx
import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";

const WebsiteTypes = () => {
  const websiteTypes = [
    {
      icon: "🚀",
      title: "Landing Pages",
      description:
        "High-converting single-page websites designed to capture leads and drive specific actions for your marketing campaigns.",
    },
    {
      icon: "🏢",
      title: "Small Business Websites",
      description:
        "Professional websites that establish credibility and help local businesses attract and retain customers online.",
    },
    {
      icon: "💼",
      title: "Personal Portfolio Websites",
      description:
        "Showcase your work, skills, and achievements with a stunning portfolio that makes you stand out from the competition.",
    },
    {
      icon: "✍️",
      title: "Blogs",
      description:
        "Content-focused websites with easy-to-use publishing tools to share your expertise and build your audience.",
    },
    {
      icon: "🛒",
      title: "E-Commerce Websites",
      description:
        "Complete online stores with shopping carts, secure payments, inventory management, and everything you need to sell online.",
    },
    {
      icon: "❤️",
      title: "Non-Profit Websites",
      description:
        "Mission-driven websites that inspire action, facilitate donations, and help you make a greater impact in your community.",
    },
    {
      icon: "🏛️",
      title: "Large Corporate Websites",
      description:
        "Enterprise-level websites with advanced functionality, multi-user management, and scalable architecture for growing companies.",
    },
    {
      icon: "⚙️",
      title: "Custom Full-Stack Applications",
      description:
        "Bespoke web applications tailored to your unique business processes, with custom databases and advanced functionality.",
    },
  ];

  return (
    <section className="outer-section bg-secondary relative">
      <div className="inner-section">
        <div className="text-section">
          <div className="border-title">Website Types</div>
          <h2 className="h2 mb-6">
            Websites We <span className="text-accent-heading">Build</span>
          </h2>
          <p className="large-text">
            From simple landing pages to complex web applications - we create
            websites tailored to your specific needs and industry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {websiteTypes.map((item, idx) => (
            <FeatureCard key={idx} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WebsiteTypes;
