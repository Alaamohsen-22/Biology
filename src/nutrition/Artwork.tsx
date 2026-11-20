import { useId } from "react";
export type Specimen =
  | "olive"
  | "rabbit"
  | "fungus"
  | "human"
  | "bread"
  | "louse"
  | "meat";
export function SpecimenArt({
  kind,
  label,
}: {
  kind: Specimen;
  label: string;
}) {
  const p = useId().replace(/:/g, "");
  return (
    <svg
      className="specimen-art"
      viewBox="0 0 240 180"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <defs>
        <linearGradient id={p + "-leaf"} x2="1" y2="1">
          <stop stopColor="#9ab77c" />
          <stop offset="1" stopColor="#3b6f50" />
        </linearGradient>
        <linearGradient id={p + "-stone"} x2="0" y2="1">
          <stop stopColor="#ece4cc" />
          <stop offset="1" stopColor="#c2b18a" />
        </linearGradient>
        <radialGradient id={p + "-fur"} cx=".3" cy=".25">
          <stop stopColor="#f9f0df" />
          <stop offset="1" stopColor="#bcaa8b" />
        </radialGradient>
        <radialGradient id={p + "-cap"} cx=".3" cy=".25">
          <stop stopColor="#d59e6b" />
          <stop offset="1" stopColor="#795338" />
        </radialGradient>
        <filter id={p + "-shadow"} x="-.3" y="-.3" width="1.6" height="1.8">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="#234b35"
            floodOpacity=".12"
          />
        </filter>
      </defs>
      <ellipse cx="120" cy="159" rx="78" ry="9" fill="#3c5c3c" opacity=".09" />
      <g filter={`url(#${p}-shadow)`}>
        {kind === "olive" && (
          <>
            <path d="M36 151h168v12H36z" fill={`url(#${p}-stone)`} />
            <path d="M58 152v11m35-11v11m37-11v11m38-11v11" stroke="#a99d7f" />
            <path
              d="M115 153q8-32 6-75m1 35L84 71m38 34 39-46m-40 75 25-38"
              stroke="#7e6b47"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />
            {[
              [79, 68, 40, 28],
              [113, 43, 40, 29],
              [151, 66, 45, 31],
              [124, 83, 42, 32],
              [57, 93, 32, 23],
              [176, 94, 32, 22],
            ].map(([x, y, rx, ry], i) => (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={rx}
                ry={ry}
                fill={`url(#${p}-leaf)`}
              />
            ))}
            {Array.from({ length: 19 }, (_, i) => {
              const x = 55 + ((i * 31) % 130),
                y = 40 + ((i * 17) % 63);
              return (
                <g key={i}>
                  <path
                    d={`M${x} ${y}q12-11 19-6q-6 10-19 6Z`}
                    fill="#b4c59c"
                    opacity=".7"
                  />
                  <ellipse
                    cx={x + 8}
                    cy={y + 11}
                    rx="3"
                    ry="4"
                    fill="#364f37"
                  />
                </g>
              );
            })}
          </>
        )}
        {kind === "rabbit" && (
          <>
            <ellipse
              cx="111"
              cy="122"
              rx="62"
              ry="36"
              fill={`url(#${p}-fur)`}
            />
            <ellipse cx="164" cy="99" rx="31" ry="29" fill={`url(#${p}-fur)`} />
            <ellipse
              cx="148"
              cy="53"
              rx="13"
              ry="44"
              transform="rotate(-18 148 53)"
              fill="#d4c2a4"
            />
            <ellipse
              cx="177"
              cy="54"
              rx="11"
              ry="40"
              transform="rotate(10 177 54)"
              fill="#d4c2a4"
            />
            <path
              d="M146 27q-4 27 9 48m20-48v47"
              stroke="#c8948e"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="74" cy="149" rx="31" ry="9" fill="#ccb99a" />
            <ellipse cx="152" cy="148" rx="23" ry="8" fill="#d7c5a7" />
            <circle cx="53" cy="120" r="15" fill="#efe4cc" />
            <circle cx="176" cy="91" r="4" fill="#374b3c" />
            <circle cx="178" cy="90" r="1.2" fill="white" />
            <path d="M189 104l8 3-8 4" fill="#b57f78" />
            <path
              d="M190 113l21-1m-22 5 19 6"
              stroke="#7d826b"
              strokeWidth="1.2"
            />
            <path
              d="M207 150l6-23m-6 23-10-18m10 18 15-12"
              stroke="#5a8653"
              strokeWidth="3"
              fill="none"
            />
          </>
        )}
        {kind === "fungus" && (
          <>
            <path
              d="M102 148q13-30 9-56h24q-5 35 8 56Z"
              fill="#e2d2ae"
              stroke="#bdaa82"
              strokeWidth="1.5"
            />
            <path
              d="M48 97q8-65 73-69q60 5 72 69q-70 20-145 0Z"
              fill={`url(#${p}-cap)`}
            />
            <ellipse cx="121" cy="97" rx="72" ry="11" fill="#d4bc93" />
            <path
              d="M60 98l55-1m-40 6 43-6m3 10v-10m40 7-35-7m53 1-51-1"
              stroke="#9b7c55"
              strokeWidth="1.3"
            />
            <ellipse
              cx="87"
              cy="62"
              rx="10"
              ry="5"
              fill="#f2d4a5"
              opacity=".65"
            />
            <ellipse
              cx="144"
              cy="51"
              rx="13"
              ry="6"
              fill="#eac798"
              opacity=".6"
            />
            <path
              d="M81 155q22-11 43-3q20-8 41 3"
              stroke="#d3b487"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
        {kind === "bread" && (
          <>
            <path
              d="M46 138V76q-17-39 20-50q30-21 56 0q27-17 50 3q39 12 22 47v62q-73 21-148 0Z"
              fill="#b98443"
            />
            <path
              d="M57 131V75q-14-27 14-39q27-17 50 1q28-16 46 2q28 10 15 37v54q-59 17-125 1Z"
              fill="#efd3a1"
            />
            {Array.from({ length: 24 }, (_, i) => (
              <ellipse
                key={i}
                cx={70 + ((i * 19) % 101)}
                cy={52 + ((i * 29) % 68)}
                rx={2 + (i % 3)}
                ry="2"
                fill="#b48b57"
                opacity=".36"
              />
            ))}
            {[
              [80, 91, 17],
              [116, 73, 12],
              [149, 112, 23],
            ].map(([x, y, r], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill="#5a805d" opacity=".7" />
                {Array.from({ length: 9 }, (_, j) => (
                  <circle
                    key={j}
                    cx={x + Math.cos(j * 2.4) * r * 0.7}
                    cy={y + Math.sin(j * 2.4) * r * 0.7}
                    r={3}
                    fill="#8ea877"
                  />
                ))}
              </g>
            ))}
          </>
        )}
        {kind === "louse" && (
          <>
            <path
              d="M91 69L56 45m37 41L48 79m44 22-38 30m96-62 35-24m-35 41 45-7m-44 22 38 30"
              stroke="#7d6c4e"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse
              cx="122"
              cy="109"
              rx="32"
              ry="42"
              fill="#c7b185"
              stroke="#8b7852"
              strokeWidth="2"
            />
            <ellipse cx="122" cy="64" rx="24" ry="24" fill="#bfa87d" />
            <path
              d="M109 41L96 27m38 14 14-14"
              stroke="#806d4d"
              strokeWidth="3"
            />
            <path
              d="M96 91q26 11 52 0m-53 16q27 11 55 0m-48 16q22 9 44 0"
              stroke="#9a855e"
              strokeWidth="2"
            />
            <circle cx="113" cy="59" r="3" fill="#524d3c" />
            <circle cx="132" cy="59" r="3" fill="#524d3c" />
          </>
        )}
        {kind === "human" && (
          <>
            <path d="M73 159q1-53 47-54q44 1 48 54Z" fill="#6e9d8f" />
            <circle cx="120" cy="70" r="36" fill="#d7b094" />
            <path
              d="M84 67q-5-48 39-46q39 1 34 49q-16-12-24-26q-19 21-49 23Z"
              fill="#3e4d40"
            />
            <path
              d="M100 113q20 22 40 0"
              stroke="#eddbbf"
              strokeWidth="5"
              fill="none"
            />
            <circle cx="108" cy="73" r="2.8" fill="#344b3c" />
            <circle cx="133" cy="73" r="2.8" fill="#344b3c" />
            <path
              d="M109 88q12 9 23-1"
              stroke="#945f55"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
        {kind === "meat" && (
          <>
            <path
              d="M57 131q-34-49 6-80q36-25 86-17q50 11 39 64q-6 44-58 50q-48 5-73-17Z"
              fill="#c98a80"
              stroke="#f0c4ad"
              strokeWidth="12"
            />
            <path
              d="M72 117q-21-35 5-51q31-21 64-15q36 8 26 42q-8 28-39 31q-38 5-56-7Z"
              fill="#ab6861"
            />
            <path
              d="M84 59q4 30 52 33m-39 25 33-64"
              stroke="#deb2a1"
              strokeWidth="4"
              fill="none"
              opacity=".8"
            />
            <ellipse cx="102" cy="79" rx="12" ry="8" fill="#ead3b8" />
          </>
        )}
      </g>
    </svg>
  );
}
