import React, { useState, useEffect } from "react";
import "./App.css"; // Assuming you have a CSS file for styles
import FAQSection from "./components/FAQ"; // Importing the FAQ component
import Button from "./components/Button"; // Importing the Button component
import Header from "./components/Header";
import Footer from "./components/Footer";
import StatisticListing from "./components/LoopComponents/StatisticListing";
import FeatureCard from "./components/LoopComponents/FeatureCard";
import TestimonialCard from "./components/LoopComponents/TestimonialCard";
import Input from "./components/Form/Input"; // Importing Input component
import Textarea from "./components/Form/Textarea"; // Importing Textarea component
import Select from "./components/Form/Select"; // Importing Select component

const GriffinsLanding = () => {
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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

  const websiteTypes = [
    {
      icon: "🚀",
      title: "Landing Pages",
      description:
        "High-converting single-page websites designed to capture leads and drive specific actions for your marketing campaigns.",
    },
    {
      icon: "🏢",
      title: "Small Business Websites",
      description:
        "Professional websites that establish credibility and help local businesses attract and retain customers online.",
    },
    {
      icon: "💼",
      title: "Personal Portfolio Websites",
      description:
        "Showcase your work, skills, and achievements with a stunning portfolio that makes you stand out from the competition.",
    },
    {
      icon: "✍️",
      title: "Blogs",
      description:
        "Content-focused websites with easy-to-use publishing tools to share your expertise and build your audience.",
    },
    {
      icon: "🛒",
      title: "E-Commerce Websites",
      description:
        "Complete online stores with shopping carts, secure payments, inventory management, and everything you need to sell online.",
    },
    {
      icon: "❤️",
      title: "Non-Profit Websites",
      description:
        "Mission-driven websites that inspire action, facilitate donations, and help you make a greater impact in your community.",
    },
    {
      icon: "🏛️",
      title: "Large Corporate Websites",
      description:
        "Enterprise-level websites with advanced functionality, multi-user management, and scalable architecture for growing companies.",
    },
    {
      icon: "⚙️",
      title: "Custom Full-Stack Applications",
      description:
        "Bespoke web applications tailored to your unique business processes, with custom databases and advanced functionality.",
    },
  ];

  const benefits = [
    {
      icon: "📱",
      title: "Mobile First",
      description:
        "Responsive design that looks perfect on every device. Over 60% of traffic is mobile - we make sure you're ready.",
    },
    {
      icon: "🎯",
      title: "Conversion Focused",
      description:
        "Strategic design that turns visitors into customers. Every element is crafted to guide users toward your business goals.",
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description:
        "Enterprise-grade security and 99.9% uptime. Your website stays safe and accessible around the clock.",
    },
    {
      icon: "🚀",
      title: "SEO Optimized",
      description:
        "Built-in SEO best practices help you rank higher on Google and attract more organic traffic to grow your business.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Optimized for speed and performance. Your site loads in under 2 seconds, keeping visitors engaged and improving SEO rankings.",
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description:
        "Round-the-clock support and maintenance included. We're here to help your website evolve as your business grows.",
    },
  ];

  const Services = [
    {
      icon: "🎨",
      title: "Design",
      description:
        "Custom web design that reflects your brand and converts visitors into customers. We create beautiful, user-friendly interfaces that make lasting impressions.",
    },
    {
      icon: "⚡",
      title: "Develop",
      description:
        "Fast, secure, and scalable websites built with modern technology. From simple landing pages to complex e-commerce platforms, we bring your vision to life.",
    },
    {
      icon: "🛠️",
      title: "Ongoing Support",
      description:
        "24/7 maintenance, updates, and support to keep your website running smoothly. We're your long-term partner in digital growth and success.",
    },
  ];

  // Moved stats array here
  const Stats = [
    { number: "500+", label: "Websites Launched" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Support Available" },
    { number: "7 Day", label: "Average Delivery" },
  ];

  return (
    <div className="primary-bg primary-text min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-5 pt-32 pb-20 primary-bg relative">
        {/* Dark gradient background */}
        <div className="absolute inset-0 hero-gradient-bg"></div>
        <div className="inner-section relative z-10">
          <h1 className="h1 mb-2">
            Build Your{" "}
            <span className="heading-accent-text">Digital Empire</span> with
            Griffin's Web Services
          </h1>
          <p className="hero-text secondary-text mb-10 max-w-4xl mx-auto">
            Fast Professional websites that convert visitors into customers.
            Fast, modern, and built to grow your business online.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button variant="primary">Get Started Today ✨</Button>
            <Button variant="secondary">View Our Work 👀</Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="outer-section secondary-bg relative">
        <div className="section-dim-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <h2 className="h2 mb-6">
              Who We <span className="heading-accent-text">Are</span>
            </h2>
            <p className="large-text">
              Griffin's Web Services is your trusted partner in digital
              transformation. We combine creative design, cutting-edge
              development, and ongoing support to help businesses thrive online.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {Services.map((item, idx) => (
              <FeatureCard key={idx} data={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Website Types Section */}
      <section className="outer-section secondary-bg relative">
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Website Types</div>
            <h2 className="h2 mb-6">
              Websites We <span className="heading-accent-text">Build</span>
            </h2>
            <p className="large-text">
              From simple landing pages to complex web applications - we create
              websites tailored to your specific needs and industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {websiteTypes.map((item, idx) => (
              <FeatureCard key={idx} data={item} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Benefits Section */}
      <section className="outer-section primary-bg">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Benefits</div>
            <h2 className="h2 mb-6">
              Why Choose{" "}
              <span className="heading-accent-text">Griffin's Web?</span>
            </h2>
            <p className="large-text">
              We don't just build websites - we craft digital experiences that
              drive real results for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {benefits.map((item, idx) => (
              <FeatureCard key={idx} data={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="py-20 px-5 relative primary-bg">
        <div className="absolute top-0 left-0 right-0 h-px"></div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="border-title">Our Results</div>
          </div>
          <div className="grid md:grid-cols-4 gap-10 text-center">
            {Stats.map((stat, index) => (
              <StatisticListing key={index} data={stat} />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="outer-section secondary-bg relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Testimonials</div>
            <h2 className="h2 mb-6">
              What Our <span className="heading-accent-text">Clients Say</span>
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

      {/* CTA */}
      <section className="outer-section primary-bg text-center relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="mb-12">
            <div className="border-title">Get Started</div>
            <h2 className="h2 mb-6">
              Ready to Transform Your Online Presence?
            </h2>
            <p className="large-text secondary-text">
              Join hundreds of successful businesses who trust Griffin's Web
              Services for their digital growth.
            </p>
          </div>
          <Button variant="primary" className="text-center">
            Start Your Project - 50% Off! 🎉
          </Button>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="outer-section secondary-bg relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Get A Quote</div>
            <h2 className="h2 mb-6">
              Ready to Get <span className="heading-accent-text">Started?</span>
            </h2>
            <p className="large-text secondary-text">
              Tell us about your project and we'll provide you with a detailed
              quote within 24 hours.
            </p>
          </div>

          <div className="group inner-card-bg outer-card-style">
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
                options={[
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
                ]}
              />

              <Select
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="Project Budget"
                options={[
                  { value: "under-5k", label: "Under $5,000" },
                  { value: "5k-10k", label: "$5,000 - $10,000" },
                  { value: "10k-25k", label: "$10,000 - $25,000" },
                  { value: "25k-50k", label: "$25,000 - $50,000" },
                  { value: "over-50k", label: "$50,000+" },
                ]}
              />

              <Select
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                placeholder="Project Timeline"
                options={[
                  { value: "asap", label: "ASAP" },
                  { value: "1-month", label: "Within 1 month" },
                  { value: "2-3-months", label: "2-3 months" },
                  { value: "3-6-months", label: "3-6 months" },
                  { value: "flexible", label: "I'm flexible" },
                ]}
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="footer-container">
        <Footer />
        
      </div>
    </div>
  );
};

export default GriffinsLanding;
