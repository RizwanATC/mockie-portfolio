"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { GhostAction } from "@/data/resume";
import { useGame } from "@/lib/store";

// The rigged hero the visitor picked (see `heroes` in src/data/resume.ts): a KayKit hero from
// scripts/import-kaykit.mjs, or /models/mock.glb built by scripts/import-character.mjs from a Meshy or Mixamo export.
// Clips are matched by name, so Meshy's "Walking"/"Idle" and Mixamo file names both work:
// - walk:  plays while the camera travels between levels (and on the "walk" level)
// - intro: plays once on load and when the character is clicked
// - other GhostActions ("wave", "dance", ...) play on their level when a matching clip exists
// Anything without a clip falls back to idle plus a light procedural motion.

const FADE = 0.35;

const aliases: Record<GhostAction | "intro", RegExp> = {
  intro: /^mixamo\.com$|stand.?up|intro|greet/i,
  idle: /idle|breath/i,
  walk: /walk/i,
  wave: /wav/i,
  dance: /danc/i,
  typing: /typ/i,
  drive: /driv/i,
  jump: /jump/i,
  point: /point/i,
  bow: /bow/i,
};

export default function Character({ action, url }: { action: GhostAction; url: string }) {
  const root = useRef<THREE.Group>(null);
  const motion = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const moving = useGame((s) => s.moving);

  const mixer = useRef<THREE.AnimationMixer>(null);
  const current = useRef<THREE.AnimationAction | null>(null);
  const introPlaying = useRef(false);
  const actionRef = useRef(action);

  const clipFor = (key: GhostAction | "intro") => animations.find((c) => aliases[key].test(c.name));
  // Looping clip for the state; with no idle clip, hold the intro's final (standing) frame instead.
  const loopFor = (a: GhostAction, isMoving: boolean): [THREE.AnimationClip | undefined, "loop" | "hold"] => {
    const loop = (isMoving && clipFor("walk")) || clipFor(a) || clipFor("idle");
    return loop ? [loop, "loop"] : [clipFor("intro"), "hold"];
  };

  const fadeTo = ([clip, mode]: [THREE.AnimationClip | undefined, "loop" | "hold" | "once"]) => {
    const m = mixer.current;
    if (!m || !clip) return;
    const next = m.clipAction(clip);
    if (current.current === next && mode !== "once") return;
    next.reset();
    next.clampWhenFinished = mode !== "loop";
    next.setLoop(mode === "loop" ? THREE.LoopRepeat : THREE.LoopOnce, mode === "loop" ? Infinity : 1);
    if (mode === "hold") {
      next.time = clip.duration;
      next.paused = true;
    }
    next.fadeIn(current.current ? FADE : 0).play();
    if (current.current && current.current !== next) current.current.fadeOut(FADE);
    current.current = next;
  };

  const playIntro = () => {
    const intro = clipFor("intro");
    if (!intro) return false;
    introPlaying.current = true;
    fadeTo([intro, "once"]);
    return true;
  };

  // Mixer lifecycle + intro, then hand over to the looping clip for the current state.
  useEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        // skinned bounds come from the bind pose, which breaks culling while animating
        o.frustumCulled = false;
      }
    });
    const m = new THREE.AnimationMixer(scene);
    mixer.current = m;
    const onFinished = () => {
      introPlaying.current = false;
      fadeTo(loopFor(actionRef.current, useGame.getState().moving));
    };
    m.addEventListener("finished", onFinished);
    if (!playIntro()) fadeTo(loopFor(actionRef.current, useGame.getState().moving));
    return () => {
      m.removeEventListener("finished", onFinished);
      m.stopAllAction();
      m.uncacheRoot(scene);
      mixer.current = null;
      current.current = null;
    };
  }, [scene, animations]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    actionRef.current = action;
    if (!introPlaying.current) fadeTo(loopFor(action, moving));
  }, [action, moving]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }, dt) => {
    mixer.current?.update(dt);
    if (!motion.current) return;

    // Procedural flavour only where the model has no clip for this level.
    const t = clock.elapsedTime;
    let y = 0;
    let spin = 0;
    let lean = 0;
    if (!moving && !introPlaying.current && !clipFor(action)) {
      if (action === "dance") {
        y = Math.abs(Math.sin(t * 5)) * 0.12;
        spin = Math.sin(t * 2.5) * 0.6;
      } else if (action === "jump") {
        y = Math.abs(Math.sin(t * 3)) * 0.3;
      } else if (action === "bow") {
        lean = 0.3;
      }
    }
    const k = 1 - Math.exp(-dt * 8);
    motion.current.position.y = THREE.MathUtils.lerp(motion.current.position.y, y, k);
    motion.current.rotation.y = THREE.MathUtils.lerp(motion.current.rotation.y, spin, k);
    motion.current.rotation.x = THREE.MathUtils.lerp(motion.current.rotation.x, lean, k);
  });

  return (
    <group ref={motion}>
      <group
        ref={root}
        onClick={(e) => {
          e.stopPropagation();
          playIntro();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <primitive object={scene} />
      </group>
    </group>
  );
}

