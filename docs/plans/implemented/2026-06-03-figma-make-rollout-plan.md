# Figma Make consumer rollout — plan

**Status:** Plan, not implemented.
**Date:** 2026-06-03.
**Context:** `@devalok/shilp-sutra@0.42.0` shipped the `make-kit/` guideline directory. Kit registered in Devalok Figma org. Need to make external consumers (humans + AI agents) discover and self-install the kit, since Figma offers no public Make-kit gallery, no cross-org share, no install deep-link.

---

## What we're solving

After 0.42.0, the npm tarball IS the public Make kit distribution channel. Every external consumer org has to:

1. Know the kit exists.
2. Know it requires Figma org/enterprise plan + Make access.
3. Register `@devalok/shilp-sutra@0.42.0` in their own Figma org.
4. Paste our 26 guideline files into their kit.
5. Publish kit in their org.

If we don't build the consumer-facing path, only Devalok org will ever use it. The 26 files in the tarball become dead weight.

## Phase 1 scope (this plan)

Four deliverables. Order is implementation order; (1) is biggest, drives the rest.

### 1. `/figma-make` setup wizard page on `shilp-sutra.devalok.in`

**Route:** `apps/site/app/figma-make/page.tsx`

**Purpose:** one-page path from "I saw shilp-sutra exists" → "kit live in my Figma org." Mirrors `/agents` page in structure + vocabulary.

**Sections (top to bottom):**

#### a. Hero
- `<PageHeader>` — title "Use shilp-sutra in Figma Make"
- One-line value: "Generate apps + prototypes in Figma Make against the production design system. Components, tokens, dark mode, and conventions baked in."
- Two CTAs:
  - Primary `<Button>` — "Open Figma Make" → `https://www.figma.com/make` (plain link, no deep-link available)
  - Soft `<Button>` — "Read setup ↓" → smooth-scroll to step 1

#### b. Eligibility callout
- `<Alert color="info" size="md">` — "Figma Make kits require an Organization or Enterprise Figma plan. Free / Pro plans can install the npm package but can't register a private Make kit."

#### c. The 6-step wizard
Each step = `<Card variant="outline" size="md">` with a numbered badge, title, body, and copy-to-clipboard blocks:

1. **Open Figma → Resources → Make kits → Create**  
   Screenshot or 2-line instruction.
2. **Pick "Public npm registry"**  
   With a copy-block: `@devalok/shilp-sutra` + version `0.42.0` (pinned).
3. **Choose "Manual guidelines"**  
   "Auto-gen is a fast fallback — ours are tighter."
4. **Paste guidelines** — see below ("Guidelines paste blocks").
5. **Publish kit**  
   Note: kit version is separate from npm version. Figma assigns `1.0.0`.
6. **Attach kit to a Make file and prompt**  
   Example prompt: "Build a settings page with sidebar, email + password form, primary/cancel buttons. Use shilp-sutra."

#### d. Guidelines paste blocks
- Tabbed or accordion layout listing all 26 files in the order they paste:
  - `Guidelines.md`
  - `setup.md`
  - 8× `foundations/*.md`
  - `components/overview.md`
  - 15× `components/*.md`
- Each row: filename label + "Copy" button + "View" link (opens `unpkg.com/@devalok/shilp-sutra@0.42.0/make-kit/<path>` in new tab).
- Content fetched at **build time** via Next's RSC + `fs.readFileSync` from `node_modules/@devalok/shilp-sutra/make-kit/*` (the site app depends on core, so the directory ships in `node_modules`). Build-time read keeps the bundle thin and pins content to whatever core version the site builds against. When core bumps and site rebuilds, the page auto-refreshes.
- Two top-level copy buttons:
  - "Copy all foundations as one block" — concatenated with `## File: foundations/<name>.md` separators.
  - "Copy all components as one block" — same pattern.
  - For consumers who prefer one paste over 26.

