"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shader";
import { rotationDegForIndex } from "./layout";
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
  rotationDeg,
  hovered,
  velocityRef,
}: {
  item: GalleryItem;
  getEl: () => HTMLElement | null;
  rotationDeg: number;
  hovered: boolean;
  velocityRef: React.RefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const hoverValue = useRef(0);
  const texture = useTexture(item.thumb_url);
  const rotationRad = THREE.MathUtils.degToRad(rotationDeg);

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
    if (!el || !mesh || !material || el.offsetWidth === 0) {
      if (mesh) mesh.visible = false;
      return;
    }
    mesh.visible = true;

    // getBoundingClientRect() is transform-aware, so its center point stays
    // correct even though the element is CSS-rotated (a center-origin
    // rotation doesn't move the centroid). offsetWidth/Height, unlike the
    // rect's width/height, are NOT transform-aware — they give the true,
    // unrotated box size, which is what the mesh geometry needs.
    const rect = el.getBoundingClientRect();
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    hoverValue.current = THREE.MathUtils.damp(hoverValue.current, hovered ? 1 : 0, 5, delta);

    const { innerWidth, innerHeight } = window;
    const pop = 1 + hoverValue.current * 0.08;
    mesh.position.x = rect.left + rect.width / 2 - innerWidth / 2;
    mesh.position.y = -(rect.top + rect.height / 2 - innerHeight / 2);
    mesh.rotation.z = rotationRad;
    mesh.scale.set(width * pop, height * pop, 1);

    const rawVelocity = velocityRef.current ?? 0;
    const targetSkew = (THREE.MathUtils.clamp(rawVelocity, -80, 80) * 0.35) / width;

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
      {items.map((item, i) => (
        <ImagePlane
          key={item.id}
          item={item}
          rotationDeg={rotationDegForIndex(i)}
          hovered={hoveredId === item.id}
          velocityRef={velocityRef}
          getEl={() => slotRefs.current.get(item.id) ?? null}
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
