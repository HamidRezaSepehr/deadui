# Feature 26: React Bits-Inspired Documentation UI Overhaul

## Overview

Redesign the Dead UI documentation interface to match the premium, highly interactive UX of sites like React Bits. This includes a refined top navigation with live GitHub stars and theme toggling, and a completely overhauled left sidebar featuring icon-based category filters, dynamic search placeholders, sticky headers, and a smooth, floating live-preview box that appears when hovering over component links.

## Goals

1. Implement a top navigation bar with a system-aware dark/light mode toggle (icon only) and a live GitHub star count button.
2. Build an advanced, scrollable left sidebar with sticky category filters (icon-only with right-side tooltips) and a dynamic search bar.
3. Create a smooth, floating "Preview Box" that appears to the right of the sidebar when hovering over component links, displaying a lightweight, auto-playing live demo of the component.
4. Ensure "Get Started" menu items remain unfiltered, while "Components" are dynamically filtered by category.

## Technical Specifications

### 1. Dependencies
Ensure the following are installed:
- `next-themes` (for robust, system-aware dark/light mode)
- `framer-motion` (for smooth preview box animations)
- `lucide-react` (for all UI icons)

### 2. Live GitHub Stars Utility (`lib/github.ts`)
Create a simple, cached fetcher to get the star count without hitting rate limits.
```typescript
export async function getGitHubStars() {
  try {
    const res = await fetch('https://api.github.com/repos/HamidRezaSepehr/deadui', {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.stargazers_count
  } catch {
    return 0
  }
}
```

### 3. Top Navigation (`components/docs/top-nav.tsx`)
- **Theme Toggle**: Use `next-themes` (`useTheme`). Render a `Sun` icon for dark mode (click to switch to light) and a `Moon` icon for light mode (click to switch to dark). No text label. Default to system preference.
- **GitHub Button**: Fetch stars using `getGitHubStars()`. Display the GitHub icon, "Star on GitHub", and the live count.

### 4. Advanced Sidebar (`components/docs/sidebar.tsx`)
The sidebar must be structured as follows:
- **Sticky Header (`sticky top-0 z-20 bg-background`)**:
  - **Filter Tabs**: A horizontal row of icons (e.g., `LayoutGrid` for All, `Type` for Text, `MousePointer2` for Cursor, `Scroll` for Scroll, `Image` for Media, `Square` for Buttons). 
  - **Tooltips**: Hovering an icon shows a small popover/tooltip to the *right* of the sidebar (e.g., `absolute left-full ml-2`).
  - **Search Bar**: Below filters. Placeholder dynamically updates: `"Filter {count} components"` based on the active category.
- **Scrollable Menu (`overflow-y-auto flex-1`)**:
  - **"Get Started" Section**: Links to Introduction, Installation. *Never filtered out*.
  - **"Components" Section**: List of components. Filtered dynamically based on the active category state.
- **Floating Preview Box**: 
  - A `motion.div` positioned absolutely to the right of the sidebar (`left-full ml-4`).
  - Tracks the `hoveredComponent` state.
  - Uses Framer Motion `layout` or `y` animation to smoothly glide to the vertical position of the hovered link.
  - Renders a lightweight, auto-playing preview component (e.g., `<RainbowButton variant="default">Hover Me</RainbowButton>`) based on the hovered component's name.

### 5. Component Categories Mapping
Define a strict mapping for filtering:
```typescript
const CATEGORIES = {
  all: { icon: LayoutGrid, label: 'All Components' },
  text: { icon: Type, label: 'Text Animations' },
  buttons: { icon: Square, label: 'Buttons' },
  scroll: { icon: Scroll, label: 'Scroll Effects' },
  media: { icon: Image, label: 'Media & Layout' },
  cursor: { icon: MousePointer2, label: 'Cursor Effects' },
}

const COMPONENT_META = [
  { name: 'cinematic-text', category: 'text', preview: <CinematicTextPreview /> },
  { name: 'text-fill-animation', category: 'text', preview: <TextFillPreview /> },
  { name: 'magnetic-button', category: 'buttons', preview: <MagneticButtonPreview /> },
  { name: 'rainbow-button', category: 'buttons', preview: <RainbowButtonPreview /> },
  { name: 'scroll-scrub', category: 'scroll', preview: <ScrollScrubPreview /> },
  { name: 'staggered-grid', category: 'scroll', preview: <StaggeredGridPreview /> },
  { name: 'marquee', category: 'media', preview: <MarqueePreview /> },
  { name: 'spotlight-card', category: 'media', preview: <SpotlightCardPreview /> },
  { name: 'gradient-border', category: 'media', preview: <GradientBorderPreview /> },
  { name: 'image-trail', category: 'cursor', preview: <ImageTrailPreview /> },
  { name: 'webgl-image-trail', category: 'cursor', preview: <WebGLTrailPreview /> },
]
```
*(Note: The AI should create simple, lightweight wrapper components for the `preview` field that auto-animate without requiring user interaction).*

## Implementation Steps

1. Install `next-themes` and ensure `ThemeProvider` wraps the app in `app/layout.tsx`.
2. Create `lib/github.ts` for star fetching.
3. Update `components/docs/top-nav.tsx` with the theme toggle and GitHub star button.
4. Completely rewrite `components/docs/sidebar.tsx` to include the sticky filter icons, dynamic search placeholder, categorized lists, and the Framer Motion floating preview box.
5. Create lightweight preview components (e.g., `components/docs/previews/rainbow-button-preview.tsx`) for the sidebar hover state.
6. Verify the build: `npm run build`.
7. Update `context/progress-tracker.md`.

## Verification Checklist

- [ ] Theme toggle switches between light/dark mode and respects system preference on first load.
- [ ] GitHub button displays a live (or cached) star count.
- [ ] Sidebar filter icons show right-side tooltips on hover.
- [ ] Search placeholder dynamically updates based on the selected filter category.
- [ ] "Get Started" links remain visible regardless of the active filter.
- [ ] Floating preview box appears smoothly to the right of the sidebar *only* when hovering over component links.
- [ ] `npm run build` passes with zero errors.
- [ ] `progress-tracker.md` is updated.

## Files to Create/Update

1. `lib/github.ts` (New)
2. `components/docs/top-nav.tsx` (Update)
3. `components/docs/sidebar.tsx` (Complete Rewrite)
4. `components/docs/previews/` (New directory with lightweight preview components)
5. `app/layout.tsx` (Update to include `ThemeProvider`)
6. `context/progress-tracker.md` (Update)