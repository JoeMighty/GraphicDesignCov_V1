"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const WORLD_SIZE = 3200;

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.5;
const FRICTION = 0.92;
const MIN_VELOCITY = 0.02;
const DRAG_THRESHOLD = 6;

function wrap(value: number, size: number) {
  return ((value % size) + size) % size;
}

export type Camera = { x: number; y: number; zoom: number };

/**
 * Drag-to-pan / wheel-and-pinch-to-zoom / toroidal-wrap camera for the
 * infinite canvas. Panning wraps the camera position modulo WORLD_SIZE —
 * combined with worldLayout's "nearest wrapped instance" placement, this
 * makes panning far enough in any direction loop back around seamlessly.
 */
export function useCanvasCamera() {
  const [camera, setCamera] = useState<Camera>({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, zoom: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragActive = useRef(false);
  const dragDistance = useRef(0);
  const draggedRef = useRef(false);
  const lastMoveTime = useRef(0);
  const velocity = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const panVelocityRef = useRef(0);

  const hasInteractedRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  function markInteracted() {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setHasInteracted(true);
    }
  }

  const applyPan = useCallback((dxScreen: number, dyScreen: number) => {
    setCamera((c) => ({
      ...c,
      x: wrap(c.x - dxScreen / c.zoom, WORLD_SIZE),
      y: wrap(c.y - dyScreen / c.zoom, WORLD_SIZE),
    }));
  }, []);

  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setCamera((c) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, c.zoom * factor));
      const worldX = c.x + (screenX - rect.left - cx) / c.zoom;
      const worldY = c.y + (screenY - rect.top - cy) / c.zoom;
      const nx = worldX - (screenX - rect.left - cx) / newZoom;
      const ny = worldY - (screenY - rect.top - cy) / newZoom;
      return { x: wrap(nx, WORLD_SIZE), y: wrap(ny, WORLD_SIZE), zoom: newZoom };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function stopInertia() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    function onPointerDown(e: PointerEvent) {
      try {
        el!.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture can fail for synthetic/edge-case pointer ids —
        // panning still works without it, just without capture-outside-
        // element guarantees.
      }
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      stopInertia();
      if (pointers.current.size === 1) {
        dragActive.current = true;
        dragDistance.current = 0;
        draggedRef.current = false;
        lastMoveTime.current = performance.now();
        velocity.current = { x: 0, y: 0 };
      }
    }

    function onPointerMove(e: PointerEvent) {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;

      if (pointers.current.size === 2) {
        const otherEntry = [...pointers.current.entries()].find(([id]) => id !== e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (!otherEntry) return;
        const otherPos = otherEntry[1];
        const oldMid = { x: (prev.x + otherPos.x) / 2, y: (prev.y + otherPos.y) / 2 };
        const newMid = { x: (e.clientX + otherPos.x) / 2, y: (e.clientY + otherPos.y) / 2 };
        const oldDist = Math.hypot(prev.x - otherPos.x, prev.y - otherPos.y);
        const newDist = Math.hypot(e.clientX - otherPos.x, e.clientY - otherPos.y);
        markInteracted();
        applyPan(newMid.x - oldMid.x, newMid.y - oldMid.y);
        if (oldDist > 0) zoomAt(newMid.x, newMid.y, newDist / oldDist);
        return;
      }

      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!dragActive.current) return;

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      dragDistance.current += Math.hypot(dx, dy);
      if (dragDistance.current > DRAG_THRESHOLD) draggedRef.current = true;

      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime.current);
      velocity.current = { x: dx / dt, y: dy / dt };
      lastMoveTime.current = now;

      if (draggedRef.current) {
        markInteracted();
        applyPan(dx, dy);
      }
    }

    function onPointerUp(e: PointerEvent) {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size > 0) return;
      dragActive.current = false;
      if (!draggedRef.current) return;

      function coast() {
        velocity.current.x *= FRICTION;
        velocity.current.y *= FRICTION;
        const speed = Math.hypot(velocity.current.x, velocity.current.y);
        panVelocityRef.current = Math.min(1, speed * 25);
        if (speed < MIN_VELOCITY) {
          panVelocityRef.current = 0;
          rafRef.current = null;
          return;
        }
        applyPan(velocity.current.x * 16, velocity.current.y * 16);
        rafRef.current = requestAnimationFrame(coast);
      }
      rafRef.current = requestAnimationFrame(coast);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      markInteracted();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(e.clientX, e.clientY, factor);
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
      stopInertia();
    };
  }, [applyPan, zoomAt]);

  // Called from each piece's onClick to distinguish a tap from the end of a
  // drag — resets itself so it only ever suppresses the one click.
  const consumeDragFlag = useCallback(() => {
    const was = draggedRef.current;
    draggedRef.current = false;
    return was;
  }, []);

  return { camera, containerRef, hasInteracted, consumeDragFlag, panVelocityRef };
}
