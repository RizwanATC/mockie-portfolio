"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { apps, heroes, levels } from "@/data/resume";
import { useGame } from "@/lib/store";
import Mock from "./Mock";
import Character from "./Character";
import PhoneFan from "./Phone";
import { stages } from "./Stages";
import Village from "./Village";
import Adventurers from "./Adventurers";
import Coins from "./Coins";
import { AtStage, frameAt, makeFrame, toWorld } from "./path";

// Desktop: shift the camera focus back along the road so each stage sits on the right, clear of the text panel.
const FOCUS_OFFSET = 1.5;
// Where the hero stands relative to the stage origin (stage-local x, along the road).
const GHOST_OFFSET = -2;
const HERO_Z = 2.5;

const tmpColor = new THREE.Color();
const tmp = { frame: makeFrame(), focus: new THREE.Vector3(), cam: new THREE.Vector3(), hero: new THREE.Vector3() };

function Rig() {
  const ghost = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const u = useRef(0); // smoothed position along the road, in levels

  useFrame(({ camera, pointer, size }, dt) => {
    const { progress, level } = useGame.getState();
    // Phones: panels sit at the bottom, so centre on the hero and look lower to lift the scene up.
    const narrow = size.width < 640;
    const target = progress * (levels.length - 1);
    const k = 1 - Math.exp(-dt * 4);
    u.current = THREE.MathUtils.lerp(u.current, target, k);

    const f = frameAt(u.current, tmp.frame);
    const focusX = narrow ? GHOST_OFFSET + 1 : -FOCUS_OFFSET;
    toWorld(f, focusX, narrow ? 0.2 : 2, 0, tmp.focus);
    // behind the road on the camera side, with a slight parallax from the pointer
    toWorld(f, focusX + pointer.x * 0.8, 3.2 + pointer.y * 0.4, narrow ? 14 : 11, tmp.cam);
    camera.position.lerp(tmp.cam, 1 - Math.exp(-dt * 10));
    camera.lookAt(tmp.focus);

    if (ghost.current) {
      ghost.current.position.copy(toWorld(f, GHOST_OFFSET, 0, HERO_Z, tmp.hero));
      // face the direction of travel while moving, the camera when settled
      const delta = target - u.current;
      const moving = Math.abs(delta) > 0.012;
      if (moving !== useGame.getState().moving) useGame.setState({ moving });
      const face = f.yaw + (moving ? Math.sign(delta) * 0.9 : 0.25);
      // turn the short way round
      const r = ghost.current.rotation;
      r.y += Math.atan2(Math.sin(face - r.y), Math.cos(face - r.y)) * k;
    }
    if (light.current) {
      light.current.position.copy(toWorld(f, 0, 4, 3, tmp.hero));
      light.current.color.lerp(tmpColor.set(levels[level].color), k);
    }
  });

  const action = useGame((s) => levels[s.level].action);
  const heroId = useGame((s) => s.hero);
  const hero = heroes.find((h) => h.id === heroId) ?? heroes[0];

  return (
    <>
      <pointLight ref={light} position={[0, 4, 3]} intensity={40} distance={18} />
      <group ref={ghost}>
        {/* the procedural ghost stands in while the hero's model loads */}
        <Suspense
          fallback={
            <group position={[0, 1.5, 0]} scale={0.8}>
              <Mock action={action} />
            </group>
          }
        >
          <group scale={hero.scale}>
            <Character key={hero.id} action={action} url={hero.url} />
          </group>
        </Suspense>
      </group>
    </>
  );
}

export default function World() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.2, 11], fov: 45 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      className="!fixed inset-0"
      aria-hidden
    >
      <color attach="background" args={["#cfe6f2"]} />
      {/* light haze that matches the daytime horizon */}
      <fog attach="fog" args={["#d9ecf3", 30, 95]} />
      <Suspense fallback={null}>
        <Village />
      </Suspense>

      {levels.map((lvl, i) => {
        const Stage = stages[lvl.id];
        return (
          <AtStage key={lvl.id} index={i}>
            <Stage color={lvl.color} />
            <Suspense fallback={null}>
              {apps
                .filter((a) => a.level === lvl.id)
                .map((a) => (
                  <PhoneFan key={a.id} app={a} />
                ))}
            </Suspense>
          </AtStage>
        );
      })}

      <Adventurers />
      <Coins />

      <Rig />

      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} />
        <Vignette darkness={0.45} offset={0.3} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
