import {useCallback,useEffect,useRef,useState} from "react";
import {TeacherCharacter} from "./PalestinianGuide";
import {GuideMedia} from "./GuideMedia";
import assets from "../data/assets.json";
import {welcomedStages} from "../engine/guideWelcome";
export function StageGuide({context,text,className=""}:{context:string;text:string;className?:string}){
 const [open,setOpen]=useState(false),[cue,setCue]=useState("");
 const previous=useRef<string|null>(null);
 useEffect(()=>{if(previous.current===context)return;previous.current=context;const first=!welcomedStages.has(context);welcomedStages.add(context);setOpen(first);setCue("");},[context]);
 const receiveCue=useCallback((text:string)=>setCue(text),[]);
 return <aside className={`stage-guide ${className}`} aria-label="المرشدة الفلسطينية">
  <button className="stage-guide-avatar" aria-label="فتح فقاعة المرشدة" aria-expanded={open} onClick={()=>setOpen(!open)}>{assets.companion?<img className="teacher-character" src={`${import.meta.env?.BASE_URL??"/Biology/"}${assets.companion}`} alt="المرشدة الفلسطينية"/>:<TeacherCharacter/>}</button>
  {open&&<div className="stage-guide-bubble"><p aria-live="polite">{cue||text}</p><button className="text-button" onClick={()=>setOpen(false)}>إغلاق الفقاعة</button><GuideMedia context={context} onCue={receiveCue}/></div>}
 </aside>;
}
