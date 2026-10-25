"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useCallback, useState } from "react";
import createGlobe from "cobe";
import { Heart, Star, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { GradientBorder } from "@/registry/gradient-border";
import { ImageTrail } from "@/registry/image-trail";
import { Marquee } from "@/registry/marquee";
import { ScrollScrub } from "@/registry/scroll-scrub";
import { SpotlightCard } from "@/registry/spotlight-card";
import { StaggeredGrid, StaggeredItem } from "@/registry/staggered-grid";
import type { StaggeredGridProps } from "@/registry/staggered-grid";
import { Dock, DockIcon } from "@/registry/dock";
import { AvatarCircles } from "@/registry/avatar-circles";
import { Orbit, OrbitingCircles, OrbitItem } from "@/registry/orbiting-circles";
import { ScrollProgress } from "@/registry/scroll-progress";
import {
  ShuffleText,
  type ShuffleRevealDirection,
  type ShuffleTrigger,
} from "@/registry/shuffle-text";
import { SpinningText } from "@/registry/spinning-text";
import { MorphingText } from "@/registry/morphing-text";
import { GooeyMenu } from "@/registry/gooey";
import { GooeyInput } from "@/registry/gooey";
import { GooeyPagination } from "@/registry/gooey";
import { GooeyRange } from "@/registry/gooey";
import { Typewriter } from "@/registry/typewriter";
import {
  TextAnnotation,
  TextAnnotationGroup,
  type AnnotationType,
} from "@/registry/text-annotation";

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
 * 7. `click-effect` is scoped to the preview panel with `scope="parent"`, so a
 *    burst renders inside the box at the exact click point (and is clipped by
 *    it) instead of firing on every click anywhere in the docs.
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
  const direction = props.direction === "vertical" ? "vertical" : "horizontal";

  // A vertical strip is clipped to the component's fixed `h-[500px]` stage, so
  // its track has to be taller than that stage *plus* one spare period for the
  // seamless wrap. The page's single-line demo string can't do that — it renders
  // as one stubby band with an empty box under it and a loop that only travels
  // its own line-height. So vertical gets explicit chips (split out of the same
  // demo string) and enough `repeat` copies to fill the stage.
  if (direction === "vertical") {
    const parsed = String(children ?? "")
      .split("★")
      .map((part) => part.trim())
      .filter(Boolean);
    const labels =
      parsed.length > 1
        ? parsed
        : ["Dead UI", "Simple Animations", "React Components"];

    return (
      <Marquee
        {...props}
        direction="vertical"
        repeat={6}
        gap={16}
        itemClassName="items-center"
        pauseOnHover={toBool(props.pauseOnHover)}
        reverse={toBool(props.reverse)}
        scrollLinked={toBool(props.scrollLinked)}
        scrollVelocity={toBool(props.scrollVelocity)}
      >
        {labels.map((label) => (
          <span
            key={label}
            className="flex h-[56px] w-[220px] shrink-0 items-center justify-center rounded-md border border-dead-800 bg-dead-900 font-mono text-xs uppercase tracking-[0.2em] text-dead-300"
          >
            {label}
          </span>
        ))}
      </Marquee>
    );
  }

  return (
    <Marquee
      {...props}
      pauseOnHover={toBool(props.pauseOnHover)}
      reverse={toBool(props.reverse)}
      scrollLinked={toBool(props.scrollLinked)}
      scrollVelocity={toBool(props.scrollVelocity)}
    >
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
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-mono text-[11px] leading-relaxed text-dead-400">
        Scroll inside the panel to scrub the media.
      </p>
      <div className="relative h-[420px] w-full overflow-y-auto overscroll-contain rounded-lg border border-dead-800 bg-dead-950">
        <ScrollScrub
          {...props}
          className="h-[1400px] pt-16"
          pin={toBool(props.pin)}
        />
      </div>
    </div>
  );
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

const LazyClickEffect = dynamic(
  () => import("@/registry/click-effect").then((module) => module.ClickEffect),
  { ssr: false },
);

export function ClickEffectPreview(props: Record<string, unknown>) {
  const variant = (typeof props.variant === 'string' ? props.variant : 'virethos') as import('@/registry/click-effect').ClickEffectVariant

  // `scope="parent"` ties the listener to this wrapper's own container — the
  // customizer's `relative` + `overflow-hidden` preview box — so the effect
  // fires only for clicks inside the panel and lands exactly on the pointer.
  return (
    <>
      <p className="pointer-events-none select-none text-center font-mono text-[11px] uppercase tracking-[0.2em] text-dead-500">
        Click anywhere in this panel
      </p>
      <LazyClickEffect variant={variant} scope="parent" />
    </>
  )
}

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

/**
 * `ssr: false` for the same reason as `WebGLImageTrail` above: the component
 * mounts a R3F `<Canvas>` that only exists in the browser, so a server render
 * would emit placeholder markup and the hydration render would replace it.
 */
const LazyMouseLensEffect = dynamic(
  () =>
    import("@/registry/pro/mouse-lens-effect").then(
      (module) => module.MouseLensEffect,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[500px] w-full rounded-xl bg-dead-900" />,
  },
);

/** The rose pair the lens playground reveals. */
const LENS_OUTSIDE =
  "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=1200&q=80&sat=-100";
const LENS_INSIDE =
  "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=1200&q=80";

export function MouseLensEffectPreview(props: Record<string, unknown>) {
  return (
    <LazyMouseLensEffect
      srcOutside={LENS_OUTSIDE}
      srcInside={LENS_INSIDE}
      squareSize={Number(props.squareSize) || 0.3}
      lensDistortion={Number(props.lensDistortion) || 0.2}
      rgbShiftIntensity={Number(props.rgbShiftIntensity) || 0.015}
      mouseEasing={Number(props.mouseEasing) || 0.08}
      className="h-[500px] w-full"
    />
  );
}

export function AvatarCirclesPreview(props: Record<string, unknown>) {
  const avatars = [
    { name: "Alice", imageUrl: "https://i.pravatar.cc/150?u=alice" },
    { name: "Bob", imageUrl: "https://i.pravatar.cc/150?u=bob" },
    { name: "Carol", imageUrl: "https://i.pravatar.cc/150?u=carol" },
    { name: "Dave", imageUrl: "https://i.pravatar.cc/150?u=dave" },
  ];

  return (
    <AvatarCircles
      avatars={avatars}
      numPeople={12}
      size={props.size as 'sm' | 'md' | 'lg' | 'xl'}
      overlap={props.overlap as number}
      radius={props.radius as 'sm' | 'md' | 'lg' | 'full'}
    />
  );
}

// The customizer needs something to orbit: the playground exposes Orbit props
// (`radius`, `duration`, `reverse`, `path`) but has no control for the items
// themselves, so a fixed 3-icon ring stands in — same demo on every config.
const ORBIT_DEMO_ICONS = [
  { Icon: Zap, angle: 0 },
  { Icon: Heart, angle: 120 },
  { Icon: Star, angle: 240 },
];

export function OrbitingCirclesPreview(props: Record<string, unknown>) {
  return (
    <OrbitingCircles>
      <Orbit
        radius={Number(props.radius) || 110}
        duration={Number(props.duration) || 20}
        reverse={toBool(props.reverse)}
        path={toBool(props.path)}
      >
        {ORBIT_DEMO_ICONS.map(({ Icon, angle }) => (
          <OrbitItem key={angle} angle={angle}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dead-800 bg-dead-900 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
              <Icon size={22} strokeWidth={1.5} />
            </div>
          </OrbitItem>
        ))}
      </Orbit>
    </OrbitingCircles>
  );
}

export function ScrollProgressPreview(props: Record<string, unknown>) {
  const colorStyle = props.colorStyle as string
  const customColor = props.customColor as string
  const resolvedColor = colorStyle === "custom" ? customColor : colorStyle

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-mono text-[11px] leading-relaxed text-dead-400">
        Scroll inside the panel below to see the progress indicator respond to the
        container&apos;s own scroll position.
      </p>
      <div className="relative h-[420px] w-full overflow-y-auto overscroll-contain rounded-lg border border-dead-800 bg-dead-950">
        <ScrollProgress
          variant={props.variant as "horizontal" | "circular"}
          color={resolvedColor}
          showPercentage={toBool(props.showPercentage)}
          size={Number(props.size) || 48}
          strokeWidth={Number(props.strokeWidth) || 4}
          className={props.variant === "circular" ? "top-4 right-4" : "bg-dead-900/60"}
        />
        <div className="flex flex-col gap-6 p-8 pb-12">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex h-[160px] items-center justify-center rounded-lg border border-dead-800 bg-dead-900"
            >
              <span className="font-mono text-sm text-dead-500">
                Section {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SpinningTextPreview(props: Record<string, unknown>) {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <SpinningText
        text="SPIN • DEAD • UI • "
        className="h-64 w-64"
        duration={Number(props.duration) || 10}
        direction={(props.direction as "clockwise" | "counter-clockwise") || "clockwise"}
      />
    </div>
  );
}

/**
 * `MorphingText`'s `texts` prop is a required array the customizer has no
 * control for, so the demo words are supplied here. `filterBlur` is a CSS
 * length on the component but a plain number of pixels on the slider — a
 * slider can only emit numbers, and the component needs `"2px"`, so the
 * conversion happens here rather than in the component.
 */
export function MorphingTextPreview(props: Record<string, unknown>) {
  const num = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return (
    <div className="flex min-h-[300px] w-full items-center justify-center px-4">
      <MorphingText
        texts={["MORPH", "LIQUID", "GLOW", "DEAD"]}
        morphTime={num(props.morphTime, 1.5)}
        cooldownTime={num(props.cooldownTime, 0.5)}
        threshold={num(props.threshold, -140)}
        filterBlur={`${num(props.filterBlur, 0.6)}px`}
        className="text-[2.5rem] md:text-[3.5rem]"
      />
    </div>
  );
}

/**
 * `GooeyMenu`'s `items` prop is a required array the customizer has no control
 * for, so the demo satellites are supplied here. `direction` is the only control.
 */
export function GooeyMenuPreview(props: Record<string, unknown>) {
  const direction = (props.direction as
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "radial") || "top";
  const speed = Number(props.speed);
  const resolvedSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  const distance = Number(props.distance);
  const resolvedDistance = Number.isFinite(distance) && distance >= 0 ? distance : 80;
  const items = [
    { icon: <span className="text-xs">A</span>, label: "Alpha" },
    { icon: <span className="text-xs">B</span>, label: "Bravo" },
    { icon: <span className="text-xs">C</span>, label: "Charlie" },
    { icon: <span className="text-xs">D</span>, label: "Delta" },
  ];
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <GooeyMenu items={items} direction={direction} speed={resolvedSpeed} distance={resolvedDistance} />
    </div>
  );
}

/**
 * `GooeyInput`'s controls map straight through.
 */
export function GooeyInputPreview(props: Record<string, unknown>) {
  const direction = props.direction === "right" ? "right" : "left";
  const speed = Number(props.speed);
  const resolvedSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <GooeyInput
        direction={direction}
        speed={resolvedSpeed}
        collapsedWidth={Number(props.collapsedWidth) || 130}
        expandedWidth={Number(props.expandedWidth) || 200}
        expandedOffset={Number(props.expandedOffset) || 50}
        gooeyBlur={Number(props.gooeyBlur) || 8}
        placeholder={(props.placeholder as string) || "Type to search..."}
      />
    </div>
  );
}

