"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// LV.1, Park & Pay done the medieval way: carriages in wooden stalls, a toll booth with a coin slot and a boom
// that lifts and drops, and a signpost with the tariff.

const WOOD = "#7a4b2a";
const WOOD_DARK = "#4a2c18";
const IRON = "#3b3b40";

function Wood({ dark, color }: { dark?: boolean; color?: string }) {
  return <meshStandardMaterial color={color ?? (dark ? WOOD_DARK : WOOD)} roughness={0.85} />;
}

function Wheel({ position, r = 0.42 }: { position: [number, number, number]; r?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <torusGeometry args={[r, 0.06, 8, 20]} />
        <meshStandardMaterial color={IRON} roughness={0.6} metalness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} rotation={[0, 0, (k * Math.PI) / 4]}>
          <boxGeometry args={[r * 2, 0.05, 0.05]} />
          <Wood dark />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 10]} />
        <Wood dark />
      </mesh>
    </group>
  );
}

// A covered carriage, length along x.
function Carriage({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1.1]} />
        <Wood color={color} />
      </mesh>
      {/* gold trim and a door window */}
      <mesh position={[0, 1.27, 0]}>
        <boxGeometry args={[2.06, 0.06, 1.16]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.15, 0.95, 0.56]}>
        <planeGeometry args={[0.45, 0.35]} />
        <meshStandardMaterial color="#f6e7c1" emissive="#f6c46b" emissiveIntensity={0.25} />
      </mesh>
      {/* canvas hood */}
      <mesh position={[-0.1, 1.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.56, 0.56, 1.7, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#efe3c6" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* driver's bench */}
      <mesh position={[1.15, 1.15, 0]} castShadow>
        <boxGeometry args={[0.35, 0.1, 1]} />
        <Wood dark />
      </mesh>
      {/* shafts resting on the ground, no horse while it's parked */}
      {[-0.35, 0.35].map((z) => (
        <mesh key={z} position={[1.85, 0.4, z]} rotation={[0, 0, 0.32]}>
          <boxGeometry args={[1.5, 0.07, 0.07]} />
          <Wood dark />
        </mesh>
      ))}
      <Wheel position={[-0.6, 0.42, 0.62]} />
      <Wheel position={[-0.6, 0.42, -0.62]} />
      <Wheel position={[0.65, 0.34, 0.62]} r={0.34} />
      <Wheel position={[0.65, 0.34, -0.62]} r={0.34} />
    </group>
  );
}

// Stall divider: two posts and two rails, running along z.
function Divider({ x }: { x: number }) {
  return (
    <group position={[x, 0, -1.9]}>
      {[-1.2, 1.2].map((z) => (
        <mesh key={z} position={[0, 0.5, z]} castShadow>
          <boxGeometry args={[0.14, 1, 0.14]} />
          <Wood dark />
        </mesh>
      ))}
      {[0.4, 0.8].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.07, 0.09, 2.5]} />
          <Wood />
        </mesh>
      ))}
    </group>
  );
}

// Toll booth with a coin slot that glows in the level colour, and a striped boom that lifts for each carriage.
function TollBooth({ color }: { color: string }) {
  const boom = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!boom.current) return;
    // up for a few seconds, then down again
    const t = clock.elapsedTime % 8;
    const target = t < 4 ? 1.2 : 0;
    boom.current.rotation.z = THREE.MathUtils.lerp(boom.current.rotation.z, target, 0.04);
  });
  return (
    <group>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[1.2, 2.1, 1.1]} />
        <Wood />
      </mesh>
      {/* window and counter */}
      <mesh position={[0, 1.35, 0.56]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
      <mesh position={[0, 1.02, 0.62]} castShadow>
        <boxGeometry args={[0.95, 0.08, 0.2]} />
        <Wood dark />
      </mesh>
      {/* pyramid roof */}
      <mesh position={[0, 2.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.05, 0.8, 4]} />
        <meshStandardMaterial color="#8a3b2a" roughness={0.8} />
      </mesh>
      {/* coin slot */}
      <mesh position={[0.62, 1.2, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.05]} />
        <meshStandardMaterial color={IRON} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.65, 1.25, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.16, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* boom gate, pivoting at the booth's side */}
      <mesh position={[-0.75, 0.55, 0.7]} castShadow>
        <boxGeometry args={[0.2, 1.1, 0.2]} />
        <Wood dark />
      </mesh>
      <group ref={boom} position={[-0.75, 1, 0.7]}>
        {Array.from({ length: 6 }, (_, k) => (
          <mesh key={k} position={[-0.25 - k * 0.5, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshStandardMaterial color={k % 2 ? "#f6e7c1" : "#b8322a"} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Signpost with the tariff on a parchment sign.
function Tariff() {
  // see SocialBoard: mount the DOM sign a frame late so it survives the scene settling
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <group>
      <mesh position={[0, 1.1, -0.05]} castShadow>
        <boxGeometry args={[0.14, 2.2, 0.14]} />
        <Wood dark />
      </mesh>
      <mesh position={[0, 2.05, -0.02]} castShadow>
        <boxGeometry args={[1.5, 0.95, 0.06]} />
        <Wood />
      </mesh>
      {ready && (
        <Html transform position={[0, 2.05, 0.02]} scale={1.36 / (180 / 40)} zIndexRange={[5, 0]} pointerEvents="none">
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{
              width: 180,
              height: 104,
              color: "#3b2414",
              background: "radial-gradient(ellipse at 50% 40%, #f6e7c1 0%, #ecd49c 70%, #d9b676 100%)",
              boxShadow: "inset 0 0 18px rgba(110, 60, 20, 0.55)",
            }}
          >
            <span className="font-medieval text-lg font-extrabold leading-tight tracking-wide">Park &amp; Pay</span>
            <span className="mt-1 font-serif text-[11px] italic">Carriages · 2 coppers the hour</span>
            <span className="mt-1 font-medieval text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7a5530]">by royal app</span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function CarriageYard({ color }: { color: string }) {
  return (
    <group>
      {/* two angled stalls, one carriage in each, shown side-on with the shafts toward the road */}
      {[-6, -2.8, 0.4].map((x) => (
        <Divider key={x} x={x} />
      ))}
      <group position={[-4.4, 0, -2]} rotation={[0, -0.45, 0]}>
        <Carriage color="#2f4f7f" />
      </group>
      <group position={[-1.2, 0, -2.1]} rotation={[0, -0.55, 0]}>
        <Carriage color="#7f2f3a" />
      </group>
      <group position={[3.4, 0, -1.8]} rotation={[0, -0.25, 0]}>
        <TollBooth color={color} />
      </group>
      <group position={[1.7, 0, -3]} rotation={[0, 0.1, 0]}>
        <Tariff />
      </group>
    </group>
  );
}
