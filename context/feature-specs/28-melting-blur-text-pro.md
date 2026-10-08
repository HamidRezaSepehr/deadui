# Feature 28: Melting Blur Text (Pro Component)

## Overview

Add a premium, Pro-tier "Melting Blur Text" component to Dead UI. This component creates a high-end, liquid-like melting effect on text when the user hovers over it. It uses a combination of Framer Motion for inertia-based mouse tracking and dynamic SVG filters (`feGaussianBlur` + `feColorMatrix`) to create the "gooey" merging effect, ensuring maximum compatibility with any font while delivering an Awwwards-grade visual.

## Goals

1. Create a new Pro component: `registry/pro/melting-blur-text/melting-blur-text.tsx`.
2. Implement precise mouse-tracking with configurable `inertia` (lerp).
3. Expose exact customization controls: `effectRadius`, `blurSpread`, `blurQuality` (low/medium/high), and `inertia`.
4. Update `registry.json` to include the new Pro component with its specific dependencies (`framer-motion`).
5. Create a test page and an interactive MDX documentation page using the `<ComponentCustomizer>`.
6. Execute the 4-step Release Workflow and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Implementation (`registry/pro/melting-blur-text/melting-blur-text.tsx`)
The component will:
- Split the `children` string into individual character `<span>` elements.
- Use a `useAnimationFrame` or `requestAnimationFrame` loop to smoothly interpolate (lerp) the mouse position based on the `inertia` prop (e.g., `current = current + (target - current) * inertia`).
- Calculate the distance from the interpolated mouse position to the center of each character.
- If the distance is less than `effectRadius`, apply a dynamic `transform: translateY()` (to simulate dripping) and `filter: blur()` (scaled by `blurSpread`).
- Wrap the entire component in a container that applies a global SVG filter:
  ```xml
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <filter id="melting-filter">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blurQuality === 'high' ? 4 : blurQuality === 'medium' ? 6 : 10} result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="gooey" />
      <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
    </filter>
  </svg>
  ```
  *(Note: The `stdDeviation` is inverted for quality: 'high' quality means a tighter, more expensive blur calculation, while 'low' is more performant).*

### 2. Props Interface
```typescript
interface MeltingBlurTextProps {
  children: string;
  effectRadius?: number;      // Default: 60
  blurSpread?: number;        // Default: 8
  blurQuality?: 'low' | 'medium' | 'high'; // Default: 'medium'
  inertia?: number;           // Default: 0.15 (range 0.05 to 0.5)
  className?: string;
}
```

### 3. Registry Update (`registry.json`)
Add the new Pro component entry:
```json
{
  "name": "melting-blur-text",
  "title": "Melting Blur Text",
  "description": "A premium, liquid-like melting text effect on hover with customizable inertia and blur.",
  "tier": "pro",
  "dependencies": ["framer-motion", "clsx", "tailwind-merge"],
  "files": [
    {
      "path": "registry/pro/melting-blur-text/melting-blur-text.tsx",
      "target": "components/ui/melting-blur-text.tsx"
    }
  ]
}
```

### 4. Documentation (`app/docs/components/melting-blur-text/page.mdx`)
- Add a "🔒 PRO COMPONENT" badge at the top.
- Use the `<ComponentCustomizer>` with this exact configuration:
```tsx
defaultProps={{ 
  children: "Hover over this text to melt it.", 
  effectRadius: 60,
  blurSpread: 8,
  blurQuality: "medium",
  inertia: 0.15
}}
controls={{
  effectRadius: { type: "slider", min: 20, max: 150, step: 5 },
  blurSpread: { type: "slider", min: 2, max: 20, step: 1 },
  blurQuality: { type: "select", options: ["low", "medium", "high"] },
  inertia: { type: "slider", min: 0.05, max: 0.5, step: 0.05 }
}}
```

### 5. The 4-Step Release Workflow & Manual Publish
As defined in `AGENTS.md`, execute the git workflow for `v0.1.5`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response, as GitHub Actions is not currently configured to auto-publish.

## Implementation Steps

1. Create `registry/pro/melting-blur-text/melting-blur-text.tsx`.
2. Update `registry.json`.
3. Create `app/test-melting-blur-text/page.tsx`.
4. Create `app/docs/components/melting-blur-text/page.mdx`.
5. Bump `packages/cli/package.json` version to `0.1.5`.
6. Execute git commands: `add`, `commit`, `push`, `tag v0.1.5`, `push tag`.
7. Output the exact GitHub Release UI instructions.
8. **Output the exact manual terminal commands to publish to npm.**
9. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Component renders and splits text correctly.
- [ ] Mouse tracking exhibits smooth inertia based on the prop.
- [ ] The SVG filter successfully creates the "gooey/melting" merge effect.
- [ ] All 4 controls (`effectRadius`, `blurSpread`, `blurQuality`, `inertia`) dynamically update the effect in the docs customizer.
- [ ] Pro license gate is respected (component is in `registry/pro/`).
- [ ] Git tag `v0.1.5` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/pro/melting-blur-text/melting-blur-text.tsx` (New)
2. `registry.json` (Update)
3. `app/test-melting-blur-text/page.tsx` (New)
4. `app/docs/components/melting-blur-text/page.mdx` (New)
5. `packages/cli/package.json` (Update version to 0.1.5)
6. `context/progress-tracker.md` (Update)