"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { levels } from "@/data/resume";
import { achievements } from "@/data/quests";
import { useGame, type ViewMode } from "@/lib/store";
import Hud from "./Hud";
import LevelPanel from "./LevelPanel";
import Jarvis from "./Jarvis";

const World = dynamic(() => import("./World"), { ssr: false });

const MODE_KEY = "mockie-mode";

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function initialMode(): ViewMode {
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === "3d" || saved === "plain") return saved;
  } catch {}
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsWebGL()) return "plain";
  return "3d";
}

export default function GameShell({ plain }: { plain: React.ReactNode }) {
  const mode = useGame((s) => s.mode);
  const setMode = useGame((s) => s.setMode);
  const setScroll = useGame((s) => s.setScroll);
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    setMode(initialMode());
  }, [setMode]);

  // Load the saved game, then track visited levels and unlock achievements as the state changes.
  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;
    const check = () => {
      const s = useGame.getState();
      if (s.mode === "3d" && !s.visited.includes(s.level)) s.visit(s.level);
      for (const a of achievements) {
        // read fresh state each time: unlocking re-enters check() through the subscription
        const now = useGame.getState();
        if (now.achievements.includes(a.id) || !a.done(now, levels.length)) continue;
        s.unlock(a.id);
        s.notify({ icon: a.icon, title: `Achievement: ${a.title}`, body: a.body });
      }
    };
    Promise.resolve(useGame.persist.rehydrate()).then(() => {
      if (cancelled) return;
      unsub = useGame.subscribe(check);
      check();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const changeMode = (m: ViewMode) => {
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
    setMode(m);
    window.scrollTo(0, 0);
  };

  // Smooth scroll + progress tracking, 3D mode only.
  useEffect(() => {
    if (mode !== "3d") return;
    const l = new Lenis({ autoRaf: true });
    lenis.current = l;
    // Map scroll to a fractional level so a section's top edge lines the camera up with its stage.
    const onScroll = () => {
      const h = document.getElementById(`level-${levels[0].id}`)?.offsetHeight || window.innerHeight;
      const last = levels.length - 1;
      const f = Math.min(last, Math.max(0, window.scrollY / h));
      setScroll(f / last, Math.round(f));
    };
    l.on("scroll", onScroll);
    onScroll();
    return () => {
      l.destroy();
      lenis.current = null;
    };
  }, [mode, setScroll]);

  const goTo = (i: number) => {
    const el = document.getElementById(`level-${levels[i].id}`);
    if (el) lenis.current?.scrollTo(el);
  };

  if (mode === "plain") {
    return (
      <>
        {plain}
        <button
          onClick={() => changeMode("3d")}
          className="fixed bottom-5 right-5 z-50 rounded-full border border-purple-400/40 bg-purple-600/90 px-4 py-2 font-display text-xs font-semibold tracking-wider text-white shadow-lg shadow-purple-900/50 hover:bg-purple-500"
        >
          ▶ PLAY 3D
        </button>
      </>
    );
  }

  return (
    <>
      {mode === "3d" && <World />}
      <Hud onSelect={goTo} onPlain={() => changeMode("plain")} />
      <Jarvis onGoto={goTo} />
      {/* click-through: only the level cards take pointer events, so the 3D world below stays clickable */}
      <main className="pointer-events-none relative z-10">
        {levels.map((lvl, i) => (
          <LevelPanel key={lvl.id} level={lvl} index={i} onStart={() => goTo(1)} />
        ))}
      </main>
    </>
  );
}
