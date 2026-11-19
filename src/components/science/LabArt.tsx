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
  const dispensing = v.iodine ? phase(t,.25,.5) : 0;
  const reaction = v.iodine && v.starch ? phase(t,.5,.75) : 0;
  const sampleColor = `rgb(${mix(204,27,reaction)} ${mix(172,35,reaction)} ${mix(102,67,reaction)})`;
  return <g><Bench/>
    {[235,525].map((x,i)=><g key={i}>
      <ellipse cx={x} cy="362" rx="66" ry="10" fill="#445749" opacity=".12"/>
      <rect x={x-61} y="337" width="122" height="24" rx="7" fill={`url(#${prefix}-wood)`}/>
      <path d={`M${x-36} 124v179a36 36 0 0 0 72 0V124Z`} fill={`url(#${prefix}-glass)`} stroke="#7d9fa3" strokeWidth="3"/>
      <path d={`M${x-31} 237v65a31 31 0 0 0 62 0v-65Z`} fill={dispensing>0 ? i===0 ? sampleColor : "#c8a15a" : v.starch && i===0 ? "#e4e6df" : "#b8d8dc"}/>
      <ellipse cx={x} cy="237" rx="31" ry="6" fill={dispensing>0 ? i===0 ? sampleColor : "#dab873" : "#e5f3ef"} opacity=".8"/>
      <path d={`M${x-24} 145v153q0 14 7 20`} fill="none" stroke="#fff" strokeWidth="5" opacity=".72" strokeLinecap="round"/>
      <ellipse cx={x} cy="124" rx="36" ry="7" fill="none" stroke="#9ab8ba" strokeWidth="4"/>
      {[0,1,2,3].map(n=><path key={n} d={`M${x+21} ${163+n*19}h11`} stroke="#708e8d" strokeWidth="1.5"/>)}
      {dispensing>0 && t<.88 && <path d={`M${x-23} 275q22 ${Math.sin(t*35)*18} 46 0m-46 17q22 ${Math.cos(t*30)*15} 46 0`} fill="none" stroke={i===0 && reaction>0 ? "#a2a0ce" : "#f1d292"} strokeWidth="2" opacity=".65"/>}
      <g transform={`translate(${x} ${dispensing*12}) rotate(${mix(-15,0,phase(t,0,.25))})`}>
       <path d="M-9 33h18v54l-9 13-9-13Z" fill={`url(#${prefix}-glass)`} stroke="#789b99" strokeWidth="2"/><path d="M-14 14q14-20 28 0v24h-28Z" fill="#4a6659"/>
      </g>
      {v.iodine>0 && [.26,.33,.40].map((start,n)=>{const p=phase(t,start,start+.08);return p>0 && p<1 ? <Drop key={n} x={x} y={128+p*103} color="#b58a3f" size={5}/> : null;})}
      <Label x={x} y={409}>{i ? "ماء + لوغول · ضابط" : v.starch ? "عينة تحتوي النشا" : "عينة ماء"}</Label>
    </g>)}
    <Label x={380} y={31}>الكشف عن النشا بمحلول لوغول</Label>
    <Label x={380} y={452}>{reaction>.8 ? "أزرق مسود في العينة المحتوية على النشا" : dispensing>0 ? "راقب سقوط القطرات واختلاط المحلول" : "العينة والضابط قبل إضافة الكاشف"}</Label>
  </g>;
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
            fill={`url(#${prefix}-bread)`}
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
          <path d={`M${x-21} 194v32l-35 81`} stroke="#ffffffaa" strokeWidth="5" fill="none" strokeLinecap="round"/>
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
          <path d={`M${x-21} 194v32l-35 81`} stroke="#ffffffaa" strokeWidth="5" fill="none" strokeLinecap="round"/>
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
export function MoldArt({ t, value, v, prefix }: ArtProps) {
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
            fill={`url(#${prefix}-crust)`}
            stroke="#ad855a"
            strokeWidth="5"
          />
          <path
            d={`M${x - 73} 173q0-66 73-53q73-13 73 53v134h-146Z`}
            fill={`url(#${prefix}-bread)`}
          />
          <path d={`M${x-73} 173q0-66 73-53q73-13 73 53v134h-146Z`} fill={`url(#${prefix}-pores)`}/>
          <path d={`M${x-104} 109h208M${x-99} 122v215`} stroke="#fff" strokeWidth="4" opacity=".55" fill="none"/>
          {Array.from(
            { length: Math.floor((i ? (.2 * .08 * (v.days ?? 5) / 10 * t) : value) * 80) },
            (_, j) => (
              <g key={j} opacity=".85">
                <circle
                  cx={x - 58 + ((j * 41) % 120)}
                  cy={159 + ((j * 37) % 130)}
                  r={(3 + (j % 8)) * phase(i ? (.2 * .08 * (v.days ?? 5) / 10 * t) : value, j/80, (j+5)/80)}
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
