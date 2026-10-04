import type { MDXComponents } from "mdx/types";

import { CopyButton } from "@/components/docs/copy-button";
import { cn } from "@/lib/utils";

/**
 * Global MDX element mapping.
 *
 * `@next/mdx` requires this file at the project root for App Router: every
 * `.mdx` page pulls its components from `useMDXComponents()` here, which is
 * what lets the docs pages stay pure markdown while still rendering with the
 * "Dead" theme instead of browser defaults.
 *
 * Everything is Tailwind + the `dead-*` tokens from `app/globals.css`; there
 * is no `prose` plugin and no extra stylesheet.
 */
const components: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "scroll-mt-24 text-3xl font-bold tracking-tight text-dead-50",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-14 scroll-mt-24 border-b border-dead-800 pb-3 text-xl font-semibold tracking-tight text-dead-50 first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-8 scroll-mt-24 text-lg font-semibold tracking-tight text-dead-50",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "mt-6 scroll-mt-24 text-base font-semibold text-dead-50",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mt-4 leading-7 text-dead-200", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-medium text-dead-red underline decoration-dead-red/40 underline-offset-4 transition-colors duration-200 ease-out hover:text-dead-red-hover hover:decoration-dead-red-hover",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-dead-50", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("mt-4 list-disc space-y-2 pl-6 text-dead-200 marker:text-dead-red", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mt-4 list-decimal space-y-2 pl-6 text-dead-200 marker:font-mono marker:text-xs marker:text-dead-red", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("leading-7", className)} {...props} />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-12 border-dead-800", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "mt-4 border-l-2 border-dead-red bg-dead-900/60 py-3 pl-4 pr-4 text-dead-200",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="mt-6 w-full overflow-x-auto rounded-lg border border-dead-800">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-b border-dead-800 bg-dead-900 px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-dead-400",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-dead-800 px-4 py-3 align-top text-left text-dead-200 last:border-b-0",
        className,
      )}
      {...props}
    />
  ),
  // Inline code. Shiki renders `pre > code > span.line`, so the `pre` mapping
  // below resets the chip styling for every token in the block.
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded border border-dead-800 bg-dead-900 px-1.5 py-0.5 font-mono text-[0.85em] text-dead-50",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, children, ...props }) => (
    <div className="group relative mt-6">
      <pre
        className={cn(
          "overflow-x-auto rounded-lg border border-dead-800 p-4 font-mono text-[13px] leading-relaxed",
          "[&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[13px] [&>code]:text-inherit",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
      <CopyButton />
    </div>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}