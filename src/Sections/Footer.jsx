// src/components/Footer.jsx
import React from "react";
import IconListItem from "../components/LoopComponents/IconListItem";
import SocialLink from "../components/LoopComponents/SocialLink";
import UnderlineLink from "../components/LoopComponents/UnderlineLink";
import Heading from "../components/Heading";
import { siteData, contactItems, socialMediaLinks } from "../siteData";

const footerNav = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Cookie Policy", href: "#cookie-policy" },
  { label: "Contact Us", href: "#contact-us" },
];

export default function Footer() {
  return (
    <footer className="bg-bg2 relative">
      <div className="section-color-border"></div>
      <div className="inner-section py-16 text-center">
        
        {/* Company Heading */}
        {/* <Heading tagName="h3" className="h3 mb-8 text-accent">
          {siteData.title}
        </Heading> */}

        {/* Contact Information */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 lg:gap-12 mb-8">
          {contactItems.map((item) => (
            <a 
              key={item.href}
              href={item.href}
              className="group"
            >
              <IconListItem
                data={{
                  icon: <item.icon />,
                  title: item.label,
                  description: item.label,
                }}
                layout="horizontal"
                alignment="center"
                className="gap-3 group"
                iconClassName="w-10 h-10 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 transition-colors"
                titleClassName="text-text group-hover:text-accent transition-colors font-medium"
                titleTag="span"
                showDescription={false}
                containerClassName="flex items-center"
              />
            </a>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8">
          {socialMediaLinks.map((item) => (
            <SocialLink key={item.name} data={item} />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {footerNav.map((item) => (
            <UnderlineLink 
              key={item.label}
              href={item.href}
              className="text-text hover:text-accent transition-colors"
            >
              {item.label}
            </UnderlineLink>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-muted text-sm">
          © {new Date().getFullYear()} {siteData.legalName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}