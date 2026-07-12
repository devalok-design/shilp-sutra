# Handoff — MCP-feedback triage fixes (#133, #132, #115)

**Date:** 2026-07-12
**Status:** Code COMPLETE + verified on a dirty working tree (nothing committed). Ready to commit → PR → ship.
**Next agent:** commit, open PR, then handle publish + mcp-server deploy + issue follow-up (see "What's left").

## What this addresses

Three open GitHub issues on `devalok-design/shilp-sutra`, all filed via the MCP `report_issue` tool (label `mcp-submitted`):

- **#133** `[bug]` PageHeader actions overflow on mobile
- **#132** `[docs]` Table `numeric`/`href` props don't exist on the shipped types
- **#115** `[feature]` Responsive modal (Dialog desktop + partial bottom Sheet mobile)

Scope decisions were made by the user via MCQ: #133 = flex-wrap (no rollup menu — Polaris regrets rollup); #115 = new `ResponsiveModal` **with** snap-points; #132 = full emitter+schema+MCP fix (not a table-only doc patch).

## What was done (per issue)

### #133 — PageHeader flex-wrap
Root cause: `packages/core/src/composed/page-header.tsx` — actions slot was `shrink-0` inside a `justify-between` row with no wrap → 2+ buttons overflow a phone and pan the viewport sideways.
Fix (pure CSS, still server-safe, desktop layout unchanged):
- row: `flex items-start justify-between gap-ds-05` → **added `flex-wrap`**
- title block: **added `min-w-0`**
- actions slot: **removed `shrink-0`, added `flex-wrap`**
Files: `page-header.tsx`, `page-header.test.tsx` (+1 wrap test), `page-header.stories.tsx` (+`ManyActionsNarrow`), `docs/components/composed/page-header.md` (actions-slot line).

### #132 — manifest mis-attributes compound subcomponent props to root
Root cause (NOT a doc typo): `packages/core/scripts/build-mcp-manifest.mjs` `parseProps` flattened the ENTIRE `## Props` section onto the root component, ignoring `### Subpart` H3 headings. So `numeric` (belongs to TableCell/TableHead), `href`+`stretch` (TableRowLink), `persist` (TableRowActions) all emitted as props of `<Table>`. An agent trusting the manifest wrote `<Table numeric>` / `<TableRow href>` and hit TS2322. **The repo docs were always correct; the emitted manifest was wrong.** Affects **all 27 multi-part component docs**, not just table.
Fix across the stack:
- `build-mcp-manifest.mjs`: new `parseSubpartHeading()`; `parseProps(body, rootName)` returns `{ props, subComponents }`. Props under a `### Name` go to `subComponents[Name].props` (name may be `A / B` → shared; parenthetical → `.note`). A subpart whose name == the component's root name routes to root `props`. For a compound title `# Stepper / Step`, the FIRST name is root, the rest are subComponents. `MANIFEST_VERSION` 1.1.0 → **1.2.0** (additive). Stats count subcomponent props.
- `packages/core/mcp-manifest.schema.json`: added `subComponents` to `$defs.component.properties`.
- `packages/mcp-server/src/tools.mjs`: `getComponent()` api section now includes `subComponents`.
- `packages/mcp-server/scripts/smoke.mjs`: +3 assertions (root excludes numeric/href; TableCell owns numeric; TableRowLink owns href required string). Smoke auto-spawns the server in `LOCAL_CORE_DIR` mode so it tests the working-tree manifest.
- `packages/core/docs/components/ui/table.md`: split the crammed `href: string (required); stretch: boolean (default true)` line into two one-prop lines; `(default true)` → `(default: true)`.
- `docs/specs/mcp-manifest-standard.md`: documented the `### Subpart` grammar (§2) + §1.1 example.

