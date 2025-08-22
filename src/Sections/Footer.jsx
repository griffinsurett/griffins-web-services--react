import React from "react";
import IconListItem from "../components/LoopComponents/IconListItem";
import SocialLink from "../components/LoopComponents/SocialLink";
import UnderlineLink from "../components/LoopComponents/UnderlineLink";
import { siteData, contactItems, socialMediaLinks } from "../siteData";
import Logo from "../components/Logo/Logo";

// Reusable Tailwind patterns (keep these DRY + portable)
const TW = {
  row: "flex flex-wrap items-center",
  betweenResp: "justify-center lg:justify-between",
  yStackResp: "space-y-5 lg:space-y-0",
  gap3_6: "gap-3 lg:gap-6",
  gap2_6: "gap-2 lg:gap-6",
  gap1_12: "gap-1 lg:gap-12",
};

const footerNav = [
  { label: "Privacy Policy", href: "#privacy-policy" },
  { label: "Terms of Service", href: "#terms-of-service" },
  { label: "Cookie Policy", href: "#cookie-policy" },
  { label: "Contact Us", href: "#contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-19/20 lg:9/10 gap-6 lg:gap-0 mx-auto flex-col">
      {/* Contact Information */}
      <div className={`footer-top ${TW.row} ${TW.betweenResp} ${TW.yStackResp} ${TW.gap3_6} text-center`}>
        <Logo loading="lazy" trigger="visible" />

        <div className={`flex flex-col sm:flex-row justify-center items-center ${TW.gap1_12}`}>
          {contactItems.map((item) => (
            <a key={item.href} href={item.href} className="group">
              <IconListItem
                data={{ icon: <item.icon />, title: item.label, description: item.label }}
                layout="horizontal"
                alignment="center"
                className="gap-3 group"
                iconClassName="w-10 h-7 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 transition-colors"
                titleClassName="text-text group-hover:text-accent transition-colors font-medium"
                titleTag="span"
                showDescription={false}
                containerClassName="flex items-center"
              />
            </a>
          ))}
        </div>
      </div>

      <div className={`footer-bottom flex flex-col lg:flex-row items-center ${TW.betweenResp} space-y-6 gap-6 text-center py-3 w-full`}>
        {/* Footer Navigation */}
        <div className={`flex flex-col lg:flex-row justify-center gap-4 m-0`}>
          {footerNav.map((item) => (
            <UnderlineLink key={item.label} href={item.href} className="text-text hover:text-accent transition-colors">
              {item.label}
            </UnderlineLink>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-muted order-last md:order-2 m-0">
          © {year} {siteData.legalName}. All rights reserved.
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 order-2 md:order-last">
          {socialMediaLinks.map((item) => (
            <SocialLink key={item.name} data={item} />
          ))}
        </div>
      </div>
    </footer>
  );
}
