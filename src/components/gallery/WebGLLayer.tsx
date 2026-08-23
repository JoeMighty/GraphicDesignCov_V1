"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
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
  getRect,
  hovered,
  velocityRef,
}: {
  item: GalleryItem;
  getRect: () => DOMRect | null;
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
    const rect = getRect();
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!rect || !mesh || !material || rect.width === 0) {
      if (mesh) mesh.visible = false;
      return;
    }
    mesh.visible = true;

    const { innerWidth, innerHeight } = window;
    mesh.position.x = rect.left + rect.width / 2 - innerWidth / 2;
    mesh.position.y = -(rect.top + rect.height / 2 - innerHeight / 2);
    mesh.scale.set(rect.width, rect.height, 1);

    hoverValue.current = THREE.MathUtils.damp(hoverValue.current, hovered ? 1 : 0, 6, delta);

    const rawVelocity = velocityRef.current ?? 0;
    const targetSkew = THREE.MathUtils.clamp(rawVelocity, -80, 80) * 0.35 / rect.width;

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
          getRect={() => slotRefs.current.get(item.id)?.getBoundingClientRect() ?? null}
        />
      ))}
    </>
  );
}

export default function WebGLLayer(props: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <Canvas
        orthographic
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 100], near: 0.1, far: 1000, zoom: 1 }}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
