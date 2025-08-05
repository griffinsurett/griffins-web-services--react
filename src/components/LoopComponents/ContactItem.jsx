// src/components/LoopComponents/ContactItem.jsx
export default function ContactItem({ data }) {
  const { href, label } = data;
  return (
    <a
      href={href}
      className="
        block text-secondary
        hover:text-accent
        transition-colors duration-450
      "
    >
      {label}
    </a>
  );
}