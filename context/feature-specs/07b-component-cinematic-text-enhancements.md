# Feature 07b: Cinematic Text Scroll Enhancements

## Overview

Upgrade the `CinematicText` component to support advanced GSAP ScrollTrigger configurations. Users must have full control over **when** the animation triggers (position), **how many times** it plays (repeat behavior), and **whether** it is tied to the scroll position (scrubbing/scroll-linked). This transforms the component from a simple "fade-in on scroll" tool into a professional-grade animation primitive.

## Goals

1. Expose `start` and `end` props to define exactly when the animation triggers relative to the viewport.
2. Expose a `once` prop to control whether the animation plays only the first time or every time it enters the viewport.
3. Expose a `scrub` prop to toggle between a triggered animation (plays on enter) and a scroll-linked animation (progress tied to scrollbar).
4. Maintain backwards compatibility: existing usage without these props must behave exactly as before.

## Technical Specifications

### New Props for `CinematicTextProps`

Add the following optional props to the interface:

```typescript
export interface CinematicTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cinematicTextVariants> {
  children: string
  duration?: number
  delay?: number
  stagger?: number
  splitBy?: 'chars' | 'words' | 'lines'
  
  // New Scroll Configuration Props
  start?: string        // Default: 'top 85%' (e.g., 'top center', '30% bottom')
  end?: string          // Default: 'bottom 15%'
  once?: boolean        // Default: true (plays once). Set false to repeat on scroll back.
  scrub?: boolean | number // Default: false. If true, animation progress links to scroll.
}
```

### Implementation Logic in `useEffect`

The `useEffect` must conditionally build the ScrollTrigger configuration based on the new props:

1. **Scrubbing (Scroll-Linked):**
   - If `scrub` is `true`, pass `scrub: true` to the `gsap.from()` config.
   - When `scrub` is active, GSAP ignores `toggleActions` and `once`. The animation plays forward/backward as the user scrolls.

2. **Repeat Behavior (`once`):**
   - If `scrub` is `false` (standard trigger mode):
     - If `once === true` (default), pass `once: true` to ScrollTrigger.
     - If `once === false`, pass `toggleActions: 'play none none reverse'` (or similar) to allow replaying when scrolling back up.

3. **Trigger Position (`start` / `end`):**
   - Pass the `start` and `end` props directly to the ScrollTrigger config.
   - Use the defaults from `SCROLL_TRIGGER_DEFAULTS` if not provided.

### Updated Component Code Structure

```typescript
// Inside useEffect, when building gsap.from():
gsap.from(targetElements, {
  ...initialStates[variant || 'blur-in'],
  duration,
  delay,
  stagger,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: containerRef.current,
    start: start || SCROLL_TRIGGER_DEFAULTS.start,
    end: end || SCROLL_TRIGGER_DEFAULTS.end,
    // Conditional logic:
    ...(scrub ? { scrub: typeof scrub === 'number' ? scrub : true } : {}),
    ...(!scrub && once !== false ? { once: true } : {}),
    ...(!scrub && once === false ? { toggleActions: 'play none none reverse' } : {}),
  },
})
```

### Test Page Updates: `app/test-cinematic-text/page.tsx`

Update the test page to demonstrate all three new capabilities. Add distinct sections with labels:

1. **Default Behavior (Reference):** Standard fade-up, plays once.
2. **Custom Trigger Position:** A component that triggers when its *center* hits the *center* of the viewport (`start="center center"`).
3. **Repeat on Scroll:** A component that fades up when scrolling down, and reverses (fades out) when scrolling back up (`once={false}`).
4. **Scroll-Linked (Scrubbed):** A component where the text blur/fade progress is directly tied to the scrollbar. As you scroll slowly, the animation plays slowly. As you scroll fast, it plays fast (`scrub={true}`).

## Implementation Steps

1. **Update Component:** Modify `registry/cinematic-text/cinematic-text.tsx` to include the new props and conditional ScrollTrigger logic.
2. **Update Test Page:** Modify `app/test-cinematic-text/page.tsx` to add the 4 demonstration sections described above. Add plenty of vertical spacing (`h-[100vh]` divs) between sections so the user can scroll and test the triggers properly.
3. **Verify Build:** Run `npm run build`.
4. **Verify Visuals:** Run `npm run dev`, go to `/test-cinematic-text`, and test each section:
   - Scroll down and up to test the "Repeat" section.
   - Scroll slowly over the "Scrubbed" section to verify the animation tracks the scrollbar.

## Verification Checklist

- [ ] `CinematicTextProps` interface includes `start`, `end`, `once`, and `scrub`.
- [ ] Default behavior (no new props) is identical to before (plays once, triggers at 85%).
- [ ] `start="center center"` triggers exactly when the element is centered.
- [ ] `once={false}` causes the animation to reverse when scrolling back up.
- [ ] `scrub={true}` makes the animation progress follow the scrollbar position exactly.
- [ ] `prefers-reduced-motion` still works (skips animation entirely).
- [ ] `npm run build` passes with zero errors.
- [ ] `progress-tracker.md` is updated.

## Constraints

- Do NOT change the default values. Existing users of the component must not see any behavior change.
- Do NOT remove the `prefers-reduced-motion` check.
- Ensure `scrub` and `once`/`toggleActions` are mutually exclusive in the GSAP config (GSAP ignores toggleActions if scrub is true, but keep the code clean).

## Files to Update

1. `registry/cinematic-text/cinematic-text.tsx`
2. `app/test-cinematic-text/page.tsx`
3. `context/progress-tracker.md`