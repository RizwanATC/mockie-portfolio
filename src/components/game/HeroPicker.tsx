"use client";

import Image from "next/image";
import { heroes } from "@/data/resume";
import { useGame } from "@/lib/store";

// Character select: a row of portrait medallions. Used on the title screen and in the HUD's hero menu.
export default function HeroPicker({ compact = false }: { compact?: boolean }) {
  const hero = useGame((s) => s.hero);
  const setHero = useGame((s) => s.setHero);
  const current = heroes.find((h) => h.id === hero) ?? heroes[0];

  return (
    <div>
      <p className="text-base leading-snug text-ink-soft">
        Travelling as the <span className="font-display text-lg font-bold text-ink">{current.name}</span>.{" "}
        <span className="whitespace-nowrap">{current.role}.</span>
      </p>
      <div role="radiogroup" aria-label="Choose your hero" className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
        {heroes.map((h) => {
          const active = h.id === hero;
          return (
            <button
              key={h.id}
              role="radio"
              aria-checked={active}
              aria-label={`${h.name}: ${h.role}`}
              title={h.name}
              onClick={() => setHero(h.id)}
              className={`relative overflow-hidden rounded-full border-2 bg-oak transition-[transform,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 ${
                compact ? "h-11 w-11" : "h-11 w-11 sm:h-14 sm:w-14"
              } ${active ? "border-oak-deep shadow-[0_0_0_3px_#d9a531,0_6px_12px_-4px_rgb(43_28_18/0.6)]" : "border-oak-deep/60 opacity-80 hover:opacity-100"}`}
            >
              <Image src={h.portrait} alt="" fill sizes="56px" className="object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
