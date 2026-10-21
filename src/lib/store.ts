import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_HERO } from "@/data/resume";

export type ViewMode = "3d" | "plain";

type GameState = {
  mode: ViewMode | null; // null until the client picks one
  progress: number; // 0..1 across the whole scroll
  level: number; // index into levels
  moving: boolean; // camera travelling between levels
  setMode: (mode: ViewMode) => void;
  screens: Record<string, number>; // current screenshot per app id
  setScroll: (progress: number, level: number) => void;
  setScreen: (app: string, index: number) => void;

  // Saved between visits (see persist below).
  hero: string;
  heroesTried: string[];
  coins: string[]; // collected coin ids
  met: string[]; // NPCs talked to
  visited: number[]; // level indexes reached
  achievements: string[];
  setHero: (id: string) => void;
  collect: (coin: string) => void;
  meet: (npc: string) => void;
  visit: (level: number) => void;
  unlock: (achievement: string) => void;
  resetProgress: () => void;

  // Transient: what an NPC is saying, shown as a dialogue box by the HUD.
  dialogue: { id: number; name: string; line: string; who: string } | null;
  say: (d: { name: string; line: string; who: string } | null) => void;

  // Transient: the latest toast ("+1 coin", "Achievement unlocked") for the HUD.
  toast: { id: number; title: string; body?: string; icon: string } | null;
  notify: (t: { title: string; body?: string; icon: string }) => void;
};

const add = <T,>(list: T[], item: T) => (list.includes(item) ? list : [...list, item]);

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      mode: null,
      progress: 0,
      level: 0,
      moving: false,
      setMode: (mode) => set({ mode }),
      screens: {},
      setScroll: (progress, level) => set({ progress, level }),
      setScreen: (app, index) => set((s) => ({ screens: { ...s.screens, [app]: index } })),

      hero: DEFAULT_HERO,
      heroesTried: [DEFAULT_HERO],
      coins: [],
      met: [],
      visited: [],
      achievements: [],
      setHero: (hero) => set((s) => ({ hero, heroesTried: add(s.heroesTried, hero) })),
      collect: (coin) => set((s) => ({ coins: add(s.coins, coin) })),
      meet: (npc) => set((s) => ({ met: add(s.met, npc) })),
      visit: (level) => set((s) => (s.visited.includes(level) ? s : { visited: [...s.visited, level] })),
      unlock: (a) => set((s) => ({ achievements: add(s.achievements, a) })),
      resetProgress: () => set((s) => ({ coins: [], met: [], visited: [], achievements: [], heroesTried: [s.hero] })),

      dialogue: null,
      say: (d) => set({ dialogue: d && { ...d, id: Date.now() + Math.random() } }),
      toast: null,
      notify: (t) => set({ toast: { ...t, id: Date.now() + Math.random() } }),
    }),
    {
      name: "mockie-save",
      // hydrated on the client by GameShell, so the server render and first client render match
      skipHydration: true,
      partialize: (s) => ({
        hero: s.hero,
        heroesTried: s.heroesTried,
        coins: s.coins,
        met: s.met,
        visited: s.visited,
        achievements: s.achievements,
      }),
    }
  )
);
