"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { levels } from "@/data/resume";
import { frameAt, road, roadSide, stageFrames, toWorld } from "./path";

// KayKit kingdom backdrop (CC0, Kay Lousberg): hex-tile terrain with a road along the level run, a row of
// Medieval Hexagon buildings, a forest, a river and mountains, plus props on each stage.
// All pieces come from /models/kaykit/world.glb (scripts/import-kaykit.mjs), one named root node each, and are
// drawn as instanced meshes, so each piece costs one draw call however many times it appears.

const WORLD = "/models/kaykit/world.glb";
// Hex pieces are authored 2 units across; scale them so a house is about twice the hero's height.
const HEX = 4;
// The tiles are pointy-top hexes with a 1.1 circumradius on top (their base flares a little wider).
const TILE_W = Math.sqrt(3) * 1.1 * HEX;
const ROW = 1.5 * 1.1 * HEX;

// deterministic scatter so the world is the same on every load
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Item = { p: [number, number, number]; r?: number; s?: number };

const tmp = { m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), s: new THREE.Vector3(), p: new THREE.Vector3() };

// Every mesh under one named root of world.glb, drawn once per item.
function Scatter({ name, items, cast = true }: { name: string; items: Item[]; cast?: boolean }) {
  const { scene } = useGLTF(WORLD);
  const parts = useMemo(() => {
    const root = scene.getObjectByName(name);
    if (!root) return [];
    root.updateWorldMatrix(true, true);
    const inv = root.matrixWorld.clone().invert();
    const out: { geometry: THREE.BufferGeometry; material: THREE.Material; local: THREE.Matrix4 }[] = [];
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      // quantized meshes carry their dequantization in the node transform, so keep it per part
      if (mesh.isMesh) out.push({ geometry: mesh.geometry, material: mesh.material as THREE.Material, local: inv.clone().multiply(mesh.matrixWorld) });
    });
    return out;
  }, [scene, name]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);

  useLayoutEffect(() => {
    const { m, q, e, s, p } = tmp;
    parts.forEach((part, k) => {
      const inst = refs.current[k];
      if (!inst) return;
      items.forEach((it, i) => {
        m.compose(p.set(...it.p), q.setFromEuler(e.set(0, it.r ?? 0, 0)), s.setScalar(it.s ?? HEX)).multiply(part.local);
        inst.setMatrixAt(i, m);
      });
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
    });
  }, [parts, items]);

  if (!items.length) return null;
  return (
    <>
      {parts.map((part, k) => (
        <instancedMesh
          key={k}
          ref={(el) => {
            refs.current[k] = el;
          }}
          args={[part.geometry, part.material, items.length]}
          castShadow={cast}
          receiveShadow
        />
      ))}
    </>
  );
}

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 top;
  uniform vec3 mid;
  uniform vec3 horizon;
  varying vec3 vDir;
  void main() {
    float h = vDir.y;
    vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
    c = mix(c, top, smoothstep(0.18, 0.6, h));
    gl_FragColor = vec4(c, 1.0);
  }
