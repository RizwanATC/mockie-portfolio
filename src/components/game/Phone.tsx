"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { App } from "@/data/resume";
import { phoneFrame } from "@/data/phoneFrame";
import { useGame } from "@/lib/store";

// Sized from the iPhone 14 Pro mockup (public/frames/iphone-14-pro.png) so screenshots sit exactly in its screen hole.
const PHONE_H = 2.9;
const PHONE_W = PHONE_H * phoneFrame.aspect;
const { screen: hole } = phoneFrame;
const SCREEN_W = PHONE_W * hole.width;
const SCREEN_H = PHONE_H * hole.height;
const SCREEN_X = (hole.left + hole.width / 2 - 0.5) * PHONE_W;
const SCREEN_Y = (0.5 - (hole.top + hole.height / 2)) * PHONE_H;
// body behind the flat mockup, inset so it never peeks past the drawn frame
const BODY_W = PHONE_W * 0.94;
const BODY_H = PHONE_H * 0.995;
const DEPTH = 0.07;

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// ShapeGeometry UVs are raw x/y; normalise them to 0..1 so the screenshot fills the rounded screen.
function roundedPlane(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
}

function usePhoneGeometry() {
  return useMemo(() => {
    const body = new THREE.ExtrudeGeometry(roundedRect(BODY_W, BODY_H, BODY_W * 0.17), {
      depth: DEPTH,
      bevelEnabled: false,
      curveSegments: 16,
    });
    body.translate(0, 0, -DEPTH - 0.005);
    return {
      body,
      screen: roundedPlane(SCREEN_W, SCREEN_H, SCREEN_W * 0.12),
      // same hole, laid out wide so a landscape screenshot isn't squashed
      screenWide: roundedPlane(SCREEN_H, SCREEN_W, SCREEN_W * 0.12),
    };
  }, []);
}

// A standalone iPhone (body + mockup frame) with arbitrary screen content, e.g. a live HTML page.
// Children are centred in the screen hole; SCREEN_SIZE gives the hole's size in local units.
export const SCREEN_SIZE = { width: SCREEN_W, height: SCREEN_H };

export function PhoneShell({ children }: { children?: React.ReactNode }) {
  const frame = useTexture(phoneFrame.src, (t) => {
    for (const x of [t].flat()) {
      x.colorSpace = THREE.SRGBColorSpace;
      x.anisotropy = 8;
    }
  });
  const geo = usePhoneGeometry();
  return (
    <group>
      <mesh geometry={geo.body} castShadow>
        <meshStandardMaterial color="#2a1f33" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh geometry={geo.screen} position={[SCREEN_X, SCREEN_Y, 0.001]}>
        <meshBasicMaterial color="#12081f" />
      </mesh>
      <group position={[SCREEN_X, SCREEN_Y, 0.002]}>{children}</group>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[PHONE_W, PHONE_H]} />
        <meshBasicMaterial map={frame} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

// Fan layout: phones side by side, edges curving back and turning toward the centre.
const GAP = PHONE_W * 0.12;
const SPACING = PHONE_W + GAP;

function Phone({
  screen,
  frame,
  color,
  x,
  landscape,
  selected,
  onSelect,
}: {
  screen: THREE.Texture;
  frame: THREE.Texture;
  color: string;
  x: number;
  landscape: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const geo = usePhoneGeometry();
  const lift = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    if (!lift.current) return;
    const k = 1 - Math.exp(-dt * 10);
    const z = selected ? 0.9 : hovered ? 0.35 : 0;
    const s = selected ? 1.12 : hovered ? 1.04 : 1;
    lift.current.position.z = THREE.MathUtils.lerp(lift.current.position.z, z, k);
    lift.current.scale.setScalar(THREE.MathUtils.lerp(lift.current.scale.x, s, k));
  });

  const offset = x / SPACING;
  return (
    <group position={[x, 0, -Math.abs(offset) * 0.35]} rotation={[0, -offset * 0.14, 0]}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <group
          ref={lift}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
        >
          {/* landscape: turn the phone a quarter left (Dynamic Island on the left) */}
          <group rotation={[0, 0, landscape ? Math.PI / 2 : 0]}>
            {/* body for thickness when the phone tilts */}
            <mesh geometry={geo.body} castShadow>
              <meshStandardMaterial color="#2a1f33" metalness={0.8} roughness={0.35} emissive={color} emissiveIntensity={selected ? 0.4 : 0.05} />
            </mesh>
            <mesh
              geometry={landscape ? geo.screenWide : geo.screen}
              position={[SCREEN_X, SCREEN_Y, 0.002]}
              rotation={[0, 0, landscape ? -Math.PI / 2 : 0]}
            >
              <meshBasicMaterial map={screen} />
            </mesh>
            {/* iPhone 14 Pro mockup, transparent where the screen is */}
            <mesh position={[0, 0, 0.004]}>
              <planeGeometry args={[PHONE_W, PHONE_H]} />
              <meshBasicMaterial map={frame} transparent depthWrite={false} />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}

// One phone per screenshot. The selected one (from a thumbnail or a click) steps forward.
export default function PhoneFan({ app }: { app: App }) {
  const screens = useTexture(app.screens, (loaded) => {
    for (const t of [loaded].flat()) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    }
  });
  const frame = useTexture(phoneFrame.src, (t) => {
    for (const x of [t].flat()) {
      x.colorSpace = THREE.SRGBColorSpace;
      x.anisotropy = 8;
    }
  });
  const selected = useGame((s) => s.screens[app.id] ?? -1);
  const setScreen = useGame((s) => s.setScreen);
  // Lay phones out by their real widths so a landscape phone gets room.
  const widths = app.screens.map((_, i) => (app.landscape?.includes(i) ? PHONE_H : PHONE_W));
  const total = widths.reduce((a, w) => a + w, 0) + GAP * (widths.length - 1);
  const xs = widths.map((w, i) => -total / 2 + widths.slice(0, i).reduce((a, v) => a + v + GAP, 0) + w / 2);

  return (
    <group position={app.position} rotation={[0, app.rotationY, 0]} scale={app.scale ?? 0.6}>
      {screens.map((tex, i) => (
        <Phone
          key={app.screens[i]}
          screen={tex}
          frame={frame}
          color={app.color}
          x={xs[i]}
          landscape={!!app.landscape?.includes(i)}
          selected={i === selected}
          onSelect={() => setScreen(app.id, i === selected ? -1 : i)}
        />
      ))}
    </group>
  );
}
