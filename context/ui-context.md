

Dead UI — UI Context & Design System

Theme
Dark mode dominant. The design language is stark, high-contrast,
and unapologetic. Think Vercel meets a metal band album cover.
The aesthetic is "premium darkness" — deep blacks, sharp whites,
and a single blood-red accent. Light mode is supported but
secondary. The documentation site and all default component
styles must look stunning in dark mode first.

Brand Voice
- Tagline: "Dead simple animations for React."
- Tone: Confident, slightly irreverent, self-aware.
- Messaging: "We killed the complexity. Dead simple. Dead smooth."

Colors
The project uses Tailwind CSS with a custom "Dead" palette
built on top of zinc/neutral grays.

Core Tokens
| Role              | CSS Variable / Tailwind    | Value / Usage                    |
|-------------------|----------------------------|----------------------------------|
| Page background   | --background / bg-dead-950 | #09090B (near-black)             |
| Surface (Cards)   | --card / bg-dead-900       | #18181B (dark zinc)              |
| Elevated surface  | --elevated / bg-dead-800   | #27272A (medium zinc)            |
| Primary text      | --foreground / text-dead-50| #FAFAFA (near-white)             |
| Muted text        | --muted / text-dead-400    | #A1A1AA (gray)                   |
| Primary accent    | --accent / bg-dead-red     | #DC2626 (blood red)              |
| Accent hover      | --accent-hover             | #EF4444 (lighter red)            |
| Border            | --border / border-dead-800 | #27272A (subtle dark border)     |
| Glow              | --glow                     | rgba(220, 38, 38, 0.15)         |

The Neutral Ramp Is Theme-Reactive
The eight neutral steps are declared TWICE in `app/globals.css` — once in
`:root` for light mode, once under `.dark` — and `@theme` emits each as
`var(--dead-*)` rather than as a fixed hex. Flipping the class on `<html>`
therefore re-points every `bg-dead-*` / `text-dead-*` / `border-dead-*` utility
in the codebase at once, which is why the site needs almost no `dark:` variants.

Each step keeps its ROLE, not its position:

| Step  | Role                | Dark     | Light    |
|-------|---------------------|----------|----------|
| 950   | Page background     | #09090B  | #FAFAFA  |
| 900   | Card surface        | #18181B  | #F4F4F5  |
| 800   | Border              | #27272A  | #D4D4D8  |
| 700   | Hover surface       | #3F3F46  | #A1A1AA  |
| 600   | Dim label text      | #52525B  | #71717A  |
| 400   | Muted body text     | #A1A1AA  | #52525B  |
| 200   | Body text           | #E4E4E7  | #27272A  |
| 50    | Foreground text     | #FAFAFA  | #09090B  |

