# Code Standards

## TypeScript

- **Strict mode enabled** in `tsconfig.json`.
- All component props defined via exported `interface`.
- No `any` types in public component APIs.
- Use `React.FC` sparingly; prefer named function exports.
- Generic type parameters for flexible children/slots.
- All hooks must export their return type interface.

### Props Interface Pattern

Every component MUST follow this exact pattern:

```typescript
import { type VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const cinematicTextVariants = cva(
  "inline-block will-change-transform",
  {
    variants: {
      variant: {
        "blur-in": "opacity-0 blur-[10px]",
        "fade-up": "opacity-0 translate-y-5",
        "slide-stagger": "opacity-0 -translate-x-5",
        "scale-pop": "opacity-0 scale-90",
      },
    },
    defaultVariants: {
      variant: "blur-in",
    },
  }
);

export interface CinematicTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cinematicTextVariants> {
  children: string;
  duration?: number;
  delay?: number;
  stagger?: number;
  splitBy?: "chars" | "words" | "lines";
}

export function CinematicText({
  className,
  variant,
  children,
  duration = 0.8,
  delay = 0,
  stagger = 0.05,
  splitBy = "chars",
  ...props
}: CinematicTextProps) {
  // implementation
}
```

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | `kebab-case.tsx` | `cinematic-text.tsx` |
| Hooks | `use-kebab-case.ts` | `use-cinematic-text.ts` |
| Utilities | `kebab-case.ts` | `split-text.ts` |
| CSS modules | `kebab-case.module.css` | `webgl-trail.module.css` |
| Test files | `kebab-case.test.tsx` | `magnetic-button.test.tsx` |
| Docs pages | `kebab-case.mdx` | `cinematic-text.mdx` |
| Barrel exports | `index.ts` | `registry/cinematic-text/index.ts` |

## Component File Structure

Every component in `registry/` follows this pattern:

```
registry/
└── component-name/
    ├── component-name.tsx        # Main component (required)
    ├── use-component-name.ts     # Custom hook (if needed)
    ├── component-name.module.css # Scoped CSS (if needed)
    └── index.ts                  # Re-export barrel (required)
```

### Barrel Export Pattern

```typescript
// registry/cinematic-text/index.ts
export { CinematicText } from "./cinematic-text";
export type { CinematicTextProps } from "./cinematic-text";
export { cinematicTextVariants } from "./cinematic-text";
```

## Styling Rules

1. **Tailwind CSS only** for all visual styling.
2. **No inline `style={}` props** except for GSAP initial states that must apply before hydration.
3. Use `cn()` utility (clsx + tailwind-merge) for conditional class merging.
4. All components MUST accept a `className` prop for external overrides.
5. Dark mode is the DEFAULT. Use `dark:` prefix only for light-mode overrides.
6. No CSS-in-JS libraries (styled-components, emotion, etc.).

### cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Usage in Components

```typescript
<div
  className={cn(
    cinematicTextVariants({ variant }),
    "text-4xl font-bold tracking-tight",
    className
  )}
  {...props}
>
  {children}
</div>
```

## Animation Rules

### GSAP Components

- Import GSAP modules explicitly:
  ```typescript
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { SplitText } from "gsap/SplitText";
  ```
- Register plugins at the top of the file:
  ```typescript
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ```
- ALWAYS use `useRef` for DOM element references.
- ALWAYS create timelines/ScrollTriggers inside `useEffect`.
- ALWAYS use `gsap.context()` for scoped animations.
- ALWAYS return a cleanup function that calls `ctx.revert()`.

### GSAP Cleanup Pattern (MANDATORY)

```typescript
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const ctx = gsap.context(() => {
    const split = new SplitText(containerRef.current, {
      type: "chars",
    });

    gsap.from(split.chars, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.05,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }, containerRef);

  return () => ctx.revert();
}, []);
```

### Framer Motion Components

- Import from `motion/react` (v11+) or `framer-motion`.
- Use `useReducedMotion()` hook to respect user preferences.
- Prefer `animate` prop over `whileInView` for complex sequences.
- Always define `initial`, `animate`, and `transition` explicitly.

```typescript
import { motion, useReducedMotion } from "motion/react";

export function MagneticButton({ children }: MagneticButtonProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      initial={{ scale: 1 }}
      whileHover={{ scale: shouldReduce ? 1 : 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
```

### Lenis (Smooth Scroll)

- Lenis setup is the USER's responsibility.
- Components that require Lenis should document this in their JSDoc and docs page.
- Provide a `useLenis` hook in `lib/` that users can copy via CLI if needed.
- Never initialize Lenis inside a component.

### WebGL / Three.js Components (Pro)

- Use `@react-three/fiber` Canvas component.
- Lazy-load with `next/dynamic` and `ssr: false`.
- Dispose of geometries, materials, and textures in cleanup functions.
- Use `useFrame` for per-frame updates, not `setInterval` or `requestAnimationFrame`.
- Keep shader code in separate `.glsl` files or template literals.

```typescript
// Cleanup pattern for Three.js
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, []);
```

## Variant Architecture

All visual variants managed via `class-variance-authority`:

1. Define variants with `cva()` at the top of the component file.
2. Component accepts `VariantProps<typeof variants>`.
3. Merge with `cn()` to allow `className` overrides.
4. Document all variants in the component's MDX page with a live toggle playground.
5. Minimum 3 variants per component (aim for 4+).

### Variant Naming Convention

- Use `kebab-case` for variant names: `"blur-in"`, `"fade-up"`, `"scale-pop"`.
- Use descriptive, action-oriented names.
- Avoid generic names like `"default"`, `"primary"`, `"secondary"` unless truly appropriate.

