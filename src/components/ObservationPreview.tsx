import { useState } from "react";
import type { Lesson } from "../data/lessons";
import { simulate } from "../engine/models";
import { ScientificScene } from "./science/ScientificScene";
import { useSound } from "./SoundSystem";
export function ObservationPreview({ lesson }: { lesson: Lesson }) {
  const [stage, setStage] = useState(0);
  const sound = useSound();
  const scene = lesson.scenes[0];
  const vars = Object.fromEntries(
    scene.variables.map((v) => [
      v.key,
      v.key === "time" ? (scene.id === "age" ? stage * 20 : 100) : v.initial,
    ]),
  );
  const t = stage / 2;
  const result = simulate(scene.id, vars, t);
  return (
    <div className="observation-preview" data-sound-scope="custom">
      <h3>لاحظ قبل أن تفسّر</h3>
      <ScientificScene id={scene.id} vars={vars} t={t} value={result.value} />
      <div className="button-row">
        {["الحالة الابتدائية", "تغير في منتصف الظاهرة", "قارن النتيجة"].map(
          (label, i) => (
            <button
              key={label}
              aria-pressed={stage === i}
              onClick={() => {
                setStage(i);
                sound.play("step");
              }}
            >
              {label}
            </button>
          ),
        )}
      </div>
      <p className="muted">
        قارن ما تشاهده بتوقعك، ثم جرّب العوامل في المختبر.
      </p>
    </div>
  );
}
