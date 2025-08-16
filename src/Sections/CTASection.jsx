// src/components/CTASection.jsx
import React from "react";
import Button from "../components/Buttons/Button";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";

const CTASection = () => {
  return (
    <section className="outer-section hero-gradient-bg primary-bg text-center relative">
      <div className="section-color-border"></div>
      <div className="inner-section">
        <div className="mb-12">
          <BorderTitle>Get Started</BorderTitle>
          <Heading tagName="h2" className="mb-6">
            Ready to Transform Your Online Presence?
          </Heading>
          <p className="large-text secondary-text">
            Join hundreds of successful businesses who trust Griffin's Web Services...
          </p>
        </div>
        <Button variant="primary" className="text-center">
          Start Your Project - 50% Off! 🎉
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
