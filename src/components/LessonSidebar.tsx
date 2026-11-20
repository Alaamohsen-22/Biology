import {
  BookOpen,
  Target,
  Flag,
  Trophy,
  Network,
  CheckCircle2,
} from "lucide-react";
import type { Lesson } from "../data/lessons";
import type { LessonProgress } from "../engine/progress";
import { curriculum } from "../data/curriculum";
import { lessonIndex, lessonPages } from "../engine/lessonFlow";
export function LessonSidebar({
  lesson,
  progress,
  currentIndex,
  open,
  onSelect,
}: {
  lesson: Lesson;
  progress: LessonProgress;
  currentIndex: number;
  open: boolean;
  onSelect: (index: number) => void;
}) {
  const pages = lessonPages(lesson.id),
    current = pages[currentIndex];
  return (
    <aside
      id="lesson-sidebar"
      className="classroom-sidebar"
      hidden={!open}
      aria-label="محتويات الدرس"
    >
      <h2>محتويات {lesson.title}</h2>
      <nav aria-label="مفاهيم الدرس">
        {lessonIndex(lesson.id).map(({ page, index }) => {
          const active =
            current.concept !== undefined
              ? current.concept === page.concept
              : currentIndex === index;
          const Icon =
            page.kind === "goals"
              ? Target
              : page.kind === "post"
                ? Flag
                : page.kind === "certificate"
                  ? Trophy
                  : page.kind === "infographic"
                    ? Network
                    : BookOpen;
          const done =
            page.concept !== undefined
              ? progress.conceptChecks?.includes(
                  curriculum[lesson.id - 1].topics[page.concept].check.id,
                )
              : page.kind === "pre"
                ? progress.pre !== undefined
                : page.kind === "post"
                  ? progress.post !== undefined
                  : false;
          return (
            <div key={page.id} className="sidebar-topic">
              <button
                aria-label={page.title}
                className={active ? "active" : ""}
                aria-current={active ? "location" : undefined}
                onClick={() => onSelect(index)}
                data-sound="handled"
              >
                <Icon size={18} />
                <span>{page.title}</span>
                {done && <CheckCircle2 size={15} aria-label="منجز" />}
              </button>
              {active && page.concept !== undefined && (
                <div className="sidebar-subsections">
                  {pages.map((part, i) =>
                    part.concept === page.concept ? (
                      <button
                        key={part.id}
                        aria-current={i === currentIndex ? "step" : undefined}
                        className={i === currentIndex ? "selected" : ""}
                        data-sound="handled"
                        onClick={() => onSelect(i)}
                      >
                        {part.kind === "explain"
                          ? "الشرح"
                          : part.kind === "check"
                            ? "تحقق من فهمك"
                            : `تجربة: ${lesson.scenes.find((s) => s.id === part.scene)?.title}`}
                      </button>
                    ) : null,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
