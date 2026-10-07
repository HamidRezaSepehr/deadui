"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Box, Moon, Rocket, SearchIcon, Skull, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { DocsNavItem } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";

/**
 * Search scoring for the palette.
 *
 * cmdk's built-in filter is a fuzzy *subsequence* matcher: it only requires the
 * query's characters to appear in order, so against long descriptions
 * "marquee" also matches "Scroll-Linked Media Scrub" (m-a-r from "media", q from
 * "scrubbing", …) and the palette looks broken. This scorer instead requires
 * every query word to prefix-match a word in the value, and ranks exact-word and
 * early hits higher, which is what people expect from a component name search.
 *
 * Returns a score > 0 for a match and 0 for a miss, matching cmdk's contract.
 */
function scoreMatch(value: string, query: string): number {
  const needle = query.trim().toLowerCase();
  if (!needle) return 1;

  const haystack = value.toLowerCase();
  if (haystack === needle) return 1000;

  const words = haystack.split(/[\s\-_/.]+/).filter(Boolean);
  let score = 0;
  for (const term of needle.split(/\s+/)) {
    const index = words.findIndex((word) => word.startsWith(term));
    if (index === -1) return 0;
    score += 20 - Math.min(index, 10);
    if (words[index] === term) score += 10;
  }
  return score;
}

/**
 * Placeholder until the real repository coordinates land. The same value is
 * used by `DEFAULT_REGISTRY_BASE_URL` in the CLI and must be changed there too.
 */
const GITHUB_URL = "https://github.com/HamidRezaSepehr/deadui";

/**
 * Platform-correct shortcut label, read through `useSyncExternalStore` rather
 * than a `useEffect` + `useState` pair: the server has no `navigator`, so the
 * server snapshot is what hydrates (always the Mac glyph), and the real value
 * swaps in on the first client render with no extra pass and no cascading
 * re-render.
 */
const subscribeToNothing = () => () => {};

function getShortcutSnapshot(): string {
  const platform =
    typeof navigator === "undefined"
      ? ""
      : navigator.platform || navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘K" : "Ctrl K";
}

function getShortcutServerSnapshot(): string {
  return "⌘K";
}

/**
 * "Has React hydrated yet?", through the same `useSyncExternalStore` trick as the
 * shortcut glyph above — server snapshot `false`, client snapshot `true`.
 *
 * The obvious `useEffect(() => setMounted(true), [])` is the shape this file's
 * own lint config rejects (`react-hooks/set-state-in-effect`): it is a guaranteed
 * extra render pass on every mount, purely to learn something React already
 * knows. Here the store compares the two snapshots during hydration and re-renders
 * once if they disagree — same single pass, but driven by the reconciler instead
 * of by a synthetic effect.
 */
function getMountedSnapshot(): boolean {
  return true;
}

function getMountedServerSnapshot(): boolean {
  return false;
}

export interface TopNavProps {
  items: DocsNavItem[];
  /**
   * Live star count, fetched on the server by `lib/github.ts`. Passed in rather
   * than fetched here because `TopNav` is a Client Component and the GitHub API
   * must never be called from the browser.
   */
  stars: number;
}

