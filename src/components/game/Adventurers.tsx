"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { levels } from "@/data/resume";
import { party, type Npc, type NpcClip } from "@/data/quests";
import { useGame } from "@/lib/store";
import { AtStage } from "./path";

// KayKit Adventurers (CC0, Kay Lousberg, www.kaylousberg.com): the NPCs from `party` in src/data/quests.ts.
// They greet the hero on arrival and talk when clicked. Built by scripts/import-kaykit.mjs into /models/kaykit/.
// Every character shares the Rig_Medium skeleton, so one animation file drives them all.

const DIR = "/models/kaykit";
const ANIMS = `${DIR}/anims.glb`;
const PROPS = `${DIR}/props.glb`;
const FADE = 0.3;
// KayKit's Rig_Medium stands about twice the Meshy hero's height
const SCALE = 0.75;

function Adventurer({ npc, level, speaks }: { npc: Npc; level: number; speaks: boolean }) {
  const { scene } = useGLTF(`${DIR}/${npc.who}.glb`);
  const { animations } = useGLTF(ANIMS);
  const props = useGLTF(PROPS);
  const mixer = useRef<THREE.AnimationMixer>(null);
  const current = useRef<THREE.AnimationAction | null>(null);
  const group = useRef<THREE.Group>(null);
  const talk = () => useGame.getState().say({ npc: npc.id, name: npc.name, line: npc.line, who: npc.who, level });

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

  const play = (name: NpcClip, once = false) => {
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

  // Greet when the camera settles on this level (including on load, for the first level).
  useEffect(() => {
    const isHere = (s: { level: number; moving: boolean }) => s.level === level && !s.moving;
    const greet = () => {
      play(npc.greet, true);
      if (speaks) talk();
    };
    const first = isHere(useGame.getState()) ? setTimeout(greet, 0) : undefined;
    const unsub = useGame.subscribe((s, prev) => {
      if (isHere(s) && !isHere(prev)) greet();
    });
    return () => {
      clearTimeout(first);
      unsub();
    };
  }, [model, animations]); // eslint-disable-line react-hooks/exhaustive-deps

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
          talk();
          useGame.getState().meet(npc.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      />
    </group>
  );
}

export default function Adventurers() {
  return (
    <>
      {levels.map((lvl, i) => (
        <AtStage key={lvl.id} index={i}>
          {(party[lvl.id] ?? []).map((npc, j) => (
            <Suspense key={npc.id} fallback={null}>
              {/* only the first NPC of a level speaks up on arrival, so a group doesn't talk over itself */}
              <Adventurer npc={npc} level={i} speaks={j === 0} />
            </Suspense>
          ))}
        </AtStage>
      ))}
    </>
  );
}

useGLTF.preload(ANIMS);
useGLTF.preload(PROPS);
