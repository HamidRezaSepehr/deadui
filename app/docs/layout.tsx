import { Sidebar } from "@/components/docs/sidebar";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { TopNav } from "@/components/docs/top-nav";
import { buildDocsNav, groupDocsNav } from "@/lib/docs-nav";
import { findDocumentedComponents } from "@/lib/docs-nav-server";
import { getGitHubStars } from "@/lib/github";

export const metadata = {
  title: {
    default: "Docs — Dead UI",
    template: "%s — Dead UI Docs",
  },
  description:
    "Dead simple animations for React. Live previews, install commands and props for every component.",
};

export default async function DocsLayout({ children }: LayoutProps<"/docs">) {
  const items = buildDocsNav(findDocumentedComponents());
  const groups = groupDocsNav(items);
  const stars = await getGitHubStars();

  return (
    <div className="flex min-h-screen flex-col bg-dead-950">
      <TopNav items={items} stars={stars} />
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start">
        <Sidebar groups={groups} />
        <main id="docs-content" className="flex-1 min-w-0 px-6 py-12 sm:px-8">
          {children}
        </main>
        <TableOfContents />
      </div>
    </div>
  );
}