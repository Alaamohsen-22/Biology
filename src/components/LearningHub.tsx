import audioConfig from "../data/audio.json";
import assets from "../data/assets.json";
import { TeacherAudio } from "./Audio";
import { AmbientMusic } from "./AmbientMusic";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Leaf,
  FlaskConical,
  Sparkles,
  Check,
  Play,
  Sprout,
  Zap,
  TrendingUp,
  Move,
  Droplets,
  Sun,
  Flower2,
  Compass,
} from "lucide-react";
import { lessons } from "../data/lessons";
import { curriculum } from "../data/curriculum";
import { conceptCheckIds, validReadingLocation } from "../engine/lessonFlow";
import { lessonCompletion, type Progress } from "../engine/progress";
import { IslandArt } from "./Island";
import { TeacherCharacter } from "./PalestinianGuide";
const icons = [Sprout, Zap, TrendingUp, Move, Droplets, Sun, Flower2];
const accents = [
  "#32735c",
  "#b57339",
  "#4c758a",
  "#72629b",
  "#347e85",
  "#a06e42",
  "#a05f79",
];
export function LearningHub({
  progress,
  mastered,
  threshold,
  welcome,
  reading,
  onStart,
  onLesson,
  onResume,
  onGuide,
  sound,
}: {
  sound: boolean;
  progress: Progress;
  mastered: number[];
  threshold: number;
  welcome: boolean;
  reading: { lesson: number; index: number; saved: boolean };
  onStart: () => void;
  onLesson: (id: number) => void;
  onResume: () => void;
  onGuide: () => void;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"lessons" | "island">("lessons");
  const resume = reading.saved && validReadingLocation(reading);
  return (
    <div className="learning-hub">
      <section className="hub-hero">
        <div className="hub-hero-copy">
          <div className="hub-kicker">
            <span className="flag-mark" /> العلوم والحياة <span> / </span> الصف
            السابع
          </div>
          <h1>
            {welcome ? (
              <>
                كل سؤال صغير،
                <br />
                <em>بداية اكتشاف كبير.</em>
              </>
            ) : (
              <>
                أهلًا {progress.name || "يا مستكشف"}،<br />
                <em>ماذا ستكتشف اليوم؟</em>
              </>
            )}
          </h1>
          <p>
            هنا نقترب من الحياة: نفهم فكرة، نجربها، ثم نفسّر ما شاهدناه. سبعة
            دروس من بيئتنا الفلسطينية، ومساحة لفضولك.
          </p>
          <div className="hub-hero-actions">
            {welcome ? (
              <button className="primary large" onClick={onStart}>
                ابدأ المغامرة <ArrowLeft size={20} />
              </button>
            ) : resume ? (
              <button className="primary large" onClick={onResume}>
                <Play size={18} /> تابع تعلمك ·{" "}
                {lessons[reading.lesson - 1].title}
              </button>
            ) : (
              <button className="primary large" onClick={() => onLesson(1)}>
                لنبدأ بالتغذية <ArrowLeft size={20} />
              </button>
            )}
            {welcome && resume && (
              <button className="hub-secondary" onClick={onResume}>
                متابعة التعلم
              </button>
            )}
            <button className="hub-secondary" onClick={onGuide}>
              كيف أتعلم هنا؟
            </button>
          </div>
          <div className="hub-signature">
            {assets.teacherPortrait ? (
              <img
                src={`${import.meta.env?.BASE_URL ?? "/Biology/"}${assets.teacherPortrait}`}
                alt="المعلمة آلاء محسن كلاب"
              />
            ) : (
              <Leaf size={18} />
            )}{" "}
            إعداد المعلمة: أ. آلاء محسن كلاب
          </div>
          {welcome && (
            <>
              {(audioConfig as Record<string, string>)["0.welcome"] && (
                <TeacherAudio
                  text="مرحبًا بك في حديقة أسرار الحياة! سنكتشف خصائص الكائنات الحية بالملاحظة والتجريب والتفكير."
                  enabled={sound}
                />
              )}
              <AmbientMusic enabled={sound} />
            </>
          )}
        </div>
        <div className="hub-landscape">
          <IslandArt />
          <div className="hub-scene-caption">
            <span className="live-dot" /> من أرضنا تبدأ الحكاية{" "}
            <small>نلاحظ · نسأل · نجرب</small>
          </div>
        </div>
      </section>
      <div className="hub-overview" aria-label="رحلتك باختصار">
        <span>
          <Compass size={21} />
          <b>٧</b> دروس متاحة بحرية
        </span>
        <span>
          <FlaskConical size={21} />
          <b>٢٣</b> تجربة علمية
        </span>
        <span>
          <Check size={21} />
          <b>{mastered.length} / ٧</b> دروس متقنة
        </span>
        <span className="hub-local">تقدمك محفوظ على هذا الجهاز</span>
      </div>
      <section className="hub-catalog" aria-labelledby="catalog-title">
        <header className="hub-catalog-heading">
          <div>
            <span className="eyebrow">
              الوحدة الأولى · خصائص الكائنات الحية
            </span>
            <h2 id="catalog-title">اختر بابك إلى الحياة</h2>
            <p>ابدأ بأي درس. التعلم رحلة، وليس سباقًا.</p>
          </div>
          <label className="hub-search">
            <Search size={19} />
            <input
              aria-label="ابحث عن درس"
              placeholder="ابحث عن درس…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </header>
        <div className="hub-view" role="group" aria-label="طريقة عرض الدروس">
          <button
            aria-pressed={view === "lessons"}
            onClick={() => setView("lessons")}
          >
            الدروس
          </button>
          <button
            aria-pressed={view === "island"}
            onClick={() => setView("island")}
          >
            خريطة الجزيرة
          </button>
        </div>
        {view === "island" && (
          <div className="hub-island">
            <IslandArt compact />
            <div className="hub-island-pins">
              {lessons.map((l, i) => (
                <button
                  key={l.id}
                  style={{ "--pin": accents[i] } as React.CSSProperties}
                  onClick={() => onLesson(l.id)}
                >
                  {l.icon}
                  <span>{l.title}</span>
                  <ArrowLeft size={16} />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="hub-lessons">
          {lessons
            .filter((l) => `${l.title} ${l.place}`.includes(query.trim()))
            .map((l) => {
              const Icon = icons[l.id - 1];
              const done = mastered.includes(l.id);
              const completed = lessonCompletion(
                progress.lessons[l.id],
                l.scenes.map((s) => s.id),
                threshold,
                conceptCheckIds(l.id),
              );
              return (
                <button
                  key={l.id}
                  className="hub-lesson"
                  style={
                    {
                      "--lesson-accent": accents[l.id - 1],
                    } as React.CSSProperties
                  }
                  aria-label={`المحطة ${l.id} ${l.title}: ${done ? "متقنة" : "متاحة"}`}
                  onClick={() => onLesson(l.id)}
                >
                  <div className="hub-card-top">
                    <span className="hub-lesson-icon">
                      <Icon size={28} strokeWidth={1.6} />
                    </span>
                    <span className="hub-card-number">0{l.id}</span>
                    {done && <Check size={20} />}
                  </div>
                  <h3>{l.title}</h3>
                  <p>{curriculum[l.id - 1].introQuestion}</p>
                  <div className="hub-card-meta">
                    <span>{curriculum[l.id - 1].topics.length} مفاهيم</span>
                    <i /> <span>{l.scenes.length} تجارب</span>
                  </div>
                  <div className="hub-card-progress">
                    <span style={{ width: `${completed}%` }} />
                  </div>
                  <div className="hub-card-bottom">
                    <span>
                      {done
                        ? "أتقنت الدرس"
                        : completed
                          ? `إنجازك ${completed}%`
                          : "ابدأ الاستكشاف"}
                    </span>
                    <ArrowLeft size={19} />
                  </div>
                </button>
              );
            })}
        </div>
        {lessons.every(
          (l) => !`${l.title} ${l.place}`.includes(query.trim()),
        ) && (
          <div className="hub-empty">
            <Search size={32} />
            <h3>لم نجد هذا الدرس</h3>
            <p>جرّب اسمًا مثل «النمو» أو «الحركة».</p>
            <button onClick={() => setQuery("")}>عرض جميع الدروس</button>
          </div>
        )}
      </section>
      <section className="hub-mentor">
        <div className="hub-mentor-art">
          <TeacherCharacter />
        </div>
        <div>
          <span className="eyebrow">رفيقة الاكتشاف</span>
          <h2>جرّب، والخطأ جزء من التعلم.</h2>
          <p>
            سترافقك مرشدتك الفلسطينية بتلميحات قصيرة. اطلب المساعدة حين تحتاج،
            واحتفظ بملاحظاتك لتقارن أفكارك بنتائج التجربة.
          </p>
        </div>
        <button onClick={onGuide}>
          تعرّف إلى أدواتك <Sparkles size={18} />
        </button>
      </section>
    </div>
  );
}
