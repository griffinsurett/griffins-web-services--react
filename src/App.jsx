import React, { useState, useEffect } from "react";
import "./App.css"; // Assuming you have a CSS file for styles
import FAQSection from "./components/FAQ"; // Importing the FAQ component
import Button from "./components/Button"; // Importing the Button component

const GriffinsLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
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

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Thank you! We'll get back to you within 24 hours.");
  };

  const navItems = [
    { label: "Home", href: "#home", className: "" },
    { label: "Services", href: "#services", className: "" },
    { label: "Portfolio", href: "#portfolio", className: "" },
    { label: "About", href: "#about", className: "" },
    { label: "Contact", href: "#contact", className: "" },
  ];

  const footerItems = [
    { label: "Privacy Policy", href: "#privacy-policy", className: "" },
    { label: "Terms of Service", href: "#terms-of-service", className: "" },
    { label: "Cookie Policy", href: "#cookie-policy", className: "" },
    { label: "Contact Us", href: "#contact-us", className: "" },
  ];

  // near the top, after your imports
  const contactItems = [
    { href: "mailto:hello@griffinsweb.com", label: "hello@griffinsweb.com" },
    { href: "tel:+1234567890", label: "(123) 456-7890" },
  ];

  const socialMedia = [
    {
      name: "LinkedIn",
      href: "#linkedin",
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "#twitter",
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "#github",
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "#instagram",
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
  ];

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
      tag: "Professional Services",
      quote:
        "Working with Griffin's Web was seamless from start to finish. They delivered a professional website that perfectly represents our law firm and has helped us attract higher-quality clients.",
      author: "Michael Rodriguez",
      role: "Partner, Rodriguez & Associates",
      avatar: "M",
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
      tag: "Healthcare",
      quote:
        "Griffin's Web created a website that builds trust with our patients from the moment they visit. The appointment booking system has streamlined our entire practice workflow.",
      author: "Dr. Lisa Thompson",
      role: "Family Medicine Practice",
      avatar: "D",
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
    <div className="bg-black text-white min-h-screen">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-450 py-5`}
      >
        <div className="w-full mx-auto flex justify-between items-center px-5">
          <a href="#" className="text-2xl font-bold">
            Griffin's <span className="text-teal-500">Web</span>
          </a>
          <div className="hidden md:flex gap-10">
            {navItems.map((item) => (
              <NavItem key={item.label} data={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-5 pt-32 pb-20 bg-black relative">
        {/* Dark gradient background */}
      <div className="absolute inset-0 hero-gradient-bg"></div>
        <div className="inner-section relative z-10">
          <h1 className="h1 mb-8">
            Build Your{" "}
            <span className="text-teal-500 relative">
              Digital Empire
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600"></span>
            </span>{" "}
            with Griffin's Web Services
          </h1>
          <p className="hero-text text-gray-300 mb-10 max-w-4xl mx-auto">
            Professional websites that convert visitors into customers. Fast,
            modern, and built to grow your business online.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button variant="primary">Get Started Today ✨</Button>

            <Button variant="secondary">View Our Work 👀</Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding bg-zinc-950 relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <h2 className="h2 mb-6">
              Who We <span className="text-teal-500">Are</span>
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
      <section className="section-padding bg-zinc-950 relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Website Types</div>
            <h2 className="h2 mb-6">
              Websites We <span className="text-teal-500">Build</span>
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
      <section className="section-padding bg-black relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Benefits</div>
            <h2 className="h2 mb-6">
              Why Choose <span className="text-teal-500">Griffin's Web?</span>
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
      <div className="py-20 px-5 relative">
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
      <section className="section-padding bg-zinc-950 relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Testimonials</div>
            <h2 className="h2 mb-6">
              What Our <span className="text-teal-500">Clients Say</span>
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

      {/* Footer CTA */}
      <section className="section-padding bg-black text-center relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="mb-12">
            <div className="border-title">Get Started</div>
            <h2 className="h2 mb-6">
              Ready to Transform Your Online Presence?
            </h2>
            <p className="large-text text-gray-300 ">
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
      <section className="section-padding bg-black relative">
        <div className="section-color-border"></div>
        <div className="inner-section">
          <div className="text-section">
            <div className="border-title">Get A Quote</div>
            <h2 className="h2 mb-6">
              Ready to Get <span className="text-teal-500">Started?</span>
            </h2>
            <p className="text-gray-300 large-text">
              Tell us about your project and we'll provide you with a detailed
              quote within 24 hours.
            </p>
          </div>

          <div className="bg-white/5 border border-teal-500/20 rounded-3xl p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent"></div>

            <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-white font-medium text-sm">
                  Type of Website *
                </label>
                <select
                  name="websiteType"
                  value={formData.websiteType}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                  required
                >
                  <option value="">Select a website type</option>
                  <option value="landing-page">Landing Page</option>
                  <option value="small-business">Small Business Website</option>
                  <option value="portfolio">Personal Portfolio Website</option>
                  <option value="blog">Blog</option>
                  <option value="ecommerce">E-Commerce Website</option>
                  <option value="nonprofit">Non-Profit Website</option>
                  <option value="corporate">Large Corporate Website</option>
                  <option value="custom-app">
                    Custom Full-Stack Application
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Project Budget
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                >
                  <option value="">Select your budget range</option>
                  <option value="under-5k">Under $5,000</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="10k-25k">$10,000 - $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="over-50k">$50,000+</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium text-sm">
                  Project Timeline
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450"
                >
                  <option value="">When do you need this completed?</option>
                  <option value="asap">ASAP</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="2-3-months">2-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="flexible">I'm flexible</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-white font-medium text-sm">
                  Project Details *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Tell us about your project, goals, and any specific requirements..."
                  className="w-full bg-white/10 border border-teal-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white/20 transition-all duration-450 resize-none"
                  required
                ></textarea>
              </div>
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
      <footer className="bg-black px-5 border-t border-teal-500/20">
        <div className="inner-section">
          <div className="text-center my-12">
            <h4 className="text-teal-500 text-lg font-semibold mb-6">
              Connect
            </h4>
            <div className="space-y-3 mb-8">
              {contactItems.map((item) => (
                <ContactItem key={item.href} data={item} />
              ))}
            </div>

            <div className="flex justify-center gap-5">
              {socialMedia.map((item) => (
                <SocialLink key={item.name} data={item} />
              ))}
            </div>
          </div>

          <div className="border-t border-teal-500/20 py-8 flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="text-gray-300 text-xl">
              © 2025 Griffin's Web Services. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {footerItems.map((item) => (
                <NavItem key={item.label} data={item} />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function StatisticListing({ data }) {
  const { number, label } = data;
  return (
    <div>
      <h3 className="h2 text-teal-500 mb-3">{number}</h3>
      <p className="text-gray-300 text-lg">{label}</p>
    </div>
  );
}
/**
 * Generic feature card for Services/Benefits (large) and Website Types (small).
 */
function FeatureCard({ data }) {
  const { icon, title, description } = data;

  return (
    <div
      className={`group text-center outer-card-color outer-card-style outer-card-transition`}
    >
      <div className="inner-card-style inner-card-color inner-card-transition" />
      <div className={`icon-large z-10 mb-5 card-icon-color`}>{icon}</div>
      <h3 className={`h3 mb-3 relative z-10`}>{title}</h3>
      <p className="text-gray-300 leading-relaxed relative z-10">
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({ data }) {
  const { tag, quote, author, role, avatar, rating } = data;
  return (
    <div className="group text-left outer-card-color outer-card-style outer-card-transition">
      <div className="inner-card-color absolute inner-card-transition"></div>
      {/* <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="tag-title">{tag}</div>
      </div> */}
      <div className="card-icon-color icon-medium mb-5 z-10">❝</div>
      <p className="text-gray-300 text-lg leading-relaxed mb-8 italic relative z-10">
        "{quote}"
      </p>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="icon-small card-icon-color ">{avatar}</div>
          <div>
            <h4 className="h4">{author}</h4>
            <p className="text-gray-300 text-sm">{role}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(rating)].map((_, i) => (
            <ratingStar i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Navigation link */
function NavItem({ data }) {
  const { label, href, className } = data;
  return (
    <a
      href={href}
      className={`
        font-medium hover:text-teal-500
        transition-colors duration-450
        relative group
        ${className}
      `}
    >
      {label}
      <span
        className="
        absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500
        transition-all duration-450 group-hover:w-full
      "
      />
    </a>
  );
}

/** Email / phone link */
function ContactItem({ data }) {
  const { href, label } = data;
  return (
    <a
      href={href}
      className="
        block text-gray-300
        hover:text-teal-500
        transition-colors duration-450
      "
    >
      {label}
    </a>
  );
}

/** Social icon link */
function SocialLink({ data }) {
  const { href, label, icon } = data;
  return (
    <a
      href={href}
      aria-label={label}
      className="
        w-12 h-12 bg-teal-500/20 border border-teal-500/30
        rounded-full flex items-center justify-center
        text-teal-500
        hover:bg-teal-500/30 hover:border-teal-500
        transition-all duration-450 hover:-translate-y-1
      "
    >
      {icon}
    </a>
  );
}

export default GriffinsLanding;
