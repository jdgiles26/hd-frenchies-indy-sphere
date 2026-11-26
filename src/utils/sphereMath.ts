import type { BloodlineRole, SphericalAngles, Vec3 } from '../types/frenchie';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Generates evenly distributed unit-sphere coordinates using a Fibonacci lattice.
 * Pads vertical poles so tiles maintain balanced framing on desktop and mobile.
 */
export function computeFibonacciPoints(count: number): Vec3[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 1 }];

  const points: Vec3[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const y = (1 - 2 * t) * 0.76;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;

    points.push({
      x: Math.cos(theta) * radiusAtY,
      y,
      z: Math.sin(theta) * radiusAtY,
    });
  }
  return points;
}

/**
 * Computes live 3D orbital coordinates for Bloodline Constellation mode:
 * - Selected dog floats calmly at the focal center (0, -0.02, 0.42)
 * - Sire, Dam, and Grown Siblings orbit smoothly on an inclined 3D elliptical ring
 *   so the constellation stays alive and never freezes or collapses edge-on.
 */
export function computeBloodlineOrbitPoint(
  role: BloodlineRole,
  orbitIndex: number,
  orbitTotal: number,
  orbitPhaseRad: number
): Vec3 {
  if (role === 'Selected') {
    const bob = Math.sin(orbitPhaseRad * 1.8) * 0.035;
    return { x: 0, y: -0.02 + bob, z: 0.44 };
  }

  const safeTotal = Math.max(orbitTotal, 1);
  const baseAngle = (orbitIndex / safeTotal) * Math.PI * 2 + orbitPhaseRad;

  // Inclined 3D elliptical halo around the subject
  const ringRadiusX = 0.96;
  const ringRadiusY = 0.56;
  const ringDepthZ = 0.46;

  // Slight elevation bias: parents hover higher, siblings glide lower
  const verticalBias = role === 'Sire' || role === 'Dam' ? -0.1 : 0.12;

  return {
    x: Math.cos(baseAngle) * ringRadiusX,
    y: Math.sin(baseAngle) * ringRadiusY + verticalBias,
    z: -0.08 + Math.sin(baseAngle + Math.PI * 0.35) * ringDepthZ,
  };
}

export function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 1e-6) return { x: 0, y: 0, z: 1 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Rotates a 3D point by yaw (rotY) then pitch (rotX).
 */
export function rotatePoint(p: Vec3, rotX: number, rotY: number): Vec3 {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = p.x * cosY + p.z * sinY;
  const z1 = -p.x * sinY + p.z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = p.y * cosX - z1 * sinX;
  const z2 = p.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

/**
 * Computes (rotX, rotY) orientation that rotates unit vector `p` directly to (0, 0, +1).
 */
export function anglesToFacePoint(p: Vec3): SphericalAngles {
  const n = normalize(p);
  const rotY = -Math.atan2(n.x, n.z);
  const planar = Math.hypot(n.x, n.z);
  const rotX = Math.atan2(n.y, planar);
  return {
    rotX: clamp(rotX, -1.1, 1.1),
    rotY,
  };
}

/**
 * Shortest angular delta in radians in [-PI, PI].
 */
export function shortestAngleDelta(current: number, target: number): number {
  let diff = (target - current) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}
