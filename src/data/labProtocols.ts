import type { SoundEffect } from "../engine/sound";
export type LabAction = {
  label: string;
  patch: Record<string, number>;
  sound: SoundEffect;
  tool: "dropper" | "water" | "light" | "sample" | "scope" | "switch" | "plant";
};
const a = (
  label: string,
  patch: Record<string, number>,
  tool: LabAction["tool"] = "sample",
  sound: SoundEffect = "tool",
): LabAction => ({ label, patch, tool, sound });
export const labProtocols: Record<string, LabAction[]> = {
  photo: [
    a("اسقِ التربة", { water: 1 }, "water", "water"),
    a("وجّه الضوء إلى الأوراق", { light: 1 }, "light"),
    a("وفّر هواءً يحتوي ثاني أكسيد الكربون", { co2: 1 }, "switch"),
  ],
  iodine: [
    a("جهّز العينة والأنبوب الضابط", { starch: 1, iodine: 0 }),
    a("أضف قطرات لوغول", { iodine: 1 }, "dropper", "move"),
  ],
  mold: [
    a("رطّب عينة الخبز", { moisture: 70 }, "water", "water"),
    a("اختر مكانًا معتدل الدفء", { temperature: 24 }, "switch"),
    a("تابع خمسة أيام افتراضية", { days: 5 }, "switch", "time"),
  ],
  metabolism: [
    a("اجمع وحدات أبسط: بناء", { build: 1 }),
    a("قارن بتفكيك المركب: هدم", { build: 0 }, "switch"),
  ],
  respiration: [
    a("ضع عينة نباتية حية", { living: 1 }, "plant"),
    a("وفّر الأكسجين وتتبّع الغاز", { oxygen: 1 }, "switch"),
  ],
  yeast: [
    a("أضف السكر", { sugar: 1 }),
    a("أضف الخميرة", { yeast: 1 }),
    a("استخدم ماءً دافئًا باعتدال", { temperature: 30 }, "water", "water"),
  ],
  growth: [
    a("اسقِ الشتلة", { water: 1 }, "water", "water"),
    a("تابع دورة النمو الافتراضية", { time: 100 }, "plant", "time"),
  ],
  cell: [
    a("اختر خلية للفحص", { time: 100 }, "scope"),
    a("تابع تضاعف المكونات وانقسام الخلية", { time: 100 }, "scope"),
  ],
  age: [
    a("ابدأ بالطفولة", { time: 12 }),
    a("قارن مراحل العمر", { time: 80 }, "switch", "time"),
  ],
  micro: [
    a("اختر البراميسيوم", { organism: 0 }, "scope"),
    a("اضبط العدسة ومجال الرؤية", { zoom: 3, pan: 50 }, "scope"),
  ],
  "micro-euglena": [
    a("اختر اليوغلينا", { organism: 1 }, "scope"),
    a("اضبط العدسة لرؤية السوط", { zoom: 3 }, "scope"),
  ],
  "micro-amoeba": [
    a("اختر الأميبا", { organism: 2 }, "scope"),
    a("اضبط العدسة لرؤية الامتدادات", { zoom: 3 }, "scope"),
  ],
  urine: [
    a("تتبّع الدم عند الكلية", { time: 100 }),
    a("تتبّع مسار البول إلى الخارج", { time: 100 }, "switch", "water"),
  ],
  sweat: [
    a("راقب أثناء الراحة", { activity: 20 }),
    a("قارن بعد نشاط بدني", { activity: 75 }, "switch"),
  ],
  transpiration: [
    a("ضع النبات", { plant: 1 }, "plant"),
    a("غطّ التربة لتقليل التبخر منها", { covered: 1 }),
    a("ضع الناقوس وتابع التكاثف", { time: 100 }, "switch", "time"),
  ],
  environment: [
    a("تتبّع مصدر التلوث", { pollution: 70, treatment: 0 }),
    a("امنع المصدر وفعّل المعالجة", { treatment: 1 }, "switch"),
  ],
  reflex: [
    a("شاهد الطرق الافتراضي الآمن", { stimulus: 1 }, "switch"),
    a("قارن دون مؤثر", { stimulus: 0 }, "switch"),
  ],
  response: [
    a("وجّه المؤثر نحو النبات", { kind: 0, side: 1 }, "light"),
    a("قارن باستجابة الحدقة", { kind: 1 }, "light"),
  ],
  phototropism: [
    a("ضع البادرة في الصندوق", { time: 3 }, "plant"),
    a("افتح منفذ الضوء الجانبي", { light: 1, side: 1 }, "light"),
  ],
  budding: [
    a("اختر خلية خميرة", { time: 100 }, "scope"),
    a("تابع نشوء البرعم وانفصاله", { time: 100 }, "scope", "time"),
  ],
  fission: [
    a("اختر أميبا", { time: 100 }, "scope"),
    a("تابع الانشطار إلى خليتين", { time: 100 }, "scope", "time"),
  ],
  vegetative: [
    a("جرّب فسيلة مناسبة", { method: 0, suitable: 1, time: 100 }, "plant"),
    a("قارن بالترقيد", { method: 1 }, "plant"),
    a("قارن بالتطعيم", { method: 2 }, "plant"),
  ],
  sexual: [
    a("تتبّع انتقال اللقاح", { gametes: 1, time: 100 }, "plant"),
    a("تابع الإخصاب وتكوّن البذرة", { gametes: 1, time: 100 }, "scope", "time"),
  ],
};
export function simulationCue(
  id: string,
  t: number,
  vars?: Record<string, number>,
): SoundEffect {
  if (id === "yeast") return t < 0.9 ? "bubble" : "discover";
  if (id === "metabolism")
    return (vars ? vars.build > 0 : t < 0.5) ? "combine" : "separate";
  if (id === "iodine") return t < 0.65 ? "drop" : "discover";
  if (
    id === "mold" ||
    [
      "growth",
      "age",
      "budding",
      "fission",
      "vegetative",
      "phototropism",
    ].includes(id)
  )
    return t < 0.9 ? "time" : "discover";
  if (["photo", "urine", "sweat", "transpiration"].includes(id))
    return t < 0.9 ? "water" : "discover";
  return t < 0.9 ? "step" : "discover";
}
export const labObjectives: Record<string, string> = {
  photo: "أربط صنع الغذاء بتوفر الضوء والماء وثاني أكسيد الكربون.",
  iodine: "أكشف النشا بمقارنة تغير اللون مع أنبوب ضابط.",
  mold: "أقارن نمو العفن عند اختلاف الرطوبة والحرارة والزمن.",
  metabolism: "أميز البناء والهدم وعلاقتهما بالطاقة.",
  respiration: "أستدل على تنفس النبات من تغير ماء الجير.",
  yeast: "أفسر أثر السكر والخميرة والحرارة في تصاعد الغاز.",
  growth: "ألاحظ ازدياد حجم النبات مع تقدم النمو.",
  cell: "أتتبع تكوّن خليتين من خلية.",
  age: "أقارن مراحل العمر واحتياجات النمو.",
  micro: "أربط حركة البراميسيوم بالأهداب.",
  "micro-euglena": "ألاحظ دور السوط في حركة اليوغلينا.",
  "micro-amoeba": "ألاحظ الامتدادات وتغير شكل الأميبا أثناء الحركة.",
  urine: "أتتبع مسار البول عبر الجهاز البولي.",
  sweat: "أقارن إخراج الغازات والعرق مع تغير النشاط.",
  transpiration: "أستدل على النتح مع الحد من تبخر ماء التربة.",
  environment: "أفسر أثر منع مصدر التلوث ومعالجة الفضلات.",
  reflex: "أتتبع مؤثرًا واستجابة سريعة في نموذج آمن.",
  response: "أميز المؤثر والاستجابة في النبات والإنسان.",
  phototropism: "أقارن اتجاه نمو الساق والجذر بالنسبة للضوء.",
  budding: "أتتبع نمو برعم في الخميرة وانفصاله.",
  fission: "أتتبع انشطار أميبا إلى فردين.",
  vegetative: "أقارن الفسائل والترقيد والتطعيم.",
  sexual: "أميز انتقال اللقاح والإخصاب وتكوّن البذور.",
};
export const initialLabMaterials: Record<string, Record<string, number>> = {
  photo: { water: 0, light: 0, co2: 0 },
  iodine: { iodine: 0 },
  yeast: { sugar: 0, yeast: 0 },
  growth: { water: 0, time: 0 },
  respiration: { living: 0, oxygen: 1 },
  transpiration: { plant: 0, covered: 0, time: 100 },
  sexual: { gametes: 0, time: 100 },
  reflex: { stimulus: 0 },
  cell: { time: 0 },
  budding: { time: 0 },
  fission: { time: 0 },
  vegetative: { time: 0 },
};
