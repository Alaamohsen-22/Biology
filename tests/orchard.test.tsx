import React from 'react';
import {JSDOM} from 'jsdom';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost/Biology/'});
for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement}))Object.defineProperty(globalThis,key,{value,configurable:true});
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const {render,fireEvent,cleanup,act}=await import('@testing-library/react');
const {OliveOrchardIntro}=await import('../src/components/OliveOrchardIntro');
const {orchardFacts}=await import('../src/components/OliveOrchardScene');
const {soundManager}=await import('../src/engine/sound');
soundManager.configure(false);
test('orchard exploration reveals one fact, saves a neutral prediction and navigates without grading',()=>{
 dom.window.localStorage.clear();let back=0,pre=0;
 let ui=render(<OliveOrchardIntro enabled={false} reduced onBack={()=>back++} onPre={()=>pre++} teacherText="نص المعلمة"/>);
 try {
  assert.ok(ui.getByRole('heading',{name:'مغامرتنا الأولى: سر شجرة الزيتون'}));
  assert.equal(ui.queryByRole('radio'),null);
  assert.equal(ui.queryByText(/بانتظار التسجيل/),null);
  fireEvent.click(ui.getByRole('button',{name:'استكشف الجذور',exact:true}));
  assert.ok(ui.getByText(orchardFacts.roots));assert.equal(ui.queryByText(orchardFacts.leaves),null);
  fireEvent.keyDown(ui.getByRole('button',{name:'استكشف الأوراق',exact:true}),{key:'Enter'});
  assert.ok(ui.getByText(orchardFacts.leaves));assert.equal(ui.queryByText(orchardFacts.roots),null);
  fireEvent.click(ui.getByRole('button',{name:'الشمس',exact:true}));
  assert.equal(ui.getAllByRole('radio').length,3);
  fireEvent.click(ui.getAllByRole('radio')[0]);
  assert.ok(ui.getByText('توقع جميل! سنكتشف الحقيقة خلال مغامرتنا العلمية'));
  assert.equal(ui.queryByText(/إجابة صحيحة|إجابة خاطئة|إبداع|ممتاز/),null);
  fireEvent.click(ui.getByRole('button',{name:'ابدأ الاختبار القبلي',exact:true}));
  fireEvent.click(ui.getByRole('button',{name:'العودة إلى الجزيرة',exact:true}));
  assert.equal(pre,1);assert.equal(back,1);
 }finally{cleanup();}
 ui=render(<OliveOrchardIntro enabled={false} reduced onBack={()=>{}} onPre={()=>{}} teacherText="نص"/>);
 try{assert.equal((ui.getAllByRole('radio')[0] as HTMLInputElement).checked,true);assert.equal(ui.getByRole('button',{name:'ابدأ الاختبار القبلي'}).hasAttribute('disabled'),false);}finally{cleanup();}
});
test('orchard audio waits for interaction, avoids success tones and stops on leaving',async()=>{
 dom.window.localStorage.clear();const play=soundManager.play,bed=soundManager.playBed,release=soundManager.releaseBed;
 const effects:string[]=[];let starts=0,stops=0;
 soundManager.play=async effect=>{effects.push(effect);return true;};soundManager.playBed=async()=>{starts++;return true;};soundManager.releaseBed=()=>{stops++;};
 const ui=render(<OliveOrchardIntro enabled reduced={false} onBack={()=>{}} onPre={()=>{}} teacherText="نص"/>);
 try{
  assert.equal(starts,0);
  await act(async()=>fireEvent.click(ui.getByRole('button',{name:'تشغيل أجواء البستان',exact:true})));
  assert.equal(starts,1);
  fireEvent.click(ui.getByRole('button',{name:'استكشف الجذور',exact:true}));
  fireEvent.click(ui.getByRole('button',{name:'استكشف الأوراق',exact:true}));
  fireEvent.click(ui.getByRole('button',{name:'استكشف الشمس',exact:true}));
  assert.ok(effects.includes('start'));assert.ok(effects.includes('water'));assert.ok(effects.includes('move'));assert.ok(effects.includes('tool'));
  assert.equal(effects.includes('success'),false);
  fireEvent.click(ui.getByRole('button',{name:'كتم أجواء البستان'}));assert.ok(stops>=1);
 }finally{cleanup();soundManager.play=play;soundManager.playBed=bed;soundManager.releaseBed=release;}
 assert.ok(stops>=2);
});
