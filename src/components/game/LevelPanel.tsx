"use client";

import { useEffect, useRef, useState } from "react";
import { profile, type Level } from "@/data/resume";
import { FileText, Footprints, Mail } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import HeroPicker from "./HeroPicker";
import { STROKE } from "./icons";

const SCREEN = "panel w-full max-w-lg p-6 sm:p-8";

function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className={SCREEN}>
      <h1 className="font-display text-7xl font-extrabold leading-[0.85] tracking-[-0.01em] text-oak-deep sm:text-8xl">{profile.alias}</h1>
      <p className="mt-4 text-xl leading-snug text-ink">
        <span className="font-bold">{profile.name}</span>
        <br />
        {profile.title} in {profile.location.replace(", MY", ", Malaysia")}
      </p>
      <p className="mt-1 text-lg italic text-ink-soft">{profile.motto}</p>
      <div className="mt-6 border-t border-oak/25 pt-5">
        <HeroPicker />
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button onClick={onStart} className="btn-heraldic inline-flex items-center gap-2 px-5 py-2.5 font-display text-lg font-bold">
          <Footprints size={20} strokeWidth={STROKE} aria-hidden />
          Begin the journey
        </button>
        <span className="text-base text-ink-soft">or scroll down the road</span>
      </div>
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
    { label: "LinkedIn", href: profile.linkedin, icon: <LinkedInLogoIcon className="h-[18px] w-[18px]" aria-hidden /> },
    { label: "GitHub", href: profile.github, icon: <GitHubLogoIcon className="h-[18px] w-[18px]" aria-hidden /> },
    { label: "Résumé", href: "/resume/resume.pdf", icon: <FileText size={18} strokeWidth={STROKE} aria-hidden /> },
  ];

  return (
    <div ref={ref} className={SCREEN}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-5xl font-extrabold leading-none text-oak-deep sm:text-7xl">Continue?</h2>
        {/* the countdown sits on a gold coin: insert one to keep playing */}
        <p
          aria-live="polite"
          aria-label={`${count} seconds`}
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-[3px] border-oak-deep bg-gilt font-display text-5xl sm:h-24 sm:w-24 sm:text-6xl font-extrabold tabular-nums text-oak-deep shadow-[inset_0_0_0_5px_#f0c75a,inset_0_0_0_7px_rgb(61_38_22/0.35),0_10px_20px_-8px_rgb(43_28_18/0.6)]"
        >
          {count}
        </p>
      </div>
      <p className="mt-5 text-xl text-ink">Insert coin: let&apos;s build something.</p>
      <a href={`mailto:${profile.email}`} className="btn-heraldic mt-6 flex items-center justify-center gap-2 px-5 py-3 font-display text-lg font-bold">
        <Mail size={20} strokeWidth={STROKE} aria-hidden />
        Email Mockie
      </a>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="plank flex items-center justify-center gap-1.5 px-2 py-2.5 text-base font-medium transition-transform duration-150 ease-out-expo hover:-translate-y-px active:translate-y-px"
          >
            {l.icon}
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
      className="pointer-events-none flex min-h-[120vh] items-end px-4 pb-32 sm:items-center sm:px-12 sm:pb-0 lg:px-20 [&>*]:pointer-events-auto"
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
