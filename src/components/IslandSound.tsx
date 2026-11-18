import { useEffect, useRef, useState } from "react";
import { soundManager } from "../engine/sound";
export function IslandSound({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing,setPlaying] = useState(false), [blocked,setBlocked] = useState(false), [loadError,setLoadError] = useState(false);
  const start = async () => {
    if (!ref.current || !enabled) return;
    const ok = await soundManager.playMedia(ref.current,"music", false);
    setPlaying(ok); setBlocked(!ok);
  };
  useEffect(() => {
    const audio = ref.current;
    let cancelled = false;
    if (enabled) queueMicrotask(() => { if(!cancelled) void start(); });
    else { audio?.pause(); setPlaying(false); }
    return () => { cancelled = true; if(audio) soundManager.releaseMedia(audio); };
  }, [enabled]);
  return <section className="island-sound" aria-label="صوت الجزيرة" data-sound-scope="custom">
    <audio ref={ref} src={`${(import.meta.env?.BASE_URL ?? "/Biology/")}audio/ambience/island.wav`} preload="metadata" onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setLoadError(true)} />
    <span>{loadError ? "تعذر تحميل صوت الجزيرة. تحقق من الاتصال ثم أعد المحاولة." : playing ? "صوت الجزيرة يعمل" : !enabled ? "الصوت مكتوم من الإعدادات" : blocked ? "المتصفح يحتاج ضغطة لتشغيل الصوت" : "رافق رحلتك بصوت الجزيرة"}</span>
    <button disabled={!enabled} onClick={() => { if(playing) { ref.current?.pause(); setPlaying(false); } else void start(); }}>{playing ? "كتم صوت الجزيرة" : "ابدأ الرحلة بالصوت"}</button>
    <button disabled={!enabled} onClick={() => { if(ref.current) ref.current.currentTime=0; void start(); }}>إعادة صوت الجزيرة</button>
  </section>;
}
