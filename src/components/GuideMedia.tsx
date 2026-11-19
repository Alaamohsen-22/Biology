import {useEffect,useRef,useState} from "react";
import {soundManager} from "../engine/sound";
import {useSound} from "./SoundSystem";
type Clip={src:string;kind:"audio"|"video";transcript?:string;cues?:{start:number;end:number;text:string}[]};
let manifest:Promise<Record<string,Clip>>|undefined;
function getClips():Promise<Record<string,Clip>>{
 return manifest??=fetch(`${import.meta.env?.BASE_URL??"/Biology/"}config/guide-media.json`).then(r=>r.ok?r.json():{}).catch(()=>({}));
}
export function GuideMedia({context,onCue}:{context:string;onCue:(text:string)=>void}){
 const [clip,setClip]=useState<Clip|null>(null),[error,setError]=useState(false);
 const ref=useRef<HTMLMediaElement|null>(null);
 const sound=useSound();
 useEffect(()=>{
  let cancelled=false;const controller=new AbortController();setClip(null);setError(false);onCue("");
  void getClips().then(async clips=>{
   const c=clips[context];
   if(!c||!['audio','video'].includes(c.kind)||typeof c.src!=="string"||!c.src.startsWith("guide/")||c.src.includes(".."))return;
   const response=await fetch(`${import.meta.env?.BASE_URL??"/Biology/"}${c.src}`,{method:"HEAD",signal:controller.signal});
   if(!cancelled&&response.ok&&/audio|video|octet-stream/i.test(response.headers.get("content-type")??""))setClip(c);
  }).catch(()=>{});
  return()=>{cancelled=true;controller.abort();};
 },[context,onCue]);
 useEffect(()=>{const node=ref.current;return()=>{if(node)soundManager.releaseMedia(node);};},[clip]);
 if(!clip)return null;
 const src=`${import.meta.env?.BASE_URL??"/Biology/"}${clip.src}`;
 const update=()=>{const time=ref.current?.currentTime??0;const cue=clip.cues?.find(c=>time>=c.start&&time<c.end);onCue(cue?.text??"");};
 const common={src,preload:"none" as const,onTimeUpdate:update,onEnded:()=>onCue(""),onError:()=>setError(true)};
 return <div className="guide-media" data-sound-scope="custom">
  {clip.kind==="video"?<video {...common} ref={e=>{ref.current=e;}} playsInline/>:<audio {...common} ref={e=>{ref.current=e;}}/>}
  <div className="button-row"><button disabled={!sound.enabled||sound.volume===0} onClick={()=>{if(ref.current)void soundManager.playMedia(ref.current,"narration");}}>تشغيل المقطع</button><button onClick={()=>ref.current?.pause()}>إيقاف</button><button onClick={()=>{if(ref.current){ref.current.currentTime=0;void soundManager.playMedia(ref.current,"narration");}}}>إعادة المقطع</button><button onClick={()=>{if(ref.current)ref.current.muted=!ref.current.muted;}}>كتم المقطع أو إعادته</button></div>
  {clip.transcript&&<p>{clip.transcript}</p>}{error&&<p role="status">تعذر تشغيل المقطع. يمكنك متابعة الإرشاد المكتوب.</p>}
 </div>;
}
