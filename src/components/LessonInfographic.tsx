import type { BookLesson } from "../data/curriculum";
import { ConceptVisual } from "./ConceptVisual";
export function LessonInfographic({ lesson }: { lesson: BookLesson }) {
  return (
    <section
      className="lesson-infographic"
      data-sound-scope="custom"
      aria-label={`إنفوجرافيك ${lesson.title}`}
    >
      <header>
        <span className="eyebrow">خريطة مراجعتك البصرية</span>
        <h2>{lesson.title}</h2>
      </header>
      <div className="infographic-grid">
        {lesson.topics.map((c) => (
          <article key={c.id}>
            <ConceptVisual concept={c} compact />
            <p>{c.definition}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
