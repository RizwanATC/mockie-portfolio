// Builds the KayKit models for the 3D world from Kay Lousberg's free packs (CC0, www.kaylousberg.com):
// "Adventurers 2.0", "Forest Nature Pack 1.0" and "Medieval Hexagon Pack 1.0".
// Writes to public/models/kaykit/:
//   <character>.glb  NPCs (mesh + Rig_Medium skeleton, no animations)
//   anims.glb        the Rig_Medium clips the NPCs use, on a bare skeleton (shared by every NPC)
//   props.glb        hand-held props for the NPCs, one named root node each
//   hero-<id>.glb    playable heroes: character + props in hand + clips named for Character.tsx
//   world.glb        terrain tiles, buildings, nature and decoration, one named root node each
// and hero portraits to public/kaykit/portraits/<id>.webp.
//
// Usage (point it at the folder holding the unzipped packs):
//   node scripts/import-kaykit.mjs images
import { mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, resample, quantize, meshopt, mergeDocuments, unpartition } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";

const OUT = "public/models/kaykit";
const PORTRAITS = "public/kaykit/portraits";
const CHARACTERS = ["Knight", "Barbarian", "Mage", "Rogue", "Rogue_Hooded"];
const CLIPS = ["Idle_A", "Idle_B", "Interact", "Use_Item", "Spawn_Ground", "Jump_Full_Short", "Walking_A", "Running_A"];
const PROPS = [
  "sword_1handed",
  "shield_badge_color",
  "mug_full",
  "spellbook_open",
  "staff",
  "bow_withString",
  "dagger",
  "crossbow_1handed",
  "axe_2handed",
];

// Heroes the visitor can pick. Keep the ids in sync with `heroes` in src/data/resume.ts.
const HEROES = {
  archer: { character: "Ranger", left: "bow_withString", sample: "ranger", top: 0.2 },
  knight: { character: "Knight", right: "sword_1handed", left: "shield_badge_color", sample: "knight", top: 0.21, x: 0.415 },
  barbarian: { character: "Barbarian", right: "axe_2handed", sample: "barbarian", top: 0.22 },
  mage: { character: "Mage", right: "staff", sample: "mage", top: 0.17 },
  rogue: { character: "Rogue", right: "crossbow_1handed", sample: "rogue", top: 0.25, x: 0.42 },
};
// Clip names follow the aliases in src/components/game/Character.tsx.
const HERO_CLIPS = {
  Intro: "Spawn_Ground",
  Idle: "Idle_A",
  Walking: "Walking_A",
  Waving: "Interact",
  Typing: "Use_Item",
  Jump: "Jump_Full_Short",
  Pointing: "Throw",
  Bow: "PickUp",
};

const HEX = [
  "tiles/base/hex_grass",
  "tiles/base/hex_water",
  "tiles/roads/hex_road_A",
  "buildings/blue/building_home_A_blue",
  "buildings/red/building_home_B_red",
  "buildings/yellow/building_home_A_yellow",
  "buildings/red/building_tavern_red",
  "buildings/blue/building_market_blue",
  "buildings/yellow/building_blacksmith_yellow",
  "buildings/blue/building_windmill_blue",
  "buildings/red/building_church_red",
  "buildings/blue/building_well_blue",
  "buildings/blue/building_castle_blue",
  "buildings/yellow/building_tower_A_yellow",
  "buildings/green/building_archeryrange_green",
  "buildings/green/building_lumbermill_green",
  "buildings/neutral/building_scaffolding",
  "buildings/neutral/fence_wood_straight",
  "decoration/nature/mountain_A_grass_trees",
  "decoration/nature/mountain_B_grass_trees",
  "decoration/nature/mountain_C_grass_trees",
  "decoration/nature/hills_A_trees",
  "decoration/nature/hills_B_trees",
  "decoration/nature/hills_C_trees",
  "decoration/nature/cloud_big",
  "decoration/nature/cloud_small",
  "decoration/props/target",
  "decoration/props/bucket_arrows",
  "decoration/props/weaponrack",
  "decoration/props/crate_A_big",
  "decoration/props/crate_B_big",
  "decoration/props/barrel",
  "decoration/props/sack",
  "decoration/props/tent",
  "decoration/props/flag_blue",
  "decoration/props/flag_red",
  "decoration/props/flag_yellow",
  "decoration/props/flag_green",
  "decoration/props/ladder",
  "decoration/props/resource_lumber",
  "decoration/props/wheelbarrow",
];
const FOREST = [
  "Tree_1_A",
  "Tree_1_B",
  "Tree_2_A",
  "Tree_2_C",
  "Tree_3_A",
  "Tree_4_A",
  "Tree_4_B",
  "Tree_Bare_1_A",
  "Rock_1_A",
  "Rock_1_J",
  "Rock_2_A",
  "Rock_3_A",
  "Bush_1_A",
  "Bush_2_A",
  "Bush_4_A",
  "Grass_1_A",
  "Grass_2_A",
];

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/import-kaykit.mjs <folder with the unzipped KayKit packs>");
  process.exit(1);
}
// find a pack by its folder name, e.g. "KayKit_Adventurers_2.0_FREE"
const find = (prefix) => {
  const hit = readdirSync(dir).find((d) => d.startsWith(prefix) && statSync(path.join(dir, d)).isDirectory());
  if (!hit) throw new Error(`No ${prefix}* folder in ${dir}`);
  return path.join(dir, hit);
};
const adventurers = find("KayKit_Adventurers");
const forest = find("KayKit_Forest_Nature_Pack");
const hexagon = find("KayKit_Medieval_Hexagon_Pack");

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

