// Builds the KayKit adventurer NPCs from the free "KayKit Adventurers 2.0" pack (CC0, Kay Lousberg).
// Writes to public/models/kaykit/:
//   <character>.glb  one per adventurer (mesh + Rig_Medium skeleton, no animations)
//   anims.glb        the Rig_Medium clips we use, on a bare skeleton (shared by every character)
//   props.glb        the hand-held props, one named root node each
//
// Usage (point it at the unzipped pack folder):
//   node scripts/import-kaykit.mjs images/KayKit_Adventurers_2.0_FREE
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, resample, quantize, meshopt, textureCompress, mergeDocuments, unpartition } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";

const OUT = "public/models/kaykit";
const CHARACTERS = ["Knight", "Barbarian", "Mage", "Ranger", "Rogue", "Rogue_Hooded"];
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

const pack = process.argv[2];
if (!pack) {
  console.error("Usage: node scripts/import-kaykit.mjs <KayKit_Adventurers_2.0_FREE folder>");
  process.exit(1);
}

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

const optimize = (doc) =>
  doc.transform(
    dedup(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: "webp" }),
    quantize(),
    meshopt({ encoder: MeshoptEncoder })
  );

async function write(name, doc) {
  const file = path.join(OUT, name);
  await io.write(file, doc);
  console.log(`${file}  ${(statSync(file).size / 1024).toFixed(0)} KB`);
}

mkdirSync(OUT, { recursive: true });

// Characters: the pack ships them unanimated, which is what we want.
for (const name of CHARACTERS) {
  const doc = await io.read(path.join(pack, "Characters/gltf", `${name}.glb`));
  await optimize(doc);
  await write(`${name.toLowerCase()}.glb`, doc);
}

// Animations: merge the two Rig_Medium libraries onto one skeleton and drop the mannequin mesh.
{
  const rig = path.join(pack, "Animations/gltf/Rig_Medium");
  const doc = await io.read(path.join(rig, "Rig_Medium_General.glb"));
  const root = doc.getRoot();
  const nodes = new Map(root.listNodes().map((n) => [n.getName(), n]));
  const src = await io.read(path.join(rig, "Rig_Medium_MovementBasic.glb"));
  for (const a of src.getRoot().listAnimations()) {
    if (!CLIPS.includes(a.getName())) continue;
    const anim = doc.createAnimation(a.getName());
    for (const ch of a.listChannels()) {
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
  for (const a of root.listAnimations()) if (!CLIPS.includes(a.getName())) a.dispose();
  for (const n of root.listNodes()) {
    n.setMesh(null);
    n.setSkin(null);
  }
  await doc.transform(resample());
  await optimize(doc);
  await write("anims.glb", doc);
  for (const a of root.listAnimations()) console.log(`  clip: ${a.getName()}`);
}

// Props: one document, one named root node per prop, in a single scene.
{
  const doc = await io.read(path.join(pack, "Assets/gltf", `${PROPS[0]}.gltf`));
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  const wrap = (children, name) => {
    const holder = doc.createNode(name);
    for (const c of children) {
      scene.removeChild(c);
      holder.addChild(c);
    }
    scene.addChild(holder);
  };
  wrap(scene.listChildren(), PROPS[0]);
  for (const name of PROPS.slice(1)) {
    const src = await io.read(path.join(pack, "Assets/gltf", `${name}.gltf`));
    const map = mergeDocuments(doc, src);
    const merged = map.get(src.getRoot().listScenes()[0]);
    wrap(merged.listChildren(), name);
    merged.dispose();
  }
  await doc.transform(unpartition());
  await optimize(doc);
  await write("props.glb", doc);
}
