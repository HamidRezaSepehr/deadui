import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { TierBadge } from "@/components/docs/sidebar";
import { buildDocsNav, groupDocsNav } from "@/lib/docs-nav";
import { findDocumentedComponents } from "@/lib/docs-nav-server";

export const metadata = {
  title: "Introduction",
  description:
    "Copy-paste animation components for React and Next.js. Install one in under ten seconds.",
};

export default function DocsIndexPage() {
  const groups = groupDocsNav(buildDocsNav(findDocumentedComponents()));

  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-dead-red">
        deadui
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-dead-50">
        Dead simple animations for React.
      </h1>
      <p className="mt-4 text-base leading-7 text-dead-200">
        We killed the complexity. Every component here is a real GSAP,
        Motion or WebGL effect, typed, installable with one CLI command, and
        fully customisable through props — no config files, no setup wizards.
      </p>

      <div className="mt-6 rounded-lg border border-dead-800 bg-dead-900 p-4">
        <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed">
          <code>
            <span className="select-none text-dead-red">$</span>{" "}
            <span className="text-dead-50">
              npx deadui@latest add cinematic-text
            </span>
          </code>
        </pre>
      </div>

      {groups.map((group) => (
        <section key={group.tier} className="mt-14">
          <div className="flex items-center gap-2 border-b border-dead-800 pb-3">
            <h2 className="text-xl font-semibold tracking-tight text-dead-50">
              {group.title}
            </h2>
            <TierBadge tier={group.tier} />
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.items.map((item) => {
              const body = (
                <>
                  <span className="text-sm font-medium text-dead-50">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-dead-400">
                    {item.description}
                  </span>
                  <span className="mt-3 block font-mono text-[10px] uppercase tracking-widest text-dead-600">
                    deadui add {item.name}
                  </span>
                </>
              );

              return (
                <li key={item.name}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="group flex h-full flex-col rounded-xl border border-dead-800 bg-dead-900 p-4 transition-[border-color,box-shadow] duration-200 ease-out hover:border-dead-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
                    >
                      {body}
                      <ArrowRightIcon className="mt-4 size-4 text-dead-600 transition-colors duration-200 ease-out group-hover:text-dead-red" />
                    </Link>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex h-full cursor-not-allowed flex-col rounded-xl border border-dead-800 bg-dead-900/50 p-4 opacity-60"
                    >
                      {body}
                      <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-dead-600">
                        docs coming soon
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}