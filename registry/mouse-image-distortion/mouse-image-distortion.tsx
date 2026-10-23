"use client";

import React, { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useVelocity, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export interface MouseImageDistortionProps {
  imageSrc?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageBorderRadius?: number;
  textColor?: string;
  textSize?: number;
  rowPadding?: number;
  rowBorderColor?: string;
  rowHoverBgColor?: string;
  velocityMultiplier?: number;
  className?: string;
}

export function MouseImageDistortion({
  imageSrc = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  imageWidth = 240,
  imageHeight = 320,
  imageBorderRadius = 24,
  textColor = "text-white",
  textSize = 28,
  rowPadding = 16,
  rowBorderColor = "border-dead-800",
  rowHoverBgColor = "hover:bg-dead-900",
  velocityMultiplier = 1,
  className,
}: MouseImageDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const vx = useVelocity(rawX);
  const vy = useVelocity(rawY);
  const xSpring = useSpring(rawX, { stiffness: 140, damping: 18 });
  const ySpring = useSpring(rawY, { stiffness: 140, damping: 18 });

  const x = useTransform(xSpring, (v) => v);
  const y = useTransform(ySpring, (v) => v);
  const scale = useTransform(xSpring, (v) => 1 + Math.abs(v) * velocityMultiplier * 0.005);
  const skewX = useTransform(xSpring, (v) => Math.max(-18, Math.min(18, v * velocityMultiplier * 0.0008)));
  const skewY = useTransform(ySpring, (v) => Math.max(-18, Math.min(18, v * velocityMultiplier * 0.0008)));

  const imgX = useTransform(x, (v) => v - imageWidth / 2);
  const imgY = useTransform(y, (v) => v - imageHeight / 2);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      rawX.set(e.clientX - rect.left - imageWidth / 2);
      rawY.set(e.clientY - rect.top - imageHeight / 2);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [imageWidth, imageHeight]);

  const rows = [
    "Richard Gaston",
    "KangHee Kim",
    "Inka and Niclas",
    "Arch McLeish",
    "Nadir Bucan",
    "Chandler Bondurant",
    "Arianna Lago",
  ];

  return (
    <div
      ref={containerRef}
      className={cn("relative h-[420px] w-full overflow-hidden rounded-xl border border-dead-800 bg-dead-900", className)}
    >
      <motion.div
        className="fixed z-20 overflow-hidden"
        style={{
          x: imgX,
          y: imgY,
          width: imageWidth,
          height: imageHeight,
          borderRadius: imageBorderRadius,
          scale,
          skewX,
          skewY,
        }}
      >
        <img
          src={imageSrc}
          alt="mouse distortion"
          className="h-full w-full object-cover"
        />
      </motion.div>

      <div className="relative z-10">
        {rows.map((title, index) => (
          <div
            key={title}
            className={cn(
              "flex items-center border-b border-dead-800 px-4 text-nowrap font-mono text-xl",
              textColor,
              rowHoverBgColor,
              index === 0 ? "" : "",
            )}
            style={{ fontSize: textSize }}
          >
            {title}
          </div>
        ))}
      </div>
    </div>
  );
}
