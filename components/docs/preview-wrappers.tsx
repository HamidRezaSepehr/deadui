"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { GradientBorder } from "@/registry/gradient-border";
import { ImageTrail } from "@/registry/image-trail";
import { Marquee } from "@/registry/marquee";
import { ScrollScrub } from "@/registry/scroll-scrub";
import { SpotlightCard } from "@/registry/spotlight-card";
import { StaggeredGrid, StaggeredItem } from "@/registry/staggered-grid";
import type { StaggeredGridProps } from "@/registry/staggered-grid";

/**
 * Preview adapters for `<ComponentCustomizer>`.
 *
 * `ComponentCustomizer` takes the component to preview as a prop, and an MDX
 * page is a Server Component — a plain function defined in a `.mdx` file
 * cannot be serialised across that boundary ("Functions cannot be passed
 * directly to Client Components"). Every registry component *is* `'use client'`,
 * so those pass straight through; these wrappers cannot, so they live here, in
 * a client module, and the MDX pages import them like any other client export.
 *
 * Each wrapper exists for a concrete reason, and none of them changes what the
 * component does:
 *
 * 1. `boolean select` — the customizer generates a `select` for enum-like
 *    props, and a `select` can only emit strings. A control whose options are
 *    `["true", "false"]` therefore hands the preview the STRING `"false"`,
 *    which is truthy: the prop would do the exact opposite of the option the
 *    user picked. `toBool` accepts both spellings, so the initial boolean from
 *    `defaultProps` and the strings that follow it both land correctly.
 * 2. Required props the playground has no control for — `images` on the two
 *    trails. A demo image set is supplied here rather than in `defaultProps`,
 *    so each page's configuration stays exactly what the spec defines.
 * 3. `webgl-image-trail`'s prop is `distortionStrength` (renamed in Feature
 *    15b) while the docs control is labelled `distortion`. Mapped here so the
 *    control keeps its name.
 * 4. A resolved height for the two trails. Both are `h-full`, which collapses
 *    to zero inside the customizer's auto-height preview box, and a WebGL
 *    canvas with no size never renders.
 * 5. `staggered-grid` animates its *children*, so an empty preview would show
 *    nothing at all. A mock grid of `StaggeredItem`s stands in for real
 *    content, which is what the spec asks this page for.
 * 6. `gradient-border` renders `children` flush against its border ring, and
 *    that ring is 1-10px thick, so the label needs padding to stay legible.
 */

/** `true` and `"true"` both mean true; every other value is false. */
function toBool(value: unknown): boolean {
  return value === true || value === "true";
}

/** The six images both trail playgrounds cycle through. */
const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
];

/** Stand-in content for the staggered grid — one label per cell. */
const STAGGERED_CELLS = [
  "Aurora",
  "Basalt",
  "Cinder",
  "Dusk",
  "Ember",
  "Fathom",
  "Grove",
  "Halcyon",
  "Iris",
];

export function MarqueePreview({
  children,
  ...props
}: Record<string, unknown>) {
  return (
    <Marquee {...props} pauseOnHover={toBool(props.pauseOnHover)}>
      {children as ReactNode}
    </Marquee>
  );
}

export function SpotlightCardPreview({
  children,
  ...props
}: Record<string, unknown>) {
  return (
    <SpotlightCard {...props} enableTilt={toBool(props.enableTilt)}>
      {children as ReactNode}
    </SpotlightCard>
  );
}

export function ScrollScrubPreview(props: Record<string, unknown>) {
  return <ScrollScrub {...props} pin={toBool(props.pin)} />;
}

export function StaggeredGridPreview(props: Record<string, unknown>) {
  return (
    <StaggeredGrid
      variant={props.variant as StaggeredGridProps["variant"]}
      stagger={props.stagger as number}
      duration={props.duration as number}
      once={toBool(props.once)}
      containerClassName="grid w-full grid-cols-3 gap-3"
    >
      {STAGGERED_CELLS.map((cell) => (
        <StaggeredItem
          key={cell}
          className="flex min-h-[72px] items-center justify-center rounded-lg border border-dead-800 bg-dead-900 font-mono text-[10px] uppercase tracking-widest text-dead-400"
        >
          {cell}
        </StaggeredItem>
      ))}
    </StaggeredGrid>
  );
}

export function GradientBorderPreview(props: Record<string, unknown>) {
  return (
    <GradientBorder {...props}>
      <div className="px-10 py-6 text-center font-mono text-xs font-semibold uppercase tracking-[0.2em] text-dead-300">
        {props.children as ReactNode}
      </div>
    </GradientBorder>
  );
}

export function ImageTrailPreview(props: Record<string, unknown>) {
  return (
    <ImageTrail {...props} images={DEMO_IMAGES} className="h-[360px] w-full" />
  );
}

/**
 * `ssr: false` is load-bearing, not an optimisation.
 *
 * `WebGLImageTrail` probes for WebGL with `useState(detectWebGLSupport)`, and
 * that probe answers `false` wherever `document` is missing. Rendered on the
 * server it emits the `fallbackText` markup; on the client's hydration render
 * the same initializer answers `true` and emits a `<Canvas>` instead, so the
 * server HTML and the first client tree disagree. `ssr: false` renders a
 * loading box on the server and mounts the trail after hydration, which also
 * keeps `three` and R3F out of the docs bundle every other page shares.
 */
const LazyWebGLImageTrail = dynamic(
  () =>
    import("@/registry/pro/webgl-image-trail").then(
      (module) => module.WebGLImageTrail,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full rounded-xl bg-dead-900" />,
  },
);

export function WebGLImageTrailPreview(props: Record<string, unknown>) {
  const { distortion, ...rest } = props;

  return (
    <LazyWebGLImageTrail
      {...rest}
      images={DEMO_IMAGES}
      distortionStrength={Number(distortion)}
      className="h-[360px] w-full"
    />
  );
}