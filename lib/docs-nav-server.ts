import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Which registry components actually have a docs page.
 *
 * Resolved against the filesystem instead of a hand-kept list so that dropping a
 * `page.mdx` into `app/docs/components/<name>/` is the single step that makes a
 * component appear in the sidebar, in the Cmd+K palette and on the docs index.
 *
 * Server-only: it reads the repo, and the results are handed to client
 * components as plain serialisable props.
 */
export function findDocumentedComponents(): Set<string> {
  const base = path.join(process.cwd(), "app", "docs", "components");

  if (!existsSync(base)) return new Set();

  try {
    return new Set(
      readdirSync(base, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => existsSync(path.join(base, name, "page.mdx"))),
    );
  } catch {
    return new Set();
  }
}