/**
 * `GooeyPagination` is interactive, so the preview keeps its own `currentPage`
 * state (seeded once from the `currentPage` prop) and lets the user click
 * through the dots; the rendered page is clamped so shrinking `totalPages`
 * cannot strand it out of range.
 */
export function GooeyPaginationPreview(props: Record<string, unknown>) {
  const totalPages = Math.max(1, Number(props.totalPages) || 6);
  const [page, setPage] = useState(() =>
    Math.min(Math.max(1, Number(props.currentPage) || 1), totalPages)
  );
  const safePage = Math.min(page, totalPages);
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <GooeyPagination
        totalPages={totalPages}
        currentPage={safePage}
        onPageChange={setPage}
        activeSize={Number(props.activeSize) || 48}
        inactiveSize={Number(props.inactiveSize) || 20}
        gap={Number(props.gap) || 16}
        gooeyBlur={Number(props.gooeyBlur) || 8}
        speed={Number(props.speed) || 1}
      />
    </div>
  );
}

/**
 * `GooeyRange` is interactive, so the preview owns the value (seeded once from
 * `defaultValue`) and forwards it as a controlled prop. That way dragging
 * updates the bubble in the panel.
 */
export function GooeyRangePreview(props: Record<string, unknown>) {
  const min = Number.isFinite(Number(props.min)) ? Number(props.min) : 0;
  const max = Number.isFinite(Number(props.max)) ? Number(props.max) : 100;
  const defaultValue = Number(props.defaultValue);
  const [value, setValue] = useState(() =>
    Number.isFinite(defaultValue) ? defaultValue : 50
  );

  const color =
    typeof props.color === "string" && props.color ? props.color : "bg-[#0000ff]";

  return (
    <div className="flex min-h-[300px] w-full items-center justify-center px-2">
      <div className="w-full max-w-md">
        <GooeyRange
          min={min}
          max={max}
          step={Number.isFinite(Number(props.step)) ? Number(props.step) : 1}
          value={value}
          onChange={setValue}
          color={color}
          thumbSize={
            Number.isFinite(Number(props.thumbSize)) ? Number(props.thumbSize) : 28
          }
          popOffset={
            Number.isFinite(Number(props.popOffset)) ? Number(props.popOffset) : 38
          }
          gooeyBlur={
            Number.isFinite(Number(props.gooeyBlur)) ? Number(props.gooeyBlur) : 8.6
          }
        />
      </div>
    </div>
  );
}

