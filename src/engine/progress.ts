export type LessonProgress = {
  pre?: number;
  post?: number;
  activities: string[];
  watched: string[];
  experimented: string[];
  formative: boolean;
  conceptChecks?: string[];
  attempts: number;
  goalResults?: Record<number, boolean>;
  completedAt?: string;
};
export type Progress = {
  version: 1;
  name: string;
  lessons: Record<number, LessonProgress>;
  final?: number;
  finalGoals?: Record<number, boolean>;
  project?: number;
  projectCriteria?: number[];
  date?: string;
};
export const emptyLesson = (): LessonProgress => ({
  activities: [],
  watched: [],
  experimented: [],
  formative: false,
  attempts: 0,
});
export const initialProgress = (): Progress => ({
  version: 1,
  name: "",
  lessons: {},
});
export function support(score: number) {
  return score < 40 ? "دعم" : score < 80 ? "أساسي" : "تحدٍّ";
}
export function score(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) : 0;
}
export function isMastered(
  p: LessonProgress | undefined,
  threshold: number,
  sceneIds: string[],
  conceptIds?: string[],
) {
  if (
    conceptIds?.length &&
    p?.pre !== undefined &&
    (p?.post ?? 0) >= threshold &&
    conceptIds.every((id) => p?.conceptChecks?.includes(id)) &&
    sceneIds.every(
      (id) => p?.watched.includes(id) && p?.experimented.includes(id),
    )
  )
    return true;
  return (
    !!p &&
    p.pre !== undefined &&
    (p.post ?? 0) >= threshold &&
    p.formative &&
    [
      ...["match", "order"],
      ...(sceneIds.includes("urine") ? ["assemble"] : []),
    ].every((a) => p.activities.includes(a)) &&
    sceneIds.every(
      (id) => p.watched.includes(id) && p.experimented.includes(id),
    )
  );
}
export function parseProgress(input: unknown): Progress {
  if (!input || typeof input !== "object") throw Error("ملف غير صالح");
  const p = input as Progress;
  if (
    p.version !== 1 ||
    typeof p.name !== "string" ||
    p.name.length > 80 ||
    !p.lessons ||
    typeof p.lessons !== "object"
  )
    throw Error("صيغة غير صالحة");
  const bounded = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;
  for (const [id, l] of Object.entries(p.lessons)) {
    if (
      !/^[1-7]$/.test(id) ||
      !l ||
      !Array.isArray(l.activities) ||
      !Array.isArray(l.watched) ||
      !Array.isArray(l.experimented) ||
      [...l.activities, ...l.watched, ...l.experimented].some(
        (s) => typeof s !== "string",
      ) ||
      typeof l.formative !== "boolean" ||
      (l.conceptChecks !== undefined &&
        (!Array.isArray(l.conceptChecks) ||
          l.conceptChecks.some(
            (id) =>
              typeof id !== "string" || !/^concept-[1-7]-[a-z-]+$/.test(id),
          ))) ||
      !Number.isInteger(l.attempts) ||
      l.attempts < 0 ||
      (l.pre !== undefined && !bounded(l.pre)) ||
      (l.post !== undefined && !bounded(l.post))
    )
      throw Error("بيانات تقدم غير صالحة");
  }
  if (
    (p.final !== undefined && !bounded(p.final)) ||
    (p.project !== undefined && !bounded(p.project))
  )
    throw Error("درجة غير صالحة");
  return p;
}

export function lessonCompletion(
  p: LessonProgress | undefined,
  scenes: string[],
  threshold: number,
  conceptIds?: string[],
) {
  if (!p) return 0;
  if (conceptIds?.length) {
    if (isMastered(p, threshold, scenes, conceptIds)) return 100;
    const done = (list: string[]) =>
      scenes.filter((id) => list.includes(id)).length /
      Math.max(1, scenes.length);
    return Math.round(
      (p.pre !== undefined ? 10 : 0) +
        done(p.watched) * 20 +
        done(p.experimented) * 20 +
        (conceptIds.filter((id) => p.conceptChecks?.includes(id)).length /
          conceptIds.length) *
          30 +
        ((p.post ?? 0) >= threshold ? 20 : 0),
    );
  }
  const count = (list: string[]) =>
    scenes.filter((id) => list.includes(id)).length /
    Math.max(1, scenes.length);
  return Math.round(
    (p.pre !== undefined ? 10 : 0) +
      count(p.watched) * 20 +
      count(p.experimented) * 20 +
      ([
        "match",
        "order",
        ...(scenes.includes("urine") ? ["assemble"] : []),
      ].filter((a) => p.activities.includes(a)).length /
        (scenes.includes("urine") ? 3 : 2)) *
        20 +
      (p.formative ? 10 : 0) +
      ((p.post ?? 0) >= threshold ? 20 : 0),
  );
}
