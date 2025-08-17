// src/Sections/Testimonials.jsx
import React from "react";
import TestimonialCard from "../components/LoopComponents/TestimonialCard";
import BorderTitle from "../components/BorderTitle";
import Carousel from "../components/Carousel";
import Heading from "../components/Heading";

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
    {
      tag: "Non-Profit",
      quote:
        "Griffin's Web helped us create a stunning website that truly reflects our mission. The team was incredibly supportive and responsive throughout the process.",
      author: "Emily Johnson",
      role: "Director, Community Outreach",
      avatar: "E",
      rating: 5,
    },
    {
      tag: "Tech Startup",
      quote:
        "We needed a sleek, modern site to showcase our app. Griffin's Web delivered exactly what we envisioned. The user experience is top-notch and our users love it!",
      author: "Michael Lee",
      role: "CTO, InnovateX",
      avatar: "M",
      rating: 5,
    },
    {
      tag: "Consulting",
      quote:
        "The new site has significantly improved our client engagement. The design is professional and the content is well-organized. We've received many compliments!",
      author: "Laura Smith",
      role: "Senior Consultant, Stratagem",
      avatar: "L",
      rating: 5,
    },
  ];

  return (
    <section className="outer-section bg-bg relative">
      <div className="section-color-border" />
      <div className="inner-section">
        <div className="text-section">
          <BorderTitle>Testimonials</BorderTitle>
          <Heading
            tagName="h2"
            className="mb-6"
            before="What Our "
            text="Clients Say"
            textClass="emphasized-text"
          />
          <p className="large-text">
            Don't just take our word for it - hear from businesses who've
            transformed...
          </p>
        </div>

        <Carousel
          items={testimonials}
          renderItem={(t) => <TestimonialCard data={t} />}
          slidesPerView={{ base: 1, md: 2 }}
          gap={32}
          autoplay
          autoAdvanceDelay={4500}
          showArrows={false}
          showDots
          drag={false}
        />
      </div>
    </section>
  );
};

export default Testimonials;