/**
 * `TextAnnotation`'s defining behaviour is a one-shot reveal — invisible until
 * its SVG is drawn — so an empty `inView` playground would look broken before
 * the user scrolled to it. The customizer's preview box is on screen the moment
 * the page mounts, so the demo runs with the manual `show` control instead and
 * a group row shows the nested-registration path.
 *
 * `triggerOnce` is a string-valued boolean control and is coerced here for the
 * same reason `toBool` exists for the marquee.
 */
export function TextAnnotationPreview(props: Record<string, unknown>) {
  const type: AnnotationType = (props.type as AnnotationType) || "underline";
  const show = toBool(props.show ?? true);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <p className="text-3xl text-dead-100">
        <TextAnnotation
          type={type}
          show={show}
          color={props.color as string}
          iterations={Number(props.iterations) || undefined}
          strokeWidth={Number(props.strokeWidth) || undefined}
          padding={Number(props.padding) || undefined}
          animationDuration={Number(props.animationDuration) || 1500}
        >
          Hand-drawn annotations
        </TextAnnotation>
      </p>

      <p className="max-w-xl text-center text-base leading-loose text-dead-300">
        Annotations can be grouped —{" "}
        <TextAnnotationGroup>
          <TextAnnotation type="highlight" color="#ef4444">
            sequenced
          </TextAnnotation>{" "}
          <TextAnnotation type="underline" color="#34d399">
            automatically
          </TextAnnotation>{" "}
          <TextAnnotation type="circle" color="#60a5fa">
            in order
          </TextAnnotation>
        </TextAnnotationGroup>
        .
      </p>
    </div>
  );
}

