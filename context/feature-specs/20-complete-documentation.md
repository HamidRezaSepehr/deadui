# Feature 20: Complete Component Documentation (MDX)

## Overview

Batch-create the MDX documentation pages for the remaining 9 components in the Dead UI library. We will use the `<ComponentCustomizer>` and `<InstallTabs>` components built in Feature 19 to ensure a consistent, highly interactive documentation experience across the entire library.

## Goals

1. Create 9 distinct MDX pages in `app/docs/components/[component-name]/page.mdx`.
2. Configure the `<ComponentCustomizer>` for each component with accurate `defaultProps` and `controls` objects so users can interactively tweak props.
3. Clearly distinguish Free vs. Pro components in the documentation header.
4. Ensure all imports, syntax highlighting, and layout structures are consistent.

## Standard MDX Template

Every documentation page MUST follow this exact structure:

```mdx
import { ComponentName } from '@/registry/component-name'
import { ComponentCustomizer } from '@/components/docs/component-customizer'
import { InstallTabs } from '@/components/docs/install-tabs'

# Component Title

Brief one-sentence description of the component.

## Preview

<ComponentCustomizer 
  component={ComponentName}
  defaultProps={{ ... }}
  controls={{ ... }}
/>

## Installation

<InstallTabs componentName="component-name" />

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `propName` | `type` | `default` | Description of what it does. |
```

## Component Configurations

Use the following exact configurations for the `<ComponentCustomizer>` in each respective MDX file:

### 1. Magnetic Elastic Button (`magnetic-button`)
```tsx
defaultProps={{ children: "Hover Me", variant: "default", size: "md", shape: "rounded", magneticStrength: 0.4 }}
controls={{
  variant: { type: "select", options: ["default", "outline", "glow", "ghost"] },
  size: { type: "select", options: ["sm", "md", "lg"] },
  shape: { type: "select", options: ["rounded", "soft", "sharp"] },
  magneticStrength: { type: "slider", min: 0, max: 1, step: 0.1 }
}}
```

### 2. Infinite Blur Marquee (`marquee`)
```tsx
defaultProps={{ children: "★ Dead UI ★ Simple Animations ★ React Components", direction: "horizontal", blur: "edges", speed: 30, pauseOnHover: true }}
controls={{
  direction: { type: "select", options: ["horizontal", "vertical"] },
  blur: { type: "select", options: ["none", "edges", "left", "right"] },
  speed: { type: "slider", min: 5, max: 60, step: 5 },
  pauseOnHover: { type: "select", options: ["true", "false"] } // Note: pass as boolean in actual component if needed, or handle string-to-bool in customizer
}}
```

### 3. Spotlight Hover Card (`spotlight-card`)
```tsx
defaultProps={{ children: "Move your mouse over this card", glowType: "both", enableTilt: true, tiltIntensity: 10, spotlightColor: "rgba(239, 68, 68, 0.15)" }}
controls={{
  glowType: { type: "select", options: ["border", "background", "both", "none"] },
  enableTilt: { type: "select", options: ["true", "false"] },
  tiltIntensity: { type: "slider", min: 0, max: 30, step: 1 },
  spotlightColor: { type: "color" }
}}
```

### 4. Scroll-Linked Media Scrub (`scroll-scrub`)
```tsx
defaultProps={{ aspectRatio: "video", objectFit: "cover", pin: true, scrub: 1 }}
controls={{
  aspectRatio: { type: "select", options: ["video", "square", "portrait", "auto"] },
  objectFit: { type: "select", options: ["cover", "contain", "fill", "none"] },
  pin: { type: "select", options: ["true", "false"] },
  scrub: { type: "slider", min: 0, max: 3, step: 0.5 }
}}
```

### 5. Staggered Grid Reveal (`staggered-grid`)
*Note: This requires wrapping children in `<StaggeredItem>`. The customizer should render a mock grid.*
```tsx
defaultProps={{ variant: "fade-up", stagger: 0.1, duration: 0.6, once: true }}
controls={{
  variant: { type: "select", options: ["fade-up", "scale-in", "blur-in", "slide-left", "slide-right", "flip-x", "flip-y"] },
  stagger: { type: "slider", min: 0, max: 0.5, step: 0.05 },
  duration: { type: "slider", min: 0.2, max: 1.5, step: 0.1 },
  once: { type: "select", options: ["true", "false"] }
}}
```

