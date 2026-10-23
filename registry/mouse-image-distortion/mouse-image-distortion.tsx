"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export interface DistortionItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
}

export interface MouseImageDistortionProps {
  items: DistortionItem[];
  velocityMultiplier?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageBorderRadius?: string;
  textColor?: string;
  textSize?: string;
  rowPadding?: string;
  rowBorderColor?: string;
  rowHoverBgColor?: string;
  className?: string;
}

export function MouseImageDistortion({
  items,
  velocityMultiplier = 0.05,
  imageWidth = 300,
  imageHeight = 200,
  imageBorderRadius = "12px",
  textColor = "text-foreground",
  textSize = "text-4xl",
  rowPadding = "py-6",
  rowBorderColor = "border-border",
  rowHoverBgColor = "bg-muted/50",
  className,
}: MouseImageDistortionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth cursor following
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Velocity calculation for distortion
  const velocityX = useVelocity(smoothX);
  const velocityY = useVelocity(smoothY);

  // Transform velocity into skew and scale values
  const skewX = useTransform(velocityX, [-1000, 1000], [-15, 15]);
  const skewY = useTransform(velocityY, [-1000, 1000], [-15, 15]);
  const scale = useTransform(
    [velocityX, velocityY],
    ([vx, vy]) =>
      1 + Math.min(Math.abs(vx as number) + Math.abs(vy as number), 500) * (velocityMultiplier / 100),
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const currentItem = items.find((item) => item.id === hoveredId);

  return (
    <div className={cn("relative w-full", className)} onMouseMove={handleMouseMove}>
      {/* Floating Image Layer */}
      {currentItem && (
        <motion.div
          className="pointer-events-none fixed z-50 overflow-hidden"
          style={{
            x: smoothX,
            y: smoothY,
            translateX: "-50%",
            translateY: "-50%",
            width: imageWidth,
            height: imageHeight,
            skewX,
            skewY,
            scale,
          }}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentItem.imageUrl})`,
              borderRadius: imageBorderRadius,
            }}
          />
        </motion.div>
      )}

      {/* Text List Layer */}
      <div className="relative z-10 flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "group relative flex flex-col cursor-pointer border-b transition-colors duration-300",
              rowPadding,
              rowBorderColor,
              hoveredId === item.id ? rowHoverBgColor : "bg-transparent",
            )}
          >
            <h3 className={cn("font-bold transition-colors duration-300", textSize, textColor)}>
              {item.title}
            </h3>
            {item.subtitle && (
              <p className={cn("text-sm transition-colors duration-300", textColor, "opacity-60")}>
                {item.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
