/**
 * Sidebar hover previews.
 *
 * ONE COMPONENT PER FILE, barrel re-exported, per the file-naming and barrel
 * conventions in code-standards.md.
 *
 * ---- READ THIS BEFORE IMPORTING A `*Preview` NAME ----------------------------
 * There are two unrelated families of preview components in this codebase and
 * four names appear in BOTH:
 *
 *   - `components/docs/previews/` — what the sidebar shows on hover. Tiny,
 *     auto-playing, zero-prop, mount-on-hover, one fixed-size stage.
 *   - `components/docs/preview-wrappers.tsx` — adapters that let an MDX page
 *     hand a REAL registry component to `<ComponentCustomizer>`, forwarding the
 *     playground's props.
 *
 * `MarqueePreview`, `StaggeredGridPreview`, `GradientBorderPreview` and
 * `ImageTrailPreview` mean different things in the two. A sidebar preview takes
 * no props; a customizer adapter takes a `Record<string, unknown>` and forwards
 * it. Always import from an explicit path rather than reaching for whichever name
 * the editor autocompletes.
 * -----------------------------------------------------------------------------
 */
export { CinematicTextPreview } from "./cinematic-text-preview";
export { GradientBorderPreview } from "./gradient-border-preview";
export { ImageTrailPreview } from "./image-trail-preview";
export { MagneticButtonPreview } from "./magnetic-button-preview";
export { MarqueePreview } from "./marquee-preview";
export { RainbowButtonPreview } from "./rainbow-button-preview";
export { ScrollScrubPreview } from "./scroll-scrub-preview";
export { SpotlightCardPreview } from "./spotlight-card-preview";
export { StaggeredGridPreview } from "./staggered-grid-preview";
export { TextFillPreview } from "./text-fill-preview";
export { WebGLTrailPreview } from "./webgl-trail-preview";
export { PreviewStage } from "./preview-stage";
export type { PreviewStageProps } from "./preview-stage";