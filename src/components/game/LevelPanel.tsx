"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { apps, profile, type App, type Level } from "@/data/resume";
import { useGame } from "@/lib/store";
import { phoneFrame } from "@/data/phoneFrame";
import HeroPicker from "./HeroPicker";

const THUMB_W = 38;
const THUMB_H = THUMB_W / phoneFrame.aspect;
// the screen hole's height:width, used to fit a landscape screenshot into a rotated frame
const HOLE_RATIO = phoneFrame.screen.height / (phoneFrame.aspect * phoneFrame.screen.width);

// Screenshot in the mockup's screen hole with the iPhone 14 Pro frame on top.
// Landscape: the whole phone turns a quarter left and the screenshot turns back upright.
function PhoneThumb({ src, landscape }: { src: string; landscape: boolean }) {
  return (
    <span
      className="absolute left-1/2 top-1/2"
      style={{ width: THUMB_W, height: THUMB_H, transform: `translate(-50%, -50%) rotate(${landscape ? -90 : 0}deg)` }}
    >
      <span
        className="absolute overflow-hidden rounded-[4px]"
        style={{
          left: `${phoneFrame.screen.left * 100}%`,
          top: `${phoneFrame.screen.top * 100}%`,
          width: `${phoneFrame.screen.width * 100}%`,
          height: `${phoneFrame.screen.height * 100}%`,
        }}
      >
        <span
          className="absolute left-1/2 top-1/2"
          style={
            landscape
              ? { width: `${HOLE_RATIO * 100}%`, height: `${100 / HOLE_RATIO}%`, transform: "translate(-50%, -50%) rotate(90deg)" }
              : { width: "100%", height: "100%", transform: "translate(-50%, -50%)" }
          }
        >
          <Image src={src} alt="" fill sizes="80px" className="object-cover" />
        </span>
      </span>
      <Image src={phoneFrame.src} alt="" fill sizes="42px" className="pointer-events-none" />
    </span>
  );
}

function ScreenStrip({ app }: { app: App }) {
  const current = useGame((s) => s.screens[app.id] ?? -1);
  const setScreen = useGame((s) => s.setScreen);
  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {app.href ? (
            <a href={app.href} target="_blank" rel="noreferrer" className="hover:underline">
              {app.name} ↗
            </a>
          ) : (
            app.name
          )}
        </p>
        <p className="truncate text-xs text-white/45">{app.tagline}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {app.screens.map((src, i) => {
          const landscape = !!app.landscape?.includes(i);
          return (
            <button
              key={src}
              onClick={() => setScreen(app.id, i === current ? -1 : i)}
              aria-label={`${app.name} screenshot ${i + 1}`}
              aria-pressed={i === current}
              className="relative transition-transform hover:-translate-y-0.5"
              style={{
                width: landscape ? THUMB_H : THUMB_W,
                height: landscape ? THUMB_W : THUMB_H,
                opacity: current === -1 || i === current ? 1 : 0.6,
                filter: i === current ? `drop-shadow(0 0 5px ${app.color})` : undefined,
              }}
            >
              <PhoneThumb src={src} landscape={landscape} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Title and Continue sit on a dark glass card so they read against the bright daytime world.
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

function LevelCard({ level }: { level: Level }) {
  return (
    <article
      className="max-w-md rounded-lg border bg-black/55 p-5 backdrop-blur-md sm:p-6"
      style={{ borderColor: `${level.color}55`, boxShadow: `0 0 40px ${level.color}22` }}
    >
      <p className="font-display text-xs font-semibold tracking-[0.2em]" style={{ color: level.color }}>
        {level.tag} · {level.title.toUpperCase()}
      </p>
      {level.company && <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white">{level.company}</h2>}
      {(level.role || level.period) && (
        <p className="mt-1 text-sm text-white/50">
          {[level.role, level.period].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-4 text-lg text-white/90">{level.headline}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/70">
        {level.points.map((p) => (
          <li key={p} className="flex gap-2">
            <span style={{ color: level.color }}>▸</span>
            {p}
          </li>
        ))}
      </ul>
      {level.stat && (
        <p className="mt-5 font-display text-4xl font-bold" style={{ color: level.color }}>
          {level.stat.value} <span className="text-xs font-semibold tracking-wider text-white/50">{level.stat.label.toUpperCase()}</span>
        </p>
      )}
      {level.stack && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {level.stack.map((s) => (
            <span key={s} className="rounded border border-white/15 px-2 py-0.5 text-xs text-white/60">
              + {s}
            </span>
          ))}
        </div>
      )}
      {apps
        .filter((a) => a.level === level.id)
        .map((a) => (
          <ScreenStrip key={a.id} app={a} />
        ))}
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
