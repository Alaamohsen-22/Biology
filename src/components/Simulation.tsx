import { useDraft, useDraftState } from "../engine/drafts";
import {
  labProtocols,
  simulationCue,
  labObjectives,
  initialLabMaterials,
} from "../data/labProtocols";
import { LabTool } from "./LabTool";
import { soundManager } from "../engine/sound";
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
  const [draft, setDraft] = useDraft(`lab-${scene.id}`, {
    prediction: "",
    observation: "",
    inference: "",
    explained: false,
  });
  const [toolHint, setToolHint] = useState("");
  const [toolStep, setToolStep] = useDraftState(`scene-${scene.id}-tools`, 0);
  const [vars, setVars] = useDraftState<Variables>(
    `scene-${scene.id}-vars`,
    defaults(),
  );
  useEffect(() => () => soundManager.stop(), []);
  const [mode, setMode] = useDraftState<"watch" | "try">(
    `scene-${scene.id}-mode`,
    "watch",
  );
  const [t, setT] = useDraftState(`scene-${scene.id}-time`, 0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useDraftState(`scene-${scene.id}-speed`, 1);
  const [changed, setChanged] = useDraftState(
    `scene-${scene.id}-changed`,
    false,
  );
  const [logged, setLogged] = useDraftState(`scene-${scene.id}-logged`, false);
  const [conclusion, setConclusion] = useDraftState(
    `scene-${scene.id}-conclusion`,
    "",
  );
  const [feedback, setFeedback] = useDraftState(
    `scene-${scene.id}-feedback`,
    "",
  );
  const [preview, setPreview] = useDraftState(
    `scene-${scene.id}-preview`,
    false,
  );
  const [completedRun, setCompletedRun] = useDraftState(
    `scene-${scene.id}-completed-run`,
    false,
  );
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
  const effective: Variables =
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
  const result = simulate(
    scene.id,
    effective,
    scene.id === "iodine" ? Math.max(0, (t - 0.5) / 0.25) : t,
  );
  const step = Math.max(
    0,
    Math.min(scene.stages.length - 1, Math.ceil(t * scene.stages.length) - 1),
  );
  const cueTime = useRef(0);
  useEffect(() => {
    if (!running) {
      cueTime.current = t;
      return;
    }
    if (scene.id === "iodine") {
      const cues = [0.34, 0.41, 0.48, 0.7].filter(
        (at) => at > cueTime.current && at <= t,
      );
      if (cues.length && effective.iodine)
        sound.play(cues[cues.length - 1] === 0.7 ? "discover" : "drop");
    } else if (t >= 1 && cueTime.current < 1) sound.play("discover");
    cueTime.current = t;
  }, [t, running, scene.id, effective.iodine]);
  const previousStage = useRef(0);
  useEffect(() => {
    if (
      running &&
      scene.id !== "iodine" &&
      step > 0 &&
      step !== previousStage.current
    ) {
      if (scene.id !== "yeast" || result.value > 0.02)
        sound.play(simulationCue(scene.id, t, effective));
    }
    previousStage.current = step;
  }, [step, running, scene.id]);
  const reset = () => {
    setToolStep(0);
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
    onHint?.(
      `غيّرت ${scene.variables.find((v) => v.key === key)?.label ?? "عاملًا"} في ${scene.title}. قارن الرسم قبل التغيير وبعده، ثم شغّل التجربة لتختبر تفسيرك.`,
    );
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
    setT(0);
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
    sound.play(
      t >= (scene.stages.length - 1) / scene.stages.length
        ? "discover"
        : "step",
    );
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
    onHint?.(
      `في تجربة ${scene.title}، راقب المرحلة الحالية وحدد ما ينتقل أو يتغير قبل وصف السبب.`,
    );
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
      onFocusCapture={() =>
        onHint?.(
          `تجربة ${scene.title}: اختر عاملًا واحدًا، وسجل ما تراه لتبني استنتاجك.`,
        )
      }
    >
      <div className="section-head">
        <div>
          <span className="eyebrow">مختبر الحياة</span>
          <h2>{scene.title}</h2>
          <p className="lab-objective">{labObjectives[scene.id]}</p>
        </div>
        <FlaskConical size={28} />
      </div>
      <details className="inquiry-note">
        <summary>توقعي قبل التجربة · اختياري</summary>
        <label className="lab-prediction">
          أتوقع: ماذا سيحدث عند تغيير أحد عوامل هذه التجربة؟
          <textarea
            maxLength={800}
            value={draft.prediction}
            onChange={(e) =>
              setDraft((d) => ({ ...d, prediction: e.target.value }))
            }
            placeholder="أتوقع أن… لأن…"
          />
        </label>
      </details>
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
            setVars({ ...defaults(), ...initialLabMaterials[scene.id] });
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
        <p aria-live="polite">
          {mode === "try" && scene.id.startsWith("micro")
            ? [
                "أجهز العينة المختارة.",
                "ألاحظ شكل الجسم وزوائده.",
                "أراقب الحركة وتغير الموضع.",
                "أقارن وسيلة الدفع.",
              ][step]
            : scene.stages[step]}
        </p>
        <span
          className={`play-state ${running ? "running" : ""}`}
          role="status"
        >
          {preview
            ? "معاينة الإعدادات"
            : running
              ? reduced
                ? "المشاهدة تعمل"
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
        {t > 0 && (
          <button className="embroidered-nav previous" onClick={previous}>
            <SkipBack size={18} />
            خطوة سابقة
          </button>
        )}
        {t < 1 && (
          <button className="embroidered-nav next primary" onClick={next}>
            <SkipForward size={18} />
            خطوة تالية
          </button>
        )}
        <button
          aria-label="إعادة ضبط المحاكاة"
          onClick={() => {
            reset();
            setVars(
              mode === "try"
                ? { ...defaults(), ...initialLabMaterials[scene.id] }
                : defaults(),
            );
            setChanged(false);
            sound.play("move");
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
      {mode === "try" && (
        <div className="experiment-tools">
          {" "}
          <div className="section-head">
            <h3>أدوات التجربة</h3>
            <span className="pill">غيّر عاملًا واحدًا وقارن</span>
          </div>
          <div className="lab-tools">
            {labProtocols[scene.id].map((action, i) => (
              <button
                key={action.label}
                className={i < toolStep ? "used-tool" : ""}
                onClick={() => {
                  setVars((v) => ({ ...v, ...action.patch }));
                  setChanged(true);
                  setT(0);
                  setLogged(false);
                  setCompletedRun(false);
                  setConclusion("");
                  setFeedback("");
                  setPreview(false);
                  reported.current = false;
                  started.current = false;
                  activity.reset();
                  setToolStep(i + 1);
                  sound.play(action.sound);
                  onHint?.(
                    `${action.label}: راقب ما يتغير وقارن بالتجربة السابقة.`,
                  );
                  if (i === labProtocols[scene.id].length - 1) {
                    started.current = true;
                    setRunning(true);
                  } else setRunning(false);
                }}
              >
                <LabTool type={action.tool} />
                <span>{action.label}</span>
                {i < toolStep && <b>✓</b>}
              </button>
            ))}
          </div>
          <h3>غيّر ظروف التجربة</h3>
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
        </div>
      )}
      <button
        className="lab-hint"
        onClick={() => {
          const hint = `في ${scene.title} غيّر ${scene.variables[0].label} فقط، ثم قارن بين البداية والنهاية.`;
          setToolHint(hint);
          onHint?.(hint);
          sound.play("tool");
        }}
      >
        أعطني تلميحًا للتجربة
      </button>
      {toolHint && (
        <p className="hint" role="status">
          {toolHint}
        </p>
      )}
      <progress
        className="lab-progress"
        max={1}
        value={t}
        aria-label="تقدم التجربة"
      />
      <details className="experiment-information">
        <summary>معلومات التجربة</summary>
        <p>{result.detail}</p>
        <p>
          الجسيمات والمسارات والأسهم تمثيلات تعليمية لعمليات مجهرية؛ لا تُرى
          بهذه الصورة بالعين المجردة. النتائج للمقارنة والتفسير، لا لقياس مخبري
          دقيق.
        </p>
        <p>
          الزمن مضغوط في تجارب النمو والعفن والنتح والتكاثر والدبال. عند تقليل
          الحركة تُعرض حالات متباعدة.
        </p>
      </details>
      {t >= 1 && (
        <p className="lab-result" role="status">
          {result.label}
        </p>
      )}
      <details className="inquiry-note">
        <summary>ملاحظاتي وتفسيري · اختياري</summary>
        <div className="lab-observations">
          <label>
            ماذا لاحظت في هذه التجربة؟
            <textarea
              maxLength={800}
              value={draft.observation}
              onChange={(e) =>
                setDraft((d) => ({ ...d, observation: e.target.value }))
              }
            />
          </label>
          <label>
            ما استنتاجك من المقارنة؟
            <textarea
              maxLength={800}
              value={draft.inference}
              onChange={(e) =>
                setDraft((d) => ({ ...d, inference: e.target.value }))
              }
            />
          </label>
          <button
            onClick={() => {
              setDraft((d) => ({ ...d, explained: !d.explained }));
              sound.play("check");
            }}
          >
            اكتشف التفسير العلمي
          </button>
          {draft.explained && (
            <p className="hint">
              {t >= 1
                ? `${result.label}. ${result.detail}`
                : "نفّذ التجربة أولًا، ثم قارن النتيجة بتوقعك."}
            </p>
          )}
        </div>
      </details>
      {mode === "watch" ? (
        <p className="lab-instruction">
          شاهد ماذا يحدث، ثم جرّب أدوات التجربة بنفسك.
        </p>
      ) : (
        <div className="experiment-workbench">
          {preview && (
            <p className="hint">تم إعداد الأدوات. ابدأ التجربة لترى النتيجة.</p>
          )}
          <div className="experiment-notes">
            <h3>دفتر المستكشف</h3>
            <p>
              غيّر متغيرًا، ثم شغّل النموذج حتى النهاية وسجل ملاحظتك واستنتاجك.
            </p>
            {(!changed || !completedRun) && (
              <p className="muted">
                غيّر عاملًا وشغّل التجربة حتى النهاية لتسجيل الملاحظة.
              </p>
            )}
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
                      {result.label}. أستند إلى ما شاهدته في المقارنة.
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
                    onHint?.(
                      correct
                        ? `أحسنت في تجربة ${scene.title}! راجع الدليل الذي اعتمدت عليه، ثم قارن بإعداد آخر.`
                        : `راجع الملاحظة في تجربة ${scene.title}. هل استندت إلى ما شاهدته أم افترضت قياسًا لم تنفذه؟`,
                    );
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
