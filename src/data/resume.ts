// Single source of truth for the portfolio. The 3D world, HUD and Plain mode all read from here.

export type GhostAction = "idle" | "wave" | "walk" | "typing" | "dance" | "drive" | "jump" | "point" | "bow";

// Playable heroes, picked on the title screen or from the HUD. The KayKit ones are built by
// scripts/import-kaykit.mjs; "mockie" is the Meshy/Mixamo model from scripts/import-character.mjs.
export type Hero = {
  id: string;
  name: string;
  role: string;
  url: string;
  portrait: string;
  scale: number; // the KayKit rig is about twice the height of the Meshy export
};

export const heroes: Hero[] = [
  { id: "archer", name: "Archer", role: "Ranged · patient", url: "/models/kaykit/hero-archer.glb", portrait: "/kaykit/portraits/archer.webp", scale: 0.8 },
  { id: "knight", name: "Knight", role: "Tank · reliable", url: "/models/kaykit/hero-knight.glb", portrait: "/kaykit/portraits/knight.webp", scale: 0.8 },
  { id: "mage", name: "Mage", role: "Caster · clever", url: "/models/kaykit/hero-mage.glb", portrait: "/kaykit/portraits/mage.webp", scale: 0.8 },
  { id: "barbarian", name: "Barbarian", role: "Bruiser · bold", url: "/models/kaykit/hero-barbarian.glb", portrait: "/kaykit/portraits/barbarian.webp", scale: 0.8 },
  { id: "rogue", name: "Rogue", role: "Agile · quick", url: "/models/kaykit/hero-rogue.glb", portrait: "/kaykit/portraits/rogue.webp", scale: 0.8 },
  { id: "mockie", name: "Mockie", role: "The real one", url: "/models/mock.glb", portrait: "/profile/avatar.jpg", scale: 1.3 },
];
export const DEFAULT_HERO = "archer";

export type Level = {
  id: string;
  tag: string; // HUD label, e.g. "LV.1"
  title: string;
  company?: string;
  role?: string;
  period?: string;
  headline: string;
  points: string[];
  stack?: string[];
  stat?: { value: string; label: string };
  action: GhostAction;
  color: string; // accent for lighting + HUD
};

export type App = {
  id: string;
  name: string;
  tagline: string;
  level: string; // which level's stage the phone floats in
  screens: string[];
  landscape?: number[]; // indexes of screenshots taken in landscape
  color: string;
  href?: string;
  // centre of the phone row, relative to the stage origin
  position: [number, number, number];
  rotationY: number;
  scale?: number;
};

const shots = (dir: string, n: number) => Array.from({ length: n }, (_, i) => `/${dir}/screen-${i + 1}.jpg`);

export const apps: App[] = [
  {
    id: "thenoor",
    name: "TheNoor",
    tagline: "Solat · Azan · Qibla · 1M+ installs",
    level: "noor",
    screens: shots("thenoor", 4),
    color: "#eab308",
    href: "https://play.google.com/store/apps/details?id=com.thenoor.app",
    position: [2.4, 3.5, 0.3],
    rotationY: -0.1,
  },
  {
    id: "alafasy",
    name: "Alafasy",
    tagline: "Prayers & Al-Quran · 4.6★",
    level: "riverlens",
    screens: shots("alafasy", 5),
    color: "#10b981",
    href: "https://play.google.com/store/apps/details?id=com.alafasy.app",
    position: [2.4, 1.4, 1.2],
    rotationY: -0.1,
  },
  {
    id: "gajimeter",
    name: "GajiMeter",
    tagline: "Live salary & expense tracker · Flutter",
    level: "bonus",
    screens: shots("gajimeter", 5),
    color: "#a855f7",
    position: [2.4, 3.5, 0.6],
    rotationY: -0.1,
    scale: 0.55,
  },
  {
    id: "tekata",
    name: "Tekata",
    tagline: "Tilt-to-play party game · Flutter",
    level: "bonus",
    screens: shots("tekatagames", 5),
    landscape: [4],
    color: "#f43f5e",
    position: [1.9, 1.35, 1.4],
    rotationY: -0.1,
    scale: 0.55,
  },
];

