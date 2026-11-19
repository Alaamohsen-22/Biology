import { useCallback, useEffect, useRef, useState } from "react";
import { OliveOrchardScene } from "./OliveOrchardScene";
import { StageGuide } from "./StageGuide";
import { TeacherAudio } from "./Audio";
import { useDraft } from "../engine/drafts";
import { useSound } from "./SoundSystem";
import { soundManager } from "../engine/sound";
import audioConfig from "../data/audio.json";
export function OliveOrchardIntro({enabled,reduced,onBack,onPre,teacherText}:{enabled:boolean;reduced:boolean;onBack:()=>void;onPre:()=>void;teacherText:string}) {
 const [draft,setDraft,saveFailed]=useDraft('olive-orchard-intro-v2',{muted:false});
 const [playing,setPlaying]=useState(false),[blocked,setBlocked]=useState(false),[loadError,setLoadError]=useState(false);
 const audio=useRef<HTMLAudioElement>(null),attempted=useRef(false),enterCue=useRef(false),starting=useRef(false);
 const sound=useSound();
 const recording=(audioConfig as Record<string,string>)['1.intro'];
 const [recordingAvailable,setRecordingAvailable]=useState(false);
 useEffect(()=>{
  if(!recording)return;
  const controller=new AbortController();
  void fetch(`${import.meta.env?.BASE_URL ?? '/Biology/'}${recording}`,{method:'HEAD',signal:controller.signal}).then(r=>{
   if(!controller.signal.aborted)setRecordingAvailable(r.ok && /audio|octet-stream/i.test(r.headers.get('content-type')??''));
  }).catch(()=>{if(!controller.signal.aborted)setRecordingAvailable(false);});
  return()=>controller.abort();
 },[recording]);
 const startAudio=useCallback(async()=>{
  if(!enabled || draft.muted || !audio.current || starting.current)return;
  attempted.current=true;starting.current=true;
  if(!enterCue.current){enterCue.current=true;soundManager.play('start');}
  try {const ok=await soundManager.playBed(audio.current);setPlaying(ok);setBlocked(!ok);} finally {starting.current=false;}
 },[enabled,draft.muted]);
 useEffect(()=>{const node=audio.current;return()=>{if(node)soundManager.releaseBed(node);soundManager.stop();};},[]);
 useEffect(()=>{
  if(!enabled||draft.muted){if(audio.current)soundManager.releaseBed(audio.current);setPlaying(false);return;}
  if(navigator.userActivation?.hasBeenActive && !attempted.current)void startAudio();
 },[enabled,draft.muted,startAudio]);
 return <section onKeyDownCapture={e=>{if((e.key==='Enter'||e.key===' ') && !(e.target as Element).closest('[data-orchard-audio]') && !attempted.current)void startAudio();}} className="orchard-intro" data-reduced={reduced} data-sound-scope="custom" aria-labelledby="orchard-title" onClickCapture={e=>{
  if(!(e.target as Element).closest('[data-orchard-audio]') && !attempted.current)void startAudio();
 }}>
  <header className="orchard-heading"><span className="eyebrow">المحطة الأولى · بستان الزيتون</span><h2 id="orchard-title">مغامرتنا الأولى: سر شجرة الزيتون</h2><p>في بستان زيتون فلسطيني قرب نابلس، تبدأ رحلتنا لاكتشاف سر غذاء النباتات</p></header>
  <div className="orchard-panorama">
   <OliveOrchardScene/>
   <StageGuide context="nutrition.intro" className="orchard-guide" text="مرحبًا أيها المستكشف! نحن نأكل ثمار الزيتون، ولكن كيف تحصل شجرة الزيتون على غذائها؟"/>
  </div>
  <div className="orchard-audio" data-orchard-audio="controls"><audio ref={audio} src={`${import.meta.env?.BASE_URL ?? '/Biology/'}audio/ambience/orchard.mp3`} loop preload="none" onPause={()=>setPlaying(false)} onPlay={()=>setPlaying(true)} onError={()=>setLoadError(true)}/>
   <button disabled={!enabled} onClick={()=>{attempted.current=true;if(playing){setDraft(d=>({...d,muted:true}));if(audio.current)soundManager.releaseBed(audio.current);setPlaying(false);}else if(draft.muted){setDraft(d=>({...d,muted:false}));if(audio.current)void soundManager.playBed(audio.current).then(ok=>{setPlaying(ok);setBlocked(!ok);});}else void startAudio();}}>{playing?'كتم أجواء البستان':'تشغيل أجواء البستان'}</button>
   <span role="status">{!enabled?'الصوت مكتوم من إعدادات الموقع.':loadError?'تعذر تحميل الصوت؛ يمكنك متابعة الاستكشاف وإعادة المحاولة.':blocked?'اضغط تشغيل أجواء البستان لتفعيل الصوت.':playing?'طيور وموسيقى هادئة · يمكنك الكتم في أي وقت.':'الأجواء الصوتية اختيارية وتبدأ بعد تفاعلك.'}</span>
  </div>
  {recordingAvailable&&<div className="orchard-teacher"><TeacherAudio lesson={1} section="intro" text={teacherText} enabled={enabled}/></div>}
  {saveFailed&&<p role="alert">تعذر حفظ التوقع على هذا المتصفح. يمكنك متابعة الرحلة.</p>}
  <nav className="orchard-navigation" aria-label="تنقل تمهيد التغذية"><button className="embroidered-nav previous" onClick={()=>{onBack();}}>العودة إلى الجزيرة</button><button className="embroidered-nav next primary" onClick={()=>{onPre();}}>اكتشف معرفتك السابقة</button></nav>
 </section>;
}
