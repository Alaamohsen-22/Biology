import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RotateCcw, Undo2, Star } from "lucide-react";
import { createEffectPlayer, type Effect } from "../engine/effects";
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
  sound = true,
  reduced = false,
}: {
  items: string[];
  done: boolean;
  onDone: () => void;
  sound?: boolean;
  reduced?: boolean;
}) {
  const [pool, setPool] = useState(() => shuffledCards(items.length));
  const [chosen, setChosen] = useState<number[]>([]);
  const [result, setResult] = useState<"idle" | "wrong" | "correct">("idle");
  const [celebrating, setCelebrating] = useState(false);
  const validated = useRef(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const player = useRef<ReturnType<typeof createEffectPlayer> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!sound) player.current?.stop();
  }, [sound]);
  useEffect(
    () => () => {
      player.current?.stop();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const play = (effect: Effect) => {
    // Keep spoken teacher recordings intelligible if one is currently playing.
    if (Array.from(document.querySelectorAll("audio")).some((a) => !a.paused))
      return;
    player.current ??= createEffectPlayer();
    player.current.play(effect, soundRef.current);
  };
  const choose = (id: number) => {
    if (validated.current || chosen.includes(id)) return;
    if (timer.current) clearTimeout(timer.current);
    play("select");
    setChosen([...chosen, id]);
    setResult("idle");
  };
  const remove = (id: number) => {
    if (validated.current) return;
    if (timer.current) clearTimeout(timer.current);
    play("select");
    setChosen(chosen.filter((x) => x !== id));
    setResult("idle");
  };
  const retry = () => {
    player.current?.stop();
    if (timer.current) clearTimeout(timer.current);
    setCelebrating(false);
    validated.current = false;
    setPool(shuffledCards(items.length, pool));
    setChosen([]);
    setResult("idle");
  };
  const check = () => {
    if (validated.current || chosen.length !== items.length) return;
    const correct = chosen.every((id, i) => id === i);
    // The check cue leads into a single success/error cue, without layering channels.
    play("check");
    setResult(correct ? "correct" : "wrong");
    if (timer.current) clearTimeout(timer.current);
    if (correct) {
      validated.current = true;
      onDone();
      setCelebrating(true);
    }
    timer.current = setTimeout(() => {
      play(correct ? "success" : "error");
      if (correct)
        timer.current = setTimeout(() => setCelebrating(false), 2300);
    }, 170);
  };
  return (
    <section
      className={`card card-ordering ${result === "correct" ? "ordering-success" : ""}`}
      aria-labelledby="card-order-title"
    >
      <div className="section-head">
        <div>
          <span className="eyebrow">نشاط ٢ · لعبة ترتيب المراحل</span>
          <h2 id="card-order-title">رتب المراحل</h2>
        </div>
        {done && <span className="pill">✓ أُنجز النشاط</span>}
      </div>
      <p id="card-order-instructions">
        اضغط على البطاقات حسب الترتيب الصحيح للمراحل
      </p>
      <p className="muted">
        اضغط على بطاقة مختارة لإعادتها، أو استخدم «تراجع عن آخر خطوة». يمكنك
        اللعب مجددًا دون فقد إنجازك السابق.
      </p>
      <div
        className="ordering-bank"
        role="group"
        aria-label="بطاقات المراحل المتاحة"
        aria-describedby="card-order-instructions"
      >
        {pool
          .filter((id) => !chosen.includes(id))
          .map((id) => (
            <button
              className="science-card"
              key={id}
              onClick={() => choose(id)}
              disabled={validated.current}
            >
              <span className="science-card-icon" aria-hidden="true">
                {["💧", "☀️", "🌿", "🫧"][id % 4]}
              </span>
              <b>{items[id]}</b>
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
        {chosen.length === 0 ? (
          <p className="ordering-empty">
            تبدأ رحلتك ببطاقة… اختر المرحلة الأولى من الأعلى.
          </p>
        ) : (
          <ol>
            {chosen.map((id, i) => (
              <li key={id}>
                <button
                  className="science-card chosen-card"
                  aria-label={`إلغاء اختيار ${items[id]}`}
                  disabled={validated.current}
                  onClick={() => remove(id)}
                >
                  <span className="card-rank">{i + 1}</span>
                  <b>{items[id]}</b>
                  <span aria-hidden="true">
                    {result === "correct" ? "✓" : "×"}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="button-row ordering-actions">
        <button
          className="primary"
          disabled={chosen.length !== items.length || result === "correct"}
          onClick={check}
        >
          <CheckCircle2 size={19} />
          تحقق من الترتيب
        </button>
        <button
          disabled={!chosen.length || result === "correct"}
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
      <div
        role="status"
        aria-live="polite"
        className={`ordering-feedback ${result}`}
      >
        {result === "correct" ? (
          <>
            <CheckCircle2 size={46} />
            <strong>ممتاز! أنت عالم صغير مبدع! 🌟</strong>
          </>
        ) : result === "wrong" ? (
          <strong>محاولة جميلة! فكّر قليلًا وجرّب مرة أخرى! 💚</strong>
        ) : (
          <span>
            الإكمال يُسجل بعد ترتيب صحيح فقط؛ لا تُخصم درجات عند المحاولة.
          </span>
        )}
      </div>
      {celebrating && (
        <div
          className={`ordering-celebration ${reduced ? "still" : ""}`}
          aria-hidden="true"
          data-testid="ordering-celebration"
        >
          {Array.from({ length: 18 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  "--x": `${(i * 37) % 100}%`,
                  "--delay": `${(i % 5) * 0.07}s`,
                  "--turn": `${i % 2 ? 130 : -140}deg`,
                  "--color": ["#d7ad4a", "#719a74", "#bd756a", "#72a6b4"][
                    i % 4
                  ],
                } as React.CSSProperties
              }
            >
              {i % 3 === 0 ? <Star fill="currentColor" size={22} /> : <span />}
            </i>
          ))}
        </div>
      )}
    </section>
  );
}
