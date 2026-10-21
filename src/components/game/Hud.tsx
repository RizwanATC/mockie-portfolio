"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { heroes, levels, profile } from "@/data/resume";
import { achievements, coinIds, topicsFor } from "@/data/quests";
import { useGame } from "@/lib/store";
import HeroPicker from "./HeroPicker";

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
  return (
    <div
      role="status"
      key={toast.id}
      className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-lg border-2 border-yellow-300/80 bg-black/75 px-4 py-2 shadow-[0_0_24px_rgba(253,224,71,0.35)] backdrop-blur"
    >
      <span className="text-2xl">{toast.icon}</span>
      <div>
        <p className="text-yellow-300">{toast.title.toUpperCase()}</p>
        {toast.body && <p className="font-sans text-[11px] font-normal tracking-normal text-white/70">{toast.body}</p>}
      </div>
    </div>
  );
}

// RPG-style dialogue box for whatever an NPC is saying.
const NPC_PORTRAIT: Record<string, string> = {
  knight: "/kaykit/portraits/knight.webp",
  barbarian: "/kaykit/portraits/barbarian.webp",
  mage: "/kaykit/portraits/mage.webp",
  rogue: "/kaykit/portraits/rogue.webp",
  rogue_hooded: "/kaykit/portraits/rogue.webp",
};

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
      role="dialog"
      aria-label={`${dialogue.name} says`}
      className="pointer-events-auto absolute left-1/2 top-16 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border-2 border-amber-900/80 bg-amber-50/95 p-3 text-left shadow-xl"
    >
      <div className="flex items-start gap-3">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 border-amber-900/60 bg-slate-800">
          <Image src={NPC_PORTRAIT[dialogue.who] ?? NPC_PORTRAIT.knight} alt="" fill sizes="48px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-amber-700">{dialogue.name.toUpperCase()}</p>
          <p aria-live="polite" className="mt-0.5 max-h-40 overflow-y-auto font-sans text-sm font-normal normal-case leading-snug tracking-normal text-amber-950">
            <span aria-hidden>{shown}</span>
            <span className="sr-only">{text}</span>
          </p>
          {picked?.links && (
            <div className="mt-2 flex flex-wrap gap-2">
              {picked.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="rounded border border-amber-900/50 bg-amber-200 px-2 py-1 text-[11px] text-amber-950 hover:bg-amber-300"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => say(null)} aria-label="Close" className="text-amber-800/70 hover:text-amber-950">
          ✕
        </button>
      </div>
      {topics.length > 0 && (
        <ul className="mt-3 grid gap-1 border-t border-amber-900/20 pt-2">
          {topics.map((t) => (
            <li key={t.key}>
              <button
                onClick={() => choose(t.key)}
                className={`w-full rounded px-2 py-1 text-left font-sans text-[13px] font-medium normal-case tracking-normal hover:bg-amber-200 ${
                  picked?.key === t.key ? "bg-amber-200 text-amber-950" : "text-amber-900"
                }`}
              >
                <span className="mr-1.5 text-amber-600">{picked?.key === t.key ? "▶" : "›"}</span>
                {t.ask}
              </button>
            </li>
          ))}
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
  const reset = useGame((s) => s.resetProgress);
  return (
    <div className="w-72 rounded-lg border border-white/15 bg-black/80 p-4 backdrop-blur">
      <p className="text-yellow-300">QUEST LOG</p>
      <p className="mt-1 font-sans text-[11px] font-normal tracking-normal text-white/60">
        {visited}/{levels.length} levels · {coins}/{coinIds.length} coins · {met} adventurers met
      </p>
      <ul className="mt-3 space-y-2">
        {achievements.map((a) => {
          const done = unlocked.includes(a.id);
          return (
            <li key={a.id} className={`flex items-center gap-3 ${done ? "" : "opacity-45"}`}>
              <span className={`text-xl ${done ? "" : "grayscale"}`}>{a.icon}</span>
              <div>
                <p className={done ? "text-white" : "text-white/70"}>{a.title.toUpperCase()}</p>
                <p className="font-sans text-[11px] font-normal tracking-normal text-white/55">{a.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <button onClick={reset} className="mt-4 text-[10px] text-white/40 underline hover:text-white/70">
        RESET PROGRESS
      </button>
    </div>
  );
}

export default function Hud({ onSelect, onPlain }: { onSelect: (i: number) => void; onPlain: () => void }) {
  const level = useGame((s) => s.level);
  const progress = useGame((s) => s.progress);
  const current = levels[level];
  const coins = useGame((s) => s.coins.length);
  const trophies = useGame((s) => s.achievements.length);
  const heroId = useGame((s) => s.hero);
  const hero = heroes.find((h) => h.id === heroId) ?? heroes[0];
  const [menu, setMenu] = useState<Menu>(null);
  const toggle = (m: Menu) => setMenu((cur) => (cur === m ? null : m));

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
        <div className="ml-auto flex items-center gap-2">
          <span title="Coins collected" className="whitespace-nowrap rounded border border-yellow-300/40 bg-black/40 px-2.5 py-1.5 text-yellow-300">
            🪙 {coins}/{coinIds.length}
          </span>
          <button
            onClick={() => toggle("quests")}
            aria-expanded={menu === "quests"}
            title="Quest log"
            className="pointer-events-auto whitespace-nowrap rounded border border-white/20 bg-black/40 px-2.5 py-1.5 hover:border-yellow-300"
          >
            🏆 {trophies}/{achievements.length}
          </button>
          <button
            onClick={() => toggle("hero")}
            aria-expanded={menu === "hero"}
            title="Change hero"
            className="pointer-events-auto flex items-center gap-2 rounded border border-white/20 bg-black/40 py-1 pl-1 pr-2.5 hover:border-yellow-300"
          >
            <span className="relative h-6 w-6 overflow-hidden rounded-full">
              <Image src={hero.portrait} alt="" fill sizes="24px" className="object-cover" />
            </span>
            <span className="hidden sm:inline">HERO</span>
          </button>
          <button
            onClick={onPlain}
            className="pointer-events-auto rounded border border-white/20 bg-black/40 px-3 py-1.5 hover:border-purple-400 hover:text-purple-200"
          >
            PLAIN
          </button>
        </div>
      </div>

      {menu && (
        <div className="pointer-events-auto absolute right-4 top-28 z-30 sm:right-6">
          {menu === "quests" ? (
            <QuestLog />
          ) : (
            <div className="rounded-lg border border-white/15 bg-black/80 p-4 backdrop-blur">
              <HeroPicker compact />
            </div>
          )}
        </div>
      )}

      <Dialogue />
      <Toast />

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
