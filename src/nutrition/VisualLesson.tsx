import { useState, useRef, useId, useEffect } from "react";
import {
  RotateCcw,
  Check,
  FlaskConical,
  Droplets,
  Sun,
  Leaf,
} from "lucide-react";
import { SpecimenArt, type Specimen } from "./Artwork";
import { ScientificScene } from "../components/science/ScientificScene";
import { CardOrdering } from "../components/CardOrdering";
import { lessons } from "../data/lessons";
import type { BookConcept } from "../data/curriculum";
import { useDraft, useDraftState } from "../engine/drafts";
import { useSound } from "../components/SoundSystem";
import { reinforcement } from "./voice";
import {
  ActivityFeedback,
  useActivityFeedback,
} from "../components/ActivityFeedback";

export function VisualLesson({
  concept,
  done,
  onDone,
  reduced,
}: {
  concept: BookConcept;
  done: boolean;
  onDone: () => void;
  reduced: boolean;
}) {
  return (
    <section className="nutrition-visual-lesson">
      {concept.id === "nutrition" && (
        <Classification
          cards={[
            {
              id: "olive",
              label: "شجرة الزيتون",
              art: "olive",
              answer: "self",
            },
            { id: "rabbit", label: "الأرنب", art: "rabbit", answer: "other" },
            { id: "fungus", label: "الفطر", art: "fungus", answer: "other" },
          ]}
          options={[
            { id: "self", label: "ذاتية التغذية" },
            { id: "other", label: "غير ذاتية التغذية" },
          ]}
          title="من يصنع غذاءه؟"
          id="nutrition"
          why="شجرة الزيتون تصنع غذاءها؛ الأرنب والفطر يعتمدان على مصادر عضوية أخرى."
          done={done}
          onDone={onDone}
          reduced={reduced}
        />
      )}
      {concept.id === "photosynthesis" && (
        <>
          <ProcessDiagram />
          <details className="nutrition-activity">
            <summary>رتّب رحلة صنع الغذاء</summary>
            <CardOrdering
              compact
              items={lessons[0].order}
              done={done}
              onDone={() => {
                onDone();
                reinforcement("correct");
              }}
              reduced={reduced}
              title="رتّب المراحل"
            />
          </details>
        </>
      )}
      {concept.id === "starch" && (
        <StarchChallenge done={done} onDone={onDone} reduced={reduced} />
      )}
      {concept.id === "feeding" && (
        <Classification
          id="feeding"
          title="صِل الكائن بنمط تغذيته"
          cards={[
            {
              id: "bread",
              label: "عفن الخبز",
              art: "bread",
              answer: "saprophyte",
            },
            { id: "louse", label: "القمل", art: "louse", answer: "parasite" },
          ]}
          options={[
            { id: "saprophyte", label: "ترمم · بقايا ميتة" },
            { id: "parasite", label: "تطفل · مضيف حي" },
          ]}
          why="عفن الخبز يتغذى على مادة عضوية ميتة، والقمل يحصل على غذائه من مضيف حي ويضره."
          done={done}
          onDone={onDone}
          reduced={reduced}
        />
      )}
      {concept.id === "animals" && (
        <>
          <AnimalComparison />
          <Classification
            id="animals"
            title="اختر غذاءه، ثم نمط تغذيته"
            cards={[
              { id: "rabbit", label: "الأرنب", art: "rabbit", answer: "herb" },
              {
                id: "human",
                label: "الإنسان عادةً",
                art: "human",
                answer: "omni",
              },
            ]}
            options={[
              { id: "herb", label: "نباتي · آكل أعشاب" },
              { id: "carn", label: "حيواني · آكل لحوم" },
              { id: "omni", label: "نباتي وحيواني · قارت" },
            ]}
            why="الأرنب يأكل الأعشاب؛ والإنسان يتناول عادة مصادر نباتية وحيوانية. نصنف وفق الغذاء."
            done={done}
            onDone={onDone}
            reduced={reduced}
          />
        </>
      )}
      <details className="nutrition-more">
        <summary>اعرف أكثر</summary>
        <p>{concept.teacher}</p>
        <p>{concept.example}</p>
      </details>
    </section>
  );
}
type Card = { id: string; label: string; art: Specimen; answer: string };
function Classification({
  id,
  title,
  cards,
  options,
  why,
  done,
  onDone,
  reduced,
}: {
  id: string;
  title: string;
  cards: Card[];
  options: { id: string; label: string }[];
  why: string;
  done: boolean;
  onDone: () => void;
  reduced: boolean;
}) {
  const [draft, setDraft] = useDraft(`nutrition-game-${id}`, {
    answers: {} as Record<string, string>,
    mastered: [] as string[],
  });
  const [active, setActive] = useState(cards[0].id),
    [message, setMessage] = useState("");
  const card = cards.find((c) => c.id === active)!;
  const awarded = useRef(done);
  const feedback = useActivityFeedback();
  const sound = useSound();
  return (
    <section
      className="specimen-challenge"
      aria-label={title}
      data-sound-scope="custom"
    >
      <h2>{title}</h2>
      <div className="specimen-choice" role="group" aria-label="الكائنات">
        {cards.map((c) => (
          <button
            aria-label={c.label}
            aria-pressed={active === c.id}
            key={c.id}
            onClick={() => {
              setActive(c.id);
              setMessage("");
              feedback.reset();
              sound.play("select");
            }}
          >
            <SpecimenArt kind={c.art} label={c.label} />
            <span>{c.label}</span>
            {draft.mastered.includes(c.id) && (
              <Check size={17} aria-label="إجابة صحيحة" />
            )}
          </button>
        ))}
      </div>
      <div
        className="classification-options"
        role="group"
        aria-label={`صنّف ${card.label}`}
      >
        {options.map((o) => (
          <button
            key={o.id}
            aria-pressed={draft.answers[active] === o.id}
            onClick={() => {
              setDraft((d) => ({
                ...d,
                answers: { ...d.answers, [active]: o.id },
              }));
              setMessage("");
              feedback.reset();
              sound.play("move");
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="activity-controls">
        <button
          className="primary"
          disabled={!draft.answers[active]}
          onClick={() => {
            const correct = draft.answers[active] === card.answer;
            if (correct) {
              const mastered = [...new Set([...draft.mastered, active])];
              setDraft((d) => ({ ...d, mastered }));
              const all = cards.every((c) => mastered.includes(c.id));
              setMessage(
                `${all ? "أحسنت!" : "صحيح. جرّب الكائن التالي."} ${why}`,
              );
              if (all && !awarded.current) {
                awarded.current = true;
                feedback.check(true, onDone);
                reinforcement("correct");
              } else sound.play("check");
            } else {
              setMessage(`حاول مرة أخرى. ${why}`);
              feedback.check(false);
              reinforcement("retry");
            }
          }}
        >
          تحقق
        </button>
        <button
          onClick={() => {
            setDraft((d) => ({ ...d, answers: {} }));
            setMessage("");
            feedback.reset();
            sound.play("move");
          }}
        >
          <RotateCcw size={17} /> أعد المحاولة
        </button>
        {done && <small>✓ إنجازك محفوظ</small>}
      </div>
      {message && (
        <p role="status" className="nutrition-feedback">
          {message}
        </p>
      )}
      <ActivityFeedback
        status={feedback.status}
        celebrating={feedback.celebrating}
        reduced={reduced}
      />
    </section>
  );
}
export function ProcessDiagram() {
  const [part, setPart] = useState("water");
  const plateId = useId().replace(/:/g, "");
  const details: Record<string, string> = {
    water: "يمتص النبات الماء عبر الجذور وينقله إلى الأوراق.",
    light: "يوفر الضوء الطاقة اللازمة لصنع الغذاء.",
    gases: "يدخل ثاني أكسيد الكربون، وينطلق الأكسجين أثناء البناء الضوئي.",
  };
  return (
    <figure className={`photosynthesis-plate highlight-${part}`}>
      <svg
        viewBox="0 0 700 350"
        role="img"
        aria-label="مدخلات البناء الضوئي ونواتجه"
      >
        <defs>
          <marker
            id={plateId + "-arrow"}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0 0l10 5-10 5Z" fill="context-stroke" />
          </marker>
          <linearGradient id={plateId + "-sun"}>
            <stop stopColor="#fae296" />
            <stop offset="1" stopColor="#e9bb48" />
          </linearGradient>
        </defs>
        <rect width="700" height="350" rx="22" fill="#f0f6ee" />
        <path d="M0 286Q350 260 700 286v64H0Z" fill="#d4c4a0" />
        <path
          d="M350 285V142m0 77-50-44m50 22 51-41"
          stroke="#65814e"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <g fill="#68965e">
          {[
            [300, 165, -25],
            [389, 149, 25],
            [310, 215, -15],
            [390, 202, 15],
            [347, 120, -60],
          ].map(([x, y, r], i) => (
            <path
              key={i}
              d={`M${x - 36} ${y}q36-40 72 0q-36 25-72 0Z`}
              transform={`rotate(${r} ${x} ${y})`}
            />
          ))}
        </g>
        <g stroke="#a3885e" strokeWidth="3" fill="none">
          <path d="M350 285v41m0-31-29 20m29-6 32 17m-32-9-17 18" />
        </g>
        <g className="plate-water">
          <path
            d="M128 314H319l28-60v-58"
            stroke="#4c9fbc"
            strokeWidth="5"
            fill="none"
            markerEnd={`url(#${plateId}-arrow)`}
          />
          <path d="M83 282c-30 41-20 58 0 58s30-17 0-58Z" fill="#6bb4ce" />
          <text x="150" y="300">
            الماء
          </text>
        </g>
        <g className="plate-light">
          <circle cx="545" cy="59" r="27" fill={`url(#${plateId}-sun)`} />
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d="M545 21v-9"
              transform={`rotate(${i * 45} 545 59)`}
              stroke="#dab04e"
              strokeWidth="3"
            />
          ))}
          <path
            d="M510 89L398 149"
            stroke="#d0a13d"
            strokeWidth="4"
            fill="none"
            markerEnd={`url(#${plateId}-arrow)`}
          />
          <text x="550" y="115">
            الضوء
          </text>
        </g>
        <g className="plate-gases">
          <path
            d="M146 132H282"
            stroke="#7c8e75"
            strokeWidth="4"
            markerEnd={`url(#${plateId}-arrow)`}
          />
          <text x="154" y="103">
            ثاني أكسيد الكربون
          </text>
          <path
            d="M410 184H567"
            stroke="#438c81"
            strokeWidth="4"
            markerEnd={`url(#${plateId}-arrow)`}
          />
          <text x="550" y="165">
            الأكسجين
          </text>
        </g>
        <rect x="434" y="226" width="190" height="45" rx="13" fill="#d8e9c7" />
        <text x="529" y="255">
          يتكوّن الغذاء
        </text>
      </svg>
      <div className="plate-tabs" role="group" aria-label="تتبع البناء الضوئي">
        <button
          aria-pressed={part === "water"}
          onClick={() => setPart("water")}
        >
          <Droplets size={18} /> الماء
        </button>
        <button
          aria-pressed={part === "light"}
          onClick={() => setPart("light")}
        >
          <Sun size={18} /> الضوء
        </button>
        <button
          aria-pressed={part === "gases"}
          onClick={() => setPart("gases")}
        >
          <Leaf size={18} /> الغازات
        </button>
      </div>
      <figcaption aria-live="polite">{details[part]}</figcaption>
    </figure>
  );
}
function StarchChallenge({
  done,
  onDone,
  reduced,
}: {
  done: boolean;
  onDone: () => void;
  reduced: boolean;
}) {
  const [sample, setSample] = useDraftState("nutrition-lugol-sample", 1),
    [t, setT] = useDraftState("nutrition-lugol-time", 0),
    [running, setRunning] = useState(false),
    [choice, setChoice] = useDraftState("nutrition-lugol-choice", "");
  const feedback = useActivityFeedback(),
    sound = useSound(),
    awarded = useRef(done);
  // This short explanatory test uses the same timings as the full Lugol laboratory.
  useProgress(
    running,
    setT,
    () => setRunning(false),
    reduced,
    (before, after) => {
      if ([0.34, 0.41, 0.48].some((x) => before < x && after >= x))
        sound.play("drop");
      if (before < 1 && after >= 1) sound.play("discover");
    },
  );
  return (
    <section className="starch-challenge" data-sound-scope="custom">
      <p className="science-safety">تجربة افتراضية؛ لا تستخدم كواشف حقيقية.</p>
      <div className="sample-selector" role="group" aria-label="اختر العينة">
        <button
          aria-pressed={sample === 1}
          onClick={() => {
            setSample(1);
            setT(0);
            setRunning(false);
            setChoice("");
            feedback.reset();
            sound.play("select");
          }}
        >
          عينة نشا
        </button>
        <button
          aria-pressed={sample === 0}
          onClick={() => {
            setSample(0);
            setT(0);
            setRunning(false);
            setChoice("");
            feedback.reset();
            sound.play("select");
          }}
        >
          عينة ماء
        </button>
      </div>
      <ScientificScene
        id="iodine"
        t={t}
        value={sample && t > 0.5 ? (t - 0.5) / 0.25 : 0}
        vars={{ starch: sample, iodine: t >= 0.25 ? 1 : 0 }}
        compact
      />
      <div className="activity-controls">
        <button
          className="primary"
          onClick={() => {
            setT(0);
            setRunning(true);
            setChoice("");
            feedback.reset();
            sound.play("start");
          }}
          disabled={running}
        >
          <FlaskConical size={17} /> أضف لوغول
        </button>
        <button
          onClick={() => {
            setT(0);
            setRunning(false);
            setChoice("");
            feedback.reset();
            sound.play("move");
          }}
        >
          <RotateCcw size={17} /> أعد التجربة
        </button>
      </div>
      {t >= 1 && (
        <>
          <h3>ما الذي يدل عليه اللون؟</h3>
          <div className="classification-options">
            <button
              aria-pressed={choice === "starch"}
              onClick={() => setChoice("starch")}
            >
              كُشف عن نشا
            </button>
            <button
              aria-pressed={choice === "none"}
              onClick={() => setChoice("none")}
            >
              لم يُكشف نشا
            </button>
          </div>
          <button
            disabled={!choice}
            onClick={() => {
              const correct = choice === (sample ? "starch" : "none");
              if (correct) {
                if (!awarded.current) {
                  awarded.current = true;
                  feedback.check(true, onDone);
                  reinforcement("correct");
                } else feedback.check(true);
              } else {
                feedback.check(false);
                reinforcement("retry");
              }
            }}
          >
            تحقق من استنتاجك
          </button>
        </>
      )}
      <ActivityFeedback
        status={feedback.status}
        celebrating={feedback.celebrating}
        reduced={reduced}
      />
    </section>
  );
}
function useProgress(
  running: boolean,
  set: (v: number | ((t: number) => number)) => void,
  finish: () => void,
  reduced: boolean,
  cue: (before: number, after: number) => void,
) {
  useEffect(() => {
    if (!running) return;
    let value = 0;
    const timer = setInterval(
      () => {
        const before = value;
        value = Math.min(1, value + (reduced ? 0.25 : 0.05));
        set(value);
        cue(before, value);
        if (value >= 1) {
          clearInterval(timer);
          finish();
        }
      },
      reduced ? 500 : 90,
    );
    return () => clearInterval(timer);
  }, [running, reduced]);
}
export function AnimalComparison() {
  return (
    <figure className="animal-infographic">
      <div>
        <SpecimenArt kind="rabbit" label="أرنب يتغذى على الأعشاب" />
        <span>نباتي</span>
        <strong>آكل أعشاب</strong>
      </div>
      <div>
        <SpecimenArt kind="meat" label="غذاء من مصدر حيواني" />
        <span>حيواني</span>
        <strong>آكل لحوم</strong>
      </div>
      <div>
        <SpecimenArt kind="human" label="إنسان يتناول مصادر نباتية وحيوانية" />
        <span>نباتي + حيواني</span>
        <strong>قارت</strong>
      </div>
    </figure>
  );
}
