"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { levels } from "@/data/resume";

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
const ROAD_Z = 2.1; // puts the road strip under the hero (z 2.5)
const X_MIN = -64;
const X_MAX = 236;

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
    l.position.set(camera.position.x - 8, 16, 8);
    l.target.position.set(camera.position.x, 0, -2);
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

export default function Village({ spacing }: { spacing: number }) {
  const layout = useMemo(() => {
    const r = rng(11);
    const add = (map: Map<string, Item[]>, name: string, item: Item) => map.set(name, [...(map.get(name) ?? []), item]);
    const pieces = new Map<string, Item[]>();
    const stageXs = levels.map((_, i) => i * spacing);
    const nearStage = (x: number, d: number) => stageXs.some((s) => Math.abs(x - s) < d);
    const castleX = stageXs[stageXs.length - 1];

    // terrain rows, front (+z) to back
    for (let row = -1; row <= 8; row++) {
      const z = ROAD_Z - row * ROW;
      const offset = row % 2 ? TILE_W / 2 : 0;
      for (let x = X_MIN + offset; x < X_MAX; x += TILE_W) {
        const tile = row === 0 ? "hex_road_A" : row === 4 ? "hex_water" : "hex_grass";
        add(pieces, tile, { p: [x, 0, z] });

        if (row === 1 && !nearStage(x, 8)) {
          // between stages: a tree or two and some undergrowth
          add(pieces, TREES[Math.floor(r() * TREES.length)], { p: [x + (r() - 0.5) * 3, 0, z - 1 + r() * 2], r: r() * 6, s: 0.9 + r() * 0.5 });
          for (let k = 0; k < 3; k++)
            add(pieces, SMALL[Math.floor(r() * SMALL.length)], { p: [x + (r() - 0.5) * 6, 0, z + (r() - 0.5) * 4], r: r() * 6, s: 2 + r() * 1.5 });
        } else if (row === 1) {
          // grass tufts at the edge of each stage
          add(pieces, SMALL[3 + Math.floor(r() * 2)], { p: [x + (r() - 0.5) * 6, 0, z - 2 - r() * 2], r: r() * 6, s: 2.2 });
        } else if (row === 2) {
          // the village street: a building on most tiles, the castle behind the final stage
          if (Math.abs(x - castleX) < TILE_W / 2) add(pieces, "building_castle_blue", { p: [x, 0, z], s: HEX * 1.2 });
          else if (r() < 0.8) add(pieces, BUILDINGS[Math.floor(r() * BUILDINGS.length)], { p: [x, 0, z], r: (r() - 0.5) * 0.6 });
          else add(pieces, TREES[Math.floor(r() * TREES.length)], { p: [x, 0, z], r: r() * 6, s: 1.2 });
        } else if (row === 3) {
          for (let k = 0; k < 3; k++)
            add(pieces, TREES[Math.floor(r() * TREES.length)], { p: [x + (r() - 0.5) * 6, 0, z + (r() - 0.5) * 5], r: r() * 6, s: 1 + r() * 0.6 });
        } else if (row === 5 || row === 6) {
          if (r() < 0.7) add(pieces, HILLS[Math.floor(r() * HILLS.length)], { p: [x, 0, z], r: Math.floor(r() * 6) * (Math.PI / 3) });
        } else if (row >= 7) {
          add(pieces, MOUNTAINS[Math.floor(r() * MOUNTAINS.length)], { p: [x, 0, z], r: Math.floor(r() * 6) * (Math.PI / 3), s: HEX * (1.1 + r() * 0.6) });
        }
      }
    }

    // stage props
    levels.forEach((lvl, i) => {
      for (const [name, it] of STAGE_PROPS[lvl.id] ?? []) add(pieces, name, { ...it, p: [it.p[0] + i * spacing, it.p[1], it.p[2]] });
    });

    const clouds: (Item & { name: string })[] = [];
    for (let x = -90; x < 90; x += 14 + r() * 10) {
      clouds.push({ name: r() < 0.5 ? "cloud_big" : "cloud_small", p: [x, 16 + r() * 8, -30 - r() * 30], r: r() * 6, s: HEX * (1 + r()) });
    }
    return { pieces: [...pieces.entries()], clouds };
  }, [spacing]);

  const mid = (X_MIN + X_MAX) / 2;

  return (
    <group>
      <Sky />
      <Sun />
      <hemisphereLight args={["#d6ecff", "#7da64e", 1.1]} />

      {/* ground beyond the tiles, under the fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, -0.6, -60]} receiveShadow>
        <planeGeometry args={[X_MAX - X_MIN + 200, 200]} />
        <meshStandardMaterial color="#9cc95a" roughness={1} />
      </mesh>

      {layout.pieces.map(([name, items]) => (
        <Scatter key={name} name={name} items={items} cast={!name.startsWith("hex_")} />
      ))}
      <Clouds items={layout.clouds} />
    </group>
  );
}

useGLTF.preload(WORLD);
