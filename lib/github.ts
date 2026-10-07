/**
 * GitHub repository metadata for the docs site.
 *
 * Server-only: `next: { revalidate }` is a Next.js fetch extension, and this
 * runs at render time on the server (the star count is fetched by
 * `app/docs/layout.tsx` and handed to the client `<TopNav>` as a plain number,
 * so no GitHub token or fetch ever reaches the browser).
 */

const REPO_API = "https://api.github.com/repos/HamidRezaSepehr/deadui";

/**
 * The live star count, or `0` if GitHub is unreachable or rate-limited.
 *
 * Cached for an hour through the Next.js data cache rather than `unstable_cache`
 * so the cache entry is keyed to the fetch itself. `stargazers_count` only moves
 * when someone stars the repo, so an hour of staleness costs nothing and keeps
 * the unauthenticated rate limit (60 requests/hour per IP) far out of reach —
 * without it, every docs page render would spend a request.
 *
 * Returning `0` rather than throwing is deliberate: a star count is decoration,
 * and a GitHub outage must not take the docs site down with it.
 */
export async function getGitHubStars(): Promise<number> {
  try {
    const res = await fetch(REPO_API, { next: { revalidate: 3600 } });

    if (!res.ok) return 0;

    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null) return 0;

    const stars = (data as { stargazers_count?: unknown }).stargazers_count;
    return typeof stars === "number" ? stars : 0;
  } catch {
    return 0;
  }
}