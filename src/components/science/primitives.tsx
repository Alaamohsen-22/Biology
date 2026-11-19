import type { Variables } from "../../engine/models";
export type ArtProps = {
  t: number;
  value: number;
  v: Variables;
  prefix: string;
};
export const phase = (t: number, a = 0, b = 1) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  prefix,
  color = "#71937e",
  dash = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  prefix: string;
  color?: string;
  dash?: boolean;
}) {
  return (
    <path
      d={`M${x1} ${y1}L${x2} ${y2}`}
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeDasharray={dash ? "6 7" : undefined}
      markerEnd={`url(#${prefix}-arrow)`}
    />
  );
}
export function Label({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  return (
    <text x={x} y={y} textAnchor="middle" className="science-label">
      {children}
    </text>
  );
}
export function Drop({
  x,
  y,
  size = 7,
  color = "#5dabc3",
  opacity = 1,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <path
      d={`M${x} ${y - size}C${x - size * 1.7} ${y + size * 0.6},${x - size} ${y + size * 1.7},${x} ${y + size * 1.7}C${x + size} ${y + size * 1.7},${x + size * 1.7} ${y + size * 0.6},${x} ${y - size}`}
      fill={color}
      opacity={opacity}
    />
  );
}
export function Particles({
  from,
  to,
  t,
  count = 5,
  color = "#83b4c2",
  r = 5,
  visible = true,
}: {
  from: [number, number];
  to: [number, number];
  t: number;
  count?: number;
  color?: string;
  r?: number;
  visible?: boolean;
}) {
  return (
    <g opacity={visible ? 1 : 0}>
      {Array.from({ length: count }, (_, i) => {
        const p = (t + i / count) % 1;
        return (
          <circle
            key={i}
            cx={mix(from[0], to[0], p)}
            cy={mix(from[1], to[1], p)}
            r={r}
            fill={color}
            opacity={Math.sin(p * Math.PI) * 0.9}
          />
        );
      })}
    </g>
  );
}
export function Plant({
  x = 360,
  base = 350,
  growth = 1,
  bend = 0,
  prefix,
  roots = false,
  water = false,
}: {
  x?: number;
  base?: number;
  growth?: number;
  bend?: number;
  prefix: string;
  roots?: boolean;
  water?: boolean;
}) {
  const h = growth === 0 ? 0 : 25 + growth * 190;
  return (
    <g>
      <ellipse cx={x} cy={base+64} rx="54" ry="9" fill="#3c4e3c" opacity=".12"/>
      <path
        d={`M${x - 48} ${base}h96l-14 63h-68z`}
        fill={`url(#${prefix}-${water ? "water" : "crust"})`}
        stroke={water ? "#8db2b4" : "#9f7859"}
        strokeWidth="2"
      />
      <path
        d={`M${x - 53} ${base}h106`}
        stroke="#d4b18a"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {roots && (
        <g stroke="#b79b70" strokeWidth="3" fill="none">
          {[-1,1].map(side=><g key={side}>{[0,1,2].map(n=><path key={n} d={`M${x} ${base+10+n*8}q${side*18} 4 ${side*(22+n*3)} 19m${-side*11} -8l${side*8} 7`} strokeWidth="1.5"/>)}</g>)}
          <path
            d={`M${x} ${base + 5}v40m0-32-22 17m22-10 22 13m-22-3-16 17m16-5 13 10`}
          />
        </g>
      )}
      <path
        d={`M${x} ${base}Q${x + bend * 0.6} ${base - h * 0.45} ${x + bend} ${base - h}`}
        stroke="#63895f"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      {Array.from({ length: Math.ceil(growth * 6) }, (_, i) => {
        const level = (i + 1) / 7,
          px = x + bend * level,
          py = base - h * level;
        return (
          <g
            key={i}
            transform={`translate(${px} ${py}) rotate(${i % 2 ? -27 : 27}) scale(${0.55 + growth * 0.5})`}
          >
            <path d={i%2 ? "M0 0Q-15-37-67-18Q-42 15 0 0Z" : "M0 0Q15-37 67-18Q42 15 0 0Z"} fill={`url(#${prefix}-leaf)`} stroke="#608161" strokeWidth="1"/>
            {[1,2,3].map(n=><path key={n} d={`M${(i%2?-1:1)*n*13} ${-n*3}l${(i%2?-1:1)*8} -10`} stroke="#c3d2a6" strokeWidth=".9" opacity=".6"/>)}
            <path
              d={i % 2 ? "M-2 0l-49-17" : "M2 0l49-17"}
              stroke="#a9c097"
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </g>
  );
}
export function Bench() {
  return (
    <g>
      <rect x="70" y="366" width="620" height="17" rx="7" fill="#b7ac89" />
      <rect x="95" y="383" width="12" height="44" rx="4" fill="#d0c6a8" />
      <rect x="653" y="383" width="12" height="44" rx="4" fill="#d0c6a8" />
    </g>
  );
}
