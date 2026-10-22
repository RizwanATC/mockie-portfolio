"use client";

import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SocialBoard from "./SocialBoard";
import CarriageYard from "./CarriageYard";

// Primitive placeholders for each level. Phase 3 replaces these with Meshy props
// loaded per level; keep each stage self-contained around its own origin.

function Glow({ color, intensity = 2 }: { color: string; intensity?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />;
}

function Car({ color }: { color: string }) {
  return (
    <group>
      <RoundedBox args={[3, 0.7, 1.5]} radius={0.2} position={[0, 0.55, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[1.7, 0.6, 1.3]} radius={0.2} position={[-0.2, 1.1, 0]} castShadow>
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.2} />
      </RoundedBox>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x * 1, 0.25, z * 0.7]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 20]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))
      )}
      <mesh position={[1.52, 0.6, 0.45]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <Glow color="#fef9c3" intensity={4} />
      </mesh>
      <mesh position={[1.52, 0.6, -0.45]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <Glow color="#fef9c3" intensity={4} />
      </mesh>
    </group>
  );
}

function StartStage({ color }: { color: string }) {
  return (
    <group>
      {/* notice boards for Instagram, TikTok and Threads, turned toward the camera */}
      {(["instagram", "tiktok", "threads"] as const).map((network, i) => (
        <group key={network} position={[i * 2.9, 0, -2 - Math.abs(i - 1) * 0.5]} rotation={[0, (1 - i) * 0.18, 0]} scale={1.25}>
          <Suspense fallback={null}>
            <SocialBoard network={network} />
          </Suspense>
        </group>
      ))}
      <Sparkles count={60} scale={[10, 6, 6]} position={[0, 3, -2]} size={3} color={color} />
    </group>
  );
}


