// src/components/StaticSections/TestimonialsCirclesSection.jsx
import React, { useEffect, useRef } from "react";
import { testimonials } from "../testimonials";
import CircleImageItem from "../components/LoopComponents/CircleImageItem/CircleImageItem.jsx";
import Heading from "../components/Heading.jsx";
import Counter from "../components/Counter.jsx";

function TestimonialsCirclesSection({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const circles = container.querySelectorAll(".circle");
    if (!circles.length) return;

    let idx = 0;
    const pulse = () => {
      const prev = (idx - 1 + circles.length) % circles.length;
      circles[prev]?.classList.remove("heartbeat");
      circles[idx]?.classList.add("heartbeat");
      idx = (idx + 1) % circles.length;
    };

    pulse();
    const id = setInterval(pulse, 1600);
    return () => {
      clearInterval(id);
      circles.forEach((c) => c.classList.remove("heartbeat"));
    };
  }, []);

  const featured = testimonials.filter((t) => t.featured);

  return (
    <div
      ref={containerRef}
      className={[
        "testimonials flex items-center",
        "gap-1 lg:gap-2",
        "px-[var(--spacing-md)] md:px-0",
        className,
      ].join(" ")}
    >
      {/* Circle stack */}
      <div className="flex justify-center items-center">
        {featured.map((t, i) => (
          <CircleImageItem
            key={`${t.author}-${i}`}
            src={t.image}
            letter={t.avatar}
            alt={`${t.author} — ${t.tag}`}
            size="lg"
            className="circle -ml-2 lg:-ml-4 first:ml-0" // ⬅️ was -mr-2 lg:-mr-4
          />
        ))}
      </div>

      {/* Counter */}
      <div className="flex flex-col items-start">
        <Heading tagName="h3" className="text-heading m-0 p-0 text-3xl">
          <Counter
            start={1}
            end={100}
            duration={200}
            className="inline-block"
          />
          +
        </Heading>
        <Heading
          tagName="p"
          className="small-text ml-1 md:px-[var(--spacing-xs)]"
        >
          Happy Clients
        </Heading>
      </div>
    </div>
  );
}

export default TestimonialsCirclesSection;
