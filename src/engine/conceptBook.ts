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
export function conceptBookNumber(
  page: string,
  lesson: number,
  index: number,
  diagnostic: number,
) {
  if (page === "cover") return 0;
  const total = curriculum.reduce(
    (n, l) => n + lessonPages(l.id).length + 5,
    2,
  );
  if (page === "lesson")
    return (
      2 +
      curriculum
        .slice(0, lesson - 1)
        .reduce((n, l) => n + lessonPages(l.id).length + 5, 0) +
      index +
      (index === 1 ? diagnostic : index > 1 ? 5 : 0)
    );
  return (
    (
      {
        name: 1,
        map: 1,
        final: total,
        dashboard: total + 1,
        guide: total + 2,
        teacher: total + 3,
        certificate: total + 4,
      } as Record<string, number>
    )[page] ?? 1
  );
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