const DOCK_DEMO_ICONS: { Icon: typeof Zap; label: string }[] = [
  { Icon: Zap, label: "Lightning" },
  { Icon: Heart, label: "Favourite" },
  { Icon: Star, label: "Bookmark" },
  { Icon: Zap, label: "Zap" },
  { Icon: Heart, label: "Heart" },
];

export function DockPreview(props: Record<string, unknown>) {
  const iconSize = Number(props.iconSize) || 40
  const iconMagnification = Number(props.iconMagnification) || 60
  const iconDistance = Number(props.iconDistance) || 140
  const direction = (props.direction as "top" | "middle" | "bottom") || "middle"

  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <Dock
        iconSize={iconSize}
        iconMagnification={iconMagnification}
        iconDistance={iconDistance}
        direction={direction}
      >
        {DOCK_DEMO_ICONS.map(({ Icon, label }, i) => (
          <DockIcon key={i} tooltip={label}>
            <Icon size={24} strokeWidth={1.5} />
          </DockIcon>
        ))}
      </Dock>
    </div>
  );
}

/**
 * `Typewriter`'s `loop` is a string-valued boolean control (the customizer's
 * select can only emit strings), so `toBool` coerces it — the same reason the
 * marquee adapter needs it. The cursor sizing props arrive as strings by
 * design: they are CSS lengths (`"4px"`, `"1.2em"`), and a slider would hand
 * over a bare number the component must not receive.
 */
