import { phase, mix, Label, Arrow, type ArtProps } from "./primitives";
export function CellArt({
  id,
  t,
  value,
  v,
  prefix,
}: ArtProps & { id: string }) {
  if (id === "metabolism") {
    const process = v.__watch
      ? t < 0.5
        ? phase(t, 0, 0.5)
        : phase(t, 0.5, 1)
      : t;
    const spread = v.build ? 1 - process : process;
    return (
      <g>
        <rect
          x="74"
          y="76"
          width="612"
          height="300"
          rx="35"
          fill="#f3f0e4"
          stroke="#cbd6c3"
          strokeWidth="3"
        />
        <g stroke="#94b09a" strokeWidth="6" opacity={1 - spread}>
          {Array.from({ length: 6 }, (_, i) => (
            <path
              key={i}
              d={`M380 222L${380 + Math.cos((i * Math.PI) / 3) * 55} ${222 + Math.sin((i * Math.PI) / 3) * 55}`}
            />
          ))}
        </g>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3,
            x = 380 + Math.cos(a) * (53 + spread * 147),
            y = 222 + Math.sin(a) * (53 + spread * 71);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="25"
                fill={`url(#${prefix}-molecule-${i%2 ? "gold" : "green"})`}
                stroke="#fffaf1"
                strokeWidth="4"
              />
              <circle cx={x - 7} cy={y - 7} r="6" fill="#ffffff50" />
            </g>
          );
        })}
        <Label x={380} y={46}>
          {v.build
            ? "البناء: تجميع وحدات أبسط"
            : "الهدم: تفكيك مركب إلى وحدات أبسط"}
        </Label>
        <Arrow
          x1={v.build ? 186 : 380}
          y1={401}
          x2={v.build ? 380 : 575}
          y2={401}
          prefix={prefix}
          color="#c9a451"
        />
        <Label x={380} y={446}>
          {v.build
            ? "طاقة تدخل في عملية البناء"
            : "قد تتحرر طاقة في عمليات الهدم كالتنفس"}
        </Label>
      </g>
    );
  }
  if (id === "sexual") {
    const pollen = phase(value,0,.3), tube=phase(value,.3,.7), seed=phase(value,.72,1);
    return <g>
      <path d="M380 406V176" stroke="#638458" strokeWidth="12"/>
      {[0,1,2,3,4].map(n=><path key={n} d="M380 203Q300 126 358 87Q408 83 380 203Z" fill={`url(#${prefix}-skin)`} stroke="#c58c84" strokeWidth="2" transform={`rotate(${n*72} 380 203)`}/>)}
      <ellipse cx="380" cy="314" rx="49" ry="55" fill={`url(#${prefix}-leaf)`} stroke="#66845b" strokeWidth="3"/>
      <path d="M372 296V171q8-20 16 0v125" fill="#d7d4a2" stroke="#9a9d68" strokeWidth="3"/>
      <ellipse cx="380" cy="160" rx="26" ry="10" fill="#d2b47b"/>
      {v.gametes>0 && <>
        <circle cx={mix(154,380,pollen)} cy={mix(108,151,pollen)} r="10" fill="#dfbf65" stroke="#a98b3e" strokeWidth="2"/>
        <path d={`M380 160Q386 221 379 ${160+tube*147}`} fill="none" stroke="#e8c26a" strokeWidth="5"/>
        <ellipse cx="380" cy="316" rx={15+seed*10} ry={20+seed*15} fill={seed>0 ? `url(#${prefix}-crust)` : "#e8daca"} stroke="#94795e" strokeWidth="2"/>
        {tube>.7 && seed===0 && <circle cx="379" cy={mix(284,312,phase(tube,.7,1))} r="4" fill="#9d7eaf"/>}
      </>}
      <Label x={150} y={77}>حبة لقاح</Label><Label x={552} y={163}>الميسم</Label><Arrow x1={515} y1={163} x2={410} y2={163} prefix={prefix}/>
      <Label x={565} y={314}>{seed>0 ? "بذرة تتكون داخل المبيض" : "بويضة داخل المبيض"}</Label><Arrow x1={491} y1={318} x2={417} y2={318} prefix={prefix}/>
      <Label x={380} y={455}>{seed>0 ? "بعد الإخصاب تتحول البويضة إلى بذرة" : tube>0 ? "أنبوب اللقاح: تمثيل مجهري داخل العضو" : "انتقال حبة اللقاح يسبق الإخصاب"}</Label>
    </g>;
  }
  const budding = id === "budding";
  const replicate = phase(value, 0.05, 0.35),
    division = phase(value, 0.36, 0.85),
    separate = phase(value, 0.84, 1);
  const leftX = budding ? 330 : 380 - division * 86 - separate * 22;
  const rightX = budding
    ? 423 + separate * 68
    : 380 + division * 86 + separate * 22;
  return (
    <g>
      <ellipse
        cx="380"
        cy="394"
        rx="240"
        ry="19"
        fill="#d1ddca"
        opacity=".55"
      />
      <g>
        {Array.from({length:8},(_,i)=><g key={i} transform={`translate(${leftX+Math.cos(i)*57} ${229+Math.sin(i)*75}) rotate(${i*43})`}><ellipse rx="9" ry="4" fill="#8dbaae" opacity=".5"/><path d="M-5 0h10" stroke="#dce6c5" strokeWidth="1"/></g>)}
        <ellipse
          cx={leftX}
          cy="231"
          rx={budding ? 85 : 98 - division * 19}
          ry="113"
          fill={`url(#${prefix}-cell)`}
          stroke="#6e9b83"
          strokeWidth="4"
        />
        {Array.from({length:7},(_,i)=><ellipse key={i} cx={leftX+Math.cos(i)*55} cy={230+Math.sin(i)*72} rx="8" ry="4" fill="#92b7a6" opacity=".65" transform={`rotate(${i*30} ${leftX+Math.cos(i)*55} ${230+Math.sin(i)*72})`}/>)}
        <path
          d={`M${leftX - 52} 162q-30 55-5 98`}
          stroke="#ffffff88"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx={leftX - 10}
          cy="228"
          rx="26"
          ry="34"
          fill={`url(#${prefix}-nucleus)`}
          stroke="#6c8291"
          strokeWidth="3"
        />
        {replicate > 0.15 && (
          <ellipse
            cx={leftX + 24}
            cy="239"
            rx={replicate * 20}
            ry={replicate * 25}
            fill="#9e9bb4"
            opacity={1 - division}
          />
        )}
      </g>
      {value > 0.15 && (
        <g>
          <ellipse
            cx={rightX}
            cy={budding ? 202 : 231}
            rx={budding ? 12 + division * 52 : Math.max(2, division * 79)}
            ry={budding ? 16 + division * 67 : Math.max(2, division * 113)}
            fill={`url(#${prefix}-cell)`}
            stroke="#6e9b83"
            strokeWidth="4"
          />
          {division > 0.15 && (
            <ellipse
              cx={rightX}
              cy={budding ? 202 : 231}
              rx={division * 22}
              ry={division * 29}
              fill={`url(#${prefix}-nucleus)`}
            />
          )}
        </g>
      )}
      <Label x={380} y={54}>
        {budding
          ? "التبرعم في خلية الخميرة"
          : id === "fission"
            ? "الانشطار في الأميبا"
            : "الانقسام الخلوي: من خلية إلى خليتين"}
      </Label>
      <Label x={380} y={438}>
        {value < 0.35
          ? "استعداد وتضاعف للمادة الوراثية"
          : value < 0.85
            ? budding
              ? "برعم ينمو على الخلية الأصل"
              : "توزع المكونات والتخصر"
            : budding
              ? "قد ينفصل البرعم مكونًا فردًا جديدًا"
              : "خليتان ناتجتان عن الانقسام"}
      </Label>
    </g>
  );
}
export function AgeArt({ v, value, t, prefix }: ArtProps) {
  const age = v.time ?? 0;
  const selected = age < 10 ? 0 : age < 20 ? 1 : age < 60 ? 2 : 3;
  return (
    <g>
      <path
        d="M80 370H682"
        stroke="#c1cdae"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {["الطفولة", "المراهقة", "الرشد", "الشيخوخة"].map((label, i) => {
        const x = 140 + i * 160,
          h = [92, 151, 182, 169][i];
        return (
          <g key={label} opacity={selected === i ? 1 : 0.4}>
            <circle cx={x} cy={340 - h} r="25" fill={`url(#${prefix}-skin)`} />
            <path d={`M${x-17} ${326-h}q17-17 34 0`} stroke="#827564" strokeWidth="7" fill="none"/>
            <path d={`M${x-23} ${370-h}q23-13 46 0l-5 ${h-91}h-36Z`} fill={`url(#${prefix}-leaf)`}/>
            <path d={`M${x-4} ${351-h}v10`} stroke="#bf987c" strokeWidth="8"/>
            <path
              d={`M${x} ${370 - h}v${h - 91}m0-${h - 107}-33 52m33-52 33 52M${x} 284l-24 70m24-70 24 70`}
              fill="none"
              stroke={i % 2 ? "#a29f78" : "#69927e"}
              strokeWidth="19"
              strokeLinecap="round"
            />
            {selected === i && <circle cx={x} cy="106" r="13" fill="#d7b158" />}
            <Label x={x} y={414}>
              {label}
            </Label>
          </g>
        );
      })}
      <Label x={380} y={51}>
        العمر في النموذج: {Math.round(age)} سنة
      </Label>
      <Label x={380} y={453}>
        تختلف معدلات النمو وتوقيته بين الأفراد
      </Label>
    </g>
  );
}