#### e. What Make generates (visual proof)
- 2–3 example screenshots: same prompt against vanilla Make vs against the kit. Show kit-flavored output (Button soft variant, proper surface tokens, no raw HTML).
- Captions: "Without the kit" / "With shilp-sutra@0.42.0 Make kit."
- If we don't have screenshots yet → defer to Phase 2 + leave placeholder.

#### f. Update cadence section
- `<Card variant="outline">` "When to refresh the kit in your org"
- Bullets:
  - On a shilp-sutra **minor** bump (0.43, 0.44…) → bump kit's npm version, re-paste any changed guidelines.
  - On a **patch** bump → usually skip unless the patch fixes Make-visible behavior.
  - No auto-update from Figma side. [Open feature request](https://forum.figma.com/report-a-problem-6/figma-make-auto-check-of-new-design-system-npm-version-50979).

#### g. FAQ / troubleshoot
- "Can I use the kit on a free Figma plan?" — No, org/enterprise only.
- "Does Make pull new versions automatically?" — No, manual republish in Figma UI.
- "Why does Figma bump the kit version on every republish?" — Known UX quirk. Kit version ≠ npm version.
- "Make generates raw `<button>` instead of `<Button>` — what now?" — Patch `components/button.md` in your kit, republish. Or file an issue against us so we tighten the source.
- "Auto-gen looks fine — should I use that instead?" — Acceptable starting point. Ours are stricter on conventions (soft-over-outline default, ds-* cadence, surface tiers). Re-paste later if you hit drift.

#### h. Footer CTAs
- Link to npm: `npm view @devalok/shilp-sutra`
- Link to GitHub: `make-kit/` directory source
- Link to filed Figma forum threads (for "vote on auto-update")

**Layout / style:**
- Match `/agents` page composition exactly. Same `<PageHeader>` + `<SiteHeader>` + `<SiteFooter>` shell. Same Card grid pattern for the 6 steps.
- Spacing: `ds-07` between sections, `ds-05` within a section, `ds-03` for tight pairs. Three-tier cadence rule applies.
- Dark mode: free (uses semantic tokens).
- Mobile: stacks to single column ≤ md.

**Components used (no new code):**
- `<PageHeader>`, `<SiteHeader>`, `<SiteFooter>` (existing site composed)
- `<Card>`, `<Button>`, `<Text>`, `<Alert>`, `<Stack>`, `<CodeBlock>` (existing site usage)
- New tiny component `apps/site/components/copy-button.tsx` — wraps `navigator.clipboard.writeText`, animates check on success. Or use existing one if there is one — TBD during impl.
- New `apps/site/components/make-kit-paster.tsx` — the per-file paste block UI. Reads file content as a prop, renders label + copy button + view link.

### 2. README badge + section

Top of `README.md`, in the badge row:

```markdown
[![Figma Make compatible](https://img.shields.io/badge/Figma_Make-compatible-purple)](https://shilp-sutra.devalok.in/figma-make)
```

New section after "Setup" (before "Tech stack"):

```markdown
## Figma Make

`@devalok/shilp-sutra@0.42.0+` ships [Make kit guidelines](packages/core/make-kit/)
at `node_modules/@devalok/shilp-sutra/make-kit/`. Register the kit in your
Figma org to generate apps + prototypes in Figma Make against the production
design system — components, tokens, dark mode, and conventions baked in.

→ [Setup guide](https://shilp-sutra.devalok.in/figma-make)
```

### 3. AGENTS.md row

Add a new section after the existing "When working ON shilp-sutra" block:

```markdown
## Figma Make

If the user mentions Figma Make, generating designs against a kit, or
registering a Make kit:

- shilp-sutra ships Make kit guidelines at
  `node_modules/@devalok/shilp-sutra/make-kit/`.
- Walkthrough at https://shilp-sutra.devalok.in/figma-make.
- Pin kit to a specific npm version. No auto-update from Figma side.
- Cross-org sharing not possible — each consumer org self-registers.
```

### 4. llms.txt + llms-full.txt update

In `packages/core/llms.txt` at the top "NEW (v0.42.0)" section (add this block):

```
## NEW (v0.42.0)

- **Figma Make kit.** 26 guideline files at `node_modules/@devalok/shilp-sutra/make-kit/`. Subpath exports `@devalok/shilp-sutra/make-kit` → `Guidelines.md`, `/make-kit/*` → individual files. Used by Figma Make to generate apps + prototypes against the DS. Setup guide: https://shilp-sutra.devalok.in/figma-make. Public npm registry; cross-org sharing not possible; pin to a specific version, no auto-update.
```

In `packages/core/llms-full.txt` — adds via `scripts/build-component-docs.mjs` on next core build. No manual edit.

## Implementation order

1. Write `apps/site/components/copy-button.tsx` (~30 lines, reusable).
2. Write `apps/site/components/make-kit-paster.tsx` (~80 lines, takes filename + content).
3. Build `apps/site/app/figma-make/page.tsx` — RSC, reads `make-kit/*.md` from `node_modules` at build time, renders the sections above.
4. Add `/figma-make` route to `apps/site/components/site-header.tsx` `navLinks`.
5. Add `<a>` row at the top of `apps/site/app/page.tsx` hero (existing "now Make-compatible" announcement bar).
6. Update README — badge row + section.
7. Update AGENTS.md — Figma Make section.
8. Update llms.txt — NEW v0.42.0 section.
9. Test: `pnpm --filter site dev`, walk through the page, copy buttons, mobile, dark mode, every paste block fetches content correctly.
10. Pre-publish-audit (locally; site app changes don't gate core publish but llms.txt does).
11. Commit, branch `feat/figma-make-rollout`, PR, admin-merge.
12. Since no core API change, no changeset needed for shilp-sutra. Site app gets a patch via changesets (existing site versioning flow).

## Out of scope (Phase 2)

- Visual proof screenshots (need a real Make session to capture them; defer until kit hits some usage).
- Blog / LinkedIn announcement.
- Twitter clip.
- Devalok studio voice quote.
- Forum thread asking Figma for cross-org sharing + deep-link install. File later when we have multiple consumer orgs asking.
- Diff script: detect which guideline files changed since last npm tag, auto-flag re-paste candidates in release notes.
- Embeddable iframe showing live Make output (blocked by Figma CSP `frame-ancestors 'self'`).

## Risk + open questions

- **Build-time file read from `node_modules`.** Vite-with-RSC + `fs.readFileSync` works on Vercel. If site deploy is on a different runtime, may need to copy `make-kit/` into `apps/site/public/` at build. Check site CI before committing.
- **Copy-button + clipboard API.** Needs HTTPS + `navigator.clipboard` polyfill consideration for older browsers. Site already does this elsewhere — check `apps/site/components/code-block.tsx` for the existing pattern.
- **Guideline content drift.** When core bumps make-kit content, site must rebuild + redeploy to pick it up. Acceptable — site rebuilds on every shilp-sutra publish anyway via Vercel hook.
- **Mobile UX of 26 paste blocks.** Long list. Consider collapsible category sections (foundations / components) on mobile to shorten scroll.
- **Filed forum thread for Figma to expose deep-link install** — should we file it now while it's fresh? Cheap to file, signal demand. Add as Phase 1.5 task.

## Success criteria

- New visitor lands on `/figma-make`, can register kit in their Figma org without leaving the page.
- AI agent reading our `AGENTS.md` knows to point users at the route.
- Consumer org admin running shilp-sutra upgrade ritual sees in our llms.txt v0.42 notes that Make kit exists.
- Cross-team visibility: post a Linear / Notion entry in your studio's tracker so next quarterly review can see uptake.

## Estimated effort

- Page + components: ~3–4 hr (matches `/agents` complexity).
- README / AGENTS.md / llms.txt updates: ~30 min.
- Testing + polish: ~1 hr.
- Total: half day.
