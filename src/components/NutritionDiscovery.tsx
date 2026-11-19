import { useEffect, useState } from "react";
import { useDraft, useDraftState } from "../engine/drafts";
import { simulate } from "../engine/models";
import { ScientificScene } from "./science/ScientificScene";
import { useSound } from "./SoundSystem";
export const discoveryConclusion = "يستخدم النبات الأخضر الماء وثاني أكسيد الكربون والطاقة الضوئية لصنع غذائه بعملية البناء الضوئي، وينتج عنها الأكسجين";
export function NutritionDiscovery({ onHint }: { onHint: (tip: string) => void }) {
  const [draft, setDraft, failed] = useDraft("nutrition-discovery-v1", { prediction: "", fixed: "", observation: "", conclusion: "", revealed: false, light: 1, water: 1, co2: 1 });
  const [t, setT] = useDraftState("nutrition-discovery-clock",0);
  const [running, setRunning] = useState(false);
  const sound = useSound();
  const vars = { light: draft.light, water: draft.water, co2: draft.co2 };
  const available = Math.min(...Object.values(vars)) > 0;
  const reduced = document.documentElement.dataset.reduced === "true";
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setT(n => (n + (reduced ? .25 : .025)) % 1), reduced ? 1400 : 120);
    return () => window.clearInterval(timer);
  }, [running, reduced]);
  const tip = !draft.fixed ? "اكتب ما تتوقعه أولًا؛ لا تقلق من صحة التوقع، ستختبره بنفسك." : !available ? "لاحظ ما تغير! هل ما زالت جميع شروط البناء الضوئي متوفرة؟" : running ? "جرّب حجب الضوء، وراقب مؤشرات صنع الغذاء، ثم قارن مع منع الماء." : draft.revealed ? "أحسنت! قارن تفسيرك بتوقعك، وحدد ما تغير في فهمك." : draft.observation ? "فكر في دور الماء والضوء وثاني أكسيد الكربون معًا، واستند إلى ما شاهدته." : "صف ما شاهدته عند تغيير عامل واحد، وليس ما تتوقع حدوثه فقط.";
  useEffect(() => { onHint(tip); return () => onHint(""); }, [tip, onHint]);
  const update = (key: "light" | "water" | "co2", value: number) => { setDraft(d => ({ ...d, [key]: value })); sound.play(key === "water" ? "water" : "tool"); };
  const result = simulate("photo", vars, available ? t : 0);
  return <section className="card discovery" data-sound-scope="custom">
    <span className="eyebrow">أتوقع ← أجرب وأكتشف ← ألاحظ وأستنتج ← أكتشف التفسير العلمي</span>
    <h2>كيف يصنع النبات غذاءه؟</h2>
    {failed && <p role="alert">تعذر الحفظ المحلي. انسخ إجاباتك قبل مغادرة الصفحة.</p>}
    <section><h3>أولًا: أتوقع</h3>
      <label>ماذا تتوقع أن يحدث لعملية صنع الغذاء في النبات إذا غاب الضوء أو الماء؟
        <textarea maxLength={1500} value={draft.prediction} onFocus={() => onHint("لا تقلق من الإجابة، اكتب ما تتوقعه، ثم اكتشف بنفسك!")} onChange={e => setDraft(d => ({ ...d, prediction: e.target.value }))} />
      </label>
      <button disabled={!draft.prediction.trim()} onClick={() => { setDraft(d => ({ ...d, fixed: d.prediction, revealed: false })); sound.play("check"); }}>ثبّت توقعي</button>
      {draft.fixed && <p role="status">تم تثبيت توقعك للمقارنة بعد التجربة.</p>}
    </section>
    <section><h3>ثانيًا: أجرب وأكتشف</h3><p>غيّر عاملًا واحدًا في كل مرة، ثم قارِن مؤشرات العملية. لا يذبل النبات فور حجب الضوء.</p>
      <ScientificScene id="photo" vars={vars} t={available ? t : 0} value={result.value} />
      <div className="discovery-controls">{([['light','الضوء'],['water','الماء'],['co2','ثاني أكسيد الكربون']] as const).map(([key,label]) => <label key={key}>{label}: {Math.round(draft[key]*100)}%<input type="range" min="0" max="1" step="0.25" value={draft[key]} onChange={e => update(key,+e.target.value)} /></label>)}</div>
      <div className="button-row"><button onClick={() => { setRunning(!running); sound.play("start"); }}>{running ? "إيقاف مؤقت" : "تشغيل التجربة"}</button><button onClick={() => { setRunning(false); setT(0); setDraft(d => ({ ...d, light: 1, water: 1, co2: 1 })); sound.play("step"); }}>إعادة التجربة</button></div>
      <p role="status">{!available ? "توقفت مؤشرات صنع الغذاء في النموذج لغياب عامل أساسي. بقاء شكل النبات ثابتًا لا يعني استمرار العملية." : running ? "راقب انتقال المواد ومؤشرات صنع الغذاء مع مرور الزمن الافتراضي." : "التجربة متوقفة. اختر تشغيل لمراقبة انتقال المواد."}</p>
      <p>مؤشر صنع الغذاء: {!available ? "متوقف" : Math.min(...Object.values(vars)) < .5 ? "أقل نسبيًا" : "متاح وفق العوامل المختارة"}</p>
      <details className="experiment-information"><summary>معلومات التجربة</summary><p>الجسيمات والأسهم توضيح لعمليات مجهرية لا ترى بهذه الصورة بالعين. العرض للمقارنة وليس قياسًا مخبريًا، ويمكن مشاهدة حالات متباعدة عند تقليل الحركة.</p></details>
    </section>
    <section><h3>ثالثًا: ألاحظ وأفسر</h3>
      <label>ماذا لاحظت عند تغيير كمية الضوء أو منع وصول الماء إلى النبات؟<textarea maxLength={1500} value={draft.observation} onFocus={() => onHint("صف ما شاهدته في التجربة، وليس ما تتوقع حدوثه فقط.")} onChange={e => setDraft(d => ({ ...d, observation: e.target.value }))} /></label>
      <label>كيف يساعد الماء والضوء وثاني أكسيد الكربون النبات على صنع غذائه؟<textarea maxLength={1500} value={draft.conclusion} onFocus={() => onHint("فكر في دور الماء والضوء وثاني أكسيد الكربون معًا.")} onChange={e => setDraft(d => ({ ...d, conclusion: e.target.value }))} /></label>
      <button onClick={() => { setDraft(d => ({ ...d, revealed: true })); sound.play("check"); }}>اكتشف التفسير العلمي</button>
    </section>
    {draft.revealed && <div className="discovery-result" role="status"><h3>أكتشف التفسير العلمي</h3><p>الماء وثاني أكسيد الكربون مادتان تدخلان في العملية، والضوء يزوّدها بالطاقة. عند غياب أحدها تتوقف مؤشرات البناء الضوئي في نموذجنا المبسط.</p><p><b>توقعي قبل التجربة:</b> {draft.fixed || "لم تثبت توقعًا بعد. يمكنك العودة وكتابته."}</p><p>قارن إجابتك بالتفسير: ما الدليل الذي غيّر فكرتك؟ لا تُصحح الإجابات النصية آليًا ولا تمنح إتقان المختبر.</p><h3>حصيلة اكتشافي</h3><p>{discoveryConclusion}</p></div>}
  </section>;
}
