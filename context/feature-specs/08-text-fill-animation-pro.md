# Feature 08: Text Fill Animation (Pro)

## Overview

Create a premium, scroll-linked text fill animation component inspired by high-end Awwwards sites. Unlike triggered entrance animations, this component pins/sticks to the viewport while characters progressively fill with color based on scroll position and velocity. This is a **Pro-tier** component that justifies the paid license through its complexity, visual impact, and full configurability.

## Goals

1. Port the Obsidian UI "Text Fill" pattern faithfully but adapt it to Dead UI conventions.
2. Expose **every** visual parameter as a configurable prop (colors, sizes, spacing, scrub speed).
3. Implement proper `prefers-reduced-motion` handling that collapses the sticky section to auto height.
4. Use CSS custom properties for responsive sizing instead of hardcoded media queries in JS.
5. Register as `tier: "pro"` in `registry.json`.

## Technical Specifications

### Directory Structure

```
registry/
└── text-fill-animation/
    ├── text-fill-animation.tsx   # Main component
    ├── text-fill-animation.module.css  # Keyframes + base styles
    ── index.ts                  # Barrel export
```

### Dependencies

- `gsap` (includes ScrollTrigger, SplitText)
- `class-variance-authority` (for variant-based styling where applicable)
- `clsx`, `tailwind-merge` (for class merging)

### Component Props Interface

```typescript
export interface TextFillAnimationProps extends React.HTMLAttributes<HTMLElement> {
  // Content
  text?: string
  showDetails?: boolean          // Show corner labels / scroll indicator
  
  // Colors
  textColor?: string             // Final filled color (default: var(--foreground))
  primaryColor?: string          // Active fill gradient color (default: #ff6b00)
  velocityPrimary?: boolean      // Use primaryColor as the velocity mid-stop (default: true)
  dimColor?: string              // Unfilled/dimmed state (default: color-mix(...))
  backgroundColor?: string       // Section background (default: var(--background))
  
  // Sizing (responsive via CSS vars)
  textSize?: string              // Desktop font size (default: '5vw')
  textWidth?: string             // Desktop text container width (default: '80%')
  tabletTextSize?: string        // Tablet font size (default: '6.5vw')
  tabletTextWidth?: string       // Tablet text container width (default: '88%')
  mobileTextSize?: string        // Mobile font size (default: '8vw')
  mobileTextWidth?: string       // Mobile text container width (default: '95%')
  
  // Scroll Behavior
  start?: string                 // ScrollTrigger start (default: 'top top')
  end?: string                   // ScrollTrigger end (default: 'bottom bottom')
  scrub?: number | boolean       // Scrub smoothing (default: 0.25)
  height?: string | number       // Total scrollable section height (default: '250vh')
  viewportHeight?: string        // Sticky viewport height (default: '100vh')
  
  // Scroller / Trigger Override
  scroller?: HTMLElement | Window | RefObject<HTMLElement | null>
  trigger?: HTMLElement | RefObject<HTMLElement | null>
}
```

### Implementation Notes

1. **GSAP Plugin Registration**: Register `ScrollTrigger` and `SplitText` at module scope with `typeof window !== 'undefined'` guard.
2. **MatchMedia for Reduced Motion**: Wrap all GSAP logic in `gsap.matchMedia()` checking `(prefers-reduced-motion: no-preference)`. When reduced motion is preferred, the section should collapse to `height: auto` and show fully filled text instantly.
3. **CSS Custom Properties**: Pass all sizing/color values as inline CSS variables on the root `<section>` element. The CSS module reads these variables. This avoids JS-driven responsive breakpoints and keeps the animation performant.
4. **SplitText Configuration**: Use `{ type: 'words chars', aria: 'auto', tag: 'span', charsClass: 'split-chars' }`. The `aria: 'auto'` ensures screen readers still read the full text naturally.
5. **Timeline Construction**: Create a single GSAP timeline with `scrollTrigger` config. Animate all `.split-chars` elements from their default dim state to the `.show` class using staggered className tweens. The CSS `@keyframes obsidian-text-fill-color` handles the actual color transition — GSAP only toggles the class.
6. **Cleanup**: Return `split.revert()` from the matchMedia callback AND `media.revert()` from the useEffect cleanup.
7. **Sticky Viewport**: The inner `.tfa-viewport` div uses `position: sticky; top: 0;` and fills `var(--tfa-viewport-height)`. This creates the pinning effect without GSAP pinning, which is more performant and avoids layout thrashing. The root must NOT use `overflow: hidden` (that kills sticky by making the section a scroll container) — use `overflow: clip` instead.
8. **Velocity Primary Toggle**: `velocityPrimary` (default `true`) controls whether the 30% keyframe stop uses the `primaryColor`. When `false`, the component maps `--tfa-primary-color` to `textColor` at render time, collapsing the keyframes to `0% dim → 100% final` so no velocity-tinted band appears — implemented purely via the CSS variable, with no JS/GASP changes needed. Toggling it on/off requires no ScrollTrigger re-measure because it only affects an inline custom property.

