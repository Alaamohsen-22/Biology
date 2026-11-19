import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { nutritionDiagnostic } from "../data/nutritionOpening";
import { useDraft } from "../engine/drafts";
import { useSound } from "./SoundSystem";
import type { DiagnosticQuestion } from "../data/nutritionOpening";
import { StageGuide } from "./StageGuide";
export type DiagnosticNavigation = { next: () => void; previous: () => void };
export const NutritionDiagnostic = forwardRef<
  DiagnosticNavigation,
  {
    onFinish: (percent: number) => void;
    onLearn: () => void;
    onIntro: () => void;
    onPage: (page: number) => void;
    lessonId?: number;
    lessonTitle?: string;
    questions?: DiagnosticQuestion[];
  }
>(function NutritionDiagnostic(
  {
    onFinish,
    onLearn,
    onIntro,
    onPage,
    lessonId = 1,
    lessonTitle = "التغذية",
    questions = nutritionDiagnostic,
  },
  ref,
) {
  const [draft, setDraft, failed] = useDraft(
    lessonId === 1 ? "nutrition-diagnostic-v2" : `diagnostic-v3-${lessonId}`,
    { answers: {} as Record<string, string>, cursor: 0, submitted: false },
  );
  const [warning, setWarning] = useState("");
  const sent = useRef(draft.submitted);
  const sound = useSound();
  const cursor = Math.max(0, Math.min(4, draft.cursor)),
    q = questions[cursor];
  const correct = questions.filter(
    (q) => draft.answers[q.id] === q.correctId,
  ).length;
  const result = {
    correct,
    percent: Math.round((correct / questions.length) * 100),
    complete: questions.every((q) =>
      q.options.some((o) => o.id === draft.answers[q.id]),
    ),
  };
  const next = () => {
    if (draft.submitted) {
      onLearn();
      return;
    }
    if (cursor < 4) {
      setDraft((d) => ({ ...d, cursor: cursor + 1 }));
      setWarning("");
    }
  };
  const previous = () => {
    if (draft.submitted || cursor === 0) onIntro();
    else {
      setDraft((d) => ({ ...d, cursor: cursor - 1 }));
      setWarning("");
    }
  };
  useImperativeHandle(ref, () => ({ next, previous }), [
    cursor,
    draft.submitted,
    onLearn,
    onIntro,
  ]);
  useEffect(
    () => onPage(draft.submitted ? 5 : cursor),
    [cursor, draft.submitted, onPage],
  );
  const submit = () => {
    if (!result.complete) {
      const missing = questions
        .filter(
          (item) => !item.options.some((o) => o.id === draft.answers[item.id]),
        )
        .map((_, i) => i + 1);
      setWarning(
        `بقيت ${missing.length} أسئلة دون إجابة. أجب عنها قبل إنهاء الاختبار.`,
      );
      return;
    }
    if (sent.current || draft.submitted) return;
    sent.current = true;
    setDraft((d) => ({ ...d, submitted: true }));
    onFinish(result.percent);
  };
  if (draft.submitted)
    return (
      <section
        className="diagnostic-result"
        aria-labelledby="diagnostic-result-title"
      >
        <span className="eyebrow">نقطة بداية، وليست حكمًا على قدراتك</span>
        <h2 id="diagnostic-result-title">اكتشفت نقطة انطلاقك!</h2>
        <div
          className="diagnostic-score"
          role="img"
          aria-label={`${result.correct} إجابات صحيحة من خمسة`}
          style={
            {
              "--diagnostic-score": `${result.percent}%`,
            } as React.CSSProperties
          }
        >
          <strong>
            {result.correct}
            <small>من خمسة</small>
          </strong>
        </div>
        <StageGuide
          context={`diagnostic-${lessonId}-result`}
          text={`أحسنت أيها المستكشف! لقد تعرفنا إلى معلوماتك السابقة، والآن حان وقت اكتشاف أسرار ${lessonTitle}!`}
        />
        <div className="button-row">
          <button className="primary embroidered-nav" onClick={onLearn}>
            ابدأ رحلة التعلم
          </button>
          <button
            onClick={() => {
              sent.current = false;
              setDraft((d) => ({ ...d, submitted: false, cursor: 0 }));
            }}
          >
            أعد التشخيص
          </button>
        </div>
      </section>
    );
  return (
    <section
      className="nutrition-diagnostic"
      data-sound-scope="custom"
      aria-labelledby="diagnostic-title"
    >
      <span className="eyebrow">قبل المغامرة · اكتشف نقطة بدايتك</span>
      <h2 id="diagnostic-title">تحدّي المعرفة السابقة</h2>
      <div
        className="olive-question-progress"
        aria-label={`السؤال ${cursor + 1} من خمسة`}
      >
        {questions.map((item, i) => (
          <button
            key={item.id}
            aria-label={`انتقل إلى السؤال ${i + 1}`}
            aria-current={cursor === i ? "step" : undefined}
            className={`${cursor === i ? "current" : ""} ${draft.answers[item.id] ? "answered" : ""}`}
            onClick={() => {
              setDraft((d) => ({ ...d, cursor: i }));
              setWarning("");
            }}
          >
            <svg viewBox="0 0 44 30" aria-hidden="true">
              <path d="M3 27Q11 0 41 3Q33 31 3 27Z" />
              <path d="M8 23L35 7" fill="none" stroke="currentColor" />
            </svg>
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <StageGuide
        context={`diagnostic-${lessonId}`}
        text="هيا نكتشف معلوماتك السابقة! لا تقلق، فنحن هنا لنتعلم معًا."
      />
      <fieldset className="diagnostic-question" key={q.id}>
        <legend>{q.text}</legend>
        {q.options.map((option, i) => (
          <label
            key={option.id}
            className={
              draft.answers[q.id] === option.id ? "selected-answer" : ""
            }
          >
            <input
              type="radio"
              name={q.id}
              value={option.id}
              checked={draft.answers[q.id] === option.id}
              onChange={() => {
                setDraft((d) => ({
                  ...d,
                  answers: { ...d.answers, [q.id]: option.id },
                }));
                setWarning("");
                sound.play("select");
              }}
            />
            <span className="answer-letter">{["أ", "ب", "ج"][i]}</span>
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      {warning && (
        <p className="diagnostic-warning" role="alert">
          {warning}
        </p>
      )}
      {failed && (
        <p role="alert">تعذر الحفظ المحلي؛ أبقِ الصفحة مفتوحة حتى تنتهي.</p>
      )}
      <nav className="diagnostic-nav" aria-label="أسئلة الاختبار القبلي">
        <button className="embroidered-nav previous" onClick={previous}>
          السابق
        </button>
        {cursor < 4 && (
          <button className="embroidered-nav next primary" onClick={next}>
            التالي
          </button>
        )}
        <button
          className={cursor === 4 ? "primary" : "text-button"}
          onClick={submit}
        >
          إنهاء الاختبار
        </button>
      </nav>
    </section>
  );
});
