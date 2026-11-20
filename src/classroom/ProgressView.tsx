import { useRef, useState, useEffect } from "react";
import { Download, Upload, ArrowLeft } from "lucide-react";
import { lessons } from "../data/lessons";
import {
  lessonCompletion,
  type Progress,
  parseProgress,
} from "../engine/progress";
import { conceptCheckIds } from "../engine/lessonFlow";
export function ProgressView({
  progress,
  threshold,
  mastered,
  onChange,
  onLesson,
  onFinal,
}: {
  progress: Progress;
  threshold: number;
  mastered: number[];
  onChange: (p: Progress) => void;
  onLesson: (id: number) => void;
  onFinal: () => void;
}) {
  const [name, setName] = useState(progress.name),
    [notice, setNotice] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => setName(progress.name), [progress.name]);
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "life-island-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="progress-view">
      <span className="overline">تعلّم يُبنى خطوة خطوة</span>
      <h1>تقدمي</h1>
      <p className="lead">
        {mastered.length} من ٧ دروس متقنة. زيارة الصفحات لا تمنح إتقانًا.
      </p>
      <form
        className="name-editor"
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ ...progress, name: name.trim().slice(0, 40) });
          setNotice("حُفظ اسمك على هذا الجهاز.");
        }}
      >
        <label>
          اسمك على الشهادة <small>اختياري</small>
          <input
            aria-label="اسم الطالب"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="يكفي اسم تختاره"
          />
        </label>
        <button>حفظ الاسم</button>
      </form>
      <div className="progress-lessons">
        {lessons.map((l) => {
          const p = progress.lessons[l.id];
          return (
            <article key={l.id}>
              <div>
                <h2>{l.title}</h2>
                <p>
                  قبلي: {p?.pre === undefined ? "لم يُنجز" : `${p.pre}%`} ·
                  بعدي: {p?.post === undefined ? "لم يُنجز" : `${p.post}%`}
                </p>
                <progress
                  aria-label={`تقدم ${l.title}`}
                  max={100}
                  value={lessonCompletion(
                    p,
                    l.scenes.map((s) => s.id),
                    threshold,
                    conceptCheckIds(l.id),
                  )}
                />
                <small>
                  {mastered.includes(l.id)
                    ? "✓ إتقان مكتسب"
                    : `${p?.conceptChecks?.length ?? 0} / ${conceptCheckIds(l.id).length} مفاهيم متقنة`}{" "}
                  · {p?.experimented.length ?? 0} / {l.scenes.length} تجارب
                  منجزة
                </small>
              </div>
              <button onClick={() => onLesson(l.id)}>
                تابع التعلم <ArrowLeft size={17} />
              </button>
            </article>
          );
        })}
      </div>
      <div className="data-actions">
        <button className="primary" onClick={onFinal}>
          اختبار الوحدة{" "}
          {progress.final !== undefined ? `· ${progress.final}%` : ""}
        </button>
        <button onClick={exportData}>
          <Download size={17} /> تصدير تقدمي
        </button>
        <button onClick={() => upload.current?.click()}>
          <Upload size={17} /> استيراد تقدمي
        </button>
        <input
          ref={upload}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="ملف التقدم"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 1024 * 1024) throw Error();
              const parsed = parseProgress(JSON.parse(await file.text()));
              onChange(parsed);
              setNotice("استُعيد تقدمك بنجاح.");
            } catch {
              setNotice("ملف غير صالح. لم يتغير تقدمك الحالي.");
            }
            e.target.value = "";
          }}
        />
      </div>
      <p className="storage-note">
        هذه البيانات تخص هذا المتصفح. صدّرها قبل تغيير الجهاز أو مسح بياناته.
      </p>
      {notice && (
        <p role="status" className="hint">
          {notice}
        </p>
      )}
    </section>
  );
}
