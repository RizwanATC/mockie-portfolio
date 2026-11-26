"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { BookOpen, Feather, RotateCcw, ScrollText, X } from "lucide-react";
import { heroes, levels, profile } from "@/data/resume";
import { achievements, coinIds, topicsFor } from "@/data/quests";
import { useGame } from "@/lib/store";
import HeroPicker from "./HeroPicker";
import { CoinMark, QUEST_ICONS, STROKE } from "./icons";

// the map pulls in the road curve (three.js), so it loads with the world rather than with the page
const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

type Menu = "hero" | "quests" | null;

function Toast() {
  const toast = useGame((s) => s.toast);
  const [expired, setExpired] = useState<number | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setExpired(toast.id), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast || expired === toast.id) return null;
  const Icon = QUEST_ICONS[toast.icon];
  return (
    <div role="status" key={toast.id} className="panel animate-unfurl absolute bottom-[8.5rem] left-1/2 flex -translate-x-1/2 items-center gap-3 py-2 pl-2 pr-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-oak-deep bg-gilt text-oak-deep">
        <Icon size={18} strokeWidth={STROKE} aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-bold">{toast.title}</p>
        {toast.body && <p className="text-sm text-ink-soft">{toast.body}</p>}
      </div>
    </div>
  );
}

// What an NPC is saying, with the questions a visitor can ask them.
const NPC_PORTRAIT: Record<string, string> = {
  knight: "/kaykit/portraits/knight.webp",
  barbarian: "/kaykit/portraits/barbarian.webp",
  mage: "/kaykit/portraits/mage.webp",
  rogue: "/kaykit/portraits/rogue.webp",
  rogue_hooded: "/kaykit/portraits/rogue.webp",
};

function Diamond({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 10 10" aria-hidden className="mt-[0.35em] h-2.5 w-2.5 shrink-0">
      <path d="M5 0.8 9.2 5 5 9.2 0.8 5Z" fill={filled ? "#2c4f86" : "none"} stroke="#2c4f86" strokeWidth="1.4" />
    </svg>
  );
}

