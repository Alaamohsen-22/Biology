import {
  phase,
  mix,
  Label,
  Drop,
  Particles,
  Arrow,
  type ArtProps,
} from "./primitives";
export function EnvironmentArt({ t, value, v, prefix }: ArtProps) {
  const pollution = value;
  return (
    <g>
      <path
        d="M20 165L125 71l113 87 99-88 132 113 140-96 131 101v184H20Z"
        fill="#b3c5a2"
      />
      <path d="M20 225Q180 155 348 243T740 236V442H20Z" fill="#d1d7af" />
      <path
        d="M740 234Q574 210 481 279T286 323T20 387"
        stroke="#b3c9b3"
        strokeWidth="82"
        fill="none"
      />
      <path
        d="M740 234Q574 210 481 279T286 323T20 387"
        stroke={`rgb(${mix(112, 145, pollution)} ${mix(178, 154, pollution)} ${mix(193, 113, pollution)})`}
        strokeWidth="62"
        fill="none"
      />
      {[0,1,2].map(i=><path key={i} d={`M${380+i*72} ${273-i*22}q28 ${Math.sin(t*7+i)*3} 50-7`} stroke="#e3f2e5" opacity=".6" strokeWidth="2" fill="none"/>)}
      <path
        d="M108 129h112v91H108z"
        fill={`url(#${prefix}-wood)`}
        stroke="#ac9878"
        strokeWidth="3"
      />
      <path d="M103 129l61-39 63 39" fill="#ba9c80" />
      <path d="M203 188h55v67" stroke="#939c8c" strokeWidth="16" fill="none" />
      <rect x="119" y="159" width="23" height="26" rx="3" fill="#8a9b8a" />
      {t > 0 && (
        <Particles
          from={[259, 235]}
          to={[390, 308]}
          t={t * 2}
          count={Math.max(1, Math.floor((v.pollution ?? 0) / 12))}
          color={v.treatment ? "#c0d8ce" : "#9f966f"}
          r={v.treatment ? 3 : 7}
        />
      )}
      {Array.from({ length: Math.floor(pollution * 15) }, (_, i) => (
        <circle
          key={i}
          cx={282 + ((i * 31) % 177)}
          cy={294 + ((i * 13) % 34)}
          r={5 + (i % 3)}
          fill="#9b9367"
          opacity=".8"
        />
      ))}
      {[530, 610, 681].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} 351v-${64 - pollution * 27}`}
            stroke="#879a65"
            strokeWidth="8"
          />
          <ellipse
            cx={x - 15}
            cy={315 + pollution * 15}
            rx="27"
            ry="13"
            transform={`rotate(${pollution * 20} ${x} 315)`}
            fill={pollution > 0.5 ? "#aaa16c" : "#7e9d69"}
          />
          <ellipse
            cx={x + 15}
            cy={290 + pollution * 22}
            rx="25"
            ry="13"
            fill={pollution > 0.5 ? "#aaa16c" : "#88aa70"}
          />
        </g>
      ))}
      {v.treatment > 0 && (
        <g>
          <rect
            x="257"
            y="148"
            width="96"
            height="73"
            rx="15"
            fill="#e3e9d7"
            stroke="#88a58f"
            strokeWidth="3"
          />
          <path
            d="M278 185l14 15 33-34"
            stroke="#6f957a"
            strokeWidth="7"
            fill="none"
          />
          <Label x={307} y={131}>
            منع المصدر ومعالجة
          </Label>
        </g>
      )}
      <Label x={380} y={35}>
        وادي سلفيت · قرارات تحمي الماء والتربة
      </Label>
      <Label x={381} y={438}>
        مؤشر ضغط تلوث تعليمي · ليس قياس جودة ماء حقيقيًا
      </Label>
    </g>
  );
}
export function CompostArt({ t, value, v, prefix }: ArtProps) {
  const p = value;
  return (
    <g>
      <rect
        x="188"
        y="96"
        width="383"
        height="314"
        rx="25"
        fill={`url(#${prefix}-wood)`}
        stroke="#93aa8c"
        strokeWidth="5"
      />
      <path d="M207 111h340M207 111v280" stroke="#f1f4e4" strokeWidth="7" opacity=".7" fill="none"/>
      {[0,1,2,3].map(i=><circle key={i} cx={173} cy={155+i*57} r="5" fill="#61775f"/>)}
      <clipPath id={`${prefix}-compostClip`}>
        <rect x="200" y="108" width="359" height="290" rx="17" />
      </clipPath>
      <g
        clipPath={`url(#${prefix}-compostClip)`}
        opacity={v.materialCount === 0 ? 0 : 1}
      >
        <rect
          x="200"
          y="133"
          width="359"
          height="270"
          fill={`rgb(${mix(168, 89, p)} ${mix(145, 80, p)} ${mix(101, 55, p)})`}
        />
        {Array.from({ length: 24 }, (_, i) => (
          <g key={i} opacity={1 - p * 0.85}>
            <ellipse
              cx={225 + ((i * 73) % 310)}
              cy={160 + ((i * 41) % 205)}
              rx={18 - p * 13}
              ry={10 - p * 7}
              transform={`rotate(${i * 35} ${225 + ((i * 73) % 310)} ${160 + ((i * 41) % 205)})`}
              fill={i % 2 ? "#86a471" : "#dfc18a"}
            />
          </g>
        ))}
        {Array.from({ length: Math.floor(p * 70) }, (_, i) => (
          <circle
            key={i}
            cx={214 + ((i * 43) % 332)}
            cy={158 + ((i * 29) % 239)}
            r={2 + (i % 3)}
            fill="#615b3b"
          />
        ))}
        <Particles
          from={[238, 371]}
          to={[238, 134]}
          t={t}
          count={4}
          color="#d7ded1"
          r={4}
        />
        <Particles
          from={[519, 134]}
          to={[519, 369]}
          t={t}
          count={4}
          color="#b6d4db"
          r={4}
        />
      </g>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} fill="#b2c2a5">
          <circle cx="210" cy={151 + i * 39} r="5" />
          <circle cx="549" cy={151 + i * 39} r="5" />
        </g>
      ))}
      <path
        d="M178 99h403"
        stroke="#9eaa87"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <Label x={380} y={57}>
        حاوية الدبال · {Math.round(v.days ?? t * 90)} يومًا افتراضيًا
      </Label>
      <Label x={98} y={233}>
        تهوية
      </Label>
      <Label x={663} y={233}>
        رطوبة
      </Label>
      <Arrow x1={120} y1={255} x2={192} y2={255} prefix={prefix} />
      <Arrow x1={640} y1={255} x2={570} y2={255} prefix={prefix} />
      <Label x={380} y={451}>
        بقايا عضوية ← تفكك تدريجي ← مادة أغمق وأكثر تجانسًا
      </Label>
    </g>
  );
}
