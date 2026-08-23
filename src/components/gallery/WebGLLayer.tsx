"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import { LensDistortionEffect } from "postprocessing";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shader";
import type { GalleryItem } from "./types";

type Props = {
  items: GalleryItem[];
  slotRefs: React.RefObject<Map<string, HTMLElement>>;
  hoveredId: string | null;
  velocityRef: React.RefObject<number>;
};

function ImagePlane({
  item,
  getEl,
  hovered,
  velocityRef,
}: {
  item: GalleryItem;
  getEl: () => HTMLElement | null;
  hovered: boolean;
  velocityRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const hoverValue = useRef(0);
  const texture = useTexture(item.thumb_url);

  useEffect(() => {
    // three.js textures are mutable stateful objects by design; setting
    // colorSpace after load is the standard R3F/drei pattern.
    // eslint-disable-next-line react-hooks/immutability
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame((state, delta) => {
    const el = getEl();
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!el || !mesh || !material) return;

    // getBoundingClientRect is transform-aware, so it reflects the canvas's
    // current pan/zoom — using it (rather than offsetWidth/Height) is what
    // lets the mesh scale correctly as the world zooms in and out.
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;

    hoverValue.current = THREE.MathUtils.damp(hoverValue.current, hovered ? 1 : 0, 5, delta);

    const { innerWidth, innerHeight } = window;
    const pop = 1 + hoverValue.current * 0.08;
    mesh.position.x = rect.left + rect.width / 2 - innerWidth / 2;
    mesh.position.y = -(rect.top + rect.height / 2 - innerHeight / 2);
    mesh.scale.set(rect.width * pop, rect.height * pop, 1);

    const targetSkew = (velocityRef.current ?? 0) * 0.15;

    material.uniforms.uHover.value = hoverValue.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uVelocity.value = THREE.MathUtils.damp(
      material.uniforms.uVelocity.value,
      targetSkew,
      8,
      delta
    );
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 24, 24]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uHover: { value: 0 },
          uTime: { value: 0 },
          uVelocity: { value: 0 },
        }}
        transparent
      />
    </mesh>
  );
}

function Scene({ items, slotRefs, hoveredId, velocityRef }: Props) {
  return (
    <>
      {items.map((item) => (
        <ImagePlane
          key={item.id}
          item={item}
          hovered={hoveredId === item.id}
          velocityRef={velocityRef}
          getEl={() => slotRefs.current.get(item.id) ?? null}
        />
      ))}
    </>
  );
}

function Curvature() {
  // Reverse (pincushion) distortion — negative values pinch inward instead
  // of bulging outward — kept gentle to keep artwork legible.
  const effect = useMemo(
    () =>
      new LensDistortionEffect({
        distortion: new THREE.Vector2(-0.06, -0.06),
        principalPoint: new THREE.Vector2(0, 0),
        focalLength: new THREE.Vector2(1, 1),
      }),
    []
  );
  return <primitive object={effect} />;
}

export default function WebGLLayer(props: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <Canvas
        orthographic
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 100], near: 0.1, far: 1000, zoom: 1 }}
        // r3f sets pointer-events: auto on its own internal wrapper by
        // default (for its raycasting/event system), which otherwise
        // silently overrides the pointer-events-none on the div above and
        // swallows all drag/click input meant for the canvas beneath it.
        style={{ pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
        <EffectComposer>
          <Curvature />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
