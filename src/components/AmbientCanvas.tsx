import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';

interface AmbientCanvasProps {
  velocityRef: MutableRefObject<{ x: number; y: number }>;
  isBloodlineMode: boolean;
}

const TINTS = ['bg-seafoam-300', 'bg-amethyst-400', 'bg-champagne-400'] as const;

/**
 * Atmospheric star field that parallaxes with sphere drag.
 * DOM only — this is a kennel site, not a game canvas.
 */
export function AmbientCanvas({
  velocityRef,
  isBloodlineMode,
}: AmbientCanvasProps) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const bloodlineRef = useRef(isBloodlineMode);

  useEffect(() => {
    bloodlineRef.current = isBloodlineMode;
  }, [isBloodlineMode]);

  const stars = useMemo(
    () =>
      Array.from({ length: 54 }, (_, idx) => ({
        id: idx,
        left: `${(idx * 37.7) % 100}%`,
        top: `${(idx * 19.3 + (idx % 7) * 6) % 100}%`,
        size: 1.4 + (idx % 4) * 0.7,
        tint: TINTS[idx % TINTS.length],
        opacity: 0.22 + (idx % 5) * 0.1,
        duration: 14 + (idx % 8) * 3,
      })),
    []
  );

  useEffect(() => {
    let rafId = 0;
    let ox = 0;
    let oy = 0;
    const tick = () => {
      ox += velocityRef.current.y * 18;
      oy += -velocityRef.current.x * 18;
      ox *= 0.96;
      oy *= 0.96;
      const boost = bloodlineRef.current ? 1.35 : 1;
      const node = layerRef.current;
      if (node) {
        node.style.transform = `translate3d(${(ox * boost).toFixed(2)}px, ${(oy * boost).toFixed(2)}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [velocityRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div ref={layerRef} className="absolute -inset-8">
        {stars.map((star) => (
          <span
            key={star.id}
            className={`absolute rounded-full ${star.tint}`}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
