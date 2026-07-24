---
name: finish-bar-audit
description: >
  Audit a shilp-sutra component against the 14-axis best-in-market "finish bar"
  rubric — read-only, produces a per-component scorecard, prioritized gap list,
  market verdict (leads/parity/lags), and concrete cross-DS adoption ideas. Use
  when asked to audit / grade / benchmark a component (or the whole DS) for
  best-in-market quality, "finish bar", "is this component world-class", or to
  triage what needs a rebuild. AUDIT ONLY — never edits component code.
---

# Finish-Bar Audit

Grade a shilp-sutra component against the best design systems in the market
**and** against our own prior standard, so we know exactly where each component
leads, matches, or lags — and what to steal from the best.

**This skill is READ-ONLY.** It never edits component source. Output is an audit
report. Rebuilding is a separate, later decision informed by this report. If
asked to "fix" while auditing, note the fix in the report and move on.

Born from the 2026-07-24 SegmentedControl rebuild, which was flagged 3/5 by the
2026-07-01 audit and turned out to have edge-soup visuals, wrong ARIA, magic
numbers, a non-canonical API, no reduced-motion guard, and a dark-mode track
that vanished. This skill exists so we find those *before* a user calls a
component "ugly".

## 0. Before you start (per component)

Gather, in this order — **source is truth, docs can rot**:
1. `packages/core/src/<layer>/<name>.tsx` — the component (+ any subfiles).
2. Its CVA block (variant/size/state axes) — authoritative for the API surface.
3. `<name>.stories.tsx` and `<name>.test.tsx` — coverage.
4. `packages/core/docs/components/<layer>/<name>.md` — doc (check accuracy vs source).
5. The prior finding file if present: `docs/audits/2026-07-01-ai-giveaway-polish/findings/<layer>__<name>.md` — reuse its finish score + open gaps, but re-verify (many fixed in 0.49/0.50/0.52).
6. The tokens it consumes (grep for `rounded-`, `bg-surface`, `shadow-`, `p-ds-`, `text-ds`, spring configs).

Complement with the repo's own gates as oracles (don't re-implement them):
- `check_slop` MCP tool (deterministic anti-slop: nested cards, filled+outline duos, skipped headings, etc.).
- `scripts/pre-publish-audit.mjs` gate names (radius roles, surface layering, shadow hygiene — see §3).
- Load the **`emil-design-eng`** skill for the motion axis and **`impeccable`** / **`web-design-guidelines`** for cross-checks.

## 1. The 14-axis rubric

Score each axis: **✓ (at bar)** · **gap (minor, fixable)** · **✗ (below bar)**.
Then an overall **finish score /5** and a **market verdict** (§2).

### Carried from prior audits
1. **Visual integrity** — anti-slop tells (edge-soup = border+shadow double edge; gradient text; glow/glass/blob; accent rails; emoji; pill-spam); **surface layering** correct (page/overlay=surface-1, cards=surface-2, hover=3, active=4, chrome=surface-chrome); **radius ROLE tokens** (`rounded-control/surface/overlay/pill`, NEVER `rounded-ds-*`/`rounded-full` in components); **shadow hygiene** (one edge treatment, role shadows not raw); **spacing cadence** (ds-03/05/07 tiers, no off-cadence magic like `p-[3px]`); **type ramp** (`text-ds-*`, semibold headings); optical alignment.
2. **Accessibility** — correct ARIA *pattern* (a panel-less toggle is `radiogroup`/`radio`, not `tablist`); **44px touch targets** (`touch-target` util); focus-visible ring + offset; complete keyboard nav (arrows/Home/End) + roving tabindex; contrast (WCAG AA, run `setu_check` pairings for brand output); screen-reader names (`aria-label` for icon-only); `forced-colors` support.
3. **API & composability** — canonical vocabulary (`value`/`defaultValue`/`onValueChange`; variant taxonomy `solid/soft/outline/ghost/link`; `state` not `error`/`color`); controlled **and** uncontrolled; renames staged as **deprecated aliases** (never a hard break); `ReactNode` where a string is limiting; slots / `asChild` / polymorphism where a consumer would need it; `forwardRef` + `displayName`; typed props (no `any`, no stringly `color?: string`); sensible defaults; **composes** primitives rather than re-rolling them (StatCard/Card drift is the anti-pattern).
4. **Docs & DX** — doc has Props/Types/Defaults/Example/Composability/Gotchas and **matches source**; stories cover every variant + state + an axe play test; changeset discipline; MCP-manifest parity.
5. **Testing** — unit + RTL + `vitest-axe`; `describeConformance`; interaction/state coverage (not just "renders").