Contrast on the light page background (#FAFAFA): `600` = 4.8:1,
`400` = 7.7:1, `200` = 13.7:1, `50` = 19.6:1 — all above the 4.5:1 floor below,
which matters most for `600`, used for 10px uppercase labels. The accent
(#DC2626) is theme-independent at 4.8:1 in both modes.

Consequence for authoring: never hard-code a neutral from the raw Tailwind
palette (`zinc-400`, `white`, `black`) in site chrome. Use a `dead-*` step, or —
if the value must be a raw palette colour — name a light value first and the
dark one under `dark:`. The tier badges are the only sites that still need this.

Semantic Colors
| Role              | Tailwind Classes                        | Usage                          |
|-------------------|-----------------------------------------|--------------------------------|
| Success / Active  | text-green-500 / bg-green-500/10        | Completed states, live demos   |
| Warning / Beta    | text-yellow-500 / bg-yellow-500/10      | Experimental features          |
| Error / Destructive| text-red-500 / bg-red-500/10           | Delete actions, errors         |
| Info / Pro        | text-purple-500 / bg-purple-500/10      | Pro tier badges, premium tags  |
| Neutral / Free    | text-zinc-400 / bg-zinc-400/10          | Free tier badges               |

Interactive States
| State       | Tailwind Pattern                              |
|-------------|-----------------------------------------------|
| Hover       | hover:bg-dead-800 / hover:text-dead-50        |
| Active      | active:bg-dead-700                            |
| Focus       | focus:ring-2 focus:ring-dead-red focus:ring-offset-2 focus:ring-offset-dead-950 |
| Disabled    | opacity-40 cursor-not-allowed                 |

Typography
| Role            | Font              | Class          | Size / Weight          |
|-----------------|-------------------|----------------|------------------------|
| Display / Hero  | Geist Mono        | font-mono      | text-5xl font-bold     |
| Page title      | Geist Sans        | font-sans      | text-3xl font-bold     |
| Section heading | Geist Sans        | font-sans      | text-xl font-semibold  |
| Card title      | Geist Sans        | font-sans      | text-base font-medium  |
| Body text       | Geist Sans        | font-sans      | text-sm font-normal    |
| Code / Terminal | JetBrains Mono    | font-mono      | text-sm font-normal    |
| Label / Small   | Geist Sans        | font-sans      | text-xs font-medium    |

Note: `font-mono` MUST be used for all CLI commands, code
snippets, prop names, and version numbers. The terminal
aesthetic is core to the brand.

Spacing System
Use a consistent 4px base unit:
| Token  | Value | Usage                          |
|--------|-------|--------------------------------|
| gap-1  | 4px   | Inline element spacing         |
| gap-2  | 8px   | Compact lists, icon + text     |
| gap-4  | 16px  | Card padding, standard gaps    |
| gap-6  | 24px  | Section spacing                |
| gap-8  | 32px  | Page section dividers          |
| gap-12 | 48px  | Major section breaks           |
| gap-16 | 64px  | Hero to content separation     |

Border Radius
| Context          | Class       |
|------------------|-------------|
| Inline / Inputs  | rounded-md  |
| Cards / panels   | rounded-lg  |
| Modals / overlays| rounded-xl  |
| Badges / Pills   | rounded-full|
| Terminal blocks  | rounded-lg  |

Shadows & Elevation
| Level    | Tailwind Class                          | Usage                    |
|----------|-----------------------------------------|--------------------------|
| Resting  | shadow-none                             | Cards at rest (flat)     |
| Subtle   | shadow-[0_0_15px_rgba(220,38,38,0.1)]  | Glow effects on hover    |
| Raised   | shadow-lg shadow-black/50               | Dropdowns, popovers      |
| Overlay  | shadow-2xl shadow-black/80              | Dialogs, modals          |

Note: Dead UI favors FLAT design with glow accents over
traditional box shadows. Use red glow sparingly for emphasis.

Animation Standards (Library-Wide Defaults)
| Type              | Duration | Easing              | Usage                    |
|-------------------|----------|---------------------|--------------------------|
| Micro-interaction | 200ms    | ease-out            | Hover, focus, toggle     |
| Standard enter    | 600ms    | power2.out (GSAP)   | Scroll reveals, fades    |
| Dramatic enter    | 1000ms   | power3.out (GSAP)   | Hero text, large reveals |
| Spring            | -        | stiffness: 300, damping: 20 | Magnetic, elastic effects |
| Loop              | 2-4s     | linear              | Marquee, gradient rotate |
| Scroll scrub      | -        | scrub: 1 (GSAP)     | Scroll-linked animations |

All durations must be configurable via component props
(e.g., `duration={0.8}`). The values above are DEFAULTS only.

Component Library Conventions
- Variant system: `class-variance-authority` (cva).
- Class merging: `cn()` utility (clsx + tailwind-merge).
- Icons: `lucide-react`. Stroke width 1.5px default.
  Sizes: `size={16}` inline, `size={20}` buttons,
  `size={24}` empty states.
- No external icon libraries besides lucide-react.

Layout Patterns
Landing Page: Full-viewport hero with live animation demo,
terminal-style CLI command, feature grid, component gallery,
pricing table, footer. Dark background throughout.

Documentation Shell: Sticky left sidebar (`w-[260px]`) whose header is a
sticky block holding a row of icon-only category filters (each with a tooltip to
the RIGHT of the column) above a search bar whose placeholder states how many
components the active category holds, then a scrollable menu: an unfiltered
"Get Started" pair (Introduction, Installation) followed by the filtered
"Components" list. Hovering a component link floats a 320x208 live preview box to
the right of the sidebar, springing to the hovered row's vertical position.
Main content area has a live preview at top and code/props below.

Component Preview Cards: Dark surface (`bg-dead-900`) with
subtle border (`border-dead-800`), rounded corners, and
optional red glow on hover. Preview area has a subtle
grid pattern background for visual depth.

Terminal Blocks: Monospace font, dark background
(`bg-dead-950`), green or white text, `$` prompt prefix,
rounded corners. Used for CLI commands throughout docs.

State Patterns
Loading States
- Skeleton: `animate-pulse bg-dead-800 rounded` on dark bg.
- Spinner: `Loader2` icon from lucide with `animate-spin`.
- Page-level: Skeleton matches expected layout shape.

Empty States
- Centered `Skull` or `Ghost` icon from lucide +
  `text-sm text-dead-400` message.
- Brand-aligned copy: "Nothing here yet. It's dead quiet."

Error States
- Inline: `text-red-500 text-xs` below invalid field.
- Toast: `sonner` with red accent for mutation errors.
- Full-page: Centered skull icon + "Something died."
  message + Retry button.

Accessibility
- All interactive elements reachable via Tab key.
- Focus ring: `focus:ring-2 focus:ring-dead-red
  focus:ring-offset-2 focus:ring-offset-dead-950`.
- Modal focus trap: First element focused on open,
  Escape closes.
- `prefers-reduced-motion`: All animations disabled,
  instant state changes.
- Color contrast: Minimum 4.5:1 for text on dark bg.
- Never use color alone to convey meaning.