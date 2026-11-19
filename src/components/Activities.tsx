import { useDraft, useDraftState } from "../engine/drafts";
import { useState } from "react";
import type { Lesson, Question } from "../data/lessons";
import { CardOrdering } from "./CardOrdering";
import { ActivityFeedback, useActivityFeedback } from "./ActivityFeedback";
import { useSound } from "./SoundSystem";
import { ScientificScene } from "./science/ScientificScene";
export function Matching({
  lesson,
  onDone,
  done,
}: {
  lesson: Lesson;
  onDone: () => void;
  done: boolean;
}) {
  const [draft,setDraft] = useDraft(`matching-${lesson.id}`, { answers: {} as Record<string,string> });
  const answers = draft.answers;
  const setAnswers = (answers: Record<string,string>) => setDraft({answers});
  const [tries, setTries] = useDraftState(`matching-tries-${lesson.id}`,0);
  const [ok, setOk] = useState(done);
  const feedback = useActivityFeedback();
  const sound = useSound();
  return (
    <section className="card activity-board" data-sound-scope="custom">
      <div className="section-head">
        <div>
          <span className="eyebrow">نشاط ١ · مطابقة وتصنيف</span>
          <h2>اربط كل مثال بمفهومه</h2>
        </div>
        {done && <span className="pill">✓ إنجاز محفوظ</span>}
      </div>
      <p>اختر المفهوم المناسب لكل بطاقة. تعمل القوائم باللمس ولوحة المفاتيح.</p>
      <div className="matching-cards">
        {lesson.pairs.map(([a, b], i) => (
          <label
            className={`matching-card ${answers[a] ? "answered" : ""} ${tries > 0 ? (answers[a] === b ? "correct" : "needs-review") : ""}`}
            key={a}
          >
            <span className="activity-number">{i + 1}</span>
            <b>{a}</b>
            <select
              value={answers[a] ?? ""}
              disabled={ok}
              onChange={(e) => {
                setAnswers({ ...answers, [a]: e.target.value });
                sound.play("select");
              }}
            >
              <option value="">اختر المفهوم</option>
              {[...lesson.pairs].reverse().map(([, v]) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            {tries > 0 && answers[a] !== b && (
              <small>
                {tries > 1
                  ? `فكر في: ${b}`
                  : `ارجع إلى فقرة ${lesson.concepts[Math.min(i, lesson.concepts.length - 1)].title}`}
              </small>
            )}
            {tries > 0 && answers[a] === b && <small>✓ علاقة صحيحة</small>}
          </label>
        ))}
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={ok || Object.keys(answers).length < lesson.pairs.length}
          onClick={() => {
            setTries(tries + 1);
            feedback.check(
              lesson.pairs.every(([a, b]) => answers[a] === b),
              () => {
                setOk(true);
                onDone();
              },
            );
          }}
        >
          {ok ? "✓ أتقنت المطابقة" : "تحقق من المطابقة"}
        </button>
        <button
          onClick={() => {
            setOk(false);
            setTries(0);
            setAnswers({});
            feedback.reset();
            sound.play("step");
          }}
        >
          إعادة نشاط المطابقة {done && "· إنجازك محفوظ ✓"}
        </button>
      </div>
      <ActivityFeedback
        status={feedback.status}
        celebrating={feedback.celebrating}
      />
    </section>
  );
}
export function Ordering({
  items,
  onDone,
  done,
  title = "رتب المراحل",
  reduced = false,
}: {
  items: string[];
  onDone: () => void;
  done: boolean;
  title?: string;
  reduced?: boolean;
}) {
  return (
    <CardOrdering
      items={items}
      onDone={onDone}
      done={done}
      title={title}
      reduced={reduced}
    />
  );
}
export function Formative({
  question,
  onDone,
  done,
}: {
  question: Question;
  onDone: () => void;
  done: boolean;
}) {
  const [draft,setDraft] = useDraft(`formative-${question.id}`, {choice: -1});
  const choice = draft.choice;
  const setChoice = (choice: number) => setDraft({choice});
  const [ok, setOk] = useState(done);
  const [tries, setTries] = useDraftState(`formative-tries-${question.id}`,0);
  const feedback = useActivityFeedback();
  const sound = useSound();
  return (
    <section className="card activity-board" data-sound-scope="custom">
      <span className="eyebrow">فكّر ثم اختبر فهمك</span>
      <h2>{question.text}</h2>
      <div className="options activity-options">
        {question.options.map((o, i) => (
          <label key={o}>
            <input
              type="radio"
              name="formative"
              checked={choice === i}
              disabled={ok}
              onChange={() => {
                setChoice(i);
                sound.play("select");
              }}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
      <div className="button-row">
        <button
          disabled={choice < 0 || ok}
          className="primary"
          onClick={() => {
            setTries(tries + 1);
            feedback.check(choice === question.answer, () => {
              setOk(true);
              onDone();
            });
          }}
        >
          {ok ? "✓ فهم متحقق" : "تحقق وحاول"}
        </button>
        <button
          onClick={() => {
            setChoice(-1);
            setTries(0);
            setOk(false);
            feedback.reset();
            sound.play("step");
          }}
        >
          إعادة التقويم {done && "· إنجازك محفوظ ✓"}
        </button>
      </div>
      {tries > 0 && (
        <p className="hint">
          {ok
            ? question.why
            : tries === 1
              ? "استبعد الخيارات المخالفة للمفهوم، ثم حاول مجددًا."
              : question.why}
        </p>
      )}
      <ActivityFeedback
        status={feedback.status}
        celebrating={feedback.celebrating}
      />
    </section>
  );
}
export function UrinaryAssembly({
  done,
  onDone,
}: {
  done: boolean;
  onDone: () => void;
}) {
  const parts = ["الكليتان", "الحالبان", "المثانة", "الإحليل"];
  const [draft,setDraft] = useDraft("urinary-assembly", {chosen: ["", "", "", ""]});
  const chosen = draft.chosen;
  const setChosen = (chosen: string[]) => setDraft({chosen});
  const [checked, setChecked] = useState(done);
  const [tries, setTries] = useDraftState("assembly-tries",0);
  const feedback = useActivityFeedback();
  const sound = useSound();
  return (
    <section className="card activity-board" data-sound-scope="custom">
      <div className="section-head">
        <div>
          <span className="eyebrow">تجميع افتراضي آمن · بديل التشريح</span>
          <h2>ابنِ نموذج الجهاز البولي</h2>
        </div>
        {done && <span className="pill">✓ إنجاز محفوظ</span>}
      </div>
      <p>لاحظ مواضع الأعضاء في الرسم، ثم اربطها بالاسم والوظيفة.</p>
      <div className="assembly-layout">
        <ScientificScene
          id="urine"
          t={checked ? 1 : 0.5}
          value={checked ? 1 : 0.5}
          vars={{ time: 100 }}
          compact
        />
        <div>
          {parts.map((p, i) => (
            <label className="assembly-part-card" key={p}>
              <span className="activity-number">{i + 1}</span>
              <b>
                {
                  [
                    "عضوان لتنقية الدم",
                    "أنبوبان نحو المثانة",
                    "حجرة تخزين مؤقت",
                    "أنبوب إلى الخارج",
                  ][i]
                }
              </b>
              <select
                aria-label={`اسم العضو في الموضع ${i + 1}`}
                value={chosen[i]}
                disabled={checked}
                onChange={(e) => {
                  const copy = [...chosen];
                  copy[i] = e.target.value;
                  setChosen(copy);
                  sound.play("tool");
                }}
              >
                <option value="">اختر العضو</option>
                {[...parts].reverse().map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              {tries > 0 && chosen[i] !== p && (
                <small>راجع الاسم المرتبط بهذه الوظيفة في الرسم.</small>
              )}
            </label>
          ))}
        </div>
      </div>
      <div className="button-row">
        <button
          className="primary"
          disabled={checked || chosen.some((x) => !x)}
          onClick={() => {
            setTries(tries + 1);
            feedback.check(
              chosen.every((x, i) => x === parts[i]),
              () => {
                setChecked(true);
                onDone();
              },
            );
          }}
        >
          {checked ? "✓ نموذج مكتمل وصحيح" : "تحقق من تركيب النموذج"}
        </button>
        <button
          onClick={() => {
            setChecked(false);
            setTries(0);
            setChosen(["", "", "", ""]);
            feedback.reset();
            sound.play("step");
          }}
        >
          إعادة تركيب النموذج {done && "· إنجازك محفوظ ✓"}
        </button>
      </div>
      <ActivityFeedback
        status={feedback.status}
        celebrating={feedback.celebrating}
      />
    </section>
  );
}
