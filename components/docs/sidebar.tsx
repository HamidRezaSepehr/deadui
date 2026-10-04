"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DocsNavGroup, DocsTier } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  groups: DocsNavGroup[];
}

export function Sidebar({ groups }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 overflow-y-auto border-r border-dead-800 py-8 pr-4 lg:block">
      <nav aria-label="Documentation" className="flex flex-col gap-8">
        <div>
          <p className="px-3 font-mono text-[10px] uppercase tracking-widest text-dead-600">
            Getting Started
          </p>
          <ul className="mt-3 space-y-1">
            <li>
              <SidebarLink href="/docs" active={pathname === "/docs"}>
                Introduction
              </SidebarLink>
            </li>
          </ul>
        </div>

        {groups.map((group) => (
          <div key={group.tier}>
            <div className="flex items-center gap-2 px-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-dead-600">
                {group.title}
              </p>
              <TierBadge tier={group.tier} />
            </div>
            <ul className="mt-3 space-y-1">
              {group.items.map((item) => {
                const active = item.href !== null && pathname === item.href;

                return (
                  <li key={item.name}>
                    {item.href ? (
                      <SidebarLink href={item.href} active={active}>
                        {item.title}
                      </SidebarLink>
                    ) : (
                      // No page.mdx yet — rendered, but not a link, so the
                      // sidebar never advertises a 404.
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
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red",
        active
          ? "bg-dead-900 font-medium text-dead-50 shadow-[inset_2px_0_0_0_var(--color-dead-red)]"
          : "text-dead-400 hover:bg-dead-900/60 hover:text-dead-50",
      )}
    >
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function TierBadge({ tier }: { tier: DocsTier }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-px font-mono text-[9px] uppercase tracking-widest",
        tier === "pro"
          ? "bg-purple-500/10 text-purple-400"
          : "bg-zinc-400/10 text-zinc-400",
      )}
    >
      {tier}
    </span>
  );
}