import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // `.mdx` pages act as real routes (`app/docs/**\/page.mdx`).
  pageExtensions: ["ts", "tsx", "mdx"],
};

// Plugin names are passed as STRINGS, not imports: Turbopack (the default
// bundler in Next 16) resolves them from the project and cannot serialise a
// JS function reference into its Rust config.
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // GitHub-flavoured markdown. Without it the Props tables on every
      // component page are emitted as literal `| a | b |` paragraph text,
      // because pipe tables are a GFM extension, not core markdown.
      "remark-gfm",
    ],
    rehypePlugins: [
      // Gives every heading a stable `id` so the right-hand Table of Contents
      // can link to it. Required by the TOC component in components/docs.
      "rehype-slug",
      // Shiki-powered syntax highlighting for every fenced code block.
      [
        "@shikijs/rehype",
        {
          theme: "vesper",
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);