export function TypewriterPreview(props: Record<string, unknown>) {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center px-4">
      <Typewriter
        text={(props.text as string) || "Make it move."}
        delay={Number(props.delay) || 50}
        loop={toBool(props.loop ?? true)}
        cursor={(props.cursor as string) || "|"}
        cursorColor={(props.cursorColor as string) || "currentColor"}
        cursorWidth={(props.cursorWidth as string) || "2px"}
        cursorHeight={(props.cursorHeight as string) || "1em"}
        className="text-center text-2xl font-semibold md:text-3xl"
      />
    </div>
  );
}

/**
 * `ShuffleText`'s `useOriginalCharsOnly` is a string-valued boolean control
 * (the customizer's select can only emit strings), so `toBool` coerces it — the
 * same reason the marquee and typewriter adapters need it. The `trigger` and
 * `revealDirection` selects already emit strings, which are exactly what those
 * two unions are.
 */
export function ShuffleTextPreview(props: Record<string, unknown>) {
  const characters = props.characters as string | undefined

  return (
    <div className="flex min-h-[300px] w-full items-center justify-center px-4">
      <ShuffleText
        text={(props.text as string) || "Dead UI"}
        trigger={(props.trigger as ShuffleTrigger) || "load"}
        iterations={Number(props.iterations) || 10}
        revealDirection={
          (props.revealDirection as ShuffleRevealDirection) || "start"
        }
        characters={characters && characters !== "(default)" ? characters : undefined}
        useOriginalCharsOnly={toBool(props.useOriginalCharsOnly)}
        fps={Number(props.fps) || 30}
        className="text-center text-3xl font-bold tracking-tight"
      />
    </div>
  );
}

export function GlobeDocsPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dead-800 bg-dead-50 p-6">
      <div className="mx-auto max-w-sm">
        <DocsGlobe />
      </div>
    </div>
  );
}

function DocsGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    isPausedRef.current = false
  }, [])

  const markers = [
    { id: "sf", location: [37.7595, -122.4367] as [number, number], label: "San Francisco" },
    { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
    { id: "tokyo", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
    { id: "london", location: [51.5074, -0.1278] as [number, number], label: "London" },
    { id: "sydney", location: [-33.8688, 151.2093] as [number, number], label: "Sydney" },
    { id: "dubai", location: [25.2048, 55.2708] as [number, number], label: "Dubai" },
    { id: "paris", location: [48.8566, 2.3522] as [number, number], label: "Paris" },
  ]

  const arcs = [
    { id: "sf-tokyo", from: [37.7595, -122.4367] as [number, number], to: [35.6762, 139.6503] as [number, number] },
    { id: "nyc-london", from: [40.7128, -74.006] as [number, number], to: [51.5074, -0.1278] as [number, number] },
  ]

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: [1, 1, 1],
        markerColor: [0.3, 0.45, 0.85],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0.01,
        markers: markers.map((m) => ({ location: m.location, size: 0.025, id: m.id })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: [0.3, 0.45, 0.85],
        arcWidth: 0.5,
        arcHeight: 0.25,
      })

      function animate() {
        if (!isPausedRef.current) phi += 0.005
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, arcs])

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className="aspect-square w-full cursor-grab rounded-full"
      style={{ touchAction: "none" }}
