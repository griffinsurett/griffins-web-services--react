// src/components/Testimonials.jsx
import React from "react";
import TestimonialCard from "../components/LoopComponents/TestimonialCard";
import BorderTitle from "../components/BorderTitle";

const Testimonials = () => {
  const testimonials = [
    {
      tag: "E-commerce",
      quote:
        "Griffin's Web transformed our online store completely. Sales increased by 300% in the first month after launch. The team understood our vision and delivered beyond expectations.",
      author: "Sarah Chen",
      role: "CEO, TechGear Plus",
      avatar: "S",
      rating: 5,
    },
    {
      tag: "Restaurant",
      quote:
        "Our new website has been a game-changer for online orders. The design is beautiful and the ordering system is so intuitive. Customer feedback has been overwhelmingly positive!",
      author: "Alessandro Moretti",
      role: "Owner, Bella Vista Bistro",
      avatar: "A",
      rating: 5,
    },
  ];

  return (
    <section className="outer-section bg-secondary relative">
      <div className="section-color-border"></div>
      <div className="inner-section">
        <div className="text-section">       
          <BorderTitle>Testimonials</BorderTitle>
          <h2 className="h2 mb-6">
            What Our <span className="text-accent-heading">Clients Say</span>
          </h2>
          <p className="large-text">
            Don't just take our word for it - hear from businesses who've
            transformed their online presence with Griffin's Web Services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} data={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