export function TopNav({ items, stars }: TopNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shortcut = useSyncExternalStore(
    subscribeToNothing,
    getShortcutSnapshot,
    getShortcutServerSnapshot,
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setOpen((previous) => !previous);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dead-800 bg-dead-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-dead-50 transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
        >
          <SkullIcon />
          DEAD UI
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink href="/docs">Docs</NavLink>
          <NavLink href="/docs/components/cinematic-text">Components</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden h-9 items-center gap-2 rounded-md border border-dead-800 bg-dead-900 px-3 font-mono text-xs text-dead-400 transition-colors duration-200 ease-out hover:border-dead-700 hover:text-dead-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red md:inline-flex"
          >
            <GithubMark />
            <span className="hidden lg:inline">Star on GitHub</span>
            <span className="tabular-nums text-dead-50">{formatStars(stars)}</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 items-center gap-2 rounded-md border border-dead-800 bg-dead-900 pl-3 pr-2 text-xs text-dead-400 transition-colors duration-200 ease-out hover:border-dead-700 hover:text-dead-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
          >
            <SearchIcon className="size-3.5" />
            <span className="hidden sm:inline">Search docs…</span>
            <kbd className="rounded border border-dead-800 bg-dead-950 px-1.5 py-0.5 font-mono text-[10px] text-dead-400">
              {shortcut}
            </kbd>
          </button>

          <ThemeToggle />

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#get-started">
              <RocketIcon />
              Get Started
            </a>
          </Button>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} filter={scoreMatch}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search components…"
        />
        <CommandList>
          <CommandEmpty>Nothing here yet. It&apos;s dead quiet.</CommandEmpty>

          <CommandGroup heading="Components">
            {items.map((item) => (
              <CommandItem
                key={item.name}
                value={`${item.title} ${item.name} ${item.description}`}
                // Components whose docs page does not exist yet are still
                // listed and still searchable — hiding them would make the
                // palette look broken — but they cannot be selected, so the
                // palette can never navigate to a 404.
                disabled={item.href === null}
                onSelect={() => item.href && navigate(item.href)}
              >
                <span className="flex-1 truncate">{item.title}</span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    item.href === null
                      ? "text-dead-600"
                      : item.tier === "pro"
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-dead-400",
                  )}
                >
                  {item.href === null ? "Soon" : item.tier}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Pages">
            <CommandItem
              value="introduction docs home"
              onSelect={() => navigate("/docs")}
            >
              <BoxIcon />
              Introduction
            </CommandItem>
            <CommandItem value="pricing" onSelect={() => navigate("/#pricing")}>
              <MoonIcon />
              Pricing
            </CommandItem>
            <CommandItem
              value="install cli terminal"
              onSelect={() => navigate("/#get-started")}
            >
              <RocketIcon />
              Install the CLI
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 font-mono text-xs text-dead-400 transition-colors duration-200 ease-out hover:bg-dead-900 hover:text-dead-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
    >
      {children}
    </Link>
  );
}

/**
 * Icon-only dark/light switch.
 *
 * NOTHING here may read the resolved theme until `mounted` is true, and that
 * includes the `aria-label` — not just the glyph. `resolvedTheme` is `undefined`
 * on the server but already correct on the client's hydration render (it is read
 * from the class next-themes' blocking script wrote), so labelling the button
 * from it unguarded makes the server and the first client tree disagree:
 *
 *   server:  aria-label="Switch to dark mode"   (resolvedTheme === undefined)
 *   client:  aria-label="Switch to light mode"  (resolvedTheme === "dark")
 *
 * which React reports as an unpatchable hydration mismatch. So before mount the
 * label is deliberately mode-agnostic — "Toggle theme" is true in both modes —
 * and it becomes specific on the first post-hydration render.
 *
 * The CLICK handler is the exception and reads the real theme unconditionally:
 * withholding a label is harmless, withholding behaviour would mean a click in
 * that first frame did nothing.
 *
 * The icon shows the mode you would switch TO: `Sun` while dark, `Moon` while
 * light. `defaultTheme="system"` + `enableSystem` on the provider mean the first
 * load already matches the OS and no preference is written to `localStorage`
 * until the reader actually chooses one.
 */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getMountedSnapshot,
    getMountedServerSnapshot,
  );

  const isDark = resolvedTheme === "dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      className="grid size-9 shrink-0 place-items-center rounded-md border border-dead-800 bg-dead-900 text-dead-400 transition-colors duration-200 ease-out hover:border-dead-700 hover:text-dead-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
    >
      {mounted && isDark ? (
        <Sun className="size-4" strokeWidth={1.5} />
      ) : mounted ? (
        <Moon className="size-4" strokeWidth={1.5} />
      ) : null}
    </button>
  );
}

/** `1234` reads as noise next to a glyph; `1.2k` reads as a number. */
function formatStars(stars: number): string {
  if (stars < 1000) return String(stars);
  return `${(stars / 1000).toFixed(stars < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;
}

/**
 * The GitHub mark, inlined.
 *
 * `lucide-react` v1 DROPPED its brand icons — `Github` is no longer exported —
 * and the two obvious replacements are both worse: `Star` next to the words
 * "Star on GitHub" is a duplicated word, and pulling in another icon package
 * breaks ui-context.md's "no external icon libraries besides lucide-react". So
 * this is the official GitHub mark as a 16x16 single path, filled with
 * `currentColor` so it inherits the button's hover colour like any lucide glyph.
 */
function GithubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="size-3.5 fill-current"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function SkullIcon() {
  return <Skull className="size-4 text-dead-red" strokeWidth={1.5} />;
}

function BoxIcon() {
  return <Box className="size-4 text-dead-400" strokeWidth={1.5} />;
}

function MoonIcon() {
  return <Moon className="size-4 text-dead-400" strokeWidth={1.5} />;
}

function RocketIcon() {
  return <Rocket className="size-4" strokeWidth={1.5} />;
}