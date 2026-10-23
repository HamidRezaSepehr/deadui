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
  /** Step increment. Default: 1 */
  step?: number;
  /** Controlled value. Omit to use internal state. */
  value?: number;
  /** Initial value when uncontrolled. Default: 50 */
  defaultValue?: number;
  /** Fired with the numeric value whenever the slider moves. */
  onChange?: (value: number) => void;
  /**
   * Tailwind background class for the track. Any color works because the gooey
   * matrix re-thresholds alpha only, leaving RGB untouched. Default: "bg-dead-red"
   */
  color?: string;
  /** Diameter of the thumb and value bubble in pixels. Default: 28 */
  thumbSize?: number;
  /** How far the bubble pops up while dragging, in pixels. Default: 38 */
  popOffset?: number;
  /** `stdDeviation` of the gooey blur. Default: 8 */
  gooeyBlur?: number;
  /** Accessible name for the underlying range input. Default: "Value" */
  ariaLabel?: string;
  className?: string;
}

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Gooey Range.
 *
 * The track, native thumb and value bubble all live inside a container carrying
 * an SVG `feGaussianBlur` + `feColorMatrix` filter. The blur smears their alpha
 * together and the matrix re-thresholds it, so the bubble stays connected to the
 * thumb by a liquid bridge while it pops up on drag. Because the matrix only
 * touches alpha, the effect is color-agnostic: pass any Tailwind `bg-*` class.
 */
export function GooeyRange({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 50,
  onChange,
  color = "bg-dead-red",
  thumbSize = 28,
  popOffset = 38,
  gooeyBlur = 8,
  ariaLabel = "Value",
  className,
}: GooeyRangeProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);

  const rawId = useId();
  const filterId = `gooey-range-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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

  const thumbVars = useMemo<CSSVars>(
    () => ({ "--thumb-size": `${thumbSize}px` }),
    [thumbSize],
  );

  const bubbleVars = useMemo<CSSVars>(
    () => ({
      width: `${thumbSize}px`,
      height: `${thumbSize}px`,
      lineHeight: `${thumbSize}px`,
      top: isDragging ? `-${popOffset}px` : `${(40 - thumbSize) / 2}px`,
      left: `calc(${percentage}% - ${thumbSize / 2}px)`,
    }),
    [thumbSize, isDragging, popOffset, percentage],
  );

  return (
    <div className={cn("relative w-full select-none", className)}>
      {/* Color-agnostic gooey filter: alpha is re-thresholded, RGB is preserved. */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
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
          className={cn(
            "h-full w-full cursor-pointer appearance-none bg-transparent outline-none",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/40",
            "[&::-webkit-slider-thumb]:h-[var(--thumb-size)] [&::-webkit-slider-thumb]:w-[var(--thumb-size)]",
            "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white/40",
            "[&::-moz-range-thumb]:h-[var(--thumb-size)] [&::-moz-range-thumb]:w-[var(--thumb-size)]",
            "focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          )}
          style={thumbVars}
        />

        {/* Value bubble: tracked to the thumb and popped up on drag. */}
        <div
          className={cn(
            "pointer-events-none absolute flex items-center justify-center rounded-full bg-white font-bold text-black transition-all duration-300 ease-out",
            isDragging
              ? "shadow-[0_0_0_8px_rgba(255,255,255,0.35)]"
              : "shadow-[0_0_0_4px_rgba(255,255,255,0.5)]",
          )}
          style={bubbleVars}
        >
          <span className="text-xs tabular-nums">{Math.round(value * 10) / 10}</span>
        </div>
      </div>
    </div>
  );
}
