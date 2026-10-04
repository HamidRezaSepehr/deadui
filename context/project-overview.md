# Dead UI — Awwwards-Grade Animation Library for React

## Overview

Dead UI is a CLI-driven, copy-paste animation component
library for React and Next.js. It abstracts complex,
award-winning web animation patterns (GSAP scroll effects,
WebGL shaders, cinematic text reveals, parallax galleries)
into production-ready components that developers can install
in under 10 seconds via a single terminal command.

The library solves the gap between "I want my site to look
like an Awwwards winner" and "I don't have 3 weeks to learn
GSAP ScrollTrigger, Three.js shaders, and Lenis smooth
scrolling from scratch."

Dead UI is not a generic UI component library (buttons,
inputs, tables). It is exclusively focused on motion,
scroll-driven effects, micro-interactions, and WebGL
visual effects.

## Goals

1. **Dead Simple DX**: A developer runs one CLI command
   and gets a fully working, typed, customizable animation
   component in their project. No config files, no setup
   wizards, no boilerplate.
2. **Awwwards-Grade Quality**: Every component must look
   and feel like it belongs on a CSS Design Awards or
   Codrops showcase. No generic fades or simple opacity
   transitions.
3. **60fps Performance**: All animations must maintain
   60fps on mid-range hardware. No layout shifts (CLS = 0).
   Prefer GPU-accelerated properties (transform, opacity).
4. **Variant-Driven**: Every component ships with multiple
   visual variants (e.g., a text reveal with `blur-in`,
   `fade-up`, `slide-stagger` variants) using
   `class-variance-authority` (cva).
5. **Zero Monthly Cost**: The entire infrastructure
   (docs, landing page, registry, CLI) runs on free tiers
   (Vercel Hobby, GitHub, npm).

## Core User Flow

1. Developer discovers Dead UI via social media, blog,
   or word of mouth.
2. Developer visits deadui.dev and sees jaw-dropping
   live demos of every component.
3. Developer runs `npx deadui@latest add cinematic-text`
   in their Next.js project.
4. CLI detects their framework, installs missing peer
   dependencies (gsap, lenis), and copies the component
   file + any required hooks/utilities into their
   `components/ui/` folder.
5. Developer imports the component, drops it into their
   page, and it works immediately.
6. Developer customizes via props (variant, duration,
   delay, className) or by editing the copied source.
7. Developer wants a Pro component (e.g., WebGL Image
   Trail), purchases a license, and unlocks it via
   `npx deadui@latest add webgl-image-trail --pro`.

## Features

### CLI & Developer Experience
- **One-Command Install**: `npx deadui@latest add <component>`
- **Auto-Detection**: Detects Next.js App Router vs Pages
  Router vs Vite vs Remix and adjusts file paths.
- **Auto-Dependency Install**: Prompts to install missing
  peer deps (gsap, lenis, framer-motion, three,
  @react-three/fiber, @react-three/drei).
- **Registry-Based**: Components are fetched from a
  structured `registry.json` that maps component names
  to file paths, dependencies, and variants.

### Free Components (8)
1. **Cinematic Text Reveal**: GSAP SplitText + ScrollTrigger.
   Variants: `blur-in`, `fade-up`, `slide-stagger`, `scale-pop`.
2. **Magnetic Elastic Button**: Framer Motion spring physics.
   Variants: `default`, `outline`, `glow`, `ghost`.
   Sizes: `sm`, `md`, `lg`. Shapes: `rounded`, `soft`, `sharp`.
3. **Infinite Blur Marquee**: CSS animation + gradient masks.
   Variants: `horizontal`, `vertical`, `diagonal`.
   Speeds: `slow`, `normal`, `fast`.
4. **Spotlight Hover Card**: Mouse-tracking radial gradient.
   Variants: `default`, `border-glow`, `tilt-3d`.
5. **Scroll-Linked Image Scrub**: GSAP ScrollTrigger scrub.
   Variants: `fade`, `zoom`, `rotate`, `blur`.
6. **Staggered Grid Reveal**: IntersectionObserver + GSAP.
   Variants: `fade-up`, `scale-in`, `flip`, `slide-left`.
7. **Gradient Border Glow**: Pure CSS conic-gradient animation.
   Variants: `rainbow`, `pulse`, `rotate`, `subtle`.
8. **CSS Image Trail**: Cursor-following image trail in plain
   DOM — `motion/react` + CSS transforms only, no WebGL.
   Effects: `fade-scale`, `rotate-scale`, `3d-rotate`,
   `blur-fade`, `clip-circle`, `skew-fade`.
   The Free-tier counterpart to Pro component 8 below; the
   two are the same idea at two tiers and therefore share
   the catalog number 8 (the disambiguated index lives in
   the Component Status table in `progress-tracker.md`:
   8 = WebGL trail, 8b = CSS trail).

### Pro Components (3)
8. **WebGL Liquid Image Trail**: React Three Fiber + custom
   shaders. Cursor-following image trail with fluid distortion.
   Variants: `liquid`, `pixelate`, `dissolve`.
9. **Horizontal Parallax Pin Gallery**: GSAP ScrollTrigger
   pin + multi-layer parallax. Variants: `deep`, `subtle`, `cards`.
10. **3D Perspective Card Stack**: GSAP + CSS 3D transforms.
    Scroll-driven fan-out with realistic shadows.
    Variants: `fan`, `cascade`, `flip-through`.

### Documentation & Showcase
- **Live Interactive Previews**: Every component page has
  a working demo with variant toggle buttons.
- **Props Table**: Auto-generated from TypeScript interfaces.
- **Copy-Paste Code**: Full source shown for free components.
- **Dark/Light Toggle**: Preview components in both modes.
- **Performance Badge**: Each component shows its bundle
  size and Lighthouse impact score.

## Scope

### In Scope
- React 18+ / Next.js 13+ (App Router) components.
- TypeScript-first with full type exports.
- Tailwind CSS for all styling.
- CLI published to npm as `deadui`.
- Documentation site built with native `@next/mdx` on Next.js
  (no separate docs framework).
- Landing page as part of the docs site.
- GitHub-based component registry (public repo for free,
  private repo or gated access for Pro).

### Out of Scope
- Vue, Svelte, Angular, or vanilla JS support (future).
- WordPress plugin (future).
- Visual/no-code editor.
- Figma plugin.
- Backend/API services beyond license validation.
- Component composition system (e.g., combining multiple
  effects into one).

## Success Criteria

1. **10-Second Install**: A developer can go from zero
   to a working Cinematic Text Reveal on their page in
   under 10 seconds using only the CLI.
2. **Zero CLS**: Every component passes Lighthouse with
   0 Cumulative Layout Shift.
3. **60fps**: Every animation maintains 60fps on a
   mid-range laptop (tested via Chrome DevTools).
4. **Variant Coverage**: Every component ships with at
   least 3 visual variants accessible via props.
5. **Type Safety**: All components export typed props
   interfaces. No `any` types in public API.
6. **Docs Completeness**: Every component has a live
   preview, props table, install command, and usage
   example in the documentation.