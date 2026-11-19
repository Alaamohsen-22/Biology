import React from "react";
import {JSDOM} from "jsdom";
import {test} from "node:test";
import assert from "node:assert/strict";
const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost/Biology/'});
for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement}))Object.defineProperty(globalThis,key,{value,configurable:true});
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const {render,fireEvent,cleanup,act}=await import('@testing-library/react');
const {lessons}=await import('../src/data/lessons');
const {labProtocols,labObjectives}=await import('../src/data/labProtocols');
const {Simulation}=await import('../src/components/Simulation');
const {ScientificScene}=await import('../src/components/science/ScientificScene');
const {soundManager}=await import('../src/engine/sound');
soundManager.configure(false);
for(const scene of lessons.flatMap(l=>l.scenes))test(`${scene.id}: procedure tools, held result, expanded diagram and saved inquiry`,()=>{
 dom.window.localStorage.clear();
 const ui=render(<Simulation scene={scene} reduced watched={false} experimented={false} onWatch={()=>{}} onExperiment={()=>{}}/>);
 try{
  assert.ok(labObjectives[scene.id]);assert.ok(labProtocols[scene.id].length>=2);
  fireEvent.click(ui.getByRole('button',{name:/جرّب بنفسك/}));
  const slider=ui.getAllByRole('slider')[0] as HTMLInputElement;
  fireEvent.change(slider,{target:{value:slider.value===slider.max ? slider.min:slider.max}});
  assert.equal((ui.getByRole('progressbar') as HTMLProgressElement).value,0);
  assert.ok(ui.getByText(/تم إعداد الأدوات/));
  fireEvent.click(ui.getByRole('button',{name:labProtocols[scene.id][0].label}));
  assert.ok(ui.container.querySelector('.used-tool'));
  fireEvent.click(ui.getByRole('button',{name:'تكبير الرسم'}));
  assert.ok(ui.getByRole('dialog'));fireEvent.keyDown(ui.getByRole('dialog'),{key:'Escape'});
  assert.equal(ui.queryByRole('dialog'),null);
  fireEvent.click(ui.getByRole('button',{name:'أعطني تلميحًا للتجربة'}));
  assert.ok(ui.getByText(new RegExp(`في ${scene.title} غيّر`)));
  fireEvent.change(ui.getByLabelText('ماذا لاحظت في هذه التجربة؟'),{target:{value:'ملاحظة خاصة بالتجربة'}});
 }finally{cleanup();}
 const restored=render(<Simulation scene={scene} reduced watched={false} experimented={false} onWatch={()=>{}} onExperiment={()=>{}}/>);
 try{assert.equal((restored.getByLabelText('ماذا لاحظت في هذه التجربة؟') as HTMLTextAreaElement).value,'ملاحظة خاصة بالتجربة');}finally{cleanup();}
});
test('iodine drops reach the liquid before the characteristic colour; mold starts clean',()=>{
 const ui=render(<ScientificScene id="iodine" vars={{iodine:1,starch:1}} t={.3} value={.3}/>);
 try{
  assert.equal(ui.queryByText('أزرق مسود في العينة المحتوية على النشا'),null);
  ui.rerender(<ScientificScene id="iodine" vars={{iodine:1,starch:1}} t={1} value={1}/>);
  assert.ok(ui.getByText('أزرق مسود في العينة المحتوية على النشا'));
  ui.rerender(<ScientificScene id="iodine" vars={{iodine:1,starch:0}} t={1} value={0}/>);
  assert.equal(ui.queryByText('أزرق مسود في العينة المحتوية على النشا'),null);
  ui.rerender(<ScientificScene id="mold" vars={{days:5}} t={0} value={0}/>);
  assert.equal(ui.container.querySelectorAll('.science-model circle').length,0);
 }finally{cleanup();}
});
test('drop and discovery sounds follow the iodine timeline exactly once per playback',()=>{
 const oldSet=dom.window.setInterval, oldClear=dom.window.clearInterval, oldPlay=soundManager.play;
 let tick:(()=>void)|undefined;const played:string[]=[];
 dom.window.setInterval=((fn:()=>void)=>{tick=fn;return 1;}) as typeof dom.window.setInterval;
 dom.window.clearInterval=()=>{tick=undefined;};
 soundManager.play=async name=>{played.push(name);return true;};
 const scene=lessons.flatMap(l=>l.scenes).find(s=>s.id==='iodine')!;
 const ui=render(<Simulation scene={scene} reduced={false} watched={false} experimented={false} onWatch={()=>{}} onExperiment={()=>{}}/>);
 try{fireEvent.click(ui.getByRole('button',{name:'تشغيل',exact:true}));const advance=tick;for(let i=0;i<170;i++)act(()=>advance?.());
  assert.equal(played.filter(x=>x==='drop').length,3);assert.equal(played.filter(x=>x==='discover').length,1);
 }finally{cleanup();soundManager.play=oldPlay;dom.window.setInterval=oldSet;dom.window.clearInterval=oldClear;}
});
test('microscope labels follow the selected organism rather than a stale scene title',()=>{
 const ui=render(<ScientificScene id="micro-euglena" vars={{organism:2,zoom:2}} t={.5} value={.5}/>);
 try{assert.ok(ui.getAllByText('الأميبا والأقدام الكاذبة').length>=1);assert.ok(ui.getByRole('button',{name:/امتدادات مؤقتة/}));}finally{cleanup();}
});
