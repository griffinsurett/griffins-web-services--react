// src/components/FAQ.jsx
import React from "react";
import Button from "../components/Buttons/Button";
import AccordionItem from "../components/LoopComponents/AccordionItem";
import BorderTitle from "../components/BorderTitle";
import Heading from "../components/Heading";

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
    <section className="outer-section bg-bg2 relative">
      <div className="section-color-border" />
      <div className="inner-section">
        <div className="text-section">
          <BorderTitle>FAQ</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before="Frequently Asked "
            text="Questions"
            textClass="emphasized-text"
          />
          <p className="large-text">Got questions? We've got answers...</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              data={faq}
              name="faq" // shared group -> one open at a time
              value={String(idx)} // radio value
              defaultOpen={idx === 0} // open the first by default (optional)
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="secondary-text mb-6">
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