const optimize = (doc) =>
  doc.transform(
    dedup(),
    prune(),
    // KayKit textures are small palette atlases: keep them lossless PNG, lossy WebP smears the colour swatches
    quantize(),
    meshopt({ encoder: MeshoptEncoder })
  );

async function write(name, doc) {
  const file = path.join(OUT, name);
  await io.write(file, doc);
  console.log(`${file}  ${(statSync(file).size / 1024).toFixed(0)} KB`);
}

// Copy a clip from another Rig_Medium file onto doc's skeleton, matching bones by name.
function copyAnimation(doc, src, name) {
  const root = doc.getRoot();
  const nodes = new Map(root.listNodes().map((n) => [n.getName(), n]));
  const anim = doc.createAnimation(name);
  for (const ch of src.listChannels()) {
    const target = nodes.get(ch.getTargetNode()?.getName());
    const s = ch.getSampler();
    if (!target || !s) continue;
    const copy = (acc) =>
      doc.createAccessor().setType(acc.getType()).setArray(acc.getArray().slice()).setBuffer(root.listBuffers()[0]);
    const sampler = doc
      .createAnimationSampler()
      .setInput(copy(s.getInput()))
      .setOutput(copy(s.getOutput()))
      .setInterpolation(s.getInterpolation());
    anim.addSampler(sampler).addChannel(
      doc.createAnimationChannel().setTargetNode(target).setTargetPath(ch.getTargetPath()).setSampler(sampler)
    );
  }
}

// Merge another file's scene into doc and return its root nodes (detached from any scene).
async function mergeFile(doc, file) {
  const src = await io.read(file);
  const scene = mergeDocuments(doc, src).get(src.getRoot().listScenes()[0]);
  const children = scene.listChildren();
  for (const c of children) scene.removeChild(c);
  scene.dispose();
  return children;
}

// One document holding many small files, each under a root node named after it.
async function bundle(entries, out) {
  const doc = new Document();
  doc.createBuffer();
  const scene = doc.createScene();
  for (const [name, file] of entries) {
    const holder = doc.createNode(name);
    for (const c of await mergeFile(doc, file)) holder.addChild(c);
    scene.addChild(holder);
  }
  await doc.transform(unpartition());
  await optimize(doc);
  await write(out, doc);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(PORTRAITS, { recursive: true });

// NPCs: the pack ships them unanimated, which is what we want.
for (const name of CHARACTERS) {
  const doc = await io.read(path.join(adventurers, "Characters/gltf", `${name}.glb`));
  await optimize(doc);
  await write(`${name.toLowerCase()}.glb`, doc);
}

const rig = path.join(adventurers, "Animations/gltf/Rig_Medium");
const general = await io.read(path.join(rig, "Rig_Medium_General.glb"));
const movement = await io.read(path.join(rig, "Rig_Medium_MovementBasic.glb"));
const rigClips = new Map(
  [...general.getRoot().listAnimations(), ...movement.getRoot().listAnimations()].map((a) => [a.getName(), a])
);

// NPC animations: merge the two Rig_Medium libraries onto one skeleton and drop the mannequin mesh.
{
  const doc = await io.read(path.join(rig, "Rig_Medium_General.glb"));
  const root = doc.getRoot();
  for (const a of movement.getRoot().listAnimations()) if (CLIPS.includes(a.getName())) copyAnimation(doc, a, a.getName());
  for (const a of root.listAnimations()) if (!CLIPS.includes(a.getName())) a.dispose();
  for (const n of root.listNodes()) {
    n.setMesh(null);
    n.setSkin(null);
  }
  await doc.transform(resample());
  await optimize(doc);
  await write("anims.glb", doc);
}

// Heroes: character + props on the hand slots + renamed clips.
const asset = (name) => path.join(adventurers, "Assets/gltf", `${name}.gltf`);
for (const [id, hero] of Object.entries(HEROES)) {
  const doc = await io.read(path.join(adventurers, "Characters/gltf", `${hero.character}.glb`));
  const root = doc.getRoot();
  for (const [name, clip] of Object.entries(HERO_CLIPS)) copyAnimation(doc, rigClips.get(clip), name);
  for (const [slot, prop] of [
    ["handslot.r", hero.right],
    ["handslot.l", hero.left],
  ]) {
    if (!prop) continue;
    const hand = root.listNodes().find((n) => n.getName() === slot);
    for (const c of await mergeFile(doc, asset(prop))) hand.addChild(c);
  }
  await doc.transform(unpartition(), resample());
  await optimize(doc);
  await write(`hero-${id}.glb`, doc);

  // Portrait: a square around the front-facing character's head in the pack's sample render.
  const sample = path.join(adventurers, "Samples", `${hero.sample}.png`);
  const { width, height } = await sharp(sample).metadata();
  const out = path.join(PORTRAITS, `${id}.webp`);
  const size = Math.round(width * 0.15);
  await sharp(sample)
    .extract({ left: Math.round(width * (hero.x ?? 0.41) - size / 2), top: Math.round(height * hero.top), width: size, height: size })
    .resize(160, 160)
    .webp({ quality: 85 })
    .toFile(out);
  console.log(out);
}

await bundle(
  PROPS.map((p) => [p, asset(p)]),
  "props.glb"
);

await bundle(
  [
    ...HEX.map((p) => [path.basename(p), path.join(hexagon, "Assets/gltf", `${p}.gltf`)]),
    ...FOREST.map((p) => [p, path.join(forest, "Assets/gltf", `${p}_Color1.gltf`)]),
  ],
  "world.glb"
);
