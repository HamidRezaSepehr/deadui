"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, useAspect } from "@react-three/drei";
import * as THREE from "three";
import { animate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DistortionItem {
  id?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
}

export interface MouseImageDistortionProps {
  items: DistortionItem[];
  className?: string;
}

// --- Vertex / Fragment shaders (from the reference) ---
const vertexShader = `
varying vec2 vUv;
uniform vec2 uDelta;
uniform float uAmplitude;
float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  vec3 newPosition = position;
  newPosition.x += sin(uv.y * PI) * uDelta.x * uAmplitude;
  newPosition.y += sin(uv.x * PI) * uDelta.y * uAmplitude;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uAlpha;
void main() {
  vec3 texture = texture2D(uTexture, vUv).rgb;
  gl_FragColor = vec4(texture, uAlpha);
}
`;

// --- Hooks (ported from the reference) ---
function useMouse() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return mouse;
}

function useDimension() {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return dimension;
}

// --- 3D Model ---
function Model({ items, activeMenu }: { items: DistortionItem[]; activeMenu: number | null }) {
  const plane = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const dimension = useDimension();
  const mouse = useMouse();
  const opacity = useMotionValue(0);

  const textures = useTexture(items.map((item) => item.imageUrl));

  const { width, height } = (textures[0]?.image as { width: number; height: number }) ?? { width: 1, height: 1 };

  const scale = useAspect(width, height, 0.225);

  const smoothMouse = useRef({ x: useMotionValue(0), y: useMotionValue(0) });

  const uniforms = useRef({
    uDelta: { value: { x: 0, y: 0 } },
    uAmplitude: { value: 0.0005 },
    uTexture: { value: textures[0] },
    uAlpha: { value: 0 },
  });

  useEffect(() => {
    if (activeMenu !== null && activeMenu >= 0 && activeMenu < textures.length) {
      uniforms.current.uTexture.value = textures[activeMenu];
      animate(opacity, 1, {
        duration: 0.2,
        onUpdate: (latest) => {
          uniforms.current.uAlpha.value = latest;
        },
      });
    } else {
      animate(opacity, 0, {
        duration: 0.2,
        onUpdate: (latest) => {
          uniforms.current.uAlpha.value = latest;
        },
      });
    }
  }, [activeMenu, textures, opacity]);

  const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

  useFrame(() => {
    const mesh = plane.current;
    if (!mesh) return;
    const { x, y } = mouse;
    const smoothX = smoothMouse.current.x.get();
    const smoothY = smoothMouse.current.y.get();

    if (Math.abs(x - smoothX) > 1) {
      smoothMouse.current.x.set(lerp(smoothX, x, 0.1));
      smoothMouse.current.y.set(lerp(smoothY, y, 0.1));
      uniforms.current.uDelta.value = {
        x: x - smoothX,
        y: -1 * (y - smoothY),
      };
    }

    if (dimension.width > 0) {
      const nx = smoothMouse.current.x.get() / dimension.width;
      const ny = smoothMouse.current.y.get() / dimension.height;
      mesh.position.x = (nx - 0.5) * viewport.width;
      mesh.position.y = (0.5 - ny) * viewport.height;

    }
  });

  return (
    <mesh ref={plane} scale={scale}>
      <planeGeometry args={[1, 1, 15, 15]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
      />
    </mesh>
  );
}

// --- Scene ---
function Scene({ items, activeMenu }: { items: DistortionItem[]; activeMenu: number | null }) {
  return (
    <div className="fixed top-0 left-0 h-screen w-full pointer-events-none">
      <Canvas>
        <Model items={items} activeMenu={activeMenu} />
      </Canvas>
    </div>
  );
}

// --- Projects list ---
function Projects({
  items,
  activeMenu,
  setActiveMenu,
}: {
  items: DistortionItem[];
  activeMenu: number | null;
  setActiveMenu: (i: number | null) => void;
}) {
  return (
    <div className="relative z-10 mix-blend-difference text-white w-full">
      <ul className="border-b border-white/20">
        {items.map((project, i) => (
          <li
            key={project.id ?? project.title}
            onMouseEnter={() => setActiveMenu(i)}
            onMouseLeave={() => setActiveMenu(null)}
            className="text-[4vw] p-5 border-t border-white/20 cursor-pointer"
          >
            <p>{project.title}</p>
            {project.subtitle && (
              <p className="text-[1.2vw] opacity-60">{project.subtitle}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MouseImageDistortion({ items, className }: MouseImageDistortionProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  return (
    <div className={cn("relative w-full min-h-screen", className)}>
      <Projects items={items} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <Scene items={items} activeMenu={activeMenu} />
    </div>
  );
}
