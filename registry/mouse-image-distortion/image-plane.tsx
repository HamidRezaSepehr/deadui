"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAspect } from "@react-three/drei";
import * as THREE from "three";
import { vertex, fragment } from "./shader";
import { useMouse } from "./use-mouse";
import { useDimension } from "./use-dimension";
import type { DistortionItem } from "./mouse-image-distortion";

interface ImagePlaneProps {
  activeMenu: number | null;
  items: DistortionItem[];
}

export function ImagePlane({ activeMenu, items }: ImagePlaneProps) {
  const plane = useRef<any>(null);
  const { viewport, invalidate } = useThree();
  const dimension = useDimension();
  const mouse = useMouse();
  const texturesRef = useRef<THREE.Texture[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let mounted = true;
    Promise.all(
      items.map(
        (item) =>
          new Promise<THREE.Texture>((resolve) => {
            loader.load(
              item.imageUrl,
              (tex) => { if (mounted) resolve(tex); },
              undefined,
              () => {
                // fallback: create a blank texture
                const canvas = document.createElement("canvas");
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext("2d")!;
                ctx.fillStyle = "#333";
                ctx.fillRect(0, 0, 64, 64);
                const fallback = new THREE.CanvasTexture(canvas);
                if (mounted) resolve(fallback);
              },
            );
          }),
      ),
    ).then((textures) => {
      if (!mounted) return;
      texturesRef.current = textures;
      loadedRef.current = true;
      if (plane.current && textures[0]) {
        plane.current.material.uniforms.uTexture.value = textures[0];
      }
      invalidate();
    });
    return () => { mounted = false; };
  }, []); // only on mount

  const firstImage = items[0]?.imageUrl;
  const imgW = 1200;
  const imgH = 800;
  const scale = useAspect(imgW, imgH, 0.225);
  const targetAlpha = useRef(0);
  const currentAlpha = useRef(0);

  const smoothMouse = useRef({ x: 0, y: 0 });

  const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

  useEffect(() => {
    if (!plane.current || texturesRef.current.length === 0) return;
    if (activeMenu != null) {
      const tex = texturesRef.current[activeMenu];
      if (tex) plane.current.material.uniforms.uTexture.value = tex;
      targetAlpha.current = 1;
    } else {
      targetAlpha.current = 0;
    }
  }, [activeMenu]);

  const uniforms = useRef({
    uDelta: { value: { x: 0, y: 0 } },
    uAmplitude: { value: 0.0005 },
    uTexture: { value: new THREE.Texture() },
    uAlpha: { value: 0 },
  });

  useFrame(() => {
    if (!loadedRef.current) return;
    const { x, y } = mouse;
    const sx = smoothMouse.current.x;
    const sy = smoothMouse.current.y;

    if (Math.abs(x - sx) > 1) {
      smoothMouse.current.x = lerp(sx, x, 0.1);
      smoothMouse.current.y = lerp(sy, y, 0.1);
      plane.current.material.uniforms.uDelta.value = {
        x: x - sx,
        y: -1 * (y - sy),
      };
    }

    currentAlpha.current = lerp(
      currentAlpha.current,
      targetAlpha.current,
      0.08,
    );
    plane.current.material.uniforms.uAlpha.value = currentAlpha.current;

    const vw = viewport.width;
    const vh = viewport.height;
    const px =
      (smoothMouse.current.x / Math.max(dimension.width, 1)) * vw - vw / 2;
    const py =
      -((smoothMouse.current.y / Math.max(dimension.height, 1)) * vh) + vh / 2;
    plane.current.position.x = px;
    plane.current.position.y = py;

    invalidate();
  });

  return (
    <mesh ref={plane} scale={scale}>
      <planeGeometry args={[1, 1, 15, 15]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms.current}
        transparent
      />
    </mesh>
  );
}