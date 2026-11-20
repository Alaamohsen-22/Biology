import type { BookConcept } from "../data/curriculum";
// Keep the approved source intact; avoid reading its identical definition twice.
export function teacherExplanation(concept: BookConcept) {
  return concept.teacher.startsWith(concept.definition)
    ? concept.teacher.slice(concept.definition.length).trim()
    : concept.teacher;
}
