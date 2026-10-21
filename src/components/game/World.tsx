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

export const SPACING = 24;
// Desktop: shift the camera focus left so each stage sits on the right, clear of the text panel.
const FOCUS_OFFSET = 1.5;
// Where Mock floats relative to the stage origin.
const GHOST_OFFSET = -2;

const tmpColor = new THREE.Color();

function Rig() {
  const ghost = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const focus = useRef(new THREE.Vector3());

  useFrame(({ camera, pointer, size }, dt) => {
    const { progress, level } = useGame.getState();
    // Phones: panels sit at the bottom, so centre on Mock and look lower to lift the scene up.
    const narrow = size.width < 640;
    const stageX = progress * (levels.length - 1) * SPACING;
    const targetX = narrow ? stageX + GHOST_OFFSET + 1 : stageX - FOCUS_OFFSET;
    const k = 1 - Math.exp(-dt * 4);

    focus.current.x = THREE.MathUtils.lerp(focus.current.x, targetX, k);
    focus.current.y = narrow ? 0.2 : 2;

    // slight parallax from the pointer
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, focus.current.x + pointer.x * 0.8, k);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.2 + pointer.y * 0.4, k);
    camera.position.z = narrow ? 14 : 11;
    camera.lookAt(focus.current);

    if (ghost.current) {
      ghost.current.position.x = focus.current.x - targetX + stageX + GHOST_OFFSET;
      // face the direction of travel while moving, the camera when settled
      const moving = Math.abs(targetX - focus.current.x) > 0.3;
      if (moving !== useGame.getState().moving) useGame.setState({ moving });
      const face = moving ? Math.sign(targetX - focus.current.x) * 0.9 : 0.25;
      ghost.current.rotation.y = THREE.MathUtils.lerp(ghost.current.rotation.y, face, k);
    }
    if (light.current) {
      light.current.position.x = focus.current.x - targetX + stageX;
      light.current.color.lerp(tmpColor.set(levels[level].color), k);
    }
  });

  const action = useGame((s) => levels[s.level].action);
  const heroId = useGame((s) => s.hero);
  const hero = heroes.find((h) => h.id === heroId) ?? heroes[0];

  return (
    <>
      <pointLight ref={light} position={[0, 4, 3]} intensity={40} distance={18} />
      <group ref={ghost} position={[0, 0, 2.5]}>
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
        <Village spacing={SPACING} />
      </Suspense>

      {levels.map((lvl, i) => {
        const Stage = stages[lvl.id];
        return (
          <group key={lvl.id} position={[i * SPACING, 0, 0]}>
            <Stage color={lvl.color} />
            <Suspense fallback={null}>
              {apps
                .filter((a) => a.level === lvl.id)
                .map((a) => (
                  <PhoneFan key={a.id} app={a} />
                ))}
            </Suspense>
          </group>
        );
      })}

      <Adventurers spacing={SPACING} />
      <Coins spacing={SPACING} />

      <Rig />

      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} />
        <Vignette darkness={0.45} offset={0.3} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
