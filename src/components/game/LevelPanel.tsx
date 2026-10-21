"use client";

import { useEffect, useRef, useState } from "react";
import { profile, type Level } from "@/data/resume";
import HeroPicker from "./HeroPicker";

const SCREEN_CARD = "max-w-xl rounded-xl border border-white/10 bg-black/45 p-6 backdrop-blur-sm sm:p-8";

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className={SCREEN_CARD}>
      <p className="font-display text-sm font-semibold tracking-[0.3em] text-purple-300">{profile.name.toUpperCase()}</p>
      <h1 className="mt-3 font-display text-6xl font-bold leading-none tracking-tight text-white drop-shadow-[0_0_24px_rgba(168,85,247,0.6)] sm:text-8xl">
        {profile.alias.toUpperCase()}
      </h1>
      <p className="mt-6 text-lg text-white/70">
        {profile.title} · {profile.location}
      </p>
      <p className="mt-2 text-white/50">{profile.motto}</p>
      <div className="mt-8">
        <HeroPicker />
      </div>
      <button onClick={onStart} className="mt-8 animate-pulse font-display text-base font-semibold tracking-[0.25em] text-yellow-300 hover:text-yellow-200">
        ▶ PRESS START
      </button>
      <p className="mt-3 text-xs text-white/30">or scroll</p>
    </div>
  );
}

function ContinueScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(9);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setRunning(e.isIntersecting);
        if (!e.isIntersecting) setCount(9);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running || count === 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [running, count]);

  const links = [
    { label: "EMAIL", href: `mailto:${profile.email}` },
    { label: "LINKEDIN", href: profile.linkedin },
    { label: "GITHUB", href: profile.github },
    { label: "RESUME", href: "/resume/resume.pdf" },
  ];

  return (
    <div ref={ref} className={SCREEN_CARD}>
      <h2 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">CONTINUE?</h2>
      <p className="mt-4 font-display text-8xl font-bold text-yellow-300 tabular-nums" aria-live="polite">
        {count}
      </p>
      <p className="mt-6 text-white/60">Insert coin: let&apos;s build something.</p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded border border-purple-400/40 bg-purple-600/20 px-4 py-3 text-center font-display text-xs font-semibold tracking-wider text-white backdrop-blur hover:bg-purple-600/50"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// Work levels show no card: the NPC on the stage answers what, when and which tools. The text stays for screen readers.
function LevelCard({ level }: { level: Level }) {
  return (
    <article className="sr-only">
      <h2>
        {level.tag} · {level.company ?? level.title}
      </h2>
      {(level.role || level.period) && <p>{[level.role, level.period].filter(Boolean).join(" · ")}</p>}
      <p>{level.headline}</p>
      <ul>
        {level.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {level.stat && (
        <p>
          {level.stat.value} {level.stat.label}
        </p>
      )}
      {level.stack && <p>{level.stack.join(", ")}</p>}
    </article>
  );
}

export default function LevelPanel({ level, index, onStart }: { level: Level; index: number; onStart: () => void }) {
  return (
    <section
      id={`level-${level.id}`}
      aria-label={level.title}
      // click-through so the 3D world behind (phones, character) stays interactive; content opts back in
      className="pointer-events-none flex min-h-[120vh] items-end px-5 pb-16 sm:items-center sm:px-12 sm:pb-0 lg:px-20 [&>*]:pointer-events-auto"
      data-level={index}
    >
      {level.id === "start" ? (
        <TitleScreen onStart={onStart} />
      ) : level.id === "continue" ? (
        <ContinueScreen />
      ) : (
        <LevelCard level={level} />
      )}
    </section>
  );
}