function Dialogue() {
  const dialogue = useGame((s) => s.dialogue);
  const say = useGame((s) => s.say);
  const [topic, setTopic] = useState<{ id: number; key: string | null }>({ id: 0, key: null });
  const [chars, setChars] = useState({ text: "", n: 0 });
  const topics = dialogue ? topicsFor(dialogue.level) : [];
  const picked = topic.id === dialogue?.id ? topics.find((t) => t.key === topic.key) : undefined;
  const text = picked?.reply ?? dialogue?.line ?? "";
  const engaged = !!picked;

  useEffect(() => {
    if (!text) return;
    // typewriter for each new line
    const tick = setInterval(() => setChars((c) => (c.text === text ? { text, n: c.n + 2 } : { text, n: 2 })), 24);
    return () => clearInterval(tick);
  }, [text]);

  useEffect(() => {
    // a greeting nobody answers closes itself; a conversation stays open until closed
    if (!dialogue || engaged) return;
    const close = setTimeout(() => say(null), 9000);
    return () => clearTimeout(close);
  }, [dialogue, engaged, say]);

  if (!dialogue) return null;
  const shown = chars.text === text ? text.slice(0, chars.n) : "";
  const choose = (key: string) => {
    setTopic({ id: dialogue.id, key });
    const s = useGame.getState();
    s.meet(dialogue.npc);
    s.ask(`${dialogue.level}-${key}`);
  };

  return (
    <div
      key={dialogue.id}
      role="dialog"
      aria-label={`${dialogue.name} says`}
      className="panel animate-unfurl pointer-events-auto absolute left-1/2 top-[4.75rem] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 p-4 text-left sm:top-20"
    >
      <div className="flex items-start gap-3">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-oak-deep bg-oak shadow-[0_0_0_3px_#d9a531]">
          <Image src={NPC_PORTRAIT[dialogue.who] ?? NPC_PORTRAIT.knight} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-none text-oak">{dialogue.name}</p>
          <p aria-live="polite" data-lenis-prevent className="mt-1.5 max-h-40 overflow-y-auto text-[17px] leading-snug text-ink">
            <span aria-hidden>{shown}</span>
            <span className="sr-only">{text}</span>
          </p>
          {picked?.links && (
            <div className="mt-3 flex flex-wrap gap-2">
              {picked.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="btn-heraldic px-3 py-1 text-sm font-medium"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => say(null)}
          aria-label="Close"
          className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-vellum-deep hover:text-ink"
        >
          <X size={18} strokeWidth={STROKE} aria-hidden />
        </button>
      </div>
      {topics.length > 0 && (
        <ul className="mt-3 grid gap-0.5 border-t border-oak/25 pt-2">
          {topics.map((t) => {
            const on = picked?.key === t.key;
            return (
              <li key={t.key}>
                <button
                  onClick={() => choose(t.key)}
                  aria-pressed={on}
                  className={`flex w-full gap-2.5 rounded-md px-2 py-1.5 text-left text-base leading-snug transition-colors ${
                    on ? "bg-heraldic/10 font-medium text-heraldic-deep" : "text-ink hover:bg-vellum-deep/60"
                  }`}
                >
                  <Diamond filled={on} />
                  {t.ask}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function QuestLog() {
  const unlocked = useGame((s) => s.achievements);
  const coins = useGame((s) => s.coins.length);
  const met = useGame((s) => s.met.length);
  const visited = useGame((s) => s.visited.length);
  const level = useGame((s) => s.level);
  const reset = useGame((s) => s.resetProgress);
  // skills are "collected" as you pass each level
  const satchel = [...new Set(levels.slice(0, level + 1).flatMap((l) => l.stack ?? []))];
  return (
    <div className="panel w-[min(20rem,calc(100vw-2rem))] p-4">
      <h2 className="font-display text-xl font-bold leading-none">Quest log</h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        {visited} of {levels.length} stops visited, {coins} of {coinIds.length} coins found, {met} adventurers met.
      </p>
      <ul data-lenis-prevent className="mt-3 max-h-[46vh] space-y-2.5 overflow-y-auto pr-1">
        {achievements.map((a) => {
          const done = unlocked.includes(a.id);
          const Icon = QUEST_ICONS[a.icon];
          return (
            <li key={a.id} className="flex items-center gap-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
                  done ? "border-oak-deep bg-gilt text-oak-deep" : "border-dashed border-oak/50 text-oak/50"
                }`}
              >
                <Icon size={17} strokeWidth={STROKE} aria-hidden />
              </span>
              <div className="leading-tight">
                <p className={`font-display text-base font-bold ${done ? "text-ink" : "text-ink-soft"}`}>
                  {a.title}
                  <span className="sr-only">{done ? ", unlocked" : ", locked"}</span>
                </p>
                <p className="text-sm text-ink-soft">{a.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {satchel.length > 0 && (
        <div className="mt-4 border-t border-oak/25 pt-3">
          <h3 className="font-display text-base font-bold leading-none">Satchel</h3>
          <p className="mt-1 text-sm text-ink-soft">Tools picked up along the road.</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {satchel.map((s) => (
              <li key={s} className="rounded-md border border-oak/40 bg-vellum-deep/50 px-2 py-0.5 text-sm text-ink">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={reset} className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">
        <RotateCcw size={14} strokeWidth={STROKE} aria-hidden />
        Start a new save
      </button>
    </div>
  );
}

function ToolButton({ label, onClick, expanded, children }: { label: string; onClick: () => void; expanded?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={label}
      className={`flex h-9 items-center gap-1.5 rounded-md px-2 text-[15px] font-medium transition-colors hover:bg-white/10 ${expanded ? "bg-white/15" : ""}`}
    >
      {children}
    </button>
  );
}

export default function Hud({ onSelect, onPlain }: { onSelect: (i: number) => void; onPlain: () => void }) {
  const level = useGame((s) => s.level);
  const current = levels[level];
  const coins = useGame((s) => s.coins.length);
  const trophies = useGame((s) => s.achievements.length);
  const heroId = useGame((s) => s.hero);
  const jarvisOpen = useGame((s) => s.jarvisOpen);
  const setJarvis = useGame((s) => s.setJarvis);
  const hero = heroes.find((h) => h.id === heroId) ?? heroes[0];
  const [menu, setMenu] = useState<Menu>(null);
  const toggle = (m: Menu) => {
    setMenu((cur) => (cur === m ? null : m));
    setJarvis(false);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 text-ink">
      <div className="flex items-start justify-between gap-3 p-3 sm:p-5">
        {/* nameplate: who this is and where you are */}
        <div className="plank pointer-events-auto hidden px-3.5 py-1.5 leading-tight md:block">
          <p className="font-display text-xl font-bold leading-none">{profile.alias}</p>
          <p className="mt-0.5 text-sm text-vellum/80">{current.company ?? current.title}</p>
        </div>

        {/* satchel toolbar */}
        <div className="plank pointer-events-auto ml-auto flex items-center gap-0.5 p-1">
          <span className="flex h-9 items-center gap-1.5 px-2 text-[15px] font-medium tabular-nums" aria-label={`${coins} of ${coinIds.length} coins found`}>
            <CoinMark className="h-5 w-5" />
            {coins}/{coinIds.length}
          </span>
          <ToolButton label={`Quest log, ${trophies} of ${achievements.length} achievements`} onClick={() => toggle("quests")} expanded={menu === "quests"}>
            <ScrollText size={18} strokeWidth={STROKE} aria-hidden />
            <span className="tabular-nums">
              {trophies}/{achievements.length}
            </span>
          </ToolButton>
          <ToolButton label={`Change hero, now ${hero.name}`} onClick={() => toggle("hero")} expanded={menu === "hero"}>
            <span className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-gilt">
              <Image src={hero.portrait} alt="" fill sizes="28px" className="object-cover" />
            </span>
          </ToolButton>
          <span aria-hidden className="mx-1 h-6 w-px bg-vellum/25" />
          <ToolButton
            label="Ask Jarvis"
            onClick={() => {
              setMenu(null);
              setJarvis(!jarvisOpen);
            }}
            expanded={jarvisOpen}
          >
            <Feather size={18} strokeWidth={STROKE} aria-hidden />
            <span className="hidden sm:inline">Ask Jarvis</span>
          </ToolButton>
          <ToolButton label="Switch to the plain view" onClick={onPlain}>
            <BookOpen size={18} strokeWidth={STROKE} aria-hidden />
            <span className="hidden sm:inline">Plain view</span>
          </ToolButton>
        </div>
      </div>

      {menu && (
        <div className="pointer-events-auto absolute right-3 top-[4.25rem] z-30 sm:right-5 sm:top-20">
          {menu === "quests" ? (
            <QuestLog />
          ) : (
            <div className="panel p-4">
              <HeroPicker compact />
            </div>
          )}
        </div>
      )}

      <Dialogue />
      <Toast />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4">
        <RouteMap onSelect={onSelect} />
      </div>
    </div>
  );
}
