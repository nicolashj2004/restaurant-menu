"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

/** Pixels of horizontal drag needed to advance one frame. Lower = more sensitive. Override via the `sensitivity` prop. */
const DEFAULT_SENSITIVITY = 6;
/** How long released inertia keeps spinning, and how fast it decays per frame. */
const INERTIA_DURATION_MS = 400;
const INERTIA_DECAY = 0.94;
/** Below this speed (frames per animation tick) a release doesn't bother spinning. */
const INERTIA_MIN_VELOCITY = 0.02;

export interface Product360ViewerProps {
  /** Frame URLs in angle order (e.g. 01.webp, 02.webp, ...). Any length works. */
  images: string[];
  alt?: string;
  /** Pixels of drag per frame step — smaller feels more responsive, larger feels heavier. */
  sensitivity?: number;
  className?: string;
}

function normalizeFrame(index: number, length: number): number {
  return ((Math.round(index) % length) + length) % length;
}

/**
 * A 360° product spinner: drag or swipe horizontally to rotate through an ordered
 * image sequence. Pointer Events drive mouse and touch through the same logic, the
 * frame swap is instant (no crossfade/carousel-style transition), and rotation wraps
 * around continuously in both directions.
 */
export function Product360Viewer({
  images,
  alt = "",
  sensitivity = DEFAULT_SENSITIVITY,
  className,
}: Product360ViewerProps) {
  const [frame, setFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const frameRef = useRef(0);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const velocity = useRef(0); // frames per ms, signed
  const inertiaRaf = useRef<number | null>(null);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  // Preload every frame up front so dragging never reveals a blank/loading image.
  useEffect(() => {
    const preloaded = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    return () => {
      preloaded.length = 0;
    };
  }, [images]);

  const stopInertia = useCallback(() => {
    if (inertiaRaf.current !== null) {
      cancelAnimationFrame(inertiaRaf.current);
      inertiaRaf.current = null;
    }
  }, []);

  useEffect(() => stopInertia, [stopInertia]);

  const setFrameClamped = useCallback(
    (next: number) => {
      const normalized = normalizeFrame(next, images.length);
      setFrame((prev) => (prev === normalized ? prev : normalized));
    },
    [images.length]
  );

  const runInertia = useCallback(
    (initialVelocity: number) => {
      let v = initialVelocity;
      let framePos = frameRef.current;
      const start = performance.now();
      const step = (now: number) => {
        if (now - start > INERTIA_DURATION_MS || Math.abs(v) < INERTIA_MIN_VELOCITY) {
          inertiaRaf.current = null;
          return;
        }
        framePos += v;
        v *= INERTIA_DECAY;
        setFrameClamped(framePos);
        inertiaRaf.current = requestAnimationFrame(step);
      };
      inertiaRaf.current = requestAnimationFrame(step);
    },
    [setFrameClamped]
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (images.length < 2) return;
      stopInertia();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStartX.current = e.clientX;
      dragStartFrame.current = frameRef.current;
      lastMoveX.current = e.clientX;
      lastMoveTime.current = performance.now();
      velocity.current = 0;
      setIsDragging(true);
    },
    [images.length, stopInertia]
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      setFrameClamped(dragStartFrame.current + Math.trunc(deltaX / sensitivity));

      const now = performance.now();
      const dt = now - lastMoveTime.current;
      if (dt > 0) {
        velocity.current = (e.clientX - lastMoveX.current) / sensitivity / dt; // frames per ms
      }
      lastMoveX.current = e.clientX;
      lastMoveTime.current = now;
    },
    [isDragging, sensitivity, setFrameClamped]
  );

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setIsDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      // ~16ms per animation frame — convert frames/ms into frames/tick for the inertia loop.
      const perTick = velocity.current * 16;
      if (Math.abs(perTick) > INERTIA_MIN_VELOCITY) runInertia(perTick);
    },
    [isDragging, runInertia]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        stopInertia();
        setFrameClamped(frameRef.current - 1);
      } else if (e.key === "ArrowRight") {
        stopInertia();
        setFrameClamped(frameRef.current + 1);
      }
    },
    [setFrameClamped, stopInertia]
  );

  if (images.length === 0) return null;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={alt || "Vista 360 grados, arrastra para girar"}
      aria-valuemin={0}
      aria-valuemax={images.length - 1}
      aria-valuenow={frame}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      style={{ touchAction: "pan-y" }}
      className={cn(
        "relative aspect-square w-full select-none overflow-hidden rounded-2xl bg-muted outline-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      {/* Plain <img>, not next/image: frames must swap the instant the browser-cached
          bytes from the preload effect are ready — routing each one through the image
          optimizer would add a request per frame and undercut that preload. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[frame]}
        alt={alt}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
  );
}
