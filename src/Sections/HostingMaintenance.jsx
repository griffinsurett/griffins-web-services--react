// src/Sections/HostingMaintenance.jsx
import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";
import PricingCard from "../components/LoopComponents/PricingCard";
import StatisticListing from "../components/LoopComponents/StatisticListing";
import IconListItem from "../components/LoopComponents/IconListItem";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";
import Button from "../components/Buttons/Button";

const HostingMaintenance = () => {
  const hostingFeatures = [
    {
      icon: "🛡️",
      title: "Enterprise Security",
      description:
        "SSL certificates, daily backups, malware scanning, and 24/7 security monitoring to keep your website safe from threats and data loss.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast Performance",
      description:
        "Global CDN, optimized servers, and performance monitoring ensure your site loads in under 2 seconds worldwide.",
    },
    {
      icon: "🔄",
      title: "Automatic Updates",
      description:
        "We handle all security patches, plugin updates, and maintenance tasks so your site stays current and secure without any effort from you.",
    },
    {
      icon: "📈",
      title: "Analytics & Reporting",
      description:
        "Monthly performance reports, traffic insights, and recommendations to help you understand and grow your online presence.",
    },
    {
      icon: "🎯",
      title: "Content Management",
      description:
        "Need changes? We handle content updates, new pages, and design tweaks. Just send us your requests and we'll take care of it.",
    },
    {
      icon: "☁️",
      title: "Reliable Cloud Hosting",
      description:
        "99.9% uptime guarantee on premium cloud infrastructure with automatic scaling to handle traffic spikes during busy periods.",
    },
  ];

  const whyChooseUs = [
    {
      icon: "⚡",
      title: "Faster Resolution",
      description:
        "We know your code, so we fix issues 10x faster than generic support.",
    },
    {
      icon: "🎯",
      title: "Proactive Monitoring",
      description:
        "We catch and fix problems before they affect your visitors.",
    },
    {
      icon: "📞",
      title: "Direct Access",
      description:
        "Talk directly to your website's developers, not tier-1 support.",
    },
  ];

  const trustIndicators = [
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Security Monitoring" },
    { number: "2hr", label: "Average Response Time" },
    { number: "500+", label: "Sites We Maintain" },
  ];

  const supportTiers = [
    {
      icon: "🌱",
      title: "Essential Care",
      price: "59",
      description:
        "Perfect for small businesses. Includes hosting, security, backups, and basic content updates.",
      features: [
        "Premium hosting",
        "SSL & security",
        "Weekly backups",
        "Basic support",
        "3 Minor content updates per week",
      ],
    },
    {
      icon: "🚀",
      title: "Growth Partner",
      price: "99",
      description:
        "For growing businesses. Everything in Essential plus priority support, performance optimization, and monthly analytics.",
      features: [
        "Everything in Essential",
        "Priority support",
        "Performance optimization",
        "Monthly analytics",
        "15 minor content updates",
        "Design tweaks",
      ],
      featured: true,
    },
    {
      icon: "👑",
      title: "Enterprise Shield",
      price: "199",
      description:
        "Maximum protection and support. Includes dedicated account manager, custom development, and white-glove service.",
      features: [
        "Everything in Growth",
        "Dedicated account manager",
        "Custom development hours",
        "Advanced analytics",
        "Marketing consultation",
        "24/7 phone support",
      ],
    },
  ];

  return (
    <section className="outer-section bg-bg relative" id="hosting">
      <div className="section-color-border"></div>
      <div className="inner-section">
        {/* Header */}
        <div className="text-section">
          <BorderTitle>Ongoing Partnership</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before="We Don't Just "
            text="Build & Leave"
            textClass="emphasized-text"
          />
          <p className="large-text">
            Your website is just the beginning. We're your long-term digital
            partner, providing reliable hosting, security, maintenance, and
            growth support so you can focus on running your business while we
            keep your online presence thriving.
          </p>
        </div>

        {/* What's Included */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Heading tagName="h3" className="h3 mb-4">
              What's Included in Every Plan
            </Heading>
            <p className="text-text max-w-2xl mx-auto">
              From security to performance, we handle all the technical details
              so your website stays fast, secure, and always available.
            </p>
          </div>

          <div className="max-3-primary gap-8 align-middle">
            {hostingFeatures.map((feature, idx) => (
              <FeatureCard key={idx} data={feature} />
            ))}
          </div>
        </div>

        {/* Support Tiers */}
        {/* <div className="mb-16">
          <div className="text-center mb-12">
            <Heading tagName="h3" className="h3 mb-4">
              Choose Your Support Level
            </Heading>
            <p className="text-text max-w-2xl mx-auto">
              From basic maintenance to full-service partnership, we have a plan
              that fits your business needs and budget.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {supportTiers.map((tier, idx) => (
              <PricingCard
                key={idx}
                data={tier}
                featured={tier.featured}
                className={tier.featured ? "lg:-mt-4 lg:mb-4" : ""}
              />
            ))}
          </div>
        </div> */}

        {/* Why Choose Our Hosting */}
        {/* <div className="text-center bg-bg2 section-box">
          <div className="inner-card-style inner-card-color opacity-30"></div>
          <div className="relative z-10">
            <Heading tagName="h3" className="h3 mb-4">
              Why Choose Our Hosting & Maintenance?
            </Heading>
            <p className="text-text text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
              Unlike generic hosting companies, we know your website inside and
              out because we built it. This means faster support, better
              optimization, and proactive maintenance that prevents problems
              before they happen.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {whyChooseUs.map((item, idx) => (
                <IconListItem key={idx} data={item} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="primary">Choose Your Plan 🚀</Button>
              <Button variant="secondary">Learn More About Hosting 💬</Button>
            </div>
          </div>
        </div> */}

        {/* Trust Indicators */}
        {/* <div className="text-center mt-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {trustIndicators.map((stat, idx) => (
              <StatisticListing key={idx} data={stat} />
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default HostingMaintenance;
