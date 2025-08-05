// src/components/LoopComponents/ContactItem.jsx
import UnderlineLink from "./UnderlineLink";

export default function ContactItem({ data }) {
  const { href, label, icon: Icon } = data;
  return (
    <UnderlineLink
      href={href}
      className="
       secondary-text text-xl lg:text-2xl
        hover:text-accent
        transition-colors duration-450 space-x-3
      "
    >
      <Icon />
      {label}
    </UnderlineLink>
  );
}
