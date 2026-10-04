# Feature 19: Documentation & Landing Page Setup

## Overview

Build the custom, highly interactive documentation and landing page foundation for Dead UI. Instead of using heavy, opinionated frameworks like Nextra, we will use a custom Next.js App Router + MDX setup. This provides 100% control over the layout and allows us to embed complex, stateful React components (like a live prop customization panel) directly into the documentation, matching the polish of React Bits and Aceternity UI.

## Goals

1. Configure Next.js to support MDX with beautiful syntax highlighting (`shiki`).
2. Create a custom documentation layout: Top Navigation (with `cmdk` search), Left Sidebar (component tree), Main Content, and Right Sidebar (Table of Contents).
3. Build a reusable `<ComponentCustomizer>` wrapper that auto-generates UI controls (sliders, selects, color pickers) to let users tweak component props in real-time.
4. Build a stunning, dark-mode-dominant Landing Page (`app/page.tsx`) showcasing the top 3 components with live previews.
5. Create the first full documentation page for `CinematicText` utilizing the new layout and customizer.

## Technical Specifications

### Dependencies to Install
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react shiki cmdk lucide-react
# Ensure shadcn/ui components are available: button, slider, select, tabs, copy-to-clipboard
```

### 1. MDX Configuration (`next.config.ts`)
```typescript
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Add shiki rehype plugin here for syntax highlighting in production
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [], // Add shiki rehype plugin here
  },
})

export default withMDX(nextConfig)
```

### 2. The Reusable `<ComponentCustomizer>` (`components/docs/component-customizer.tsx`)
This is the "secret sauce". It takes a component, default props, and a configuration object to auto-generate controls.

```tsx
'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type ControlConfig = {
  [key: string]: 
    | { type: 'slider'; min: number; max: number; step: number }
    | { type: 'select'; options: string[] }
    | { type: 'color' }
}

export function ComponentCustomizer({ 
  component: Component, 
  defaultProps, 
  controls,
  className 
}: { 
  component: React.ElementType, 
  defaultProps: any, 
  controls: ControlConfig,
  className?: string 
}) {
  const [props, setProps] = useState(defaultProps)

  const updateProp = (key: string, value: any) => {
    setProps((prev: any) => ({ ...prev, [key]: value }))
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", className)}>
      {/* Preview Area */}
      <div className="lg:col-span-2 bg-dead-surface border border-dead-border rounded-xl min-h-[400px] flex items-center justify-center p-8 overflow-hidden relative">
        <Component {...props} />
      </div>

      {/* Controls Area */}
      <div className="bg-dead-elevated border border-dead-border rounded-xl p-6 space-y-6 h-fit">
        <h3 className="text-sm font-semibold text-dead-white uppercase tracking-wider">Customize</h3>
        
        {Object.entries(controls).map(([key, config]) => (
          <div key={key} className="space-y-2">
            <label className="text-xs text-dead-muted font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
            
            {config.type === 'slider' && (
              <Slider 
                min={config.min} 
                max={config.max} 
                step={config.step} 
                value={[props[key]]} 
                onValueChange={([val]) => updateProp(key, val)} 
              />
            )}
            
            {config.type === 'select' && (
              <Select value={props[key]} onValueChange={(val) => updateProp(key, val)}>
                <SelectTrigger className="bg-dead-surface border-dead-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. Documentation Layout (`app/docs/layout.tsx`)
- **Top Nav:** Logo, Links (Components, Pricing, GitHub), `Cmd+K` Search button.
- **Left Sidebar:** Collapsible tree of components, grouped by category, with Free/Pro badges.
- **Right Sidebar:** Sticky Table of Contents generated from MDX headings.
- **Main:** `<main className="flex-1 min-w-0 px-8 py-12">{children}</main>`

### 4. Landing Page (`app/page.tsx`)
- Full-screen hero with a massive, auto-playing or interactive demo of the `TextFillAnimation` or `WebGLImageTrail`.
- "Dead simple animations for React" tagline.
- Grid showcasing the top 3 Free components with hover-triggered mini-previews.
- Clear CTA: `npx deadui@latest init`.

### 5. First Docs Page (`app/docs/components/cinematic-text/page.mdx`)
```mdx
import { CinematicText } from '@/registry/cinematic-text'
import { ComponentCustomizer } from '@/components/docs/component-customizer'
import { InstallTabs } from '@/components/docs/install-tabs'

# Cinematic Text Reveal

GSAP SplitText + ScrollTrigger letter-by-letter reveal with multiple variants.

## Preview

<ComponentCustomizer 
  component={CinematicText}
  defaultProps={{ 
    children: "Dead simple animations for React.", 
    variant: "blur-in", 
    duration: 0.8,
    className: "text-5xl font-bold text-dead-white"
  }}
  controls={{
    variant: { type: "select", options: ["blur-in", "fade-up", "slide-stagger", "scale-pop"] },
    duration: { type: "slider", min: 0.1, max: 2.0, step: 0.1 },
    splitBy: { type: "select", options: ["chars", "words", "lines"] }
  }}
/>

## Installation

<InstallTabs componentName="cinematic-text" />

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"blur-in" \| "fade-up" \| ...` | `"blur-in"` | Animation style |
| `duration` | `number` | `0.8` | Animation duration in seconds |
```

## Implementation Steps

1. Install required dependencies (`@next/mdx`, `cmdk`, `shiki`, shadcn slider/select).
2. Update `next.config.ts` to support `.mdx` files.
3. Create the docs shell layout (`app/docs/layout.tsx`, sidebar, top nav with search).
4. Build the `<ComponentCustomizer>` component.
5. Build the main Landing Page (`app/page.tsx`).
6. Create the first MDX documentation page for `cinematic-text` at `app/docs/components/cinematic-text/page.mdx`.
7. Verify build: `npm run build`.
8. Verify visually: `npm run dev`, check landing page, open docs, test the customizer sliders, and test `Cmd+K` search.
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `.mdx` files render correctly with syntax-highlighted code blocks.
- [ ] The `<ComponentCustomizer>` updates the preview component in real-time when sliders/selects are changed.
- [ ] The Left Sidebar correctly lists components with Free/Pro indicators.
- [ ] The `Cmd+K` search modal opens and is functional.
- [ ] The Landing Page is visually striking and matches the "Dead UI" dark aesthetic.
- [ ] `npm run build` passes with zero TypeScript or MDX errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- **NO Nextra:** Use native `@next/mdx` for maximum flexibility with interactive React components.
- **Client Components:** The `<ComponentCustomizer>` and any interactive UI elements within MDX must be marked `'use client'`.
- **Performance:** Ensure the landing page animations do not cause layout shifts or heavy main-thread blocking.

## Files to Create/Update

1. `next.config.ts` (Update for MDX)
2. `components/docs/component-customizer.tsx` (New)
3. `components/docs/top-nav.tsx` (New)
4. `components/docs/sidebar.tsx` (New)
5. `app/docs/layout.tsx` (New)
6. `app/page.tsx` (New/Update)
7. `app/docs/components/cinematic-text/page.mdx` (New)
8. `context/progress-tracker.md` (Update)