### New axes — top our own standard + benchmark the market
6. **Motion (Emil)** — load `emil-design-eng`. Should-it-animate (frequency-appropriate; never animate 100×/day actions); custom easing (no `ease-in` on UI; strong curves); duration <300ms for UI; **bounce-free spring for functional** toggles (Apple `{duration, bounce:0}`); `useReducedMotion` / `motion-safe` guard; press feedback (`active:scale-[0.97]`); origin-aware popovers; interruptible (transitions/springs, not keyframes, for rapid triggers); animate transform/opacity only (HW-accel).
7. **State coverage** — hover / active / focus-visible / disabled / loading / **empty** / **error** / selected all *deliberately designed*, not just the default state. Empty & error states are where most DS components are lazy.
8. **Content resilience** — overflow/truncation strategy; very long text; i18n length expansion; zero / one / many items (e.g. a segmented control with 9 options); dynamic content; RTL layout (logical properties, mirrored arrows).
9. **Theming resilience** — survives a brand accent-9 swap; honors `[data-shape]` presets (⇐ why radius role tokens matter); density presets; light↔dark **elevation inversion** (a "sunken" track must not vanish on near-black — segmented's dark-track bug).
10. **System cohesion** — shares the DS's spring, radius language, focus-ring, and spacing with its siblings; no bespoke drift. Paul Graham's "thousand voices in tune" — does it feel like one system?
11. **Craft / unseen details** — cursor affordances; selection states; sub-pixel/optical corrections; the micro-details users feel but never consciously notice. Where a component quietly nails these, say so.
12. **Perceived performance** — instant feedback on interaction; optimistic where possible; skeleton/loading quality; no layout shift (CLS); no jank under load.
13. **🏆 Market benchmark** — score against the **best-in-class equivalent** (peer map §4): do we **lead / match / lag**, and on what specifically.
14. **🔎 Cross-DS adoption opportunities** — concrete patterns, props, interactions, or tokens from the best peers that we DON'T have and should consider importing. Actionable ("Base UI's Combobox has virtualized listbox + async loading state — we lack both"), not vague.

## 2. Scoring & verdict

- **Finish score /5** — holistic, weighted toward axes 1–3 + 6 (a user-facing component that fails a11y or looks slop can't score >2 regardless of docs). 5 = market-leading; 4 = at bar, minor gaps; 3 = shippable, real gaps; ≤2 = below bar / needs rebuild.
- **Market verdict** — `LEADS` (better than the best peer) / `PARITY` / `LAGS (behind <peer>)`.
- **Rebuild recommendation** — `none` / `polish` (in-place fixes) / `rebuild` (structural), with a one-line why.

## 3. DS rules & hard-won lessons (bake these into every audit)

- **Radius**: components use role tokens only. `rounded-ds-*`/`rounded-full` fail a **release-only** audit gate (not in PR CI) — flag any usage as a ship-blocker. (Cost a release cycle on 0.52.0.)
- **Surface layering** is a hard gate — a card/panel on the page is `bg-surface-2`, not `-1`.
- **Shadow**: `shadow-raised` etc. carry a `0 0 0 1px` ring; stacking that under a bordered/inset track = edge-soup. One edge treatment.
- **Spacing**: 3 tiers (ds-03/05/07); off-cadence arbitrary values (`p-[3px]`) are a drift tell.
- **Renames are breaking**: any prop/variant rename must ship a deprecated alias + `@deprecated` JSDoc; a type *narrowing* is breaking even if it looks like widening.
- **Source of truth**: CVA source > docs > llms.txt. Grep the source for variant names; never trust a doc's prop table without checking.
- **Release-only gates** (radius roles, skill-refs, icon allowlist, compiled-CSS coverage) don't run in PR CI — a component can be "green" and still block a release.
- **Dark mode**: elevation often inverts (a recess can't go darker than a near-black page); check both themes.

## 4. Market benchmark peer map

| Archetype | Benchmark against |
|---|---|
| Overlays (Dialog/Popover/Sheet/Tooltip/Menu/HoverCard) | Radix, Base UI, Vaul (drawer), Sonner (toast) |
| Form controls (Input/Select/Combobox/Checkbox/Switch/Slider/Radio/OTP) | Radix, Base UI, Ark, React Aria (Adobe) |
| Actions (Button/SplitButton/SegmentedControl/ToggleGroup) | shadcn, Radix, Apple HIG, Linear/Vercel taste |
| Data (Table/DataTable/Tree) | TanStack Table, Carbon, MUI DataGrid, Ark |
| Navigation (Tabs/Breadcrumb/Nav/Sidebar/Command) | Radix, Ark, cmdk (Command) |
| Feedback (Toast/Alert/Progress/Skeleton/Badge) | Sonner, Radix, Vercel/Geist |
| Charts | Recharts, visx, Tremor, Nivo |
| AI (Conversation/CommandBar/BlockRenderer/Message) | Vercel AI SDK UI, assistant-ui, ChatGPT/Claude/Perplexity UIs |
| Motion baseline (all) | animations.dev (Emil), Vaul, Sonner, Linear |

Use inline WebSearch/WebFetch to confirm current peer behavior when unsure — don't audit from stale memory of a peer's API.

## 5. Output format

Write under `docs/audits/<date>-finish-bar-v2/`:

**Per component** → `findings/<layer>__<name>.md`:
```
# <layer>/<name> — finish-bar audit
Finish: <n>/5   Market: LEADS|PARITY|LAGS(<peer>)   Rebuild: none|polish|rebuild

## Scores
| Axis | Verdict | Note |
| visual-integrity | ✓/gap/✗ | ... |
| ... (all 14) ... |

## Top gaps (prioritized)
- [P0/P1/P2] <axis> — <gap> → <fix direction>

## What it does well
- ...

## Cross-DS adoption ideas
- <peer> does <X> — we could <Y>

## Rebuild note
<one paragraph: none / polish scope / rebuild scope>
```

**Rollup** → `scorecard.md` (one sortable row per component: name, finish /5, market verdict, rebuild rec, top-1 gap) + `backlog.md` (all gaps ranked P0→P2 across the DS) + `by-dimension.md` (worst offenders per axis, so systemic issues surface).

## 6. Process checklist (per component)

1. Gather inputs (§0). 2. Score all 14 axes (§1), source-verified. 3. Benchmark vs peer (§4), WebSearch if unsure. 4. Finish score + market verdict + rebuild rec (§2). 5. Write the finding file (§5). 6. After a batch, update `scorecard.md` / `backlog.md` / `by-dimension.md`.

## 7. Do NOT

- Edit component source (audit only). - Invent props/variants not in source. - Trust docs over source. - Skip the a11y or motion axis because a component "looks fine". - Score >2 on a component with a P0 a11y or slop failure. - Recommend a rebuild without naming the structural reason.
