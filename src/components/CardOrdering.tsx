import { useId, useState } from "react";
import { CheckCircle2, RotateCcw, Undo2 } from "lucide-react";
import { useSound } from "./SoundSystem";
import { ActivityFeedback, useActivityFeedback } from "./ActivityFeedback";
export function shuffledCards(length: number, previous: number[] = []) {
  const next = Array.from({ length }, (_, i) => i);
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  if (length > 1 && next.every((id, i) => id === previous[i]))
    next.push(next.shift()!);
  return next;
}
export function CardOrdering({
  items,
  done,
  onDone,
  sound: allowSound = true,
  reduced = false,
  title = "رتب المراحل",
}: {
  items: string[];
  done: boolean;
  onDone: () => void;
  sound?: boolean;
  reduced?: boolean;
  title?: string;
}) {
  const [pool, setPool] = useState(() => shuffledCards(items.length));
  const [chosen, setChosen] = useState<number[]>([]);
  const sound = useSound();
  const feedback = useActivityFeedback(allowSound);
  const id = useId();
  const success = feedback.status === "correct";
  const choose = (item: number) => {
    if (success || chosen.includes(item)) return;
    if (allowSound) sound.play("select");
    setChosen([...chosen, item]);
  };
  const remove = (item: number) => {
    if (success) return;
    if (allowSound) sound.play("move");
    setChosen(chosen.filter((x) => x !== item));
    feedback.reset();
  };
  const retry = () => {
    feedback.reset();
    setPool(shuffledCards(items.length, pool));
    setChosen([]);
    if (allowSound) sound.play("step");
  };
  return (
    <section
      className={`card card-ordering ${success ? "ordering-success" : ""}`}
      aria-labelledby={id}
      data-sound-scope="custom"
    >
      <div className="section-head">
        <div>
          <span className="eyebrow">نشاط تفاعلي · لعبة ترتيب المراحل</span>
          <h2 id={id}>{title}</h2>
        </div>
        {done && <span className="pill">✓ أُنجز النشاط</span>}
      </div>
      <p>اضغط على البطاقات حسب الترتيب الصحيح للمراحل</p>
      <p className="muted">
        اضغط على بطاقة مختارة لإعادتها، أو استخدم «تراجع عن آخر خطوة». إنجازك
        السابق محفوظ عند إعادة اللعب.
      </p>
      <div
        className="ordering-bank"
        role="group"
        aria-label="بطاقات المراحل المتاحة"
      >
        {pool
          .filter((item) => !chosen.includes(item))
          .map((item) => (
            <button
              className="science-card"
              key={item}
              onClick={() => choose(item)}
              disabled={success}
            >
              <span className="science-card-icon" aria-hidden="true">
                ✦
              </span>
              <b>{items[item]}</b>
              <span aria-hidden="true">＋</span>
            </button>
          ))}
        {chosen.length === items.length && (
          <p className="muted">
            جميع البطاقات في منطقة الإجابة. راجع ترتيبك ثم تحقق.
          </p>
        )}
      </div>
      <div className="ordering-answer" role="group" aria-label="منطقة الإجابة">
        <h3>
          ترتيبك العلمي{" "}
          <span>
            {chosen.length} / {items.length}
          </span>
        </h3>
        {!chosen.length ? (
          <p className="ordering-empty">اختر المرحلة الأولى من البطاقات.</p>
        ) : (
          <ol>
            {chosen.map((item, i) => (
              <li key={item}>
                <button
                  className="science-card chosen-card"
                  aria-label={`إلغاء اختيار ${items[item]}`}
                  disabled={success}
                  onClick={() => remove(item)}
                >
                  <span className="card-rank">{i + 1}</span>
                  <b>{items[item]}</b>
                  <span aria-hidden="true">{success ? "✓" : "×"}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="button-row ordering-actions">
        <button
          className="primary"
          disabled={chosen.length !== items.length || success}
          onClick={() =>
            feedback.check(
              chosen.every((item, i) => item === i),
              onDone,
            )
          }
        >
          <CheckCircle2 size={19} />
          تحقق من الترتيب
        </button>
        <button
          disabled={!chosen.length || success}
          onClick={() => remove(chosen[chosen.length - 1])}
        >
          <Undo2 size={18} />
          تراجع عن آخر خطوة
        </button>
        <button onClick={retry}>
          <RotateCcw size={18} />
          إعادة المحاولة
        </button>
      </div>
      <ActivityFeedback
        status={feedback.status}
        celebrating={feedback.celebrating}
        reduced={reduced}
      />
    </section>
  );
}
