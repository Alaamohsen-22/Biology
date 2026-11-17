export function IslandArt({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 900 620"
      role="img"
      aria-label="جزيرة فلسطينية: بيوت حجرية وبساتين زيتون وبيارات وجبال وسط البحر"
      className={compact ? "island-art compact" : "island-art"}
    >
      <defs>
        <linearGradient id="sea" x2="0" y2="1">
          <stop stopColor="#a9ddd9" />
          <stop offset="1" stopColor="#76bdbd" />
        </linearGradient>
        <linearGradient id="land" x2="0" y2="1">
          <stop stopColor="#c5d79a" />
          <stop offset="1" stopColor="#8ab88d" />
        </linearGradient>
        <pattern
          id="waves"
          width="90"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M15 25q18 12 36 0"
            fill="none"
            stroke="#fff"
            opacity=".26"
            strokeWidth="2"
          />
        </pattern>
        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="14"
            stdDeviation="12"
            floodColor="#1e675f"
            floodOpacity=".18"
          />
        </filter>
      </defs>
      <rect width="900" height="620" rx="50" fill="url(#sea)" />
      <rect width="900" height="620" fill="url(#waves)" rx="50" />
      <ellipse
        cx="450"
        cy="355"
        rx="375"
        ry="205"
        fill="#e5d4aa"
        filter="url(#shadow)"
      />
      <path
        d="M90 343Q84 211 255 169L362 115 520 153Q737 131 808 306Q851 443 640 496Q370 579 157 454Z"
        fill="url(#land)"
      />
      <path d="M206 223l100-124 93 130-90-34z" fill="#7ba38a" />
      <path d="M275 199l31-100 30 42 14 26-25-8-16 18z" fill="#dbe6c6" />
      <path d="M385 175l97-100 125 136-90-40-41 18z" fill="#88ad8d" />
      <path
        d="M170 380Q252 440 303 358T474 333T670 278T737 355"
        fill="none"
        stroke="#e8d9b2"
        strokeWidth="25"
        strokeLinecap="round"
      />
      <path
        d="M170 380Q252 440 303 358T474 333T670 278T737 355"
        fill="none"
        stroke="#fff6da"
        strokeWidth="3"
        strokeDasharray="7 10"
      />
      <g transform="translate(515 185)">
        <path d="M0 40l60-30 60 30v75l-60 30-60-30z" fill="#eee1c3" />
        <path d="M60 70l60-30v75l-60 30z" fill="#c9bd9d" />
        <path d="M-7 40l67-36 67 36-67 34z" fill="#d8c59f" />
        <path d="M20 70v30l18 9V79zM81 80v28l17-9V72z" fill="#4e7d73" />
        <path d="M45 115V88q13-22 26 0v44z" fill="#6a6c53" />
      </g>
      {[
        [160, 285],
        [205, 250],
        [247, 287],
        [649, 325],
        [701, 373],
        [620, 403],
        [315, 450],
        [379, 460],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cy="24" rx="24" ry="10" fill="#3e7258" opacity=".18" />
          <path
            d="M0 24V-18m0 20L-12-8m12 5L12-15"
            stroke="#896d4a"
            strokeWidth="6"
          />
          <circle cy="-24" r="27" fill={i % 3 ? "#598b6b" : "#3f7d64"} />
          <circle cx="-17" cy="-14" r="17" fill="#6b9d75" />
          <circle cx="16" cy="-20" r="19" fill="#79a279" />
          {i % 3 === 0 && (
            <g fill="#edb95e">
              <circle cx="-12" cy="-25" r="5" />
              <circle cx="9" cy="-12" r="5" />
              <circle cx="7" cy="-35" r="5" />
            </g>
          )}
        </g>
      ))}
      <g transform="translate(380 260)">
        <path d="M0 55L5 0l45-20 38 30-3 60-45 20z" fill="#f4e8cd" />
        <path d="M-3 0l52-29 45 36-50 22z" fill="#b46958" />
        <path d="M44 29l50-22-9 63-41 20z" fill="#cbbc9b" />
        <path d="M17 63V36q10-15 20 0v37z" fill="#51786b" />
      </g>
      <g fill="#e7b77b">
        {[
          [230, 435],
          [455, 465],
          [660, 220],
          [120, 350],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y}l5-12 5 12 12 5-12 5-5 12-5-12-12-5z`} />
        ))}
      </g>
      <path d="M753 459q37-27 64-6l-16 18-48-1z" fill="#faf1d2" />
      <path d="M781 449v-36l26 30z" fill="#b56758" />
      <g fill="#fff" opacity=".7">
        <ellipse cx="188" cy="100" rx="44" ry="13" />
        <ellipse cx="717" cy="126" rx="49" ry="14" />
      </g>
    </svg>
  );
}
