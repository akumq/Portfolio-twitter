interface ExperienceProps {
  poste: string;
  ecole: string;
  periode: string;
  descriptions: string[];
}

export default function ExperienceItem({ poste, ecole, periode, descriptions }: ExperienceProps) {
  return (
    <div className="bg-background border border-border_color rounded-xl p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{poste}</h2>
          <p className="text-text_secondary">{ecole}</p>
        </div>
        <span className="text-sm text-text_secondary">{periode}</span>
      </div>
      <ul className="list-disc list-inside text-text_secondary space-y-2">
        {descriptions.map((desc, index) => (
          <li key={index}>{desc}</li>
        ))}
      </ul>
    </div>
  );
} 