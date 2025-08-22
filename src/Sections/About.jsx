import React from "react";
import FeatureCard from "../components/LoopComponents/FeatureCard";
import Heading from "../components/Heading";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper"; // ⬅️ add this import
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
  ];

  return (
    <section className="outer-section bg-secondary relative" id="about">
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
          <p className="large-text mb-8">
            Websites is what we do, we're here to make you a lightning fast,
            secure, and scalable website that handles your marketing campaigns,
            integrates with ai, and stands the test of time.
          </p>
        </div>

        <div className="max-3-secondary">
          {Services.map((item, idx) => (
            <AnimatedElementWrapper
              key={idx}
              variant="scale-in"
              animationDuration={600}
              animationDelay={idx * 300} // ⬅️ same stagger you had
              threshold={0.2}
              rootMargin="0px 0px -50px 0px" // early trigger
              once={false}
            >
              <FeatureCard data={item} />
            </AnimatedElementWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
