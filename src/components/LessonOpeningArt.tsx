import { useId } from "react";
export function LessonOpeningArt({ lesson }: { lesson: number }) {
  const p = useId().replace(/:/g, "");
  const titles: Record<number, string> = {
    2: "غذاء وشجرة وإنسان في بيئة فلسطينية",
    3: "شتلة صغيرة وشجرة كبيرة في مدرج حجري",
    4: "بركة ماء وسمكة ومجهر",
    5: "ينبوع وبيت فلسطيني",
    6: "نبتة قرب نافذة وضوء جانبي",
    7: "نخلة وشتلات في حقل فلسطيني",
  };
  return (
    <svg
      className="lesson-opening-art"
      viewBox="0 0 760 300"
      role="img"
      aria-label={titles[lesson]}
    >
      <defs>
        <linearGradient id={p} x2="0" y2="1">
          <stop stopColor="#d5e9ed" />
          <stop offset="1" stopColor="#f4efd8" />
        </linearGradient>
      </defs>
      <rect width="760" height="300" rx="24" fill={`url(#${p})`} />
      <circle cx="635" cy="55" r="29" fill="#edcb76" />
      <path d="M0 173Q150 75 290 176Q460 54 760 161V300H0" fill="#a8b79a" />
      <path d="M0 226Q200 157 440 217Q580 159 760 230V300H0" fill="#7e9b71" />
      <path d="M0 259L760 237" stroke="#d5c7a1" strokeWidth="24" />
      {Array.from({ length: 15 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 55} 247v22`}
          stroke="#a99f86"
          strokeWidth="2"
        />
      ))}
      {lesson === 4 ? (
        <>
          <ellipse cx="360" cy="225" rx="175" ry="45" fill="#73aebb" />
          <path
            d="M325 214Q373 172 419 213Q374 248 325 214L303 238V190Z"
            fill="#e9c67a"
          />
          <circle cx="401" cy="211" r="4" fill="#28483f" />
          <path
            d="M540 237h85M561 235v-57l38-42-25-20-39 43M550 178q75 15 65 52"
            stroke="#365a51"
            strokeWidth="11"
            fill="none"
          />
        </>
      ) : lesson === 5 ? (
        <>
          <path
            d="M300 169q80-18 116 16q-18 38-85 79H223q139-46 77-95Z"
            fill="#7fb4bf"
          />
          <path
            d="M486 220v-87h114v87M476 133l68-46 68 46"
            fill="#ddd1b7"
            stroke="#9c967c"
            strokeWidth="6"
          />
          <rect x="529" y="162" width="28" height="58" rx="12" fill="#718575" />
        </>
      ) : (
        <>
          {[lesson === 3 ? 265 : 360, lesson === 7 ? 530 : 160].map((x, i) => (
            <g
              key={x}
              transform={`translate(${x} ${i ? 210 : 230}) scale(${i ? 0.7 : 1})`}
            >
              <path d="M0 0v-110" stroke="#89714e" strokeWidth="14" />
              {lesson === 7 ? (
                <>
                  {[-70, -35, 0, 35, 70].map((a) => (
                    <path
                      key={a}
                      d="M0-100q-60-70-100-20q60-5 100 20"
                      stroke="#426d4a"
                      fill="#537d50"
                      strokeWidth="8"
                      transform={`rotate(${a} 0 -100)`}
                    />
                  ))}
                </>
              ) : (
                <>
                  <ellipse cx="-25" cy="-126" rx="59" ry="43" fill="#53794d" />
                  <ellipse cx="28" cy="-127" rx="57" ry="48" fill="#6f905a" />
                  <ellipse cx="-2" cy="-162" rx="50" ry="42" fill="#6f905a" />
                </>
              )}
            </g>
          ))}
          {lesson === 2 && (
            <g>
              <ellipse
                cx="518"
                cy="220"
                rx="73"
                ry="24"
                fill="#f6efdb"
                stroke="#c8bd99"
                strokeWidth="4"
              />
              <ellipse cx="518" cy="213" rx="47" ry="13" fill="#b0bd70" />
              <circle cx="497" cy="209" r="12" fill="#c28a65" />
              <circle cx="536" cy="210" r="10" fill="#d9b273" />
            </g>
          )}
          {lesson === 3 && (
            <path
              d="M440 235v-38q-35-35-42-9q4 22 42 17q32-41 41-16q0 21-41 25"
              stroke="#476d46"
              strokeWidth="6"
              fill="#779a5b"
            />
          )}
          {lesson === 6 && (
            <g>
              <rect
                x="475"
                y="52"
                width="130"
                height="142"
                rx="8"
                fill="#f7efd9"
                stroke="#a99c78"
                strokeWidth="9"
              />
              <path
                d="M540 55v137M478 123h124"
                stroke="#a99c78"
                strokeWidth="7"
              />
              <path
                d="M475 90L373 160M475 143L382 188"
                stroke="#edca70"
                strokeWidth="10"
                opacity=".6"
              />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
