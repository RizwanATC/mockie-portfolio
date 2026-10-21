"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { levels } from "@/data/resume";
import { useGame } from "@/lib/store";

// KayKit Adventurers (CC0, Kay Lousberg, www.kaylousberg.com): one NPC per level who greets Mock on arrival,
// plus the whole party at the Continue screen. Built by scripts/import-kaykit.mjs into /models/kaykit/.
// Every character shares the Rig_Medium skeleton, so one animation file drives them all.

const DIR = "/models/kaykit";
const ANIMS = `${DIR}/anims.glb`;
const PROPS = `${DIR}/props.glb`;
const FADE = 0.3;
// KayKit's Rig_Medium stands about twice Mock's height
const SCALE = 0.75;

type Who = "knight" | "barbarian" | "mage" | "ranger" | "rogue" | "rogue_hooded";
type Clip = "Idle_A" | "Idle_B" | "Interact" | "Use_Item" | "Spawn_Ground" | "Jump_Full_Short" | "Walking_A" | "Running_A";

type Npc = {
  who: Who;
  right?: string; // prop in the right hand (a root node name in props.glb)
  left?: string;
  position: [number, number, number]; // relative to the stage origin
  rotationY?: number;
  idle: Clip;
  greet: Clip; // once, when Mock arrives at this level
};

export const party: Record<string, Npc[]> = {
  start: [{ who: "knight", right: "sword_1handed", left: "shield_badge_color", position: [1.4, 0, 1.6], rotationY: -0.5, idle: "Idle_A", greet: "Spawn_Ground" }],
  atx: [{ who: "ranger", left: "bow_withString", position: [1, 0, 0.6], rotationY: -0.5, idle: "Idle_B", greet: "Interact" }],
  stream: [{ who: "barbarian", right: "mug_full", position: [1.2, 0, 1], rotationY: -0.5, idle: "Idle_B", greet: "Use_Item" }],
  duogo: [{ who: "mage", left: "spellbook_open", position: [1.6, 0, 0.6], rotationY: -0.5, idle: "Idle_A", greet: "Interact" }],
  noor: [{ who: "rogue_hooded", right: "dagger", position: [0, 0, 0.6], rotationY: -0.4, idle: "Idle_B", greet: "Jump_Full_Short" }],
  riverlens: [{ who: "rogue", right: "crossbow_1handed", position: [-0.2, 0, 0.4], rotationY: -0.4, idle: "Idle_A", greet: "Use_Item" }],
  bonus: [{ who: "mage", right: "staff", position: [0.3, 0, 2.4], rotationY: -0.5, idle: "Idle_B", greet: "Use_Item" }],
  continue: [
    { who: "knight", right: "sword_1handed", left: "shield_badge_color", position: [-1.8, 0, -0.6], rotationY: 0.2, idle: "Idle_A", greet: "Jump_Full_Short" },
    { who: "barbarian", right: "axe_2handed", position: [1.1, 0, -1.2], rotationY: 0, idle: "Idle_B", greet: "Use_Item" },
    { who: "mage", right: "staff", position: [2.4, 0, -1.4], rotationY: -0.1, idle: "Idle_A", greet: "Jump_Full_Short" },
    { who: "ranger", left: "bow_withString", position: [3.7, 0, -1.2], rotationY: -0.2, idle: "Idle_B", greet: "Interact" },
    { who: "rogue_hooded", right: "dagger", position: [5, 0, -0.6], rotationY: -0.4, idle: "Idle_A", greet: "Jump_Full_Short" },
  ],
};

function Adventurer({ npc, level }: { npc: Npc; level: number }) {
  const { scene } = useGLTF(`${DIR}/${npc.who}.glb`);
  const { animations } = useGLTF(ANIMS);
  const props = useGLTF(PROPS);
  const mixer = useRef<THREE.AnimationMixer>(null);
  const current = useRef<THREE.AnimationAction | null>(null);
  const group = useRef<THREE.Group>(null);

  // Skinned meshes need SkeletonUtils to clone, so the same character can appear twice.
  const model = useMemo(() => {
    const m = cloneSkinned(scene);
    m.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.frustumCulled = false;
      }
    });
    // GLTFLoader strips the dots from "handslot.r"
    for (const [hand, prop] of [
      ["handslotr", npc.right],
      ["handslotl", npc.left],
    ] as const) {
      const src = prop && props.scene.getObjectByName(prop);
      if (!src) continue;
      const p = src.clone();
      p.traverse((o) => (o.castShadow = true));
      m.getObjectByName(hand)?.add(p);
    }
    return m;
  }, [scene, props.scene, npc.right, npc.left]);

  const play = (name: Clip, once = false) => {
    const m = mixer.current;
    const clip = animations.find((c) => c.name === name);
    if (!m || !clip) return;
    const next = m.clipAction(clip);
    if (!once && current.current === next) return;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
    next.clampWhenFinished = once;
    next.fadeIn(current.current ? FADE : 0).play();
    if (current.current && current.current !== next) current.current.fadeOut(FADE);
    current.current = next;
  };

  useEffect(() => {
    const m = new THREE.AnimationMixer(model);
    mixer.current = m;
    const onFinished = () => play(npc.idle);
    m.addEventListener("finished", onFinished);
    play(npc.idle);
    // stagger idles so a group doesn't move in lockstep
    m.update(Math.random() * 2);
    return () => {
      m.removeEventListener("finished", onFinished);
      m.stopAllAction();
      m.uncacheRoot(model);
      mixer.current = null;
      current.current = null;
    };
  }, [model, animations]); // eslint-disable-line react-hooks/exhaustive-deps

  // Greet when the camera settles on this level.
  const here = useGame((s) => s.level === level && !s.moving);
  useEffect(() => {
    if (here) play(npc.greet, true);
  }, [here]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const { level: current } = useGame.getState();
    // only animate the levels around the camera; the rest are hidden by the fog anyway
    const near = Math.abs(current - level) <= 1;
    if (group.current) group.current.visible = near;
    if (near) mixer.current?.update(dt);
  });

  return (
    <group ref={group} position={npc.position} rotation={[0, npc.rotationY ?? 0, 0]} scale={SCALE}>
      <primitive
        object={model}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          play("Jump_Full_Short", true);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      />
    </group>
  );
}

export default function Adventurers({ spacing }: { spacing: number }) {
  return (
    <>
      {levels.map((lvl, i) => (
        <group key={lvl.id} position={[i * spacing, 0, 0]}>
          {(party[lvl.id] ?? []).map((npc, j) => (
            <Suspense key={j} fallback={null}>
              <Adventurer npc={npc} level={i} />
            </Suspense>
          ))}
        </group>
      ))}
    </>
  );
}

useGLTF.preload(ANIMS);
useGLTF.preload(PROPS);
