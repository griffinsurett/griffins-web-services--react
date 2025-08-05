// src/Sections/Footer.jsx
import React from "react";
import Contacts from "../components/Contacts";
import Socials from "../components/Socials";
import UnderlineLink from "../components/LoopComponents/UnderlineLink";
import { siteData } from "../siteData";

const footerNav = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Cookie Policy", href: "#cookie-policy" },
  { label: "Contact Us", href: "#contact-us" },
];

export default function Footer() {
  return (
    <footer className="bg-bg primary-text py-4 w-9/10 mx-auto lg:w-auto">
      <div className="inner-section text-center">
        <h4 className="text-primary text-xl lg:text-2xl xl:text-3xl font-semibold mb-4">
          Connect:
        </h4>

        <div className="space-y-3">
          <Contacts />
          <Socials />
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-6">
            {footerNav.map((item) => (
              <UnderlineLink key={item.label} href={item.href}>
                {item.label}
              </UnderlineLink>
            ))}
          </div>
          <div className="muted-text text-lg">
            © {new Date().getFullYear()} {siteData.legalName}. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}