### #115 — ResponsiveModal (new composed component) + snap-points
New file `packages/core/src/composed/responsive-modal.tsx` — compound, built on `@primitives/react-dialog` (same primitive as Dialog/Sheet; it's alternative-to, not a re-roll). Centered Dialog at md+, partial bottom sheet <768px.
Parts: `ResponsiveModal` (root, `dismissable` prop), `ResponsiveModalTrigger/Content/Background/Header/Title/Description/Body/Footer/Close` (+ Overlay/Portal exported).
Owns the bits consumers hand-rolled: pinned header/footer, internal scroll body (`min-h-0 flex-1 overflow-y-auto`, capped `max-h-[85dvh]` desktop / `max-h-[90dvh]` mobile), optional full-bleed `-z-10` background slot with the close button stacked above it (the reporter's close-button-eaten-by-z-index gotcha, owned), drag-to-dismiss via `useDragControls` (handle-only, so the scroll body doesn't fight the gesture), mobile `snapPoints`/`defaultSnapPoint` (ignored on desktop), `dismissable={false}` (hides close, blocks Escape/outside/drag).
Wiring: `composed/index.ts` barrel (after priority-indicator), `package.json` export `./composed/responsive-modal`. vite auto-scans `composed/*.tsx` so no vite.config change.
Docs/tests/stories: `responsive-modal.md` (dogfoods the new `### Subpart` grammar), `responsive-modal.test.tsx` (6 tests, desktop branch — jsdom can't drag), `responsive-modal.stories.tsx` (Default/ScrollingBody/WithSnapPoints/NonDismissable/WithBackground).

## Changeset
`.changeset/responsive-modal-pageheader-wrap-manifest-subparts.md` — `@devalok/shilp-sutra: minor` → **0.48.0 → 0.49.0**. (ResponsiveModal `## Changes` in its doc says v0.49.0 — keep in sync if the version resolves differently.) All three changes are additive/non-breaking.

## Verification run (all green, on the dirty tree)
- typecheck ✓ · lint 0 errors ✓ · **full core suite 2211/2211 across 169 files** ✓
- `pnpm build` 7/7 post-build steps ✓ · new dist entry `dist/composed/responsive-modal.{js,d.ts}` present with `"use client"` injected ✓
- SSR smoke **150/150** (new export included) ✓ · mcp-server smoke **20/20** (incl. 3 new #132 checks) ✓
- `lint-doc-examples` ✓ · `check-props-exports` 123 types ✓ · `build-mcp-manifest --check` ✓
- pre-publish-audit: every substantive gate green. Two non-blocking "fails": **working-tree-not-clean** (expected pre-commit) and **skill-sync** (Windows-only CRLF false positive — see gotcha below).

## Gotchas the next agent MUST know
1. **Skill-sync gate is a Windows CRLF red herring.** `node scripts/build-skill.mjs` on Windows rewrites `skills/shilp-sutra/references/setup-*.md` + `troubleshoot.md` with CRLF, showing ~1400 lines of phantom diff. Those 7 files are content-identical to HEAD (`git diff --ignore-all-space` = empty); CI is Linux/LF and passes. The ONLY real skill change is `components.md` (+1 line: the responsive-modal index entry), which IS committed. Do NOT commit the CRLF churn — I already `git checkout --`'d the 7 files. If you regenerate on Windows, restore them again.
2. **mcp-manifest.json / llms.txt / core AGENTS.md / skill/ are gitignored + regenerated at build.** Don't hand-commit them.
3. **`docs/audits/` is gitignored** — stray files there are not part of this work.
4. **#132 only reaches agents after BOTH:** (a) core `0.49.0` publishes with the new manifest, AND (b) `packages/mcp-server` **redeploys on Railway** (private pkg `@devalok/shilp-sutra-mcp-server`, deploys from source — the `tools.mjs` render change ships on deploy, not npm). The Railway project is `shilp-sutra-site`, service `shilp-sutra-mcp`.
5. **0.46.0's tarball stays wrong forever** — the hosted MCP serves version-exact docs from published tarballs. The reporter (issue #132, on 0.46.0) must upgrade to ≥0.49.0 to see the corrected manifest. Note this when replying.

## What's left to ship
- [ ] Commit (conventional, scoped — e.g. `feat: ResponsiveModal + PageHeader wrap + manifest sub-part props (#115 #133 #132)`), push a branch, open PR.
- [ ] Merge → changesets `Version Packages` PR opens → review (bump = minor, changeset body quality, Chromatic) → merge → `release.yml` publishes 0.49.0 via OIDC.
- [ ] **Redeploy `shilp-sutra-mcp` on Railway** after 0.49.0 is on npm (so `get_component` serves the new manifest + render). Verify with a live `get_component("table")` call — root props must NOT contain `numeric`/`href`.
- [ ] **Issue follow-up (needs user approval per repo CLAUDE.md — do NOT close unprompted):** comment resolution on #133/#132/#115. For #132 tell the reporter it was a manifest-emitter bug (docs were fine) fixed in 0.49.0 + they must upgrade off 0.46.0.
- [ ] **Optional `/send-karm-notice`** re ResponsiveModal — new component consumers (muhurat filed #115; karm) may want it. Non-breaking so not required.
- [ ] Figma: N/A — no Figma component was generated here.

## Files touched (source, excluding generated/gitignored)
```
docs/plans/2026-07-12-mcp-feedback-triage-fixes-handoff.md   (this file)
docs/specs/mcp-manifest-standard.md
.changeset/responsive-modal-pageheader-wrap-manifest-subparts.md
packages/core/package.json
packages/core/mcp-manifest.schema.json
packages/core/scripts/build-mcp-manifest.mjs
packages/core/src/composed/index.ts
packages/core/src/composed/page-header.tsx
packages/core/src/composed/page-header.test.tsx
packages/core/src/composed/page-header.stories.tsx
packages/core/src/composed/responsive-modal.tsx          (new)
packages/core/src/composed/responsive-modal.test.tsx     (new)
packages/core/src/composed/responsive-modal.stories.tsx  (new)
packages/core/docs/components/composed/responsive-modal.md (new)
packages/core/docs/components/composed/page-header.md
packages/core/docs/components/ui/table.md
packages/mcp-server/src/tools.mjs
packages/mcp-server/scripts/smoke.mjs
skills/shilp-sutra/references/components.md               (regenerated: +responsive-modal line only)
```
