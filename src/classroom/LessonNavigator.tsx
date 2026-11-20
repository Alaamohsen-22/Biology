import { Check, ArrowLeft } from "lucide-react";
import { curriculum } from "../data/curriculum";
import type { LessonProgress } from "../engine/progress";
import type { Destination } from "./storage";
export function lessonSections(id: number) {
  return [
    { key: "intro", title: "بداية الدرس" },
    { key: "pre", title: "معرفتي السابقة" },
    ...curriculum[id - 1].topics.map((c, i) => ({
      key: `concept:${i}`,
      title: c.title,
    })),
    { key: "review", title: "ملخص بصري" },
    { key: "post", title: "اختبر فهمك" },
    { key: "award", title: "إنجازي" },
  ];
}
export function LessonNavigator({
  route,
  progress,
  onSelect,
}: {
  route: Destination;
  progress: LessonProgress;
  onSelect: (section: Destination["section"], topic?: number) => void;
}) {
  const entries = lessonSections(route.lesson),
    selected =
      route.section === "concept" ? `concept:${route.topic}` : route.section;
  const choose = (key: string) => {
    const [section, topic] = key.split(":");
    onSelect(section as Destination["section"], Number(topic) || 0);
  };
  return (
    <>
      <label className="mobile-lesson-select">
        انتقل إلى
        <select
          aria-label="انتقل إلى جزء من الدرس"
          value={selected}
          onChange={(e) => choose(e.target.value)}
        >
          {entries.map((e) => (
            <option key={e.key} value={e.key}>
              {e.title}
            </option>
          ))}
        </select>
      </label>
      <aside className="lesson-rail" aria-label="مسار الدرس">
        <small>في هذا الدرس</small>
        <nav>
          {entries.map((e, i) => {
            const topic = e.key.startsWith("concept:")
                ? Number(e.key.split(":")[1])
                : -1,
              done =
                topic >= 0 &&
                progress.conceptChecks?.includes(
                  curriculum[route.lesson - 1].topics[topic].check.id,
                );
            return (
              <button
                key={e.key}
                onClick={() => choose(e.key)}
                aria-current={selected === e.key ? "step" : undefined}
              >
                <span className="rail-number">
                  {done ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
                </span>
                <span>{e.title}</span>
                {selected === e.key && <ArrowLeft size={14} />}
              </button>
            );
          })}
        </nav>
        <p>
          يمكنك الانتقال بحرية.
          <br />
          الإنجاز يُسجل عند الفهم والتطبيق.
        </p>
      </aside>
    </>
  );
}
