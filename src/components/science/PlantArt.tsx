import {
  Plant,
  Particles,
  Drop,
  Label,
  Arrow,
  phase,
  mix,
  type ArtProps,
} from "./primitives";
export function PlantArt({
  id,
  t,
  value,
  v,
  prefix,
}: ArtProps & { id: string }) {
  const growth = id === "growth" ? value : 1;
  const bend =
    id === "phototropism" || id === "response"
      ? (v.side ? -1 : 1) * value * 85
      : 0;
  if (id === "response" && v.kind === 1) {
    const pupil = 35 - phase(t, 0.1, 0.85) * 23;
    return (
      <g>
        <path
          d="M156 230Q380 28 604 230Q380 430 156 230Z"
          fill="#fffaf1"
          stroke="#af9f83"
          strokeWidth="5"
        />
        <circle cx="380" cy="230" r="77" fill="#85a28d" />
        <circle cx="380" cy="230" r={pupil} fill="#334f48" />
        <circle cx="366" cy="208" r="10" fill="#ffffff99" />
        <circle cx="82" cy="100" r="35" fill="#ebc46a" />
        <Arrow
          x1={117}
          y1={124}
          x2={282}
          y2={188}
          prefix={prefix}
          color="#cba54c"
        />
        <Label x={380} y={395}>
          ضوء أشد ← تضيق الحدقة
        </Label>
      </g>
    );
  }
  return (
    <g>
      {id === "phototropism" && (
        <>
          <path
            d="M195 412V71H548V412"
            fill="#c4ae8340"
            stroke="#b49a70"
            strokeWidth="7"
          />
          <path
            d={v.side ? "M194 133v49" : "M549 133v49"}
            stroke="#fae29a"
            strokeWidth="12"
          />
          {v.light > 0 && (
            <g stroke="#e7bd57" strokeWidth="3" opacity=".6">
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={
                    v.side
                      ? `M185 ${145 + i * 12}l170 40`
                      : `M555 ${145 + i * 12}l-170 40`
                  }
                />
              ))}
            </g>
          )}
          <Label x={378} y={47}>
            فتحة جانبية يدخل منها الضوء
          </Label>
        </>
      )}
      {id === "transpiration" && (
        <>
          <ellipse cx="380" cy="411" rx="196" ry="15" fill="#b9c9bb" />
          <path
            d="M192 409V199a188 153 0 0 1 376 0v210Z"
            fill={`url(#${prefix}-glass)`}
            stroke="#8eafa8"
            strokeWidth="5"
          />
          <path
            d="M216 225v132M236 139q40-54 93-62"
            stroke="#fff"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
            opacity=".8"
          />
        </>
      )}
      {(id !== "transpiration" || v.plant > 0) && (
        <Plant
          x={380}
          base={352}
          growth={growth}
          bend={bend}
          prefix={prefix}
          roots={id === "photo" || id === "growth" || id === "phototropism"}
          water={id === "phototropism"}
        />
      )}
      {id === "photo" && (
        <>
          <circle
            cx="620"
            cy="80"
            r="31"
            fill="#edc771"
            opacity={v.light ? 1 : 0.2}
          />
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d="M620 36v-10"
              transform={`rotate(${i * 45} 620 80)`}
              stroke="#e1bb65"
              strokeWidth="4"
              opacity={v.light ? 1 : 0.15}
            />
          ))}
          <path
            d="M380 387V184"
            stroke="#76b8c6"
            strokeWidth="4"
            fill="none"
            strokeDasharray="6 10"
          />
          {v.water > 0 && t > 0 && (
            <Particles
              from={[380, 390]}
              to={[380, 190]}
              t={t * 1.5}
              count={5}
              color="#5babc2"
              r={6}
            />
          )}
          {v.co2 > 0 && t > 0.22 && (
            <Particles
              from={[97, 184]}
              to={[339, 197]}
              t={phase(t, 0.22, 0.7)}
              count={4}
              color="#a7a18b"
              r={8}
            />
          )}
          {v.light > 0 && t > 0.4 && (
            <g stroke="#e5bb57" strokeWidth="4" opacity={phase(t, 0.4, 0.65)}>
              <path d="M594 106L428 185" />
              <path d="M580 94L447 157" />
            </g>
          )}
          {value > 0.55 && (
            <>
              <Particles
                from={[425, 173]}
                to={[634, 147]}
                t={phase(value, 0.55, 1)}
                color="#83b5ad"
                r={7}
                count={4}
              />
              <rect
                x="353"
                y="230"
                width={phase(value, 0.55, 1) * 55}
                height="24"
                rx="8"
                fill="#ddb85a"
              />
            </>
          )}
          <Label x={110} y={156}>
            ثاني أكسيد الكربون
          </Label>
          <Label x={625} y={185}>
            أكسجين
          </Label>
          <Label x={380} y={446}>
            ماء من الجذور · غذاء في الأجزاء الخضراء
          </Label>
          <Label x={627} y={44}>
            ضوء
          </Label>
        </>
      )}
      {id === "transpiration" && (
        <>
          {v.covered > 0 && (
            <path
              d="M325 354h110"
              stroke="#7c8174"
              strokeWidth="9"
              strokeLinecap="round"
            />
          )}
          {v.plant > 0 && t > 0.25 && (
            <>
              <Particles
                from={[326, 246]}
                to={[257, 117]}
                t={t}
                count={5}
                color="#8fbfca"
                r={5}
              />
              <Particles
                from={[432, 237]}
                to={[511, 122]}
                t={t + 0.3}
                count={5}
                color="#8fbfca"
                r={5}
              />
            </>
          )}
          {Array.from(
            { length: Math.floor(phase(value, 0.1, 0.75) * 28) },
            (_, i) => {
              const a = (i / 28) * Math.PI;
              return (
                <Drop
                  key={i}
                  x={380 + 177 * Math.cos(a)}
                  y={206 - 142 * Math.sin(a) + (i % 3) * 11}
                  size={5 + (i % 3)}
                  opacity={0.8}
                />
              );
            },
          )}
          {!v.covered && (
            <Particles
              from={[346, 353]}
              to={[281, 258]}
              t={t}
              count={4}
              color="#b9c7b6"
            />
          )}
          <Arrow x1={620} y1={253} x2={553} y2={245} prefix={prefix} />
          <Label x={643} y={217}>
            قطرات
          </Label>
          <Label x={643} y={243}>
            متكاثفة
          </Label>
          <Label x={380} y={446}>
            {v.covered
              ? "التربة مغطاة للحد من تبخر مائها"
              : "التربة مكشوفة: مصدر إضافي للبخار"}
          </Label>
        </>
      )}
      {id === "growth" && (
        <>
          <ellipse
            cx="380"
            cy="365"
            rx="12"
            ry="8"
            fill="#977e53"
            opacity={1 - phase(value, 0, 0.3)}
          />
          <path
            d="M167 377V86m-10 291h20m-20-70h20m-20-70h20m-20-70h20m-20-70h20"
            stroke="#b2bc9d"
            strokeWidth="3"
          />
          <Label x={151} y={418}>
            زيادة الحجم
          </Label>
          <Label x={385} y={70}>
            بذرة ← بادرة ← شتلة
          </Label>
          <Label x={385} y={448}>
            زمن افتراضي · لا أبعاد مخبرية
          </Label>
        </>
      )}
      {id === "response" && (
        <>
          <circle cx={v.side ? 100 : 665} cy="135" r="28" fill="#e5bd62" />
          <Arrow
            x1={v.side ? 141 : 626}
            y1={150}
            x2={v.side ? 260 : 500}
            y2={185}
            prefix={prefix}
            color="#d6b153"
          />
          <Label x={380} y={445}>
            اتجاه نمو الساق استجابة للضوء
          </Label>
        </>
      )}
      {id === "phototropism" && (
        <>
          <Label x={90} y={300}>
            الساق تتجه
          </Label>
          <Label x={90} y={329}>
            نحو الضوء
          </Label>
          <Label x={638} y={349}>
            جذر مغمور
          </Label>
          <Label x={380} y={446}>
            ثلاثة أيام افتراضية · للجاذبية أثر في اتجاه الجذر
          </Label>
        </>
      )}
    </g>
  );
}
export function VegetativeArt({ t, value, v, prefix }: ArtProps) {
  const p = value;
  return (
    <g>
      <path d="M60 365Q380 331 700 365V420H60Z" fill="#d2bd90" />
      <Label x={380} y={55}>
        {
          [
            "فسائل النخيل في أريحا",
            "الترقيد في العنب",
            "التطعيم: أصل وطعم متوافقان",
          ][v.method ?? 0]
        }
      </Label>
      {v.method === 0 ? (
        <>
          <path d="M290 366l15-190" stroke="#a28e68" strokeWidth="21" />
          <g stroke="#72956c" strokeWidth="16" strokeLinecap="round">
            <path d="M305 178q-72-66-130-20M305 178q54-78 139-39M305 178q-36-89-70-82M305 178q35-70 81-88" />
          </g>
          <g transform={`translate(${phase(p, 0.65, 1) * 130} 0)`}>
            <path
              d={`M339 366l8-${50 + p * 65}`}
              stroke="#a9956f"
              strokeWidth="12"
            />
            <g stroke="#7a9c6a" strokeWidth="10" strokeLinecap="round">
              <path
                d={`M347 ${310 - p * 65}q-45-37-75-5M347 ${310 - p * 65}q45-32 73-11`}
              />
            </g>
            <path
              d="M339 367l-20 31m20-31 7 33m-7-33 24 26"
              stroke="#a88d63"
              strokeWidth="3"
            />
          </g>
          <Label x={560} y={270}>
            فسيلة بجذور
          </Label>
          <Arrow
            x1={537}
            y1={281}
            x2={382 + phase(p, 0.65, 1) * 130}
            y2={329}
            prefix={prefix}
          />
        </>
      ) : v.method === 1 ? (
        <>
          <Plant x={235} base={335} prefix={prefix} growth={0.6} />
          <path
            d={`M244 269Q356 183 446 358`}
            stroke="#799865"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M412 362h92"
            stroke="#b99e71"
            strokeWidth="22"
            strokeLinecap="round"
          />
          {p > 0.3 && (
            <g stroke="#a89262" strokeWidth="3">
              <path
                d={`M447 359l-${p * 25} ${p * 47}m${p * 25}-${p * 47} ${p * 20} ${p * 46}`}
              />
            </g>
          )}
          {p > 0.75 && (
            <path
              d="M378 287l17 16m0-16-17 16"
              stroke="#9c6b60"
              strokeWidth="4"
            />
          )}
          <Label x={540} y={162}>
            يبقى متصلًا بالأم
          </Label>
          <Label x={540} y={193}>
            حتى تتكون جذور
          </Label>
        </>
      ) : (
        <>
          <path
            d="M335 365V205l34-32"
            stroke="#ae9673"
            strokeWidth="39"
            fill="none"
          />
          <path
            d={`M${mix(520, 357, p)} ${mix(116, 185, p)}l-12-64`}
            stroke="#719767"
            strokeWidth="15"
          />
          <ellipse
            cx={mix(520, 357, p) + 12}
            cy={mix(90, 162, p) - 42}
            rx="30"
            ry="13"
            fill={`url(#${prefix}-leaf)`}
          />
          {p > 0.5 && (
            <g stroke="#e6dcba" strokeWidth="10">
              <path d="M318 206h42m-42 17h42m-42 17h42" />
            </g>
          )}
          {p > 0.8 && (
            <ellipse cx="348" cy="134" rx="33" ry="14" fill="#7da571" />
          )}
          <Label x={186} y={240}>
            الأصل
          </Label>
          <Label x={570} y={119}>
            الطعم
          </Label>
          <Label x={528} y={317}>
            الالتحام يحتاج وقتًا ورعاية
          </Label>
        </>
      )}
      <Label x={380} y={449}>
        نموذج افتراضي · دون أدوات حادة
      </Label>
    </g>
  );
}
