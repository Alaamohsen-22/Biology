import {
  phase,
  mix,
  Label,
  Drop,
  Particles,
  Arrow,
  type ArtProps,
} from "./primitives";
export function UrinaryArt({ t, value, prefix }: ArtProps) {
  const filtration = phase(value, 0, 0.25),
    transport = phase(value, 0.2, 0.55),
    fill = phase(value, 0.42, 0.8),
    drain = phase(value, 0.8, 1);
  const bladderLevel = fill * (1 - drain);
  return (
    <g>
      <path d="M380 58v130" stroke="#b76d65" strokeWidth="19" />
      <path d="M400 58v130" stroke="#709fba" strokeWidth="15" />
      <path d="M380 98H292M380 98h112" stroke="#bb786d" strokeWidth="10" />
      <path d="M400 128H292M400 128h92" stroke="#7fa6bc" strokeWidth="9" />
      {[0, 1].map((i) => (
        <g key={i} transform={i ? "translate(760 0) scale(-1 1)" : undefined}>
          <path
            d="M285 74C217 50 210 177 273 188C319 191 321 148 291 135C273 126 282 108 299 100C317 89 307 79 285 74Z"
            fill={`url(#${prefix}-kidney)`}
            stroke="#a66662"
            strokeWidth="3"
          />
          <path
            d="M272 93c-25 15-25 54 0 68"
            stroke="#e8aba1"
            strokeWidth="7"
            fill="none"
          />
          <path
            d="M288 155C318 202 319 253 351 285"
            stroke="#c7ad6d"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {filtration > 0 &&
            Array.from({ length: 4 }, (_, j) => (
              <circle
                key={j}
                cx={253 + (j % 2) * 17}
                cy={108 + Math.floor(j / 2) * 24}
                r={3 + filtration * 3}
                fill="#f5d27b"
                opacity={filtration}
              />
            ))}
          {transport > 0 &&
            value < 0.82 &&
            Array.from({ length: 4 }, (_, j) => {
              const q = (t * 2 + j * 0.25) % 1;
              const x = 288 + 63 * q,
                y = 155 + 130 * q;
              return (
                <Drop
                  key={j}
                  x={x}
                  y={y}
                  size={5}
                  color="#e3c366"
                  opacity={Math.sin(q * Math.PI)}
                />
              );
            })}
        </g>
      ))}
      <path
        d="M335 281Q380 267 425 281C441 320 422 351 380 355C338 351 319 320 335 281Z"
        fill="#e5d6ad"
        stroke="#b8a274"
        strokeWidth="4"
      />
      <clipPath id={`${prefix}-bladder`}>
        <path d="M335 281Q380 267 425 281C441 320 422 351 380 355C338 351 319 320 335 281Z" />
      </clipPath>
      <rect
        x="326"
        y={351 - bladderLevel * 71}
        width="108"
        height={bladderLevel * 78}
        fill="#ddbd58"
        opacity=".8"
        clipPath={`url(#${prefix}-bladder)`}
      />
      <path
        d="M380 353v60"
        stroke="#bfaa73"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {drain > 0 && (
        <Drop x={380} y={mix(365, 430, drain)} size={7} color="#deb95a" />
      )}
      <Arrow x1={170} y1={116} x2={223} y2={116} prefix={prefix} />
      <Label x={133} y={103}>
        الكليتان
      </Label>
      <Label x={133} y={129}>
        تنقية مبسطة
      </Label>
      <Arrow x1={577} y1={217} x2={455} y2={217} prefix={prefix} />
      <Label x={622} y={205}>
        الحالبان
      </Label>
      <Arrow x1={193} y1={311} x2={325} y2={311} prefix={prefix} />
      <Label x={149} y={303}>
        المثانة
      </Label>
      <Arrow x1={556} y1={390} x2={393} y2={390} prefix={prefix} />
      <Label x={616} y={384}>
        الإحليل
      </Label>
      <g opacity={t > 0 ? 1 : 0}>
        <Particles
          from={[380, 63]}
          to={[380, 125]}
          t={t}
          count={3}
          color="#f2bc9a"
          r={4}
        />
      </g>
    </g>
  );
}
export function SweatArt({ t, value, prefix }: ArtProps) {
  const cycle = (Math.sin(t * Math.PI * 8) + 1) / 2,
    breath = t === 0 ? 0 : cycle * 0.12;
  const out = Math.sin(t * Math.PI * 8) < 0;
  const sweat = phase(value, 0.12, 1);
  return (
    <g>
      <rect
        x="40"
        y="45"
        width="325"
        height="365"
        rx="25"
        fill="#fffaf1"
        stroke="#dce4d7"
      />
      <rect
        x="395"
        y="45"
        width="325"
        height="365"
        rx="25"
        fill="#fffaf1"
        stroke="#dce4d7"
      />
      <Label x={200} y={80}>
        الرئتان · {out ? "زفير" : "شهيق"}
      </Label>
      <path
        d="M201 103v77m0-20-53 38m53-38 53 38"
        stroke="#9faeaa"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <g
        transform={`translate(201 230) scale(${1 + breath}) translate(-201 -230)`}
      >
        <path
          d="M180 151Q120 143 106 218Q90 291 178 302Z"
          fill="#d6a096"
          stroke="#b98079"
          strokeWidth="3"
        />
        <path
          d="M222 151Q282 143 296 218Q312 291 224 302Z"
          fill="#d6a096"
          stroke="#b98079"
          strokeWidth="3"
        />
        {[0, 1, 2].map((i) => (
          <g key={i} stroke="#f2c4b7" strokeWidth="4">
            <path d={`M175 ${185 + i * 27}l-42 30m93-30 42 30`} />
          </g>
        ))}
      </g>
      <path
        d={`M112 ${323 + cycle * 8}Q200 ${344 + cycle * 8} 290 ${323 + cycle * 8}`}
        stroke="#9cab89"
        strokeWidth="8"
        fill="none"
      />
      <Particles
        from={out ? [201, 151] : [201, 102]}
        to={out ? [170, 99] : [201, 190]}
        t={t * 4}
        color={out ? "#d4a363" : "#80b4c2"}
        count={4}
      />
      <Label x={200} y={383}>
        {out ? "خروج CO₂ وبخار ماء" : "دخول الهواء الغني بالأكسجين"}
      </Label>
      <Label x={555} y={80}>
        مقطع الجلد والغدة العرقية
      </Label>
      <path d="M420 169H697v190H420Z" fill="#e5c7a9" />
      <path
        d="M420 169q28-20 55 0t56 0t56 0t56 0t54 0v23H420Z"
        fill="#bf9279"
      />
      <path
        d="M557 174v66q-40 6-27 32t51-1q18-25-11-32q-35 7-19 34q36 8 29-14"
        stroke="#b68082"
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M441 325h240" stroke="#bd7774" strokeWidth="9" />
      <Particles
        from={[440, 325]}
        to={[678, 325]}
        t={t}
        count={5}
        color="#eac2ab"
        r={4}
      />
      {sweat > 0 && (
        <>
          <Drop x={557} y={mix(268, 160, sweat)} size={6} />
          <Drop x={557} y={140 - sweat * 35} size={8} opacity={sweat} />
          <Particles
            from={[557, 145]}
            to={[600, 104]}
            t={sweat}
            count={4}
            color="#95c7d0"
            r={4}
          />
        </>
      )}
      <Label x={554} y={383}>
        الغدة ← القناة ← سطح الجلد
      </Label>
    </g>
  );
}
export function ReflexArt({ t, value, prefix }: ArtProps) {
  const stimulus = phase(value, 0.03, 0.17),
    signal = phase(value, 0.18, 0.65),
    kick = phase(value, 0.65, 0.9);
  return (
    <g>
      <rect x="151" y="227" width="184" height="21" rx="7" fill="#a3b6a2" />
      <path d="M178 246v132m132-132v132" stroke="#a1b2a0" strokeWidth="12" />
      <path
        d="M215 88v98l115 51"
        stroke="#b9b6a6"
        strokeWidth="63"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="213" cy="54" r="29" fill="#d5b598" />
      <path
        d="M241 170l80 64"
        stroke="#cc9381"
        strokeWidth="29"
        strokeLinecap="round"
      />
      <g transform={`rotate(${-kick * 38} 332 240)`}>
        <path
          d="M332 240v119l52 17"
          stroke="#d2b99d"
          strokeWidth="37"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <circle
        cx="332"
        cy="240"
        r="23"
        fill="#ebd3af"
        stroke="#a69274"
        strokeWidth="3"
      />
      <path
        d={`M${437 - stimulus * 70} 219l-19 19`}
        stroke="#7a9b91"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M338 239Q500 245 493 148Q485 76 407 117Q380 144 478 148Q498 231 340 224"
        stroke="#c7b979"
        strokeWidth="5"
        fill="none"
        strokeDasharray="7 6"
      />
      {signal > 0 && (
        <circle
          cx={
            signal < 0.5
              ? mix(338, 491, signal * 2)
              : mix(491, 340, (signal - 0.5) * 2)
          }
          cy={
            signal < 0.5
              ? mix(239, 148, signal * 2)
              : mix(148, 224, (signal - 0.5) * 2)
          }
          r="9"
          fill="#e5b34f"
        />
      )}
      <Label x={555} y={107}>
        مسار عصبي شوكي مبسط
      </Label>
      <Label x={558} y={270}>
        مستقبل التمدد
      </Label>
      <Arrow x1={505} y1={264} x2={349} y2={243} prefix={prefix} />
      <Label x={258} y={407}>
        استجابة العضلة: امتداد الساق
      </Label>
      <Label x={535} y={365}>
        تجربة افتراضية آمنة فقط
      </Label>
    </g>
  );
}
