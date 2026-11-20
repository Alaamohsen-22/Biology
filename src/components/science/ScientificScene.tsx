import { Materials } from "./Materials";
import { createPortal } from "react-dom";
import { useId, useState, useRef, useEffect } from "react";
import type { Variables } from "../../engine/models";
import { PlantArt, VegetativeArt } from "./PlantArt";
import { IodineArt, YeastArt, RespirationArt, MoldArt } from "./LabArt";
import { UrinaryArt, SweatArt, ReflexArt } from "./HumanArt";
import { CellArt, AgeArt } from "./CellArt";
import { MicroArt } from "./MicroArt";
import { EnvironmentArt, CompostArt } from "./EnvironmentArt";
import { useSound } from "../SoundSystem";
export const scienceCatalog: Record<
  string,
  { title: string; parts: [string, string][] }
> = {
  photo: {
    title: "البناء الضوئي في الزيتون",
    parts: [
      ["الجذور والماء", "يمتص النبات الماء وينقله إلى الأجزاء الخضراء."],
      ["الورقة والضوء", "يمتص الكلوروفيل الطاقة الضوئية اللازمة لصنع الغذاء."],
      [
        "تبادل الغازات",
        "يدخل ثاني أكسيد الكربون وينطلق الأكسجين أثناء البناء الضوئي.",
      ],
    ],
  },
  iodine: {
    title: "اختبار لوغول للنشا",
    parts: [
      ["القطارة", "تضاف قطرات لوغول افتراضيًا دون استعمال كاشف حقيقي."],
      ["العينة", "الأزرق المسود دليل وجود النشا."],
      ["الضابط", "الماء مع لوغول يتيح مقارنة اللون."],
    ],
  },
  mold: {
    title: "ظروف نمو عفن الخبز",
    parts: [
      ["الرطوبة", "تساعد الرطوبة المناسبة نمو العفن."],
      ["الحرارة", "التبريد يبطئ النمو ولا يعقم الخبز."],
      ["الزمن", "نقارن ظروفًا خلال أيام افتراضية مسرعة."],
    ],
  },
  metabolism: {
    title: "البناء والهدم والطاقة",
    parts: [
      ["وحدات بسيطة", "يمكن جمعها في مواد أكثر تعقيدًا."],
      ["البناء", "يحتاج إلى طاقة."],
      ["الهدم", "تفكيك مواد معقدة، وتتحرر طاقة في عمليات مناسبة كالتنفس."],
    ],
  },
  respiration: {
    title: "تنفس النبات وماء الجير",
    parts: [
      ["عينة حية", "تتنفس الخلايا الحية في الضوء والظلام."],
      ["الناقوس المظلم", "يساعد عزل البناء الضوئي على تتبع دليل التنفس."],
      ["ماء الجير", "يتعكر بوجود ثاني أكسيد الكربون؛ نقارنه بضوابط مناسبة."],
    ],
  },
  yeast: {
    title: "تخمر الخميرة وانتفاخ البالون",
    parts: [
      ["الخميرة والسكر", "يتصاعد الغاز عند توافر الظروف المناسبة للتخمر."],
      ["البالون", "يتجمع فيه ثاني أكسيد الكربون."],
      ["الضابط", "محلول مماثل دون خميرة للمقارنة."],
    ],
  },
  growth: {
    title: "نمو البذرة إلى شتلة",
    parts: [
      ["الجذر", "ينمو ويمتص الماء."],
      ["الأوراق", "تظهر تدريجيًا مع نمو الشتلة."],
      ["الحجم والكتلة", "النمو زيادة حيوية، لا مجرد انتفاخ غير حي."],
    ],
  },
  cell: {
    title: "الانقسام الخلوي",
    parts: [
      ["الخلية الأصل", "تستعد للانقسام."],
      ["المادة الوراثية", "تتضاعف قبل توزيعها؛ التمثيل مبسط."],
      ["خليتان", "يسهم ازدياد عدد الخلايا في النمو."],
    ],
  },
  age: {
    title: "مراحل نمو الإنسان",
    parts: [
      ["المراحل", "طفولة ومراهقة ورشد وشيخوخة."],
      ["الفروق الفردية", "لا يتطابق توقيت النمو ومعدله بين الأفراد."],
      ["الصحة", "التغذية المتوازنة والنوم والنشاط وطلب الدعم عادات مساعدة."],
    ],
  },
  micro: {
    title: "البراميسيوم والأهداب",
    parts: [
      ["الأهداب", "زوائد قصيرة كثيرة تتحرك بتناسق."],
      ["مجال المجهر", "صورة تخطيطية، لا عينة حقيقية."],
      ["التكبير", "يغير الحجم الظاهر ولا يغير نوع الكائن."],
    ],
  },
  "micro-euglena": {
    title: "اليوغلينا والسوط",
    parts: [
      ["السوط", "زائدة طويلة تساعد في دفع الجسم."],
      ["مجال المجهر", "حرّك موضع الرؤية للمقارنة."],
      ["التكبير", "لا يغير سرعة الكائن الحقيقية أو تركيبه."],
    ],
  },
  "micro-amoeba": {
    title: "الأميبا والأقدام الكاذبة",
    parts: [
      ["امتدادات مؤقتة", "يتغير شكل الأميبا أثناء الحركة."],
      ["السيتوبلازم", "ينساب المحتوى نحو الامتداد."],
      ["النواة", "جزء خلوي ظاهر في الرسم التخطيطي."],
    ],
  },
  urine: {
    title: "مسار البول في الجهاز البولي",
    parts: [
      ["الكليتان", "تنقيان الدم من بعض الفضلات والمواد الزائدة."],
      ["الحالبان", "ينقلان البول إلى المثانة."],
      ["المثانة", "تخزن البول مؤقتًا."],
      ["الإحليل", "يخرج البول عبره."],
    ],
  },
  sweat: {
    title: "الرئتان والجلد",
    parts: [
      [
        "الرئتان",
        "تتمددان وتنكمشان مع التنفس، ويخرج ثاني أكسيد الكربون وبخار الماء.",
      ],
      ["الغدة العرقية", "تنتج العرق الذي ينتقل في قناة إلى السطح."],
      ["التبخر", "يساعد تبخر العرق على التبريد؛ هذا مقطع مبسط."],
    ],
  },
  transpiration: {
    title: "ناقوس النتح والتكاثف",
    parts: [
      ["الأوراق", "يخرج منها بخار ماء بالنتح."],
      ["الناقوس", "يتكاثف البخار على سطحه الداخلي الأبرد."],
      ["غطاء التربة", "يقلل تداخل تبخر ماء التربة في تفسير القطرات."],
    ],
  },
  environment: {
    title: "حماية مياه وادي سلفيت",
    parts: [
      ["مصدر الملوثات", "منع دخول الملوثات أفضل من تركها تنتشر."],
      ["الماء والتربة", "قد تنقل الملوثات آثارًا إلى الكائنات والمزروعات."],
      ["المعالجة", "تخفيف الخطر لا يعني صلاحية الماء للشرب تلقائيًا."],
    ],
  },
  reflex: {
    title: "منعكس الركبة الافتراضي",
    parts: [
      ["المؤثر", "تنبيه افتراضي لوتر الرضفة."],
      ["المسار الشوكي", "تنتقل إشارة في نموذج مبسط لاستجابة سريعة."],
      ["العضلة", "انقباض العضلة يؤدي إلى امتداد الساق؛ لا طرق على جسم زميل."],
    ],
  },
  response: {
    title: "المؤثر والاستجابة",
    parts: [
      ["المؤثر", "تغير في البيئة أو داخل الكائن."],
      ["الاستجابة", "تغير نشاط الكائن نتيجة المؤثر."],
      ["الزمن", "تختلف سرعة الاستجابات؛ نمو النبات أبطأ من بعض المنعكسات."],
    ],
  },
  phototropism: {
    title: "بادرة تستجيب للضوء",
    parts: [
      ["فتحة الصندوق", "مصدر ضوء جانبي."],
      ["الساق", "يتغير اتجاه نموها نحو الضوء خلال أيام افتراضية."],
      ["الجذر", "يغمر الماء الجذر؛ وللجاذبية أثر في اتجاه نموه."],
    ],
  },
  budding: {
    title: "التبرعم في الخميرة",
    parts: [
      ["الخلية الأصل", "يظهر عليها نتوء صغير."],
      ["البرعم", "ينمو وتتوزع المكونات الخلوية."],
      ["فرد جديد", "قد ينفصل البرعم بعد نموه."],
    ],
  },
  fission: {
    title: "الانشطار في الأميبا",
    parts: [
      ["استعداد", "تتضاعف المادة الوراثية."],
      ["تخصر", "تتوزع المكونات وينقسم الجسم."],
      ["فردان", "ينتجان من انشطار فرد واحد."],
    ],
  },
  vegetative: {
    title: "التكاثر الخضري",
    parts: [
      ["الفسائل", "تفصل فسيلة بجذور مناسبة وتزرع."],
      ["الترقيد", "تجذر ساق وهي متصلة بالأم ثم تفصل."],
      ["التطعيم", "يلزم أصل وطعم متوافقان ورعاية مناسبة."],
    ],
  },
  sexual: {
    title: "التكاثر الجنسي في النبات الزهري",
    parts: [
      ["الأزهار", "أعضاء التكاثر الجنسي في النباتات الزهرية."],
      ["الأمشاج", "الإخصاب اندماج أمشاج ذكرية وأنثوية."],
      ["البذور", "قد تنبت وتنمو إلى نباتات جديدة عند توفر الظروف."],
    ],
  },
  compost: {
    title: "تحضير الدبال",
    parts: [
      ["مواد عضوية", "نوازن بين بقايا خضراء ومواد جافة مناسبة."],
      ["المحللات", "تحلل البقايا ببطء خلال أسابيع أو أشهر حقيقية."],
      ["هواء ورطوبة", "تهوية ورطوبة معتدلة تساعدان النموذج، دون مواد خطرة."],
    ],
  },
};
export function ScientificScene({
  id,
  t,
  value,
  vars,
  compact = false,
}: {
  id: string;
  t: number;
  value: number;
  vars: Variables;
  compact?: boolean;
}) {
  const prefix = useId().replace(/:/g, "");
  const [expanded, setExpanded] = useState(false);
  const [magnification, setMagnification] = useState(1);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(false);
  useEffect(() => {
    if (expanded || wasExpanded.current)
      zoomButton.current?.focus({ preventScroll: true });
    wasExpanded.current = expanded;
  }, [expanded]);
  const [part, setPart] = useState<number | null>(null);
  const sound = useSound();
  const info =
    scienceCatalog[
      id.startsWith("micro")
        ? ["micro", "micro-euglena", "micro-amoeba"][vars.organism ?? 0]
        : id
    ];
  if (!info) throw Error(`Missing scientific artwork: ${id}`);
  const props = { t, value: Math.max(0, Math.min(1, value)), v: vars, prefix };
  const art =
    id === "urine" ? (
      <UrinaryArt {...props} />
    ) : id === "sweat" ? (
      <SweatArt {...props} />
    ) : id === "reflex" ? (
      <ReflexArt {...props} />
    ) : id === "iodine" ? (
      <IodineArt {...props} />
    ) : id === "yeast" ? (
      <YeastArt {...props} />
    ) : id === "respiration" ? (
      <RespirationArt {...props} />
    ) : id === "mold" ? (
      <MoldArt {...props} />
    ) : id === "vegetative" ? (
      <VegetativeArt {...props} />
    ) : id === "age" ? (
      <AgeArt {...props} />
    ) : id.startsWith("micro") ? (
      <MicroArt {...props} />
    ) : id === "environment" ? (
      <EnvironmentArt {...props} />
    ) : id === "compost" ? (
      <CompostArt {...props} />
    ) : ["cell", "metabolism", "sexual", "budding", "fission"].includes(id) ? (
      <CellArt id={id} {...props} />
    ) : (
      <PlantArt id={id} {...props} />
    );
  const figure = (
    <figure
      className={`scientific-scene scene-realistic ${expanded ? "scene-expanded" : ""}`}
      data-science-id={id}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? info.title : undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setExpanded(false);
          zoomButton.current?.focus();
        }
        if (expanded && e.key === "Tab") {
          const buttons = [
            ...e.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
          ];
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <button
        ref={zoomButton}
        className="scene-zoom"
        data-sound="handled"
        aria-expanded={expanded}
        onClick={() => {
          setExpanded(!expanded);
          setMagnification(1);
          sound.play("tool");
        }}
      >
        {expanded ? "إغلاق التكبير" : "تكبير الرسم"}
      </button>
      {expanded && (
        <div className="detail-zoom-controls" aria-label="تكبير تفاصيل الرسم">
          <button
            disabled={magnification >= 2.5}
            onClick={() => {
              setMagnification((s) => Math.min(2.5, s + 0.5));
              sound.play("tool");
            }}
          >
            تكبير التفاصيل +
          </button>
          <span>{Math.round(magnification * 100)}%</span>
          <button
            disabled={magnification <= 1}
            onClick={() => {
              setMagnification((s) => Math.max(1, s - 0.5));
              sound.play("tool");
            }}
          >
            تصغير التفاصيل −
          </button>
          {magnification > 1 && <small>حرّك الرسم لاستكشاف أجزائه.</small>}
        </div>
      )}
      <div
        className="scene-canvas"
        tabIndex={expanded && magnification > 1 ? 0 : undefined}
        aria-label={expanded ? "مساحة الرسم القابلة للتحريك" : undefined}
      >
        <svg
          style={
            expanded && magnification > 1
              ? {
                  width: `${magnification * 100}%`,
                  maxWidth: "none",
                  maxHeight: "none",
                }
              : undefined
          }
          viewBox="0 0 760 474"
          role="img"
          aria-label={`${info.title} — تقدم ${Math.round(t * 100)}%`}
          className="scientific-svg"
        >
          <title>{info.title}</title>
          <defs>
            <Materials prefix={prefix} />
            <linearGradient id={`${prefix}-leaf`} x2="1" y2="1">
              <stop stopColor="#a0b97f" />
              <stop offset="1" stopColor="#5f8b6c" />
            </linearGradient>
            <linearGradient id={`${prefix}-glass`} x2="1" y2="1">
              <stop stopColor="#f8fcfa" stopOpacity=".8" />
              <stop offset=".5" stopColor="#c5dfda" stopOpacity=".18" />
              <stop offset="1" stopColor="#99bdb5" stopOpacity=".45" />
            </linearGradient>
            <radialGradient id={`${prefix}-kidney`}>
              <stop stopColor="#d5a294" />
              <stop offset="1" stopColor="#b47372" />
            </radialGradient>
            <radialGradient id={`${prefix}-cell`}>
              <stop stopColor="#e0edce" />
              <stop offset="1" stopColor="#9ebfa6" />
            </radialGradient>
            <marker
              id={`${prefix}-arrow`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0l10 5-10 5Z" fill="#799884" />
            </marker>
            <pattern
              id={`${prefix}-grid`}
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".9" fill="#91ab91" opacity=".16" />
            </pattern>
          </defs>
          <rect
            width="760"
            height="474"
            rx="25"
            fill={`url(#${prefix}-light)`}
          />
          <rect
            width="760"
            height="474"
            rx="25"
            fill={`url(#${prefix}-grid)`}
          />
          <g className="science-model" filter={`url(#${prefix}-depth)`}>
            {art}
          </g>
        </svg>
      </div>
      {!compact && (
        <>
          <figcaption>
            {info.title}
            <span>أجزاء التجربة</span>
          </figcaption>
          <div className="science-parts" aria-label="دليل أجزاء الرسم">
            {info.parts.map(([name], i) => (
              <button
                key={name}
                aria-pressed={part === i}
                data-sound="handled"
                onClick={() => {
                  setPart(part === i ? null : i);
                  sound.play("select");
                }}
              >
                <span>{i + 1}</span>
                {name}
              </button>
            ))}
          </div>
          {part !== null && (
            <p className="part-description" role="status">
              {info.parts[part][1]}
            </p>
          )}
        </>
      )}
    </figure>
  );
  return expanded ? createPortal(figure, document.body) : figure;
}
