# ui/badge — finish-bar audit
Finish: 4/5   Market: LEADS   Rebuild: polish

Mature, well-structured inline label: single-source `colorMap`, 4 canonical variants (subtle/solid/outline/soft), 4 sizes, 16 colors + `custom`, `asChild`, compound `Badge.Group` + `Badge.Indicator`, grain-ready (`relative overflow-hidden isolate`), correct `rounded-pill` role token everywhere. Broadest badge API in the market. Held from a 5 by a11y misses that persist unfixed from the 2026-07-01 baseline (toggle announces no state; interactive badges below 44px), a motion defect (selected check-icon animates layout props unguarded), and a scatter of magic numbers.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No accent rails / gradient text / edge-soup; variants have mutually exclusive edges; `rounded-pill` is the correct role token (no `rounded-ds-*`/`rounded-full`); category colors are real `category-*` tokens. Drift: `px-2.5`/`pl-2.5` (annotated 10px gaps) and indicator `min-w-[18px]`/`h-[18px]`/`text-[11px]`, plus `brightness-[0.97]/[0.92]` magic numbers. |
| accessibility | ✗ | Interactive toggle emits **no `aria-pressed`** (documented `selected` chip pattern → SR users get a plain button, no on/off). No `aria-disabled` on the non-button (span/div) disabled path. Interactive badge heights 16–28px — below the 44px `touch-target` util (never applied). `circle` count badges ("3","99") expose no accessible label. Focus-visible rings, dismiss `aria-label`, and the div-case keyboard handler ARE present. |
| api-composability | ✓ | Canonical `variant`/`size`/`color`; `asChild` (Slot); `forwardRef` + `displayName`; typed `IconInput` (no `any`); deprecated-alias discipline (Chip merged in); compound Group/Indicator. `selected` is controlled-only but correct for a chip. `'custom'` sentinel in the color union is a documented, accepted nit. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas/Changes. **Type drift persists**: `startIcon`/`endIcon` shown as `ReactElement \| null`, source is `IconInput`. `dotPulse` prop undocumented. Source-is-truth rule → doc understates accepted types. |
| testing | gap | Unit + RTL + `describeConformance` + interaction coverage (dismiss/onClick/selected/truncate/circle) + Indicator/Group tests. **No `vitest-axe` assertion** — the rubric wants an axe play test. |
| motion | gap | Dot entrance `springs.snappy`; pulse guarded via `Dot`; press is thoughtfully asymmetric (fast-in / instant press / slow settle); BadgeIndicator guards reduced-motion cleanly. **Defect (unfixed from baseline):** selected check-icon animates `width`/`marginRight` (layout props, not transform) with **no `useReducedMotion` guard**. |
| state-coverage | ✓ | hover / active / focus-visible / disabled / selected all deliberately designed. empty/error N/A for a label. |
| content-resilience | gap | `truncate` + `maxWidth` + title tooltip; BadgeGroup `+N` overflow; `circle` for counts. **RTL gap:** padding uses physical `pl-*`/`pr-*` (`paddingLeftWithIcon`/`paddingRightWithTrailing`) + `-mr-0.5`, not logical `ps-*`/`pe-*` — leading/trailing padding lands on the wrong side in RTL. |
| theming-resilience | ✓ | Semantic step tokens (bg-3 / fg-11 / border-7 / solid-9) survive accent-9 swap; `rounded-pill` honors `[data-shape]`; no dark-mode recess to invert. Minor: category solids hardcode `text-white` rather than a category-fg token (safe on saturated -9, worth noting). |
| system-cohesion | ✓ | Shares springs, durations, `rounded-pill`, `ring-accent-9` focus, and the `Dot`/`Icon`/`normalizeIcon` primitives with siblings. Feels like one system. |
| craft | ✓ | Reduced leading/trailing padding when icons/dot present (optical), `select-none`, cursor-pointer only when interactive, dismiss `stopPropagation`, title on truncate, grain isolate. |
| perceived-performance | ✓ | Instant press feedback (`active:` 0ms), spring entrances, feedback confined within the pill. |
| market-benchmark | ✓ | LEADS shadcn/Geist (static variant-only) and matches/leads MUI Chip + MUI Badge: we cover interactive toggle, dismiss, custom colors, 16 colors, and a compound Indicator (placements/max/dot/showZero/invisible) + Group (overflow). MUI leads on one thing only: toggle/selected a11y. |
| cross-DS-adoption | gap | See ideas below — React Aria TagGroup keyboard model is the clear steal. |

## Top gaps (prioritized)
- [P1] accessibility — interactive `selected` toggle emits no `aria-pressed`; disabled span/div emits no `aria-disabled` → add `aria-pressed={!!selected}` on the `onClick` path and `aria-disabled` on the non-button disabled path.
- [P1] motion — selected check-icon animates `width`/`marginRight` unguarded → gate on `useReducedMotion` (snap `duration:0`) and prefer `scale`/`opacity` + reserved width over layout props.
- [P2] accessibility — interactive badges are 16–28px tall (below 44px) and `circle` count pills are unlabeled → offer a `touch-target`/hit-area expansion for the `onClick` path and an `aria-label` (or `role="status"`) hook for count circles; at minimum document it.
- [P2] content-resilience — physical `pl-*`/`pr-*`/`-mr-*` break RTL → switch icon/trailing padding to logical `ps-*`/`pe-*`.
- [P2] docs — fix `startIcon`/`endIcon` to `IconInput`, document `dotPulse`.
- [P3] testing — add a `vitest-axe` assertion (interactive + dismissible + disabled states).
- [P3] visual — tokenize the 10px `px-2.5`/`pl-2.5` (add a `--spacing-ds-*` step or accept the annotated exception) and the indicator `[18px]`/`[11px]`/brightness magic numbers.

## What it does well
- Single-source `colorMap` keyed by color × variant — zero per-variant duplication, trivially extensible.
- Correct polymorphic element choice: `button` for onClick, `span` default, `div[role=button]` when onClick+onDismiss (avoids invalid nested buttons) — with a matching keyboard handler.
- Radius is exclusively the `rounded-pill` role token — clean on the release-only radius gate (no `rounded-ds-*`/`rounded-full`).
- Compound system (`Group` overflow `+N`, `Indicator` placements/max/dot/showZero/invisible) genuinely broadens the archetype past shadcn/Geist.
- Reduced-motion handled correctly in `Badge.Indicator` and the dot pulse — the pattern exists in the file, it just isn't applied to the check-icon.

## Cross-DS adoption ideas
- **React Aria TagGroup** — dismissible filter-chip sets get roving arrow-key nav, Backspace/Delete to remove the focused chip, and announced removal. Our `BadgeGroup` is layout-only (no keyboard traversal across chips); this is the highest-value steal for the Dismissible/Interactive use cases.
- **MUI Chip** — leads us only on toggle a11y (proper pressed/selected semantics) and an `avatar` leading slot; worth matching the a11y and considering an avatar-sized leading slot for people-tags.
- **Ant Design `Tag.CheckableTag`** — a first-class checkable-tag primitive with built-in selected semantics; validates promoting our `onClick + selected` combo into a named, a11y-complete toggle mode rather than an emergent pattern.

## Rebuild note
Polish, not rebuild. The structure — colorMap, CVA axes, polymorphic element choice, compound Group/Indicator — is sound and market-leading in breadth. Every gap is an in-place edit: add `aria-pressed`/`aria-disabled`, guard + de-layout the check-icon animation, switch to logical padding properties, add a touch-target/count-label hook, correct doc types, add an axe test, and tokenize the handful of magic numbers. No API break required; all additive or internal.
