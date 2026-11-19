import React from "react";
import { JSDOM } from "jsdom";
import { test } from "node:test";
import assert from "node:assert/strict";
const dom = new JSDOM('<html><body></body></html>', {url:'http://localhost/Biology/'});
Object.defineProperty(globalThis,'window',{value:dom.window,configurable:true});
Object.defineProperty(globalThis,'document',{value:dom.window.document,configurable:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
Object.assign(globalThis,{HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
const {render,fireEvent,cleanup,act} = await import('@testing-library/react');
const {NutritionDiscovery,discoveryConclusion}=await import('../src/components/NutritionDiscovery');
const {PalestinianGuide}=await import('../src/components/PalestinianGuide');
const {IslandSound}=await import('../src/components/IslandSound');
const {soundManager}=await import('../src/engine/sound');
soundManager.configure(false);
test('discovery keeps prediction before experiment, reveals comparison only on request and restores drafts',()=>{
 dom.window.localStorage.clear();
 let tip=''; const hint=(v:string)=>{tip=v;};
 const ui=render(<NutritionDiscovery onHint={hint}/>);
 try {
  assert.equal(ui.queryByText(discoveryConclusion),null);
  const areas=ui.getAllByRole('textbox');
  fireEvent.change(areas[0],{target:{value:'أتوقع توقف صنع الغذاء'}});
  fireEvent.click(ui.getByText('ثبّت توقعي'));
  fireEvent.change(ui.getByLabelText(/الضوء:/),{target:{value:'0'}});
  assert.match(tip,/شروط البناء/);
  assert.match(ui.container.textContent!,/توقفت مؤشرات/);
  fireEvent.change(areas[1],{target:{value:'اختفى مؤشر الأكسجين'}});
  fireEvent.change(areas[2],{target:{value:'الماء مادة والضوء طاقة'}});
  fireEvent.click(ui.getByText('اكتشف التفسير العلمي'));
  assert.ok(ui.getByText(discoveryConclusion));
  assert.match(ui.container.textContent!,/أتوقع توقف صنع الغذاء/);
 } finally {cleanup();}
 const restored=render(<NutritionDiscovery onHint={hint}/>);
 try { assert.equal((restored.getAllByRole('textbox')[1] as HTMLTextAreaElement).value,'اختفى مؤشر الأكسجين');
  fireEvent.click(restored.getByText('إعادة التجربة'));
  assert.equal((restored.getByLabelText(/الضوء:/) as HTMLInputElement).value,'1');
  assert.equal((restored.getAllByRole('textbox')[0] as HTMLTextAreaElement).value,'أتوقع توقف صنع الغذاء');
 } finally {cleanup();}
});
test('guide gives progressive contextual hints and can be dismissed, hidden and restored',()=>{
 const ui=render(<PalestinianGuide name="نور" context="growth" hints={['راقب نمو الشتلة','قارن الحجم بمرور الزمن']}/>);
 try {assert.ok(ui.getByText('راقب نمو الشتلة')); fireEvent.click(ui.getByText('أعطني تلميحًا'));
  assert.ok(ui.getByText('قارن الحجم بمرور الزمن')); fireEvent.click(ui.getByText('فهمت، شكرًا'));
  fireEvent.click(ui.getByText('إخفاء المساعدة')); assert.ok(ui.getByText('إظهار المساعدة'));
  fireEvent.click(ui.getByText('إظهار المساعدة')); assert.ok(ui.getByLabelText('تلميحات المساعدة الفلسطينية'));
  ui.rerender(<PalestinianGuide name="نور" context="movement" hints={['راقب الأهداب','قارن وسائل الحركة']}/>);
  assert.ok(ui.getByText('راقب الأهداب'));
 }finally{cleanup();}
});
test('island attempts playback once, offers fallback after rejection and releases audio on leaving',async()=>{
 const play=soundManager.playMedia, release=soundManager.releaseMedia;
 let attempts=0,releases=0;
 soundManager.playMedia=async()=>{attempts++;return attempts>1;};
 soundManager.releaseMedia=()=>{releases++;};
 const ui=render(<IslandSound enabled/>);
 try {await act(async()=>{await Promise.resolve();}); assert.equal(attempts,1);
  assert.match(ui.container.textContent!,/المتصفح يحتاج/);
  ui.rerender(<IslandSound enabled/>); assert.equal(attempts,1);
  await act(async()=>{fireEvent.click(ui.getByText('ابدأ الرحلة بالصوت'));});
  assert.ok(ui.getByText('صوت الجزيرة يعمل'));
 }finally{cleanup();soundManager.playMedia=play;soundManager.releaseMedia=release;}
 assert.equal(releases,1);
});
test('quiz and activity selections survive unmount without awarding completion',async()=>{
 dom.window.localStorage.clear();
 const {Matching}=await import('../src/components/Activities');
 const {CardOrdering}=await import('../src/components/CardOrdering');
 const {Quiz}=await import('../src/components/Quiz');
 const {lessons,bank}=await import('../src/data/lessons');
 let awards=0;
 const lesson=lessons[0];
 let ui=render(<Matching lesson={lesson} done={false} onDone={()=>awards++}/>);
 fireEvent.change(ui.getAllByRole('combobox')[0],{target:{value:lesson.pairs[0][1]}}); cleanup();
 ui=render(<Matching lesson={lesson} done={false} onDone={()=>awards++}/>);
 assert.equal((ui.getAllByRole('combobox')[0] as HTMLSelectElement).value,lesson.pairs[0][1]);cleanup();
 ui=render(<CardOrdering items={lesson.order} done={false} onDone={()=>awards++}/>);
 fireEvent.click(ui.getByRole('button',{name:lesson.order[0]}));cleanup();
 ui=render(<CardOrdering items={lesson.order} done={false} onDone={()=>awards++}/>);
 assert.ok(ui.getByRole('button',{name:`إلغاء اختيار ${lesson.order[0]}`}));cleanup();
 ui=render(<Quiz title="اختبار" questions={bank(lesson,'pre')} onFinish={()=>awards++}/>);
 fireEvent.click(ui.getAllByRole('radio')[0]);cleanup();
 ui=render(<Quiz title="اختبار" questions={bank(lesson,'pre')} onFinish={()=>awards++}/>);
 assert.equal((ui.getAllByRole('radio')[0] as HTMLInputElement).checked,true);cleanup();
 assert.equal(awards,0);
});
