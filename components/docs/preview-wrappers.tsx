"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useCallback } from "react";
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
import { SpinningText } from "@/registry/spinning-text";
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

export function GlobeDocsPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dead-800 bg-dead-50 p-6">
      <DocsGlobe />
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
      className="h-64 w-full cursor-grab rounded-full"
      style={{ touchAction: "none" }}
    />
  )
}