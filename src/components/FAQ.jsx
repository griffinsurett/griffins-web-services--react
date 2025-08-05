
// src/components/FAQ.jsx
import React from "react";
import Button from "./Button";
import AccordionItem from "./LoopComponents/AccordionItem";

const FAQ = () => {
  const faqs = [
    {
      question: "How long does it take to build a website?",
      answer:
        "Most websites are completed within 7-14 days depending on complexity. Simple landing pages can be done in 3-5 days, while complex e-commerce sites or custom applications may take 2-4 weeks. We'll provide you with a detailed timeline during our initial consultation.",
    },
    {
      question: "What's included in your ongoing support?",
      answer:
        "Our ongoing support includes 24/7 monitoring, security updates, content updates, technical support, regular backups, performance optimization, and monthly analytics reports. We're basically your dedicated web team, ensuring your site stays fast, secure, and up-to-date.",
    },
  ];

  return (
    <section className="outer-section bg-secondary relative">
      <div className="section-color-border" />
      <div className="inner-section">
        {/* Header */}
        <div className="text-section">
          <div className="border-title mb-6">FAQ</div>
          <h2 className="h2 mb-6">
            Frequently Asked{" "}
            <span className="text-heading-accent">Questions</span>
          </h2>
          <p className="large-text">
            Got questions? We've got answers. Here are the most common questions
            we receive about our web services.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} data={faq} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-secondary mb-6">
            Still have questions? We're here to help!
          </p>
          <Button variant="primary" href="/#contact" className="text-center">
            Contact Us Today 💬
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;