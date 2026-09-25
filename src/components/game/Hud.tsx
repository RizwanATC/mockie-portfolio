"use client";

import { levels, profile } from "@/data/resume";
import { useGame } from "@/lib/store";

export default function Hud({ onSelect, onPlain }: { onSelect: (i: number) => void; onPlain: () => void }) {
  const level = useGame((s) => s.level);
  const progress = useGame((s) => s.progress);
  const current = levels[level];

  // Skills are "collected" as you pass each level.
  const collected = [...new Set(levels.slice(0, level + 1).flatMap((l) => l.stack ?? []))];

  return (
    <div className="pointer-events-none fixed inset-0 z-20 font-display text-xs font-semibold tracking-wider text-white">
      {/* top bar */}
      <div className="flex items-center gap-4 px-4 pt-4 sm:px-6">
        <span className="pointer-events-auto text-purple-300">{profile.alias.toUpperCase()}</span>
        <span className="rounded px-2 py-1" style={{ background: `${current.color}33`, color: current.color }}>
          {current.tag}
        </span>
        <div className="hidden flex-1 items-center gap-2 sm:flex">
          <span className="text-white/50">XP</span>
          <div className="h-2 flex-1 overflow-hidden rounded-sm border border-white/20 bg-white/5">
            <div
              className="h-full transition-[width] duration-300"
              style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, #7c3aed, ${current.color})` }}
            />
          </div>
          <span className="text-white/50">{current.period?.split(" – ")[0].split(" ").pop() ?? "····"}</span>
        </div>
        <button
          onClick={onPlain}
          className="pointer-events-auto ml-auto rounded border border-white/20 bg-black/40 px-3 py-1.5 hover:border-purple-400 hover:text-purple-200"
        >
          PLAIN
        </button>
      </div>

      {/* level select minimap */}
      <nav aria-label="Level select" className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {levels.map((l, i) => (
          <button
            key={l.id}
            onClick={() => onSelect(i)}
            title={`${l.tag} · ${l.title}`}
            aria-label={`${l.tag} ${l.title}`}
            aria-current={i === level}
            className="pointer-events-auto h-3 w-3 rounded-sm border border-white/30 transition-all hover:scale-125"
            style={{
              background: i <= level ? l.color : "transparent",
              boxShadow: i === level ? `0 0 10px ${l.color}` : undefined,
              transform: i === level ? "scale(1.3)" : undefined,
            }}
          />
        ))}
      </nav>

      {/* inventory */}
      {collected.length > 0 && (
        <div className="absolute bottom-12 right-4 hidden max-w-[16rem] flex-wrap justify-end gap-1.5 sm:flex">
          <span className="w-full text-right text-white/40">INVENTORY</span>
          {collected.map((s) => (
            <span key={s} className="rounded border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white/80">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
