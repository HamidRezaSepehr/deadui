# Feature 27: Cinematic Text Advanced Variants

## Overview

Expand the `CinematicText` component with 8 new, highly distinct animation variants. These new variations focus on a "color reveal" pattern (transitioning from a dimmed gray to full white) combined with complex transforms (3D flips, diagonal slides, and masked reveals). We will also update the documentation and test pages to showcase these new effects.

## Goals

1. Add 8 new variants to the `CinematicText` component: `rise-color`, `slide-left-color`, `scale-blur-color`, `diagonal-blur-color`, `flip-x-color`, `heavy-flip-color`, `flip-top-color`, and `mask-reveal`.
2. Ensure all new variants utilize the `color-mix` pattern for the text color transition (0% white to 100% white) and opacity transition (0.3 to 1).
3. Implement the `mask-reveal` variant using a parent container with `overflow: hidden` to create a clipping effect where characters rise from below the baseline.
4. Update the MDX documentation page to include the new variants in the `<ComponentCustomizer>` controls.
5. Update the test page to allow visual verification of all new variants.
6. Execute the 4-step Release Workflow to publish `v0.1.4`.

## Technical Specifications

### 1. Component Updates (`registry/cinematic-text/cinematic-text.tsx`)
Add the following variants to the component's style mapping. All variants must share the base transition properties: `will-change: transform, opacity, color, filter`.

*Note: Skip Variation 6 and Variation 8 from the user's list as they are redundant with Variation 4 and Variation 1/3 respectively.*

- **`rise-color`**: `translateY(25px)` -> `0`, opacity 0.3 -> 1, color `color-mix(..., 0%)` -> `100%`.
- **`slide-left-color`**: `translateX(-7px)` -> `0`, opacity 0.3 -> 1, color dim -> white.
- **`scale-blur-color`**: `translateY(15px) scale(0.5) blur(2px)` -> `scale(1) blur(0)`, opacity 0.3 -> 1, color dim -> white.
- **`diagonal-blur-color`**: `translateX(-10px) translateY(20px) blur(4px)` -> `0,0 blur(0)`, opacity 0.3 -> 1, color dim -> white.
- **`flip-x-color`**: `perspective(800px) rotateX(45deg) blur(2px)` -> `rotateX(0) blur(0)`, opacity 0.3 -> 1, color dim -> white.
- **`heavy-flip-color`**: `perspective(600px) rotateX(30deg) translateX(-15px) translateY(40px) blur(10px)` -> `0,0,0 blur(0)`, opacity 0.3 -> 1, color dim -> white.
- **`flip-top-color`**: `perspective(900px) rotateX(-20deg) translateY(-30px) blur(5px)` -> `0,0,0 blur(0)`, opacity 0.3 -> 1, color dim -> white.
- **`mask-reveal`**: 
  - Parent container must have `overflow: hidden` and `display: inline-block` (or flex).
  - Characters start at `translateY(100%)` and animate to `translateY(0)`.
  - This creates a effect where characters slide up from behind a clipping mask.

### 2. Documentation Update (`app/docs/components/cinematic-text/page.mdx`)
Update the `<ComponentCustomizer>` controls to include the new variants:
```tsx
controls={{
  variant: { 
    type: "select", 
    options: [
      "blur-in", "fade-up", "slide-stagger", "scale-pop", // Existing
      "rise-color", "slide-left-color", "scale-blur-color", "diagonal-blur-color", 
      "flip-x-color", "heavy-flip-color", "flip-top-color", "mask-reveal" // New
    ] 
  },
  // ... keep existing controls for duration, splitBy, etc.
}}
```

### 3. Test Page Update (`app/test-cinematic-text/page.tsx`)
Add a grid or list to the test page that renders a sample of each new variant so they can be visually verified side-by-side.

### 4. The 4-Step Release Workflow
As defined in `AGENTS.md`:
1. **Bump Version**: Change `"version"` in `packages/cli/package.json` to `"0.1.4"`.
2. **Commit & Push**: 
   ```bash
   git add .
   git commit -m "feat: add 8 advanced cinematic text variants for v0.1.4"
   git push origin main
   ```
3. **Create Tag**: 
   ```bash
   git tag v0.1.4
   git push origin v0.1.4
   ```
4. **Prompt User**: Instruct the user to draft a new GitHub Release for tag `v0.1.4`.

## Implementation Steps

1. Update `registry/cinematic-text/cinematic-text.tsx` with the 8 new variants.
2. Update `app/docs/components/cinematic-text/page.mdx` to expose the new variants in the customizer.
3. Update `app/test-cinematic-text/page.tsx` to showcase the new variants.
4. Bump `packages/cli/package.json` version to `0.1.4`.
5. Execute the git commands (commit, push, tag).
6. Output instructions for the user to create the GitHub Release.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] All 8 new variants render correctly with the color-mix transition.
- [ ] The `mask-reveal` variant correctly clips characters using `overflow: hidden` on the parent.
- [ ] The `<ComponentCustomizer>` in the docs allows switching to all new variants.
- [ ] The test page displays the new variants.
- [ ] The 4-step release workflow is executed, and the user is prompted to create the GitHub Release.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/cinematic-text/cinematic-text.tsx` (Update)
2. `app/docs/components/cinematic-text/page.mdx` (Update)
3. `app/test-cinematic-text/page.tsx` (Update)
4. `packages/cli/package.json` (Update version to 0.1.4)
5. `context/progress-tracker.md` (Update)