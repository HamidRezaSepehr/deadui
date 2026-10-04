"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Moon, Rocket, SearchIcon, Skull } from "lucide-react";

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

export interface TopNavProps {
  items: DocsNavItem[];
}

export function TopNav({ items }: TopNavProps) {
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
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-3 py-2 font-mono text-xs text-dead-400 transition-colors duration-200 ease-out hover:bg-dead-900 hover:text-dead-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
          >
            GitHub
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
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
                        ? "text-purple-400"
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