import { phase, mix, Label, type ArtProps } from "./primitives";
export function MicroArt({ t, value, v, prefix }: ArtProps) {
  const kind = v.organism ?? 0;
  const scale = 0.65 + (v.zoom ?? 2) * 0.17;
  const x = 210 + t * 277 + ((v.pan ?? 50) - 50) * 1.2,
    y = 223 + Math.sin(t * 9) * 23;
  return (
    <g>
      <ellipse cx="380" cy="435" rx="170" ry="12" fill="#576e60" opacity=".12"/>
      <path d="M169 99l-48-42 17-22 52 40M590 99l48-42-17-22-52 40" stroke={`url(#${prefix}-metal)`} strokeWidth="14" fill="none"/>
      <circle
        cx="380"
        cy="229"
        r="183"
        fill="#edf4e9"
        stroke="#77978d"
        strokeWidth="17"
      />
      <circle
        cx="380"
        cy="229"
        r="166"
        fill="#dcece4"
        stroke="#c3dbcd"
        strokeWidth="2"
      />
      <clipPath id={`${prefix}-microClip`}>
        <circle cx="380" cy="229" r="164" />
      </clipPath>
      <g clipPath={`url(#${prefix}-microClip)`}>
        <path d="M231 115q96-56 204-12" stroke="#ffffff90" strokeWidth="14" fill="none"/>

        {Array.from({ length: 14 }, (_, i) => (
          <circle
            key={i}
            cx={211 + ((i * 67) % 332)}
            cy={72 + ((i * 37) % 314)}
            r={2 + (i % 4)}
            fill="#8bafa3"
            opacity=".16"
          />
        ))}
        <g
          transform={`translate(${x} ${y}) scale(${scale}) rotate(${kind === 2 ? 0 : -13})`}
        >
          {kind === 0 ? (
            <>
              <path
                d="M-74-23C-82-75 60-73 83-8C100 56-62 71-74-23Z"
                fill={`url(#${prefix}-cell)`}
                stroke="#699987"
                strokeWidth="3"
              />
              {Array.from({ length: 28 }, (_, i) => {
                const a = (i * Math.PI) / 14,
                  b = Math.sin(t * 44 + i) * 8;
                return (
                  <path
                    key={i}
                    d={`M${Math.cos(a) * 78} ${Math.sin(a) * 53}l${Math.cos(a) * 16 + b} ${Math.sin(a) * 16}`}
                    stroke="#4d887c"
                    strokeWidth="2.5"
                  />
                );
              })}
              <path
                d="M-43-8q39 33 82 5"
                stroke="#9cc0a7"
                strokeWidth="6"
                fill="none"
              />
            </>
          ) : kind === 1 ? (
            <>
              <ellipse
                rx="80"
                ry="32"
                fill="#7ea875"
                stroke="#628b69"
                strokeWidth="3"
              />
              <path
                d={`M76 0q35 ${Math.sin(t * 36) * 43} 70 0t65 0`}
                fill="none"
                stroke="#6e946c"
                strokeWidth="4"
              />
              {[-45, -22, 16, 45].map((i) => (
                <ellipse
                  key={i}
                  cx={i}
                  cy={i % 2 ? 11 : -9}
                  rx="13"
                  ry="7"
                  fill="#a7c07c"
                />
              ))}
              <circle cx="49" cy="-9" r="6" fill="#bd7d69" />
            </>
          ) : (
            <path
              d={`M-70-21Q-64-91-23-43Q11-29 45-${51 + phase(t, 0, 0.7) * 43}Q${102 + phase(t, 0, 0.7) * 26}-66 83-8Q129 49 53 39Q-5 98-25 47Q-107 71-70-21Z`}
              fill={`url(#${prefix}-cell)`}
              stroke="#799d7d"
              strokeWidth="4"
            />
          )}
          <ellipse cx="-7" cy="3" rx="19" ry="24" fill={`url(#${prefix}-nucleus)`} />
          {Array.from({ length: 5 }, (_, i) => (
            <circle
              key={i}
              cx={-45 + ((i * 27) % 83)}
              cy={-24 + ((i * 19) % 48)}
              r="5"
              fill="#d8e5c4"
            />
          ))}
        </g>
      </g>
      <Label x={380} y={29}>
        {
          ["البراميسيوم · أهداب", "اليوغلينا · سوط", "الأميبا · أقدام كاذبة"][
            kind
          ]
        }
      </Label>
      <Label x={380} y={453}>
        مجال مجهر افتراضي · التكبير يغير حجم الصورة فقط
      </Label>
      <path
        d="M167 229h20m386 0h20M380 16v22m0 382v20"
        stroke="#aabca6"
        strokeWidth="3"
      />
    </g>
  );
}