/>
  )
}

/**
 * `ssr: false` because this component mounts an R3F `<Canvas>` that only exists
 * in the browser. A server render would emit stale placeholder markup, causing
 * a hydration mismatch on every load.
 */
const LazyMouseImageDistortion = dynamic(
  () =>
    import("@/registry/mouse-image-distortion").then(
      (module) => module.MouseImageDistortion,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full rounded-xl bg-dead-900" />,
  },
)

export function MouseImageDistortionPreview(props: Record<string, unknown>) {
  const items = [
    { title: "Richard Gaston", subtitle: "Creative Direction", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80" },
    { title: "KangHee Kim", subtitle: "Photography", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80" },
    { title: "Inka & Niclas", subtitle: "Art Direction", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80" },
    { title: "Arch McLeish", subtitle: "Motion", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80" },
    { title: "Nadir Bucan", subtitle: "Editing", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80" },
  ]
  return (
    <LazyMouseImageDistortion
      items={items}
      amplitude={Number(props.amplitude) || 0.0005}
      smoothingFactor={Number(props.smoothingFactor) || 0.1}
      imageScale={Number(props.imageScale) || 0.225}
      fadeDuration={Number(props.fadeDuration) || 0.2}
      geometrySegments={Number(props.geometrySegments) || 15}
      textColor={(props.textColor as string) || "text-white"}
      textFont={(props.textFont as string) || undefined}
      rowPaddingTop={(props.rowPaddingTop as string) || "pt-5"}
      rowPaddingRight={(props.rowPaddingRight as string) || "pr-5"}
      rowPaddingBottom={(props.rowPaddingBottom as string) || "pb-5"}
      rowPaddingLeft={(props.rowPaddingLeft as string) || "pl-5"}
      rowBorderSide={(props.rowBorderSide as string) || "t"}
      rowBorderColor={(props.rowBorderColor as string) || "border-white/20"}
      rowBorderStyle={(props.rowBorderStyle as string) || "solid"}
      bgClassName={(props.bgClassName as string) || "bg-black"}
      subtitleClassName={(props.subtitleClassName as string) || "text-sm opacity-60"}
      className={(props.className as string) || undefined}
    />
  )
}

/**
 * `ssr: false` because this component mounts a `motion.div` that uses
 * `useMotionValue`/`useSpring` which are client-only. A server render would
 * emit stale placeholder markup, causing a hydration mismatch on every load.
 */
const LazyMaskCursor = dynamic(
  () =>
    import("@/registry/mask-cursor").then(
      (module) => module.MaskCursor,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full rounded-xl bg-dead-900" />,
  },
)

export function MaskCursorPreview(props: Record<string, unknown>) {
  return (
    <LazyMaskCursor
      containerClassName="min-h-[360px] rounded-3xl border border-white/10 bg-zinc-500 p-6"
      contentClassName="max-w-[520px] p-8 text-center text-3xl leading-tight md:text-5xl"
      baseColor={(props.baseColor as string) || "#ffffff"}
      maskColor={(props.maskColor as string) || "#000000"}
      maskBackground={(props.maskBackground as string) || "transparent"}
      circleSize={Number(props.circleSize) || 40}
      hoverCircleSize={Number(props.hoverCircleSize) || 360}
      positionStiffness={Number(props.positionStiffness) || 120}
      positionDamping={Number(props.positionDamping) || 20}
      positionMass={Number(props.positionMass) || 0.4}
      sizeStiffness={Number(props.sizeStiffness) || 120}
      sizeDamping={Number(props.sizeDamping) || 14}
      sizeMass={Number(props.sizeMass) || 1}
      expandOnHotspot={props.expandOnHotspot !== "false"}
      maskImage={(props.maskImage as string) || undefined}
    >
      <p>
        Hover inside to activate the circle. Hover the{" "}
        <a href="#" data-mask-hotspot className="underline decoration-2 underline-offset-4">
          hotspot link
        </a>
        .
      </p>
    </LazyMaskCursor>
  )
}

/**
 * `ssr: false` because this component mounts a `<canvas>` that uses
 * `requestAnimationFrame` and window listeners which are client-only.
 * A server render would emit stale placeholder markup, causing
 * a hydration mismatch on every load.
 */
const LazyDrawingCursor = dynamic(
  () =>
    import("@/registry/drawing-cursor").then(
      (module) => module.DrawingCursor,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full rounded-xl bg-dead-900" />,
  },
)

export function DrawingCursorPreview(props: Record<string, unknown>) {
  return (
    <div className="relative h-[360px] w-full rounded-xl bg-dead-900 overflow-hidden">
      <LazyDrawingCursor
        fit="parent"
        color={(props.color as string) || "#ffffff"}
        colorTail={(props.colorTail as string) || undefined}
        pointsNumber={Number(props.pointsNumber) || 40}
        spring={Number(props.spring) || 0.4}
        friction={Number(props.friction) || 0.5}
        widthFactor={Number(props.widthFactor) || 0.3}
        headSpringFactor={Number(props.headSpringFactor) || 0.4}
        idleMotion={props.idleMotion !== "false"}
        resumeIdleAfterMs={props.resumeIdleAfterMs ? Number(props.resumeIdleAfterMs) : undefined}
        respectDevicePixelRatio={props.respectDevicePixelRatio !== "false"}
      />
      <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
        Hover inside — click the button to prove it never blocks clicks
      </div>
      <button
        type="button"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
      >
        Click me (cursor never blocks me)
      </button>
    </div>
  )
}
/**
 * `ssr: false` because this component mounts an `<svg>` that uses
 * `requestAnimationFrame` and window listeners which are client-only.
 * A server render would emit stale placeholder markup, causing
 * a hydration mismatch on every load.
 */
const LazyCursorTrail = dynamic(
  () =>
    import("@/registry/cursor-trail").then(
      (module) => module.CursorTrail,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[360px] w-full rounded-xl bg-dead-900" />,
  },
)

export function CursorTrailPreview(props: Record<string, unknown>) {
  // Default trails - each can have its own color
  const defaultTrails = [
    { color: "cyan", length: 30 },
    { color: "yellow", length: 20 },
    { color: "orange", length: 10 },
  ]

  // Determine trails based on props
  let trails: any[]
  if (props.trails) {
    trails = props.trails as any[]
  } else if (props.color1 !== undefined || props.color2 !== undefined || props.color3 !== undefined) {
    // Individual color controls for each default trail
    trails = [
      { color: (props.color1 as string) || "cyan", length: Number(props.length1) || 30 },
      { color: (props.color2 as string) || "yellow", length: Number(props.length2) || 20 },
      { color: (props.color3 as string) || "orange", length: Number(props.length3) || 10 },
    ]
  } else if (props.color !== undefined) {
    // Single custom color - use as single trail
    trails = [{ color: (props.color as string) || "white", length: Number(props.length) || 20 }]
  } else {
    // Default preset
    trails = [
      { color: "cyan", length: 30 },
      { color: "yellow", length: 20 },
      { color: "orange", length: 10 },
    ]
  }

  return (
    <div className="relative h-[360px] w-full rounded-xl bg-dead-900 overflow-hidden">
      <LazyCursorTrail
        fit="parent"
        trails={trails}
        ease={Number(props.ease) || 0.7}
        strokeWidth={Number(props.strokeWidth) || 60}
        linecap={(props.linecap as any) || "round"}
        opacity={Number(props.opacity) || 1}
        blendMode={(props.blendMode as string) || undefined}
        disabled={props.disabled === "true"}
      />
      <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm pointer-events-none">
        Move pointer to see the trail
      </div>
    </div>
  )
}
