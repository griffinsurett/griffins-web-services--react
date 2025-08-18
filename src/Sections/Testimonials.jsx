// src/Sections/Testimonials.jsx
import React from "react";
import TestimonialCard from "../components/LoopComponents/TestimonialCard";
import BorderTitle from "../components/BorderTitle";
import Carousel from "../components/Carousel";
import Heading from "../components/Heading";
import { testimonials } from "../testimonials";

const Testimonials = () => {

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
