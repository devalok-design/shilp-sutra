# shilp-sutra Design System

## Quick Reference

- **Monorepo**: pnpm workspaces — `packages/core`, `packages/brand`, `packages/karm`
- **Stack**: React 18, TypeScript 5.7 (strict), Vite 5.4, Tailwind 3.4, CVA
- **Test**: `pnpm test` (Vitest + RTL + vitest-axe)
- **Build**: `pnpm build` (per-package)
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm typecheck`

## Surface Layering (MANDATORY)

Every component MUST use the correct surface level. This is a hard rule, enforced by `pre-publish-audit.mjs`.

```
surface-1 → Page background, overlays (Dialog, Sheet, Popover, DropdownMenu,
            Select, Combobox, Toast, HoverCard, etc.), shell chrome (Sidebar,
            TopBar), sticky headers, input controls, floating toolbars
surface-2 → Cards, widgets, panels, editor containers — anything that sits ON the page
surface-3 → Hover states on surface-2 elements, skeleton shimmers, track fills
surface-4 → Active/pressed states, hover on surface-3 elements
```

**The rule:** If a component renders as a card/widget/panel on the page, its background is `bg-surface-2`, NOT `bg-surface-1`. If you add `bg-surface-1` to a non-overlay component, the pre-publish audit will flag it.

To add a legitimate exception, add the filename to `SURFACE1_ALLOWLIST` in `scripts/pre-publish-audit.mjs` with a comment explaining why.

## Publishing

**Use `/publish-release` to publish.** This skill enforces the full checklist with automated gates.

**Automated tooling:**
- `pnpm build` runs `post-build-audit.mjs` automatically (stale .js, use-client blast radius, surface token count)
- `node scripts/pre-publish-audit.mjs` runs all hard gates (git clean, version match, docs coverage, typecheck, lint, tests, build, token audit)
- The `/publish-release` skill orchestrates docs → version bump → gates → optional Storybook review → publish

**Do NOT run `npm publish` directly.** Always go through `/publish-release`.

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
