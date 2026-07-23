# Anti-Slop Program — shilp-sutra (2026-07-23)

**Goal.** Make shilp-sutra components genuinely not read as AI-generated, and build durable, mechanical tooling so slop can't ship or regress. Fix all flagged slop across the DS.

**Why now.** A Setu UI-law audit of this session's new work found real tells (tracked-caps overuse, drawn card border) that the **impeccable auto-detector missed entirely** (`[]` on all files — it's markup/CSS-oriented, blind to Tailwind-utility + DS-token semantics). Generic scanners don't work on a Tailwind/CVA DS; we need DS-native detection. An ADHD ideation pass (inversion / regulator / biology frames) produced the mechanism set below.

**Authorities.** Setu UI law = `setu_get_dimension('ui')` + `setu/docs/technical/setu-ui-standards.md` + anti-patterns (`setu_get_anti_patterns`). shilp-sutra `CLAUDE.md` surface/token rules. Where they conflict (card borders), see the Phase-0 experiment.

## Decisions (locked 2026-07-23)
- **Sequencing:** hybrid — fix our new components now, build tooling, then DS-wide sweep.
- **Detectors:** build all four (corpus checker, `@mutation` eslint rule, CVA axis-liveness, MCP `check_slop`).
- **Fix depth:** everything flagged (all severities), in waves.
- **Card border vs tonal elevation:** RESOLVED (2026-07-23, visual pick from the A–E experiment) → **DS-wide card edge = 1px `border-surface-border-subtle/30`** (option E: full-alpha subtle at 30%). Not Setu's zero-border tonal, not a full-weight border — a whisper hairline. This is the edge rule Phase 3 applies across flagged components.

## Not doing (ADHD traps, explicitly rejected)
- Threshold affordances (rest-hidden controls) — a11y/discoverability fail.
- Ratio spacing (2:3, 3:5) — fights the DS 4-tier token scale (§4).
- Apoptotic / competitive auto-cull of variants — destructive; needs runtime usage telemetry the lib deliberately doesn't ship.
- Cyclomatic "decision-density" ceiling — ill-defined for styling; noisy.

---

## Phase 0 — Fix new components + border experiment (hours)
1. **Finding #1 (caps overuse):** in `diff.tsx`, keep tracked-uppercase only on the split **column headers** (data-table-sanctioned). Make the summary "Changes" label and the fields `add/del/chg` kind labels **mixed-case** (`text-ds-*`, not `uppercase tracking-wide`). Kills the eyebrow read.
2. **Finding #3 (radius):** Diff container `rounded-control` → `rounded-ds-lg` (card radius).
3. **Finding #5 (contrast):** verify `success-11`/`error-11` on `success-3/4` + `error-3/4` ≥4.5:1 in compiled CSS (Radix scales, expected pass); document.
4. **Border experiment (finding #2):** a Storybook story rendering the same Diff panel three ways — (A) current `border-surface-border`, (B) no border + tonal (`surface-raised` on a recessed `surface-base` frame, per Setu), (C) hairline (`border-surface-border-subtle` or a lighter tint). User picks in the rendered app (light + dark). The pick becomes the DS-wide card-edge rule feeding Phase 3.

## Phase 1 — Detectors (the tooling that makes the sweep tractable)
All mechanical — **no agent fan-out** for auditing (memory: multi-agent burn rule).

1. **Slop-signature corpus + checker** (`scripts/slop-corpus.json` + `scripts/check-slop.mjs`, wired into `pre-publish-audit.mjs`).
   - Corpus grows from real audit findings, so it never goes stale.
   - Seed rules (from today's Setu pass): ≥2 tracked-uppercase roles in one component; card with hard border AND no tonal step; ≥3 distinct accent hues in one component; `border-l-[Npx]`/`border-r-[Npx]` >1px colored (side-stripe); drop-shadow on a card; identical repeated icon-title-blurb card grids.
   - Per-rule severity + allowlist-with-reason.
2. **`@mutation` eslint rule** (extend `@devalok/eslint-plugin-shilp-sutra`).
   - Flags DS-semantic deviations: arbitrary spacing off the ds-scale, easing not in motion tokens, hue outside the component's color budget, hard border on a card. Allowed only with `// @mutation reason: <why>`; else CI fails.
   - Ship ONE rule first (arbitrary-value-off-scale) with the annotation escape; measure annotation rate (guard against `@ts-nocheck`-style abuse).
3. **CVA axis-liveness audit** (`scripts/check-cva-liveness.mjs`).
   - Parse each `cva()` + its `.stories.tsx`; every declared axis must render ≥2 visually-distinct values across stories (Chromatic pixel-diff). Declared-but-unrendered axis → flagged (warn → fail at next major).
4. **MCP `check_slop` tool** (`packages/mcp-server`) — deferred to last.
   - Hosted endpoint: `check_slop(component_source)` runs the corpus over pasted/authored source so consumer AI agents (Cursor/Claude) self-gate. Network-effect prevention. Heaviest (server + deploy); build after 1–3 prove out.

## Phase 2 — Run detectors DS-wide → ranked backlog
- Run corpus checker + CVA-liveness over `packages/core/src/**`.
- Output a ranked slop backlog (component × rule × severity) to `docs/audits/slop-backlog-2026-07.md`.
- This replaces a manual 120-component audit — mechanical, cheap, repeatable.

## Phase 3 — Fix everything flagged, in waves
- Wave by severity: P0 (accent-rails, card shadows, caps-overuse, chip-spam, side-stripes) → P1 (radius vocab, border/tonal per Phase-0 outcome, label casing) → P2 (cosmetic).
- Each wave: fix → stories updated → Chromatic review → corpus re-run to confirm clean.
- Batch commits by rule (e.g. "fix: remove tracked-caps overuse across N components") for reviewable diffs.
- Watch for breaking changes (renames/removals) — sweep whole repo (site/playground/smoke/make-kit) per the 0.49.0 lesson.

## Phase 4 — Gates + governance
- CI: corpus checker + CVA-liveness become hard gates in `integration.yml` + `release.yml` (mirror both).
- **Governance (herd-immunity promotion):** a new pattern (variant, spacing cadence, easing) stays "experimental" until 3+ independent uses converge, then it locks canonical. Quarterly `@mutation` review: promote (→ token) or kill each.
- Publish the corpus + `check_slop` so consumer agents inherit the gate.

---

## Effort & risk
- **Big program** — Phase 0 hours; Phase 1 ~2–3 days/detector; Phase 3 scales with backlog size (unknown until Phase 2). MCP tool adds server/deploy work.
- **Risk — false positives** in corpus/eslint → devs spam `@mutation`/allowlist. Mitigate: start narrow, measure annotation rate, tune.
- **Risk — Chromatic churn** from "everything flagged" — large visual diff volume; review in batches.
- **Risk — Setu-vs-shilp-sutra divergence** beyond borders may surface during the sweep; escalate conflicts, don't silently pick.
- **Provocation (parked):** DS-owned MCP `check_slop` as the forced gate for all consumer agents = slop prevention as a network effect (this is detector #4, promoted from the ADHD wildcard).
