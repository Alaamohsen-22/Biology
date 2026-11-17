import { useRef, useState } from "react";
import { Volume2, Square, RotateCcw } from "lucide-react";
import audioConfig from "../data/audio.json";
export function TeacherAudio({
  lesson = 0,
  section = "welcome",
  text,
  enabled = true,
}: {
  lesson?: number;
  section?: string;
  text: string;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState(false);
  const file = (audioConfig as Record<string, string>)[`${lesson}.${section}`];
  return (
    <details className="audio-card">
      <summary>
        <Volume2 size={17} /> بصوت المعلمة ·{" "}
        {file ? "تسجيل متاح" : "بانتظار التسجيل"}
      </summary>
      {file && enabled ? (
        <>
          <audio
            ref={ref}
            src={`${import.meta.env?.BASE_URL ?? "/Biology/"}${file}`}
            onError={() => setError(true)}
            preload="none"
          />
          <div className="button-row">
            <button
              onClick={() => {
                void ref.current?.play().catch(() => setError(true));
              }}
            >
              تشغيل
            </button>
            <button onClick={() => ref.current?.pause()}>
              <Square size={14} />
              إيقاف
            </button>
            <button
              onClick={() => {
                if (ref.current) {
                  ref.current.currentTime = 0;
                  void ref.current.play().catch(() => setError(true));
                }
              }}
            >
              <RotateCcw size={14} />
              إعادة
            </button>
          </div>
        </>
      ) : (
        <p>
          {enabled
            ? "سيضاف التسجيل الحقيقي للمعلمة هنا."
            : "الصوت معطل من الإعدادات."}
        </p>
      )}
      {error && <p role="alert">تعذر تشغيل الملف. تحققي من المسار والصيغة.</p>}
      <p>{text}</p>
    </details>
  );
}
