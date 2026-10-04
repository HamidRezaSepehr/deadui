Dead UI — AI Workflow Rules

Approach
Build this project incrementally using a strict, spec-driven
workflow. Context files (`project-overview.md`, `architecture.md`,
`code-standards.md`, `progress-tracker.md`) define the exact
component catalog, tech stack (Next.js/GSAP/Lenis/Framer Motion),
variant architecture, and current state. Always implement against
these specs — do not infer, guess prop names, or invent
unrequested animation behavior from scratch.

Scoping Rules
- Work on ONE component at a time.
- Each component implementation includes: the `.tsx` file,
  its hook file (if needed), its `.css` file (if needed),
  and its `.mdx` documentation page.
- Do not combine CLI updates with component updates in a
  single implementation step.
- Do not combine docs site layout changes with component
  implementation in a single step.

When to Split Work
Split an implementation step if it combines:
- Two or more distinct components.
- CLI logic changes AND component code changes.
- Registry structure changes AND documentation updates.
- WebGL/R3F component work AND GSAP component work
  (different dependency trees).

If a change cannot be verified by running `npm run build`
in the `docs/` directory and visually confirming the
component preview, the scope is too broad — split it.

Handling Missing Requirements
- Do not invent animation behavior not defined in the
  context files.
- If a variant is ambiguous, check `ui-context.md` for
  default styling and animation duration rules.
- If a requirement is missing, add it as an open question
  in `progress-tracker.md` before continuing.
- If a component needs a dependency not listed in
  `architecture.md`, propose the addition and wait for
  confirmation before installing.

Protected Files
Do not modify the following unless explicitly instructed:
- `docs/components/ui/*` — These are symlinks or copies
  from `registry/`. Edit the source in `registry/` instead.
- `registry/lib/cn.ts` — The class merge utility is stable.
- `cli/package.json` — Do not change CLI dependencies
  without explicit instruction.
- `context/*.md` — Do not modify spec files unless the
  implementation requires an architectural change (and
  document why).

Keeping Docs in Sync
Update the relevant context file whenever implementation
changes:
- Component catalog (new component added or removed) →
  `project-overview.md`
- Dependency changes → `architecture.md`
- New animation patterns or conventions → `code-standards.md`
- Visual style changes → `ui-context.md`
- Feature scope changes → `project-overview.md`

Before Moving to the Next Component
1. The current component renders correctly in the docs
   preview with all variants functional.
2. `npm run build` passes in `docs/` with zero TypeScript
   or build errors.
3. The component respects `prefers-reduced-motion`.
4. The `.mdx` documentation page is complete with live
   preview, props table, and install command.
5. `progress-tracker.md` reflects the completed work.
6. No invariant defined in `architecture.md` was violated.

Component Implementation Order
Follow this exact order for the MVP:
1. Project scaffolding (docs/, registry/, cli/ directories).
2. Shared utilities (cn.ts, motion-config.ts, hooks).
3. Free Component 1: Cinematic Text Reveal.
4. Free Component 2: Magnetic Elastic Button.
5. Free Component 3: Infinite Blur Marquee.
6. Free Component 4: Spotlight Hover Card.
7. Free Component 5: Scroll-Linked Image Scrub.
8. Free Component 6: Staggered Grid Reveal.
9. Free Component 7: Gradient Border Glow.
10. CLI init + add commands.
11. Pro Component 8: WebGL Liquid Image Trail.
12. Pro Component 9: Horizontal Parallax Pin Gallery.
13. Pro Component 10: 3D Perspective Card Stack.
14. Landing page polish and launch prep.