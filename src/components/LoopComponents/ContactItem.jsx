// src/components/LoopComponents/ContactItem.jsx
import LogoLink from "./LogoLink";

export default function ContactItem({ data }) {
  const { href, label, icon: Icon } = data;
  return (
    <LogoLink
      href={href}
      className="
       text-text text-xl lg:text-2xl
        hover:text-accent
        transition-colors duration-450 space-x-3
      "
    >
      <Icon />
      {label}
    </LogoLink>
  );
}
