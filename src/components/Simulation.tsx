import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  FlaskConical,
  Eye,
  Check,
} from "lucide-react";
import type { Scene } from "../data/lessons";
import { simulate, type Variables } from "../engine/models";
export function Simulation({
  scene,
  reduced,
  onWatch,
  onExperiment,
  watched,
  experimented,
}: {
  scene: Scene;
  reduced: boolean;
  onWatch: () => void;
  onExperiment: () => void;
  watched: boolean;
  experimented: boolean;
}) {
  const defaults = () =>
    Object.fromEntries(scene.variables.map((v) => [v.key, v.initial]));
  const [vars, setVars] = useState<Variables>(defaults);
  const [mode, setMode] = useState<"watch" | "try">("watch");
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [changed, setChanged] = useState(false);
  const [logged, setLogged] = useState(false);
  const [conclusion, setConclusion] = useState("");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (!running || reduced) return;
    const timer = window.setInterval(
      () => setT((p) => Math.min(1, p + 0.015 * speed)),
      100,
    );
    return () => clearInterval(timer);
  }, [running, speed, reduced]);
  useEffect(() => {
    if (t >= 1 && running) {
      setRunning(false);
      if (mode === "watch") onWatch();
    }
  }, [t, running, mode, onWatch]);
  const effective =
    mode === "watch"
      ? {
          ...vars,
          ...(scene.id === "iodine" ? { iodine: t >= 0.25 ? 1 : 0 } : {}),
          ...(scene.id === "metabolism" ? { build: t < 0.5 ? 1 : 0 } : {}),
          ...(scene.variables.some((v) => v.key === "time")
            ? {
                time:
                  scene.id === "age"
                    ? t * 80
                    : scene.id === "phototropism"
                      ? 3
                      : 100,
              }
            : {}),
        }
      : vars;
  const result = simulate(scene.id, effective, t);
  const step = Math.min(
    scene.stages.length - 1,
    Math.floor(t * scene.stages.length),
  );
  const active = t > 0;
  function reset() {
    setRunning(false);
    setT(0);
    setLogged(false);
    setConclusion("");
    setFeedback("");
  }
  return (
    <section className="simulation card">
      <div className="section-head">
        <div>
          <span className="eyebrow">مختبر تفاعلي · نموذج نوعي مبسط</span>
          <h2>{scene.title}</h2>
        </div>
        <FlaskConical size={26} />
      </div>
      <div className="segmented">
        <button
          className={mode === "watch" ? "selected" : ""}
          onClick={() => {
            reset();
            setMode("watch");
            setVars(defaults());
          }}
        >
          <Eye size={16} /> شاهد المحاكاة {watched && "✓"}
        </button>
        <button
          className={mode === "try" ? "selected" : ""}
          onClick={() => {
            reset();
            setMode("try");
            setChanged(false);
          }}
        >
          <FlaskConical size={16} /> جرّب بنفسك {experimented && "✓"}
        </button>
      </div>
      <div className="lab-layout">
        <div className="lab-visual">
          <ScientificDrawing
            id={scene.id}
            vars={effective}
            t={t}
            value={result.value}
            reduced={reduced}
          />
          <span className="time-label">
            {Math.round(t * 100)}% · زمن افتراضي مسرّع
          </span>
        </div>
        <div className="lab-panel">
          <span className="pill">
            الخطوة {step + 1} / {scene.stages.length}
          </span>
          <h3>{scene.stages[step]}</h3>
          <p>{result.detail}</p>
          {mode === "try" ? (
            <div className="variables">
              {scene.variables.map((v) => (
                <label key={v.key}>
                  <span>
                    {v.label}{" "}
                    <b>
                      {vars[v.key]} {v.unit}
                    </b>
                  </span>
                  <input
                    type="range"
                    min={v.min}
                    max={v.max}
                    step="1"
                    value={vars[v.key]}
                    onChange={(e) => {
                      setVars({ ...vars, [v.key]: +e.target.value });
                      setChanged(true);
                      setLogged(false);
                      setConclusion("");
                      setFeedback("");
                      setT(0);
                      setRunning(false);
                    }}
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="muted">
              راقب الحركة وتسلسل المراحل، ثم انتقل إلى التجريب لتغيير الظروف.
            </p>
          )}
          <div className="lab-result" aria-live="polite">
            <b>
              {active ? result.label : "اضغط تشغيل أو الخطوة التالية للبدء"}
            </b>
            <div className="meter">
              <i style={{ width: `${result.value * 100}%` }} />
            </div>
            <small>مؤشر توضيحي نسبي، وليس قياسًا مخبريًا.</small>
          </div>
        </div>
      </div>
      <div className="simulation-controls">
        <button
          className="primary"
          onClick={() => {
            if (t >= 1) setT(0);
            setRunning(!running);
          }}
          disabled={reduced}
        >
          {running ? <Pause size={17} /> : <Play size={17} />}{" "}
          {running ? "إيقاف مؤقت" : "تشغيل"}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            const next = Math.min(
              1,
              (Math.floor(t * scene.stages.length) + 1) / scene.stages.length,
            );
            setT(next);
            if (next === 1 && mode === "watch") onWatch();
          }}
        >
          <SkipForward size={17} /> خطوة تالية
        </button>
        <button
          aria-label="إعادة ضبط المحاكاة"
          onClick={() => {
            reset();
            setVars(defaults());
            setChanged(false);
          }}
        >
          <RotateCcw size={17} /> إعادة
        </button>
        <label className="speed">
          السرعة{" "}
          <select value={speed} onChange={(e) => setSpeed(+e.target.value)}>
            <option value="0.5">½×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
          </select>
        </label>
      </div>
      {reduced && (
        <p className="hint">
          تقليل الحركة مفعل: استخدم «خطوة تالية» لمشاهدة الحالات دون حركة
          مستمرة.
        </p>
      )}
      {mode === "try" && (
        <div className="experiment-notes">
          <h3>دفتر المستكشف</h3>
          <p>غيّر متغيرًا، ثم شغّل النموذج حتى النهاية وسجل ملاحظتك.</p>
          <button disabled={!changed || t < 1} onClick={() => setLogged(true)}>
            <Check size={16} /> تسجيل الملاحظة
          </button>
          {logged && (
            <>
              <p className="hint">
                الملاحظة: {result.label}. {result.detail}
              </p>
              <label>
                ما الاستنتاج المناسب؟
                <select
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                >
                  <option value="">اختر استنتاجًا</option>
                  <option value="model">
                    {result.label}. هذه نتيجة نوعية من نموذج مبسط وليست قياسًا
                    مخبريًا.
                  </option>
                  <option value="exact">
                    النتيجة قياس دقيق لكل كائن في الطبيعة.
                  </option>
                  <option value="time">
                    زمن المحاكاة يساوي الزمن الحقيقي دائمًا.
                  </option>
                </select>
              </label>
              <button
                className="primary"
                onClick={() => {
                  if (conclusion === "model") {
                    onExperiment();
                    setFeedback("أحسنت، سُجلت التجربة والاستنتاج.");
                  } else
                    setFeedback(
                      "راجع: زمن العرض مسرع والنتائج نوعية. حاول مجددًا.",
                    );
                }}
                disabled={!conclusion}
              >
                اعتماد الاستنتاج
              </button>
            </>
          )}
          {feedback && (
            <p role="status" className="hint">
              {feedback}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
function ScientificDrawing({
  id,
  vars: v,
  t,
  value,
  reduced,
}: {
  id: string;
  vars: Variables;
  t: number;
  value: number;
  reduced: boolean;
}) {
  const raw = ["cell", "budding", "fission", "urine", "sexual"].includes(id)
    ? value
    : t;
  const k = reduced ? Math.round(raw * 4) / 4 : raw;
  const move = k * 280;
  const plant = [
    "photo",
    "growth",
    "response",
    "vegetative",
    "transpiration",
    "phototropism",
  ].includes(id);
  const cells = ["cell", "budding", "fission", "metabolism"].includes(id);
  const text = (x: number, y: number, label: string) => (
    <text x={x} y={y} textAnchor="middle" className="svg-label">
      {label}
    </text>
  );
  return (
    <svg
      viewBox="0 0 560 340"
      role="img"
      aria-label={`حالة المحاكاة: ${Math.round(t * 100)} بالمئة`}
    >
      <defs>
        <linearGradient id="labBg" x2="0" y2="1">
          <stop stopColor="#e8f3ee" />
          <stop offset="1" stopColor="#d5e8df" />
        </linearGradient>
        <linearGradient id="water" x2="0" y2="1">
          <stop stopColor="#a2cfdf" />
          <stop offset="1" stopColor="#66a9c4" />
        </linearGradient>
      </defs>
      <rect width="560" height="340" rx="24" fill="url(#labBg)" />
      <path d="M20 300H540" stroke="#b5cbbb" strokeWidth="2" />
      {plant && (
        <g>
          {id === "phototropism" && (
            <>
              <path
                d="M145 300V55H395V300"
                fill="#c1aa80"
                fillOpacity=".35"
                stroke="#ad966b"
                strokeWidth="6"
              />
              <path
                d={v.side ? "M144 95v45" : "M396 95v45"}
                stroke="#f7e6a6"
                strokeWidth="9"
              />
              {text(275, 35, "صندوق بفتحة جانبية")}
              {text(275, 335, `${v.time} أيام افتراضية`)}
            </>
          )}
          {id !== "transpiration" && (
            <g transform={`translate(${v.side ? 70 : 440} 40)`}>
              <circle r="24" fill="#efc76a" />
              {Array.from({ length: 8 }, (_, i) => (
                <path
                  key={i}
                  transform={`rotate(${i * 45})`}
                  d="M0-33v-12"
                  stroke="#efc76a"
                  strokeWidth="3"
                  opacity={id === "photo" && !v.light ? 0.15 : 1}
                />
              ))}
            </g>
          )}
          <path d="M225 277l12 48h70l12-48z" fill="#bd8e6a" />
          {id === "vegetative" && v.method === 1 ? (
            <>
              <path
                d={`M269 278Q${280 + value * 100} 160 393 276`}
                fill="none"
                stroke="#5b8863"
                strokeWidth="9"
              />
              <path d="M375 282h49" stroke="#aa8a5b" strokeWidth="20" />
              {value > 0.5 && (
                <path
                  d="M395 277l-6 33m6-33 10 29"
                  stroke="#9c835e"
                  strokeWidth="3"
                />
              )}
            </>
          ) : (
            <>
              <path
                d={`M272 279Q${id === "response" || id === "phototropism" ? (v.side ? 260 - value * 80 : 280 + value * 80) : 270} 170 272 ${id === "growth" ? 260 - value * 155 : 105}`}
                stroke="#508263"
                strokeWidth="9"
                fill="none"
              />
              {[0, 1, 2, 3].map((i) => (
                <g
                  key={i}
                  transform={`translate(272 ${id === "growth" ? 260 - value * (40 + i * 28) : 233 - i * 35}) scale(${id === "growth" ? 0.3 + value * 0.7 : 1})`}
                >
                  <ellipse
                    cx={i % 2 ? -27 : 27}
                    cy="-8"
                    rx="34"
                    ry="13"
                    transform={`rotate(${i % 2 ? 28 : -28})`}
                    fill={i % 2 ? "#67966e" : "#80a979"}
                  />
                </g>
              ))}
            </>
          )}
          {id === "photo" && (
            <>
              <path
                d="M272 306v-68"
                stroke="#6fbbd0"
                strokeWidth="4"
                strokeDasharray="7 8"
              />
              {v.water > 0 && (
                <circle cx="272" cy={310 - k * 115} r="7" fill="#4e9abb" />
              )}
              {v.co2 > 0 && (
                <circle cx={90 + k * 170} cy="158" r="9" fill="#b1a38c" />
              )}
              {v.light > 0 && (
                <path
                  d={`M420 80L${430 - k * 135} ${80 + k * 57}`}
                  stroke="#dfb24d"
                  strokeWidth="4"
                />
              )}
              {value > 0.5 && (
                <g>
                  <circle
                    cx={300 + value * 100}
                    cy={160 - value * 80}
                    r="9"
                    fill="#e7f6f5"
                  />
                  {text(427, 72, "أكسجين")}
                </g>
              )}
              {text(83, 142, "ثاني أكسيد الكربون")}
              {text(310, 320, "ماء")}
              {value > 0.75 && text(276, 80, "غذاء")}
            </>
          )}
          {id === "transpiration" && (
            <>
              <path
                d="M155 290V126a117 117 0 0 1 234 0v164"
                fill="#fff"
                fillOpacity=".18"
                stroke="#91b6b0"
                strokeWidth="5"
              />
              {Array.from({ length: Math.floor(value * 25) }, (_, i) => (
                <path
                  key={i}
                  d={`M${175 + i * 7} ${94 + (i % 4) * 26}q-7 13 0 15q7-2 0-15`}
                  fill="#7eb4c2"
                />
              ))}
              {v.covered > 0 && (
                <path d="M220 278h105" stroke="#666f66" strokeWidth="7" />
              )}
              {text(440, 135, "ناقوس شفاف")}
              {text(452, 165, "بخار ← قطرات")}
            </>
          )}
          {id === "vegetative" && v.method === 2 && (
            <g>
              <path d="M272 260V215" stroke="#a58c66" strokeWidth="19" />
              <path
                d={`M272 217l${value * 25} -${30 + value * 55}`}
                stroke="#6a956d"
                strokeWidth="7"
              />
              <path d="M257 223h30m-30 8h30" stroke="#e1d5aa" strokeWidth="5" />
              {text(420, 235, "أصل + طعم متوافق")}
            </g>
          )}
          {id === "vegetative" && v.method === 0 && value > 0.2 && (
            <path
              d={`M319 285q30-${value * 150} 52-9`}
              stroke="#6d9b70"
              strokeWidth="7"
              fill="none"
            />
          )}
          {id === "response" && v.kind === 1 && (
            <g>
              <ellipse cx="274" cy="140" rx="68" ry="35" fill="#fff" />
              <circle cx="274" cy="140" r={28 - k * 18} fill="#426a64" />
              {text(275, 70, "تضيق الحدقة")}
            </g>
          )}
          {id === "growth" && text(100, 70, "أسابيع وأشهر افتراضية")}
        </g>
      )}
      {["iodine", "yeast"].includes(id) && (
        <g>
          {[170, 370].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x - 27} 115v155q0 35 54 0V115`}
                fill="none"
                stroke="#8baba7"
                strokeWidth="5"
              />
              <path
                d={`M${x - 23} 230v39q23 25 46 0v-39z`}
                fill={
                  id === "iodine" && i === 0 && value > 0.1
                    ? "#3a3a69"
                    : id === "respiration" && i === 0 && value > 0.2
                      ? "#f6f4df"
                      : "url(#water)"
                }
              />
              {text(x, 325, i ? "أنبوب ضابط" : "أنبوب تجريبي")}
              {id === "yeast" && (
                <>
                  <path
                    d={`M${x - 25} 109h50`}
                    stroke="#b69d72"
                    strokeWidth="8"
                  />
                  <ellipse
                    cx={x}
                    cy={i ? 92 : 98 - value * 50}
                    rx={i ? 14 : 14 + value * 40}
                    ry={i ? 17 : 17 + value * 48}
                    fill={i ? "#c8cbd3" : "#d79e8c"}
                    opacity=".9"
                  />
                  {!i &&
                    Array.from({ length: Math.floor(value * 10) }, (_, j) => (
                      <circle
                        key={j}
                        cx={x - 12 + (j % 3) * 12}
                        cy={250 - ((j * 13 + k * 22) % 100)}
                        r="3"
                        fill="#fff"
                      />
                    ))}
                </>
              )}
              {id === "respiration" && !i && (
                <>
                  <path
                    d="M166 110v-37h120v88"
                    fill="none"
                    stroke="#75978e"
                    strokeWidth="5"
                  />
                  <circle cx="287" cy={180 - k * 40} r="5" fill="#ecf6ef" />
                  {text(290, 50, "ثاني أكسيد الكربون")}
                </>
              )}
            </g>
          ))}
          {id === "iodine" && (
            <>
              <path d="M135 50h55l-15 35-10 13-10-13z" fill="#a57a4b" />
              <path
                d={`M165 ${100 + k * 95}q-6 10 0 13q6-3 0-13`}
                fill="#a57a4b"
                opacity={v.iodine ? 1 : 0}
              />
              {text(370, 85, "ماء للمقارنة")}
              {text(165, 32, "لوغول افتراضي")}
            </>
          )}
          {id === "yeast" && text(276, 35, "التخمر: الغاز يتجمع في البالون")}
        </g>
      )}
      {id === "respiration" && (
        <g>
          {[115, 280, 445].map((x, i) => (
            <g key={i}>
              {i < 2 && (
                <>
                  <path
                    d={`M${x - 62} 273V123a62 62 0 0 1 124 0v150`}
                    fill={i === 0 ? "#53675c" : "#ffffff"}
                    fillOpacity={i === 0 ? ".7" : ".15"}
                    stroke="#8daea1"
                    strokeWidth="3"
                  />
                  {(i === 1 || v.living > 0) && (
                    <>
                      <path
                        d={`M${x - 15} 246V139`}
                        stroke="#619367"
                        strokeWidth="5"
                      />
                      <path
                        d={`M${x - 15} 192q-38-25-38-43q37 0 38 43m0-25q35-28 40-40q-34-8-40 40`}
                        fill="#75a67b"
                      />
                      <path d={`M${x - 38} 244h48l-8 29h-32z`} fill="#bd9972" />
                    </>
                  )}
                </>
              )}
              <path
                d={`M${x + 20} 220v44q17 17 34 0v-44`}
                stroke="#86aaa5"
                strokeWidth="3"
                fill={i === 0 && value > 0.3 ? "#f2f1db" : "#a8d1d1"}
              />
              {i === 0 && value > 0.1 && (
                <circle cx={x + 36} cy={220 - k * 55} r="5" fill="#d7e2d3" />
              )}
              {text(
                x,
                309,
                ["نبات في الظلام", "نبات مضاء للمقارنة", "ماء جير معرض للهواء"][
                  i
                ],
              )}
            </g>
          ))}
          {text(280, 35, "تعكر ماء الجير دليل على ثاني أكسيد الكربون")}
        </g>
      )}
      {id === "mold" && (
        <g>
          {[155, 380].map((x, i) => (
            <g key={x}>
              <rect
                x={x - 68}
                y="112"
                width="136"
                height="132"
                rx="35"
                fill="#b9916b"
              />
              <rect
                x={x - 60}
                y="117"
                width="120"
                height="117"
                rx="30"
                fill="#e4d2a6"
              />
              {Array.from(
                { length: Math.floor((i ? 0.12 : value) * 60) },
                (_, j) => (
                  <circle
                    key={j}
                    cx={x - 45 + ((j * 23) % 90)}
                    cy={135 + ((j * 17) % 75)}
                    r={3 + (j % 5)}
                    fill={j % 2 ? "#70846c" : "#566e64"}
                  />
                ),
              )}
              {text(x, 278, i ? "مقارنة: بارد وجاف" : "العينة وفق اختياراتك")}
            </g>
          ))}
          {text(280, 65, `${v.days} أيام افتراضية`)}
        </g>
      )}
      {cells && (
        <g>
          {id === "metabolism" ? (
            <>
              {Array.from({ length: 6 }, (_, i) => {
                const spread = v.build ? 1 - k : k;
                return (
                  <circle
                    key={i}
                    cx={280 + Math.cos((i * Math.PI) / 3) * (25 + spread * 110)}
                    cy={166 + Math.sin((i * Math.PI) / 3) * (25 + spread * 85)}
                    r="19"
                    fill={i % 2 ? "#d5ad6f" : "#7ca69b"}
                    stroke="#fff"
                    strokeWidth="3"
                  />
                );
              })}
              {text(
                280,
                280,
                v.build ? "طاقة تدخل ← بناء" : "هدم → طاقة متحررة",
              )}
            </>
          ) : (
            <>
              <ellipse
                cx={260 - k * 55}
                cy="170"
                rx={65 - k * 12}
                ry="70"
                fill="#aacbb6"
                stroke="#6a9980"
                strokeWidth="4"
              />
              <circle cx={260 - k * 55} cy="170" r="19" fill="#748b9f" />
              <ellipse
                cx={id === "budding" ? 312 + k * 35 : 260 + k * 70}
                cy={id === "budding" ? 150 : 170}
                rx={id === "budding" ? 8 + k * 40 : Math.max(1, k * 58)}
                ry={id === "budding" ? 10 + k * 42 : Math.max(1, k * 70)}
                fill="#b8d8be"
                stroke="#6a9980"
                strokeWidth="4"
              />
              {k > 0.4 && (
                <circle
                  cx={id === "budding" ? 312 + k * 35 : 260 + k * 70}
                  cy={id === "budding" ? 150 : 170}
                  r={k * 17}
                  fill="#748b9f"
                />
              )}
              {text(
                280,
                290,
                id === "budding"
                  ? "برعم صغير ← نمو ← انفصال"
                  : "استعداد ← تخصر ← خليتان",
              )}
            </>
          )}
        </g>
      )}
      {id.startsWith("micro") && (
        <g>
          <circle
            cx="280"
            cy="165"
            r="139"
            fill="#e8f4ef"
            stroke="#7eaaa5"
            strokeWidth="12"
          />
          <g
            transform={`translate(${180 + move * 0.55 + (v.pan - 50) * 0.5} ${165 + Math.sin(k * 8) * 30}) scale(${0.5 + (v.zoom ?? 2) * 0.25})`}
          >
            {v.organism === 0 ? (
              <>
                <ellipse
                  rx="49"
                  ry="24"
                  fill="#9cbcb1"
                  stroke="#5b8d84"
                  strokeWidth="2"
                />
                {Array.from({ length: 20 }, (_, i) => {
                  const a = (i * Math.PI) / 10;
                  return (
                    <path
                      key={i}
                      d={`M${Math.cos(a) * 48} ${Math.sin(a) * 24}l${Math.cos(a) * 10 + Math.sin(k * 40 + i) * 4} ${Math.sin(a) * 10}`}
                      stroke="#5b8d84"
                      strokeWidth="2"
                    />
                  );
                })}
              </>
            ) : v.organism === 1 ? (
              <>
                <ellipse rx="49" ry="16" fill="#79a379" />
                <path
                  d={`M45 0q35 ${Math.sin(k * 40) * 35} 65 0t45 0`}
                  fill="none"
                  stroke="#668d62"
                  strokeWidth="3"
                />
              </>
            ) : (
              <path
                d={`M-50-10Q-30-55 0-20Q${50 + k * 25}-60 55-5Q90 35 20 27Q-20 65-32 20Q-80 25-50-10`}
                fill="#b8c3a5"
                stroke="#7c9e82"
                strokeWidth="3"
              />
            )}
            <circle r="9" fill="#697f8c" />
          </g>
          {text(
            280,
            327,
            ["أهداب قصيرة كثيرة", "سوط طويل", "أقدام كاذبة مؤقتة"][
              v.organism ?? 0
            ],
          )}
        </g>
      )}
      {id === "environment" && (
        <g>
          <path
            d="M30 230Q160 160 280 235T530 220V320H30Z"
            fill={value > 0.5 ? "#9ca28a" : "#7dbbc5"}
          />
          <path d="M50 90h100v90H50z" fill="#c6b99b" />
          <path
            d="M130 160h60v55"
            fill="none"
            stroke="#8c9484"
            strokeWidth="15"
          />
          {Array.from({ length: Math.floor(value * 15) }, (_, i) => (
            <circle
              key={i}
              cx={190 + i * 18}
              cy={220 + Math.sin(i) * 15}
              r="8"
              fill="#8d8865"
            />
          ))}
          {[340, 410, 480].map((x) => (
            <g key={x}>
              <path d={`M${x} 200v-60`} stroke="#7e9462" strokeWidth="6" />
              <ellipse
                cx={x}
                cy="137"
                rx="27"
                ry={22 - value * 12}
                fill={value > 0.5 ? "#a6a06c" : "#699a69"}
              />
            </g>
          ))}
          {text(280, 50, "منع المصدر + معالجة سليمة + حماية الوادي")}
          {text(280, 300, "ماء وتربة ومزروعات")}
        </g>
      )}
      {id === "sexual" && (
        <g>
          <path d="M280 255V140" stroke="#759768" strokeWidth="7" />
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse
              key={i}
              cx="280"
              cy="109"
              rx="23"
              ry="36"
              fill="#d9ac9d"
              transform={`rotate(${i * 72} 280 140)`}
            />
          ))}
          <circle cx="280" cy="140" r="22" fill="#dfbd78" />
          {v.gametes > 0 && (
            <>
              <circle cx={100 + k * 180} cy="200" r="12" fill="#86b6c7" />
              <circle cx={450 - k * 170} cy="200" r="16" fill="#be98af" />
            </>
          )}
          {k > 0.7 && v.gametes > 0 && (
            <ellipse cx="280" cy="220" rx="20" ry="13" fill="#b39b65" />
          )}
          {text(100, 250, "مشيج ذكري")}
          {text(450, 250, "مشيج أنثوي")}
          {text(
            280,
            300,
            k > 0.7 ? "إخصاب ثم تكوّن بذور" : "نموذج مبسط للتكاثر الجنسي",
          )}
        </g>
      )}
      {id === "age" && (
        <g>
          <path d="M55 280H505" stroke="#b0bd9e" strokeWidth="5" />
          {["طفولة", "مراهقة", "رشد", "شيخوخة"].map((label, i) => {
            const selected =
              (v.time < 10 ? 0 : v.time < 20 ? 1 : v.time < 60 ? 2 : 3) === i;
            const x = 95 + i * 120;
            const height = [68, 110, 135, 118][i];
            return (
              <g key={label} opacity={selected ? 1 : 0.35}>
                <circle cx={x} cy={260 - height} r="17" fill="#b79d78" />
                <path
                  d={`M${x} ${280 - height}v${height - 45}m0-${height - 55}l-23 30m23-30 23 30M${x} 235l-18 40m18-40 18 40`}
                  fill="none"
                  stroke="#658a78"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {text(x, 315, label)}
              </g>
            );
          })}
          {text(
            280,
            45,
            `العمر في العرض: ${Math.round(v.time)} سنة · الحدود تقريبية`,
          )}
        </g>
      )}
      {id === "urine" && (
        <g>
          <path d="M245 70v130M315 70v130" stroke="#bc8884" strokeWidth="12" />
          <path
            d="M218 75q-65-36-64 45t64 15q-28-29 0-60M342 75q65-36 64 45t-64 15q28-29 0-60"
            fill="#b77b79"
          />
          <path
            d="M208 132q-2 71 45 117M352 132q2 71-45 117"
            stroke="#c4aa6b"
            strokeWidth="8"
            fill="none"
          />
          <ellipse cx="280" cy="255" rx="44" ry="31" fill="#d3b983" />
          <path d="M280 282v30" stroke="#b6a370" strokeWidth="10" />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={i % 2 ? 351 : 209}
              cy={135 + ((k * 105 + i * 25) % 110)}
              r="5"
              fill="#e9c95c"
            />
          ))}
          {text(103, 90, "الكلية")}
          {text(426, 180, "الحالب")}
          {text(380, 262, "المثانة")}
          {text(357, 311, "الإحليل")}
        </g>
      )}
      {id === "sweat" && (
        <g>
          <path
            d="M178 110q20-60 60-25v135q-76 25-67-42zM322 85q40-35 60 25l7 68q9 67-67 42z"
            fill="#c6918a"
          />
          <path
            d="M280 45v88m0-20-44 34m44-34 44 34"
            stroke="#a9bcb3"
            strokeWidth="13"
            fill="none"
          />
          {Array.from({ length: Math.floor(value * 20) }, (_, i) => (
            <circle
              key={i}
              cx={100 + ((i * 31) % 360)}
              cy={250 - ((i * 13 + k * 100) % 190)}
              r="5"
              fill="#7daec1"
            />
          ))}
          {text(280, 285, "الرئتان والجلد · إخراج وتبريد")}
        </g>
      )}
      {id === "reflex" && (
        <g>
          <path
            d="M180 70l80 105"
            stroke="#b6a58d"
            strokeWidth="40"
            strokeLinecap="round"
          />
          <g transform={`rotate(${-value * 38} 260 175)`}>
            <path
              d="M260 175v115l65 10"
              stroke="#c8b69e"
              strokeWidth="34"
              strokeLinecap="round"
            />
          </g>
          <circle cx="260" cy="175" r="22" fill="#dfc9b0" />
          <path
            d={`M${380 - k * 90} 155l-30 15`}
            stroke="#6b8e88"
            strokeWidth="12"
          />
          {text(390, 110, "مؤثر افتراضي")}
          {text(185, 35, "مستقبل ← مسار شوكي ← عضلة")}
          {text(280, 330, "مشاهدة آمنة فقط")}
        </g>
      )}
    </svg>
  );
}
