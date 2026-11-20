import { useState } from "react";
import { SpecimenArt } from "./Artwork";
import { ProcessDiagram, AnimalComparison } from "./VisualLesson";
import { ScientificScene } from "../components/science/ScientificScene";
const sections = [
  { id: "nutrition", title: "التغذية" },
  { id: "photosynthesis", title: "صنع الغذاء" },
  { id: "starch", title: "الكشف عن النشا" },
  { id: "feeding", title: "ترمم وتطفل" },
  { id: "animals", title: "غذاء الحيوانات" },
];
export function NutritionInfographic({
  onConcept,
}: {
  onConcept: (i: number) => void;
}) {
  const [selected, setSelected] = useState("nutrition");
  return (
    <section
      className="lesson-infographic nutrition-infographic"
      aria-label="إنفوجرافيك التغذية"
      data-sound-scope="custom"
    >
      <div
        className="infographic-tabs"
        role="group"
        aria-label="استكشف خلاصة التغذية"
      >
        {sections.map((s) => (
          <button
            key={s.id}
            aria-pressed={selected === s.id}
            onClick={() => setSelected(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>
      {selected === "nutrition" && (
        <figure className="nutrition-tree">
          <h2>كيف تحصل على غذائها؟</h2>
          <div className="nutrition-tree-branches">
            <section>
              <SpecimenArt kind="olive" label="شجرة الزيتون ذاتية التغذية" />
              <strong>ذاتية</strong>
              <p>تصنع غذاءها.</p>
            </section>
            <section>
              <div className="paired-specimens">
                <SpecimenArt kind="rabbit" label="الأرنب" />
                <SpecimenArt kind="fungus" label="الفطر" />
              </div>
              <strong>غير ذاتية</strong>
              <p>تعتمد على مصادر عضوية أخرى.</p>
            </section>
          </div>
        </figure>
      )}
      {selected === "photosynthesis" && (
        <>
          <h2>مدخلات ونواتج</h2>
          <ProcessDiagram />
        </>
      )}
      {selected === "starch" && (
        <>
          <h2>لوغول يكشف النشا</h2>
          <ScientificScene
            id="iodine"
            vars={{ starch: 1, iodine: 1 }}
            t={1}
            value={1}
            compact
          />
          <p className="infographic-caption">
            <span className="starch-color" /> أزرق مسود: نشا{" "}
            <span className="control-color" /> ماء ضابط: بني مصفر
          </p>
        </>
      )}
      {selected === "feeding" && (
        <figure className="nutrition-tree">
          <h2>مصدر الغذاء هو الفرق</h2>
          <div className="nutrition-tree-branches">
            <section>
              <SpecimenArt
                kind="bread"
                label="عفن الخبز يتغذى على مواد عضوية ميتة"
              />
              <strong>ترمم</strong>
              <p>مواد عضوية ميتة.</p>
            </section>
            <section>
              <SpecimenArt
                kind="louse"
                label="القمل يحصل على غذائه من مضيف حي ويضره"
              />
              <strong>تطفل</strong>
              <p>مضيف حي يتضرر.</p>
            </section>
          </div>
        </figure>
      )}
      {selected === "animals" && (
        <>
          <h2>نصنّف وفق الغذاء</h2>
          <AnimalComparison />
        </>
      )}
      <button
        className="infographic-return"
        onClick={() => onConcept(sections.findIndex((s) => s.id === selected))}
      >
        راجع الفكرة
      </button>
    </section>
  );
}
