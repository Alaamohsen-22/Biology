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
                fill={i % 2 ? "#d6b975" : "#87af9a"}
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
    const meet = phase(value, 0.35, 0.7),
      seed = phase(value, 0.7, 1);
    return (
      <g>
        <path d="M380 364V200" stroke="#73966c" strokeWidth="13" />
        <ellipse
          cx="342"
          cy="312"
          rx="48"
          ry="20"
          fill={`url(#${prefix}-leaf)`}
          transform="rotate(25 342 312)"
        />
        {Array.from({ length: 5 }, (_, i) => (
          <ellipse
            key={i}
            cx="380"
            cy="130"
            rx="36"
            ry="62"
            fill="#dca99b"
            stroke="#c88f82"
            strokeWidth="2"
            transform={`rotate(${i * 72} 380 198)`}
          />
        ))}
        <circle cx="380" cy="198" r="40" fill="#dfbf7c" />
        {v.gametes > 0 && (
          <>
            <circle
              cx={mix(148, 367, meet)}
              cy={mix(249, 205, meet)}
              r={13 * phase(value, 0, 0.25)}
              fill="#77a9bc"
            />
            <circle
              cx={mix(609, 392, meet)}
              cy={mix(249, 205, meet)}
              r={19 * phase(value, 0, 0.25)}
              fill="#b598ad"
            />
          </>
        )}
        {seed > 0 && (
          <ellipse
            cx="380"
            cy={mix(213, 338, seed)}
            rx={13 + seed * 11}
            ry={18 + seed * 13}
            fill="#af935f"
            stroke="#8f7c51"
            strokeWidth="3"
          />
        )}
        <Label x={148} y={301}>
          مشيج ذكري
        </Label>
        <Label x={607} y={301}>
          مشيج أنثوي
        </Label>
        <Label x={380} y={433}>
          {seed > 0 ? "إخصاب ثم تكون بذور" : "انتقال اللقاح يسبق الإخصاب"}
        </Label>
      </g>
    );
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
        <ellipse
          cx={leftX}
          cy="231"
          rx={budding ? 85 : 98 - division * 19}
          ry="113"
          fill={`url(#${prefix}-cell)`}
          stroke="#6e9b83"
          strokeWidth="4"
        />
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
          fill="#8c9bab"
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
              fill="#8c9bab"
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
export function AgeArt({ v, value, t }: ArtProps) {
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
            <circle cx={x} cy={340 - h} r="25" fill="#c8a781" />
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
