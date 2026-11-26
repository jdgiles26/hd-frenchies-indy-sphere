import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { Minus, Pause, Play, Plus, RotateCw, Sparkles } from 'lucide-react';
import type {
  BloodlineRole,
  FilterCategory,
  FrenchieProfile,
  Vec3,
} from '../types/frenchie';
import {
  getBloodlineIds,
  getBloodlineRole,
  matchesFilter,
} from '../data/frenchies';
import {
  anglesToFacePoint,
  clamp,
  computeBloodlineOrbitPoint,
  computeFibonacciPoints,
  lerp,
  normalize,
  rotatePoint,
  shortestAngleDelta,
} from '../utils/sphereMath';

interface FrenchieSphereProps {
  frenchies: readonly FrenchieProfile[];
  activeFilter: FilterCategory;
  selectedId: string | null;
  bloodlineSubject: FrenchieProfile | null;
  velocityRef: MutableRefObject<{ x: number; y: number }>;
  onSelectDog: (dog: FrenchieProfile) => void;
}

const ROLE_STYLES: Record<BloodlineRole, string> = {
  Selected: 'bg-seafoam-300 text-obsidian-950',
  Sire: 'bg-amethyst-500 text-white',
  Dam: 'bg-champagne-400 text-obsidian-950',
  'Grown Sibling': 'bg-seafoam-400 text-obsidian-950',
};

const BEAM_COLORS: Record<Exclude<BloodlineRole, 'Selected'>, string> = {
  Sire: '#c084fc',
  Dam: '#e6c57a',
  'Grown Sibling': '#8bf0d0',
};

