import { useEffect, useId, useState } from "react";
export type OrchardPart = "roots" | "leaves" | "sun";
export const orchardFacts: Record<OrchardPart,string> = {
 roots: "تمتص الجذور الماء والأملاح المعدنية من التربة",
 leaves: "تؤدي الأوراق دورًا مهمًا في صنع الغذاء",
 sun: "يوفر ضوء الشمس الطاقة اللازمة للبناء الضوئي",
};
export function OliveOrchardScene({active,pulse,onExplore}:{active:OrchardPart|null;pulse:number;onExplore:(part:OrchardPart)=>void}) {
 const id=useId().replace(/:/g,"");
 const [narrow,setNarrow]=useState(()=>window.matchMedia?.("(max-width: 700px)").matches ?? false);
 useEffect(()=>{const q=window.matchMedia?.("(max-width: 700px)");if(!q)return;const sync=()=>setNarrow(q.matches);q.addEventListener?.("change",sync);return()=>q.removeEventListener?.("change",sync);},[]);
 const activate=(part:OrchardPart)=>(event:React.KeyboardEvent<SVGGElement>)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onExplore(part);}};
 return <svg className={`olive-orchard-art active-${active ?? 'none'}`} viewBox={narrow ? "270 0 730 650" : "0 0 1000 650"} aria-label="بستان زيتون فلسطيني تفاعلي قرب نابلس: شمس وجبال ومصاطب حجرية وشجرة بجذور واضحة" role="group">
  <defs>
   <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#a9d8eb"/><stop offset="1" stopColor="#edf2c9"/></linearGradient>
   <linearGradient id={`${id}-hill`} x2=".3" y2="1"><stop stopColor="#8eae68"/><stop offset="1" stopColor="#557f57"/></linearGradient>
   <radialGradient id={`${id}-crown`} cx=".35" cy=".2"><stop stopColor="#aec08a"/><stop offset=".6" stopColor="#79976c"/><stop offset="1" stopColor="#3d6451"/></radialGradient>
   <linearGradient id={`${id}-trunk`} x2="1"><stop stopColor="#6e6046"/><stop offset=".4" stopColor="#b2a17a"/><stop offset=".65" stopColor="#8b7b59"/><stop offset="1" stopColor="#544e3c"/></linearGradient>
   <linearGradient id={`${id}-earth`} x2=".3" y2="1"><stop stopColor="#c7a976"/><stop offset="1" stopColor="#8b6947"/></linearGradient>
   <linearGradient id={`${id}-stone`} x2=".3" y2="1"><stop stopColor="#e3d5b3"/><stop offset="1" stopColor="#a79c7e"/></linearGradient>
   <radialGradient id={`${id}-sun`}><stop stopColor="#fff4af"/><stop offset=".7" stopColor="#f4d275"/><stop offset="1" stopColor="#e9b652"/></radialGradient>
   <filter id={`${id}-shadow`} x="-.2" y="-.2" width="1.4" height="1.5"><feDropShadow dx="3" dy="8" stdDeviation="6" floodColor="#344f3c" floodOpacity=".2"/></filter>
   <symbol id={`${id}-small-tree`} viewBox="0 0 130 160"><ellipse cx="65" cy="147" rx="51" ry="9" fill="#42613a" opacity=".2"/><path d="M62 143l4-64m-2 30L36 75m29 29 28-30" stroke={`url(#${id}-trunk)`} strokeWidth="13" fill="none" strokeLinecap="round"/><path d="M15 72Q0 36 37 27Q47-3 78 20Q111 6 122 41Q145 75 111 94Q72 119 29 94Z" fill={`url(#${id}-crown)`}/><path d="M25 54q24-25 43-16m6 17q21-21 34-7" stroke="#d1d8a6" strokeWidth="6" opacity=".3" fill="none"/></symbol>
  </defs>
  <rect width="1000" height="650" fill={`url(#${id}-sky)`}/>
  <g className="orchard-clouds" fill="#fff" opacity=".68"><path d="M30 93q-20-26 6-36 3-40 40-23 32-30 50 10 43-1 37 27 23 25-15 29Z"/><path d="M414 72q-18-26 8-33 18-29 39-6 35-19 43 17 41-1 31 28Z"/></g>
  <path d="M0 300Q71 193 183 234Q259 119 373 218Q467 136 581 226Q700 123 803 227Q903 160 1000 244V650H0Z" fill="#8ea887" opacity=".6"/>
  <path d="M0 369Q137 216 273 301Q379 203 526 306Q700 224 818 309Q911 246 1000 300V650H0Z" fill={`url(#${id}-hill)`}/>
  <path d="M0 357q181-58 334 28T1000 349M0 392q173-48 351 29T1000 382" fill="none" stroke="#ced19b" strokeWidth="9" opacity=".45"/>
  {[[65,310,105],[207,287,90],[350,313,85],[820,292,100],[909,329,85]].map(([x,y,size],n)=><use key={n} href={`#${id}-small-tree`} x={x} y={y} width={size} height={size*1.23}/>)}
  <path d="M0 449Q410 342 1000 429V650H0Z" fill="#a3b77b"/>
  <path d="M0 492Q426 381 1000 471V510Q420 420 0 531Z" fill="#9b9376"/>
  {Array.from({length:25},(_,i)=>{const x=i*43-20,y=474-Math.sin(i/9)*47;return <path key={i} d={`M${x} ${y}l38-5 3 25-39 6Z`} fill={`url(#${id}-stone)`} stroke="#8f8d70" strokeWidth="1.3"/>;})}
  <path d="M0 579Q445 472 1000 554V650H0Z" fill="#b9bd86"/>
  <path d="M0 608Q420 511 1000 585V650H0Z" fill="#a19a78"/>
  {Array.from({length:27},(_,i)=>{const x=i*39-10,y=599-Math.sin(i/10)*53;return <path key={i} d={`M${x} ${y}l36-3 4 29-38 4Z`} fill={`url(#${id}-stone)`} stroke="#969070" strokeWidth="1.4"/>;})}
  <g className="orchard-birds" stroke="#526b62" strokeWidth="2" fill="none"><path d="M136 151q11-13 21 0 10-13 20 0M303 109q8-11 17 0 9-11 17 0M732 157q9-11 18 0 9-11 18 0"/></g>
  <g className="orchard-sunbeams" key={`ray-${active==='sun'?pulse:0}`}><path d="M853 91L713 384 561 421Z" fill="#fff4ac" opacity=".13"/><path d="M853 91L584 309 506 356Z" fill="#fff6b9" opacity=".18"/><path d="M853 91L778 450 687 476Z" fill="#fff4b0" opacity=".1"/></g>
  <g role="button" tabIndex={0} aria-label="استكشف الشمس" aria-pressed={active==='sun'} className="orchard-hit orchard-sun" onClick={()=>onExplore('sun')} onKeyDown={activate('sun')}>
   <circle cx="853" cy="91" r="88" fill="transparent"/>
   <g className="orchard-sun-rays" stroke="#efd27b" strokeWidth="5" strokeLinecap="round">{Array.from({length:12},(_,n)=><path key={n} d="M853 30V13" transform={`rotate(${n*30} 853 91)`}/>)}</g>
   <circle cx="853" cy="91" r="44" fill={`url(#${id}-sun)`}/>
  </g>
  <ellipse cx="591" cy="554" rx="217" ry="58" fill="#4e6346" opacity=".18"/>
  <ellipse cx="594" cy="559" rx="153" ry="58" fill={`url(#${id}-earth)`}/>
  <path d="M444 560q133-67 297 0q-122 41-297 0" fill="#cfb58c" opacity=".5"/>
  <g filter={`url(#${id}-shadow)`}>
   <path d="M554 545q27-103 8-217l-91-87 17-16 97 70 43-105 22 9-35 141q8 109 32 201Z" fill={`url(#${id}-trunk)`}/>
   <path d="M575 532q17-100-1-198m12 78q21-74 35-108m-36 84q-1-49-40-86" stroke="#d2c39b" strokeWidth="4" opacity=".48" fill="none"/>
  </g>
  <g role="button" tabIndex={0} aria-label="استكشف الأوراق" aria-pressed={active==='leaves'} className="orchard-hit" onClick={()=>onExplore('leaves')} onKeyDown={activate('leaves')}>
   <g key={`leaves-${active==='leaves'?pulse:0}`} className={`orchard-canopy ${active==='leaves'?'leaves-discovered':''}`}>
    <path d="M390 321q-44-73 28-116 12-78 94-66 51-58 107-12 91-23 109 54 69 17 65 87 34 76-59 99-88 24-158-9-80 38-133-9Z" fill={`url(#${id}-crown)`} filter={`url(#${id}-shadow)`}/>
    {Array.from({length:135},(_,n)=>{const angle=n*2.39996,rad=Math.sqrt((n+.5)/135);const x=587+Math.cos(angle)*rad*190,y=251+Math.sin(angle)*rad*106;return <g key={n} transform={`translate(${x} ${y}) rotate(${n*37})`}><path d="M-12 0Q0-8 13 0Q0 8-12 0Z" fill={['#c5ceaa','#90aa81','#587e65','#b4c49d','#6e9475'][n%5]} opacity=".8"/><path d="M-8 0h16" stroke="#d3d8b6" opacity=".5" strokeWidth=".8"/>{n%9===0 && <ellipse cx="3" cy="9" rx="3.5" ry="5" fill="#465b3e"/>}</g>;})}
   </g>
  </g>
  <g role="button" tabIndex={0} aria-label="استكشف الجذور" aria-pressed={active==='roots'} className="orchard-hit" onClick={()=>onExplore('roots')} onKeyDown={activate('roots')}>
   <ellipse cx="590" cy="557" rx="150" ry="73" fill="transparent"/>
   <g key={`roots-${active==='roots'?pulse:0}`} className={active==='roots'?'roots-discovered':''} stroke={`url(#${id}-trunk)`} fill="none" strokeLinecap="round"><path d="M579 512q-7 52-74 70m82-65q-7 66 67 78m-61-72q-14 62-54 83m59-75q24 30 80 35" strokeWidth="13"/><path d="M535 569l-40 26m54-11-29 25m103-38 59 26m-47-5 21 20m-70-33-11 39" strokeWidth="4"/></g>
  </g>
  {[366,411,752,794,871].map((x,n)=><g key={x} transform={`translate(${x} ${534+(n%2)*31})`}><path d="M0 0l-4-16m4 16 7-13" stroke="#6f8c57" strokeWidth="2"/><circle cx="-4" cy="-17" r="3" fill={n%2?'#c7766b':'#e2d891'}/></g>)}
 </svg>;
}
