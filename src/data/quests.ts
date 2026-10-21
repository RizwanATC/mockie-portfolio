// Game layer on top of the résumé: the KayKit NPCs on each level, coins to find, and achievements.
// Positions are relative to each level's stage origin (see SPACING in World.tsx).

export type NpcClass = "knight" | "barbarian" | "mage" | "rogue" | "rogue_hooded";
export type NpcClip = "Idle_A" | "Idle_B" | "Interact" | "Use_Item" | "Spawn_Ground" | "Jump_Full_Short" | "Walking_A" | "Running_A";

export type Npc = {
  id: string;
  who: NpcClass;
  name: string;
  line: string; // speech bubble on arrival and when clicked
  right?: string; // prop in the right hand (a root node name in props.glb)
  left?: string;
  position: [number, number, number];
  rotationY?: number;
  idle: NpcClip;
  greet: NpcClip; // once, when the hero arrives at this level
};

export const party: Record<string, Npc[]> = {
  start: [
    {
      id: "gatekeeper",
      who: "knight",
      name: "Sir Gatekeeper",
      line: "Welcome, traveller! Pick a hero, then scroll to begin the quest.",
      right: "sword_1handed",
      left: "shield_badge_color",
      position: [1.4, 0, 1.6],
      rotationY: -0.5,
      idle: "Idle_A",
      greet: "Spawn_Ground",
    },
  ],
  atx: [
    {
      id: "warden",
      who: "rogue_hooded",
      name: "Parking Warden",
      line: "Park & Pay? Mockie built that app. No coin, no parking!",
      right: "dagger",
      position: [1, 0, 0.6],
      rotationY: -0.5,
      idle: "Idle_B",
      greet: "Interact",
    },
  ],
  stream: [
    {
      id: "fan",
      who: "barbarian",
      name: "Loyal Viewer",
      line: "105K followers and I was the first. Cheers to the streams!",
      right: "mug_full",
      position: [1.2, 0, 1],
      rotationY: -0.5,
      idle: "Idle_B",
      greet: "Use_Item",
    },
  ],
  duogo: [
    {
      id: "merchant",
      who: "mage",
      name: "Merchant Mage",
      line: "My receipts print themselves now, tax and service charge included.",
      left: "spellbook_open",
      position: [1.6, 0, 0.6],
      rotationY: -0.5,
      idle: "Idle_A",
      greet: "Interact",
    },
  ],
  noor: [
    {
      id: "nightguard",
      who: "knight",
      name: "Night Guard",
      line: "A million installs and still driver-safe. Ride on.",
      right: "sword_1handed",
      left: "shield_badge_color",
      position: [0, 0, 0.6],
      rotationY: -0.4,
      idle: "Idle_B",
      greet: "Jump_Full_Short",
    },
  ],
  riverlens: [
    {
      id: "architect",
      who: "rogue",
      name: "Tower Architect",
      line: "View, ViewModel, Repository. Every floor stands on the one below.",
      right: "crossbow_1handed",
      position: [-0.2, 0, 0.4],
      rotationY: -0.4,
      idle: "Idle_A",
      greet: "Use_Item",
    },
  ],
  bonus: [
    {
      id: "arcade",
      who: "mage",
      name: "Arcade Keeper",
      line: "Side quests give the best loot. Try every cabinet!",
      right: "staff",
      position: [0.3, 0, 2.4],
      rotationY: -0.5,
      idle: "Idle_B",
      greet: "Use_Item",
    },
  ],
  continue: [
    { id: "p-knight", who: "knight", name: "Knight", line: "Hire this hero!", right: "sword_1handed", left: "shield_badge_color", position: [-1.8, 0, -0.6], rotationY: 0.2, idle: "Idle_A", greet: "Jump_Full_Short" },
    { id: "p-barbarian", who: "barbarian", name: "Barbarian", line: "Ship it!", right: "axe_2handed", position: [1.1, 0, -1.2], rotationY: 0, idle: "Idle_B", greet: "Use_Item" },
    { id: "p-mage", who: "mage", name: "Mage", line: "Kotlin is my favourite spell.", right: "staff", position: [2.4, 0, -1.4], rotationY: -0.1, idle: "Idle_A", greet: "Jump_Full_Short" },
    { id: "p-rogue", who: "rogue", name: "Rogue", line: "Send an email. Quietly.", right: "crossbow_1handed", position: [3.7, 0, -1.2], rotationY: -0.2, idle: "Idle_B", greet: "Interact" },
    { id: "p-hooded", who: "rogue_hooded", name: "Hooded Rogue", line: "The résumé is in the chest. I mean, the button.", right: "dagger", position: [5, 0, -0.6], rotationY: -0.4, idle: "Idle_A", greet: "Jump_Full_Short" },
  ],
};

export const npcCount = Object.values(party).flat().length;

// Coins float around each stage; click to collect.
export const coins: Record<string, [number, number, number][]> = {
  start: [
    [-0.4, 1.6, 1.2],
    [5.2, 0.9, 0.6],
  ],
  atx: [
    [3, 3, -1.5],
    [-0.6, 1.4, 1],
  ],
  stream: [
    [0, 4, -2],
    [3.4, 1, 1],
  ],
  duogo: [
    [-0.8, 3, -1.6],
    [3.4, 1.2, 0.4],
  ],
  noor: [
    [1.8, 2.2, -0.5],
    [4, 5.5, -8],
  ],
  riverlens: [
    [1.2, 6, -1.5],
    [-0.8, 1.2, 1.2],
  ],
  bonus: [
    [-3.3, 3.6, -2.2],
    [4.4, 1, 1.4],
  ],
  continue: [
    [0, 2.6, -1],
    [6.4, 1.2, 0.4],
  ],
};

export const coinIds = Object.entries(coins).flatMap(([level, list]) => list.map((_, i) => `${level}-${i}`));

export type Progress = { coins: string[]; met: string[]; visited: number[]; heroesTried: string[]; achievements: string[] };

export const achievements: { id: string; icon: string; title: string; body: string; done: (p: Progress, levels: number) => boolean }[] = [
  { id: "first-steps", icon: "🥾", title: "First Steps", body: "Leave the village for LV.1.", done: (p) => p.visited.includes(1) },
  { id: "first-coin", icon: "🪙", title: "Shiny!", body: "Pick up your first coin.", done: (p) => p.coins.length > 0 },
  { id: "chatty", icon: "💬", title: "Small Talk", body: "Talk to an adventurer.", done: (p) => p.met.length > 0 },
  { id: "explorer", icon: "🗺️", title: "Explorer", body: "Visit every level.", done: (p, levels) => p.visited.length >= levels },
  { id: "treasure", icon: "💰", title: "Treasure Hunter", body: `Collect all ${coinIds.length} coins.`, done: (p) => coinIds.every((c) => p.coins.includes(c)) },
  { id: "social", icon: "🤝", title: "Party Animal", body: `Talk to all ${npcCount} adventurers.`, done: (p) => p.met.length >= npcCount },
  { id: "shapeshifter", icon: "🎭", title: "Shapeshifter", body: "Play as 3 different heroes.", done: (p) => p.heroesTried.length >= 3 },
  {
    id: "legend",
    icon: "👑",
    title: "Legend",
    body: "Unlock every other achievement.",
    done: (p) => achievements.every((a) => a.id === "legend" || p.achievements.includes(a.id)),
  },
];