export const profile = {
  name: "Rizwan bin Mat Nawi",
  alias: "Mockie",
  title: "Native Android Developer",
  location: "Selangor, MY",
  email: "rizwanmatnawi00@gmail.com",
  github: "https://github.com/RizwanATC",
  linkedin: "https://linkedin.com/in/rizwanmatnawi/",
  motto: "Diverse, Flexibility, Problem-Solver & Adaptive.",
  careerStart: 2016,
  x: "https://x.com/rizwanmatnawi",
  // Shown on the title-screen phone. Leave a handle empty to hide its button.
  socials: {
    instagram: "rizwanmatnawi", // -> instagram.com/rizwanmatnawi
    tiktok: "mockie_", // -> tiktok.com/@mockie_
    threads: "rizwanmatnawi", // Threads uses the Instagram username -> threads.net/@rizwanmatnawi
  },
};

export const inventory = [
  "Kotlin",
  "Java",
  "Flutter",
  "Jetpack",
  "Coroutines",
  "Flow",
  "Hilt",
  "Room",
  "Retrofit",
  "MVVM",
  "Next.js",
  "AR",
  "Unreal",
];

export const levels: Level[] = [
  {
    id: "start",
    tag: "START",
    title: "Press Start",
    headline: "Native Android Developer. 5+ years shipping production apps.",
    points: [
      "Kotlin, Flutter and modern Android architecture.",
      "From parking payments to a 1M+ install prayer app.",
    ],
    action: "wave",
    color: "#a855f7",
  },
  {
    id: "atx",
    tag: "LV.1",
    title: "Parking Lot",
    company: "ATX Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Feb 2016 – Feb 2018",
    headline: "Led Park & Pay and MY PAY STATION.",
    points: [
      "Built the Park & Pay Android app: layout, flow and RESTful APIs.",
      "Redesigned MY PAY STATION and aligned its backend with new updates.",
    ],
    stack: ["Java", "XML", "REST"],
    action: "walk",
    color: "#22d3ee",
  },
  {
    id: "stream",
    tag: "LV.2",
    title: "Stream Room",
    company: "Meta (Facebook)",
    role: "Content Creator",
    period: "Mar 2018 – Dec 2021",
    headline: "Daily gaming streams for a global audience.",
    points: [
      "Grew and engaged a 105K follower community.",
      "Edited and published video across platforms for +10% reach.",
    ],
    stat: { value: "105K", label: "followers" },
    action: "dance",
    color: "#f43f5e",
  },
  {
    id: "duogo",
    tag: "LV.3",
    title: "Cashier Counter",
    company: "Duogo Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jan 2022 – Jul 2022",
    headline: "POS flows, discounts and receipt printing.",
    points: [
      "New cashier open/close flows for faster shifts.",
      "Printer layouts plus TAX and service-charge calculation.",
      "Discount features across desktop and mobile.",
    ],
    stack: ["Java", "XML", "iBOXCHAIN"],
    action: "typing",
    color: "#f59e0b",
  },
  {
    id: "noor",
    tag: "LV.4",
    title: "Night Drive",
    company: "Noor Luminous Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jun 2023 – Dec 2024",
    headline: "TheNoor: 1M+ installs, then into the car.",
    points: [
      "Moved TheNoor from web-based to native architecture.",
      "Migrated Java to Kotlin with coroutines and null safety.",
      "Built driver-safe automotive apps for Proton and Huawei Car.",
    ],
    stack: ["Kotlin", "Coroutines", "Android Auto"],
    stat: { value: "1M+", label: "installs" },
    action: "drive",
    color: "#eab308",
  },
  {
    id: "riverlens",
    tag: "LV.5",
    title: "Architecture Tower",
    company: "Riverlens Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jan 2025 – Present",
    headline: "Alafasy, built from scratch.",
    points: [
      "Full SDLC in Kotlin with MVVM and Jetpack.",
      "Coroutines + Flow, Retrofit, Room for offline, Hilt for DI.",
      "Tuned battery, memory and network use.",
    ],
    stack: ["Kotlin", "MVVM", "Flow", "Room", "Hilt", "Retrofit"],
    action: "jump",
    color: "#10b981",
  },
  {
    id: "bonus",
    tag: "BONUS",
    title: "Arcade",
    headline: "Side quests.",
    points: [
      "GajiMeter: live salary tracker (Flutter, Google Play)",
      "Tekata: tilt-to-play party game (Flutter)",
      "Putrajaya Mosque AR (Android, Java)",
      "KWSP Calculator and Spending Tracker (Flutter)",
      "To-Do List (Next.js)",
      "Unreal Engine training, Aug 2024",
    ],
    action: "point",
    color: "#8b5cf6",
  },
  {
    id: "continue",
    tag: "CONTINUE?",
    title: "Continue?",
    headline: "Insert coin: let's build something.",
    points: [],
    action: "bow",
    color: "#a855f7",
  },
];
