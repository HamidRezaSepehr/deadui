"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface PaintRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  brushSize?: number;
  overlayColor?: string;
}

export function PaintReveal({
  children,
  brushSize = 40,
  overlayColor = "#000000",
  className,
  ...props
}: PaintRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeAndFill = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, width, height);

      setIsReady(true);
    };

    resizeAndFill();
    window.addEventListener("resize", resizeAndFill);

    return () => window.removeEventListener("resize", resizeAndFill);
  }, [overlayColor]);

  // Handle painting interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isReady) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastX: number | null = null;
    let lastY: number | null = null;

    const paintAt = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (lastX === null || lastY === null) {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();

      lastX = x;
      lastY = y;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      paintAt(x, y);
    };

    const resetLast = () => {
      lastX = null;
      lastY = null;
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("touchmove", handleMove, { passive: true });
    container.addEventListener("mouseleave", resetLast);
    container.addEventListener("touchend", resetLast);
    container.addEventListener("touchcancel", resetLast);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("touchmove", handleMove);
      container.removeEventListener("mouseleave", resetLast);
      container.removeEventListener("touchend", resetLast);
      container.removeEventListener("touchcancel", resetLast);
    };
  }, [isReady, brushSize]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="relative z-0">{children}</div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 cursor-crosshair touch-none"
      />
    </div>
  );
}
