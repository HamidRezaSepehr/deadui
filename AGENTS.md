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


## Release & Publishing Workflow

When preparing the CLI for a new npm release, you MUST follow this exact 4-step sequence to prevent version mismatch errors in GitHub Actions. GitHub Actions triggers on GitHub Releases and checks out the code at that specific tag, so the `package.json` version MUST match the tag.

1. **Bump the Version:** Update the `"version"` field in `packages/cli/package.json` (e.g., from `0.1.0` to `0.1.1`).
2. **Commit and Push:** Stage the change, commit it, and push to main.
   ```bash
   git add packages/cli/package.json
   git commit -m "chore: bump cli version to [NEW_VERSION]"
   git push origin main
3. **Create Git Tag:** Create a tag that exactly matches the new version and push it.
   git tag v[NEW_VERSION]
   git push origin v[NEW_VERSION]
4. **Prompt the User:** Instruct the user to go to the GitHub UI, draft a new Release, select the newly pushed tag (v[NEW_VERSION]), and publish it. This triggers the GitHub Action to publish to npm.

**CRITICAL:** Never attempt to publish to npm directly from the AI environment. Always rely on the GitHub Actions workflow triggered by the GitHub Release.