### Addendum (post-implementation extension)

`velocityPrimary?: boolean` was added after initial implementation to give consumers a first-class way to opt out of the velocity-reactive mid-stop (previously only achievable by passing a hacky `primaryColor={textColor}`). It is a non-breaking, additive extension to the spec'd prop surface. Test page sections 7 ("NO VELOCITY PRIMARY") and 8 ("CUSTOM FILL & DIM COLORS") demonstrate the options.

### CSS Module: `text-fill-animation.module.css`

Must include:
- `@keyframes obsidian-text-fill-color` (0% → 30% → 100% color transition)
- `.split-chars` base style (dim color, transition)
- `.split-chars.show` active style (animation trigger, final color)
- Responsive overrides via `@media` reading CSS custom properties
- `@media (prefers-reduced-motion: reduce)` override collapsing height and disabling animation

### Registry Entry

```json
{
  "name": "text-fill-animation",
  "title": "Text Fill Animation",
  "description": "Scroll-linked sticky text fill with velocity-reactive gradient",
  "tier": "pro",
  "dependencies": ["gsap"],
  "files": [
    {
      "path": "registry/text-fill-animation/text-fill-animation.tsx",
      "target": "components/ui/text-fill-animation.tsx"
    },
    {
      "path": "registry/text-fill-animation/text-fill-animation.module.css",
      "target": "styles/text-fill-animation.module.css"
    }
  ],
  "variants": []
}
```

## Implementation Steps

1. Create `registry/text-fill-animation/` directory
2. Create `text-fill-animation.module.css` with keyframes, base styles, responsive overrides, and reduced-motion fallback
3. Create `text-fill-animation.tsx` with full props interface, matchMedia wrapper, SplitText setup, and CSS variable injection
4. Create `index.ts` barrel export
5. Add registry entry to `registry.json` with `tier: "pro"`
6. Create test page at `app/test-text-fill/page.tsx` demonstrating:
   - Default configuration
   - Custom colors (e.g., blue primary, white dim)
   - Custom sizing (smaller text, narrower width)
   - Faster scrub (scrub={0.1}) vs slower scrub (scrub={1.0})
7. Verify build: `npm run build`
8. Verify visually: `npm run dev`, navigate to `/test-text-fill`, scroll slowly and quickly to observe velocity-reactive gradient behavior
9. Update `context/progress-tracker.md`

## Verification Checklist

- [ ] Component renders without errors in SSR and CSR
- [ ] All props are configurable and reflected in the rendered output
- [ ] Scroll-linked scrubbing works smoothly at 60fps
- [ ] Velocity-reactive gradient is visible (fast scroll = wider gradient spread)
- [ ] `velocityPrimary={false}` disables the velocity mid-stop (dim → final directly, no tinted band)
- [ ] `prefers-reduced-motion` collapses section to auto height and shows filled text instantly
- [ ] Screen readers can read the full text (aria: 'auto' working)
- [ ] No memory leaks (matchMedia and split revert on unmount)
- [ ] Build passes with zero TypeScript errors
- [ ] Registry entry marked as `tier: "pro"`
- [ ] Test page demonstrates multiple configurations
- [ ] `progress-tracker.md` updated

## Constraints

- Do NOT modify the CinematicText component
- Do NOT use GSAP pinning — use CSS `position: sticky` for the viewport
- Do NOT hardcode any colors or sizes in JS — all must be CSS custom properties
- Do NOT skip the `prefers-reduced-motion` check — this is non-negotiable
- Ensure the CSS module is imported correctly and classes are scoped properly
- If anything is unclear, ask BEFORE implementing

## Files to Create

1. `registry/text-fill-animation/text-fill-animation.tsx`
2. `registry/text-fill-animation/text-fill-animation.module.css`
3. `registry/text-fill-animation/index.ts`
4. `app/test-text-fill/page.tsx`

## Files to Update

1. `registry.json` — Add text-fill-animation entry with tier: "pro"
2. `context/progress-tracker.md` — Mark Feature 08 as complete

## Next Steps After Completion

- Feature 09: Implement CLI Registry Fetch Logic (make CLI actually copy files from GitHub)
- Feature 10: Implement Pro License Validation (GitHub PAT gating)
- Feature 11: Write MDX Documentation for CinematicText
- Feature 12: Write MDX Documentation for TextFillAnimation