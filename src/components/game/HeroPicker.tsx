"use client";

import Image from "next/image";
import { heroes } from "@/data/resume";
import { useGame } from "@/lib/store";

// Character select: a row of portraits. Used on the title screen and in the HUD's hero menu.
export default function HeroPicker({ compact = false }: { compact?: boolean }) {
  const hero = useGame((s) => s.hero);
  const setHero = useGame((s) => s.setHero);
  const current = heroes.find((h) => h.id === hero) ?? heroes[0];

  return (
    <div>
      <p className="font-display text-[11px] font-semibold tracking-[0.25em] text-white/60">
        CHOOSE YOUR HERO · <span className="text-yellow-300">{current.name.toUpperCase()}</span>
        <span className="text-white/40"> · {current.role}</span>
      </p>
      <div role="radiogroup" aria-label="Choose your hero" className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
        {heroes.map((h) => {
          const active = h.id === hero;
          return (
            <button
              key={h.id}
              role="radio"
              aria-checked={active}
              aria-label={h.name}
              title={`${h.name} · ${h.role}`}
              onClick={() => setHero(h.id)}
              className={`relative overflow-hidden rounded-full border-2 bg-slate-900 transition-transform hover:-translate-y-0.5 ${
                compact ? "h-11 w-11" : "h-11 w-11 sm:h-14 sm:w-14"
              } ${active ? "border-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.6)]" : "border-white/25 hover:border-white/60"}`}
            >
              <Image src={h.portrait} alt="" fill sizes="56px" className="object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
