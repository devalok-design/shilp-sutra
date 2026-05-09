---
name: publish-release
description: Reviewer checklist and emergency manual-publish runbook. Day-to-day publishing happens automatically via `.github/workflows/release.yml` when a Version Packages PR merges — this skill is for reviewing that PR or for manual publishing when CI is broken.
---

# Publish Release

## The Iron Law

**NO PUBLISHING WITHOUT EVERY GATE PASSING. NO EXCEPTIONS.**

Violating the letter of this rule IS violating the spirit. "Just this once" does not exist.

## How publishing actually works (2026-04-21+)

1. Developer adds a `.changeset/*.md` file describing the change + bump type.
2. Push / merge to `main`.
3. `changesets/action` opens (or updates) a **Version Packages** PR that bumps `package.json` versions and regenerates `CHANGELOG.md`.
4. **A human reviews that PR against the Reviewer Checklist below.**
5. Merging the PR triggers `.github/workflows/release.yml`, which runs `pre-publish-audit.mjs` (45 hard gates + CVA-accuracy audit), builds, and publishes to npm via OIDC Trusted Publisher + sigstore provenance.
6. Chromatic visual baseline snapshot + Storybook deploy run after publish.

The skill has no role in the normal path. It exists for two moments:

- **Reviewing the Version Packages PR** (use the checklist below).
- **Publishing manually when release.yml is broken** (use the runbook at the bottom).

## Reviewer Checklist for the Version Packages PR

Before approving + merging the Version Packages PR, walk through this list. Treat every "no" as a blocker until resolved.

