// src/components/LoopComponents/FeatureCard.jsx
export default function FeatureCard({ data }) {
  const { icon, title, description } = data;

  return (
    <div className="group text-center outer-card-color outer-card-style outer-card-transition">
      <div className="inner-card-style inner-card-color inner-card-transition" />
      <div className="icon-large z-10 mb-5 card-icon-color">{icon}</div>
      <h3 className="h3 mb-3 relative z-10">{title}</h3>
      <p className="text-secondary leading-relaxed relative z-10">
        {description}
      </p>
    </div>
  );
}