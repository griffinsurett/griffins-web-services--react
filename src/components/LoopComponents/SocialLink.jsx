export default function SocialLink({ data }) {
  const { href, label, icon } = data;
  return (
    <a
      href={href}
      aria-label={label}
      className="
        w-12 h-12 bg-accent/20 border border-accent/30
        rounded-full flex items-center justify-center
        text-accent
        hover:bg-accent/30 hover:border-accent
        transition-all duration-450
        hover:-translate-y-1
      "
    >
      {icon}
    </a>
  );
}
