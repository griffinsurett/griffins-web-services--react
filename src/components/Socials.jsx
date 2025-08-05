// src/components/Socials.jsx
import React from "react";
import { Linkedin, Twitter, Github, Instagram } from "lucide-react";
import SocialLink from "./LoopComponents/SocialLink";

const Socials = () => {
  const socialMediaLinks = [
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

  return (
    <div className="flex justify-center gap-5">
      {socialMediaLinks.map((item) => (
        <SocialLink key={item.name} data={item} />
      ))}
    </div>
  );
};

export default Socials;