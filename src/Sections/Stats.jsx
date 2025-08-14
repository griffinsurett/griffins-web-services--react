// src/components/Stats.jsx
import React from "react";
import StatisticListing from "../components/LoopComponents/StatisticListing";
import BorderTitle from "../components/BorderTitle";

const Stats = () => {
  const Stats = [
    { number: "500+", label: "Websites Launched" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Support Available" },
    { number: "7 Day", label: "Average Delivery" },
  ];

  return (
    <div className="py-20 px-5 relative primary-bg">
      <div className="absolute top-0 left-0 right-0 h-px"></div>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <BorderTitle>Stats</BorderTitle>
        </div>
        <div className="grid md:grid-cols-4 gap-10 text-center">
          {Stats.map((stat, index) => (
            <StatisticListing key={index} data={stat} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
