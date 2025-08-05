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
    label: "hello@griffinsweb.com",
    href: "mailto:hello@griffinsweb.com",
    icon: Mail,
  },
  {
    type: "phone",
    label: "(123) 456-7890",
    href: "tel:+1234567890",
    icon: Phone,
  }
];

/**
 * Social media profile links.
 * Icons are component references for flexible rendering.
 */
export const socialMediaLinks = [
  {
    name: "LinkedIn",
    href: "#linkedin",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    href: "#twitter",
    icon: Twitter,
  },
  {
    name: "GitHub",
    href: "#github",
    icon: Github,
  },
  {
    name: "Instagram",
    href: "#instagram",
    icon: Instagram,
  },
];

export default siteData;
