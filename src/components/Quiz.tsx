import { useState, useRef } from "react";
import { useSound } from "./SoundSystem";
import type { Question } from "../data/lessons";
import { CheckCircle2, ArrowLeft, Lightbulb } from "lucide-react";
import { score, support } from "../engine/progress";
export function Quiz({
  questions,
  title,
  pre = false,
  threshold = 70,
  onFinish,
}: {
  questions: Question[];
  title: string;
  pre?: boolean;
  threshold?: number;
  onFinish: (score: number, goals: Record<number, boolean>) => void;
}) {
  const sound = useSound();
  const scored = useRef(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hints, setHints] = useState<Record<string, number>>({});
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const finish = () => {
    if (scored.current || Object.keys(answers).length !== questions.length)
      return;
    scored.current = true;
    sound.play(
      score(correct, questions.length) >= threshold ? "success" : "error",
    );
    setSubmitted(true);
    const goals: Record<number, boolean> = {};
    for (const q of questions)
      goals[q.goal] = (goals[q.goal] ?? true) && answers[q.id] === q.answer;
    onFinish(score(correct, questions.length), goals);
  };
  return (
    <div className="quiz" data-sound-scope="custom">
      <div className="section-head">
        <div>
          <span className="eyebrow">
            {pre
              ? "تشخيص المعرفة السابقة · دون احتساب في الإتقان"
              : "قياس الأهداف · تصحيح تلقائي"}
          </span>
          <h2>{title}</h2>
        </div>
        <span className="pill">{questions.length} أسئلة</span>
      </div>
      {questions.map((q, i) => (
        <fieldset
          key={q.id}
          className={`question ${submitted ? (answers[q.id] === q.answer ? "correct" : "incorrect") : ""}`}
        >
          <legend>
            <b>{String(i + 1).padStart(2, "0")}</b> {q.text}
          </legend>
          <span className="question-format">
            {q.format === "boolean"
              ? "صواب / خطأ"
              : q.format === "select"
                ? "تصنيف ومطابقة"
                : "اختيار واستنتاج"}
          </span>
          <div className="options">
            {q.options.map((option, j) => (
              <label key={j}>
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === j}
                  disabled={submitted}
                  onChange={() => {
                    setAnswers({ ...answers, [q.id]: j });
                    sound.play("select");
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {submitted && (
            <p className="feedback">
              {answers[q.id] === q.answer
                ? "✓ إجابة صحيحة."
                : "راجِع: " + q.options[q.answer] + "."}{" "}
              {q.why}
            </p>
          )}
          {!submitted && pre && (
            <>
              <button
                className="text-button"
                onClick={() =>
                  setHints({ ...hints, [q.id]: (hints[q.id] ?? 0) + 1 })
                }
              >
                <Lightbulb size={15} /> تلميح
              </button>
              {hints[q.id] > 0 && (
                <p className="hint">
                  {hints[q.id] === 1
                    ? "استحضر المفهوم، ثم استبعد الخيارات التي لا تصف عملية حيوية مناسبة."
                    : q.why}
                </p>
              )}
            </>
          )}
        </fieldset>
      ))}
      {!submitted ? (
        <button
          className="primary"
          onClick={finish}
          disabled={Object.keys(answers).length !== questions.length}
        >
          تصحيح الاختبار <CheckCircle2 size={18} />
        </button>
      ) : (
        <div className="result" role="status">
          <strong>{score(correct, questions.length)}%</strong>
          <div>
            <h3>
              {pre
                ? `مسارك المقترح: ${support(score(correct, questions.length))}`
                : "تم تسجيل النتيجة"}
            </h3>
            <p>
              {correct} إجابات صحيحة من {questions.length}.{" "}
              {pre
                ? "ابدأ التعلم واستفد من الدعم المناسب."
                : "راجع الأهداف التي أخطأت فيها ثم أكمل متطلبات المحطة."}
            </p>
          </div>
        </div>
      )}
      <p className="muted">
        {Object.keys(answers).length} / {questions.length} إجابات مسجلة{" "}
        {submitted && <ArrowLeft size={16} />}
      </p>
    </div>
  );
}
