// src/components/ContactSection.jsx
import React from "react";
import { Mail, Phone } from "lucide-react";
import ContactItem from "./LoopComponents/ContactItem";

const ContactSection = () => {
  const contactItems = [
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

  return (
    <div className="mb-6 flex justify-center items-center gap-2 md:gap-3 lg:gap-9 xl:gap-15 flex-wrap">
      {contactItems.map((item) => (
        <ContactItem key={item.href} data={item} />
      ))}
    </div>
  );
};

export default ContactSection;