### Content
- [ ] **Changeset bodies describe the actual change.** Open each `.changeset/*.md` that was consumed — if the description is vague ("fix bug", "update component"), reject and ask for a real description.
- [ ] **Version bump magnitude matches change severity.** Patch for fixes, minor for additive features (while 0.x). If ANY public API changed (props added/removed/renamed, types changed, DOM structure changed, ARIA roles changed), it is breaking — minor while 0.x, major once stable. **For the full public-API surface definition (including `docs/recipes/`, `llms.txt`, token namespaces), see [`CONTRIBUTING.md` § Versioning & Breaking Changes](../../CONTRIBUTING.md#versioning--breaking-changes).**
- [ ] **Generated CHANGELOG entry reads well.** Changesets concatenates changeset bodies; reorder or tighten if needed BEFORE merge.
- [ ] **llms.txt / llms-full.txt reflects reality.** `build-component-docs.mjs` regenerates these from `docs/components/*.md`; check that any new/changed component's Props + Composability + Changes sections are current.
- [ ] **Recipes in `packages/core/docs/recipes/`** — if any recipe was changed, re-read it end-to-end. Recipes run on consumer machines (humans + AI agents); doc drift causes silent install failures. Verify: framework-detection block still accurate, install commands per package manager still right, code examples use real component APIs (grep CVA source if uncertain).
- [ ] **`AGENTS.md` BEGIN/END markers + linked paths.** If markers or paths inside them changed, verify links still resolve to the right files. A broken `AGENTS.md` path means AI agents (Claude Code, Cursor, Copilot, Codex) can't find the recipes — silent failure mode.

### Visual / behavioral
- [ ] **Chromatic run is green on the source branch**, OR intentional visual diffs are explicitly approved in Chromatic's UI.
- [ ] **Storybook spot-check** for any component with changed CVA, new variants, or DOM changes. Run `pnpm dev`, find the story, confirm the change is intentional.
- [ ] **Token + surface layering hygiene.** Changed components still obey the surface rule (cards on `bg-surface-2`, overlays on `bg-surface-1`). Pre-publish-audit enforces this, but eyeball anything new.

### Pre-publish-audit will catch everything mechanical
You can trust these to be gated in CI — the checklist above is the stuff CI cannot see:
- git clean, version ↔ CHANGELOG match, docs coverage per component, CVA/doc prop accuracy, typecheck, lint, tests, build, SSR smoke, surface/shadow token hygiene, TW4 migration hygiene, per-component stories, bundle-size regression, published-exports ordering. See `scripts/pre-publish-audit.mjs`.

### Once every box is checked
Approve + merge. `release.yml` publishes. Verify after:

```bash
npm view @devalok/shilp-sutra version
```

Should show the version that was bumped in the PR. If breaking changes exist, invoke `/send-karm-notice`.

## Rationalization Prevention

| Thought | Reality |
|---------|---------|
| "It's just a patch, skip Storybook" | Every release goes through the full checklist. Don't skip Chromatic + Storybook review. |
| "Pre-publish script is too slow" | Catching issues post-publish is slower. CI runs it for you. |
| "I already checked this manually" | Manual checks missed bg-surface-1 across 50 files. Trust the script. |
| "The tests pass so it's fine" | Tests don't catch visual regressions, token misuse, or missing docs. |
| "I'll fix the docs in the next release" | Docs are a publish gate. No publish without docs. |
| "It's not really breaking" | If DOM structure, ARIA roles, or prop behavior changed, it IS breaking. |
| "The script has a false positive" | Investigate. Add to allowlist with comment if truly false. Never skip. |
| "Just this once" | This phrase does not exist in this skill. |
| "We're in a hurry" | Rushing caused v0.8.0, v0.9.0, v0.20.0, v0.36.0 incidents. Slow is fast. |
| "I'll add the test/story/doc later" | No. Now. Before publish. |

## Red Flags — STOP if you catch yourself:

- Approving a Version Packages PR without reading every consumed changeset body
- Saying "should be fine" about any gate
- Skipping Chromatic / Storybook review because "the diff is small"
- Merging before CI's pre-publish-audit has passed (wait for the green check)
- Bypassing the Version Packages PR by hand-bumping `package.json` (breaks changesets' state tracking)
- Running `npm publish` locally when release.yml is working

---

## Emergency Manual Publish Runbook

**Only use this when `release.yml` is actively broken** (e.g. during the 0.36.0 OIDC / npm 11 saga documented in commits `1f23742c`, `2c1f6ee0`, `79d60a8c`). The Iron Law still applies — every gate must pass before `npm publish`.

### 1. Confirm authority
- Repo role: write or admin.
- `npm login` as a user with publish access on the `@devalok` org (check `npm whoami` + `npm access ls-collaborators @devalok/shilp-sutra`).
- **npm 11.5.1+ required** for trusted-publisher OIDC. For manual publishes, classic authentication works on any npm version.

### 2. Ensure changesets are in place
If the Version Packages PR was never opened (common CI failure mode), recreate its work locally:

```bash
# From repo root
pnpm changeset version   # bumps package.json + regenerates CHANGELOG
git add -A && git commit -m "chore(release): version packages"
git push origin main
```

### 3. Run the gates — all of them
```bash
node scripts/pre-publish-audit.mjs
```

**If it exits non-zero: STOP.** Fix every failure. Then re-run from the top. The Iron Law is not optional because CI is down.

### 4. Build + publish
```bash
pnpm install --frozen-lockfile
pnpm build
pnpm -r --filter "@devalok/*" publish --access public
```

Verify after each package: `npm view @devalok/<name> version` should show the new version.

### 5. Tag + push
```bash
git tag @devalok/shilp-sutra@<version>  # one tag per published package
git push origin --tags
```

### 6. Post-publish
- If breaking changes: `/send-karm-notice`.
- Investigate and fix the root cause of the CI failure that forced the manual publish. File an issue referencing this run.

---

**Last reviewed:** 2026-05-09. If CI paths diverge from reality, rewrite this skill rather than letting drift accumulate.

**Recent changes (2026-05-09):** added recipe-content + AGENTS.md checkboxes (v0.38.0 introduced `docs/recipes/` shipping in the npm tarball — they are now public surface). Public-API surface definition cross-referenced to `CONTRIBUTING.md`.
