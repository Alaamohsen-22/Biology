import { useEffect, useRef, useState } from "react";
import { soundManager } from "../engine/sound";
import { Music2, Pause, Play, RotateCcw } from "lucide-react";
export function AmbientMusic({ enabled }: { enabled: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled) {
      audio.current?.pause();
      setPlaying(false);
    }
  }, [enabled]);
  return (
    <details className="audio-card">
      <summary>
        <Music2 size={17} /> أجواء الجزيرة · موسيقى اختيارية
      </summary>
      <p>
        لحن رقمي أصلي هادئ بلا كلام. يبدأ فقط باختيارك؛ أوقفه أثناء الاستماع
        لشرح المعلمة.
      </p>
      <audio
        ref={audio}
        src={`${import.meta.env?.BASE_URL ?? "/Biology/"}audio/ambience/island.wav`}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onError={() => setError(true)}
      />
      <div className="button-row">
        <button
          disabled={!enabled}
          onClick={async () => {
            if (!audio.current) return;
            if (playing) {
              audio.current.pause();
              setPlaying(false);
            } else {
              audio.current.volume = 0.2;
              try {
                const ok = await soundManager.playMedia(audio.current, "music");
                setPlaying(ok);
                setError(!ok);
              } catch {
                setError(true);
              }
            }
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}{" "}
          {playing ? "إيقاف الموسيقى" : "تشغيل الموسيقى"}
        </button>
        <button
          disabled={!enabled}
          onClick={() => {
            if (audio.current) {
              audio.current.pause();
              audio.current.currentTime = 0;
              setPlaying(false);
            }
          }}
        >
          <RotateCcw size={14} /> إعادة للبداية
        </button>
      </div>
      {error && <p role="alert">تعذر تشغيل الموسيقى في هذا المتصفح.</p>}
    </details>
  );
}
