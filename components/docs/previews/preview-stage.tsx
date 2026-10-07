import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PreviewStageProps {
  children: ReactNode;
  className?: string;
}

/**
 * The fixed-size surface every sidebar hover preview renders into.
 *
 * An explicit height is load-bearing, not decoration: these previews mount
 * inside a floating box whose height is fixed so it cannot push the layout, and
 * several of the effects below are absolutely positioned or animate only
 * `transform` / `filter`, so without a declared height they would collapse to
 * zero and animate nothing. The grid pattern is the one ui-context.md asks for on
 * preview surfaces.
 */
export function PreviewStage({ children, className }: PreviewStageProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-preview-grid p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}