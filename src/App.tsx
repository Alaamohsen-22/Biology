import { OliveOrchardIntro } from "./components/OliveOrchardIntro";
import { NutritionDiscovery } from "./components/NutritionDiscovery";
import { PalestinianGuide } from "./components/PalestinianGuide";
import { IslandSound } from "./components/IslandSound";
import { useDraft } from "./engine/drafts";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  Map,
  BookOpen,
  Trophy,
  Settings,
  HelpCircle,
  ArrowLeft,
  Lock,
  Star,
  CheckCircle2,
  Flag,
  Menu,
  X,
  Leaf,
  Home,
  Download,
  Upload,
  Printer,
  ChevronLeft,
  Compass,
} from "lucide-react";
import {
  lessons,
  stages,
  bank,
  finalBank,
  alignment,
  type Lesson,
} from "./data/lessons";
import {
  initialProgress,
  emptyLesson,
  parseProgress,
  isMastered,
  lessonCompletion,
  support,
  type Progress,
  type LessonProgress,
} from "./engine/progress";
import { IslandArt } from "./components/Island";
import { TeacherAudio } from "./components/Audio";
import { AmbientMusic } from "./components/AmbientMusic";
import { Quiz } from "./components/Quiz";
import {
  Matching,
  Ordering,
  Formative,
  UrinaryAssembly,
} from "./components/Activities";
import { Simulation } from "./components/Simulation";
import { Project } from "./components/Project";

import assets from "./data/assets.json";
import {
  SoundPreferences,
  SoundNotice,
  SoundSettings,
  interfaceClick,
} from "./components/SoundSystem";
import { ObservationPreview } from "./components/ObservationPreview";
type SettingsData = {
  dark: boolean;
  contrast: boolean;
  reduced: boolean;
  font: number;
  sound: boolean;
  volume: number;
  threshold: number;
};
const SETTINGS = "life-island-settings-v1",
  SAVE = "life-island-progress-v1";
