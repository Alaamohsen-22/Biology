import {
  lessonDestination,
  routeFromHash,
  routeHash,
} from "./classroom/router";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Leaf,
  Home as HomeIcon,
  ChartNoAxesColumn,
  HelpCircle,
  Settings,
  Volume2,
  VolumeX,
  ArrowLeft,
  Printer,
} from "lucide-react";
import { Home } from "./classroom/Home";
import { LessonWorkspace } from "./classroom/LessonWorkspace";
import { ProgressView } from "./classroom/ProgressView";
import { HelpView } from "./classroom/HelpView";
import { SettingsDialog } from "./classroom/SettingsDialog";
import {
  home,
  readSettings,
  readProgress,
  readLocation,
  PROGRESS_KEY,
  SETTINGS_KEY,
  LOCATION_KEY,
  type Destination,
} from "./classroom/storage";
import { lessons, finalBank } from "./data/lessons";
import {
  emptyLesson,
  isMastered,
  type LessonProgress,
} from "./engine/progress";
import { conceptCheckIds } from "./engine/lessonFlow";
import { Quiz } from "./components/Quiz";
import {
  SoundPreferences,
  SoundNotice,
  interfaceClick,
  useSound,
} from "./components/SoundSystem";
import { TeacherAudio } from "./components/Audio";
import { AmbientMusic } from "./components/AmbientMusic";
import { useDraft } from "./engine/drafts";
import audio from "./data/audio.json";
export default function App() {
  const [progress, setProgress] = useState(readProgress),
    [settings, setSettings] = useState(readSettings),
    [route, setRoute] = useState<Destination>(() => routeFromHash()),
    [resume, setResume] = useState(readLocation),
    [modal, setModal] = useState(false),
    [notice, setNotice] = useState("");
  const content = useRef<HTMLElement>(null),
    mounted = useRef(false);
  const sound = useSound();
  useEffect(() => {
    const update = () => {
      if (window.location.hash !== "#main") setRoute(routeFromHash());
    };
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);
  useEffect(() => {
    const hash = routeHash(route);
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  }, [route]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modal]);
  const mastered = useMemo(
    () =>
      lessons
        .filter((l) =>
          isMastered(
            progress.lessons[l.id],
            settings.threshold,
            l.scenes.map((s) => s.id),
            conceptCheckIds(l.id),
          ),
        )
        .map((l) => l.id),
    [progress, settings.threshold],
  );
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      setNotice("تعذر الحفظ على هذا الجهاز. صدّر تقدمك قبل المغادرة.");
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.dataset.theme = settings.dark ? "dark" : "light";
    document.documentElement.dataset.contrast = String(settings.contrast);
    document.documentElement.dataset.reduced = String(settings.reduced);
    document.documentElement.style.fontSize = `${settings.font}%`;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      setNotice("تعذر حفظ إعدادات العرض.");
    }
  }, [settings]);
  useEffect(() => {
    if (route.page === "lesson") {
      setResume(route);
      try {
        localStorage.setItem(LOCATION_KEY, JSON.stringify(route));
      } catch {
        setNotice("تعذر حفظ موضع التعلم.");
      }
    }
  }, [route]);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    content.current?.focus({ preventScroll: true });
    document.title =
      route.page === "lesson"
        ? `${lessons[route.lesson - 1].title} | حديقة أسرار الحياة`
        : "حديقة أسرار الحياة";
  }, [route.page, route.lesson, route.section, route.topic]);
  const go = (next: Destination) => {
    sound.play("step");
    setRoute(next);
  };
  const openLesson = (id: number) => go(lessonDestination(id));
  const select = (section: Destination["section"], topic = 0, scene?: string) =>
    go(lessonDestination(route.lesson, section, topic, scene));
  const patch = useCallback(
    (
      change: Partial<LessonProgress> | ((p: LessonProgress) => LessonProgress),
    ) =>
      setProgress((prev) => {
        const old = prev.lessons[route.lesson] ?? emptyLesson(),
          next =
            typeof change === "function" ? change(old) : { ...old, ...change };
        const complete = isMastered(
          next,
          settings.threshold,
          lessons[route.lesson - 1].scenes.map((s) => s.id),
          conceptCheckIds(route.lesson),
        );
        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [route.lesson]: {
              ...next,
              ...(complete && !next.completedAt
                ? { completedAt: new Date().toISOString() }
                : {}),
            },
          },
        };
      }),
    [route.lesson, settings.threshold],
  );
  const nav = [
    { page: "home", title: "الدروس", Icon: HomeIcon },
    { page: "progress", title: "تقدمي", Icon: ChartNoAxesColumn },
    { page: "help", title: "المساعدة", Icon: HelpCircle },
  ] as const;
  return (
    <div
      className="science-app"
      onClickCapture={(e) => interfaceClick(e.target)}
    >
      <SoundPreferences enabled={settings.sound} volume={settings.volume} />
      <a className="skip-link" href="#main">
        تجاوز إلى المحتوى
      </a>
      <header className="app-header">
        <button
          className="site-brand"
          aria-label="حديقة أسرار الحياة، الرئيسية"
          onClick={() => go(home)}
        >
          <span className="brand-leaf">
            <Leaf size={25} />
          </span>
          <span>
            حديقة أسرار الحياة<small>علوم من أرضنا</small>
          </span>
        </button>
        <nav className="app-nav" aria-label="التنقل الرئيسي">
          {nav.map(({ page, title, Icon }) => (
            <button
              key={page}
              aria-current={route.page === page ? "page" : undefined}
              onClick={() => go({ ...home, page })}
            >
              <Icon size={19} />
              <span>{title}</span>
            </button>
          ))}
        </nav>
        <div className="utility-actions">
          <button
            aria-label={settings.sound ? "كتم الصوت" : "تشغيل الصوت"}
            aria-pressed={!settings.sound}
            data-sound="handled"
            onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}
          >
            {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            aria-label="إعدادات العرض والصوت"
            onClick={() => setModal(true)}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      <main id="main" ref={content} tabIndex={-1}>
        <SoundNotice />
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button onClick={() => setNotice("")}>إغلاق</button>
          </div>
        )}
        {route.page === "home" && (
          <>
            <Home
              progress={progress}
              threshold={settings.threshold}
              mastered={mastered}
              resume={resume}
              onLesson={openLesson}
              onResume={() => resume && go(resume)}
            />
            <details className="welcome-sound">
              <summary>أجواء التعلم الصوتية · اختيارية</summary>
              {(audio as Record<string, string>)["0.welcome"] && (
                <TeacherAudio
                  enabled={settings.sound}
                  text="أهلًا بك في حديقة أسرار الحياة، نكتشف خصائص الكائنات بالملاحظة والتجريب."
                />
              )}
              <AmbientMusic enabled={settings.sound} />
            </details>
          </>
        )}
        {route.page === "lesson" && (
          <LessonWorkspace
            key={route.lesson}
            route={route}
            progress={progress.lessons[route.lesson] ?? emptyLesson()}
            settings={settings}
            name={progress.name}
            onSelect={select}
            onHome={() => go(home)}
            patch={patch}
          />
        )}
        {route.page === "progress" && (
          <ProgressView
            progress={progress}
            threshold={settings.threshold}
            mastered={mastered}
            onChange={setProgress}
            onLesson={openLesson}
            onFinal={() => go({ ...home, page: "final" })}
          />
        )}
        {route.page === "help" && <HelpView />}
        {route.page === "final" && (
          <UnitFinal
            progress={progress}
            threshold={settings.threshold}
            mastered={mastered.length === 7}
            onResult={(final, finalGoals) =>
              setProgress((p) => ({
                ...p,
                final,
                finalGoals,
                date: new Date().toISOString(),
              }))
            }
            onLesson={openLesson}
          />
        )}
      </main>
      <footer className="app-footer">
        <span className="palestine-stitch" aria-hidden="true" />
        <span>العلوم والحياة · الصف السابع الأساسي</span>
        <span>إعداد أ. آلاء محسن كلاب</span>
      </footer>
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
function UnitFinal({
  progress,
  threshold,
  mastered,
  onResult,
  onLesson,
}: {
  progress: ReturnType<typeof readProgress>;
  threshold: number;
  mastered: boolean;
  onResult: (score: number, goals: Record<number, boolean>) => void;
  onLesson: (id: number) => void;
}) {
  const [attempt, setAttempt] = useDraft("unit-final-attempt-v1", { value: 0 });
  const earned = mastered && (progress.final ?? 0) >= threshold;
  const sound = useSound();
  const [award, setAward] = useDraft(`unit-award-${progress.name}`, {
    celebrated: false,
  });
  useEffect(() => {
    if (earned && !award.celebrated) {
      setAward({ celebrated: true });
      sound.play("success");
    }
  }, [earned, award.celebrated]);
  return (
    <section className="unit-final">
      <span className="overline">الوحدة الأولى · ١٥ سؤالًا</span>
      <h1>كيف ترتبط أسرار الحياة؟</h1>
      <p className="lead">
        اختبر فهمك عبر الدروس السبعة. يمكنك المراجعة وإعادة المحاولة.
      </p>
      <Quiz
        paged
        key={attempt.value}
        questions={finalBank(attempt.value)}
        title="اختبار الوحدة"
        threshold={threshold}
        onFinish={onResult}
      />
      {progress.final !== undefined && (
        <>
          <div className="final-review">
            <h2>نتيجتك المسجلة: {progress.final}%</h2>
            <div>
              {lessons.map((l, i) => (
                <button key={l.id} onClick={() => onLesson(l.id)}>
                  {progress.finalGoals?.[i] ? "✓" : "راجع"} {l.title}
                  <ArrowLeft size={16} />
                </button>
              ))}
            </div>
            <button onClick={() => setAttempt((s) => ({ value: s.value + 1 }))}>
              محاولة بأسئلة مكافئة
            </button>
          </div>
          {earned ? (
            <section className="award-card earned">
              <h2>شهادة مستكشف أسرار الحياة</h2>
              <h3>{progress.name || "المستكشف"}</h3>
              <p>أتم الوحدة الأولى بنتيجة {progress.final}%</p>
              <p>المعلمة: أ. آلاء محسن كلاب</p>
              {progress.date && (
                <time>
                  {new Date(progress.date).toLocaleDateString("ar-PS", {
                    timeZone: "Asia/Hebron",
                  })}
                </time>
              )}
              <button className="primary" onClick={() => window.print()}>
                <Printer size={17} /> طباعة الشهادة
              </button>
            </section>
          ) : (
            <p className="storage-note">
              شهادة الوحدة تتطلب إتقان الدروس السبعة ودرجة {threshold}% فأعلى في
              اختبار الوحدة.
            </p>
          )}
        </>
      )}
    </section>
  );
}
