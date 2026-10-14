# Feature 28: Advanced Marquee Component

## Overview

Upgrade the existing `Marquee` component to be a fully versatile, media-agnostic scrolling container. It will seamlessly support images (including SVGs), videos, text, and complex HTML cards. We will add convenience props for uniform item styling (like border radius), background/border variants, and perfect the bidirectional scroll-linked behavior.

## Goals

1. Update `Marquee` to accept an `itemClassName` prop, allowing uniform styling (e.g., `rounded-xl`, `overflow-hidden`) to be applied to every repeated item wrapper.
2. Add `bg` and `border` variants to the `cva` configuration for easy container styling.
3. Refine the `scrollLinked` logic so that scrolling **down** moves the marquee to the **right**, and scrolling **up** moves it to the **left** (true bidirectional feel).
4. Create a comprehensive `app/test-marquee/page.tsx` showcasing:
   - Image Marquee (including SVG).
   - Image + Text combination Marquee.
   - Video Marquee.
   - Two stacked horizontal marquees (one `reverse`, one normal).
   - Bidirectional Scroll-Linked Marquee.
5. Update the MDX documentation to reflect the new props and variations.
6. Execute the 4-step Release Workflow for `v0.1.5` and provide manual npm publish instructions.

## Technical Specifications

### 1. Component Updates (`registry/marquee/marquee.tsx`)
- Add `itemClassName?: string` to `MarqueeProps`.
- Update `marqueeVariants` to include:
  ```typescript
  bg: {
    none: '',
    surface: 'bg-dead-surface',
    elevated: 'bg-dead-elevated',
  },
  border: {
    none: '',
    default: 'border border-dead-border',
  }
  ```
- Update the `items` mapping to apply `itemClassName` and `overflow-hidden` to the wrapper, ensuring border-radius works perfectly on child images/videos:
  ```tsx
  const items = Array.from({ length: repeat }, (_, i) => (
    <div
      key={i}
      className={cn(
        'flex shrink-0 overflow-hidden', // overflow-hidden ensures border-radius clips children
        direction === 'vertical' && 'flex-col',
        direction === 'vertical' ? 'pb-[var(--gap)]' : 'pr-[var(--gap)]',
        itemClassName
      )}
      style={{ gap: `${gap}px` }}
    >
      {children}
    </div>
  ))
  ```
- **Bidirectional Scroll Fix**: Update the `scrollLinked` transform logic. Scrolling down increases `window.scrollY`. To move the marquee **right**, we need a **positive** `translateX`.
  ```tsx
  ...(scrollLinked
    ? {
        animation: 'none',
        transform:
          direction === 'vertical'
            ? 'translateY(calc(var(--scroll-progress, 0px) * -1))'
            : 'translateX(calc(var(--scroll-progress, 0px) * 1))', // Positive 1 = moves right on scroll down
      }
    : {})
  ```

### 2. Test Page (`app/test-marquee/page.tsx`)
Create a comprehensive test page with the following sections:
1. **Image & SVG Marquee**: Logos or images with `itemClassName="rounded-xl p-4"`.
2. **Image + Text Combo**: Cards containing an image and a paragraph, demonstrating that internal elements can have different fonts (e.g., `font-sans` for title, `font-serif` for body).
3. **Video Marquee**: Short, muted, looping videos with `itemClassName="rounded-2xl"`.
4. **Stacked Opposing Marquees**: Two marquees, one with `reverse={false}` and one with `reverse={true}`.
5. **Bidirectional Scroll-Linked**: A marquee with `scrollLinked={true}` and `direction="horizontal"`.

### 3. Documentation Update (`app/docs/components/marquee/page.mdx`)
- Update the `<ComponentCustomizer>` controls to include the new props:
  ```tsx
  controls={{
    direction: { type: "select", options: ["horizontal", "vertical"] },
    blur: { type: "select", options: ["none", "edges", "left", "right"] },
    speed: { type: "slider", min: 5, max: 60, step: 5 },
    reverse: { type: "select", options: ["true", "false"] },
    scrollLinked: { type: "select", options: ["true", "false"] },
    // Note: itemClassName, bg, and border are best demonstrated in code snippets rather than the customizer
  }}
  ```
- Add code snippets showing how to use `itemClassName="rounded-xl"` for images and how to mix fonts inside the children.

### 4. The 4-Step Release Workflow & Manual Publish
As defined in `AGENTS.md`, execute the git workflow for `v0.1.5`, and **CRITICALLY**, provide the manual npm publish commands at the end of your response.

## Implementation Steps

1. Update `registry/marquee/marquee.tsx` with the new variants and `itemClassName` logic.
2. Create `app/test-marquee/page.tsx` with all 5 required examples.
3. Update `app/docs/components/marquee/page.mdx`.
4. Bump `packages/cli/package.json` version to `0.1.5`.
5. Execute git commands: `add`, `commit`, `push`, `tag v0.1.5`, `push tag`.
6. Output GitHub Release UI instructions.
7. **Output the exact manual terminal commands to publish to npm.**
8. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] `itemClassName` correctly applies border-radius and clips images/videos.
- [ ] Background and border variants render correctly.
- [ ] Bidirectional scroll-linked marquee moves right on scroll down, left on scroll up.
- [ ] Test page displays all 5 required combinations without layout issues.
- [ ] Documentation customizer includes the new controls.
- [ ] Git tag `v0.1.5` is pushed.
- [ ] Manual npm publish instructions are clearly provided at the end.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `registry/marquee/marquee.tsx` (Update)
2. `app/test-marquee/page.tsx` (New/Update)
3. `app/docs/components/marquee/page.mdx` (Update)
4. `packages/cli/package.json` (Update version to 0.1.5)
5. `context/progress-tracker.md` (Update)