"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { cn } from "@/lib/utils";
import { ImagePlane } from "./image-plane";

export interface DistortionItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
}

export interface MouseImageDistortionProps {
  items: DistortionItem[];
  className?: string;
}

export function MouseImageDistortion({
  items,
  className,
}: MouseImageDistortionProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  return (
    <div className={cn("relative", className)}>
      <div className="fixed inset-0 -z-10">
        <Canvas dpr={[1, 2]}>
            <ImagePlane activeMenu={activeMenu} items={items} />
          </Canvas>
      </div>

      <div
        className="relative z-10 mix-blend-difference text-white"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <ul className="border-b">
          {items.map((item, i) => (
            <li
              key={item.id}
              onMouseOver={() => setActiveMenu(i)}
              className="cursor-pointer border-t p-5 text-[4vw] font-bold"
            >
              <p>{item.title}</p>
              {item.subtitle && (
                <p className="text-sm opacity-60 font-normal">{item.subtitle}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}