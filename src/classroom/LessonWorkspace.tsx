import { NutritionIntro } from "../nutrition/Intro";
import { NutritionGuide } from "../nutrition/NutritionGuide";
import { activityIds, shortTitles } from "../nutrition/data";
import { nutritionOpeningGoals } from "../data/nutritionOpening";
import { teacherExplanation } from "./content";
import { useState, lazy, Suspense, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  FlaskConical,
  BookOpen,
  Trophy,
  Check,
  Printer,
} from "lucide-react";
import { lessons, bank } from "../data/lessons";
import { curriculum } from "../data/curriculum";
import { diagnostics } from "../data/diagnostics";
import { conceptCheckIds } from "../engine/lessonFlow";
import { isMastered, type LessonProgress } from "../engine/progress";
import { useDraft } from "../engine/drafts";
import { ConceptVisual } from "../components/ConceptVisual";
import { ConceptCheck } from "../components/ConceptCheck";
import { NutritionDiagnostic } from "../components/NutritionDiagnostic";
import { LessonInfographic } from "../components/LessonInfographic";
import { LessonOpeningArt } from "../components/LessonOpeningArt";
import { TeacherAudio } from "../components/Audio";
import { StageGuide } from "../components/StageGuide";
import { Quiz } from "../components/Quiz";
import { useSound } from "../components/SoundSystem";
import audioConfig from "../data/audio.json";
import { LessonNavigator } from "./LessonNavigator";
import type { Destination, SettingsData } from "./storage";
const NutritionVisual = lazy(() =>
  import("../nutrition/VisualLesson").then((m) => ({
    default: m.VisualLesson,
  })),
);
const NutritionInfographic = lazy(() =>
  import("../nutrition/Infographic").then((m) => ({
    default: m.NutritionInfographic,
  })),
);
const Simulation = lazy(() =>
  import("../components/Simulation").then((m) => ({ default: m.Simulation })),
);
type Props = {
  route: Destination;
  progress: LessonProgress;
  settings: SettingsData;
  name: string;
  onSelect: (
    section: Destination["section"],
    topic?: number,
    scene?: string,
  ) => void;
  onHome: () => void;
  patch: (
    change: Partial<LessonProgress> | ((p: LessonProgress) => LessonProgress),
  ) => void;
};
export function LessonWorkspace({
  route,
  progress,
  settings,
  name,
  onSelect,
  onHome,
  patch,
}: Props) {
  const lesson = lessons[route.lesson - 1],
    data = curriculum[route.lesson - 1],
    concept = data.topics[route.topic];
  const [help, setHelp] = useState("");
  const sound = useSound();
  const [award, setAward] = useDraft(
    `lesson-certificate-${name}-${lesson.id}`,
    { celebrated: false },
  );
  const mastered = isMastered(
    progress,
    settings.threshold,
    lesson.scenes.map((s) => s.id),
    conceptCheckIds(lesson.id),
  );
  useEffect(() => setHelp(""), [route.section, route.topic]);
  useEffect(() => {
    if (route.section === "award" && mastered && !award.celebrated) {
      setAward({ celebrated: true });
      sound.play("success");
    }
  }, [route.section, mastered, award.celebrated]);
  const next = () =>
    onSelect(
      route.topic < data.topics.length - 1 ? "concept" : "review",
      Math.min(route.topic + 1, data.topics.length - 1),
    );
  const recordCheck = (id: string) =>
    patch((p) => {
      const checks = [...new Set([...(p.conceptChecks ?? []), id])];
      return {
        ...p,
        conceptChecks: checks,
        formative: conceptCheckIds(lesson.id).every((q) => checks.includes(q)),
      };
    });
  return (
    <div className="lesson-workspace" data-lesson={lesson.id}>
      <header className="lesson-context">
        <button className="plain" onClick={onHome}>
          <ArrowRight size={17} /> الدروس
        </button>
        <span>{lesson.title}</span>
        <small>
          {route.section === "concept"
            ? `المفهوم ${route.topic + 1} من ${data.topics.length}`
            : "تعلم بطريقتك"}
        </small>
      </header>
      <div className="lesson-layout">
        <LessonNavigator
          route={route}
          progress={progress}
          onSelect={onSelect}
        />
        <article
          className="lesson-canvas"
          key={`${route.lesson}-${route.section}-${route.topic}`}
        >
          {route.section === "intro" &&
            (lesson.id === 1 ? (
              <NutritionIntro
                onStart={() => onSelect("concept", 0)}
                onPre={() => onSelect("pre")}
                sound={settings.sound}
              />
            ) : (
              <section className="lesson-intro">
                <span className="overline">
                  الدرس {lesson.id} · {lesson.place}
                </span>
                <h1>{lesson.title}</h1>
                <div className="intro-discovery">
                  <div>
                    <h2>{data.introTitle}</h2>
                    <p className="intro-question">{data.introQuestion}</p>
                    <p>
                      ابدأ بفكرتك، ثم اختبرها. يمكنك طلب تلميح أو إعادة أي
                      تجربة.
                    </p>
                    <button
                      className="primary"
                      onClick={() => onSelect("concept", 0)}
                    >
                      لنكتشف معًا <ArrowLeft size={18} />
                    </button>
                  </div>
                  <LessonOpeningArt lesson={lesson.id} />
                </div>
                <StageGuide
                  autoOpen={false}
                  context={`studio-intro-${lesson.id}`}
                  text="ابدأ بتفسير من خبرتك اليومية، ثم قارنه بما ستلاحظه. ليس مطلوبًا أن تعرف الإجابة الآن."
                  hints={[
                    "استحضر موقفًا مشابهًا من حياتك، ثم انتقل لنكتشف السبب.",
                  ]}
                />
                <details className="goals-disclosure">
                  <summary>ماذا سأتعلم في هذا الدرس؟</summary>
                  <ul>
                    {(lesson.id === 1
                      ? nutritionOpeningGoals
                      : data.topics.map((c) => c.goal)
                    ).map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </details>
                <button className="secondary" onClick={() => onSelect("pre")}>
                  استكشف معرفتك السابقة · ٥ أسئلة
                </button>
                <ConfiguredAudio
                  lesson={lesson.id}
                  section="intro"
                  text={data.introQuestion}
                  sound={settings.sound}
                />
              </section>
            ))}
          {route.section === "pre" && (
            <NutritionDiagnostic
              key={lesson.id}
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              questions={diagnostics[lesson.id]}
              onFinish={(pre) => patch({ pre })}
              onLearn={() => onSelect("concept", 0)}
              onIntro={() => onSelect("intro")}
              onPage={() => {}}
            />
          )}
          {route.section === "concept" && (
            <>
              <ConceptLesson
                key={`${lesson.id}-${concept.id}`}
                route={route}
                concept={concept}
                progress={progress}
                settings={settings}
                onScene={(scene) => onSelect("concept", route.topic, scene)}
                onHint={setHelp}
                patch={patch}
                onCheck={() => recordCheck(concept.check.id)}
              />
              {lesson.id === 1 ? (
                <NutritionGuide context={concept.id} notice={help} />
              ) : (
                <StageGuide
                  autoOpen={false}
                  context={`studio-concept-${lesson.id}-${concept.id}`}
                  text={
                    help ||
                    `اربط ${concept.title} بالمثال، ثم جرّب تطبيق الفكرة.`
                  }
                  notice={help}
                  hints={concept.hints}
                />
              )}
              <nav
                className="concept-navigation"
                aria-label="التنقل بين المفاهيم"
              >
                <button
                  onClick={() =>
                    route.topic
                      ? onSelect("concept", route.topic - 1)
                      : onSelect("intro")
                  }
                >
                  <ArrowRight size={17} /> السابق
                </button>
                <button className="primary" onClick={next}>
                  {route.topic < data.topics.length - 1
                    ? "المفهوم التالي"
                    : "راجع ما تعلمت"}
                  <ArrowLeft size={17} />
                </button>
              </nav>
            </>
          )}
          {route.section === "review" && (
            <>
              <h1>{lesson.id === 1 ? "خلاصة التغذية" : "اجمع أفكارك"}</h1>
              {lesson.id !== 1 && (
                <p className="lead">
                  ملخص {lesson.title}، لتعود إلى الفكرة التي تحتاجها.
                </p>
              )}
              {lesson.id === 1 ? (
                <Suspense fallback={<p role="status">نجهّز الرسم…</p>}>
                  <NutritionInfographic
                    onConcept={(i) => onSelect("concept", i)}
                  />
                </Suspense>
              ) : (
                <LessonInfographic lesson={data} />
              )}
              {lesson.id !== 1 && (
                <div className="review-links">
                  {data.topics.map((c, i) => (
                    <button key={c.id} onClick={() => onSelect("concept", i)}>
                      {c.title}
                      <ArrowLeft size={15} />
                    </button>
                  ))}
                </div>
              )}
              <button className="primary" onClick={() => onSelect("post")}>
                اختبر فهمك <ArrowLeft size={18} />
              </button>
              <ConfiguredAudio
                lesson={lesson.id}
                section="summary"
                text={data.topics.map((c) => c.definition).join(" ")}
                sound={settings.sound}
              />
            </>
          )}
          {route.section === "post" && (
            <>
              <Quiz
                paged
                key={`${lesson.id}-${progress.attempts}`}
                questions={bank(lesson, "post", progress.attempts)}
                title={`اختبر فهمك: ${lesson.title}`}
                threshold={settings.threshold}
                onFinish={(post, goalResults) => patch({ post, goalResults })}
              />
              {progress.post !== undefined && (
                <div className="post-actions">
                  <p>
                    {progress.post >= settings.threshold
                      ? lesson.enrichment
                      : "راجع المفاهيم التي احتجت فيها دعمًا، ثم جرّب أسئلة مكافئة."}
                  </p>
                  <button onClick={() => onSelect("review")}>
                    راجع الملخص
                  </button>
                  <button
                    onClick={() =>
                      patch((p) => ({ ...p, attempts: p.attempts + 1 }))
                    }
                  >
                    أسئلة مكافئة جديدة
                  </button>
                  <button className="primary" onClick={() => onSelect("award")}>
                    إنجازي في الدرس <ArrowLeft size={17} />
                  </button>
                </div>
              )}
            </>
          )}
          {route.section === "award" && (
            <section className={`award-card ${mastered ? "earned" : ""}`}>
              <Trophy size={46} />
              <h1>
                {mastered
                  ? `شهادة مستكشف ${lesson.title}`
                  : "خطوتك التالية نحو الإتقان"}
              </h1>
              {mastered ? (
                <>
                  <h2>{name || "المستكشف"}</h2>
                  <p>
                    أتقن درس {lesson.title} بنتيجة {progress.post}%
                  </p>
                  <p>أ. آلاء محسن كلاب</p>
                  {progress.completedAt && (
                    <time>
                      {new Date(progress.completedAt).toLocaleDateString(
                        "ar-PS",
                        { timeZone: "Asia/Hebron" },
                      )}
                    </time>
                  )}
                  <button className="primary" onClick={() => window.print()}>
                    <Printer size={17} /> طباعة الشهادة
                  </button>
                </>
              ) : (
                <>
                  <p>تنقلك حر؛ هذه المتطلبات تسجل الإنجاز الفعلي فقط.</p>
                  <div className="requirements-list">
                    {[
                      [
                        progress.pre !== undefined,
                        "معرفتي السابقة",
                        () => onSelect("pre"),
                      ],
                      [
                        (progress.post ?? 0) >= settings.threshold,
                        `الاختبار البعدي ${settings.threshold}% فأعلى`,
                        () => onSelect("post"),
                      ],
                      [
                        conceptCheckIds(lesson.id).every((id) =>
                          progress.conceptChecks?.includes(id),
                        ),
                        "الأسئلة القصيرة",
                        () =>
                          onSelect(
                            "concept",
                            data.topics.findIndex(
                              (c) =>
                                !progress.conceptChecks?.includes(c.check.id),
                            ),
                          ),
                      ],
                      [
                        lesson.scenes.every(
                          (s) =>
                            progress.watched.includes(s.id) &&
                            progress.experimented.includes(s.id),
                        ),
                        "مشاهدة التجارب وتنفيذها",
                        () => {
                          const i = data.topics.findIndex((c) =>
                            c.scenes.some(
                              (s) =>
                                !progress.watched.includes(s) ||
                                !progress.experimented.includes(s),
                            ),
                          );
                          onSelect(
                            "concept",
                            Math.max(0, i),
                            data.topics[Math.max(0, i)].scenes[0],
                          );
                        },
                      ],
                    ].map(([done, label, action]) => (
                      <button
                        key={String(label)}
                        onClick={action as () => void}
                      >
                        {done ? (
                          <Check size={18} />
                        ) : (
                          <span className="empty-check" />
                        )}
                        {String(label)}
                        <ArrowLeft size={16} />
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button onClick={onHome}>اختر درسًا آخر</button>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
function ConfiguredAudio({
  lesson,
  section,
  text,
  sound,
}: {
  lesson: number;
  section: string;
  text: string;
  sound: boolean;
}) {
  return (audioConfig as Record<string, string>)[`${lesson}.${section}`] ? (
    <TeacherAudio
      lesson={lesson}
      section={section}
      text={text}
      enabled={sound}
    />
  ) : null;
}
function ConceptLesson({
  route,
  concept,
  progress,
  settings,
  onScene,
  onHint,
  patch,
  onCheck,
}: {
  route: Destination;
  concept: (typeof curriculum)[number]["topics"][number];
  progress: LessonProgress;
  settings: SettingsData;
  onScene: (id?: string) => void;
  onHint: (text: string) => void;
  patch: Props["patch"];
  onCheck: () => void;
}) {
  const lesson = lessons[route.lesson - 1],
    scene = lesson.scenes.find((s) => s.id === route.scene);
  const view = scene ? "lab" : "idea";
  const sound = useSound();
  const change = (value: "idea" | "lab") => {
    sound.play("step");
    if (value === "lab" && !scene) onScene(concept.scenes[0]);
    if (value === "idea") onScene(undefined);
  };
  return (
    <>
      <div className="concept-title">
        <span className="overline">
          {lesson.title} / {route.topic + 1}
        </span>
        <h1>{lesson.id === 1 ? shortTitles[concept.id] : concept.title}</h1>
      </div>
      {concept.scenes.length > 0 && (
        <div
          className="learning-modes"
          role="group"
          aria-label="طريقة استكشاف المفهوم"
        >
          <button aria-pressed={view === "idea"} onClick={() => change("idea")}>
            <BookOpen size={18} /> افهم الفكرة
          </button>
          <button aria-pressed={view === "lab"} onClick={() => change("lab")}>
            <FlaskConical size={18} /> استكشف بالتجربة
          </button>
        </div>
      )}
      {view === "idea" ? (
        <section className="concept-teaching">
          {lesson.id === 1 ? (
            <>
              <p className="nutrition-core">{concept.definition}</p>
              <Suspense fallback={<p role="status">نجهّز الرسم…</p>}>
                <NutritionVisual
                  concept={concept}
                  done={progress.activities.includes(activityIds[concept.id])}
                  onDone={() =>
                    patch((p) => ({
                      ...p,
                      activities: [
                        ...new Set([...p.activities, activityIds[concept.id]]),
                      ],
                    }))
                  }
                  reduced={settings.reduced}
                />
              </Suspense>
            </>
          ) : (
            <>
              <p className="concept-definition">{concept.definition}</p>
              <p className="concept-teacher">{teacherExplanation(concept)}</p>
              <div className="teaching-visual">
                <ConceptVisual concept={concept} />
                <aside className="everyday-example">
                  <span>
                    <Lightbulb size={18} /> من حياتنا
                  </span>
                  <p>{concept.example}</p>
                </aside>
              </div>
            </>
          )}
          <ConfiguredAudio
            lesson={lesson.id}
            section={`concept.${concept.id}`}
            text={concept.teacher}
            sound={settings.sound}
          />
          {concept.scenes.length > 0 && (
            <button className="experiment-entry" onClick={() => change("lab")}>
              <FlaskConical size={20} />
              <span>
                اختبر الفكرة بنفسك
                <small>
                  {concept.scenes.length}{" "}
                  {concept.scenes.length === 1 ? "تجربة" : "تجارب"} مرتبطة بهذا
                  المفهوم
                </small>
              </span>
              <ArrowLeft size={20} />
            </button>
          )}
        </section>
      ) : (
        <section className="concept-laboratory">
          <details className="idea-reminder">
            <summary>تذكير بالفكرة العلمية</summary>
            <p>{concept.definition}</p>
          </details>
          {concept.scenes.length > 1 && (
            <label className="experiment-selector">
              اختر التجربة
              <select
                aria-label="اختر التجربة"
                value={scene?.id || concept.scenes[0]}
                onChange={(e) => onScene(e.target.value)}
              >
                {concept.scenes.map((id) => (
                  <option key={id} value={id}>
                    {lesson.scenes.find((s) => s.id === id)?.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Suspense fallback={<p role="status">نجهّز أدواتك…</p>}>
            <Simulation
              key={scene?.id || concept.scenes[0]}
              scene={
                scene || lesson.scenes.find((s) => s.id === concept.scenes[0])!
              }
              reduced={settings.reduced}
              watched={progress.watched.includes(
                scene?.id || concept.scenes[0],
              )}
              experimented={progress.experimented.includes(
                scene?.id || concept.scenes[0],
              )}
              onHint={onHint}
              onWatch={() =>
                patch((p) => ({
                  ...p,
                  watched: [
                    ...new Set([...p.watched, scene?.id || concept.scenes[0]]),
                  ],
                }))
              }
              onExperiment={() =>
                patch((p) => ({
                  ...p,
                  experimented: [
                    ...new Set([
                      ...p.experimented,
                      scene?.id || concept.scenes[0],
                    ]),
                  ],
                }))
              }
            />
          </Suspense>
          <ConfiguredAudio
            lesson={lesson.id}
            section="simulation"
            text="غيّر عاملًا واحدًا وقارن ما يحدث، ثم فسّر النتيجة."
            sound={settings.sound}
          />
        </section>
      )}
      {lesson.id === 1 ? (
        <details className="nutrition-quick-question">
          <summary>اختبر فهمك</summary>
          <ConceptCheck
            narrate
            question={concept.check}
            done={progress.conceptChecks?.includes(concept.check.id) ?? false}
            onDone={onCheck}
            onHint={onHint}
          />
        </details>
      ) : (
        <div className="inline-check">
          <ConceptCheck
            question={concept.check}
            done={progress.conceptChecks?.includes(concept.check.id) ?? false}
            onDone={onCheck}
            onHint={onHint}
          />
        </div>
      )}
      {lesson.id !== 1 && (
        <details className="reference-disclosure">
          <summary>مصدر هذا المفهوم</summary>
          <p>
            العلوم والحياة، الوحدة الأولى، الصفحات المطبوعة{" "}
            {curriculum[lesson.id - 1].sourcePages}. تفاصيل المرجع وحدود الطبعة
            في دليل المعلمة.
          </p>
        </details>
      )}
    </>
  );
}