export function FrenchieSphere({
  frenchies,
  activeFilter,
  selectedId,
  bloodlineSubject,
  velocityRef,
  onSelectDog,
}: FrenchieSphereProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const beamRefs = useRef<Map<string, SVGLineElement>>(new Map());

  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());
  const [autoSpin, setAutoSpin] = useState(true);

  // Mutable animation state inside refs for locked 60fps with zero React re-renders
  const rotRef = useRef({ x: -0.14, y: 0.35 });
  const zoomRef = useRef({ current: 1, target: 1 });
  const targetRotRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const pendingSelectRef = useRef<string | null>(null);
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 });
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const isModalOpenRef = useRef(false);
  const autoSpinRef = useRef(true);
  const bloodlinePhaseRef = useRef(0);

  // Per-dog interpolated 3D position for glitch-free transitions into/out of Bloodline Orbit
  const currentPosRef = useRef<Map<string, Vec3>>(new Map());
  const baseTargetPosRef = useRef<Map<string, Vec3>>(new Map());
  const visibilityRef = useRef<
    Map<string, { opacity: number; scaleMul: number; interactive: boolean }>
  >(new Map());

  // Latest bloodline metadata kept in a ref so the RAF loop never restarts or stutters
  const bloodlineMetaRef = useRef<{
    subjectId: string;
    orbitOrder: Array<{ id: string; role: BloodlineRole }>;
  } | null>(null);

  const basePoints = useMemo(() => {
    const pts = computeFibonacciPoints(frenchies.length);
    const map = new Map<string, Vec3>();
    frenchies.forEach((dog, idx) => {
      map.set(dog.id, pts[idx] ?? { x: 0, y: 0, z: 1 });
    });
    return map;
  }, [frenchies]);

  const bloodlineIds = useMemo(
    () => (bloodlineSubject ? getBloodlineIds(bloodlineSubject) : null),
    [bloodlineSubject]
  );

  // Orbiting relatives list (for SVG constellation beams)
  const orbitingRelatives = useMemo(() => {
    if (!bloodlineSubject || !bloodlineIds) return [];
    const list: Array<{ id: string; role: Exclude<BloodlineRole, 'Selected'> }> =
      [];
    for (const dog of frenchies) {
      if (!bloodlineIds.has(dog.id) || dog.id === bloodlineSubject.id) continue;
      const role = getBloodlineRole(bloodlineSubject, dog.id);
      if (role && role !== 'Selected') {
        list.push({ id: dog.id, role });
      }
    }
    return list;
  }, [bloodlineSubject, bloodlineIds, frenchies]);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    isModalOpenRef.current = selectedId !== null;
    if (selectedId === null) {
      zoomRef.current.target = bloodlineSubject ? 1.05 : 1;
    }
  }, [selectedId, bloodlineSubject]);

  // Update target layout & dimming when filter or bloodline mode changes
  useEffect(() => {
    const nextTargets = new Map<string, Vec3>();
    const nextVis = new Map<
      string,
      { opacity: number; scaleMul: number; interactive: boolean }
    >();

    if (bloodlineSubject && bloodlineIds) {
      const orbitOrder: Array<{ id: string; role: BloodlineRole }> = [];
      for (const dog of frenchies) {
        const inLine = bloodlineIds.has(dog.id);
        const role = getBloodlineRole(bloodlineSubject, dog.id);
        if (inLine && role) {
          orbitOrder.push({ id: dog.id, role });
        }

        const fallback = basePoints.get(dog.id) ?? { x: 0, y: 0, z: -1 };
        nextTargets.set(dog.id, fallback);
        nextVis.set(dog.id, {
          opacity: inLine ? 1 : 0.04,
          scaleMul: dog.id === bloodlineSubject.id ? 1.14 : inLine ? 0.96 : 0.68,
          interactive: inLine,
        });
      }

      bloodlineMetaRef.current = {
        subjectId: bloodlineSubject.id,
        orbitOrder,
      };

      // Smoothly bring the camera to a clean heroic front tilt without stopping orbital motion
      targetRotRef.current = { x: -0.06, y: 0 };
      zoomRef.current.target = 1.06;
      velocityRef.current = { x: 0, y: 0 };
    } else {
      bloodlineMetaRef.current = null;
      const matchingVectors: Vec3[] = [];

      for (const dog of frenchies) {
        const base = basePoints.get(dog.id) ?? { x: 0, y: 0, z: 1 };
        const matched = matchesFilter(dog, activeFilter);
        nextTargets.set(dog.id, base);
        nextVis.set(dog.id, {
          opacity: matched ? 1 : 0.14,
          scaleMul: matched ? 1 : 0.82,
          interactive: true,
        });
        if (matched) matchingVectors.push(base);
      }

      if (activeFilter !== 'All' && matchingVectors.length > 0) {
        const centroid = matchingVectors.reduce(
          (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y, z: acc.z + v.z }),
          { x: 0, y: 0, z: 0 }
        );
        const targetVec =
          Math.hypot(centroid.x, centroid.y, centroid.z) > 0.12
            ? normalize(centroid)
            : matchingVectors[0];
        const aim = anglesToFacePoint(targetVec);
        targetRotRef.current = { x: aim.rotX, y: aim.rotY };
        velocityRef.current = { x: 0, y: 0 };
      }
      zoomRef.current.target = 1;
    }

    baseTargetPosRef.current = nextTargets;
    visibilityRef.current = nextVis;

    if (currentPosRef.current.size === 0) {
      nextTargets.forEach((vec, id) => {
        currentPosRef.current.set(id, { ...vec });
      });
    }
  }, [frenchies, activeFilter, bloodlineSubject, bloodlineIds, basePoints, velocityRef]);

  // Smoothly focus and zoom toward the selected dog when clicked
  useEffect(() => {
    if (!selectedId) return;
    if (bloodlineMetaRef.current) return;
    const targetVec =
      baseTargetPosRef.current.get(selectedId) ?? basePoints.get(selectedId);
    if (!targetVec) return;
    const aim = anglesToFacePoint(targetVec);
    targetRotRef.current = { x: aim.rotX, y: aim.rotY };
    zoomRef.current.target = 1.22;
    velocityRef.current = { x: 0, y: 0 };
  }, [selectedId, basePoints, velocityRef]);

  // Single continuous 60fps animation loop (zero React re-renders per frame)
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - lastTs) / 16.6667, 2.5);
      lastTs = now;

      const stage = stageRef.current;
      if (stage) {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.width * 0.5;
        const centerY = rect.height * 0.5;
        const minDim = Math.min(rect.width, rect.height);
        const baseRadius = clamp(minDim * 0.34, 155, 295);
        const perspective = baseRadius * 3.15;

        zoomRef.current.current = lerp(
          zoomRef.current.current,
          zoomRef.current.target,
          0.11 * dt
        );

        const bloodlineMeta = bloodlineMetaRef.current;

        // Advance living Bloodline Constellation orbital phase continuously (never freezes!)
        if (bloodlineMeta && autoSpinRef.current && !isModalOpenRef.current) {
          bloodlinePhaseRef.current += 0.0065 * dt;
        }

        // Update sphere camera orientation
        if (targetRotRef.current && !isDraggingRef.current) {
          const dx = targetRotRef.current.x - rotRef.current.x;
          const dy = shortestAngleDelta(rotRef.current.y, targetRotRef.current.y);
          rotRef.current.x += dx * 0.13 * dt;
          rotRef.current.y += dy * 0.13 * dt;

          if (Math.abs(dx) < 0.002 && Math.abs(dy) < 0.002) {
            rotRef.current.x = targetRotRef.current.x;
            rotRef.current.y = targetRotRef.current.y;
            targetRotRef.current = null;
          }
        } else if (!isDraggingRef.current) {
          rotRef.current.x = clamp(
            rotRef.current.x + velocityRef.current.x * dt,
            -1.15,
            1.15
          );
          rotRef.current.y += velocityRef.current.y * dt;

          const damping = Math.pow(0.945, dt);
          velocityRef.current.x *= damping;
          velocityRef.current.y *= damping;

          // Gentle idle spin on the main sphere (in Bloodline mode, relatives orbit around the centered subject instead)
          const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y);
          if (
            !bloodlineMeta &&
            autoSpinRef.current &&
            speed < 0.0009 &&
            !isModalOpenRef.current
          ) {
            rotRef.current.y += 0.0022 * dt;
          }
        }

        const radius = baseRadius * zoomRef.current.current;
        const { x: rotX, y: rotY } = rotRef.current;
        const projectedScreens = new Map<string, { x: number; y: number }>();

        // Precompute bloodline orbit indices for relatives
        const orbitRelatives = bloodlineMeta
          ? bloodlineMeta.orbitOrder.filter((m) => m.role !== 'Selected')
          : [];

        for (const dog of frenchies) {
          const el = tileRefs.current.get(dog.id);
          if (!el) continue;

          let target = baseTargetPosRef.current.get(dog.id) ?? { x: 0, y: 0, z: 1 };

          if (bloodlineMeta) {
            if (dog.id === bloodlineMeta.subjectId) {
              target = computeBloodlineOrbitPoint(
                'Selected',
                0,
                orbitRelatives.length,
                bloodlinePhaseRef.current
              );
            } else {
              const relIdx = orbitRelatives.findIndex((r) => r.id === dog.id);
              if (relIdx !== -1) {
                target = computeBloodlineOrbitPoint(
                  orbitRelatives[relIdx].role,
                  relIdx,
                  orbitRelatives.length,
                  bloodlinePhaseRef.current
                );
              }
            }
          }

          const cur = currentPosRef.current.get(dog.id) ?? { ...target };
          const lerpSpeed = bloodlineMeta ? 0.16 * dt : 0.12 * dt;
          cur.x = lerp(cur.x, target.x, lerpSpeed);
          cur.y = lerp(cur.y, target.y, lerpSpeed);
          cur.z = lerp(cur.z, target.z, lerpSpeed);
          currentPosRef.current.set(dog.id, cur);

          const rotated = rotatePoint(cur, rotX, rotY);
          const worldX = rotated.x * radius;
          const worldY = rotated.y * radius;
          const worldZ = rotated.z * radius;

          const depthScale = perspective / (perspective - worldZ);
          const screenX = worldX * depthScale;
          const screenY = worldY * depthScale;

          projectedScreens.set(dog.id, {
            x: centerX + screenX,
            y: centerY + screenY,
          });

          const vis = visibilityRef.current.get(dog.id) ?? {
            opacity: 1,
            scaleMul: 1,
            interactive: true,
          };

          const depthNormalized = clamp((rotated.z + 1) / 2, 0, 1);
          const depthOpacity = bloodlineMeta
            ? 0.55 + depthNormalized * 0.45
            : 0.24 + depthNormalized * 0.76;
          const finalOpacity = clamp(depthOpacity * vis.opacity, 0.03, 1);
          const finalScale =
            depthScale * (0.74 + depthNormalized * 0.3) * vis.scaleMul;

          // Subtle 3D spherical curvature tilt so tiles feel sculpted onto a real orb
          const tiltY = clamp(rotated.x * 16, -18, 18);
          const tiltX = clamp(-rotated.y * 12, -14, 14);

          el.style.transform = `translate3d(${screenX.toFixed(2)}px, ${screenY.toFixed(2)}px, 0) scale(${finalScale.toFixed(4)}) perspective(900px) rotateY(${tiltY.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg)`;
          el.style.opacity = finalOpacity.toFixed(3);
          el.style.zIndex = String(Math.round(depthNormalized * 50) + 1);
          el.style.pointerEvents =
            vis.interactive && finalOpacity > 0.14 ? 'auto' : 'none';
        }

        // Update live 60fps SVG Constellation Beams in Bloodline Mode
        if (bloodlineMeta) {
          const subjectScreen = projectedScreens.get(bloodlineMeta.subjectId);
          if (subjectScreen) {
            for (const rel of orbitRelatives) {
              const lineEl = beamRefs.current.get(rel.id);
              const relScreen = projectedScreens.get(rel.id);
              if (lineEl && relScreen) {
                lineEl.setAttribute('x1', subjectScreen.x.toFixed(1));
                lineEl.setAttribute('y1', subjectScreen.y.toFixed(1));
                lineEl.setAttribute('x2', relScreen.x.toFixed(1));
                lineEl.setAttribute('y2', relScreen.y.toFixed(1));
              }
            }
          }
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [frenchies, velocityRef]);

  const pointerSpan = () => {
    const pts = [...activePointersRef.current.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  // Pointer drag + smooth momentum handlers
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).closest(
        'button[data-flip-trigger="true"], button[data-hud-control="true"]'
      )
    ) {
      return;
    }
    pendingSelectRef.current =
      (e.target as HTMLElement).closest('[data-dog-id]')?.getAttribute('data-dog-id') ??
      null;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointersRef.current.size >= 2) {
      pinchRef.current = {
        dist: Math.max(pointerSpan(), 1),
        zoom: zoomRef.current.target,
      };
      isDraggingRef.current = false;
      targetRotRef.current = null;
      velocityRef.current = { x: 0, y: 0 };
    } else {
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      targetRotRef.current = null;
      velocityRef.current = { x: 0, y: 0 };
      lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId) && !isDraggingRef.current) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size >= 2 && pinchRef.current) {
      const dist = pointerSpan();
      const scale = dist / pinchRef.current.dist;
      zoomRef.current.target = clamp(pinchRef.current.zoom * scale, 0.78, 1.38);
      dragDistanceRef.current = 40;
      return;
    }

    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    const now = performance.now();
    const dtMs = Math.max(now - lastPointerRef.current.time, 8);

    dragDistanceRef.current += Math.hypot(dx, dy);

    const sensitivity = 0.0052;
    rotRef.current.y += dx * sensitivity;
    rotRef.current.x = clamp(rotRef.current.x - dy * sensitivity, -1.15, 1.15);

    velocityRef.current.y = clamp(dx * sensitivity * (16 / dtMs), -0.09, 0.09);
    velocityRef.current.x = clamp(-dy * sensitivity * (16 / dtMs), -0.07, 0.07);

    lastPointerRef.current = { x: e.clientX, y: e.clientY, time: now };
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) pinchRef.current = null;
    if (!isDraggingRef.current && activePointersRef.current.size === 0) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      return;
    }
    if (activePointersRef.current.size > 0) return;
    const tappedId = pendingSelectRef.current;
    const tappedDistance = dragDistanceRef.current;
    isDraggingRef.current = false;
    pendingSelectRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (tappedId && tappedDistance <= 14) {
      const dog = frenchies.find((candidate) => candidate.id === tappedId);
      if (dog) onSelectDog(dog);
    }
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    zoomRef.current.target = clamp(
      zoomRef.current.target - e.deltaY * 0.0008,
      0.78,
      1.38
    );
  };

  const adjustZoom = (delta: number) => {
    zoomRef.current.target = clamp(zoomRef.current.target + delta, 0.78, 1.38);
  };

  const toggleTileFlip = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isModalOpen = selectedId !== null;

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={`isolate relative z-10 flex h-full w-full select-none items-center justify-center overflow-hidden touch-none cursor-grab active:cursor-grabbing transition-[filter,transform,opacity] duration-300 ease-out ${
        isModalOpen
          ? 'scale-[0.95] blur-md brightness-[0.36] pointer-events-none'
          : 'scale-100 blur-0 brightness-100'
      }`}
      aria-label="Interactive 3D Frenchie Sphere — drag to rotate, click a French Bulldog to inspect"
      aria-hidden={isModalOpen}
    >
      {/* Atmospheric Dual Orbital Halo Rings */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-full border transition-all duration-700 ${
          bloodlineSubject
            ? 'h-[370px] w-[370px] sm:h-[540px] sm:w-[540px] border-amethyst-400/40 shadow-[0_0_110px_rgba(164,16,185,0.28)]'
            : 'h-[340px] w-[340px] sm:h-[510px] sm:w-[510px] border-white/[0.07]'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-full border transition-all duration-700 ${
          bloodlineSubject
            ? 'h-[230px] w-[230px] sm:h-[340px] sm:w-[340px] border-seafoam-300/25'
            : 'h-[205px] w-[205px] sm:h-[300px] sm:w-[300px] border-seafoam-300/[0.09]'
        }`}
      />

      {/* Live 60fps Pedigree Constellation Beams (Bloodline Orbit Mode) */}
      {bloodlineSubject && orbitingRelatives.length > 0 && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <defs>
            <filter id="beam-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {orbitingRelatives.map((rel) => (
            <line
              key={rel.id}
              ref={(node) => {
                if (node) beamRefs.current.set(rel.id, node);
                else beamRefs.current.delete(rel.id);
              }}
              stroke={BEAM_COLORS[rel.role]}
              strokeWidth="2"
              strokeOpacity="0.72"
              filter="url(#beam-glow)"
              className="constellation-beam"
            />
          ))}
        </svg>
      )}

      {/* 3D Projected Frenchie Cards */}
      <div className="relative flex items-center justify-center">
        {frenchies.map((dog) => {
          const isSelected = selectedId === dog.id;
          const isPastLitter = Boolean(dog.pastLitter);
          const isFlipped = flippedIds.has(dog.id);
          const bloodlineRole = bloodlineSubject
            ? getBloodlineRole(bloodlineSubject, dog.id)
            : null;
          const isBloodlineSubject = bloodlineSubject?.id === dog.id;
          const isDimmedByFilter =
            !bloodlineSubject && !matchesFilter(dog, activeFilter);

          return (
            <div
              key={dog.id}
              ref={(node) => {
                if (node) tileRefs.current.set(dog.id, node);
                else tileRefs.current.delete(dog.id);
              }}
              onClick={() => {
                if (dragDistanceRef.current > 14) return;
                onSelectDog(dog);
              }}
              data-dog-id={dog.id}
              role="button"
              tabIndex={isModalOpen ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDog(dog);
                }
              }}
              aria-label={`${dog.name}, ${dog.coatColor} ${dog.gender}, ${dog.availability}`}
              className="sphere-tile perspective-1200 absolute -ml-[70px] -mt-[86px] h-[172px] w-[140px] sm:-ml-[86px] sm:-mt-[104px] sm:h-[208px] sm:w-[172px] focus:outline-none"
            >
              <div
                className={`preserve-3d relative h-full w-full rounded-2xl transition-transform duration-700 ease-out ${
                  isFlipped ? 'flip-y' : ''
                }`}
              >
                {/* FRONT FACE */}
                <div
                  className={`backface-hidden absolute inset-0 overflow-hidden rounded-2xl border bg-obsidian-900 shadow-glass transition-all duration-300 ${
                    isBloodlineSubject
                      ? 'border-seafoam-300 bloodline-subject-glow'
                      : isSelected
                        ? 'border-seafoam-300 ring-2 ring-seafoam-300/60 shadow-glow'
                        : bloodlineRole
                          ? 'border-amethyst-400/80 shadow-amethyst'
                          : 'border-white/15 hover:border-seafoam-300/60 hover:shadow-glow'
                  } ${isDimmedByFilter ? 'grayscale-[70%]' : ''}`}
                >
                  <img
                    src={dog.pastLitter ? dog.pastLitter.puppyPhoto : dog.photo}
                    alt={`${dog.name} — ${dog.coatColor} French Bulldog`}
                    draggable={false}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />

                  {/* Specular top hairline + deep bottom vignette */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-950/95 via-obsidian-950/20 to-white/[0.06]" />

                  {/* Top status / bloodline badge */}
                  <div className="absolute left-2 right-2 top-2 flex items-center justify-between gap-1">
                    {bloodlineRole ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow ${ROLE_STYLES[bloodlineRole]}`}
                      >
                        {bloodlineRole}
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                          dog.availability === 'Available Now'
                            ? 'bg-seafoam-300/20 text-seafoam-300 ring-1 ring-seafoam-300/45'
                            : dog.availability === 'Stud Service'
                              ? 'bg-amethyst-500/30 text-amethyst-400 ring-1 ring-amethyst-400/45'
                              : dog.availability === 'Past Litters'
                                ? 'bg-champagne-400/20 text-champagne-300 ring-1 ring-champagne-400/45'
                                : 'bg-white/10 text-white/85 ring-1 ring-white/20'
                        }`}
                      >
                        {dog.availability === 'Available Now'
                          ? 'Available'
                          : dog.availability === 'Stud Service'
                            ? 'Stud'
                            : dog.availability === 'Breeding Dam'
                              ? 'Dam'
                              : 'Past Litter'}
                      </span>
                    )}

                    {/* Subtle 3D Flip icon on Past Litter tiles */}
                    {isPastLitter && (
                      <button
                        type="button"
                        data-flip-trigger="true"
                        onClick={(e) => toggleTileFlip(e, dog.id)}
                        title="Flip: Then & Now"
                        aria-label={`Flip ${dog.name} Then and Now`}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-obsidian-950/80 text-champagne-300 ring-1 ring-champagne-400/60 backdrop-blur-md transition-transform duration-300 hover:scale-110 hover:bg-champagne-400 hover:text-obsidian-950"
                      >
                        <RotateCw className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Bottom nameplate */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-display text-sm font-bold tracking-tight text-white sm:text-base">
                        {dog.name}
                      </span>
                      <span className="font-mono text-[10px] text-white/70">
                        {dog.age}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-medium text-seafoam-300/90">
                      {dog.coatColor}
                    </p>
                  </div>
                </div>

                {/* BACK FACE (Past Litters — Grown-Up Adult + Owner Review) */}
                {dog.pastLitter && (
                  <div className="backface-hidden flip-y absolute inset-0 overflow-hidden rounded-2xl border border-champagne-400/70 bg-obsidian-900 shadow-glass">
                    <img
                      src={dog.pastLitter.adultPhoto}
                      alt={`${dog.name} grown up at ${dog.pastLitter.adultAgeLabel}`}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/65 to-obsidian-950/20" />

                    <div className="absolute left-2 right-2 top-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-champagne-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-obsidian-950">
                        <Sparkles className="h-2.5 w-2.5" />
                        Now &bull; {dog.pastLitter.adultAgeLabel}
                      </span>
                      <button
                        type="button"
                        data-flip-trigger="true"
                        onClick={(e) => toggleTileFlip(e, dog.id)}
                        title="Flip back to 8-week puppy"
                        aria-label={`Flip ${dog.name} back to puppy photo`}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-obsidian-950/85 text-white ring-1 ring-white/25 transition-transform hover:scale-110"
                      >
                        <RotateCw className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                      <p className="line-clamp-3 text-[10px] leading-snug text-white/95 italic">
                        &ldquo;{dog.pastLitter.ownerReview}&rdquo;
                      </p>
                      <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wider text-champagne-300">
                        {dog.pastLitter.ownerAttribution}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Orbit & Zoom HUD (bottom-right on desktop/tablet) */}
      <div className="fixed right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5">
        <button
          type="button"
          data-hud-control="true"
          onClick={() => setAutoSpin((prev) => !prev)}
          title={autoSpin ? 'Pause orbit' : 'Resume orbit'}
          aria-label={autoSpin ? 'Pause ambient orbit' : 'Resume ambient orbit'}
          className="flex h-11 w-11 items-center justify-center rounded-full glass-pill text-white/80 transition-colors hover:border-seafoam-300/50 hover:text-seafoam-300"
        >
          {autoSpin ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          data-hud-control="true"
          onClick={() => adjustZoom(0.14)}
          title="Zoom in"
          aria-label="Zoom in"
          className="flex h-11 w-11 items-center justify-center rounded-full glass-pill text-white/80 transition-colors hover:border-seafoam-300/50 hover:text-seafoam-300"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          data-hud-control="true"
          onClick={() => adjustZoom(-0.14)}
          title="Zoom out"
          aria-label="Zoom out"
          className="flex h-11 w-11 items-center justify-center rounded-full glass-pill text-white/80 transition-colors hover:border-seafoam-300/50 hover:text-seafoam-300"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Subtle interaction hint */}
      <div className="pointer-events-none fixed bottom-20 left-1/2 -translate-x-1/2 text-center sm:bottom-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
          {bloodlineSubject
            ? 'Drag to tilt • Tap a relative'
            : 'Drag to spin • Pinch to zoom • Tap a Frenchie'}
        </p>
      </div>
    </div>
  );
}
