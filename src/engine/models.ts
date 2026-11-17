export type Variables = Record<string, number>;
export function simulate(
  id: string,
  v: Variables,
  t: number,
): { value: number; label: string; detail: string } {
  const p = Math.max(0, Math.min(1, t));
  switch (id) {
    case "environment":
      return {
        value: ((v.pollution ?? 0) / 100) * (v.treatment ? 0.1 : 1) * p,
        label: v.treatment
          ? "خفض المصدر ومعالجة الفضلات يقللان الخطر"
          : "تزداد آثار الملوثات مع دخولها للوادي",
        detail:
          "المؤشر يمثل ضغط التلوث النسبي ولا يقيس جودة ماء حقيقية. لا تصبح المياه صالحة للشرب بمجرد ضغط زر المعالجة.",
      };
    case "sexual":
      return {
        value: (((v.gametes ? 1 : 0) * (v.time ?? 100)) / 100) * p,
        label: v.gametes
          ? "اندماج أمشاج وتكوين بذور في نموذج مبسط"
          : "لا إخصاب دون توفر الأمشاج المناسبة",
        detail:
          "الزهرة عضو التكاثر الجنسي في النباتات الزهرية؛ انتقال اللقاح يسبق الإخصاب، وليسا العملية نفسها.",
      };
    case "photo": {
      const rate = Math.min(v.light ?? 0, v.water ?? 0, v.co2 ?? 0);
      return {
        value: rate * p,
        label: rate
          ? "تتوافر شروط البناء الضوئي"
          : "توقف البناء الضوئي في النموذج",
        detail: rate
          ? "يتكون الغذاء وينطلق الأكسجين مع تقدم العملية."
          : "تحتاج العملية إلى الضوء والماء وثاني أكسيد الكربون مع وجود أجزاء خضراء.",
      };
    }
    case "iodine":
      return {
        value: v.starch && v.iodine ? p : 0,
        label: !v.iodine
          ? "قبل إضافة لوغول"
          : v.starch
            ? "أزرق مسود: نشا موجود"
            : "بني مصفر: لم يُكشف نشا",
        detail:
          "الماء مع لوغول أنبوب ضابط؛ هذا الاختبار لا يكشف الدهون أو البروتين.",
      };
    case "mold": {
      const temp = v.temperature ?? 24;
      const warmth =
        temp < 5
          ? 0.08
          : temp < 15
            ? 0.25
            : temp <= 30
              ? 1
              : temp <= 40
                ? 0.35
                : 0.05;
      const growth = (((v.moisture ?? 0) / 100) * warmth * (v.days ?? 0)) / 10;
      return {
        value: growth * p,
        label: growth > 0.5 ? "ظروف مساعدة لنمو أكبر نسبيًا" : "نمو أقل نسبيًا",
        detail:
          "مقارنة نوعية في أيام افتراضية؛ التبريد يبطئ النمو ولا يعقم الخبز. لا تفتح عبوة خبز متعفن أو تتذوقه.",
      };
    }
    case "metabolism":
      return {
        value: p,
        label: v.build
          ? "بناء: وحدات تتجمع وطاقة تُستهلك"
          : "هدم: مركبات تتفكك، وقد تتحرر طاقة",
        detail: v.build
          ? "تتكون مادة أكثر تعقيدًا من وحدات بسيطة."
          : "يمثل التنفس مثالًا لهدم الغذاء وتحرير الطاقة.",
      };
    case "respiration":
      return {
        value: v.living && v.oxygen ? p : 0,
        label:
          v.living && v.oxygen
            ? "يتعكر ماء الجير مع مرور الغاز"
            : "لم يظهر تعكر في نموذج المقارنة",
        detail:
          "نقارن بالضابط في ظروف متماثلة. غياب الأكسجين يوقف التنفس الهوائي الممثل هنا؛ لا يعني غياب كل أنواع الأيض.",
      };
    case "yeast": {
      const temp = v.temperature ?? 30;
      const activity =
        temp < 10
          ? 0.1
          : temp < 20
            ? 0.4
            : temp <= 38
              ? 1
              : temp <= 45
                ? 0.45
                : temp <= 55
                  ? 0.1
                  : 0;
      const gas = (v.sugar ?? 0) * (v.yeast ?? 0) * activity * p;
      return {
        value: gas,
        label:
          gas > 0.1
            ? "ثاني أكسيد الكربون ينفخ البالون"
            : "غاز قليل أو غير ظاهر",
        detail:
          temp > 55
            ? "الحرارة العالية جدًا تعطل الخميرة في هذا النموذج."
            : "الأنبوب الضابط دون خميرة لا يظهر انتفاخًا ناتجًا من التخمر. زمن التجربة مسرع.",
      };
    }
    case "growth":
      return {
        value: ((v.time ?? 0) / 100) * (v.water ? 1 : 0.12) * p,
        label: v.water
          ? "زيادة تدريجية في الحجم والكتلة"
          : "نمو محدود في نموذج نقص الماء",
        detail:
          "زمن نمو النبات أسابيع وأشهر، وهو مسرع هنا. لا تمثل الأبعاد قياسات فعلية.",
      };
    case "age":
      return {
        value: (v.time ?? 0) / 80,
        label:
          (v.time ?? 0) < 10
            ? "طفولة"
            : v.time < 20
              ? "مراهقة"
              : v.time < 60
                ? "رشد"
                : "شيخوخة",
        detail:
          "حدود العرض تقريبية؛ معدلات النمو وتوقيت التغيرات تختلف بين الأفراد.",
      };
    case "micro-euglena":
    case "micro-amoeba":
    case "micro":
      return {
        value: p,
        label: ["براميسيوم — أهداب", "يوغلينا — سوط", "أميبا — أقدام كاذبة"][
          v.organism ?? 0
        ],
        detail: "نموذج تخطيطي للحركة؛ التكبير يغير حجم الصورة الظاهر فقط.",
      };
    case "transpiration":
      return {
        value:
          (v.plant ? 0.75 : 0) * ((v.time ?? 0) / 100) * p +
          (!v.covered ? 0.25 * p : 0),
        label: !v.covered
          ? "مصادر ماء متداخلة: التربة مكشوفة"
          : v.plant
            ? "قطرات من نتح النبات"
            : "ضابط دون نبات: قطرات نباتية غير متوقعة",
        detail: !v.covered
          ? "غطّ التربة للحد من تبخر مائها قبل الاستنتاج."
          : "خرج بخار ماء من الأوراق ثم تكاثف على سطح الناقوس. النموذج نوعي.",
      };
    case "sweat":
      return {
        value: ((v.activity ?? 0) / 100) * p,
        label: "إخراج ثاني أكسيد الكربون والتعرق",
        detail:
          "مع النشاط قد يزيد التنفس والتعرق؛ التعرق يتأثر أيضًا بحرارة الجو وعوامل أخرى.",
      };
    case "reflex":
      return {
        value: v.stimulus ? p : 0,
        label: v.stimulus
          ? "استجابة عضلية سريعة عبر مسار شوكي"
          : "لم يُفعّل المؤثر الافتراضي",
        detail: "شاهد افتراضيًا فقط؛ لا تطرق على جسم زميلك.",
      };
    case "phototropism":
      return {
        value: (((v.light ? 1 : 0) * (v.time ?? 3)) / 3) * p,
        label: v.light
          ? "نمو الساق نحو الفتحة المضيئة"
          : "لا اتجاه ضوئي في نموذج غياب الضوء",
        detail:
          "ثلاثة أيام افتراضية. استجابة نمو بطيئة؛ اتجاه الجذر يتأثر بالجاذبية فلا نفسره بالضوء وحده.",
      };
    case "response":
      return {
        value: p,
        label: v.kind
          ? "الضوء الشديد مؤثر وتضيق الحدقة استجابة"
          : "ضوء جانبي مؤثر واتجاه النمو استجابة",
        detail: v.kind
          ? "الاستجابة أسرع من حركة نمو النبات."
          : "زمن النبات مسرع؛ لا يتحرك الأصيص بل يتغير اتجاه نمو الساق.",
      };
    case "vegetative":
      return {
        value: (((v.suitable ? 1 : 0.1) * (v.time ?? 0)) / 100) * p,
        label: v.suitable
          ? "ظروف مناسبة لنمو أو التحام"
          : "الظروف غير مناسبة لنجاح العملية",
        detail: [
          "فسيلة بجذور مناسبة تُفصل وتُزرع.",
          "يبقى الساق متصلًا بالأم حتى يتجذر.",
          "يلزم أصل وطعم متوافقان ورعاية صحيحة.",
        ][v.method ?? 0],
      };
    default:
      return {
        value: ((v.time ?? 100) / 100) * p,
        label:
          id === "urine"
            ? "كلية ← حالب ← مثانة ← إحليل"
            : id === "budding"
              ? "ينمو برعم وقد ينفصل"
              : "انقسام مبسط إلى خليتين",
        detail:
          "تسلسل تعليمي مبسط بزمن افتراضي مسرع، لا يمثل كل التفاصيل المجهرية.",
      };
  }
}
export function compost(
  materials: string[],
  air: number,
  moisture: number,
  days: number,
) {
  const unsuitable = materials.some((x) =>
    ["بلاستيك", "لحم", "بطاريات"].includes(x),
  );
  const greens = materials.some((x) =>
    ["قشور خضار", "بقايا فاكهة"].includes(x),
  );
  const browns = materials.some((x) =>
    ["أوراق جافة", "ورق غير مطلي"].includes(x),
  );
  const balance = greens && browns;
  const conditions = air > 30 && moisture >= 35 && moisture <= 70;
  const value = unsuitable
    ? 0
    : Math.min(1, days / 60) * (balance ? 1 : 0.4) * (conditions ? 1 : 0.3);
  return {
    value,
    unsuitable,
    balance,
    conditions,
    label: unsuitable
      ? "أزل المواد غير المناسبة"
      : value > 0.7
        ? "تحلل متقدم نسبيًا في النموذج"
        : !conditions
          ? "اضبط التهوية والرطوبة"
          : "التحلل مستمر؛ نحتاج وقتًا ورعاية",
  };
}
