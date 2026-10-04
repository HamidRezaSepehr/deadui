"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

export type SliderProps = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
>;

export function Slider({
  className,
  "aria-label": ariaLabel,
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-40",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-dead-800">
        <SliderPrimitive.Range className="absolute h-full bg-dead-red" />
      </SliderPrimitive.Track>
      {/* `aria-label` lands on the THUMB, not the root: the root is a plain
          span with no role, so a label there is ignored by assistive tech —
          `role="slider"` belongs to the thumb and is the element that needs
          naming. */}
      <SliderPrimitive.Thumb
        aria-label={ariaLabel}
        className="block size-4 rounded-full border border-dead-red bg-dead-50 shadow-lg shadow-black/50 transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red focus-visible:ring-offset-2 focus-visible:ring-offset-dead-950 disabled:pointer-events-none"
      />
    </SliderPrimitive.Root>
  );
}