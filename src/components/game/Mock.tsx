"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GhostAction } from "@/data/resume";

// Procedural stand-in for "Mock". Phase 2 swaps this for the Meshy/Mixamo GLB
// behind the same `action` prop, so the world code doesn't change.

const BODY = "#6d28d9";
const BODY_DARK = "#4c1d95";

const spikes: [number, number, number, number][] = [
  // x, y, z, tilt
  [-0.55, 0.85, -0.1, 0.5],
  [-0.2, 1.05, -0.2, 0.15],
  [0.2, 1.05, -0.2, -0.15],
  [0.55, 0.85, -0.1, -0.5],
  [0, 0.7, -0.75, 0],
];

export default function Mock({ action }: { action: GhostAction }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (!root.current || !body.current || !armL.current || !armR.current) return;

    let bob = Math.sin(t * 2) * 0.12;
    let spin = 0;
    let lean = 0;
    let armLz = 0.4;
    let armRz = -0.4;
    let armRx = 0;

    switch (action) {
      case "wave":
        armRz = -2.4 + Math.sin(t * 8) * 0.4;
        break;
      case "walk":
        lean = Math.sin(t * 6) * 0.08;
        armLz = 0.4 + Math.sin(t * 6) * 0.3;
        armRz = -0.4 + Math.sin(t * 6) * 0.3;
        break;
      case "dance":
        bob = Math.abs(Math.sin(t * 5)) * 0.35;
        spin = Math.sin(t * 2.5) * 0.8;
        armLz = 1.2 + Math.sin(t * 10) * 0.5;
        armRz = -1.2 - Math.sin(t * 10) * 0.5;
        break;
      case "typing":
        armLz = 0.2 + Math.sin(t * 24) * 0.08;
        armRz = -0.2 + Math.cos(t * 24) * 0.08;
        armRx = -1.1;
        break;
      case "drive":
        lean = Math.sin(t * 1.5) * 0.12;
        armRx = -1.2;
        armLz = 0.2;
        armRz = -0.2;
        break;
      case "jump":
        bob = Math.abs(Math.sin(t * 3)) * 0.8;
        armLz = 2.2;
        armRz = -2.2;
        break;
      case "point":
        armRz = -1.5;
        armRx = -0.3;
        break;
      case "bow":
        lean = 0.45 + Math.sin(t * 1.5) * 0.1;
        break;
    }

    const k = 1 - Math.exp(-dt * 8); // frame-rate independent smoothing
    body.current.position.y = THREE.MathUtils.lerp(body.current.position.y, bob, k);
    body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, spin, k);
    body.current.rotation.x = THREE.MathUtils.lerp(body.current.rotation.x, lean, k);
    armL.current.rotation.z = THREE.MathUtils.lerp(armL.current.rotation.z, armLz, k);
    armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, armRz, k);
    armR.current.rotation.x = THREE.MathUtils.lerp(armR.current.rotation.x, armRx, k);
    armL.current.rotation.x = THREE.MathUtils.lerp(armL.current.rotation.x, action === "typing" ? -1.1 : 0, k);
  });

  return (
    <group ref={root}>
      <group ref={body}>
        {/* body */}
        <mesh castShadow scale={[1, 0.92, 0.9]}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color={BODY} roughness={0.55} emissive={BODY_DARK} emissiveIntensity={0.35} />
        </mesh>

        {/* spiky crown */}
        {spikes.map(([x, y, z, tilt], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[z < -0.5 ? -1.1 : -0.2, 0, tilt]} castShadow>
            <coneGeometry args={[0.2, 0.55, 12]} />
            <meshStandardMaterial color={BODY} roughness={0.55} emissive={BODY_DARK} emissiveIntensity={0.35} />
          </mesh>
        ))}

        {/* android antennae: Mock's own signature */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.32, 1.08, 0.2]} rotation={[0, 0, -s * 0.35]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
              <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* eyes */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.33, 0.28, 0.82]} rotation={[0, 0, s * -0.35]} scale={[1, 0.6, 0.3]}>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        ))}

        {/* grin: half-disc sitting just proud of the body */}
        <group position={[0, -0.12, 0.9]} rotation={[-0.15, 0, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[0.5, 32, Math.PI, Math.PI]} />
            <meshBasicMaterial color="#2e1065" />
          </mesh>
          <mesh>
            <circleGeometry args={[0.44, 32, Math.PI, Math.PI]} />
            <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.25} />
          </mesh>
          {[-0.22, 0, 0.22].map((x) => (
            <mesh key={x} position={[x, -0.1, 0.005]}>
              <planeGeometry args={[0.02, 0.2]} />
              <meshBasicMaterial color="#a78bfa" />
            </mesh>
          ))}
        </group>

        {/* stubby arms */}
        <group ref={armL} position={[-0.9, -0.05, 0.1]}>
          <mesh position={[-0.25, 0, 0]} scale={[1.4, 0.8, 0.8]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={BODY} roughness={0.55} emissive={BODY_DARK} emissiveIntensity={0.35} />
          </mesh>
        </group>
        <group ref={armR} position={[0.9, -0.05, 0.1]}>
          <mesh position={[0.25, 0, 0]} scale={[1.4, 0.8, 0.8]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={BODY} roughness={0.55} emissive={BODY_DARK} emissiveIntensity={0.35} />
          </mesh>
        </group>

        {/* ghostly wisp tail instead of legs */}
        <mesh position={[0, -0.95, -0.1]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.55, 0.6, 24]} />
          <meshStandardMaterial color={BODY} roughness={0.55} transparent opacity={0.75} emissive={BODY_DARK} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
