// Footer.jsx
import React from "react";
import IconListItem from "../components/LoopComponents/IconListItem";
import SocialLink from "../components/LoopComponents/SocialLink";
import UnderlineLink from "../components/LoopComponents/Link";
import { siteData, contactItems, socialMediaLinks } from "../siteData";
import Logo from "../components/Logo/Logo";
import Heading from "../components/Heading";

// Enhanced Tailwind patterns for better design
const footerContainer = "max-w-7xl mx-auto px-6 lg:px-8";
const containerJustify = "lg:justify-between";
const flexRowToCol = "flex flex-col lg:flex-row";
const mainTopFootContainer = "flex flex-col items-start";
const menuLabel = "text-text font-semibold text-xl mb-2";

const footerNav = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Cookie Policy", href: "#cookie-policy" },
  { label: "Contact Us", href: "#contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-bg2 border-t border-accent/10">
      {/* Decorative top border */}
      <div className="section-color-border"></div>

      {/* Main Footer Content */}
      <div className={footerContainer}>
        {/* Top Section - Logo, Description, Contact */}
        <div
          className={`flex flex-wrap lg:justify-between sm:justify-center justify-start w-full gap-12 lg:gap-6 py-16 lg:py-20`}
        >
          {/* Logo & Description */}
          <div className={`${mainTopFootContainer} space-y-3 max-w-md`}>
            <Logo loading="lazy" trigger="visible" animateOutText={false} />
            <p className="leading-relaxed text-base pr-8">
              {siteData.description}
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col justify-left items-start gap-3 lg:order-2 order-last">
            <Heading tagName="h4" className={menuLabel}>
              Legal
            </Heading>
            <nav className="gap-4 flex flex-col">
              {footerNav.map((item) => (
                <UnderlineLink
                  key={item.label}
                  href={item.href}
                  className="text-text/80 hover:text-accent transition-all duration-300 font-medium"
                >
                  {item.label}
                </UnderlineLink>
              ))}
            </nav>
          </div>

          {/* Contact Information */}
          <div
            className={`${mainTopFootContainer} lg:items-end order-2 lg:order-last space-y-5`}
          >
            <Heading tagName="h4" className={menuLabel}>
              Get in Touch
            </Heading>
            <nav className="flex flex-col gap-2">
              {contactItems.map((item, index) => (
                <UnderlineLink
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-start lg:justify-end"
                >
                  <IconListItem
                    data={{
                      showIcon: false,
                      title: item.label,
                      description: item.label,
                    }}
                    layout="horizontal"
                    alignment="center"
                    className="gap-3 group"
                    iconClassName="hidden"
                    titleClassName="text-text/90 group-hover:text-accent transition-all duration-300 font-medium text-lg"
                    titleTag="span"
                    showDescription={false}
                    containerClassName="flex items-center"
                  />
                </UnderlineLink>
              ))}
            </nav>
                {/* Social Links */}
            <div className="flex items-center gap-4">
              {/* <span className="text-text/60 text-sm font-medium mr-2 hidden sm:block">
                Follow Us:
              </span> */}
              {socialMediaLinks.map((item) => (
                <div 
                  key={item.name}
                  className="transform hover:scale-110 transition-transform duration-200"
                >
                  <SocialLink data={item} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>

        {/* Bottom Section - Navigation, Copyright, Social */}
        <div className="py-5">
          <div
            className={`flex justify-center items-center text-center space-y-8 lg:space-y-0`}
          >
            {/* Copyright */}
            <div className="text-text/60 text-sm lg:text-base">
              © {year} {siteData.legalName}. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Subtle bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
    </footer>
  );
}
