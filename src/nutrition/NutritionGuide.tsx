import { useEffect, useState } from "react";
import { Volume2, Pause, Lightbulb, X } from "lucide-react";
import { TeacherCharacter } from "../components/PalestinianGuide";
import { useNutritionVoice } from "./voice";
const tips: Record<string, string[]> = {
  intro: [
    "ما رأيك؟ من أين يأتي غذاء شجرة الزيتون؟",
    "ابدأ بتوقع، ثم اكتشف بنفسك.",
  ],
  nutrition: [
    "قارن شجرة الزيتون بالأرنب والفطر.",
    "أيها يصنع غذاءه في أجزائه الخضراء؟",
  ],
  photosynthesis: [
    "تتبّع الماء والضوء والغازات.",
    "غيّر عاملًا واحدًا، ثم قارن.",
  ],
  starch: ["راقب لون العينة والماء الضابط.", "قارن قبل إضافة لوغول وبعده."],
  feeding: [
    "هل الغذاء من بقايا ميتة أم مضيف حي؟",
    "لاحظ مصدر الغذاء، لا شكل الكائن فقط.",
  ],
  animals: ["تتبّع ما يأكله الكائن.", "هل غذاؤه نباتي، أم حيواني، أم كلاهما؟"],
};
export function NutritionGuide({
  context,
  notice = "",
}: {
  context: string;
  notice?: string;
}) {
  const [open, setOpen] = useState(context === "intro"),
    [level, setLevel] = useState(0);
  const voice = useNutritionVoice(context);
  useEffect(() => {
    setLevel(0);
    setOpen(context === "intro");
  }, [context]);
  useEffect(() => {
    if (notice) setOpen(true);
  }, [notice]);
  const shortNotice = notice.split(/[.؟]/u)[0];
  return (
    <aside className="nutrition-guide" aria-label="دليلتك الفلسطينية">
      <button
        className="nutrition-guide-character"
        aria-label="اسأل المرشدة"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <TeacherCharacter />
      </button>
      {!open ? (
        <button className="plain" onClick={() => setOpen(true)}>
          تلميح
        </button>
      ) : (
        <div className="nutrition-guide-bubble">
          <p aria-live="polite">
            {shortNotice ||
              tips[context]?.[Math.min(level, 1)] ||
              "راقب، ثم جرّب."}
          </p>
          <div className="nutrition-guide-actions">
            <button
              onClick={() => {
                setLevel((n) => n + 1);
              }}
            >
              <Lightbulb size={16} /> تلميح آخر
            </button>
            {voice.clip && (
              <>
                <button
                  aria-label="استمع إلى المرشدة"
                  onClick={() => void voice.play()}
                >
                  <Volume2 size={16} /> استمع
                </button>
                <button aria-label="أوقف صوت المرشدة" onClick={voice.stop}>
                  <Pause size={16} />
                </button>
                <details>
                  <summary>النص</summary>
                  <p>{voice.clip.transcript}</p>
                </details>
              </>
            )}
            <button
              aria-label="إغلاق التلميح"
              onClick={() => {
                voice.stop();
                setOpen(false);
              }}
            >
              <X size={16} />
            </button>
          </div>
          {voice.error && <p role="status">تعذر تشغيل الصوت. حاول مجددًا.</p>}
        </div>
      )}
    </aside>
  );
}
