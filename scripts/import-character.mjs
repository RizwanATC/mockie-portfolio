// Builds public/models/mock.glb from one or more character exports (Meshy or Mixamo, .glb or .fbx).
// The first file supplies the mesh + skeleton; animations from every file are merged onto it.
// A file with a single animation gets that animation renamed after the file ("Walking.glb" -> "Walking").
// Walk/run clips are locked in place (hips keep their height but not their forward travel).
//
// Usage:
//   node scripts/import-character.mjs images/me.glb
//   node scripts/import-character.mjs images/me.fbx images/Walking.fbx images/Idle.fbx
import { execFileSync } from "node:child_process";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir, type as osType } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, resample, quantize, meshopt, textureCompress } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";

const OUT = "public/models/mock.glb";
const inputs = process.argv.slice(2);
if (!inputs.length) {
  console.error("Usage: node scripts/import-character.mjs <character.glb|fbx> [animation.glb|fbx ...]");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const tmp = mkdtempSync(path.join(tmpdir(), "mock-"));

function toGlb(file) {
  if (!existsSync(file)) throw new Error(`Not found: ${file}`);
  if (!/\.fbx$/i.test(file)) return file;
  const bin = path.join(
    path.dirname(require.resolve("fbx2gltf/package.json")),
    "bin",
    osType(), // "Windows_NT" | "Darwin" | "Linux", matching the package's folders
    process.platform === "win32" ? "FBX2glTF.exe" : "FBX2glTF"
  );
  const out = path.join(tmp, path.basename(file, path.extname(file)));
  // The FBX SDK unpacks embedded textures into "<name>.fbm" beside the input; remove it if we created it.
  const fbm = file.replace(/\.fbx$/i, ".fbm");
  const hadFbm = existsSync(fbm);
  process.on("exit", () => hadFbm || rmSync(fbm, { recursive: true, force: true }));
  execFileSync(bin, ["--binary", "--input", file, "--output", out], { stdio: ["ignore", "ignore", "inherit"] });
  return `${out}.glb`;
}

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

const [baseFile, ...animFiles] = inputs;
const doc = await io.read(toGlb(baseFile));
const root = doc.getRoot();
// Mixamo numbers its bone prefix per download ("mixamorig6:Hips", "mixamorig7:Hips"), so match without it.
const boneKey = (name = "") => name.replace(/^mixamorig\d*:/, "");
const nodesByName = new Map(root.listNodes().map((n) => [boneKey(n.getName()), n]));

const nameFromFile = (f) => path.basename(f, path.extname(f));
if (root.listAnimations().length === 1 && animFiles.length) root.listAnimations()[0].setName(nameFromFile(baseFile));

// Copy each extra file's animations onto the base skeleton, matching bones by name.
for (const file of animFiles) {
  const src = await io.read(toGlb(file));
  const anims = src.getRoot().listAnimations();
  for (const a of anims) {
    const anim = doc.createAnimation(anims.length === 1 ? nameFromFile(file) : a.getName());
    for (const ch of a.listChannels()) {
      const target = nodesByName.get(boneKey(ch.getTargetNode()?.getName()));
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
}

// In-place: pin the hips' horizontal position to the first frame for walk/run cycles.
for (const anim of root.listAnimations()) {
  if (!/walk|run/i.test(anim.getName())) continue;
  for (const ch of anim.listChannels()) {
    if (ch.getTargetPath() !== "translation" || !/Hips$/.test(ch.getTargetNode()?.getName() ?? "")) continue;
    const out = ch.getSampler().getOutput();
    const first = out.getElement(0, []);
    const v = [];
    for (let i = 0; i < out.getCount(); i++) {
      out.getElement(i, v);
      out.setElement(i, [first[0], v[1], first[2]]);
    }
    console.log(`in place: ${anim.getName()}`);
  }
}

await doc.transform(
  dedup(),
  resample(),
  prune(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024] }),
  quantize(),
  meshopt({ encoder: MeshoptEncoder })
);
await io.write(OUT, doc);

const kb = (await import("node:fs")).statSync(OUT).size / 1024;
console.log(`\n${OUT}  ${kb.toFixed(0)} KB`);
for (const a of root.listAnimations()) console.log(`  clip: ${a.getName()}`);
