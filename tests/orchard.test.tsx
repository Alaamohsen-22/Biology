import React from 'react';
import {JSDOM} from 'jsdom';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost/Biology/'});
for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement}))Object.defineProperty(globalThis,key,{value,configurable:true});
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
const {render,fireEvent,cleanup,act}=await import('@testing-library/react');
const {OliveOrchardIntro}=await import('../src/components/OliveOrchardIntro');
const {soundManager}=await import('../src/engine/sound');
soundManager.configure(false);
test('orchard keeps its scenery but removes hotspots, premature facts and gating',()=>{
 dom.window.localStorage.clear();let back=0,pre=0;
 const ui=render(<OliveOrchardIntro enabled={false} reduced onBack={()=>back++} onPre={()=>pre++} teacherText="نص المعلمة"/>);
 try{
  assert.ok(ui.getByRole('heading',{name:'مغامرتنا الأولى: سر شجرة الزيتون'}));
  assert.equal(ui.container.querySelectorAll('.olive-orchard-art [role="button"]').length,0);
  assert.equal(ui.queryByRole('radio'),null);
  assert.equal(ui.queryByText(/استكشفت|تمتص الجذور|بانتظار التسجيل/),null);
  assert.ok(ui.getByText('مرحبًا أيها المستكشف! نحن نأكل ثمار الزيتون، ولكن كيف تحصل شجرة الزيتون على غذائها؟'));
  const button=ui.getByRole('button',{name:'اكتشف معرفتك السابقة'});assert.equal(button.hasAttribute('disabled'),false);fireEvent.click(button);assert.equal(pre,1);
  fireEvent.click(ui.getByRole('button',{name:'العودة إلى الجزيرة'}));assert.equal(back,1);
 }finally{cleanup();}
});
test('orchard sound remains opt-in and no removed hotspot sound is triggered',async()=>{
 dom.window.localStorage.clear();const play=soundManager.play,bed=soundManager.playBed,release=soundManager.releaseBed;
 const effects:string[]=[];let starts=0,stops=0;soundManager.play=async effect=>{effects.push(effect);return true;};soundManager.playBed=async()=>{starts++;return true;};soundManager.releaseBed=()=>{stops++;};
 const ui=render(<OliveOrchardIntro enabled reduced={false} onBack={()=>{}} onPre={()=>{}} teacherText="نص"/>);
 try{
  assert.equal(starts,0);await act(async()=>fireEvent.click(ui.getByRole('button',{name:'تشغيل أجواء البستان'})));assert.equal(starts,1);
  fireEvent.click(ui.getByRole('img',{name:/بستان زيتون فلسطيني/}));
  assert.ok(effects.includes('start'));assert.equal(effects.includes('water'),false);assert.equal(effects.includes('move'),false);assert.equal(effects.includes('success'),false);
  fireEvent.click(ui.getByRole('button',{name:'كتم أجواء البستان'}));assert.ok(stops>=1);
 }finally{cleanup();soundManager.play=play;soundManager.playBed=bed;soundManager.releaseBed=release;}
 assert.ok(stops>=2);
});
