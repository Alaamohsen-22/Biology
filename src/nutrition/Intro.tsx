import { nutritionOpeningGoals } from "../data/nutritionOpening";
import audioConfig from "../data/audio.json";
import { TeacherAudio } from "../components/Audio";
import { useState } from "react";
import { Droplets, Leaf, Sun } from "lucide-react";
import { OliveOrchardScene } from "../components/OliveOrchardScene";
import { NutritionGuide } from "./NutritionGuide";
import { useDraft } from "../engine/drafts";
export function NutritionIntro({
  onStart,
  onPre,
  sound,
}: {
  onStart: () => void;
  onPre: () => void;
  sound: boolean;
}) {
  const [part, setPart] = useState("");
  const [draft, setDraft] = useDraft("nutrition-visual-intro-v1", {
    prediction: -1,
  });
  const facts: Record<string, string> = {
    roots: "تمتص الجذور الماء والأملاح من التربة.",
    leaves: "للأوراق دور مهم في صنع الغذاء.",
    sun: "يوفر الضوء الطاقة اللازمة للبناء الضوئي.",
  };
  return (
    <section className="nutrition-intro">
      <span className="nutrition-kicker">بستان قرب نابلس</span>
      <h1>سرّ غذاء شجرة الزيتون</h1>
      <p className="nutrition-question">
        نأكل ثمارها… فكيف تحصل هي على غذائها؟
      </p>
      <div className={`nutrition-orchard explore-${part}`}>
        <OliveOrchardScene />
      </div>
      <div
        className="orchard-part-picker"
        role="group"
        aria-label="استكشف الشجرة"
      >
        <button
          aria-pressed={part === "roots"}
          onClick={() => setPart("roots")}
        >
          <Droplets size={18} /> الجذور
        </button>
        <button
          aria-pressed={part === "leaves"}
          onClick={() => setPart("leaves")}
        >
          <Leaf size={18} /> الأوراق
        </button>
        <button aria-pressed={part === "sun"} onClick={() => setPart("sun")}>
          <Sun size={18} /> الشمس
        </button>
      </div>
      {part && (
        <p className="orchard-discovery" role="status">
          {facts[part]}
        </p>
      )}
      <details className="nutrition-prediction">
        <summary>ما توقعك؟</summary>
        <fieldset>
          <legend>من أين يأتي غذاء الشجرة؟</legend>
          {[
            "من التربة غذاءً جاهزًا.",
            "تصنعه بنفسها باستخدام مواد من بيئتها والطاقة الضوئية.",
            "من ثمار الزيتون.",
          ].map((text, i) => (
            <label key={text}>
              <input
                type="radio"
                name="nutrition-start-prediction"
                checked={draft.prediction === i}
                onChange={() => setDraft({ prediction: i })}
              />
              {text}
            </label>
          ))}
        </fieldset>
        {draft.prediction >= 0 && <p role="status">سنختبر فكرتك معًا.</p>}
      </details>
      <details className="goals-disclosure">
        <summary>ماذا سأتعلم في هذا الدرس؟</summary>
        <ul>
          {nutritionOpeningGoals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </details>
      <NutritionGuide context="intro" />
      {(audioConfig as Record<string, string>)["1.intro"] && (
        <TeacherAudio
          lesson={1}
          section="intro"
          enabled={sound}
          text="نأكل ثمار الزيتون، فكيف تحصل شجرته على غذائها؟"
        />
      )}
      <div className="nutrition-intro-actions">
        <button className="primary" onClick={onStart}>
          هيا نستكشف!
        </button>
        <button onClick={onPre}>معرفتي السابقة</button>
      </div>
    </section>
  );
}
