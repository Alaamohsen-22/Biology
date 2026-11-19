import { welcomedStages } from "../engine/guideWelcome";
import { GuideMedia } from "./GuideMedia";
import { useEffect, useId, useState, useRef, useCallback } from "react";
export function TeacherCharacter() {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 120 160" role="img" aria-label="مساعدة تعليمية فلسطينية خيالية بثوب مطرز" className="teacher-character">
    <defs><pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse"><path d="M6 1v10M1 6h10M2 2l8 8M10 2l-8 8" stroke="#b84048" strokeWidth="1.5" /></pattern></defs>
    <path d="M24 150l9-60q27-25 54 0l10 60Z" fill="#254c40"/><path d="M47 88h26v63H47Z" fill={`url(#${id})`}/><path d="M31 95l-16 41 12 5 20-39M89 95l16 41-12 5-20-39" fill="#254c40" stroke="#254c40" strokeWidth="8"/>
    <ellipse cx="60" cy="51" rx="34" ry="39" fill="#eee7d5"/><path d="M30 55Q24 5 60 9q38 2 31 52l-13 27-36-1Z" fill="#eee7d5"/><ellipse cx="60" cy="51" rx="23" ry="28" fill="#dcae8e"/><path d="M35 39q17-38 46 0-26-12-46 0Z" fill="#355b4b"/><path d="M29 55q5 25 24 28L42 96 26 77M91 55q-5 25-24 28l11 13 16-19" fill="#eee7d5"/><path d="M39 87h42l-21 19Z" fill="#faf2df"/>
    <path d="M43 47q5-4 10 0M67 47q5-4 10 0" fill="none" stroke="#604c40" strokeWidth="2" strokeLinecap="round"/><ellipse cx="49" cy="51" rx="2" ry="3" fill="#2e4439"/><ellipse cx="71" cy="51" rx="2" ry="3" fill="#2e4439"/><path d="M53 65q7 6 14 0" fill="none" stroke="#9e5451" strokeWidth="2" strokeLinecap="round"/>
    <path d="M34 135h52v13H34Z" fill={`url(#${id})`}/><circle cx="20" cy="140" r="7" fill="#dcae8e"/><circle cx="100" cy="140" r="7" fill="#dcae8e"/>
  </svg>;
}
export function PalestinianGuide({ name, context, hints, character }: { name: string; context: string; hints: string[]; character?: string }) {
  const [open,setOpen] = useState(false), [hidden,setHidden] = useState(false), [level,setLevel] = useState(0);
  const [cue,setCue]=useState("");
  const previous=useRef<string|null>(null);
  const receiveCue=useCallback((text:string)=>setCue(text),[]);
  useEffect(()=>{if(previous.current===context)return;previous.current=context;const first=!welcomedStages.has(context);welcomedStages.add(context);if(!hidden)setOpen(first);setCue("");},[context]);
  useEffect(() => { setLevel(0); }, [context, hints[0]]);
  return <aside className={`pal-guide ${hidden ? 'is-hidden' : ''}`} aria-label="المساعدة الفلسطينية">
    {hidden ? <button onClick={() => {setHidden(false);setOpen(true);}}>إظهار المساعدة</button> : <>
      {open && <div className="guide-bubble" key={context}><b>{name ? `${name}،` : "يا مستكشف،"} فكرة تساعدك</b><p aria-live="polite">{cue||hints[Math.min(level,hints.length-1)]}</p><div className="button-row"><button onClick={() => setLevel(n => Math.min(n+1,hints.length-1))}>أعطني تلميحًا</button><button onClick={() => setOpen(false)}>فهمت، شكرًا</button></div><small>مساعدة مكتوبة</small><GuideMedia context={context} onCue={receiveCue}/></div>}
      <div className="guide-dock"><button className="guide-avatar" aria-label="تلميحات المساعدة الفلسطينية" aria-expanded={open} onClick={() => setOpen(!open)}>{character ? <img src={character} alt="الشخصية الفلسطينية المرفقة" className="teacher-character" /> : <TeacherCharacter />}</button><button onClick={() => {setHidden(true);setOpen(false);}}>إخفاء المساعدة</button></div>
    </>}
  </aside>;
}
