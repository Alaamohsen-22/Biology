import { useRef, useState } from "react";
import type { Question } from "../data/lessons";
import { useDraft } from "../engine/drafts";
import { useSound } from "./SoundSystem";
export function ConceptCheck({
  question,
  done,
  onDone,
  onHint,
}: {
  question: Question;
  done: boolean;
  onDone: () => void;
  onHint: (hint: string) => void;
}) {
  const [draft, setDraft] = useDraft(`concept-check-${question.id}`, {
    choice: -1,
    correct: false,
  });
  const [tries, setTries] = useState(0),
    [message, setMessage] = useState("");
  const awarded = useRef(done);
  const sound = useSound();
  return (
    <section className="concept-check" data-sound-scope="custom">
      <span className="eyebrow">نتأكد من فهم الفكرة</span>
      <h2>{question.text}</h2>
      <div className="options">
        {question.options.map((text, i) => (
          <label key={text}>
            <input
              name={question.id}
              type="radio"
              checked={draft.choice === i}
              onChange={() => {
                setDraft((d) => ({ ...d, choice: i }));
                setMessage("");
                sound.play("select");
              }}
            />
            {text}
          </label>
        ))}
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={draft.choice < 0}
          onClick={() => {
            if (draft.choice === question.answer) {
              setDraft((d) => ({ ...d, correct: true }));
              setMessage(question.why);
              if (!awarded.current) {
                awarded.current = true;
                sound.play("success");
                onDone();
              }
            } else {
              setTries((n) => n + 1);
              setMessage(
                tries > 0
                  ? `راجع التعريف والمثال، ثم قارن الخيارات.`
                  : "محاولة جميلة. راجع العلاقة بين المفهوم والمثال.",
              );
              sound.play("error");
              onHint("قارن الخيار الذي اخترته بما شاهدته في الشرح أو التجربة.");
            }
          }}
        >
          تحقق من فهمي
        </button>
        <button
          onClick={() => {
            onHint(
              tries > 0
                ? "راجع التعريف وحدد السبب، وليس وصف النتيجة فقط."
                : "ابدأ بالمثال، ثم قارن ما يحدث في كل خيار.",
            );
          }}
        >
          أعطني تلميحًا
        </button>
      </div>
      {message && (
        <p className="hint" role="status">
          {draft.correct && draft.choice === question.answer ? "✓ " : ""}
          {message}
        </p>
      )}
      {(done || draft.correct) && (
        <p className="muted">✓ فهم هذا المفهوم محفوظ؛ يمكنك التدريب مجددًا.</p>
      )}
    </section>
  );
}
