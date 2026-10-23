"use client";

import {
  useCallback,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

export interface GooeyRangeProps {
  /** Minimum value. Default: 0 */
  min?: number;
  /** Maximum value. Default: 100 */
  max?: number;
  /** Step increment. Default: 0.1 (matches the reference example). */
  step?: number;
  /** Controlled value. Omit to use internal state. */
  value?: number;
  /** Initial value when uncontrolled. Default: 50 */
  defaultValue?: number;
  /** Fired with the numeric value whenever the slider moves. */
  onChange?: (value: number) => void;
  /**
   * Tailwind background class for the track. The reference filter keeps only
   * the blue channel, so a blue track (`bg-[#0000ff]`) reproduces the
   * example's look exactly. Default: "bg-[#0000ff]"
   */
  color?: string;
  /** Diameter of the thumb and value bubble in pixels. Default: 28 */
  thumbSize?: number;
  /** How far the bubble pops up while dragging, in pixels. Default: 38 */
  popOffset?: number;
  /** `stdDeviation` of the gooey blur. Default: 8.6 (matches the reference). */
  gooeyBlur?: number;
  /** Accessible name for the underlying range input. Default: "Value" */
  ariaLabel?: string;
  className?: string;
}

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Gooey Range.
 *
 * Port of the reference "gooey range" snippet: the track, native thumb and value
 * bubble all live inside a container carrying an SVG `feGaussianBlur` +
 * `feColorMatrix` filter (`0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 20 -9`,
 * stdDeviation 8.6) + `feComposite atop`. The blur smears their alpha together
 * and the matrix re-thresholds it, so the bubble stays connected to the thumb
 * by a liquid bridge and "pops" upward while dragging. The matrix only keeps
 * the blue channel, which is what gives the reference its blue goo look.
 */
// Tailwind safelist — text color classes derived at runtime from the `color`
// prop must exist as literals somewhere in source so the scanner generates them.
const GOOEY_RANGE_TEXT_SAFELIST =
  "text-[#0000ff] text-blue-400 text-blue-500 text-blue-600 text-blue-700 text-blue-800 text-blue-900 text-emerald-500 text-violet-500 text-dead-red text-red-500";

export function GooeyRange({
  min = 0,
  max = 100,
  step = 0.1,
  value: controlledValue,
  defaultValue = 50,
  onChange,
  color = "bg-[#0000ff]",
  thumbSize = 28,
  popOffset = 38,
  gooeyBlur = 8.6,
  ariaLabel = "Value",
  className,
}: GooeyRangeProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);

  const rawId = useId();
  const filterId = `gooey-range-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const inputId = `gooey-range-input-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const range = max - min;
  const percentage = range === 0 ? 0 : ((value - min) / range) * 100;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = parseFloat(event.target.value);
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [controlledValue, onChange],
  );

  // Text color + shadow color both follow the track color (currentColor).
  const textColorClass = color.replace(/^bg-/, "text-");

  const thumbVars = useMemo<CSSVars>(
    () => ({ "--thumb-size": `${thumbSize}px` }),
    [thumbSize],
  );

  const trackHeight = 40;
  const bubbleTopRest = (trackHeight - thumbSize) / 2;

  const bubbleVars = useMemo<CSSVars>(
    () => ({
      width: `${thumbSize}px`,
      height: `${thumbSize}px`,
      lineHeight: `${thumbSize}px`,
      top: isDragging ? `-${popOffset}px` : `${bubbleTopRest}px`,
      left: `calc(${percentage}% - ${thumbSize / 2}px)`,
      boxShadow: isDragging
        ? "0 0 0 8px currentColor"
        : "0 0 0 4px currentColor",
      transition:
        "top 0.34s cubic-bezier(0.42, 0.05, 0.31, 1.36), box-shadow 0.14s",
    }),
    [thumbSize, isDragging, popOffset, percentage, bubbleTopRest],
  );

  const thumbMarginTop = (trackHeight - thumbSize) / 2;

  return (
    <div className={cn("relative w-full select-none", className)}>
      {/* Reference gooey filter: blue channel only, stdDeviation 8.6. */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className={cn("relative h-10 w-full rounded-full", color)}
        style={{ filter: `url(#${filterId})` }}
      >
        {/* 0 / 100 labels, gooed together with the track. */}
        <span
          className="pointer-events-none absolute left-[10px] top-0 font-medium text-[12px] leading-[40px] text-white/75"
        >
          0
        </span>
        <span
          className="pointer-events-none absolute right-[5px] top-0 font-medium text-[12px] leading-[40px] text-white/75"
        >
          100
        </span>

        <style>{`#${inputId}::-webkit-slider-thumb{margin-top:${thumbMarginTop}px} #${inputId}::-moz-range-thumb{margin-top:${thumbMarginTop}px}`}</style>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          onChange={handleChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerLeave={() => setIsDragging(false)}
          id={inputId}
          className={cn(
            "h-full w-full cursor-pointer appearance-none bg-transparent outline-none",
            "[&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:w-full",
            "[&::-moz-range-track]:h-full [&::-moz-range-track]:w-full",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/30",
            "[&::-webkit-slider-thumb]:h-[var(--thumb-size)] [&::-webkit-slider-thumb]:w-[var(--thumb-size)]",
            "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white/30",
            "[&::-moz-range-thumb]:h-[var(--thumb-size)] [&::-moz-range-thumb]:w-[var(--thumb-size)]",
            "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          )}
          style={thumbVars}
        />

        {/* Value bubble. */}
        <div
          className={cn(
            "pointer-events-none absolute flex items-center justify-center rounded-full bg-white font-bold",
            textColorClass,
          )}
          style={bubbleVars}
        >
          <span className="text-[10px] font-bold tabular-nums">
            {Math.round(value * 10) / 10}
          </span>
        </div>
      </div>
    </div>
  );
}