const defaultSettings: SettingsData = {
  dark: false,
  contrast: false,
  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  font: 100,
  sound: true,
  volume: 70,
  threshold: 70,
};
function getProgress() {
  try {
    const raw = localStorage.getItem(SAVE);
    return raw ? parseProgress(JSON.parse(raw)) : initialProgress();
  } catch {
    return initialProgress();
  }
}
function getSettings() {
  try {
    const r = JSON.parse(localStorage.getItem(SETTINGS) || "null");
    if (!r) return defaultSettings;
    return {
      ...defaultSettings,
      dark: r.dark === true,
      contrast: r.contrast === true,
      reduced:
        typeof r.reduced === "boolean" ? r.reduced : defaultSettings.reduced,
      font: [90, 100, 110, 120, 130].includes(r.font) ? r.font : 100,
      sound: r.sound !== false,
      volume:
        typeof r.volume === "number" && r.volume >= 0 && r.volume <= 100
          ? r.volume
          : 70,
      threshold:
        typeof r.threshold === "number" &&
        r.threshold >= 50 &&
        r.threshold <= 100
          ? r.threshold
          : 70,
    };
  } catch {
    return defaultSettings;
  }
}
export default function App() {
  const [progress, setProgress] = useState<Progress>(getProgress);
  const [settings, setSettings] = useState<SettingsData>(getSettings);
  const [page, setPage] = useState("cover");
  const [active, setActive] = useState(1);
  const [tab, setTab] = useState(0);
  const [hintState, setHintState] = useState({key: "", tip: ""});
  const hintKey = `${page}-${active}-${tab}`;
  const discoveryHint = hintState.key === hintKey ? hintState.tip : "";
  const setDiscoveryHint = useCallback((tip: string) => setHintState({key: hintKey, tip}), [hintKey]);
  useEffect(() => { const scroll = document.getElementById("learning-scroll"); if(scroll) scroll.scrollTop = 0; }, [page, active, tab]);
  const [stagesOpen, setStagesOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState(progress.name);
  const [finalAttempt, setFinalAttempt] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const mastered = useMemo(
    () =>
      lessons.filter((l) =>
        isMastered(
          progress.lessons[l.id],
          settings.threshold,
          l.scenes.map((s) => s.id),
        ),
      ),
    [progress, settings.threshold],
  );
  const all = mastered.length === 7;
  const certificate =
    all &&
    (progress.final ?? 0) >= settings.threshold &&
    (progress.project ?? 0) >= settings.threshold;
  const previousMastered = useRef(mastered.length);
  useEffect(() => {
    if (mastered.length > previousMastered.current && !settings.reduced) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 1800);
      previousMastered.current = mastered.length;
      return () => clearTimeout(timer);
    }
    previousMastered.current = mastered.length;
  }, [mastered.length, settings.reduced]);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE, JSON.stringify(progress));
    } catch {
      setNotice("تعذر الحفظ المحلي. صدّر نسخة من لوحة المتابعة قبل المغادرة.");
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.dark ? "dark" : "light";
    document.documentElement.dataset.contrast = String(settings.contrast);
    document.documentElement.dataset.reduced = String(settings.reduced);
    document.documentElement.style.fontSize = `${settings.font}%`;
    try {
      localStorage.setItem(SETTINGS, JSON.stringify(settings));
    } catch {
      setNotice("تعذر حفظ الإعدادات.");
    }
  }, [settings]);
  const go = (next: string) => {
    setPage(next);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const patchLesson = useCallback(
    (
      id: number,
      patch: Partial<LessonProgress> | ((p: LessonProgress) => LessonProgress),
    ) =>
      setProgress((prev) => {
        const old = prev.lessons[id] ?? emptyLesson();
        const next =
          typeof patch === "function" ? patch(old) : { ...old, ...patch };
        return { ...prev, lessons: { ...prev.lessons, [id]: next } };
      }),
    [],
  );
  const openLesson = (id: number) => {
    setActive(id);
    setTab(0);
    go("lesson");
  };
  const nav = [
    { id: "map", label: "خريطة الجزيرة", icon: Map },
    { id: "dashboard", label: "رحلة إنجازي", icon: Trophy },
    { id: "project", label: "مهمة الدبال", icon: Leaf },
    { id: "final", label: "تحدي الوحدة", icon: Flag },
    { id: "guide", label: "دليل المستكشف", icon: HelpCircle },
  ];
  const lesson = lessons[active - 1];
  const lp = progress.lessons[active] ?? emptyLesson();
  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "life-island-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div
      className="app"
      onClickCapture={(event) => interfaceClick(event.target)}
    >
      <SoundPreferences enabled={settings.sound} volume={settings.volume} />
      <a className="skip-link" href="#main">
        تجاوز إلى المحتوى
      </a>
      <header className="site-header">
        <button
          className="brand"
          onClick={() => go("cover")}
          aria-label="حديقة أسرار الحياة، الغلاف"
        >
          <span className="brand-symbol">
            <Leaf size={25} />
          </span>
          <span>
            حديقة أسرار الحياة<small>علوم نكتشفها… وحياة نفهمها</small>
          </span>
        </button>
        <nav
          className={mobile ? "main-nav open" : "main-nav"}
          aria-label="القائمة الرئيسية"
        >
          {nav.map((n) => (
            <button
              key={n.id}
              aria-current={page === n.id ? "page" : undefined}
              className={page === n.id ? "active" : ""}
              onClick={() => go(progress.name ? n.id : "name")}
            >
              <n.icon size={17} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="إعدادات العرض والمعلمة"
            onClick={() => setModal(true)}
          >
            <Settings size={21} />
          </button>
          {progress.name && (
            <span className="student-chip">
              {progress.name.slice(0, 1)}
              <span>{progress.name}</span>
            </span>
          )}
          <button
            className="icon-button mobile-menu"
            aria-label={mobile ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="learning-scroll" id="learning-scroll">
      <main id="main" tabIndex={-1}>
        <SoundNotice />
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button aria-label="إغلاق التنبيه" onClick={() => setNotice("")}>
              <X size={17} />
            </button>
          </div>
        )}
        {page === "cover" && (
          <>
            <div className="cover">
              <div className="cover-copy">
                <div className="eyebrow">
                  <span className="flag-mark" /> المنهاج الفلسطيني · الصف السابع
                  الأساسي
                </div>
                <h1>
                  حديقة
                  <br />
                  <em>أسرار الحياة</em>
                  <br />
                  <span>كل كائن حيّ… يخفي سرًّا.</span>
                </h1>
                <p className="cover-description">
                  أهلًا بك في <b>حديقة أسرار الحياة</b>.<br />
                  سبع محطات، تجارب بين يديك، ومغامرة تبدأ بسؤال.
                </p>
                <div className="cover-actions">
                  <button
                    className="primary large"
                    onClick={() => go(progress.name ? "map" : "name")}
                  >
                    {progress.name ? "أكمل مغامرتك" : "ابدأ المغامرة"}
                    <ArrowLeft size={20} />
                  </button>
                  <button className="text-button" onClick={() => go("guide")}>
                    كيف نخوض المغامرة؟
                    <BookOpen size={18} />
                  </button>
                </div>
                <p className="slogan">اكتشف، جرّب، تعلّم، وانطلق!</p>
                <div className="teacher-signature">
                  <div className="portrait-frame">
                    {assets.teacherPortrait ? (
                      <img
                        src={
                          (import.meta.env?.BASE_URL ?? "/Biology/") +
                          assets.teacherPortrait
                        }
                        alt="المعلمة آلاء محسن كلاب"
                      />
                    ) : (
                      <Leaf aria-label="إطار الزيتون المخصص للصورة الأصلية" />
                    )}
                  </div>
                  <div>
                    <small>إعداد المعلمة</small>
                    <b>أ. آلاء محسن كلاب</b>
                    {!assets.teacherPortrait && (
                      <small>الصورة الأصلية بانتظار الإضافة</small>
                    )}
                  </div>
                </div>
                <TeacherAudio
                  text="مرحبًا بك في حديقة أسرار الحياة! سنكتشف خصائص الكائنات الحية بالملاحظة والتجريب والتفكير."
                  enabled={settings.sound}
                />
                <AmbientMusic enabled={settings.sound} />
              </div>
              <div className="cover-art">
                <div className="floating-label top">
                  <span>✦</span> مغامرة علمية بروح فلسطينية
                </div>
                <IslandArt />
                <div className="floating-label bottom">
                  <span>🌱</span>
                  <div>
                    <b>من بذرة صغيرة… إلى أسرار كبيرة</b>
                    <small>الوحدة الأولى · خصائص الكائنات الحية</small>
                  </div>
                </div>
                <span className="art-coordinate">PALESTINE · 31.9° N</span>
              </div>
            </div>
            <div className="intro-strip">
              <div>
                <b>٧</b>
                <span>محطات للاستكشاف</span>
              </div>
              <div>
                <FlaskIcon />
                <span>شاهد، ثم جرّب بنفسك</span>
              </div>
              <div>
                <Star />
                <span>إتقان حقيقي… وإنجاز يستحق</span>
              </div>
              <div>
                <Leaf />
                <span>تعلم من بيئتنا الفلسطينية</span>
              </div>
            </div>
            <section className="start-section">
              <div>
                <span className="eyebrow">مسار واحد، اكتشافات كثيرة</span>
                <h2>ماذا يجعل الكائن حيًّا؟</h2>
              </div>
              <p>
                من الغذاء الذي يمنحه الطاقة، إلى الاستجابة والتكاثر… كل محطة
                تكشف جزءًا من حكاية الحياة.
              </p>
            </section>
            <div className="preview-stations">
              {lessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() =>
                    progress.name ? openLesson(l.id) : go("name")
                  }
                >
                  <span style={{ background: l.color + "20" }}>{l.icon}</span>
                  <small>المحطة {l.id}</small>
                  <b>{l.title}</b>
                  <ChevronLeft size={17} />
                </button>
              ))}
            </div>
          </>
        )}
        {page === "name" && (
          <section className="name-card card">
            <span className="big-emoji">🧭</span>
            <h1>لكل مستكشف اسم</h1>
            <p>بماذا نناديك في رحلتك؟ يكفي اسمك الأول أو اسم تختاره.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) {
                  setProgress({ ...progress, name: name.trim().slice(0, 40) });
                  go("map");
                }
              }}
            >
              <label htmlFor="student-name">اسم المستكشف</label>
              <input
                id="student-name"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك هنا"
                required
                autoComplete="off"
              />
              <button className="primary large" disabled={!name.trim()}>
                إلى الجزيرة <ArrowLeft size={18} />
              </button>
            </form>
            <small>
              يُحفظ الاسم والتقدم على هذا المتصفح فقط، ولا ينتقلان تلقائيًا بين
              الأجهزة.
            </small>
          </section>
        )}
        {page === "map" && <IslandSound enabled={settings.sound && settings.volume > 0} />}
        {page === "map" && (
          <>
            <header className="page-heading split">
              <div>
                <span className="eyebrow">خريطة المستكشف</span>
                <h1>
                  أهلًا {progress.name}،<br />
                  أي سرّ سنكتشف اليوم؟
                </h1>
                <p>كل المحطات متاحة منذ البداية. اختر ما تود استكشافه بحرية.</p>
              </div>
              <div className="progress-badge">
                <Compass size={32} />
                <strong>
                  {mastered.length}
                  <small> / ٧</small>
                </strong>
                <span>محطات متقنة</span>
              </div>
            </header>
            <div className="map-layout">
              <div className="adventure-map">
                <IslandArt compact />
                <svg
                  className="map-path"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M23 28Q53 12 72 29T55 50T24 65T64 78T76 53"
                    fill="none"
                    stroke="#fff7d6"
                    strokeWidth="1"
                    strokeDasharray="2 1"
                  />
                </svg>
                {lessons.map((l, i) => {
                  const positions = [
                    [23, 28],
                    [48, 22],
                    [72, 29],
                    [60, 49],
                    [24, 65],
                    [50, 78],
                    [76, 53],
                  ];
                  const done = mastered.some((m) => m.id === l.id);
                  return (
                    <button
                      className={`map-pin ${done ? "done" : ""}`}
                      style={{
                        left: `${positions[i][0]}%`,
                        top: `${positions[i][1]}%`,
                      }}
                      key={l.id}
                      onClick={() => openLesson(l.id)}
                      aria-label={`المحطة ${l.id} ${l.title}: ${done ? "متقنة" : "متاحة"}`}
                    >
                      <span>{l.icon}</span>
                      <b>
                        {l.id}. {l.title}
                      </b>
                      <small>
                        {done
                          ? "★★★"
                          : `${lessonCompletion(
                              progress.lessons[l.id],
                              l.scenes.map((s) => s.id),
                              settings.threshold,
                            )}%`}
                      </small>
                    </button>
                  );
                })}
              </div>
              <aside className="map-sidebar">
                <h2>دفتر الرحلة</h2>
                <div className="meter">
                  <i style={{ width: `${(mastered.length / 7) * 100}%` }} />
                </div>
                <p>
                  {Math.round((mastered.length / 7) * 100)}% من الدروس متقنة
                </p>
                {lessons.map((l) => (
                  <button
                    className="station-list-row"
                    key={l.id}
                    onClick={() => openLesson(l.id)}
                  >
                    <span>{l.icon}</span>
                    <div>
                      <b>{l.title}</b>
                      <small>
                        {l.place} ·{" "}
                        {lessonCompletion(
                          progress.lessons[l.id],
                          l.scenes.map((s) => s.id),
                          settings.threshold,
                        )}
                        %
                      </small>
                    </div>
                    {mastered.some((m) => m.id === l.id) ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <ChevronLeft size={18} />
                    )}
                  </button>
                ))}
                <p className="hint">
                  معيار الإتقان {settings.threshold}%، مع إتمام التجارب والأنشطة
                  والتقويم التكويني.
                </p>
              </aside>
            </div>
            <div className="next-adventure">
              <Leaf />
              <div>
                <h3>مهمتك الكبرى تنتظرك</h3>
                <p>
                  يمكنك استكشاف مهمة الدبال واختبار الوحدة الآن، أو العودة
                  إليهما لاحقًا.
                </p>
              </div>
              <button onClick={() => go("project")}>
                استعرض المهمة <ArrowLeft size={17} />
              </button>
            </div>
          </>
        )}
        {page === "lesson" && (
          <>
            <header
              className="lesson-heading"
              style={{ "--lesson-color": lesson.color } as React.CSSProperties}
            >
              <button className="text-button" onClick={() => go("map")}>
                <Map size={17} /> العودة للخريطة
              </button>
              <span className="eyebrow">
                المحطة {lesson.id} · {lesson.place}
              </span>
              <h1>
                <span>{lesson.icon}</span>
                {lesson.title}
              </h1>
              <p>
                المسار{" "}
                {lp.pre === undefined
                  ? "سيُحدد بعد الاختبار القبلي"
                  : support(lp.pre)}{" "}
                ·{" "}
                {mastered.some((l) => l.id === active)
                  ? "محطة متقنة"
                  : "اكتشاف جارٍ"}
              </p>
            </header>
            <div className="lesson-layout">
              <button className="stage-toggle" aria-expanded={stagesOpen} onClick={() => setStagesOpen(!stagesOpen)}>مراحل الدرس · {stages[tab]}</button>
              <aside className={`lesson-tabs ${stagesOpen ? "expanded" : ""}`} aria-label="مراحل الدرس">
                {stages.map((s, i) => (
                  <button
                    key={s}
                    aria-current={tab === i ? "step" : undefined}
                    className={tab === i ? "active" : ""}
                    onClick={() => { setTab(i); setStagesOpen(false); }}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </button>
                ))}
              </aside>
              <div className="lesson-content">
                {tab === 0 && active === 1 && <OliveOrchardIntro enabled={settings.sound && settings.volume > 0} reduced={settings.reduced} teacherText={lesson.story} onBack={()=>go("map")} onPre={()=>setTab(1)}/>}
                {tab === 0 && active !== 1 && (
                  <section className="card story-card">
                    <span className="big-emoji">{lesson.icon}</span>
                    <span className="eyebrow">سؤال تبدأ به المغامرة</span>
                    <h2>{lesson.place}</h2>
                    <p>{lesson.story}</p>
                    <TeacherAudio
                      lesson={active}
                      section="intro"
                      text={lesson.story}
                      enabled={settings.sound}
                    />
                    <button className="primary" onClick={() => setTab(1)}>
                      لنكشف معرفتك السابقة <ArrowLeft size={17} />
                    </button>
                  </section>
                )}
                {tab === 1 && (
                  <>
                    {lp.pre !== undefined && (
                      <p className="hint">
                        النتيجة المسجلة: {lp.pre}%. المسار: {support(lp.pre)}.
                        يمكنك إعادة التشخيص؛ لا يدخل ضمن درجة الإتقان.
                      </p>
                    )}
                    <Quiz
                      threshold={settings.threshold}
                      key={`pre-${active}`}
                      title={`قبل الاستكشاف: ${lesson.title}`}
                      questions={bank(lesson, "pre")}
                      pre
                      onFinish={(value) => patchLesson(active, { pre: value })}
                    />
                  </>
                )}
                {tab === 2 && (
                  <section>
                    <span className="eyebrow">
                      في نهاية هذه المحطة ستتمكن من…
                    </span>
                    <h2>أهداف رحلتك</h2>
                    <div className="goal-grid">
                      {lesson.goals.map((g, i) => (
                        <div key={g} className="card">
                          <span className="goal-number">0{i + 1}</span>
                          <p>{g}</p>
                          <small>
                            ترتبط بالشرح والمختبر وتقويم الهدف {i + 1}.
                          </small>
                        </div>
                      ))}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => go("teacher")}
                    >
                      عرض جدول مواءمة الأهداف والأنشطة
                    </button>
                  </section>
                )}
                {tab === 3 && (active === 1 ? <NutritionDiscovery onHint={setDiscoveryHint} /> : <Explore key={active} lesson={lesson} />)}
                {tab === 4 && (
                  <>
                    <h2>نفهم السر خطوة بخطوة</h2>
                    {lesson.concepts.map((c, i) => (
                      <article className="card concept" key={c.title}>
                        <span className="goal-number">0{i + 1}</span>
                        <h3>{c.title}</h3>
                        <p>{c.text}</p>
                        <div className="example">
                          <Leaf size={17} />
                          {c.example}
                        </div>
                      </article>
                    ))}
                    {lp.pre !== undefined && lp.pre < 40 && (
                      <div className="hint">
                        <h3>دعم إضافي</h3>
                        <p>
                          اقرأ فكرة واحدة في كل مرة. حدد المثال، وشاهد المحاكاة
                          بسرعة نصفية، ثم غيّر عاملًا واحدًا فقط.
                        </p>
                      </div>
                    )}
                    <TeacherAudio
                      lesson={active}
                      section="explanation"
                      text={lesson.concepts.map((c) => c.text).join(" ")}
                      enabled={settings.sound}
                    />
                  </>
                )}
                {tab === 5 && (
                  <>
                    <TeacherAudio
                      lesson={active}
                      section="simulation"
                      text="شاهد التسلسل أولًا، ثم جرّب تغيير عامل واحد، وشغّل النموذج وسجّل ملاحظتك واستنتاجك."
                      enabled={settings.sound}
                    />
                    {lesson.scenes.map((s) => (
                      <Simulation
                        key={`${active}-${s.id}`}
                        scene={s}
                        onHint={setDiscoveryHint}
                        reduced={settings.reduced}
                        watched={lp.watched.includes(s.id)}
                        experimented={lp.experimented.includes(s.id)}
                        onWatch={() =>
                          patchLesson(active, (p) => ({
                            ...p,
                            watched: [...new Set([...p.watched, s.id])],
                          }))
                        }
                        onExperiment={() =>
                          patchLesson(active, (p) => ({
                            ...p,
                            experimented: [
                              ...new Set([...p.experimented, s.id]),
                            ],
                          }))
                        }
                      />
                    ))}
                  </>
                )}
                {tab === 6 && (
                  <>
                    <TeacherAudio
                      lesson={active}
                      section="activity"
                      text="طابق الأمثلة بالمفاهيم ثم رتب المراحل. عند الخطأ استخدم التلميح ثم حاول مجددًا."
                      enabled={settings.sound}
                    />
                    {active === 5 && (
                      <UrinaryAssembly
                        done={lp.activities.includes("assemble")}
                        onDone={() =>
                          patchLesson(active, (p) => ({
                            ...p,
                            activities: [
                              ...new Set([...p.activities, "assemble"]),
                            ],
                          }))
                        }
                      />
                    )}
                    <Matching
                      key={`match-${active}`}
                      lesson={lesson}
                      done={lp.activities.includes("match")}
                      onDone={() =>
                        patchLesson(active, (p) => ({
                          ...p,
                          activities: [...new Set([...p.activities, "match"])],
                        }))
                      }
                    />
                    <Ordering
                      key={`order-${active}`}
                      items={lesson.order}
                      done={lp.activities.includes("order")}
                      reduced={settings.reduced}
                      onDone={() =>
                        patchLesson(active, (p) => ({
                          ...p,
                          activities: [...new Set([...p.activities, "order"])],
                        }))
                      }
                    />
                  </>
                )}
                {tab === 7 && (
                  <Formative
                    key={`formative-${active}`}
                    question={lesson.questions[2]}
                    done={lp.formative}
                    onDone={() => patchLesson(active, { formative: true })}
                  />
                )}
                {tab === 8 && (
                  <>
                    {lp.post !== undefined && (
                      <div className="card">
                        <h3>النتيجة المسجلة: {lp.post}%</h3>
                        {lp.post < settings.threshold ? (
                          <>
                            <p>
                              نحتاج مراجعة علاجية قبل الإتقان. راجع المفاهيم
                              التالية:
                            </p>
                            {lesson.goals.map(
                              (g, i) =>
                                lp.goalResults?.[i] === false && (
                                  <p className="hint" key={g}>
                                    {g}
                                    <br />
                                    {
                                      lesson.concepts[
                                        Math.min(i, lesson.concepts.length - 1)
                                      ].text
                                    }
                                  </p>
                                ),
                            )}
                            <button onClick={() => setTab(5)}>
                              أعد التجربة مع التلميحات
                            </button>
                          </>
                        ) : (
                          <p>{lesson.enrichment}</p>
                        )}
                        <button
                          onClick={() =>
                            patchLesson(active, (p) => ({
                              ...p,
                              attempts: p.attempts + 1,
                            }))
                          }
                        >
                          اختبار آخر بأسئلة مكافئة
                        </button>
                      </div>
                    )}
                    <Quiz
                      threshold={settings.threshold}
                      key={`post-${active}-${lp.attempts}`}
                      title={`تحدي الإتقان: ${lesson.title}`}
                      questions={bank(lesson, "post", lp.attempts)}
                      onFinish={(value, goals) =>
                        patchLesson(active, { post: value, goalResults: goals })
                      }
                    />
                  </>
                )}
                {tab === 9 && (
                  <section className="card closing">
                    <span className="big-emoji">
                      {mastered.some((l) => l.id === active) ? "🏅" : "🧭"}
                    </span>
                    <h2>
                      {mastered.some((l) => l.id === active)
                        ? `أتقنت سر ${lesson.title}!`
                        : "بقيت خطوات تستحق الاكتشاف"}
                    </h2>
                    <div className="summary-grid">
                      {lesson.concepts.map((c) => (
                        <details key={c.title}>
                          <summary>{c.title}</summary>
                          <p>{c.text}</p>
                        </details>
                      ))}
                    </div>
                    <TeacherAudio
                      lesson={active}
                      section="summary"
                      text={lesson.concepts
                        .map((c) => c.title + "، " + c.example)
                        .join(" ")}
                      enabled={settings.sound}
                    />
                    <ul className="requirements">
                      {[
                        [lp.pre !== undefined, "إتمام الاختبار القبلي"],
                        [
                          lp.watched.length >= lesson.scenes.length,
                          "مشاهدة المحاكاة كاملة",
                        ],
                        [
                          lp.experimented.length >= lesson.scenes.length,
                          "تنفيذ التجارب وتسجيل الاستنتاج",
                        ],
                        [
                          lp.activities.length >= 2,
                          "إتقان نشاطي المطابقة والترتيب",
                        ],
                        ...(active === 5
                          ? [
                              [
                                lp.activities.includes("assemble"),
                                "تركيب نموذج الجهاز البولي",
                              ],
                            ]
                          : []),
                        [lp.formative, "التقويم التكويني"],
                        [
                          (lp.post ?? 0) >= settings.threshold,
                          `نتيجة بعدية ${settings.threshold}% فأعلى`,
                        ],
                      ].map(([yes, label]) => (
                        <li key={String(label)}>
                          {yes ? "✓" : "○"} {label}
                        </li>
                      ))}
                    </ul>
                    {mastered.some((l) => l.id === active) && (
                      <>
                        <div className="earned-stars">★★★</div>
                        <h3>وسام مستكشف {lesson.title}</h3>
                        <p>تحدٍّ إثرائي: {lesson.enrichment}</p>
                      </>
                    )}
                    <button
                      className="primary"
                      onClick={() => {
                        if (active < 7) openLesson(active + 1);
                        else go("project");
                      }}
                    >
                      {active < 7 ? "إلى المحطة التالية" : "إلى المهمة الكبرى"}{" "}
                      <ArrowLeft size={17} />
                    </button>
                  </section>
                )}
                {!(active === 1 && tab === 0) && <div className="lesson-bottom">
                  <button className="embroidered-nav previous" disabled={tab === 0} onClick={() => setTab(tab - 1)}>
                    <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
                    المرحلة السابقة
                  </button>
                  <span>
                    {tab + 1} / {stages.length}
                  </span>
                  <button
                    className="primary embroidered-nav next"
                    disabled={tab === stages.length - 1}
                    onClick={() => setTab(tab + 1)}
                  >
                    تابع الاستكشاف <ArrowLeft size={16} />
                  </button>
                </div>}
              </div>
            </div>
          </>
        )}
        {page === "project" && (
          <Project
            reduced={settings.reduced}
            previous={progress.project}
            onFinish={(value, criteria) =>
              setProgress({
                ...progress,
                project: value,
                projectCriteria: criteria,
              })
            }
          />
        )}
        {page === "final" && (
          <>
            <header className="page-heading">
              <span className="eyebrow">تحدي الوحدة الأولى · ١٥ سؤالًا</span>
              <h1>اجمع خيوط أسرار الحياة</h1>
              <p>
                يغطي الاختبار الدروس السبعة. معيار الإتقان {settings.threshold}
                %، ويمكن إعادة المحاولة بعد المراجعة.
              </p>
            </header>
            {progress.final !== undefined && (
              <div className="card">
                <h2>النتيجة: {progress.final}%</h2>
                <div className="goal-grid">
                  {lessons.map((l, i) => (
                    <div key={l.id}>
                      <b>
                        {progress.finalGoals?.[i] ? "✓" : "↺"} {l.title}
                      </b>
                      <p>
                        {progress.finalGoals?.[i]
                          ? "إجابات أهداف المحطة صحيحة في هذه المحاولة."
                          : l.concepts[0].text}
                      </p>
                      {!progress.finalGoals?.[i] && (
                        <button onClick={() => openLesson(l.id)}>
                          راجع المحطة
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => setFinalAttempt(finalAttempt + 1)}>
                  إعادة بأسئلة مكافئة
                </button>
                {certificate && (
                  <button className="primary" onClick={() => go("certificate")}>
                    شهادتي <Trophy size={18} />
                  </button>
                )}
              </div>
            )}
            <Quiz
              threshold={settings.threshold}
              key={`final-${finalAttempt}`}
              title="الاختبار البعدي الشامل"
              questions={finalBank(finalAttempt)}
              onFinish={(value, goals) =>
                setProgress({
                  ...progress,
                  final: value,
                  finalGoals: goals,
                  date: new Date().toISOString(),
                })
              }
            />
          </>
        )}
        {page === "dashboard" && (
          <>
            <header className="page-heading split">
              <div>
                <span className="eyebrow">كل إنجاز يحكي تجربة</span>
                <h1>رحلة {progress.name}</h1>
                <p>التقدم محفوظ على هذا الجهاز والمتصفح فقط.</p>
              </div>
              <div className="earned-stars">{mastered.length * 3} ★</div>
            </header>
            <div className="stats-grid">
              <div className="card">
                <strong>{Math.round((mastered.length / 7) * 100)}%</strong>
                <span>إتقان الوحدة</span>
              </div>
              <div className="card">
                <strong>{mastered.length} / ٧</strong>
                <span>أوسمة المحطات</span>
              </div>
              <div className="card">
                <strong>{progress.project ?? "—"}</strong>
                <span>مهمة الدبال</span>
              </div>
              <div className="card">
                <strong>{progress.final ?? "—"}</strong>
                <span>الاختبار الشامل</span>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <caption>متابعة المحطات السبع</caption>
                <thead>
                  <tr>
                    <th>المحطة</th>
                    <th>الحالة</th>
                    <th>قبلي</th>
                    <th>بعدي</th>
                    <th>الأنشطة</th>
                    <th>التجارب</th>
                    <th>النجوم</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((l) => {
                    const p = progress.lessons[l.id];
                    const done = mastered.some((x) => x.id === l.id);
                    return (
                      <tr key={l.id}>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => openLesson(l.id)}
                          >
                            {l.icon} {l.title}
                          </button>
                        </td>
                        <td>{done ? "متقن" : p ? "قيد التعلم" : "لم يبدأ"}</td>
                        <td>{p?.pre ?? "—"}</td>
                        <td>{p?.post ?? "—"}</td>
                        <td>
                          {p?.activities.length ?? 0} / {l.id === 5 ? 3 : 2}
                        </td>
                        <td>
                          {p?.experimented.length ?? 0} / {l.scenes.length}
                        </td>
                        <td>{done ? "★★★" : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="button-row backup">
              <button onClick={exportData}>
                <Download size={17} />
                تصدير التقدم
              </button>
              <label className="file-button">
                <Upload size={17} /> استعادة نسخة
                <input
                  type="file"
                  accept="application/json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      if (file.size > 100000) throw Error();
                      const data = parseProgress(JSON.parse(await file.text()));
                      setProgress(data);
                      setName(data.name);
                      setNotice("تمت استعادة نسخة التقدم.");
                    } catch {
                      setNotice("ملف النسخة غير صالح؛ لم تتغير بياناتك.");
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                className="primary"
                disabled={!certificate}
                onClick={() => go("certificate")}
              >
                <Trophy size={17} />
                شهادة المستكشف
              </button>
            </div>
            <p className="hint">
              تتاح الشهادة بعد إتقان الدروس السبعة ومشروع الدبال والاختبار
              الشامل. التنقل بين المحطات والمراحل لا يمنح نجومًا أو شهادة
              تلقائيًا.
            </p>
          </>
        )}
        {page === "certificate" &&
          (certificate ? (
            <>
              <div className="certificate" id="certificate">
                <div className="tatreez" />
                <div className="certificate-leaves">❧ ★ ❧</div>
                <span className="eyebrow">
                  حديقة أسرار الحياة · المنهاج الفلسطيني
                </span>
                <h1>شهادة مستكشف أسرار الحياة</h1>
                <p>تُمنح هذه الشهادة للمستكشف</p>
                <h2>{progress.name}</h2>
                <p>
                  لإتمام الوحدة الأولى «خصائص الكائنات الحية»
                  <br />
                  في مبحث العلوم والحياة للصف السابع الأساسي
                </p>
                <strong className="certificate-score">
                  نتيجة الاختبار الشامل: {progress.final}%
                </strong>
                <div className="certificate-sign">
                  <span>
                    إعداد المعلمة
                    <br />
                    <b>أ. آلاء محسن كلاب</b>
                  </span>
                  <span>
                    تاريخ الإنجاز
                    <br />
                    <b>
                      {new Date(progress.date ?? Date.now()).toLocaleDateString(
                        "ar-PS",
                        { timeZone: "Asia/Hebron" },
                      )}
                    </b>
                  </span>
                </div>
                <div className="tatreez" />
              </div>
              <button
                className="primary print-button"
                onClick={() => window.print()}
              >
                <Printer size={18} /> طباعة / حفظ PDF
              </button>
              <p className="muted">
                اختر «حفظ بصيغة PDF» من نافذة الطباعة إذا كان متصفحك يدعمها.
              </p>
            </>
          ) : (
            <Locked
              title="الشهادة"
              text="أكمل متطلبات الإتقان أولًا."
              onBack={() => go("dashboard")}
            />
          ))}
        {(page === "guide" || page === "teacher") && (
          <Guide
            teacher={page === "teacher"}
            onSwitch={() => go(page === "teacher" ? "guide" : "teacher")}
          />
        )}
      </main>
      <footer>
        <div>
          <Leaf size={19} />
          <b>حديقة أسرار الحياة</b>
          <span>اكتشف، جرّب، تعلّم، وانطلق!</span>
        </div>
        <p>إعداد أ. آلاء محسن كلاب · العلوم والحياة · الصف السابع</p>
        <button className="text-button" onClick={() => go("teacher")}>
          دليل المعلمة وتوثيق المحتوى <BookOpen size={15} />
        </button>
      </footer>
      </div>
      {page !== "cover" && !(page === "lesson" && active === 1 && tab === 0) && <PalestinianGuide name={progress.name} character={assets.companion ? (import.meta.env?.BASE_URL ?? "/Biology/") + assets.companion : undefined} context={`${page}-${active}-${tab}`} hints={[
        page === "lesson" ? (((tab === 3 && active === 1) || tab === 5) && discoveryHint ? discoveryHint : [
          `أهلًا! اقرأ موقف ${lesson.title}، وحدد السؤال الذي تريد استكشافه.`,
          `اختبر معرفتك السابقة حول ${lesson.title}؛ هذه النتيجة للتشخيص وليست للإتقان.`,
          `اختر هدفًا من أهداف ${lesson.title}، وابحث لاحقًا عن دليل يوضح فهمك له.`,
          `اكتب توقعك حول ${lesson.title} قبل التجربة، ثم قارن بما تلاحظه.`,
          `اربط شرح ${lesson.title} بمثال من بيئتك، وحدد ما يحتاج توضيحًا.`,
          `في مختبر ${lesson.title} غيّر عاملًا واحدًا، وقارن النتائج قبل تفسيرها.`,
          `في أنشطة ${lesson.title} اقرأ البطاقات، ثم اختبر العلاقات أو التسلسل.`,
          `استند إلى دليل من ${lesson.title}؛ عند الخطأ راجع التلميح وأعد المحاولة.`,
          `هذا تقويم ${lesson.title}. فكّر في الهدف الذي يقيسه كل سؤال.`,
          `لخص ما تعلمته عن ${lesson.title}، وراجع متطلبات الإتقان الفعلية.`,
        ][tab]) : page === "project" ? "اختر مواد آمنة للدبال، وقارن أثر الرطوبة والتهوية." : page === "final" ? "اقرأ كل سؤال واربطه بالهدف العلمي، ثم راجع اختياراتك." : "اختر محطتك بحرية. يمكنك العودة إلى أي مرحلة، والنجوم مرتبطة بالإتقان.",
        page === "lesson" ? `استعن بأهداف درس ${lesson.title} ومثال واحد منه. صف ما تغير، ثم ابحث عن السبب دون القفز إلى الإجابة.` : "ابدأ بخطوة واحدة، واستخدم دليل المستكشف إذا احتجت توضيحًا."
      ]} />}
      {celebrate && !settings.reduced && (
        <div className="celebration" aria-hidden="true">
          ✦ ★ ✦ ★ ✦
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <SettingsDialog
            settings={settings}
            setSettings={setSettings}
            close={() => setModal(false)}
          />
        </div>
      )}
    </div>
  );
}
function FlaskIcon() {
  return <span aria-hidden="true">⚗</span>;
}
function Locked({
  title,
  text,
  onBack,
}: {
  title: string;
  text: string;
  onBack: () => void;
}) {
  return (
    <section className="card locked-page">
      <Lock size={36} />
      <h1>{title}</h1>
      <p>{text}</p>
      <button className="primary" onClick={onBack}>
        خريطة الجزيرة <Map size={18} />
      </button>
    </section>
  );
}
function Explore({ lesson }: { lesson: Lesson }) {
  const [draft, setDraft] = useDraft(`explore-${lesson.id}`, {prediction: "", saved: false});
  const { prediction, saved } = draft;
  const setPrediction = (prediction: string) => setDraft(d => ({...d,prediction}));
  const setSaved = (saved: boolean) => setDraft(d => ({...d,saved}));
  return (
    <section className="card">
      <span className="eyebrow">توقّع · لاحظ · فسّر</span>
      <h2>قبل أن تعرف الإجابة</h2>
      <p>{lesson.explore}</p>
      <ObservationPreview lesson={lesson} />
      <label>
        اكتب توقعك
        <textarea
          value={prediction}
          maxLength={500}
          onChange={(e) => {
            setPrediction(e.target.value);
            setSaved(false);
          }}
          placeholder="أتوقع أن… لأن…"
        />
      </label>
      <button
        className="primary"
        disabled={!prediction.trim()}
        onClick={() => setSaved(true)}
      >
        ثبّت توقعي لهذه الجلسة
      </button>
      {saved && (
        <p className="hint" role="status">
          توقعك: {prediction}. قارنه الآن بما تراه في المختبر. هذه الملاحظة لا
          تُحتسب علامة.
        </p>
      )}
    </section>
  );
}
function SettingsDialog({
  settings: s,
  setSettings,
  close,
}: {
  settings: SettingsData;
  setSettings: (v: SettingsData) => void;
  close: () => void;
}) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = document.getElementById("settings-dialog")!;
    const elements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button,input,select,[tabindex="0"]',
        ),
      );
    elements()[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const list = elements();
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <section
      id="settings-dialog"
      className="settings-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="section-head">
        <h2 id="settings-title">اضبط رحلتك</h2>
        <button
          className="icon-button"
          aria-label="إغلاق الإعدادات"
          onClick={close}
        >
          <X />
        </button>
      </div>
      <label>
        حجم الخط
        <select
          value={s.font}
          onChange={(e) => setSettings({ ...s, font: +e.target.value })}
        >
          {[90, 100, 110, 120, 130].map((n) => (
            <option key={n} value={n}>
              {n}%
            </option>
          ))}
        </select>
      </label>
      {[
        ["dark", "الوضع الداكن"],
        ["contrast", "تباين مرتفع"],
        ["reduced", "تقليل الحركة"],
        ["sound", "الصوت والتسجيلات والمؤثرات"],
      ].map(([key, label]) => (
        <label className="toggle" key={key}>
          <span>{label}</span>
          <input
            type="checkbox"
            checked={s[key as keyof SettingsData] === true}
            onChange={(e) => setSettings({ ...s, [key]: e.target.checked })}
          />
        </label>
      ))}
      <SoundSettings
        enabled={s.sound}
        volume={s.volume}
        onVolume={(volume) => setSettings({ ...s, volume })}
      />{" "}
      <p className="muted">
        النصوص التعليمية ظاهرة دائمًا. الصوت لا يعمل تلقائيًا. جميع الأنشطة تدعم
        اللمس ولوحة المفاتيح.
      </p>
      <details>
        <summary>إعدادات المعلمة</summary>
        <p>أدوات محلية لهذا المتصفح؛ ليست لوحة حسابات محمية.</p>
        <label>
          معيار الإتقان: {s.threshold}%
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={s.threshold}
            onChange={(e) => setSettings({ ...s, threshold: +e.target.value })}
          />
        </label>
        <small>
          التنقل مفتوح للجميع؛ تغيير المعيار يعيد احتساب الإتقان فقط.
        </small>
      </details>
    </section>
  );
}
function Guide({
  teacher,
  onSwitch,
}: {
  teacher: boolean;
  onSwitch: () => void;
}) {
  const student = [
    [
      "ابدأ المغامرة",
      "اكتب اسمًا تختاره. يُحفظ محليًا ويظهر في الترحيب والإنجاز والشهادة. لا نطلب بيانات أخرى.",
    ],
    [
      "انتقل بين المحطات",
      "كل المحطات والمراحل والمشروع والاختبار متاحة منذ البداية؛ اختر مسارك بحرية. لوحة المتابعة تظهر الإتقان الفعلي، لا عدد الزيارات.",
    ],
    [
      "شاهد المحاكاة",
      "من المختبر اختر شاهد المحاكاة، ثم تشغيل. يمكنك الإيقاف والإعادة وتغيير السرعة أو التقدم خطوة. عند تقليل الحركة تستخدم الخطوات الثابتة.",
    ],
    [
      "جرّب بنفسك",
      "غيّر عاملًا واحدًا، وشغّل إلى النهاية، وسجل الملاحظة واختر الاستنتاج. هذا نموذج مبسط بزمن مسرع، لا قياسات حقيقية.",
    ],
    [
      "الأنشطة والتلميحات",
      "استخدم بطاقات المطابقة، واضغط بطاقات المراحل بالترتيب الصحيح لنقلها إلى منطقة الإجابة. يمكنك إلغاء بطاقة أو التراجع أو إعادة المحاولة، ثم اضغط تحقق من الترتيب. عند الخطأ راجع التلميح. المساعد صامت ويعرض تلميحًا مكتوبًا.",
    ],
    [
      "الاختبارات والتعلم التكيفي",
      "لكل درس ٥ أسئلة قبلية و٧ بعدية. القبلي لا يدخل الإتقان. تحتاج إلى المعيار المحدد والأنشطة والمختبر والتقويم. عند الضعف راجع المفهوم وأعد الاختبار.",
    ],
    [
      "الصوت وإعدادات العرض",
      "افتح الترس لتغيير حجم الخط واللون والتباين والحركة والصوت. افتح بطاقة صوت المعلمة لقراءة النص؛ التسجيلات الأصلية تضاف لاحقًا.",
    ],
    [
      "المشروع والشهادة",
      "استكشف مشروع الدبال والاختبار الشامل في الوقت الذي تختاره. لنيل الشهادة أتقن الدروس والمشروع والاختبار. اطبع الشهادة أو احفظ PDF من نافذة الطباعة.",
    ],
    [
      "احفظ تقدمك",
      "لا تنتقل البيانات تلقائيًا بين الأجهزة. صدّر نسخة JSON من لوحة المتابعة واستعدها عند الحاجة. مسح بيانات المتصفح يحذف التقدم المحلي.",
    ],
  ];
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">رفيقك في كل خطوة</span>
        <h1>{teacher ? "دليل المعلمة والتصميم التعليمي" : "دليل المستكشف"}</h1>
        <button onClick={onSwitch}>
          {teacher ? "دليل الطالب" : "دليل المعلمة"} <ArrowLeft size={16} />
        </button>
      </header>
      {!teacher ? (
        student.map(([title, text], i) => (
          <details className="card guide-detail" key={title} open={i === 0}>
            <summary>
              {String(i + 1).padStart(2, "0")} · {title}
            </summary>
            <p>{text}</p>
          </details>
        ))
      ) : (
        <>
          <section className="card">
            <h2>الأصول والتسجيلات</h2>
            <p>
              أضيفي الصورة الأصلية في public/images وعرّفي مسارها في
              src/data/assets.json بالحقل teacherPortrait؛ للشخصية استخدمي
              companion. لا يتم تغيير الوجه. ارفعي الملفات إلى المستودع وأعيدي
              النشر.
            </p>
            <p>
              التسجيلات في public/audio/lesson-1/… حتى lesson-7. اربطي المسارات
              في src/data/audio.json بمفاتيح مثل 1.intro و1.explanation
              و1.simulation و1.activity و1.summary. الترحيب: 0.welcome. لا يوجد
              رفع دائم من المتصفح.
            </p>
            <p>
              المحتوى والأسئلة في src/data/lessons.ts؛ معايير الإتقان والدعم في
              src/engine/progress.ts؛ نماذج الظواهر في src/engine/models.ts.
              يلزم مراجعة الإجابات والنماذج بعد أي تعديل.
            </p>
          </section>
          <section className="card">
            <h2>تطبيق ADDIE</h2>
            <p>
              <b>التحليل:</b> طالب سابع يعرف احتياجات الكائنات وأجزاء النبات.
              الصعوبات: الخلط بين الغذاء والماء، والتنفس والبناء الضوئي، والنمو
              والانتفاخ، والمؤثر والاستجابة.
            </p>
            <p>
              <b>التصميم:</b> تهيئة ← تشخيص ← أهداف ← توقع ← شرح ← مشاهدة وتجريب
              ← تطبيق وتقويم ← علاج أو إثراء.
            </p>
            <p>
              <b>التطوير:</b> بيانات منفصلة، SVG تفاعلي، بنوك اختبارات، تخزين
              محلي وصوت اختياري.
            </p>
            <p>
              <b>التنفيذ:</b> RTL، هاتف وحاسوب، بدائل لوحة مفاتيح، تقليل حركة،
              نصوص موازية.
            </p>
            <p>
              <b>التقويم:</b> تشخيص لا يحتسب، إتقان معياري مع متطلبات أداء،
              وتحليل أخطاء. تجربة صفية بإشراف المعلمة مطلوبة قبل الاعتماد
              النهائي.
            </p>
          </section>
          <section className="card">
            <h2>حالة توثيق المصدر</h2>
            <p>
              تمت مراجعة الملف المصور 1001014054.pdf وصور الاستجابة والتكاثر
              بصريًا، واستُكملت الأجزاء الناقصة بنسخة عامة تحمل في صفحة الحقوق
              الطبعة الرابعة 2021 وتطابق الأمثلة المرسلة. تبقى مطابقة الطبعة
              الثالثة الأصلية بحاجة مراجعة المعلمة. التوثيق التفصيلي:
              docs/SOURCE-REVIEW.md.
            </p>
            <p>
              الاختبار الشامل من إعداد المشروع بناء على أهداف الدروس، بناء على
              توجيه المعلمة، وليس نسخة من أسئلة كتاب غير متاحة.
            </p>
          </section>
          {lessons.map((l) => (
            <section key={l.id} className="card">
              <h2>
                {l.icon} مواءمة {l.title}
              </h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>الهدف</th>
                      <th>الشرح</th>
                      <th>النشاط</th>
                      <th>المحاكاة</th>
                      <th>التقويم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {l.goals.map((g, i) => (
                      <tr key={g}>
                        <td>{g}</td>
                        <td>{l.concepts[alignment[l.id][i].concept].title}</td>
                        <td>{alignment[l.id][i].activity}</td>
                        <td>
                          {alignment[l.id][i].scenes
                            .map(
                              (id) => l.scenes.find((s) => s.id === id)?.title,
                            )
                            .join("، ")}
                        </td>
                        <td>
                          {l.questions
                            .filter((q) => q.goal === i)
                            .map((q) => q.id)
                            .join("، ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
}
