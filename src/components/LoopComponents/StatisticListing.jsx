export default function StatisticListing({ data }) {
  const { number, label } = data;
  return (
    <div>
      <h3 className="h2 text-accent mb-3">{number}</h3>
      <p className="text-gray-300 text-lg">{label}</p>
    </div>
  );
}