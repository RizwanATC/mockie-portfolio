"use client";

import { heroes, levels } from "@/data/resume";
import { useGame } from "@/lib/store";
import { frameAt, stageFrames } from "./path";

// A pocket map of the real road: the same curve the camera follows, seen from above, with a waypoint per level
// and the visitor's hero gliding along it as they scroll. Click a waypoint to travel there.

const LAST = levels.length - 1;
const W = 300;
const H = 92;
const PAD = 12;

// sample the road a little past the first and last stop so it doesn't end exactly on a waypoint
const samples = Array.from({ length: 121 }, (_, k) => {
  const p = frameAt(-0.35 + ((LAST + 0.7) * k) / 120).pos;
  return [p.x, p.z] as const;
});
const xs = samples.map((p) => p[0]);
const zs = samples.map((p) => p[1]);
const minX = Math.min(...xs);
const minZ = Math.min(...zs);
const scale = Math.min((W - PAD * 2) / (Math.max(...xs) - minX), (H - PAD * 2) / (Math.max(...zs) - minZ));
const offX = (W - (Math.max(...xs) - minX) * scale) / 2;
const offY = (H - (Math.max(...zs) - minZ) * scale) / 2;
const project = (x: number, z: number) => [offX + (x - minX) * scale, offY + (z - minZ) * scale] as const;

const roadD = samples.map(([x, z], k) => `${k ? "L" : "M"}${project(x, z).map((n) => n.toFixed(1)).join(" ")}`).join("");
const stops = stageFrames.map((f) => project(f.pos.x, f.pos.z));

export default function RouteMap({ onSelect }: { onSelect: (i: number) => void }) {
  const progress = useGame((s) => s.progress);
  const level = useGame((s) => s.level);
  const visited = useGame((s) => s.visited);
  const heroId = useGame((s) => s.hero);
  const hero = heroes.find((h) => h.id === heroId) ?? heroes[0];
  const here = frameAt(progress * LAST).pos;
  const [mx, my] = project(here.x, here.z);

  return (
    <nav aria-label="Route map" className="panel pointer-events-auto px-2 pb-1.5 pt-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-[230px] sm:w-[300px]">
        <defs>
          <clipPath id="route-hero">
            <circle cx={mx} cy={my} r="8" />
          </clipPath>
        </defs>
        {/* the road: an oak edge with a worn dirt centre */}
        <path d={roadD} fill="none" stroke="#6a4327" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadD} fill="none" stroke="#e6cf9c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={roadD} fill="none" stroke="#b08a55" strokeWidth="0.8" strokeDasharray="2 3" strokeLinecap="round" />

        {stops.map(([x, y], i) => {
          const lvl = levels[i];
          const been = visited.includes(i) || i <= level;
          const label = `${lvl.title}${lvl.company ? `, ${lvl.company}` : ""}`;
          return (
            <g
              key={lvl.id}
              role="button"
              tabIndex={0}
              aria-label={`Travel to ${label}`}
              aria-current={i === level ? "location" : undefined}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>circle:first-of-type]:stroke-[#2c4f86] [&:hover>circle:first-of-type]:stroke-[#2c4f86]"
            >
              <title>{label}</title>
              {/* generous invisible hit area */}
              <circle cx={x} cy={y} r="11" fill="transparent" stroke="transparent" strokeWidth="2" />
              <circle cx={x} cy={y} r="5" fill={been ? "#2c4f86" : "#efdcb0"} stroke="#3d2616" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* the visitor's hero */}
        <g pointerEvents="none">
          <circle cx={mx} cy={my} r="10" fill="#d9a531" stroke="#3d2616" strokeWidth="1.5" />
          <image href={hero.portrait} x={mx - 8} y={my - 8} width="16" height="16" clipPath="url(#route-hero)" preserveAspectRatio="xMidYMid slice" />
        </g>
      </svg>
      <p className="truncate px-1 text-center font-display text-sm font-bold leading-tight text-ink sm:text-[15px]">{levels[level].title}</p>
    </nav>
  );
}
