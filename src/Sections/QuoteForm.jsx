// src/components/QuoteForm.jsx
import React, { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Form/Input";
import Textarea from "../components/Form/Textarea";
import Select from "../components/Form/Select";

const QuoteForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    websiteType: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  const websiteTypeOptions = [
    { value: "landing-page", label: "Landing Page" },
    { value: "small-business", label: "Small Business Website" },
    { value: "portfolio", label: "Personal Portfolio Website" },
    { value: "blog", label: "Blog" },
    { value: "ecommerce", label: "E-Commerce Website" },
    { value: "nonprofit", label: "Non-Profit Website" },
    { value: "corporate", label: "Large Corporate Website" },
    {
      value: "custom-app",
      label: "Custom Full-Stack Application",
    },
  ];

  const budgetOptions = [
    { value: "under-5k", label: "Under $5,000" },
    { value: "5k-10k", label: "$5,000 - $10,000" },
    { value: "10k-25k", label: "$10,000 - $25,000" },
    { value: "25k-50k", label: "$25,000 - $50,000" },
    { value: "over-50k", label: "$50,000+" },
  ];

  const timelineOptions = [
    { value: "asap", label: "ASAP" },
    { value: "1-month", label: "Within 1 month" },
    { value: "2-3-months", label: "2-3 months" },
    { value: "3-6-months", label: "3-6 months" },
    { value: "flexible", label: "I'm flexible" },
  ];

  return (
    <section className="outer-section bg-secondary relative">
      <div className="section-color-border"></div>
      <div className="inner-section">
        <div className="text-section">
          <div className="border-title">Get A Quote</div>
          <h2 className="h2 mb-6">
            Ready to Get <span className="text-accent-heading">Started?</span>
          </h2>
          <p className="large-text secondary-text">
            Tell us about your project and we'll provide you with a detailed
            quote within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="group inner-card-bg outer-card-style"
        >
          <div className="inner-card-style"></div>

          <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name *"
              required
            />

            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address *"
              required
            />

            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />

            <Input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Company Name"
            />

            <Select
              name="websiteType"
              value={formData.websiteType}
              onChange={handleInputChange}
              placeholder="Type of Website *"
              colSpan="md:col-span-2"
              required
              options={websiteTypeOptions}
            />

            <Select
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Project Budget"
              options={budgetOptions}
            />

            <Select
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              placeholder="Project Timeline"
              options={timelineOptions}
            />

            <Textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Project Details * - Tell us about your project, goals, and any specific requirements..."
              colSpan="md:col-span-2"
              required
            />
          </div>

          <div className="text-center relative z-10">
            <Button type="submit" variant="primary">
              Get a Quote
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default QuoteForm;
