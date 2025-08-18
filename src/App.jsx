import React, { useEffect } from "react";
import "./App.css";
import FAQSection from "./Sections/FAQ";
import Header from "./Sections/Header";
import Footer from "./Sections/Footer";
import Hero from "./Sections/Hero";
import About from "./Sections/About";
import WebsiteTypes from "./Sections/WebsiteTypes";
import Benefits from "./Sections/Benefits";
import Stats from "./Sections/Stats";
import Testimonials from "./Sections/Testimonials";
import CTASection from "./Sections/CTASection";
import QuoteForm from "./Sections/QuoteForm";
import PortfolioSection from "./Sections/PortfolioSection";
import HostingMaintenance from "./Sections/HostingMaintenance";
import AddOnServices from "./Sections/AddOnServices";

const GriffinsLanding = () => {
  useEffect(() => {
    const handleScroll = () => {
      // Any global scroll handling logic can go here
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-bg text-headingmin-h-screen transition-all scroll-smooth">
      {/* Navigation */}
      <Header />
      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />

      {/* Website Types Section */}
      <WebsiteTypes />

      {/* CTA Section */}
      <CTASection />

      {/* Portfolio Section */}
      <PortfolioSection />

      {/* Add-On Services Section */}
      <AddOnServices />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQSection />

      {/* Benefits Section */}
      <Benefits />

      {/* Stats Section */}
      <Stats />

      {/* Hosting Maintenance Section */}
      <HostingMaintenance />

      {/* Quote Form Section */}
      <QuoteForm />

      {/* Footer */}
      <div className="footer-container">
        <Footer />
      </div>
    </div>
  );
};

export default GriffinsLanding;
