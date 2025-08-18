// src/siteData.js
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Instagram } from 'lucide-react';

/**
 * Centralized site data for titles and branding.
 */
export const siteData = {
  title: "Griffin's Web Services",
  tagline: "Build Your Digital Empire",
  description:
    "Fast, modern, and conversion-focused web experiences that drive real results for your business.",
  legalName: "Griffin's Web Services LLC",
};

/**
 * Primary contact methods (email, phone, address).
 * Each entry includes an icon component for rendering.
 */
export const contactItems = [
  {
    type: "email",
    label: "griffin@griffinswebservices.com",
    href: "mailto:griffin@griffinswebservices.com",
    icon: Mail,
  },
  {
    type: "phone",
    label: "(732) 939-1309",
    href: "tel:+17329391309",
    icon: Phone,
  },
];

/**
 * Social media profile links.
 * Icons are component references for flexible rendering.
 */
export const socialMediaLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/griffin-surett/",
    icon: Linkedin,
  },
  {
    name: "GitHub",
    href: "https://github.com/griffinsurett",
    icon: Github,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/griffinswebservices/",
    icon: Instagram,
  },
];

export default siteData;
