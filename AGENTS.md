<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Dead UI — Application Building Context

Read the following files in order before implementing
or making any architectural decision:

`context/project-overview.md` — product definition,
goals, features, and scope

`context/architecture.md` — system structure,
component registry model, CLI logic, and invariants

`context/ui-context.md` — theme, colors, typography,
animation standards, and component conventions

`context/code-standards.md` — implementation rules,
TypeScript conventions, and styling standards

`context/ai-workflow-rules.md` — development workflow,
scoping rules, and delivery approach

`context/progress-tracker.md` — current phase,
completed work, open questions, and next steps

Update `context/progress-tracker.md` after each
meaningful implementation change.

If implementation changes the architecture, scope, or
standards documented in the context files, update the
relevant file before continuing.

Note: This project is a single Next.js application
serving as both the documentation/landing page site
and the component registry source. The CLI is a
separate Node.js package published to npm.