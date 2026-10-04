"use client";

import { useMemo } from "react";

import { CopyButton } from "@/components/docs/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TierBadge } from "@/components/docs/sidebar";
import type { DocsTier } from "@/lib/docs-nav";

export interface InstallTabsProps {
  /** Registry name — the argument to `deadui add`. */
  componentName: string;
  tier?: DocsTier;
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const RUNNERS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

const MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

export function InstallTabs({
  componentName,
  tier = "free",
}: InstallTabsProps) {
  const flag = tier === "pro" ? " --pro" : "";

  const commands = useMemo(
    () =>
      MANAGERS.map((manager) => ({
        manager,
        command: `${RUNNERS[manager]} deadui@latest add ${componentName}${flag}`,
      })),
    [componentName, flag],
  );

  return (
    <Tabs defaultValue="npm">
      <div className="flex flex-wrap items-center gap-3">
        <TabsList>
          {commands.map(({ manager }) => (
            <TabsTrigger key={manager} value={manager}>
              {manager}
            </TabsTrigger>
          ))}
        </TabsList>
        <TierBadge tier={tier} />
      </div>

      {commands.map(({ manager, command }) => (
        <TabsContent key={manager} value={manager}>
          <div className="group relative">
            <pre className="overflow-x-auto rounded-lg border border-dead-800 bg-dead-950 p-4 font-mono text-[13px] leading-relaxed">
              <code>
                <span className="select-none text-dead-red">$</span>{" "}
                <span className="text-dead-50">{command}</span>
              </code>
            </pre>
            <CopyButton />
          </div>
        </TabsContent>
      ))}

      {tier === "pro" ? (
        <p className="mt-4 text-xs text-dead-400">
          Pro components need a license key. Run the command, paste the key when
          prompted, or pass it with{" "}
          <code className="rounded border border-dead-800 bg-dead-900 px-1.5 py-0.5 font-mono text-[0.85em] text-dead-50">
            --token
          </code>
          .
        </p>
      ) : null}
    </Tabs>
  );
}