import registry from "@/registry.json";

export type DocsTier = "free" | "pro";

export interface DocsNavItem {
  /** Registry name — also the CLI install argument and the route segment. */
  name: string;
  title: string;
  description: string;
  tier: DocsTier;
  /** `null` when the component has no `app/docs/components/<name>/page.mdx` yet. */
  href: string | null;
  variants: string[];
  dependencies: string[];
}

export interface DocsNavGroup {
  title: string;
  tier: DocsTier;
  items: DocsNavItem[];
}

/** `registry.json` carries free strings, not a literal union — narrow once. */
function toTier(value: string): DocsTier {
  return value === "pro" ? "pro" : "free";
}

/**
 * Docs navigation derived from the registry.
 *
 * The registry is the single source of truth for names, titles, descriptions,
 * tiers and dependencies (architecture.md: "Registry is Truth"), so the docs
 * sidebar and the Cmd+K palette are both generated from it instead of from a
 * hand-maintained list that would drift.
 *
 * `documented` is the one piece of information the registry does not carry:
 * whether a component has a docs page yet. `app/docs/layout.tsx` resolves it
 * against the filesystem so a newly added `page.mdx` shows up on its own.
 */
export function buildDocsNav(
  documented: ReadonlySet<string>,
): DocsNavItem[] {
  return registry.components.map((component) => ({
    name: component.name,
    title: component.title,
    description: component.description,
    tier: toTier(component.tier),
    href: documented.has(component.name)
      ? `/docs/components/${component.name}`
      : null,
    variants: component.variants,
    dependencies: component.dependencies,
  }));
}

export function groupDocsNav(items: DocsNavItem[]): DocsNavGroup[] {
  return (["free", "pro"] as const)
    .map((tier) => ({
      title: tier === "free" ? "Free Components" : "Pro Components",
      tier,
      items: items.filter((item) => item.tier === tier),
    }))
    .filter((group) => group.items.length > 0);
}

/** Static (non-component) destinations offered by the Cmd+K palette. */
export const DOCS_PAGES: { title: string; href: string }[] = [
  { title: "Introduction", href: "/docs" },
  { title: "Home", href: "/" },
  { title: "Pricing", href: "/#pricing" },
];