function StreamStage({ color }: { color: string }) {
  const bubbles = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    bubbles.current?.children.forEach((b, i) => {
      b.position.y += dt * (0.6 + i * 0.1);
      if (b.position.y > 6) b.position.y = 1.5;
    });
  });
  return (
    <group>
      <RoundedBox args={[4, 0.15, 1.6]} radius={0.05} position={[0, 1.4, -1.5]} castShadow>
        <meshStandardMaterial color="#111827" />
      </RoundedBox>
      <mesh position={[0, 2.5, -2.1]}>
        <boxGeometry args={[2.6, 1.5, 0.1]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      <mesh position={[0, 2.5, -2.04]}>
        <planeGeometry args={[2.4, 1.3]} />
        <Glow color={color} intensity={1.2} />
      </mesh>
      {/* RGB strip */}
      <mesh position={[0, 1.3, -0.7]}>
        <boxGeometry args={[4, 0.04, 0.04]} />
        <Glow color="#22d3ee" intensity={4} />
      </mesh>
      {/* chat bubbles drifting up */}
      <group ref={bubbles}>
        {Array.from({ length: 8 }, (_, i) => (
          <RoundedBox key={i} args={[0.8, 0.35, 0.05]} radius={0.12} position={[2.4 + (i % 2) * 0.6, 1.5 + i * 0.6, -1.5]}>
            <meshStandardMaterial color={i % 3 ? "#f1f5f9" : color} emissive={i % 3 ? "#64748b" : color} emissiveIntensity={0.6} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

function DuogoStage({ color }: { color: string }) {
  const receipt = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!receipt.current) return;
    const len = 0.2 + ((clock.elapsedTime * 0.4) % 1.4);
    receipt.current.scale.y = len;
    receipt.current.position.y = 1.6 - len / 2;
  });
  return (
    <group>
      <RoundedBox args={[4.5, 1.3, 1.4]} radius={0.08} position={[0, 0.65, -1.6]} castShadow>
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </RoundedBox>
      {/* POS screen */}
      <group position={[-0.8, 1.3, -1.6]} rotation={[-0.3, 0.2, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.2, 0.8, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.5, 0.05]}>
          <planeGeometry args={[1.05, 0.65]} />
          <Glow color={color} intensity={1.2} />
        </mesh>
      </group>
      {/* printer + receipt */}
      <mesh position={[1.2, 1.45, -1.4]}>
        <boxGeometry args={[0.6, 0.3, 0.5]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh ref={receipt} position={[1.2, 1.2, -1.14]}>
        <planeGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function NoorStage({ color }: { color: string }) {
  return (
    <group>
      {/* mosque silhouette */}
      <group position={[0, 0, -6]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[5, 3, 2]} />
          <meshStandardMaterial color="#1e1b4b" />
        </mesh>
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#312e81" emissive={color} emissiveIntensity={0.15} />
        </mesh>
        {[-3.2, 3.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 3, 0]}>
              <cylinderGeometry args={[0.25, 0.3, 6, 12]} />
              <meshStandardMaterial color="#1e1b4b" />
            </mesh>
            <mesh position={[0, 6.4, 0]}>
              <coneGeometry args={[0.35, 0.9, 12]} />
              <meshStandardMaterial color="#312e81" />
            </mesh>
            <mesh position={[0, 4.8, 0.3]}>
              <boxGeometry args={[0.2, 0.3, 0.05]} />
              <Glow color={color} />
            </mesh>
          </group>
        ))}
      </group>
      {/* moon */}
      <group position={[4, 7, -8]}>
        <mesh>
          <circleGeometry args={[0.9, 32]} />
          <Glow color="#fef3c7" intensity={2} />
        </mesh>
      </group>
      <group position={[1.8, 0, -0.5]} rotation={[0, -0.4, 0]}>
        <Car color="#b45309" />
      </group>
    </group>
  );
}

function RiverlensStage({ color }: { color: string }) {
  const dots = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    dots.current?.children.forEach((d, i) => {
      d.position.y -= dt * (1 + (i % 3) * 0.3);
      if (d.position.y < 0.6) d.position.y = 5;
    });
  });
  return (
    <group position={[1.2, 0, -1.5]}>
      {/* View / ViewModel / Repository */}
      {[0.6, 2.6, 4.6].map((y, i) => (
        <Float key={y} speed={2} floatIntensity={0.3} rotationIntensity={0}>
          <RoundedBox args={[3 - i * 0.4, 0.25, 2 - i * 0.2]} radius={0.08} position={[0, y, 0]} castShadow>
            <meshStandardMaterial color="#064e3b" emissive={color} emissiveIntensity={0.25 + i * 0.15} />
          </RoundedBox>
        </Float>
      ))}
      <group ref={dots}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[Math.sin(i) * 0.8, 1 + (i * 0.3) % 4, Math.cos(i) * 0.5]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <Glow color={color} intensity={3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function BonusStage({ color }: { color: string }) {
  const cabinets = ["#8b5cf6", "#22d3ee", "#f43f5e", "#10b981"];
  return (
    <group>
      {cabinets.map((c, i) => (
        <group key={c} position={[-3.3 + i * 2.2, 0, -2.2]} rotation={[0, (1.5 - i) * 0.12, 0]}>
          <RoundedBox args={[1.5, 3, 1.2]} radius={0.08} position={[0, 1.5, 0]} castShadow>
            <meshStandardMaterial color="#111827" />
          </RoundedBox>
          <mesh position={[0, 2.1, 0.61]}>
            <planeGeometry args={[1.1, 0.9]} />
            <Glow color={c} intensity={1.4} />
          </mesh>
          <mesh position={[0, 2.95, 0.5]}>
            <boxGeometry args={[1.4, 0.3, 0.3]} />
            <Glow color={c} intensity={2.5} />
          </mesh>
        </group>
      ))}
      <Sparkles count={40} scale={[9, 4, 3]} position={[0, 2, -1]} size={2} color={color} />
    </group>
  );
}

function ContinueStage({ color }: { color: string }) {
  const coin = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (coin.current) coin.current.rotation.y += dt * 2.5;
  });
  return (
    <group>
      <mesh ref={coin} position={[3, 2.5, -1]}>
        <cylinderGeometry args={[0.8, 0.8, 0.15, 40]} />
        <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.2} emissive="#a16207" emissiveIntensity={0.4} />
      </mesh>
      <Sparkles count={50} scale={[8, 5, 4]} position={[0, 2.5, -1]} size={3} color={color} />
    </group>
  );
}

export const stages: Record<string, (p: { color: string }) => React.JSX.Element> = {
  start: StartStage,
  atx: CarriageYard,
  stream: StreamStage,
  duogo: DuogoStage,
  noor: NoorStage,
  riverlens: RiverlensStage,
  bonus: BonusStage,
  continue: ContinueStage,
};