### 6. Gradient Border Glow (`gradient-border`)
```tsx
defaultProps={{ children: "Glowing Content", variant: "rotating", radius: "md", speed: 4, width: 2, blur: 0 }}
controls={{
  variant: { type: "select", options: ["rotating", "pulsing", "static", "spotlight"] },
  radius: { type: "select", options: ["sm", "md", "lg", "full"] },
  speed: { type: "slider", min: 1, max: 10, step: 1 },
  width: { type: "slider", min: 1, max: 10, step: 1 },
  blur: { type: "slider", min: 0, max: 30, step: 5 }
}}
```

### 7. Text Fill Animation (PRO) (`text-fill-animation`)
*Note: Add a "🔒 PRO COMPONENT" badge at the top of this MDX page.*
```tsx
defaultProps={{ text: "Dead simple animations for React.", primaryColor: "#ef4444", dimColor: "rgba(255,255,255,0.2)", scrub: 0.25, height: "200vh" }}
controls={{
  primaryColor: { type: "color" },
  dimColor: { type: "color" },
  scrub: { type: "slider", min: 0, max: 1, step: 0.1 },
  height: { type: "select", options: ["150vh", "200vh", "250vh", "300vh"] }
}}
```

### 8. WebGL Liquid Image Trail (PRO) (`webgl-image-trail`)
*Note: Add a "🔒 PRO COMPONENT" badge at the top of this MDX page. Requires dynamic import in MDX if SSR issues occur, but standard import usually works if wrapper handles it.*
```tsx
defaultProps={{ effect: "liquid", distortion: 0.5, fadeDuration: 1.2, trailSize: 8, tintColor: "#ffffff" }}
controls={{
  effect: { type: "select", options: ["liquid", "distortion", "pixelate", "wave"] },
  distortion: { type: "slider", min: 0, max: 2, step: 0.1 },
  fadeDuration: { type: "slider", min: 0.5, max: 3, step: 0.1 },
  trailSize: { type: "slider", min: 2, max: 15, step: 1 },
  tintColor: { type: "color" }
}}
```

### 9. CSS Image Trail Effects (FREE) (`image-trail`)
```tsx
defaultProps={{ effect: "fade-scale", trailSize: 6, velocityThreshold: 15, imageSize: 100 }}
controls={{
  effect: { type: "select", options: ["fade-scale", "rotate-scale", "3d-rotate", "blur-fade", "clip-circle", "skew-fade"] },
  trailSize: { type: "slider", min: 2, max: 15, step: 1 },
  velocityThreshold: { type: "slider", min: 5, max: 50, step: 5 },
  imageSize: { type: "slider", min: 50, max: 200, step: 10 }
}}
```

## Implementation Steps

1. Create the directory structure: `app/docs/components/[component-name]/` for all 9 components.
2. Create the `page.mdx` file in each directory using the Standard Template and the specific Component Configurations provided above.
3. Ensure Pro components (`text-fill-animation`, `webgl-image-trail`) have a clear visual indicator (e.g., a red badge or warning text) at the top of the page.
4. Verify the build: `npm run build`.
5. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] All 9 MDX files are created in the correct directories.
- [ ] The `<ComponentCustomizer>` renders and interacts correctly on every page.
- [ ] Pro components are clearly marked.
- [ ] `npm run build` passes with zero MDX or TypeScript errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do not modify the core component source code.
- Do not modify the `<ComponentCustomizer>` logic; adapt the `controls` config to fit the existing customizer.
- Ensure all imports use the `@/registry/...` alias.

## Files to Create

1. `app/docs/components/magnetic-button/page.mdx`
2. `app/docs/components/marquee/page.mdx`
3. `app/docs/components/spotlight-card/page.mdx`
4. `app/docs/components/scroll-scrub/page.mdx`
5. `app/docs/components/staggered-grid/page.mdx`
6. `app/docs/components/gradient-border/page.mdx`
7. `app/docs/components/text-fill-animation/page.mdx`
8. `app/docs/components/webgl-image-trail/page.mdx`
9. `app/docs/components/image-trail/page.mdx`

## Files to Update

1. `context/progress-tracker.md`