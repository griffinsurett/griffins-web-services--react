import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

export default function SocialLink({ data }) {
  const { href, label, icon: Icon } = data;
  return (
    <AnimatedBorder
      variant="progress-b-f"
      triggers="hover"
      duration={800}
      borderRadius="rounded-full"
      borderWidth={2}
      color="var(--color-accent)"
      className="transition-all duration-450 hover:-translate-y-1"
      innerClassName="w-12 h-12 flex items-center justify-center"
    >
      <a
        href={href}
        aria-label={label}
        className="
          w-full h-full
          bg-accent/20 border border-accent/30
          rounded-full flex items-center justify-center
          text-accent
          transition-all duration-450
        "
      >
        <Icon />
      </a>
    </AnimatedBorder>
  );
}