`;

function Sky() {
  const group = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({
      top: { value: new THREE.Color("#3f8fe0") },
      mid: { value: new THREE.Color("#8fcbf2") },
      horizon: { value: new THREE.Color("#f3ecd2") },
    }),
    []
  );
  // the sky travels with the camera so it never shows its edge
  useFrame(({ camera }) => group.current?.position.set(camera.position.x, 0, camera.position.z));
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[150, 32, 16]} />
        <shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} />
      </mesh>
      <mesh position={[-50, 45, -125]}>
        <circleGeometry args={[7, 48]} />
        <meshBasicMaterial color="#fff6d8" fog={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Sun() {
  const light = useRef<THREE.DirectionalLight>(null);
  // follow the camera so shadows stay sharp wherever you are in the run
  useFrame(({ camera }) => {
    const l = light.current;
    if (!l) return;
    l.position.set(camera.position.x - 8, 16, camera.position.z - 3);
    l.target.position.set(camera.position.x, 0, camera.position.z - 13);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={light}
      color="#fff1d6"
      intensity={2.4}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={16}
      shadow-camera-bottom={-12}
      shadow-bias={-0.0005}
    />
  );
}

// Clouds drift slowly and wrap around the camera.
function Clouds({ items }: { items: (Item & { name: string })[] }) {
  const { scene } = useGLTF(WORLD);
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      items.map((it) => {
        const c = scene.getObjectByName(it.name)!.clone();
        c.position.set(...it.p);
        c.scale.setScalar(it.s ?? HEX);
        c.rotation.y = it.r ?? 0;
        return c;
      }),
    [scene, items]
  );
  useFrame(({ camera }, dt) => {
    for (const c of group.current?.children ?? []) {
      c.position.x += dt * 0.6;
      // keep each cloud within ±90 of the camera
      const d = c.position.x - camera.position.x;
      if (d > 90) c.position.x -= 180;
      else if (d < -90) c.position.x += 180;
    }
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <primitive key={i} object={c} />
      ))}
    </group>
  );
}

const BUILDINGS = [
  "building_home_A_blue",
  "building_tavern_red",
  "building_home_B_red",
  "building_market_blue",
  "building_well_blue",
  "building_blacksmith_yellow",
  "building_home_A_yellow",
  "building_windmill_blue",
  "building_church_red",
  "building_lumbermill_green",
  "building_archeryrange_green",
  "building_tower_A_yellow",
];
const TREES = ["Tree_1_A", "Tree_1_B", "Tree_2_A", "Tree_2_C", "Tree_3_A", "Tree_4_A", "Tree_4_B"];
const SMALL = ["Bush_1_A", "Bush_2_A", "Bush_4_A", "Grass_1_A", "Grass_2_A", "Rock_1_A", "Rock_1_J"];
const PLANTS = SMALL.filter((n) => !n.startsWith("Rock"));
const GRASS = SMALL.filter((n) => n.startsWith("Grass"));
const HILLS = ["hills_A_trees", "hills_B_trees", "hills_C_trees"];
const MOUNTAINS = ["mountain_A_grass_trees", "mountain_B_grass_trees", "mountain_C_grass_trees"];

// Props on each stage, by level id; positions relative to the stage origin.
const STAGE_PROPS: Record<string, [string, Item][]> = {
  start: [
    ["target", { p: [6.6, 0, -2.6], r: -0.3 }],
    ["bucket_arrows", { p: [5.6, 0, -2.2] }],
    ["weaponrack", { p: [-3.6, 0, -2.8], r: 0.2 }],
    ["flag_blue", { p: [-1.2, 0, -3.2] }],
  ],
  atx: [
    ["wheelbarrow", { p: [5.2, 0, -2.2], r: -0.6 }],
    ["crate_A_big", { p: [4.6, 0, -3.2], r: 0.3 }],
    ["crate_B_big", { p: [5.4, 0, -3.6] }],
  ],
  stream: [
    ["tent", { p: [-4.5, 0, -3.8], r: 0.4 }],
    ["flag_red", { p: [4.4, 0, -2.8] }],
    ["barrel", { p: [-2.8, 0, -1.6] }],
  ],
  duogo: [
    ["barrel", { p: [3, 0, -1.2] }],
    ["sack", { p: [3.6, 0, -1.7], r: 0.5 }],
    ["crate_B_big", { p: [-3.3, 0, -1.9], r: 0.2 }],
    ["crate_A_big", { p: [-3.6, 0, -2.8] }],
  ],
  noor: [["flag_yellow", { p: [5.8, 0, -3] }]],
  riverlens: [
    ["building_scaffolding", { p: [5.2, 0, -3.2], s: 3 }],
    ["ladder", { p: [3.6, 0, -2], r: -0.3 }],
    ["resource_lumber", { p: [-2.4, 0, -2.2], r: 0.4 }],
  ],
  bonus: [
    ["flag_yellow", { p: [5.6, 0, -2.6] }],
    ["flag_green", { p: [-5.2, 0, -2.6] }],
  ],
  continue: [
    ["flag_blue", { p: [-3.6, 0, -2.4] }],
    ["flag_red", { p: [7.4, 0, -2.4] }],
    ["barrel", { p: [6.6, 0, -1.6] }],
  ],
};

// The river crosses the road between the Cashier Counter and Night Drive; the road becomes a bridge there.
const RIVER: [number, number][] = [
  [64, 40],
  [68, 8],
  [73, -14],
  [75, -28],
  [84, -46],
  [100, -76],
  [112, -110],
];
function distToRiver(x: number, z: number) {
  let best = Infinity;
  for (let k = 0; k < RIVER.length - 1; k++) {
    const [ax, az] = RIVER[k];
    const [bx, bz] = RIVER[k + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const t = THREE.MathUtils.clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
    best = Math.min(best, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return best;
}

// Ground the camera looks across at some point of the journey: keep it clear of anything tall.
const VIEW_FRAMES = Array.from({ length: (levels.length - 1) * 4 + 1 }, (_, k) => frameAt(k / 4));
// `margin` grows the zone by the footprint of the piece being placed.
function inView(x: number, z: number, margin = 0) {
  return VIEW_FRAMES.some((f) => {
    const dx = x - f.pos.x;
    const dz = z - f.pos.z;
    const lz = dx * f.out.x + dz * f.out.z;
    const lx = dx * f.right.x + dz * f.right.z;
    // from just behind the road to well behind the camera (it sits 11-14 out), and wide enough for its view
    return lz > -1 - margin && lz < 26 + margin && Math.abs(lx) < 14 + margin;
  });
}

// The road: a flat ribbon along the curve with darker kerbs, planks where it bridges the river.
function Road() {
  const geometry = useMemo(() => {
    const N = 900;
    const pts = road.getSpacedPoints(N);
    const across = [-2, -1.6, 1.6, 2];
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    const dirt = new THREE.Color("#d8b27c");
    const kerb = new THREE.Color("#a98252");
    const plank = new THREE.Color("#8b5a2b");
    const tan = new THREE.Vector3();
    pts.forEach((p, k) => {
      road.getTangentAt(k / N, tan).setY(0).normalize();
      const bridge = distToRiver(p.x, p.z) < 5.5;
      across.forEach((a, j) => {
        pos.push(p.x - tan.z * a, 0.04, p.z + tan.x * a);
        const c = bridge ? plank : j === 0 || j === 3 ? kerb : dirt;
        col.push(c.r, c.g, c.b);
      });
      if (k === 0) return;
      for (let j = 0; j < 3; j++) {
        const a = (k - 1) * 4 + j;
        const b = k * 4 + j;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function Village() {
  const layout = useMemo(() => {
    const r = rng(11);
    const add = (map: Map<string, Item[]>, name: string, item: Item) => map.set(name, [...(map.get(name) ?? []), item]);
    const pick = <T,>(list: T[]) => list[Math.floor(r() * list.length)];
    const pieces = new Map<string, Item[]>();

    // the castle stands behind the final stage
    const last = stageFrames[stageFrames.length - 1];
    const castle = toWorld(last, 1.5, 0, -16);
    add(pieces, "building_castle_blue", { p: [castle.x, 0, castle.z], r: last.yaw, s: HEX * 1.3 });

    const box = new THREE.Box3().setFromPoints(road.getPoints(100)).expandByVector(new THREE.Vector3(70, 0, 70));
    for (let row = 0, z = box.min.z; z < box.max.z; row++, z += ROW) {
      const offset = row % 2 ? TILE_W / 2 : 0;
      for (let x = box.min.x + offset; x < box.max.x; x += TILE_W) {
        if (distToRiver(x, z) < 4.4) {
          add(pieces, "hex_water", { p: [x, 0, z] });
          continue;
        }
        add(pieces, "hex_grass", { p: [x, 0, z] });

        const { dist, side } = roadSide(x, z);
        if (dist < 5 || Math.hypot(x - castle.x, z - castle.z) < 9) continue;
        const nearStage = stageFrames.some((f) => Math.hypot(x - f.pos.x, z - f.pos.z) < 13);
        const jitter = (): [number, number, number] => [x + (r() - 0.5) * 5, 0, z + (r() - 0.5) * 4];

        if (inView(x, z) || (nearStage && side < 0)) {
          // open ground in front of the camera and around the stages: only low plants along the verge,
          // nothing near the camera itself
          // (bushes only behind the road; on the camera's side even a bush fills the frame)
          if (side > 0) {
            if (dist < 7 && r() < 0.5) add(pieces, pick(GRASS), { p: jitter(), r: r() * 6, s: 1 + r() * 0.5 });
          } else if (dist < 9 && r() < 0.6) add(pieces, pick(PLANTS), { p: jitter(), r: r() * 6, s: 2 + r() * 1.5 });
          continue;
        }
        if (side > 0) {
          // the near side of the road, mostly out of shot: light woodland
          if (r() < 0.5) add(pieces, pick(TREES), { p: jitter(), r: r() * 6, s: 0.9 + r() * 0.5 });
          continue;
        }
        const back = dist;
        if (back < 14) {
          // the village street along the far side of the road, facing it
          if (r() < 0.75) add(pieces, pick(BUILDINGS), { p: [x, 0, z], r: facingRoad(x, z) + (r() - 0.5) * 0.6 });
          else add(pieces, pick(TREES), { p: [x, 0, z], r: r() * 6, s: 1.2 });
        } else if (back < 28) {
          for (let k = 0; k < 3; k++) add(pieces, pick(TREES), { p: jitter(), r: r() * 6, s: 1 + r() * 0.6 });
        } else if (back < 42) {
          if (r() < 0.7 && !inView(x, z, 6)) add(pieces, pick(HILLS), { p: [x, 0, z], r: Math.floor(r() * 6) * (Math.PI / 3) });
        } else if (!inView(x, z, 12)) {
          add(pieces, pick(MOUNTAINS), { p: [x, 0, z], r: Math.floor(r() * 6) * (Math.PI / 3), s: HEX * (1.1 + r() * 0.6) });
        }
      }
    }

    // stage props, in each stage's frame
    levels.forEach((lvl, i) => {
      const f = stageFrames[i];
      for (const [name, it] of STAGE_PROPS[lvl.id] ?? []) {
        const w = toWorld(f, it.p[0], it.p[1], it.p[2]);
        add(pieces, name, { ...it, p: [w.x, w.y, w.z], r: (it.r ?? 0) + f.yaw });
      }
    });

    const clouds: (Item & { name: string })[] = [];
    for (let x = -90; x < 90; x += 10 + r() * 8) {
      clouds.push({ name: r() < 0.5 ? "cloud_big" : "cloud_small", p: [x, 16 + r() * 8, -60 + r() * 60], r: r() * 6, s: HEX * (1 + r()) });
    }
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    return { pieces: [...pieces.entries()], clouds, center, size };
  }, []);

  return (
    <group>
      <Sky />
      <Sun />
      <hemisphereLight args={["#d6ecff", "#7da64e", 1.1]} />

      {/* ground beyond the tiles, under the fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[layout.center.x, -0.6, layout.center.z]} receiveShadow>
        <planeGeometry args={[layout.size.x + 200, layout.size.z + 200]} />
        <meshStandardMaterial color="#9cc95a" roughness={1} />
      </mesh>

      <Road />
      {layout.pieces.map(([name, items]) => (
        <Scatter key={name} name={name} items={items} cast={!name.startsWith("hex_")} />
      ))}
      <Clouds items={layout.clouds} />
    </group>
  );
}

// Yaw that turns a building's front (+z) toward the nearest stretch of road.
const ROAD_PTS = road.getSpacedPoints(300);
function facingRoad(x: number, z: number) {
  const pts = ROAD_PTS;
  let best = pts[0];
  for (const p of pts) if ((p.x - x) ** 2 + (p.z - z) ** 2 < (best.x - x) ** 2 + (best.z - z) ** 2) best = p;
  return Math.atan2(best.x - x, best.z - z);
}

useGLTF.preload(WORLD);
