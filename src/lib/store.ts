import { create } from "zustand";

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
};

export const useGame = create<GameState>((set) => ({
  mode: null,
  progress: 0,
  level: 0,
  moving: false,
  setMode: (mode) => set({ mode }),
  screens: {},
  setScroll: (progress, level) => set({ progress, level }),
  setScreen: (app, index) => set((s) => ({ screens: { ...s.screens, [app]: index } })),
}));
