import { curriculum } from "../data/curriculum";
export type LessonPage = {
  id: string;
  kind:
    | "intro"
    | "pre"
    | "goals"
    | "explain"
    | "experiment"
    | "check"
    | "summary"
    | "infographic"
    | "post"
    | "certificate";
  title: string;
  concept?: number;
  scene?: string;
};
export function lessonPages(lessonId: number): LessonPage[] {
  const lesson = curriculum[lessonId - 1];
  return [
    { id: "intro", kind: "intro", title: "التهيئة" },
    { id: "pre", kind: "pre", title: "الاختبار القبلي" },
    { id: "goals", kind: "goals", title: "أهداف الدرس" },
    ...lesson.topics.flatMap((c, i): LessonPage[] => [
      { id: `${c.id}-explain`, kind: "explain", title: c.title, concept: i },
      ...c.scenes.map(
        (scene): LessonPage => ({
          id: `${c.id}-${scene}`,
          kind: "experiment",
          title: c.title,
          concept: i,
          scene,
        }),
      ),
      { id: `${c.id}-check`, kind: "check", title: c.title, concept: i },
    ]),
    { id: "summary", kind: "summary", title: "خلاصة الدرس" },
    { id: "infographic", kind: "infographic", title: "إنفوجرافيك الدرس" },
    { id: "post", kind: "post", title: "الاختبار البعدي" },
    { id: "certificate", kind: "certificate", title: "شهادة الإنجاز" },
  ];
}
export function lessonIndex(lessonId: number) {
  return lessonPages(lessonId)
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => !["experiment", "check"].includes(page.kind));
}
export function conceptCheckIds(lessonId: number) {
  return curriculum[lessonId - 1].topics.map((c) => c.check.id);
}
export function validReadingLocation(
  value: unknown,
): value is { lesson: number; index: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as { lesson: number; index: number };
  return (
    Number.isInteger(v.lesson) &&
    v.lesson >= 1 &&
    v.lesson <= 7 &&
    Number.isInteger(v.index) &&
    v.index >= 0 &&
    v.index < lessonPages(v.lesson).length
  );
}
