"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { levels } from "@/data/resume";
import { coinIds, coins } from "@/data/quests";
import { useGame } from "@/lib/store";

// Spinning gold coins hidden around each stage (positions in src/data/quests.ts). Click to collect.

const POP = 0.6; // seconds of the collect animation

function Coin({ id, position, level }: { id: string; position: [number, number, number]; level: number }) {
  const ref = useRef<THREE.Group>(null);
  const collectedAt = useRef<number | null>(null);
  const [gone, setGone] = useState(false);
  const saved = useGame((s) => s.coins.includes(id));
  const [popping, setPopping] = useState(false);

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    g.visible = Math.abs(useGame.getState().level - level) <= 1;
    const t = clock.elapsedTime;
    if (collectedAt.current === null) {
      g.rotation.y += dt * 2.2;
      g.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.12;
      return;
    }
    if (collectedAt.current < 0) collectedAt.current = t;
    const k = (t - collectedAt.current) / POP;
    g.rotation.y += dt * 14;
    g.position.y = position[1] + k * 1.8;
    g.scale.setScalar(Math.max(0.001, 1 + k * 0.6 - k * k * 1.6));
    if (k >= 1 && !gone) setGone(true);
  });

  // a coin collected on an earlier visit never shows; one collected now plays its pop first
  if ((saved && !popping) || gone) return null;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (collectedAt.current !== null) return;
    collectedAt.current = -1; // stamped with the clock on the next frame
    setPopping(true);
    const s = useGame.getState();
    s.collect(id);
    const n = useGame.getState().coins.length;
    s.notify({ icon: "🪙", title: "+1 coin", body: `${n}/${coinIds.length} found` });
  };

  return (
    <group
      ref={ref}
      position={position}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {/* generous invisible hit area so the coin is easy to tap */}
      <mesh visible={false}>
        <sphereGeometry args={[0.6, 8, 8]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 24]} />
        <meshStandardMaterial color="#facc15" metalness={0.8} roughness={0.25} emissive="#b45309" emissiveIntensity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 5]} />
        <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Coins({ spacing }: { spacing: number }) {
  return (
    <>
      {levels.map((lvl, i) => (
        <group key={lvl.id} position={[i * spacing, 0, 0]}>
          {(coins[lvl.id] ?? []).map((p, j) => (
            <Coin key={j} id={`${lvl.id}-${j}`} position={p} level={i} />
          ))}
        </group>
      ))}
    </>
  );
}
