import React from 'react';
import {JSDOM} from 'jsdom';
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost/Biology/'});
for(const [key,value]of Object.entries({window:dom.window,document:dom.window.document,navigator:dom.window.navigator,HTMLElement:dom.window.HTMLElement}))Object.defineProperty(globalThis,key,{value,configurable:true});
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(dom.window,'AnimationEvent',{value:dom.window.Event,configurable:true});
const {render,fireEvent,cleanup}=await import('@testing-library/react');
const {nutritionDiagnostic,diagnosticScore,nutritionOpeningGoals}=await import('../src/data/nutritionOpening');
const {NutritionDiagnostic}=await import('../src/components/NutritionDiagnostic');
const {NutritionGoals}=await import('../src/components/NutritionGoals');
const {BookFrame}=await import('../src/components/BookFrame');
const {Simulation}=await import('../src/components/Simulation');
const {Quiz}=await import('../src/components/Quiz');
const {lessons,bank}=await import('../src/data/lessons');
const {soundManager}=await import('../src/engine/sound');
soundManager.configure(false);
beforeEach(()=>dom.window.localStorage.clear());
test('approved diagnostic wording and stable answer ids remain correct if option order changes',()=>{
 assert.deepEqual(nutritionDiagnostic.map(q=>q.text),['ماذا يحتاج الإنسان ليعيش وينمو؟','أيّ مما يأتي كائن حي؟','ماذا يحدث للنبات إذا لم يحصل على الماء مدة طويلة؟','لماذا يحتاج الإنسان إلى تناول الطعام؟','أيّ مما يأتي يُعدّ غذاءً للأرنب؟']);
 const answers=Object.fromEntries(nutritionDiagnostic.map(q=>{const reversed=[...q.options].reverse();const correct=reversed.find(o=>o.id===q.correctId)!;assert.ok(correct);return [q.id,correct.id];}));
 assert.deepEqual(diagnosticScore(answers),{correct:5,percent:100,complete:true});
 assert.deepEqual(bank(lessons[0],'pre').map(q=>q.options[q.answer]),['الغذاء.','شجرة الزيتون.','يذبل.','للحصول على الطاقة.','الأعشاب.']);
});
test('diagnostic displays one question, warns on missing answers, preserves editing and permits learning after zero',()=>{
 let finishes=0,score=-1,learned=0;
 const props={onFinish:(n:number)=>{finishes++;score=n;},onLearn:()=>learned++,onIntro:()=>{},onPage:()=>{}};
 let ui=render(<NutritionDiagnostic {...props}/>);
 try{
  assert.equal(ui.getAllByRole('radio').length,3);
  fireEvent.click(ui.getByText('إنهاء الاختبار'));
  assert.match(ui.getByRole('alert').textContent!,/دون إجابة/);assert.equal(finishes,0);
  for(let i=0;i<5;i++){
   const q=nutritionDiagnostic[i];assert.ok(ui.getByText(q.text));assert.equal(ui.queryByText('إجابة صحيحة'),null);
   const wrong=q.options.find(o=>o.id!==q.correctId)!;fireEvent.click(ui.getByText(wrong.text));
   if(i<4)fireEvent.click(ui.getByRole('button',{name:'التالي',exact:true}));
  }
  fireEvent.click(ui.getByLabelText('انتقل إلى السؤال 1'));
  assert.equal((ui.getByRole('radio',{name:/الألعاب/}) as HTMLInputElement).checked,true);
 }finally{cleanup();}
 ui=render(<NutritionDiagnostic {...props}/>);
 try{
  assert.equal((ui.getByRole('radio',{name:/الألعاب/}) as HTMLInputElement).checked,true);
  fireEvent.click(ui.getByText('إنهاء الاختبار'));assert.equal(finishes,1);assert.equal(score,0);
  assert.ok(ui.getByRole('heading',{name:'اكتشفت نقطة انطلاقك!'}));assert.equal(ui.queryByText(/راسب|فاشل/),null);
  fireEvent.click(ui.getByText('ابدأ رحلة التعلم'));assert.equal(learned,1);
 }finally{cleanup();}
});
test('six concise goals are presented without developer alignment notes',()=>{
 const ui=render(<NutritionGoals/>);
 try{assert.equal(ui.container.querySelectorAll('.nutrition-goal').length,6);for(const goal of nutritionOpeningGoals)assert.ok(ui.getByText(goal));assert.equal(ui.queryByText(/جدول مواءمة|ترتبط بالشرح|يقيس الهدف/),null);}finally{cleanup();}
});
test('one book page is rendered and sounds occur only on actual navigation, never by mount or no-op',()=>{
 const play=soundManager.play;const effects:string[]=[];soundManager.play=async e=>{effects.push(e);return true;};
 const props={pageKey:'cover',pageNumber:0,title:'الغلاف',cover:true,reduced:false,onIndex:()=>{},children:<p>غلاف أصلي</p>};
 const ui=render(<BookFrame {...props}/>);
 try{assert.equal(effects.length,0);ui.rerender(<BookFrame {...props}/>);assert.equal(effects.length,0);
  ui.rerender(<BookFrame {...props} pageKey="map" pageNumber={1} cover={false}/>);assert.deepEqual(effects,['book-open']);
  assert.equal(ui.getAllByTestId('single-book-page').length,1);
  ui.rerender(<BookFrame {...props} pageKey="goals" pageNumber={9} cover={false}/>);assert.equal(effects.at(-1),'page-turn');
  ui.rerender(<BookFrame {...props} pageKey="result" pageNumber={8} cover={false} resultPage/>);assert.equal(effects.at(-1),'diagnostic-result');
 }finally{cleanup();soundManager.play=play;}
});
test('turning pages restores simulation position, variables and mode without awarding observation by restoring',()=>{
 const scene=lessons[0].scenes[0];let watched=0;
 const props={scene,reduced:true,watched:false,experimented:false,onWatch:()=>watched++,onExperiment:()=>{}};
 let ui=render(<Simulation {...props}/>);
 fireEvent.click(ui.getByRole('button',{name:/جرّب بنفسك/}));
 fireEvent.change(ui.getAllByRole('slider')[0],{target:{value:'1'}});
 fireEvent.click(ui.getByRole('button',{name:'خطوة تالية',exact:true}));
 const t=(ui.getByRole('progressbar') as HTMLProgressElement).value;cleanup();
 ui=render(<Simulation {...props}/>);
 try{assert.equal((ui.getByRole('progressbar') as HTMLProgressElement).value,t);assert.equal((ui.getAllByRole('slider')[0] as HTMLInputElement).value,'1');assert.equal(ui.queryByRole('button',{name:'إيقاف مؤقت'}),null);assert.equal(watched,0);}finally{cleanup();}
});
test('submitted quizzes keep results when returning and do not rescore until an explicit retry',()=>{
 const questions=bank(lessons[1],'pre');let finished=0;
 const props={title:'اختبار محفوظ',questions,onFinish:()=>finished++};let ui=render(<Quiz {...props}/>);
 for(const q of questions)fireEvent.click(ui.container.querySelectorAll<HTMLInputElement>(`input[name="${q.id}"]`)[q.answer]);
 fireEvent.click(ui.getByRole('button',{name:/تصحيح الاختبار/}));assert.equal(finished,1);cleanup();
 ui=render(<Quiz {...props}/>);try{assert.ok(ui.getByText('100%'));assert.equal(ui.queryByRole('button',{name:/تصحيح الاختبار/}),null);assert.equal(finished,1);fireEvent.click(ui.getByText('إعادة الاختبار'));assert.ok(ui.getByRole('button',{name:/تصحيح الاختبار/}));}finally{cleanup();}
});
test('diagnostic question turns keep the live form mounted and page number synchronized',()=>{
 function DiagnosticBook(){const [page,setPage]=React.useState(0);return <BookFrame pageKey={`diagnostic-${page}`} contentKey="nutrition-pre" pageNumber={3+page} title="الاختبار القبلي" cover={false} reduced onIndex={()=>{}}><NutritionDiagnostic onPage={setPage} onFinish={()=>{}} onLearn={()=>{}} onIntro={()=>{}}/></BookFrame>;}
 const ui=render(<DiagnosticBook/>);
 try{for(let i=0;i<5;i++){assert.ok(ui.getByLabelText(`صفحة الكتاب ${3+i}`));assert.ok(ui.getByText(nutritionDiagnostic[i].text));fireEvent.click(ui.getByText(nutritionDiagnostic[i].options[0].text));if(i<4)fireEvent.click(ui.getByRole('button',{name:'التالي',exact:true}));}fireEvent.click(ui.getByLabelText('انتقل إلى السؤال 1'));assert.equal((ui.getAllByRole('radio')[0] as HTMLInputElement).checked,true);}finally{cleanup();}
});
test('page-edge swipes ignore vertical scrolling and activity dragging, support RTL and cancel safely',()=>{
 // jsdom has no PointerEvent; supply pointer coordinates just as a browser does.
 const pointer=(node:Element,type:string,x:number,y:number,id=1)=>{const event=new dom.window.Event(type,{bubbles:true});Object.defineProperties(event,{clientX:{value:x},clientY:{value:y},pointerId:{value:id}});fireEvent(node,event);};
 let next=0,previous=0;
 const ui=render(<BookFrame pageKey="lab" pageNumber={12} title="المختبر" cover={false} reduced onIndex={()=>{}} onNext={()=>next++} onPrevious={()=>previous++}><button>أداة تجربة</button></BookFrame>);
 try{
  const edge=ui.container.querySelector('.book-turn-edge')!;
  pointer(edge,'pointerdown',20,30);pointer(edge,'pointerup',100,180);assert.equal(next,0);
  const tool=ui.getByRole('button',{name:'أداة تجربة'});pointer(tool,'pointerdown',20,30);pointer(tool,'pointerup',150,30);assert.equal(next,0);
  pointer(edge,'pointerdown',20,30);pointer(edge,'pointerup',100,35);assert.equal(next,1);
  pointer(edge,'pointerdown',100,30);pointer(edge,'pointerup',20,35);assert.equal(previous,1);
  pointer(edge,'pointerdown',20,30);pointer(edge,'pointercancel',20,30);pointer(edge,'pointerup',150,30);assert.equal(next,1);
 }finally{cleanup();}
});
test('activity animations do not interrupt the book turn animation',()=>{
 const props={pageKey:'intro',pageNumber:2,title:'التغذية',cover:false,reduced:false,onIndex:()=>{},children:<div data-testid="animated-activity">نشاط</div>};
 const ui=render(<BookFrame {...props}/>);
 try{ui.rerender(<BookFrame {...props} pageKey="pre" pageNumber={3}/>);const sheet=ui.getByTestId('single-book-page');assert.match(sheet.className,/turn-forward/);fireEvent.animationEnd(ui.getByTestId('animated-activity'));assert.match(sheet.className,/turn-forward/);fireEvent.animationEnd(sheet);assert.match(sheet.className,/turn-none/);}finally{cleanup();}
});
