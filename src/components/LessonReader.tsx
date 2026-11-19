import { BookContentsDrawer } from "./BookContentsDrawer";
import { forwardRef, useState, useEffect, lazy, Suspense } from "react";
import {
  Leaf,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  ArrowRight,
  Map,
  Target,
  Flag,
  Network,
} from "lucide-react";
import { curriculum } from "../data/curriculum";
import { diagnostics } from "../data/diagnostics";
import { nutritionOpeningGoals } from "../data/nutritionOpening";
import { bank, type Lesson } from "../data/lessons";
import {
  lessonPages,
  lessonIndex,
  conceptCheckIds,
} from "../engine/conceptBook";
import { type LessonProgress, isMastered } from "../engine/progress";
import { useDraft } from "../engine/drafts";
import {
  NutritionDiagnostic,
  type DiagnosticNavigation,
} from "./NutritionDiagnostic";
import { StageGuide } from "./StageGuide";
import { ConceptVisual } from "./ConceptVisual";
import { ConceptCheck } from "./ConceptCheck";
import { LessonInfographic } from "./LessonInfographic";
import { OliveOrchardIntro } from "./OliveOrchardIntro";
const Simulation = lazy(() =>
  import("./Simulation").then((module) => ({ default: module.Simulation })),
);
import { Quiz } from "./Quiz";
import { TeacherAudio } from "./Audio";
import audioConfig from "../data/audio.json";
import { useSound } from "./SoundSystem";
import { LessonOpeningArt } from "./LessonOpeningArt";
type Props = {
  lesson: Lesson;
  progress: LessonProgress;
  index: number;
  setIndex: (i: number) => void;
  onBack: () => void;
  onNextLesson: () => void;
  patch: (
    patch: Partial<LessonProgress> | ((p: LessonProgress) => LessonProgress),
  ) => void;
  threshold: number;
  reduced: boolean;
  sound: boolean;
  name: string;
  onDiagnosticPage: (page: number) => void;
};
export const LessonReader = forwardRef<DiagnosticNavigation, Props>(
  function LessonReader(
    {
      lesson,
      progress,
      index,
      setIndex,
      onBack,
      onNextLesson,
      patch,
      threshold,
      reduced,
      sound: enabled,
      name,
      onDiagnosticPage,
    },
    diagnosticRef,
  ) {
    const data = curriculum[lesson.id - 1],
      pages = lessonPages(lesson.id),
      current = pages[index] ?? pages[0],
      concept =
        current.concept === undefined
          ? undefined
          : data.topics[current.concept];
    const [menu, setMenu] = useState(false),
      [help, setHelp] = useState("");
    const sound = useSound();
    const [award, setAward] = useDraft(
      `lesson-certificate-${name}-${lesson.id}`,
      { celebrated: false },
    );
    const mastered = isMastered(
      progress,
      threshold,
      lesson.scenes.map((s) => s.id),
      conceptCheckIds(lesson.id),
    );
    useEffect(() => {
      setHelp("");
    }, [current.id]);
    useEffect(() => {
      if (current.kind === "certificate" && mastered && !award.celebrated) {
        setAward({ celebrated: true });
        sound.play("success");
      }
    }, [current.kind, mastered, award.celebrated]);
    const go = (i: number) => {
      setIndex(Math.max(0, Math.min(pages.length - 1, i)));
      setMenu(false);
    };
    const next = () => go(index + 1);
    const note = concept
      ? current.kind === "experiment"
        ? `في ${concept.title} غيّر عاملًا واحدًا، ثم قارن ما يحدث.`
        : current.kind === "check"
          ? `استخدم ما تعلمته عن ${concept.title} لتفسير اختيارك.`
          : `لننتقل الآن إلى ${concept.title}. اربط الفكرة بالمثال قبل متابعة التجربة.`
      : current.kind === "intro"
        ? data.introQuestion
        : current.kind === "goals"
          ? "تعرف إلى ما ستستطيع تفسيره في نهاية هذه الحصة."
          : current.kind === "summary"
            ? "اربط المفاهيم معًا، ثم راجع ملخصك البصري."
            : current.kind === "post"
              ? "راجع إنفوجرافيك الدرس إذا احتجت، ثم اختبر فهمك."
              : mastered
                ? "أحسنت؛ هذا إنجاز مبني على أدائك."
                : "راجع ما بقي من التعلم؛ التنقل وحده لا يمنح الشهادة.";
    const recordCheck = (id: string) =>
      patch((p) => {
        const checks = [...new Set([...(p.conceptChecks ?? []), id])];
        return {
          ...p,
          conceptChecks: checks,
          formative: conceptCheckIds(lesson.id).every((q) =>
            checks.includes(q),
          ),
        };
      });
    const Icon =
      current.kind === "experiment"
        ? FlaskConical
        : current.kind === "check"
          ? CheckCircle2
          : BookOpen;
    return (
      <div className={`concept-reader ${current.kind === "experiment" ? "is-experiment" : ""}`}>
        <header className="lesson-heading">
          <button className="text-button" onClick={onBack}>
            <Map size={17} />
            العودة إلى الفهرس
          </button>
          <h1>
            {lesson.icon} {lesson.title}
          </h1>
          <span className="eyebrow">{lesson.place}</span>
        </header>
        <div className="concept-reader-layout">
          <button
            className="book-contents-toggle"
            aria-controls={menu ? "concept-index" : undefined}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            فهرس الدرس · {current.title}
          </button>
          {menu && (
            <BookContentsDrawer
              title={lesson.title}
              onClose={() => setMenu(false)}
            >
              {lessonIndex(lesson.id).map(({ page, index: i }) => {
                const active =
                  current.concept !== undefined
                    ? current.concept === page.concept
                    : index === i;
                const icon =
                  page.kind === "goals"
                    ? Target
                    : page.kind === "certificate"
                      ? Trophy
                      : page.kind === "post"
                        ? Flag
                        : page.kind === "infographic"
                          ? Network
                          : BookOpen;
                const ItemIcon = icon;
                const done =
                  page.concept !== undefined
                    ? progress.conceptChecks?.includes(
                        data.topics[page.concept].check.id,
                      )
                    : page.kind === "pre"
                      ? progress.pre !== undefined
                      : page.kind === "post"
                        ? progress.post !== undefined
                        : false;
                return (
                  <button
                    key={page.id}
                    aria-label={page.title}
                    aria-current={active ? "page" : undefined}
                    className={active ? "active" : ""}
                    onClick={() => go(i)}
                  >
                    <ItemIcon size={18} />
                    <span>{page.title}</span>
                    {done && <CheckCircle2 size={15} aria-label="منجز" />}
                  </button>
                );
              })}
            </BookContentsDrawer>
          )}
          <div className="concept-leaf" key={current.id}>
            {current.kind !== "intro" && (
              <div className="concept-leaf-heading">
                <Icon size={20} />
                <span>{current.title}</span>
                {concept && (
                  <small>
                    {current.kind === "explain"
                      ? "نفهم الفكرة"
                      : current.kind === "experiment"
                        ? "نجرّب ونلاحظ"
                        : "نتحقق من الفهم"}
                  </small>
                )}
              </div>
            )}
            {current.kind === "intro" &&
              (lesson.id === 1 ? (
                <OliveOrchardIntro
                  enabled={enabled}
                  reduced={reduced}
                  teacherText={data.introQuestion}
                  onBack={onBack}
                  onPre={() => go(1)}
                />
              ) : (
                <section className="lesson-opening">
                  <span className="eyebrow">سؤال يفتح الحكاية</span>
                  <h2>{data.introTitle}</h2>
                  <LessonOpeningArt lesson={lesson.id} />
                  <p>{data.introQuestion}</p>
                  {(audioConfig as Record<string, string>)[
                    `${lesson.id}.intro`
                  ] && (
                    <TeacherAudio
                      lesson={lesson.id}
                      section="intro"
                      text={data.introQuestion}
                      enabled={enabled}
                    />
                  )}
                  <button
                    className="primary embroidered-nav"
                    onClick={() => go(1)}
                  >
                    اكتشف معرفتك السابقة
                    <ArrowLeft size={18} />
                  </button>
                </section>
              ))}
            {current.kind === "pre" && (
              <NutritionDiagnostic
                ref={diagnosticRef}
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                questions={diagnostics[lesson.id]}
                onPage={onDiagnosticPage}
                onFinish={(pre) => patch({ pre })}
                onIntro={() => go(0)}
                onLearn={() => go(2)}
              />
            )}
            {current.kind === "goals" && (
              <section className="lesson-goals">
                <h2>أهداف رحلتك</h2>
                <p>في نهاية الحصة، يُتوقع أن:</p>
                <div className="nutrition-goal-grid">
                  {(lesson.id === 1
                    ? nutritionOpeningGoals
                    : data.topics.map((c) => c.goal)
                  ).map((goal) => (
                    <article className="nutrition-goal" key={goal}>
                      <Target size={25} />
                      <p>{goal}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {current.kind === "explain" && concept && (
              <section className="concept-explanation">
                <h2>{concept.title}</h2>
                <p className="scientific-definition">
                  <b>الفكرة العلمية</b>
                  {concept.definition}
                </p>
                <p className="teacher-explanation">{concept.teacher}</p>
                <div className="concept-explanation-visual">
                  <ConceptVisual concept={concept} />
                  <div className="real-life-example">
                    <Leaf size={22} />
                    <h3>من حياتنا</h3>
                    <p>{concept.example}</p>
                  </div>
                </div>
                {(audioConfig as Record<string, string>)[
                  `${lesson.id}.concept.${concept.id}`
                ] && (
                  <TeacherAudio
                    lesson={lesson.id}
                    section={`concept.${concept.id}`}
                    text={concept.teacher}
                    enabled={enabled}
                  />
                )}
                <details className="source-note">
                  <summary>مرجع الفكرة</summary>العلوم والحياة، الوحدة الأولى،
                  الصفحات المطبوعة {data.sourcePages}. الصياغة ميسرة للتعلم؛
                  بيانات الطبعة وحدود المقارنة في دليل المعلمة.
                </details>
              </section>
            )}
            {current.kind === "experiment" && (
              <Suspense fallback={<p role="status">نجهز أدوات التجربة…</p>}>
                <Simulation
                  scene={lesson.scenes.find((s) => s.id === current.scene)!}
                  reduced={reduced}
                  watched={progress.watched.includes(current.scene!)}
                  experimented={progress.experimented.includes(current.scene!)}
                  onHint={setHelp}
                  onWatch={() =>
                    patch((p) => ({
                      ...p,
                      watched: [...new Set([...p.watched, current.scene!])],
                    }))
                  }
                  onExperiment={() =>
                    patch((p) => ({
                      ...p,
                      experimented: [
                        ...new Set([...p.experimented, current.scene!]),
                      ],
                    }))
                  }
                />
                {current.scene === lesson.scenes[0].id &&
                  (audioConfig as Record<string, string>)[
                    `${lesson.id}.simulation`
                  ] && (
                    <TeacherAudio
                      lesson={lesson.id}
                      section="simulation"
                      text="شاهد التجربة ثم غيّر عاملًا واحدًا وقارن النتائج."
                      enabled={enabled}
                    />
                  )}
              </Suspense>
            )}
            {!(current.kind === "intro" && lesson.id === 1) &&
              current.kind !== "pre" &&
              current.kind !== "infographic" && (
                <StageGuide
                  context={`book-${lesson.id}-${current.id}`}
                  text={help || note}
                  hints={concept?.hints}
                  notice={help}
                />
              )}
            {current.kind === "check" && concept && (
              <ConceptCheck
                question={concept.check}
                done={
                  progress.conceptChecks?.includes(concept.check.id) ?? false
                }
                onDone={() => recordCheck(concept.check.id)}
                onHint={setHelp}
              />
            )}
            {current.kind === "summary" && (
              <section className="lesson-summary">
                <h2>خلاصة {lesson.title}</h2>
                {data.topics.map((c) => (
                  <details key={c.id}>
                    <summary>{c.title}</summary>
                    <p>{c.definition}</p>
                  </details>
                ))}
                {(audioConfig as Record<string, string>)[
                  `${lesson.id}.summary`
                ] && (
                  <TeacherAudio
                    lesson={lesson.id}
                    section="summary"
                    text={data.topics.map((c) => c.definition).join(" ")}
                    enabled={enabled}
                  />
                )}
                <button className="primary" onClick={next}>
                  راجع إنفوجرافيك الدرس
                  <ArrowLeft size={18} />
                </button>
              </section>
            )}
            {current.kind === "infographic" && (
              <LessonInfographic lesson={data} />
            )}
            {current.kind === "post" && (
              <section>
                <Quiz
                  paged
                  key={`post-${lesson.id}-${progress.attempts}`}
                  questions={bank(lesson, "post", progress.attempts)}
                  title={`تحدي الإتقان: ${lesson.title}`}
                  threshold={threshold}
                  onFinish={(post, goalResults) => patch({ post, goalResults })}
                />
                {progress.post !== undefined && (
                  <div className="post-remediation">
                    <p>
                      نتيجتك المسجلة: {progress.post}%.{" "}
                      {progress.post < threshold
                        ? "راجع المفاهيم التي احتجت فيها دعمًا، ثم حاول مجددًا."
                        : lesson.enrichment}
                    </p>
                    <button
                      onClick={() =>
                        go(pages.findIndex((p) => p.kind === "infographic"))
                      }
                    >
                      مراجعة الإنفوجرافيك
                    </button>
                    <button
                      onClick={() =>
                        patch((p) => ({ ...p, attempts: p.attempts + 1 }))
                      }
                    >
                      اختبار آخر بأسئلة مكافئة
                    </button>
                  </div>
                )}
              </section>
            )}
            {current.kind === "certificate" && (
              <section className={`lesson-award ${mastered ? "earned" : ""}`}>
                <Trophy size={54} />
                <h2>
                  {mastered
                    ? `شهادة مستكشف ${lesson.title}`
                    : "شهادة الإنجاز تنتظر إتقانك"}
                </h2>
                {mastered ? (
                  <>
                    <h3>{name || "المستكشف"}</h3>
                    <p>
                      أتقن درس {lesson.title} بنتيجة {progress.post}%
                    </p>
                    <div className="earned-stars">★★★</div>
                    <p>إعداد المعلمة: أ. آلاء محسن كلاب</p>
                    {progress.completedAt && (
                      <time dateTime={progress.completedAt}>
                        {new Date(progress.completedAt).toLocaleDateString(
                          "ar-PS",
                        )}
                      </time>
                    )}
                    <button onClick={() => window.print()}>
                      طباعة الشهادة
                    </button>
                  </>
                ) : (
                  <ul className="requirements">
                    {[
                      [progress.pre !== undefined, "تشخيص المعرفة السابقة"],
                      [
                        (progress.post ?? 0) >= threshold,
                        `درجة بعدية ${threshold}% فأعلى`,
                      ],
                      [
                        conceptCheckIds(lesson.id).every((id) =>
                          progress.conceptChecks?.includes(id),
                        ),
                        "تقويم المفاهيم",
                      ],
                      [
                        lesson.scenes.every(
                          (s) =>
                            progress.watched.includes(s.id) &&
                            progress.experimented.includes(s.id),
                        ),
                        "مشاهدة التجارب وتنفيذها واستنتاجها",
                      ],
                    ].map(([yes, text]) => (
                      <li key={String(text)}>
                        {yes ? "✓" : "○"} {text}
                      </li>
                    ))}
                  </ul>
                )}
                <button className="primary" onClick={onNextLesson}>
                  تابع رحلتك
                  <ArrowLeft size={18} />
                </button>
              </section>
            )}
            {current.kind !== "pre" &&
              !(current.kind === "intro" && lesson.id === 1) && (
                <nav className="lesson-bottom" aria-label="تنقل صفحات الدرس">
                  <button
                    className="embroidered-nav previous"
                    onClick={() => (index === 0 ? onBack() : go(index - 1))}
                  >
                    <ArrowRight size={18} />
                    السابق
                  </button>
                  <span>
                    {index + 1} / {pages.length}
                  </span>
                  {index < pages.length - 1 && (
                    <button
                      className="primary embroidered-nav next"
                      onClick={next}
                    >
                      التالي
                      <ArrowLeft size={18} />
                    </button>
                  )}
                </nav>
              )}
          </div>
        </div>
      </div>
    );
  },
);
