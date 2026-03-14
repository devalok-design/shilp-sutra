# shilp-sutra Design System

## Quick Reference

- **Monorepo**: pnpm workspaces — `packages/core`, `packages/brand`, `packages/karm`
- **Stack**: React 18, TypeScript 5.7 (strict), Vite 5.4, Tailwind 3.4, CVA
- **Test**: `pnpm test` (Vitest + RTL + vitest-axe)
- **Build**: `pnpm build` (per-package)
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm typecheck`

## Publishing Checklist (MANDATORY)

**Do NOT run `npm publish` until EVERY item is confirmed. No exceptions.**

When releasing a new version:
1. **Typecheck**: `pnpm typecheck` passes
2. **Lint**: `pnpm lint` passes
3. **Tests**: `pnpm test` — all pass
4. **Stories**: Every new/changed component has Storybook stories covering key variants and interactive states
5. **Component docs**: Every new/changed component has an up-to-date `packages/core/docs/components/{category}/{name}.md` with a Changes entry for this version. These ship in the npm package under `docs/components/` and are the primary AI agent reference — keep them accurate. Run `pnpm build:docs:check` to verify coverage.
6. **Build**: `pnpm build` — all packages build (this regenerates `llms-full.txt` from the component docs automatically)
7. **No stale .js files**: Verify `packages/core/src/ui/` contains zero `.js` files after build. If any appear, the playground `tsc` may be emitting — ensure `apps/playground/tsconfig.json` has `"noEmit": true`.
8. **CHANGELOG.md**: Updated with all changes, breaking changes clearly marked
9. **llms.txt**: Breaking changes section updated. Any new/changed component APIs documented. Verify preset names and server-safe list match source.
10. **llms-full.txt**: GENERATED — do not hand-edit. Updated automatically by `pnpm build:docs` (runs as part of `pnpm build`). To update architecture notes, edit `packages/core/docs/components/_header.md`.
11. **Version bump**: Correct semver per changed package (breaking = minor while 0.x, patch for fixes). Bump ALL changed packages — if karm changed, bump karm too. Ensure karm's peer dep floor matches the core version it requires.
12. **Git commit + push**: All docs and version bumps committed
13. **FINAL REVIEW**: Re-read the diff of all changes since last release. Confirm docs match code.
14. **npm publish**: Only now — `npm publish --access public` per changed package
15. **Send DS Notice**: If breaking changes, file issue on consumer repos via /send-karm-notice

If you realize docs were incomplete after publishing, immediately publish a patch version.

## Consumer AI Agent Feedback Protocol

This repo receives feedback from AI agents working on consumer apps (e.g., Karm).
Feedback arrives as GitHub Issues on `devalok-design/shilp-sutra` labeled `karm-ai-agent-feedback`.

**You do NOT check or act on these automatically.** Only act when triggered:

### /check-karm-feedback

Read all open issues labeled `karm-ai-agent-feedback` on `devalok-design/shilp-sutra`.
For each issue:
1. Investigate the reported problem against the actual codebase
2. Summarize findings (confirmed bug, already works, docs gap, etc.)
3. Present to the user
4. **Do NOT fix, comment on, or close issues until the user approves**

### /send-karm-notice

File an issue on `devalok-design/karm` with label `shilp-sutra-ai-agent-feedback`.
Use the DS Notice format:

```markdown
Title: [DS Notice] <short summary>

## Type
<!-- one of: deprecation | migration-required | new-feature | usage-guidance -->

## Affects
- Component(s): <names>
- Current version: @devalok/shilp-sutra@X.Y.Z
- Target version: <if applicable>

## Description
<what's changing or what we noticed>

## Action Required
<!-- before -> after migration code, or recommended usage -->

## Timeline
<!-- immediate | next-minor | next-major -->
```

See `docs/plans/2026-03-07-ai-agent-feedback-protocol-design.md` for full protocol details.
