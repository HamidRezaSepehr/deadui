"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Ghost,
  Image,
  LayoutGrid,
  MousePointer2,
  Scroll,
  Search,
  Square,
  Type,
  X,
} from "lucide-react";

import {
  CinematicTextPreview,
  GradientBorderPreview,
  ImageTrailPreview,
  MagneticButtonPreview,
  MarqueePreview,
  RainbowButtonPreview,
  ScrollScrubPreview,
  SpotlightCardPreview,
  StaggeredGridPreview,
  TextFillPreview,
  WebGLTrailPreview,
} from "@/components/docs/previews";
import type { DocsNavGroup, DocsNavItem, DocsTier } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";

/**
 * The filter rail.
 *
 * Icon-only by design (the spec's ask, and it is what keeps six categories inside
 * a 260px column). `aria-label` carries the full name for assistive tech and
 * `aria-pressed` carries the selected state, because neither survives in a glyph.
 */
const CATEGORIES = {
  all: { icon: LayoutGrid, label: "All Components" },
  text: { icon: Type, label: "Text Animations" },
  buttons: { icon: Square, label: "Buttons" },
  scroll: { icon: Scroll, label: "Scroll Effects" },
  media: { icon: Image, label: "Media & Layout" },
  cursor: { icon: MousePointer2, label: "Cursor Effects" },
} as const;

type CategoryId = keyof typeof CATEGORIES;

type ComponentCategory = Exclude<CategoryId, "all">;

interface ComponentMeta {
  category: ComponentCategory;
  preview: ReactNode;
}

/**
 * Category + hover preview for every documented component.
 *
 * This is the ONE place the mapping lives: the filter rail, the dynamic search
 * placeholder and the floating preview box all read from it, so a component
 * cannot be filterable in one and previewable in another. The keys are registry
 * names — `registry.json` is the source of truth for those, and `docs-nav.ts`
 * already emits them.
 *
 * Three of the eleven entries (`rainbow-button`, `marquee`, `gradient-border`)
 * render the REAL registry component. Those three are pure CSS loops with no
 * ScrollTrigger, no pointer dependency and no WebGL context, so they are already
 * auto-playing and a stand-in could only be a less accurate impression of them.
 * The other eight are documented individually in `components/docs/previews/`,
 * which explains each substitution.
 */
const COMPONENT_META: Record<string, ComponentMeta> = {
  "cinematic-text": { category: "text", preview: <CinematicTextPreview /> },
  "text-fill-animation": { category: "text", preview: <TextFillPreview /> },
  "magnetic-button": { category: "buttons", preview: <MagneticButtonPreview /> },
  "rainbow-button": { category: "buttons", preview: <RainbowButtonPreview /> },
  "scroll-scrub": { category: "scroll", preview: <ScrollScrubPreview /> },
  "staggered-grid": { category: "scroll", preview: <StaggeredGridPreview /> },
  marquee: { category: "media", preview: <MarqueePreview /> },
  "spotlight-card": { category: "media", preview: <SpotlightCardPreview /> },
  "gradient-border": { category: "media", preview: <GradientBorderPreview /> },
  "image-trail": { category: "cursor", preview: <ImageTrailPreview /> },
  "webgl-image-trail": { category: "cursor", preview: <WebGLTrailPreview /> },
};

/**
 * Static destinations above the component list.
 *
 * Never filtered — by category or by search. The spec is explicit that these two
 * stay put, and a filter that can hide the way out of the page is a worse bug
 * than a filter that is slightly too permissive.
 *
 * "Installation" points at the landing page's `#get-started` block rather than a
 * docs route: there is no `app/docs/installation/page.mdx`, and the CLI install
 * steps exist only there. Inventing a `/docs/installation` href would 404, which
 * is the exact failure `docs-nav.ts` exists to prevent.
 */
const GET_STARTED: { title: string; href: string }[] = [
  { title: "Introduction", href: "/docs" },
  { title: "Installation", href: "/#get-started" },
];

/**
 * Measured, not guessed: the floating box is `h-[208px]` — a 176px stage plus a
 * 32px header and its border — and this constant is what the vertical clamp is
 * computed from. Change one and you must change the other.
 */
const PREVIEW_BOX_HEIGHT = 208;

/** Gap kept between the box and the top and bottom of the sidebar. */
const PREVIEW_BOX_MARGIN = 12;

interface HoveredComponent {
  name: string;
  title: string;
  tier: DocsTier;
  /** Top of the box, in pixels from the top of the sidebar shell. */
  y: number;
}

export interface SidebarProps {
  groups: DocsNavGroup[];
}

