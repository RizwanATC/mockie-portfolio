"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Kampung-at-dusk backdrop: gradient sky, low sun, grass + dirt road, stilt houses, coconut palms, hills.
// Everything sits behind or beside the level stages; x spans the whole run of levels.

const X_MIN = -40;
const X_MAX = 210;

// deterministic scatter so the village is the same on every load
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
    vec3 c = mix(horizon, mid, smoothstep(0.0, 0.22, h));
    c = mix(c, top, smoothstep(0.22, 0.65, h));
    gl_FragColor = vec4(c, 1.0);
  }
`;

function Sky() {
  const group = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({
      top: { value: new THREE.Color("#27306b") },
      mid: { value: new THREE.Color("#b8608f") },
      horizon: { value: new THREE.Color("#ffb070") },
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
      <mesh position={[-45, 10, -135]}>
        <circleGeometry args={[9, 48]} />
        <meshBasicMaterial color="#ffd59a" fog={false} toneMapped={false} />
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
    l.position.set(camera.position.x - 10, 12, 6);
    l.target.position.set(camera.position.x, 0, -2);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={light}
      color="#ffc58a"
      intensity={1.8}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={14}
      shadow-camera-bottom={-10}
    />
  );
}

function roofGeometry(w: number, h: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

const WOOD = ["#8b5a2b", "#9c6b3c", "#7a4a25", "#a47148"];
const ROOF = ["#6b4a2b", "#8a4b32", "#5d3b25", "#7b3f2c"];

function House({ seed }: { seed: number }) {
  const [wood, roof] = useMemo(() => {
    const r = rng(seed);
    return [WOOD[Math.floor(r() * WOOD.length)], ROOF[Math.floor(r() * ROOF.length)]];
  }, [seed]);
  const roofGeo = useMemo(() => roofGeometry(3.9, 1.7, 4.8), []);
  const stilts: [number, number][] = [
    [-1.3, -1.8],
    [1.3, -1.8],
    [-1.3, 0],
    [1.3, 0],
    [-1.3, 1.8],
    [1.3, 1.8],
  ];
  return (
    <group>
      {stilts.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.6, z]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 1.2, 6]} />
          <meshStandardMaterial color="#5b3a1e" />
        </mesh>
      ))}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.12, 4.2]} />
        <meshStandardMaterial color="#6e4524" />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1.8, 4]} />
        <meshStandardMaterial color={wood} roughness={0.9} />
      </mesh>
      <mesh geometry={roofGeo} position={[0, 3.1, 0]} castShadow>
        <meshStandardMaterial color={roof} roughness={0.95} />
      </mesh>
      {/* lit windows and door */}
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 2.35, 2.01]}>
          <planeGeometry args={[0.55, 0.6]} />
          <meshStandardMaterial color="#ffb347" emissive="#ffa033" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 1.95, 2.01]}>
        <planeGeometry args={[0.6, 1.2]} />
        <meshStandardMaterial color="#3b2412" />
      </mesh>
      {/* steps */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.25 + i * 0.35, 2.55 + (2 - i) * 0.3]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.3]} />
          <meshStandardMaterial color="#6e4524" />
        </mesh>
      ))}
    </group>
  );
}

function Palm({ seed }: { seed: number }) {
  const [lean, height, fronds] = useMemo(() => {
    const r = rng(seed);
    return [0.08 + r() * 0.18, 5 + r() * 2.5, 7 + Math.floor(r() * 3)];
  }, [seed]);
  const topX = Math.sin(lean) * height;
  const topY = Math.cos(lean) * height;
  return (
    <group>
      <mesh position={[topX / 2, topY / 2, 0]} rotation={[0, 0, -lean]} castShadow>
        <cylinderGeometry args={[0.13, 0.22, height, 7]} />
        <meshStandardMaterial color="#8b6b4a" roughness={1} />
      </mesh>
      <group position={[topX, topY, 0]}>
        {Array.from({ length: fronds }, (_, i) => (
          <group key={i} rotation={[0, (i / fronds) * Math.PI * 2, 0]}>
            <mesh position={[0, -0.25, 1.2]} rotation={[1.15, 0, 0]} scale={[1, 1, 0.25]} castShadow>
              <coneGeometry args={[0.45, 2.8, 4]} />
              <meshStandardMaterial color={i % 2 ? "#3f7d2c" : "#4f8f34"} roughness={0.9} />
            </mesh>
          </group>
        ))}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 0.22, -0.3, Math.sin(i * 2.1) * 0.22]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#5a3d1e" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Lamp() {
  return (
    <group>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.6, 6]} />
        <meshStandardMaterial color="#3b2a1a" />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#ffcf73" emissive="#ffb347" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Village() {
  const layout = useMemo(() => {
    const r = rng(7);
    const houses: { x: number; z: number; ry: number; s: number; seed: number }[] = [];
    for (let x = X_MIN; x < X_MAX; x += 9 + r() * 6) {
      houses.push({ x, z: -11 - r() * 5, ry: (r() - 0.5) * 0.5, s: 0.9 + r() * 0.4, seed: Math.floor(r() * 1e6) });
    }
    const palms: { x: number; z: number; ry: number; seed: number }[] = [];
    for (let x = X_MIN; x < X_MAX; x += 4 + r() * 5) {
      palms.push({ x, z: -7 - r() * 12, ry: r() * Math.PI * 2, seed: Math.floor(r() * 1e6) });
    }
    const lamps: number[] = [];
    for (let x = X_MIN; x < X_MAX; x += 8) lamps.push(x);
    const hills: { x: number; sx: number; sy: number }[] = [];
    for (let x = X_MIN - 20; x < X_MAX + 20; x += 28 + r() * 12) hills.push({ x, sx: 22 + r() * 16, sy: 6 + r() * 6 });
    return { houses, palms, lamps, hills };
  }, []);

  const mid = (X_MIN + X_MAX) / 2;
  const len = X_MAX - X_MIN + 120;

  return (
    <group>
      <Sky />
      <Sun />
      <hemisphereLight args={["#ffd7b0", "#4a6b3a", 0.9]} />

      {/* grass and road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, 0, -20]} receiveShadow>
        <planeGeometry args={[len, 120]} />
        <meshStandardMaterial color="#6a9a45" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, 0.01, 2.6]} receiveShadow>
        <planeGeometry args={[len, 3.4]} />
        <meshStandardMaterial color="#c29a6b" roughness={1} />
      </mesh>

      {layout.hills.map((h, i) => (
        <mesh key={i} position={[h.x, -2, -48]} scale={[h.sx, h.sy, 12]}>
          <sphereGeometry args={[1, 20, 12]} />
          <meshStandardMaterial color="#3e6b35" roughness={1} />
        </mesh>
      ))}
      {layout.houses.map((h) => (
        <group key={h.seed} position={[h.x, 0, h.z]} rotation={[0, h.ry, 0]} scale={h.s}>
          <House seed={h.seed} />
        </group>
      ))}
      {layout.palms.map((p) => (
        <group key={p.seed} position={[p.x, 0, p.z]} rotation={[0, p.ry, 0]}>
          <Palm seed={p.seed} />
        </group>
      ))}
      {/* lamps line the far side of the road, clear of the camera */}
      {layout.lamps.map((x) => (
        <group key={x} position={[x, 0, 0.6]}>
          <Lamp />
        </group>
      ))}
    </group>
  );
}
