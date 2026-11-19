import { useCallback, useEffect, useRef, useState } from "react";
import { OliveOrchardScene, orchardFacts, type OrchardPart } from "./OliveOrchardScene";
import { TeacherCharacter } from "./PalestinianGuide";
import { TeacherAudio } from "./Audio";
import { useDraft } from "../engine/drafts";
import { useSound } from "./SoundSystem";
import { soundManager } from "../engine/sound";
import audioConfig from "../data/audio.json";
const choices = ["تحصل على غذائها جاهزًا من التربة.","تصنع غذاءها بنفسها باستخدام مواد من بيئتها والطاقة الضوئية.","تحصل على غذائها من ثمار الزيتون."];
export function OliveOrchardIntro({enabled,reduced,onBack,onPre,teacherText}:{enabled:boolean;reduced:boolean;onBack:()=>void;onPre:()=>void;teacherText:string}) {
 const [draft,setDraft,saveFailed]=useDraft('olive-orchard-intro-v1',{roots:false,leaves:false,sun:false,choice:-1,muted:false});
 const [active,setActive]=useState<OrchardPart|null>(null),[pulse,setPulse]=useState(0),[guide,setGuide]=useState(true);
 const [playing,setPlaying]=useState(false),[blocked,setBlocked]=useState(false),[loadError,setLoadError]=useState(false);
 const audio=useRef<HTMLAudioElement>(null),attempted=useRef(false),enterCue=useRef(false),starting=useRef(false);
 const sound=useSound();
 const visited=(['roots','leaves','sun'] as OrchardPart[]).filter(p=>draft[p]);
 const explored=visited.length===3;
 const selected=Number.isInteger(draft.choice)&&draft.choice>=0&&draft.choice<3;
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
 const explore=(part:OrchardPart)=>{
  setActive(part);setPulse(n=>n+1);setDraft(d=>({...d,[part]:true}));
  sound.play(part==='roots'?'water':part==='leaves'?'move':'tool');
 };
 return <section onKeyDownCapture={e=>{if((e.key==='Enter'||e.key===' ') && !(e.target as Element).closest('[data-orchard-audio]') && !attempted.current)void startAudio();}} className="orchard-intro" data-reduced={reduced} data-sound-scope="custom" aria-labelledby="orchard-title" onClickCapture={e=>{
  if(!(e.target as Element).closest('[data-orchard-audio]') && !attempted.current)void startAudio();
 }}>
  <header className="orchard-heading"><span className="eyebrow">المحطة الأولى · بستان الزيتون</span><h2 id="orchard-title">مغامرتنا الأولى: سر شجرة الزيتون</h2><p>في بستان زيتون فلسطيني قرب نابلس، تبدأ رحلتنا لاكتشاف سر غذاء النباتات</p></header>
  <div className="orchard-panorama">
   <OliveOrchardScene active={active} pulse={pulse} onExplore={explore}/>
   <aside className={`orchard-guide ${guide?'':'collapsed'}`} aria-label="رفيقة البستان">
    {guide ? <><div className="orchard-guide-character"><TeacherCharacter/></div><div className="orchard-bubble"><p>أهلًا يا مستكشف! 🌿 نحن نأكل ثمار الزيتون، لكن هل تساءلت يومًا كيف تحصل شجرة الزيتون على غذائها؟</p><button className="text-button" onClick={()=>{setGuide(false);sound.play('click');}}>إخفاء المساعدة</button></div></> : <button onClick={()=>{setGuide(true);sound.play('click');}}>إظهار المساعدة</button>}
   </aside>
  </div>
  <div className="orchard-explore"><div className="orchard-explore-title"><h3>المس سرًّا في البستان</h3><span>استكشفت {visited.length} من ٣</span></div>
   <div className="orchard-part-buttons">{(['roots','leaves','sun'] as OrchardPart[]).map(part=><button key={part} className={active===part?'selected':''} aria-pressed={active===part} onClick={()=>explore(part)}>{part==='roots'?'الجذور':part==='leaves'?'الأوراق':'الشمس'}{draft[part]&&<span aria-label="تم الاستكشاف"> ✓</span>}</button>)}</div>
   <div className="orchard-fact" role="status" aria-live="polite">{active ? orchardFacts[active] : 'اختر الجذور أو الأوراق أو الشمس من المشهد أو الأزرار.'}</div>
  </div>
  {(explored||selected)&&<fieldset className="orchard-prediction"><legend>برأيك، من أين تحصل شجرة الزيتون على غذائها؟</legend><p>هذا توقع نستكشفه معًا، وليس سؤالًا محسوبًا في الاختبار.</p>{choices.map((choice,i)=><label key={choice} className={draft.choice===i?'chosen':''}><input type="radio" name="orchard-prediction" checked={draft.choice===i} onChange={()=>{setDraft(d=>({...d,choice:i}));sound.play('select');}}/><span>{choice}</span></label>)}{selected&&<p className="orchard-prediction-feedback" role="status">توقع جميل! سنكتشف الحقيقة خلال مغامرتنا العلمية</p>}</fieldset>}
  <div className="orchard-audio" data-orchard-audio="controls"><audio ref={audio} src={`${import.meta.env?.BASE_URL ?? '/Biology/'}audio/ambience/orchard.mp3`} loop preload="none" onPause={()=>setPlaying(false)} onPlay={()=>setPlaying(true)} onError={()=>setLoadError(true)}/>
   <button disabled={!enabled} onClick={()=>{attempted.current=true;if(playing){setDraft(d=>({...d,muted:true}));if(audio.current)soundManager.releaseBed(audio.current);setPlaying(false);}else if(draft.muted){setDraft(d=>({...d,muted:false}));if(audio.current)void soundManager.playBed(audio.current).then(ok=>{setPlaying(ok);setBlocked(!ok);});}else void startAudio();}}>{playing?'كتم أجواء البستان':'تشغيل أجواء البستان'}</button>
   <span role="status">{!enabled?'الصوت مكتوم من إعدادات الموقع.':loadError?'تعذر تحميل الصوت؛ يمكنك متابعة الاستكشاف وإعادة المحاولة.':blocked?'اضغط تشغيل أجواء البستان لتفعيل الصوت.':playing?'طيور وموسيقى هادئة · يمكنك الكتم في أي وقت.':'الأجواء الصوتية اختيارية وتبدأ بعد تفاعلك.'}</span>
  </div>
  {recordingAvailable&&<div className="orchard-teacher"><TeacherAudio lesson={1} section="intro" text={teacherText} enabled={enabled}/></div>}
  {saveFailed&&<p role="alert">تعذر حفظ التوقع على هذا المتصفح. يمكنك متابعة الرحلة.</p>}
  {!selected&&<p className="orchard-next-hint" id="orchard-next-hint">{explored?'سجّل توقعك، ثم ابدأ الاختبار القبلي.':'استكشف الجذور والأوراق والشمس لتظهر بطاقة التوقع.'} يمكنك أيضًا الانتقال بحرية من قائمة مراحل الدرس.</p>}
  <nav className="orchard-navigation" aria-label="تنقل تمهيد التغذية"><button className="embroidered-nav previous" onClick={()=>{sound.play('step');onBack();}}>العودة إلى الجزيرة</button><button className="embroidered-nav next primary" disabled={!selected} aria-describedby={!selected?'orchard-next-hint':undefined} onClick={()=>{sound.play('step');onPre();}}>ابدأ الاختبار القبلي</button></nav>
 </section>;
}
