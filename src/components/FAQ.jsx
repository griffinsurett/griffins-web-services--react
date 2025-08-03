import React from 'react';
import Button from './Button';

const FAQSection = () => {
  const faqs = [
    {
      question: "How long does it take to build a website?",
      answer: "Most websites are completed within 7-14 days depending on complexity. Simple landing pages can be done in 3-5 days, while complex e-commerce sites or custom applications may take 2-4 weeks. We'll provide you with a detailed timeline during our initial consultation."
    },
    {
      question: "What's included in your ongoing support?",
      answer: "Our ongoing support includes 24/7 monitoring, security updates, content updates, technical support, regular backups, performance optimization, and monthly analytics reports. We're basically your dedicated web team, ensuring your site stays fast, secure, and up-to-date."
    },
  ];

  return (
    <section className="section-padding bg-zinc-950 relative">
      <div className="section-color-border" />
      <div className="inner-section">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-5 py-2 border border-teal-500 text-teal-500 rounded-full text-sm font-medium uppercase tracking-wider mb-6">
            FAQ
          </div>
          <h2 className="h2 mb-6 text-white">
            Frequently Asked <span className="text-teal-500">Questions</span>
          </h2>
          <p className="large-text text-gray-300">
            Got questions? We've got answers. Here are the most common questions we receive about our web services.
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
          <p className="text-gray-400 mb-6">
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

export default FAQSection;

/**
 * Single accordion entry (only `data` prop!)
 */
function AccordionItem({ data }) {
  const { question, answer } = data;
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div
      className={`bg-white/5 rounded-2xl transition-all main-duration overflow-hidden ${
        isOpen
          ? "border border-teal-500 shadow-xl shadow-teal-500/10"
          : "border border-teal-500/20"
      }`}
    >
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors main-duration focus:outline-none"
      >
        <h3 className="h3 text-white pr-4">
          {question}
        </h3>
        <div
          className={`flex-shrink-0 icon-xsmall transition-all main-duration ${
            isOpen ? "card-icon-color rotate-45" : "bg-teal-500/20 rotate-0"
          }`}
        >
          <svg
            className={`w-4 h-4 ${isOpen ? "" : "text-teal-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all main-duration ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-5">
          <div className="w-full h-px bg-teal-500/20 mb-4" />
          <p className="text-gray-300 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}
