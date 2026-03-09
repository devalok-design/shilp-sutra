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
2. **Tests**: `pnpm test` — all pass
3. **Build**: `pnpm build` — all packages build
4. **CHANGELOG.md**: Updated with all changes, breaking changes clearly marked
5. **llms.txt**: Breaking changes section updated. Any new/changed component APIs documented.
6. **llms-full.txt**: Per-component entries updated for changed APIs
7. **Version bump**: Correct semver (breaking = minor while 0.x, patch for fixes)
8. **Git commit + push**: All docs and version bumps committed
9. **FINAL REVIEW**: Re-read the diff of all changes since last release. Confirm docs match code.
10. **npm publish**: Only now — `npm publish --access public` per changed package
11. **Send DS Notice**: If breaking changes, file issue on consumer repos via /send-karm-notice

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
