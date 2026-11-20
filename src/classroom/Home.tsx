import { Check, Search, Play } from "lucide-react";
import { useState } from "react";
import { lessons } from "../data/lessons";
import { curriculum } from "../data/curriculum";
import { lessonCompletion, type Progress } from "../engine/progress";
import { conceptCheckIds } from "../engine/lessonFlow";
import { lessonIdentity } from "./catalog";
import type { Destination } from "./storage";
import assets from "../data/assets.json";
export function Home({
  progress,
  threshold,
  mastered,
  resume,
  onLesson,
  onResume,
}: {
  progress: Progress;
  threshold: number;
  mastered: number[];
  resume: Destination | null;
  onLesson: (id: number) => void;
  onResume: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = lessons.filter((l) =>
    `${l.title} ${l.place}`.includes(query.trim()),
  );
  return (
    <div className="home-view">
      <section className="home-welcome">
        <div>
          <span className="overline">العلوم والحياة · الصف السابع</span>
          <h1>خصائص الكائنات الحية</h1>
        </div>
      </section>
      {resume && (
        <button className="resume-card" onClick={onResume}>
          <span className="resume-play">
            <Play size={19} />
          </span>
          <span>
            <small>من حيث توقفت</small>
            <strong>
              {lessons[resume.lesson - 1].title} ·{" "}
              {resume.section === "concept"
                ? curriculum[resume.lesson - 1].topics[resume.topic].title
                : resume.section === "post"
                  ? "الاختبار البعدي"
                  : "متابعة الدرس"}
            </strong>
          </span>
        </button>
      )}
      <div className="catalog-heading">
        <div>
          <h2>الدروس</h2>
        </div>
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="ابحث عن درس"
            placeholder="ابحث عن درس"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="lesson-catalog">
        {filtered.map((l) => {
          const { Icon, color, tint, verb } = lessonIdentity[l.id - 1];
          const completed = lessonCompletion(
            progress.lessons[l.id],
            l.scenes.map((s) => s.id),
            threshold,
            conceptCheckIds(l.id),
          );
          return (
            <button
              className="lesson-tile"
              key={l.id}
              onClick={() => onLesson(l.id)}
              aria-label={`افتح درس ${l.title}`}
              style={
                { "--accent": color, "--tint": tint } as React.CSSProperties
              }
            >
              <div className="tile-heading">
                <span className="lesson-glyph">
                  <Icon size={27} strokeWidth={1.6} />
                </span>

                {mastered.includes(l.id) && <Check size={19} />}
              </div>
              <h3>{l.title}</h3>
              <p>{verb}</p>
              <div className="tile-footer">
                <span>
                  {curriculum[l.id - 1].topics.length} مفاهيم ·{" "}
                  {l.scenes.length} تجارب
                </span>
              </div>
              {completed > 0 && (
                <div className="tile-progress">
                  <span>إنجازك {completed}%</span>
                  <progress
                    max={100}
                    value={completed}
                    aria-label={`إنجاز ${l.title}`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {!filtered.length && (
        <section className="empty-state">
          <h3>لا توجد نتائج لهذا الاسم.</h3>
          <button onClick={() => setQuery("")}>اعرض الدروس كلها</button>
        </section>
      )}
      <footer className="home-credit">
        {assets.teacherPortrait && (
          <img
            alt="المعلمة آلاء محسن كلاب"
            src={`${import.meta.env?.BASE_URL ?? "/Biology/"}${assets.teacherPortrait}`}
          />
        )}
        <div>
          <span>إعداد المعلمة</span>
          <strong>أ. آلاء محسن كلاب</strong>
        </div>
      </footer>
    </div>
  );
}
