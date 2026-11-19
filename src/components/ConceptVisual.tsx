import {
  Leaf,
  ArrowDown,
  GitBranch,
  FlaskConical,
  Activity,
} from "lucide-react";
import type { BookConcept } from "../data/curriculum";
export function ConceptVisual({
  concept,
  compact = false,
}: {
  concept: BookConcept;
  compact?: boolean;
}) {
  const Icon = concept.scenes.length
    ? FlaskConical
    : concept.id === "metabolism"
      ? Activity
      : GitBranch;
  return (
    <figure
      className={`concept-map ${`${compact ? "compact" : ""} ${concept.layout === "branches" ? "branch-map" : ""}`}`}
      aria-label={`خريطة مفهوم: ${concept.title}`}
    >
      <figcaption>
        <Icon size={20} />
        {concept.title}
      </figcaption>
      <ol>
        {concept.flow.map((text, i) => (
          <li key={text}>
            <span className="map-node">
              <Leaf size={17} aria-hidden="true" />
              {text}
            </span>
            {concept.layout !== "branches" && i < concept.flow.length - 1 && (
              <ArrowDown aria-label="يرتبط بـ" size={18} />
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
