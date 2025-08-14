// src/components/Benefits.jsx
import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";
import BorderTitle from "../components/BorderTitle";

const Benefits = () => {
  const benefits = [
    {
      icon: "📱",
      title: "Mobile First",
      description:
        "Responsive design that looks perfect on every device. Over 60% of traffic is mobile - we make sure you're ready.",
    },
    {
      icon: "🎯",
      title: "Conversion Focused",
      description:
        "Strategic design that turns visitors into customers. Every element is crafted to guide users toward your business goals.",
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security and 99.9% uptime. Your website stays safe and accessible around the clock.",
    },
    {
      icon: "🚀",
      title: "SEO Optimized",
      description:
        "Built-in SEO best practices help you rank higher on Google and attract more organic traffic to grow your business.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Optimized for speed and performance. Your site loads in under 2 seconds, keeping visitors engaged and improving SEO rankings.",
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description:
        "Round-the-clock support and maintenance included. We're here to help your website evolve as your business grows.",
    },
  ];

  return (
    <section className="outer-section primary-bg">
      <div className="section-color-border"></div>
      <div className="inner-section">
        <div className="text-section">
          <BorderTitle>Benefits</BorderTitle>
          <h2 className="h2 mb-6">
            Why Choose{" "}
            <span className="text-accent-heading">Griffin's Web?</span>
          </h2>
          <p className="large-text">
            We don't just build websites - we craft digital experiences that
            drive real results for your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {benefits.map((item, idx) => (
            <FeatureCard key={idx} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