export function Sidebar({ groups }: SidebarProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [category, setCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<HoveredComponent | null>(null);

  // The box is anchored to this element rather than to the scrolling list, so it
  // holds still while the list scrolls underneath it.
  const shellRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const inCategory = useCallback(
    (item: DocsNavItem) => {
      if (category === "all") return true;
      const meta = COMPONENT_META[item.name];
      return meta ? meta.category === category : false;
    },
    [category],
  );

  /**
   * The placeholder counts the CATEGORY, not the category-plus-query. The spec
   * asks the placeholder to reflect the active filter, and a count that kept
   * changing while you were still typing would be a number nobody could act on.
   */
  const categoryCount = useMemo(
    () => items.filter(inCategory).length,
    [items, inCategory],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      if (!inCategory(item)) return false;
      if (!needle) return true;
      return `${item.title} ${item.name} ${item.description}`
        .toLowerCase()
        .includes(needle);
    });
  }, [inCategory, items, query]);

  const handleHover = useCallback(
    (event: PointerEvent<HTMLAnchorElement>, item: DocsNavItem) => {
      const shell = shellRef.current;
      if (!shell || !COMPONENT_META[item.name]) return;

      // The rects are read HERE, inside the event, never during render:
      // `getBoundingClientRect` is a layout read, and calling it in the render
      // body would force a synchronous reflow on every commit.
      const shellRect = shell.getBoundingClientRect();
      const linkRect = event.currentTarget.getBoundingClientRect();
      const centred = linkRect.top - shellRect.top + linkRect.height / 2;
      const lowest = shellRect.height - PREVIEW_BOX_HEIGHT - PREVIEW_BOX_MARGIN;

      setHovered({
        name: item.name,
        title: item.title,
        tier: item.tier,
        y: Math.max(
          PREVIEW_BOX_MARGIN,
          Math.min(centred - PREVIEW_BOX_HEIGHT / 2, lowest),
        ),
      });
    },
    [],
  );

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 border-r border-dead-800 lg:block">
      <div ref={shellRef} className="relative flex h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Sticky header. `bg-background` rather than `bg-dead-950` so the
              header tracks whichever mode is active instead of punching a dark
              bar through a light page. */}
          <div className="sticky top-0 z-20 border-b border-dead-800 bg-background px-4 pb-3 pt-6">
            <div
              role="group"
              aria-label="Filter components by category"
              className="flex items-center gap-1"
            >
              {(Object.keys(CATEGORIES) as CategoryId[]).map((id) => (
                <FilterButton
                  key={id}
                  id={id}
                  active={category === id}
                  onSelect={() => setCategory(id)}
                />
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-md border border-dead-800 bg-dead-900 px-2.5 focus-within:border-dead-700">
              <Search
                className="size-3.5 shrink-0 text-dead-600"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder(categoryCount)}
                aria-label="Filter components"
                className="h-8 w-full min-w-0 bg-transparent font-mono text-xs text-dead-50 outline-none placeholder:text-dead-600"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear filter"
                  className="grid size-5 shrink-0 place-items-center rounded text-dead-600 transition-colors duration-200 ease-out hover:text-dead-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
                >
                  <X className="size-3" strokeWidth={1.5} />
                </button>
              ) : null}
            </div>
          </div>

          <nav
            aria-label="Documentation"
            className="flex flex-1 flex-col gap-8 px-4 pb-24 pt-6"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-dead-600">
                Get Started
              </p>
              <ul className="mt-3 space-y-1">
                {GET_STARTED.map((page) => (
                  <li key={page.href}>
                    <SidebarLink
                      href={page.href}
                      active={pathname === page.href}
                    >
                      {page.title}
                    </SidebarLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-dead-600">
                Components
                <span className="ml-2 text-dead-700">{visible.length}</span>
              </p>

              {visible.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {visible.map((item) => {
                    const active = item.href !== null && pathname === item.href;

                    return (
                      <li key={item.name}>
                        {item.href ? (
                          <SidebarLink
                            href={item.href}
                            active={active}
                            onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) =>
                              handleHover(event, item)
                            }
                            onPointerLeave={() => setHovered(null)}
                          >
                            <span className="truncate">{item.title}</span>
                            <TierBadge tier={item.tier} />
                          </SidebarLink>
                        ) : (
                          // No page.mdx yet — rendered, but not a link, so the
                          // sidebar never advertises a 404. Also not hoverable:
                          // there would be nothing behind the preview but a stub.
                          <span
                            aria-disabled="true"
                            className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm text-dead-600 opacity-60"
                          >
                            <span className="truncate">{item.title}</span>
                            <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest">
                              Soon
                            </span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dead-800 px-3 py-6 text-center">
                  <Ghost
                    className="size-5 text-dead-700"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <p className="text-xs text-dead-600">
                    Nothing here yet. It&apos;s dead quiet.
                  </p>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/*
          THE FLOATING PREVIEW BOX.

          `AnimatePresence` around ONE element with a stable `key` means the box
          is NOT remounted when the pointer moves from one link to the next, so
          Framer Motion springs the existing `y` from the old row to the new one
          instead of cross-fading two separate boxes — that continuous glide IS
          the effect. The box unmounts on pointer leave, which is what confines it
          to component links.

          `pointer-events-none` is not cosmetic: without it the box would intercept
          the pointer as it travels rightwards off the link, firing
          `onPointerLeave` early and making the preview impossible to actually read.
        */}
        <AnimatePresence>
          {hovered && COMPONENT_META[hovered.name] ? (
            <motion.div
              key="component-preview"
              aria-hidden="true"
              initial={{ opacity: 0, y: hovered.y }}
              animate={{ opacity: 1, y: hovered.y }}
              exit={{ opacity: 0, y: hovered.y }}
              transition={{
                type: shouldReduceMotion ? "tween" : "spring",
                duration: shouldReduceMotion ? 0 : undefined,
                stiffness: shouldReduceMotion ? undefined : 320,
                damping: shouldReduceMotion ? undefined : 30,
                opacity: { duration: shouldReduceMotion ? 0 : 0.15 },
              }}
              className="pointer-events-none absolute left-full top-0 z-30 ml-4 h-[208px] w-[320px] overflow-hidden rounded-xl border border-dead-800 bg-card shadow-lg"
            >
              <div className="flex h-8 items-center justify-between gap-2 border-b border-dead-800 px-3">
                <span className="truncate font-mono text-[10px] uppercase tracking-widest text-dead-400">
                  {hovered.title}
                </span>
                <TierBadge tier={hovered.tier} />
              </div>
              <div className="h-[176px]">
                {COMPONENT_META[hovered.name].preview}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </aside>
  );
}

/** `"Filter 2 components"`, singularised at 1. */
function searchPlaceholder(count: number): string {
  return `Filter ${count} component${count === 1 ? "" : "s"}`;
}

function FilterButton({
  id,
  active,
  onSelect,
}: {
  id: CategoryId;
  active: boolean;
  onSelect: () => void;
}) {
  const { icon: Icon, label } = CATEGORIES[id];

  return (
    /*
     * `contents` is LOAD-BEARING, not a layout shortcut.
     *
     * The spec wants the tooltip to the right of the SIDEBAR, and an absolutely
     * positioned tooltip resolves against its nearest positioned ancestor. A
     * normal `relative` wrapper here is the 32px button, so `left-full` would
     * place the tooltip 32px past that button — still inside the 260px column,
     * and its apparent position would shift with each button.
     *
     * `display: contents` removes the wrapper's box entirely, so the containing
     * block becomes the sticky header (the nearest positioned ancestor) and
     * `left-full` resolves against the full 259px sidebar. `group-hover` still
     * works, because the class match is against the DOM parent and not against
     * the box.
     *
     * `top-10` is the button's own centre: 24px of `pt-6` plus half of the
     * button's 32px. Every button in the row shares it, which is why one
     * constant covers all six.
     */
    <div className="group contents">
      <button
        type="button"
        onClick={onSelect}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "grid size-8 place-items-center rounded-md border transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red",
          active
            ? "border-dead-700 bg-dead-900 text-dead-red"
            : "border-transparent text-dead-400 hover:border-dead-800 hover:bg-dead-900 hover:text-dead-50",
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </button>

      {/* Tooltip to the RIGHT of the sidebar, per spec. Pure CSS off the
          button's `group`, so it costs no state and cannot lag the pointer. It is
          `aria-hidden` rather than `role="tooltip"`, because the button already
          carries the same string in `aria-label` and a tooltip with no
          `aria-describedby` pointing at it announces nothing. */}
      <span
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-full top-10 z-40 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-dead-800 bg-dead-900 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-dead-50 opacity-0 shadow-lg transition-opacity duration-200 ease-out group-hover:visible group-hover:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onPointerEnter,
  onPointerLeave,
  children,
}: {
  href: string;
  active: boolean;
  onPointerEnter?: (event: PointerEvent<HTMLAnchorElement>) => void;
  onPointerLeave?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red",
        active
          ? "bg-dead-900 font-medium text-dead-50 shadow-[inset_2px_0_0_0_var(--color-dead-red)]"
          : "text-dead-400 hover:bg-dead-900/60 hover:text-dead-50",
      )}
    >
      {children}
    </Link>
  );
}

export function TierBadge({ tier }: { tier: DocsTier }) {
  return (
    /*
     * `dark:` is used here, and this is the ONE place on the site that needs it.
     * These two colours are the only values in the codebase that are not `dead-*`
     * tokens, so they cannot follow the theme automatically — and the values that
     * worked against a near-black sidebar (`zinc-400`, `purple-400`) sit at ~2.2:1
     * on the light page background, well under the 4.5:1 floor in ui-context.md.
     * So each tier names a light value first and the dark value under `dark:`.
     */
    <span
      className={cn(
        "shrink-0 rounded-full px-1.5 py-px font-mono text-[9px] uppercase tracking-widest",
        tier === "pro"
          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
          : "bg-zinc-400/10 text-zinc-500 dark:text-zinc-400",
      )}
    >
      {tier}
    </span>
  );
}