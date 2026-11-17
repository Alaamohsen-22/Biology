import {
  phase,
  mix,
  Drop,
  Particles,
  Label,
  Arrow,
  Plant,
  Bench,
  type ArtProps,
} from "./primitives";
export function IodineArt({ t, value, v, prefix }: ArtProps) {
  const add = v.iodine ? phase(t, 0.15, 0.6) : 0;
  return (
    <g>
      <Bench />
      {[235, 525].map((x, i) => (
        <g key={i}>
          <rect
            x={x - 56}
            y="343"
            width="112"
            height="22"
            rx="7"
            fill="#a8b8a7"
          />
          <path
            d={`M${x - 33} 135v172q0 43 66 0V135`}
            stroke="#91b5b5"
            strokeWidth="5"
            fill={`url(#${prefix}-glass)`}
          />
          <path
            d={`M${x - 28} 240v68q28 31 56 0v-68Z`}
            fill={
              i === 0 && value > 0.15
                ? "#3b3d73"
                : add > 0
                  ? "#c99b55"
                  : "#b6d9de"
            }
            opacity=".88"
          />
          <path d={`M${x - 30} 137h60`} stroke="#c5d7d4" strokeWidth="5" />
          <Label x={x} y={408}>
            {i ? "ماء + لوغول · ضابط" : v.starch ? "عينة نشا" : "عينة ماء"}
          </Label>
          {i === 0 && (
            <>
              <g transform={`translate(0 ${add * 20})`}>
                <path
                  d={`M${x - 18} 50h36l-7 52-11 15-11-15Z`}
                  fill="#c2ab77"
                  stroke="#8d937d"
                  strokeWidth="2"
                />
                <rect
                  x={x - 23}
                  y="35"
                  width="46"
                  height="22"
                  rx="10"
                  fill="#617f73"
                />
              </g>
              {add > 0 && (
                <Drop x={x} y={mix(131, 232, add)} color="#ab8044" size={7} />
              )}
            </>
          )}
        </g>
      ))}
      <Label x={380} y={30}>
        كاشف لوغول · تجربة افتراضية
      </Label>
      <Arrow x1={310} y1={274} x2={452} y2={274} prefix={prefix} dash />
      <Label x={380} y={450}>
        {value > 0.15
          ? "تغير إلى أزرق مسود يدل على النشا"
          : "قارن اللون قبل الإضافة وبعدها"}
      </Label>
    </g>
  );
}
export function YeastArt({ t, value, v, prefix }: ArtProps) {
  const gas = value;
  return (
    <g>
      <Bench />
      {[235, 525].map((x, i) => (
        <g key={i}>
          <path
            d={`M${x - 31} 183v40l-43 94q-12 36 25 41h98q37-5 25-41l-43-94v-40`}
            fill={`url(#${prefix}-glass)`}
            stroke="#88aca9"
            strokeWidth="4"
          />
          <path
            d={`M${x - 44} 278l-23 49q-5 24 26 26h82q31-2 26-26l-23-49Z`}
            fill="#d9ca9a"
          />
          <ellipse
            cx={x}
            cy={i ? 160 : 158 - gas * 34}
            rx={i ? 18 : 21 + gas * 44}
            ry={i ? 25 : 29 + gas * 57}
            fill={i ? "#b8c4bb" : "#ce9c8a"}
            stroke={i ? "#9dafaa" : "#ad7b6d"}
            strokeWidth="3"
          />
          <path d={`M${x - 17} 184h34`} stroke="#baae8b" strokeWidth="9" />
          {!i && (
            <>
              {Array.from({ length: 7 }, (_, j) => (
                <circle
                  key={j}
                  cx={x - 34 + j * 11}
                  cy={315 + (j % 2) * 10}
                  r={v.yeast ? 4 : 0}
                  fill="#a18e5e"
                />
              ))}
              {gas > 0 && (
                <Particles
                  from={[x, 294]}
                  to={[x, 216]}
                  t={t * 2}
                  count={7}
                  color="#fbf4d3"
                  r={4}
                />
              )}
            </>
          )}
          <Label x={x} y={408}>
            {i ? "ضابط دون خميرة" : "سكر + خميرة · تخمر"}
          </Label>
        </g>
      ))}
      <Label x={380} y={37}>
        يتجمع ثاني أكسيد الكربون في البالون
      </Label>
      <Label x={380} y={449}>
        {v.temperature > 55
          ? "حرارة شديدة: نشاط الخميرة متعطل في النموذج"
          : "دفء معتدل · لا تسخين حقيقي"}
      </Label>
    </g>
  );
}
export function RespirationArt({ t, value, v, prefix }: ArtProps) {
  return (
    <g>
      <Bench />
      {[170, 405, 620].map((x, i) => (
        <g key={i}>
          {i < 2 && (
            <>
              <path
                d={`M${x - 88} 363V185a88 102 0 0 1 176 0v178Z`}
                fill={i === 0 ? "#526c60" : "#cfe4dc"}
                fillOpacity={i === 0 ? 0.74 : 0.25}
                stroke="#91ada5"
                strokeWidth="4"
              />
              {(i === 1 || v.living > 0) && (
                <g transform={`translate(${x - 15} 70) scale(.65)`}>
                  <Plant x={0} base={400} growth={0.5} prefix={prefix} />
                </g>
              )}
              <path
                d={`M${x - 53} 170v134`}
                stroke="#fff"
                opacity=".2"
                strokeWidth="6"
              />
            </>
          )}
          <path
            d={`M${x + 22} 278v57q0 19 39 0v-57`}
            fill={
              i === 0
                ? `rgb(${mix(151, 240, value)} ${mix(196, 237, value)} ${mix(202, 215, value)})`
                : "#aad0d0"
            }
            stroke="#80a8a7"
            strokeWidth="3"
          />
          {i === 0 && value > 0 && (
            <Particles
              from={[x - 5, 234]}
              to={[x + 42, 285]}
              t={t}
              count={5}
              color="#e4e2c5"
              r={5}
            />
          )}
          <Label x={x} y={408}>
            {["نبات في الظلام", "نبات مضاء", "ماء جير في الهواء"][i]}
          </Label>
        </g>
      ))}
      <Label x={380} y={39}>
        النبات يتنفس · نتتبع دليل ثاني أكسيد الكربون
      </Label>
    </g>
  );
}
export function MoldArt({ t, value, v }: ArtProps) {
  return (
    <g>
      <Label x={380} y={43}>
        مقارنة حفظ الخبز · {Math.round((v.days ?? 5) * t)} أيام افتراضية
      </Label>
      {[220, 540].map((x, i) => (
        <g key={i}>
          <rect
            x={x - 115}
            y="90"
            width="230"
            height="279"
            rx="28"
            fill="#ffffff44"
            stroke="#b2c3b1"
            strokeWidth="3"
          />
          <path
            d={`M${x - 81} 168q0-75 81-60q81-15 81 60v148h-162Z`}
            fill="#c6a076"
            stroke="#ad855a"
            strokeWidth="5"
          />
          <path
            d={`M${x - 73} 173q0-66 73-53q73-13 73 53v134h-146Z`}
            fill="#eddbb2"
          />
          {Array.from(
            { length: Math.floor((i ? 0.04 + 0.06 * t : value) * 80) },
            (_, j) => (
              <g key={j} opacity=".85">
                <circle
                  cx={x - 58 + ((j * 41) % 120)}
                  cy={159 + ((j * 37) % 130)}
                  r={3 + (j % 8)}
                  fill={j % 2 ? "#7c9670" : "#5d7767"}
                />
                <circle
                  cx={x - 58 + ((j * 41) % 120)}
                  cy={159 + ((j * 37) % 130)}
                  r="2"
                  fill="#bbc5a0"
                />
              </g>
            ),
          )}
          <Label x={x} y={405}>
            {i ? "ضابط أبرد وأجف" : "العينة وفق ظروفك"}
          </Label>
        </g>
      ))}
      <Label x={380} y={448}>
        لا تفتح الخبز المتعفن أو تتذوقه · مؤشر نوعي
      </Label>
    </g>
  );
}
