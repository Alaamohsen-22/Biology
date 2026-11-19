import { useDraftState } from "../engine/drafts";
import { soundManager } from "../engine/sound";
import { useState, useEffect } from "react";
import { compost } from "../engine/models";
import { Ordering } from "./Activities";
import { ScientificScene } from "./science/ScientificScene";
import { useSound } from "./SoundSystem";
import { ActivityFeedback, useActivityFeedback } from "./ActivityFeedback";
export function Project({
  onFinish,
  previous,
  reduced = false,
}: {
  reduced?: boolean;
  onFinish: (score: number, criteria: number[]) => void;
  previous?: number;
}) {
  const sound = useSound();
  useEffect(() => () => soundManager.stop(), []);
  const assessment = useActivityFeedback();
  const [materials, setMaterials] = useDraftState<string[]>("compost-materials", []);
  const [air, setAir] = useDraftState("compost-air", 60);
  const [moisture, setMoisture] = useDraftState("compost-moisture", 55);
  const [days, setDays] = useDraftState("compost-days", 0);
  const [ordered, setOrdered] = useDraftState("compost-ordered", false);
  const [interpret, setInterpret] = useDraftState("compost-interpret", "");
  const [environment, setEnvironment] = useDraftState("compost-environment", "");
  const [ran, setRan] = useDraftState("compost-ran",false);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setDays((day) => Math.min(90, day + (reduced ? 15 : 3))),
      reduced ? 1600 : 350,
    );
    return () => window.clearInterval(timer);
  }, [playing, reduced]);
  useEffect(() => {
    if (days >= 90) { setPlaying(false); if(playing) sound.play("discover"); }
    else if(playing && days % 15 === 0) sound.play("time");
  }, [days]);
  const result = compost(materials, air, moisture, days);
  const invalidate = () => {
    setRan(false);
    assessment.reset();
    sound.play("tool");
    setPlaying(false);
    setMessage("");
  };
  const submit = () => {
    const criteria = [
      !result.unsuitable && result.balance ? 25 : 0,
      ordered ? 25 : 0,
      interpret === "microbes" ? 25 : 0,
      environment === "safe" ? 25 : 0,
    ];
    const grade = criteria.reduce((a, b) => a + b, 0);
    if (assessment.status === "correct") return;
    onFinish(grade, criteria);
    assessment.check(grade === 100);
    setMessage(
      grade === 100
        ? "أحسنت! أتممت المهمة وفق المعايير الأربعة."
        : "راجع المعايير غير المتحققة وعدّل تجربتك.",
    );
  };
  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">التحدي الختامي · من البقايا إلى الموارد</span>
        <h1>
          مهمة المستكشف الفلسطيني:
          <br />
          لنصنع الدبال
        </h1>
        <p>
          ابنِ حاوية افتراضية، ووازن المواد والتهوية والرطوبة. التحلل الحقيقي
          يستغرق أسابيع أو أشهر.
        </p>
      </header>
      <div className="card compost-lab" data-sound-scope="custom">
        <h2>حاوية التحلل الافتراضية</h2>
        <div className="material-grid">
          {[
            "قشور خضار",
            "بقايا فاكهة",
            "أوراق جافة",
            "ورق غير مطلي",
            "بلاستيك",
            "لحم",
            "بطاريات",
          ].map((m) => (
            <label key={m}>
              <input
                type="checkbox"
                checked={materials.includes(m)}
                onChange={() => {
                  setMaterials(
                    materials.includes(m)
                      ? materials.filter((x) => x !== m)
                      : [...materials, m],
                  );
                  invalidate();
                }}
              />
              {m}
            </label>
          ))}
        </div>
        <div className="compost-display">
          <ScientificScene
            id="compost"
            t={days / 90}
            value={result.value}
            vars={{ days, air, moisture, materialCount: materials.length }}
          />
          <div>
            <h3>{ran ? result.label : "اختر المواد وشغّل التجربة"}</h3>
            <p>{Math.round(result.value * 100)}% مؤشر تحلل نسبي في النموذج.</p>
            <p>
              تساعد الكائنات المحللة على تحويل البقايا العضوية؛ لا تتحول المواد
              البلاستيكية إلى دبال في هذه التجربة.
            </p>
          </div>
        </div>
        <div className="variables">
          <label>
            التهوية: {air}%
            <input
              type="range"
              min="0"
              max="100"
              value={air}
              onChange={(e) => {
                setAir(+e.target.value);
                invalidate();
              }}
            />
          </label>
          <label>
            الرطوبة: {moisture}%
            <input
              type="range"
              min="0"
              max="100"
              value={moisture}
              onChange={(e) => {
                setMoisture(+e.target.value);
                invalidate();
              }}
            />
          </label>
          <label>
            أيام افتراضية: {days}
            <input
              type="range"
              min="0"
              max="90"
              value={days}
              onChange={(e) => {
                setDays(+e.target.value);
                invalidate();
              }}
            />
          </label>
        </div>
        <p className="hint">
          {result.value < 0.2
            ? "بداية: بقايا واضحة وتحتاج المحللات إلى ظروف مناسبة."
            : result.value < 0.7
              ? "مرحلة وسطى في النموذج: تتفتت البقايا ويتغير لونها تدريجيًا."
              : "مرحلة متقدمة في النموذج: مادة داكنة أكثر تجانسًا. نضج الدبال الحقيقي يتأثر بعوامل كثيرة."}
        </p>
        <div className="button-row">
          <button
            onClick={() => {
              if (days >= 90) setDays(0);
              setRan(true);
              setPlaying(!playing);
              sound.play(playing ? "click" : "start");
            }}
          >
            {playing ? "إيقاف تقدم الزمن" : "شاهد التحلل بزمن مسرع"}
          </button>
          <button
            className="embroidered-nav previous"
            disabled={days === 0}
            onClick={() => {
              setPlaying(false);
              setDays(Math.max(0, days - 7));
              sound.play("step");
            }}
          >
            أسبوع افتراضي سابق
          </button>
          <button
            className="embroidered-nav next primary"
            onClick={() => {
              setDays(Math.min(90, days + 7));
              sound.play("step");
              setRan(true);
            }}
          >
            أسبوع افتراضي تالٍ
          </button>
          <button
            className="primary"
            onClick={() => {
              setRan(true);
              if (days === 0) setDays(60);
              sound.play("tool");
            }}
          >
            شغّل وقارن النتيجة
          </button>
          <button
            onClick={() => {
              sound.play("step");
              assessment.reset();
              setMaterials([]);
              setDays(0);
              setPlaying(false);
              setRan(false);
              setMessage("");
            }}
          >
            إعادة التجربة
          </button>
        </div>
        <p className="hint">
          للمقارنة: ثبت المواد ثم جرّب تهوية منخفضة وأخرى مناسبة؛ أو قارن رطوبة
          متوسطة بغمر الماء. لا تساوي نسبة المؤشر عمر الدبال الحقيقي.
        </p>
      </div>
      <Ordering
        items={[
          "تجهيز حاوية بفتحات تهوية",
          "إضافة طبقات من بقايا خضراء ومواد جافة",
          "ترطيب باعتدال وتقليب ومتابعة",
          "انتظار التحلل ومقارنة التغيرات",
        ]}
        onDone={() => setOrdered(true)}
        done={ordered}
        title="رتب خطوات إعداد الحاوية"
      />
      <section className="card activity-board" data-sound-scope="custom">
        <ActivityFeedback
          status={assessment.status}
          celebrating={assessment.celebrating}
          reduced={reduced}
        />
        <h2>فسّر واحمِ البيئة</h2>
        <label>
          لماذا تتغير البقايا؟
          <select
            value={interpret}
            onChange={(e) => {
              setInterpret(e.target.value);
              assessment.reset();
              sound.play("select");
            }}
          >
            <option value="">اختر تفسيرًا</option>
            <option value="microbes">
              تحللها كائنات محللة عند توفر الظروف المناسبة.
            </option>
            <option value="plastic">
              تتحول جميع النفايات ومنها البلاستيك إلى غذاء خلال دقائق.
            </option>
          </select>
        </label>
        <label>
          ما السلوك المناسب؟
          <select
            value={environment}
            onChange={(e) => {
              setEnvironment(e.target.value);
              assessment.reset();
              sound.play("select");
            }}
          >
            <option value="">اختر إجراءً</option>
            <option value="safe">
              فرز البقايا المناسبة، وتجنب المواد الخطرة وتلويث المياه.
            </option>
            <option value="river">إلقاء المتبقي في النبع.</option>
          </select>
        </label>
        <button
          className="primary"
          disabled={
            !ran ||
            !interpret ||
            !environment ||
            assessment.status === "correct"
          }
          onClick={submit}
        >
          قيّم مشروعي
        </button>
        {message && (
          <p className="hint" role="status">
            {message}
          </p>
        )}
        <div className="rubric">
          {[
            "اختيار مواد مناسبة ومتوازنة",
            "ترتيب الخطوات",
            "تفسير التحلل",
            "حماية البيئة",
          ].map((x, i) => (
            <p key={x}>
              <b>{x}</b>
              <span>25 درجة</span>
            </p>
          ))}
        </div>
        {previous !== undefined && <p>الدرجة المسجلة: {previous}%</p>}
      </section>
    </>
  );
}