## SSR / Hydration Safety

- Guard browser APIs:
  ```typescript
  if (typeof window === "undefined") return null;
  ```
- Or use Next.js dynamic import:
  ```typescript
  import dynamic from "next/dynamic";

  const WebGLTrail = dynamic(() => import("./webgl-trail"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-dead-surface" />,
  });
  ```
- Never call `window.addEventListener` outside `useEffect`.
- Never read `window.innerWidth` during render; use `useEffect` + state or CSS media queries.
- Never access `document`, `navigator`, or `localStorage` during render.

## Error Handling

- Components should fail gracefully. If GSAP fails to load, the text should still be visible (just not animated).
- Use `try/catch` around GSAP timeline creation.
- Log warnings to console in development only:
  ```typescript
  if (process.env.NODE_ENV === "development") {
    console.warn("Dead UI: GSAP failed to initialize", error);
  }
  ```
- Never throw errors that break the parent component.

## Performance Invariants

1. **No CLS**: Use explicit dimensions, `will-change`, and absolute positioning for animated elements.
2. **60fps target**: All animations must maintain 60fps on mid-range hardware.
3. **GPU-accelerated properties**: Prefer `transform` and `opacity` over `width`, `height`, `top`, `left`.
4. **Minimal re-renders**: Use `useMemo` for expensive computations, `useCallback` for event handlers passed to children.
5. **Lazy-load heavy components**: WebGL, Three.js, and complex scroll effects must be dynamically imported.
6. **Bundle size awareness**: Document the bundle size impact of each component in its MDX page.

## Accessibility (NON-NEGOTIABLE)

- **`prefers-reduced-motion`**: ALL animations MUST check this media query and disable/reduce motion accordingly.
  ```typescript
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animation, show final state immediately
      gsap.set(elements, { opacity: 1, y: 0 });
      return;
    }
    // Normal animation logic
  }, [prefersReducedMotion]);
  ```
- **Keyboard navigation**: All interactive elements reachable via `Tab`.
- **Focus ring**: `focus:ring-2 focus:ring-dead-accent focus:ring-offset-2 focus:ring-offset-dead-black`.
- **Color contrast**: Minimum 4.5:1 for text on dark backgrounds.
- **ARIA labels**: All icon-only buttons must have `aria-label`.
- **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, `<section>` appropriately.

## Documentation Standards

Every component MUST have a corresponding MDX file in `app/docs/components/` containing:

1. **Title & Description**: One-line summary.
2. **Live Preview**: Embedded component with variant toggles.
3. **Installation Command**: `npx deadui@latest add <name>`
4. **Usage Example**: Minimal code snippet.
5. **Props Table**: Auto-generated or manually maintained table with Name, Type, Default, Description columns.
6. **Variants Section**: Visual showcase of all variants.
7. **Dependencies**: List of required npm packages.
8. **Performance Note**: Bundle size and any perf considerations.
9. **Accessibility Note**: How the component respects `prefers-reduced-motion`.

### MDX Template

```mdx
---
title: Cinematic Text Reveal
description: GSAP SplitText + ScrollTrigger letter-by-letter reveal
---

import { CinematicText } from "@/registry/cinematic-text"

# Cinematic Text Reveal

GSAP SplitText + ScrollTrigger letter-by-letter reveal with multiple variants.

## Installation

```bash
npx deadui@latest add cinematic-text
```

## Usage

```tsx
import { CinematicText } from "@/components/ui/cinematic-text"

<CinematicText variant="blur-in">
  Dead simple animations for React.
</CinematicText>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"blur-in" \| "fade-up" \| "slide-stagger" \| "scale-pop"` | `"blur-in"` | Animation style |
| `duration` | `number` | `0.8` | Animation duration in seconds |
| `delay` | `number` | `0` | Delay before animation starts |
| `stagger` | `number` | `0.05` | Delay between each character |
| `splitBy` | `"chars" \| "words" \| "lines"` | `"chars"` | How to split the text |

## Dependencies

- `gsap` (includes SplitText and ScrollTrigger)

## Performance

- Bundle size: ~25KB (GSAP core)
- 60fps on mid-range hardware
- Respects `prefers-reduced-motion`
```

## Git Conventions

- **Branch naming**:
  - `feat/<component-name>` — new component
  - `fix/<issue>` — bug fix
  - `docs/<page>` — documentation update
  - `refactor/<scope>` — code refactoring
- **Commit messages** (Conventional Commits):
  - `feat: add cinematic-text component`
  - `fix: cleanup GSAP context on unmount`
  - `docs: add magnetic-button MDX page`
  - `chore: update registry.json`
- **One component per PR/commit** when possible.
- **Never commit**:
  - `node_modules/`
  - `.env` files (use `.env.example`)
  - Build artifacts (`dist/`, `.next/`)
  - OS files (`.DS_Store`, `Thumbs.db`)

## Testing Standards

- Unit tests for utility functions (`lib/utils.ts`, `lib/animations.ts`).
- Integration tests for CLI commands.
- Visual regression tests for components (future).
- Test file naming: `<component-name>.test.tsx`
- Use Vitest for unit tests, Playwright for E2E tests.

## Code Review Checklist

Before merging any PR, verify:

- [ ] TypeScript compiles with zero errors (`npm run build`)
- [ ] All variants work via props
- [ ] `className` prop correctly merges external classes
- [ ] Animation plays at 60fps
- [ ] No CLS (check Lighthouse)
- [ ] Cleanup works (no memory leaks)
- [ ] `prefers-reduced-motion` is respected
- [ ] SSR safe (no hydration mismatches)
- [ ] Component entry added to `registry.json`
- [ ] MDX documentation page created
- [ ] CLI can successfully install the component