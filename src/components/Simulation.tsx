import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  FlaskConical,
  Eye,
  Check,
} from "lucide-react";
import type { Scene } from "../data/lessons";
import { simulate, type Variables } from "../engine/models";
import { ScientificScene } from "./science/ScientificScene";
import { useSound } from "./SoundSystem";
import { ActivityFeedback, useActivityFeedback } from "./ActivityFeedback";
export function Simulation({
  scene,
  reduced,
  onWatch,
  onExperiment,
  watched,
  experimented,
  onHint,
}: {
  scene: Scene;
  reduced: boolean;
  onWatch: () => void;
  onExperiment: () => void;
  watched: boolean;
  experimented: boolean;
  onHint?: (tip: string) => void;
}) {
  const defaults = () =>
    Object.fromEntries(
      scene.variables.map((v) => [
        v.key,
        v.key === "time" && v.initial === 0 && v.max === 100 ? 100 : v.initial,
      ]),
    );
  const [vars, setVars] = useState<Variables>(defaults);
  const [mode, setMode] = useState<"watch" | "try">("watch");
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [changed, setChanged] = useState(false);
  const [logged, setLogged] = useState(false);
  const [conclusion, setConclusion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [preview, setPreview] = useState(false);
  const [completedRun, setCompletedRun] = useState(false);
  const started = useRef(false);
  const reported = useRef(false);
  const sound = useSound();
  const activity = useActivityFeedback();
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(
      () =>
        setT((p) =>
          Math.min(
            1,
            reduced
              ? (Math.floor(p * scene.stages.length + 0.00001) + 1) /
                  scene.stages.length
              : p + 0.006 * speed,
          ),
        ),
      reduced ? 1600 / speed : 60,
    );
    return () => window.clearInterval(timer);
  }, [running, speed, reduced, scene.stages.length]);
  useEffect(() => {
    if (t < 1 || !started.current || reported.current) return;
    reported.current = true;
    setRunning(false);
    setCompletedRun(true);
    if (mode === "watch") onWatch();
  }, [t, mode, onWatch]);
  const effective =
    mode === "watch"
      ? {
          ...vars,
          __watch: 1,
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
      : {
          ...vars,
          ...(scene.id === "age" ? { time: (vars.time ?? 0) * t } : {}),
        };
  const result = simulate(scene.id, effective, t);
  const step = Math.max(
    0,
    Math.min(scene.stages.length - 1, Math.ceil(t * scene.stages.length) - 1),
  );
  const previousStage = useRef(0);
  useEffect(() => {
    if (running && step > 0 && step !== previousStage.current) {
      sound.play(
        ["photo", "urine", "transpiration", "sweat"].includes(scene.id)
          ? "water"
          : "step",
      );
    }
    previousStage.current = step;
  }, [step, running, scene.id]);
  const reset = () => {
    setRunning(false);
    setT(0);
    setLogged(false);
    setConclusion("");
    setFeedback("");
    setPreview(false);
    setCompletedRun(false);
    started.current = false;
    reported.current = false;
    activity.reset();
  };
  const setVariable = (key: string, value: number) => {
    onHint?.(`غيّرت ${scene.variables.find(v => v.key === key)?.label ?? "عاملًا"} في ${scene.title}. قارن الرسم قبل التغيير وبعده، ثم شغّل التجربة لتختبر تفسيرك.`);
    setVars((previous) => ({ ...previous, [key]: value }));
    setChanged(true);
    setLogged(false);
    setConclusion("");
    setFeedback("");
    setRunning(false);
    setPreview(true);
    setCompletedRun(false);
    started.current = false;
    reported.current = false;
    setT(1);
    activity.reset();
    sound.play(
      ["water", "moisture", "covered", "plant"].includes(key)
        ? "water"
        : "tool",
    );
  };
  const next = () => {
    setRunning(false);
    setPreview(false);
    started.current = true;
    setT((p) =>
      Math.min(
        1,
        (Math.floor(p * scene.stages.length + 0.00001) + 1) /
          scene.stages.length,
      ),
    );
    sound.play("step");
  };
  const previous = () => {
    setRunning(false);
    setPreview(false);
    setT((p) =>
      Math.max(
        0,
        (Math.ceil(p * scene.stages.length - 0.00001) - 1) /
          scene.stages.length,
      ),
    );
    sound.play("step");
  };
  const play = () => {
    onHint?.(`في تجربة ${scene.title}، راقب المرحلة الحالية وحدد ما ينتقل أو يتغير قبل وصف السبب.`);
    sound.play(running ? "click" : "start");
    if (running) {
      setRunning(false);
      return;
    }
    if (t >= 1) {
      setT(0);
      setCompletedRun(false);
      reported.current = false;
    }
    setPreview(false);
    started.current = true;
    setRunning(true);
  };
  return (
    <section
      className="simulation card simulation-v2"
      data-sound-scope="custom"
      aria-label={scene.title}
      onFocusCapture={() => onHint?.(`تجربة ${scene.title}: اختر عاملًا واحدًا، وسجل ما تراه لتبني استنتاجك.`)}
    >
      <div className="section-head">
        <div>
          <span className="eyebrow">مختبر الحياة · ملاحظة، ثم تجربة</span>
          <h2>{scene.title}</h2>
        </div>
        <FlaskConical size={28} />
      </div>
      <div className="segmented" role="group" aria-label="وضع المحاكاة">
        <button
          aria-pressed={mode === "watch"}
          className={mode === "watch" ? "selected" : ""}
          onClick={() => {
            reset();
            setMode("watch");
            setVars(defaults());
            sound.play("select");
          }}
        >
          <Eye size={18} />
          شاهد المحاكاة {watched && "✓"}
        </button>
        <button
          aria-pressed={mode === "try"}
          className={mode === "try" ? "selected" : ""}
          onClick={() => {
            reset();
            setMode("try");
            setVars(defaults());
            setChanged(false);
            sound.play("select");
          }}
        >
          <FlaskConical size={18} />
          جرّب بنفسك {experimented && "✓"}
        </button>
      </div>
      <div className="lab-step-header">
        <span className="pill">
          الخطوة {step + 1} / {scene.stages.length}
        </span>
        <p aria-live="polite">{scene.stages[step]}</p>
        <span
          className={`play-state ${running ? "running" : ""}`}
          role="status"
        >
          {preview
            ? "معاينة الإعدادات"
            : running
              ? reduced
                ? "عرض تلقائي بمراحل ثابتة"
                : "المحاكاة تعمل"
              : t >= 1
                ? "انتهى العرض"
                : t > 0
                  ? "متوقفة مؤقتًا"
                  : "جاهزة للتشغيل"}
        </span>
      </div>
      <div className="lab-visual">
        <ScientificScene
          id={scene.id}
          vars={effective}
          t={t}
          value={result.value}
        />
      </div>
      <div className="simulation-controls">
        <button className="primary" onClick={play}>
          {running ? <Pause size={18} /> : <Play size={18} />}{" "}
          {running ? "إيقاف مؤقت" : t > 0 && t < 1 ? "استئناف" : "تشغيل"}
        </button>
        <button className="embroidered-nav previous" onClick={previous} disabled={t <= 0}>
          <SkipBack size={18} />
          خطوة سابقة
        </button>
        <button className="embroidered-nav next primary" onClick={next} disabled={t >= 1}>
          <SkipForward size={18} />
          خطوة تالية
        </button>
        <button
          aria-label="إعادة ضبط المحاكاة"
          onClick={() => {
            reset();
            setVars(defaults());
            setChanged(false);
            sound.play("step");
          }}
        >
          <RotateCcw size={18} />
          إعادة المحاكاة
        </button>
        <label className="speed">
          السرعة
          <select
            value={speed}
            onChange={(e) => {
              setSpeed(+e.target.value);
              sound.play("select");
            }}
          >
            <option value="0.5">½×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
          </select>
        </label>
      </div>
      <div className="lab-timeline" aria-label="تقدم مراحل العرض">
        {scene.stages.map((stage, i) => (
          <span
            key={stage}
            className={
              t >= (i + 1) / scene.stages.length
                ? "complete"
                : i === step
                  ? "current"
                  : ""
            }
          >
            <b>{i + 1}</b>
            <small>{stage}</small>
          </span>
        ))}
      </div>
      <span className="time-label">
        {Math.round(t * 100)}% · زمن افتراضي مسرّع
      </span>
      {reduced && (
        <p className="hint">
          تقليل الحركة مفعل: زر التشغيل يعرض المراحل تلقائيًا على فترات واضحة،
          دون حركة مستمرة. جميع أدوات التجربة والصوت مستقلة عن هذا الإعداد.
        </p>
      )}
      <div className="lab-information">
        <div className="lab-result" aria-live="polite">
          <b>
            {t > 0
              ? result.label
              : "الحالة الابتدائية — اضغط تشغيل لمتابعة الظاهرة"}
          </b>
          <div className="meter">
            <i style={{ width: `${result.value * 100}%` }} />
          </div>
          <small>مؤشر تعليمي نوعي، وليس قياسًا مخبريًا.</small>
        </div>
        <p>{result.detail}</p>
      </div>
      {mode === "watch" ? (
        <p className="lab-instruction">
          راقب انتقال المواد والتغير في الرسم. يمكنك التوقف أو العودة خطوة، ثم
          الانتقال إلى «جرّب بنفسك» للتحكم في التجربة.
        </p>
      ) : (
        <div className="experiment-workbench">
          <div className="section-head">
            <h3>أدواتك ومتغيراتك</h3>
            <span className="pill">غيّر عاملًا واحدًا وقارن</span>
          </div>
          <div className="variables">
            {scene.variables.map((v) => (
              <label key={v.key}>
                <span>
                  {v.label}
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
                  onChange={(e) => setVariable(v.key, +e.target.value)}
                />
                {v.max <= 2 && (
                  <div className="variable-choices">
                    {Array.from({ length: v.max + 1 }, (_, n) => (
                      <button
                        key={n}
                        aria-label={`${v.label}: ${n}`}
                        aria-pressed={vars[v.key] === n}
                        onClick={() => setVariable(v.key, n)}
                      >
                        {v.max === 1
                          ? n
                            ? "متاح / مفعّل"
                            : "غير متاح / متوقف"
                          : n}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            ))}
          </div>
          {preview && (
            <p className="hint">
              يتغير الرسم فورًا لمعاينة اختيارك. اضغط تشغيل أو أعد المحاكاة ثم
              تابعها حتى النهاية لتسجيل تجربة جديدة.
            </p>
          )}
          <div className="experiment-notes">
            <h3>دفتر المستكشف</h3>
            <p>
              غيّر متغيرًا، ثم شغّل النموذج حتى النهاية وسجل ملاحظتك واستنتاجك.
            </p>
            <button
              disabled={!changed || !completedRun}
              onClick={() => {
                setLogged(true);
                sound.play("tool");
              }}
            >
              <Check size={18} />
              تسجيل الملاحظة
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
                    onChange={(e) => {
                      setConclusion(e.target.value);
                      sound.play("select");
                    }}
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
                  disabled={!conclusion || activity.status === "correct"}
                  onClick={() => {
                    const correct = conclusion === "model";
                    activity.check(correct, () => onExperiment());
                    setFeedback(
                      correct
                        ? "أحسنت، سُجلت التجربة والاستنتاج."
                        : "راجع: الزمن مسرع والنتائج نوعية. حاول مجددًا.",
                    );
                  }}
                >
                  اعتماد الاستنتاج
                </button>
              </>
            )}
            {feedback && <p className="hint">{feedback}</p>}
            <ActivityFeedback
              status={activity.status}
              celebrating={activity.celebrating}
              reduced={reduced}
            />
          </div>
        </div>
      )}
    </section>
  );
}
