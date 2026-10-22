"use client";

import * as THREE from "three";
import { levels } from "@/data/resume";

// The winding road through the kingdom. Each level's stage sits on one anchor, turned to face along the road;
// the camera and hero follow the curve between them. Everything placed "on a stage" uses stage-local axes:
// +x runs along the road (direction of travel), +z points at the camera's side of the road.

const ANCHORS: [number, number][] = [
  [0, 0],
  [22, -8],
  [40, -25],
  [62, -32],
  [86, -22],
  [102, -3],
  [124, 6],
  [148, 0],
];
if (ANCHORS.length !== levels.length) throw new Error("path.tsx: one anchor per level");

const LAST = ANCHORS.length - 1;
// Lead-in and run-out so the road doesn't stop dead at the first and last stage.
const pts = [
  new THREE.Vector3(-30, 0, 4),
  ...ANCHORS.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  new THREE.Vector3(178, 0, -6),
];
export const road = new THREE.CatmullRomCurve3(pts, false, "centripetal");
const SEGMENTS = pts.length - 1;
// curve parameter of anchor i (the curve is uniform per segment)
const tOf = (u: number) => (THREE.MathUtils.clamp(u, -1, LAST + 1) + 1) / SEGMENTS;

export type Frame = { pos: THREE.Vector3; yaw: number; right: THREE.Vector3; out: THREE.Vector3 };

// Position and heading at a fractional level index (0 = first stage, LAST = final stage).
export function frameAt(u: number, out: Frame = makeFrame()): Frame {
  const t = tOf(u);
  road.getPoint(t, out.pos);
  road.getTangent(t, out.right);
  out.right.y = 0;
  out.right.normalize();
  out.yaw = Math.atan2(-out.right.z, out.right.x);
  // local +z, the camera's side
  out.out.set(-out.right.z, 0, out.right.x);
  return out;
}
export const makeFrame = (): Frame => ({ pos: new THREE.Vector3(), yaw: 0, right: new THREE.Vector3(), out: new THREE.Vector3() });

// Stage-local point -> world.
export function toWorld(f: Frame, x: number, y: number, z: number, target = new THREE.Vector3()) {
  return target.copy(f.pos).addScaledVector(f.right, x).addScaledVector(f.out, z).setY(f.pos.y + y);
}

export const stageFrames = levels.map((_, i) => frameAt(i));

// Distance from a ground point to the road, plus which side it is on (+ = camera side) relative to the nearest sample.
const SAMPLES = road.getSpacedPoints(600);
const sampleFrames = SAMPLES.map((_, k) => {
  const t = road.getUtoTmapping(k / 600, 0);
  const tan = road.getTangent(t).setY(0).normalize();
  return { p: SAMPLES[k], out: new THREE.Vector3(-tan.z, 0, tan.x) };
});
export function roadSide(x: number, z: number) {
  let best = Infinity;
  let side = 0;
  for (const s of sampleFrames) {
    const dx = x - s.p.x;
    const dz = z - s.p.z;
    const d = dx * dx + dz * dz;
    if (d < best) {
      best = d;
      side = dx * s.out.x + dz * s.out.z;
    }
  }
  return { dist: Math.sqrt(best), side };
}

// Group placed and turned like stage i.
export function AtStage({ index, children }: { index: number; children: React.ReactNode }) {
  const f = stageFrames[index];
  return (
    <group position={f.pos} rotation={[0, f.yaw, 0]}>
      {children}
    </group>
  );
}
