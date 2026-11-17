import { useState } from "react";
import type { Lesson, Question } from "../data/lessons";
export function Matching({
  lesson,
  onDone,
  done,
}: {
  lesson: Lesson;
  onDone: () => void;
  done: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tries, setTries] = useState(0);
  const [ok, setOk] = useState(done);
  return (
    <section className="card">
      <span className="eyebrow">نشاط ١ · مطابقة وتصنيف</span>
      <h2>اربط كل مثال بمفهومه</h2>
      <p>اختر من القوائم؛ تعمل باللمس ولوحة المفاتيح.</p>
      {lesson.pairs.map(([a, b], i) => (
        <label className="match-row" key={a}>
          <span>{a}</span>
          <select
            value={answers[a] ?? ""}
            disabled={ok}
            onChange={(e) => setAnswers({ ...answers, [a]: e.target.value })}
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
        </label>
      ))}
      <button
        className="primary"
        disabled={ok || Object.keys(answers).length < lesson.pairs.length}
        onClick={() => {
          setTries(tries + 1);
          if (lesson.pairs.every(([a, b]) => answers[a] === b)) {
            setOk(true);
            onDone();
          }
        }}
      >
        {ok ? "✓ أتقنت المطابقة" : "تحقق من المطابقة"}
      </button>
      {tries > 0 && !ok && (
        <p role="status" className="hint">
          بعض العلاقات تحتاج مراجعة. اقرأ التلميحات ثم حاول مجددًا.
        </p>
      )}
    </section>
  );
}
export function Ordering({
  items,
  onDone,
  done,
  title = "رتب المراحل",
}: {
  items: string[];
  onDone: () => void;
  done: boolean;
  title?: string;
}) {
  const [order, setOrder] = useState(() => items.map((_, i) => i).reverse());
  const [tries, setTries] = useState(0);
  const [ok, setOk] = useState(done);
  const move = (i: number, d: number) => {
    const copy = [...order];
    [copy[i], copy[i + d]] = [copy[i + d], copy[i]];
    setOrder(copy);
  };
  return (
    <section className="card">
      <span className="eyebrow">نشاط ٢ · ترتيب</span>
      <h2>{title}</h2>
      <ol className="order-list">
        {order.map((idx, i) => (
          <li key={idx}>
            <span>{i + 1}</span>
            <b>{items[idx]}</b>
            <div>
              <button
                aria-label={`تقديم ${items[idx]}`}
                disabled={i === 0 || ok}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                aria-label={`تأخير ${items[idx]}`}
                disabled={i === order.length - 1 || ok}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        className="primary"
        disabled={ok}
        onClick={() => {
          setTries(tries + 1);
          if (order.every((v, i) => v === i)) {
            setOk(true);
            onDone();
          }
        }}
      >
        {ok ? "✓ ترتيب صحيح" : "تحقق من الترتيب"}
      </button>
      {tries > 0 && !ok && (
        <p className="hint" role="status">
          {tries === 1
            ? "حدد البداية أولًا، ثم ابحث عن علاقة السبب بالنتيجة."
            : `تبدأ المراحل بـ «${items[0]}»، وتنتهي بـ «${items[items.length - 1]}».`}
        </p>
      )}
    </section>
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
  const [choice, setChoice] = useState(-1);
  const [tries, setTries] = useState(0);
  const [ok, setOk] = useState(done);
  return (
    <div className="card">
      <span className="eyebrow">فكّر ثم اختبر فهمك</span>
      <h2>{question.text}</h2>
      <div className="options">
        {question.options.map((o, i) => (
          <label key={o}>
            <input
              type="radio"
              name="formative"
              checked={choice === i}
              disabled={ok}
              onChange={() => setChoice(i)}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
      <button
        disabled={choice < 0 || ok}
        className="primary"
        onClick={() => {
          setTries(tries + 1);
          if (choice === question.answer) {
            setOk(true);
            onDone();
          }
        }}
      >
        {ok ? "✓ فهم متحقق" : "تحقق وحاول"}
      </button>
      {tries > 0 && (
        <p className="hint" role="status">
          {ok
            ? question.why
            : tries === 1
              ? "استبعد الخيارات المخالفة للمفهوم، وحاول مرة أخرى."
              : question.why}
        </p>
      )}
    </div>
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
  const [chosen, setChosen] = useState(["", "", "", ""]);
  const [checked, setChecked] = useState(done);
  const [tries, setTries] = useState(0);
  return (
    <section className="card">
      <span className="eyebrow">تجميع افتراضي آمن · بديل التشريح</span>
      <h2>ابنِ نموذج الجهاز البولي</h2>
      <div className="assembly-layout">
        <svg
          viewBox="0 0 360 330"
          role="img"
          aria-label="نموذج الجهاز البولي مع أربعة مواضع للتسمية"
        >
          <path
            d="M120 55q-45-26-44 40t44 10q-17-22 0-50M240 55q45-26 44 40t-44 10q17-22 0-50"
            fill="#ba8580"
          />
          <path
            d="M116 108q4 70 38 118M244 108q-4 70-38 118"
            stroke="#c8b778"
            strokeWidth="7"
            fill="none"
          />
          <ellipse cx="180" cy="238" rx="35" ry="29" fill="#d1b98d" />
          <path d="M180 263v38" stroke="#b8a071" strokeWidth="9" />
          {[
            [51, 68],
            [302, 159],
            [287, 243],
            [281, 299],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="17"
                fill={checked ? "#719671" : "#e0d8bf"}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="14"
              >
                {checked ? "✓" : i + 1}
              </text>
            </g>
          ))}
        </svg>
        <div>
          {parts.map((p, i) => (
            <label className="match-row" key={p}>
              <span>الموضع {i + 1}</span>
              <select
                aria-label={`اسم العضو في الموضع ${i + 1}`}
                value={chosen[i]}
                disabled={checked}
                onChange={(e) => {
                  const copy = [...chosen];
                  copy[i] = e.target.value;
                  setChosen(copy);
                }}
              >
                <option value="">اختر العضو</option>
                {[...parts].reverse().map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              {tries > 0 && chosen[i] !== p && (
                <small>
                  {
                    [
                      "تنقية الدم وتكوين البول",
                      "نقل البول إلى المثانة",
                      "التخزين المؤقت",
                      "الطرح إلى خارج الجسم",
                    ][i]
                  }
                </small>
              )}
            </label>
          ))}
        </div>
      </div>
      <button
        className="primary"
        disabled={checked || chosen.some((x) => !x)}
        onClick={() => {
          setTries(tries + 1);
          if (chosen.every((x, i) => x === parts[i])) {
            setChecked(true);
            onDone();
          }
        }}
      >
        {checked ? "✓ نموذج مكتمل وصحيح" : "تحقق من تركيب النموذج"}
      </button>
      {checked && (
        <p className="hint">
          الكليتان تنقيان الدم؛ الحالبان ينقلان البول؛ المثانة تخزنه؛ والإحليل
          يطرحه.
        </p>
      )}
    </section>
  );
}
