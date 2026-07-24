# ui/badge-group — finish-bar audit
Finish: 3/5   Market: LAGS(MUI AvatarGroup / Ant Avatar.Group)   Rebuild: polish

BadgeGroup is a thin `forwardRef` flex-wrap wrapper around `Badge` children with an
optional `+N` overflow pill. Since the 2026-07-01 baseline (2/5) it has genuinely
improved: the P0 keyboard/aria gap is fixed (overflow pill gets `aria-label="Show N more"`
when interactive), it now `forwardRef`s + spreads `...rest`, and a per-component doc exists.
What still holds it back is composability: a `size` prop that lies, no overflow render-slot
for the single most common real use (popover of the remaining tags), raw non-DS spacing
tokens, an outline overflow default against house preference, no dedicated tests, and no motion.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No slop tells (no gradient/glow/edge-soup/radius-ds). But `gap-1`/`gap-1.5`/`gap-2` are consumer-numeric Tailwind spacing — CLAUDE.md mandates `--spacing-ds-*` (siblings use `gap-ds-*`). Overflow pill hardcoded `variant="outline"` against the soft-preference. |
| accessibility | gap | forwardRef + `...rest` passthrough; interactive `+N` gets `aria-label`. But no `role="list"`/`listitem` tag-list semantics; when `max` overflows WITHOUT `onOverflowClick`, the hidden badges silently vanish from the a11y tree — the inert `+N` span has no `title`/sr-text explaining the count. No axe test. |
| api-composability | ✗ | `size` is a FALSE contract — typed `BadgeProps['size']`, implies group sizing, but only sizes the `+N` pill (children untouched, line 38); the "SharedSize" story reinforces the lie. No `renderOverflow`/`overflow` slot → the popover-of-remaining use case is unbuildable. Hidden children are never handed back to the consumer. No `asChild`. |
| docs-dx | gap | Doc exists with Props/Defaults/Example/Composability/Gotchas and is honest (gotcha explicitly states `size` only affects the overflow badge). But the doc papers over the API defect rather than the API being fixed, and the `SharedSize` story name misrepresents behavior. |
| testing | ✗ | No dedicated `badge-group.test.tsx`. Coverage = 2 cases folded into `badge.test.tsx` (all-visible, overflow-shown). `gap`, `size`, `onOverflowClick` firing, edge counts, and axe are all untested. No `describeConformance`. |
| motion | gap | No motion at all. The `+N` pops in/out with no transition when children cross `max`; no `layout` reflow transition. Not a bad-motion tell — just absent where the threshold-crossing moment invites `springs.snappy` (as Badge's dot uses), reduced-motion-guarded. |
| state-coverage | gap | `max >= total` correctly renders no `+N`. But `max={0}` is unguarded (renders `+N`=total with zero visible), and empty-children / single-child are undemoed and untested. |
| content-resilience | ✓ | Overflow collapse IS the content-resilience feature; `flex-wrap` handles many items and wraps cleanly. Long-text truncation is delegated to Badge. RTL-safe (no directional content). |
| theming-resilience | ✓ | No bespoke colors or radius; delegates all theming to Badge tokens. Survives an accent-9 swap and dark mode via the child. |
| system-cohesion | gap | forwardRef + compound (`Badge.Group`) pattern matches siblings, but `gap-1/1.5/2` breaks the DS spacing-token language every sibling speaks, and the outline overflow default breaks the soft-preference. Two small drifts from "one system". |
| craft | gap | Nice touches: comment justifying the button a11y, `size ?? 'sm'` fallback, aria-label only when interactive. Undercut by the `size`-does-nothing wart, which is the opposite of craft. |
| perceived-perf | ✓ | Instant, lightweight, no loading state needed, no CLS beyond normal flex reflow. |
| market-benchmark | gap | LAGS MUI AvatarGroup (`renderSurplus`, `total`, size propagation) and Ant Avatar.Group (`maxCount` + built-in `maxPopover`). We have `max` + a click handler but none of the slot/popover/size-propagation affordances the peers ship. |
| cross-ds-adoption | ✓ | Clear, concrete borrow targets identified below. |

## Top gaps (prioritized)
- [P1] api-composability — `size` prop silently sizes only the `+N` pill, not the children it names → either `React.cloneElement` visible children to inject `size` (makes the name honest, matches the SharedSize story intent) OR rename to `overflowSize` with a deprecated `size` alias.
- [P1] api-composability — no overflow slot; the popover-of-remaining use case is unbuildable → add `overflow?: (count: number, hidden: React.ReactNode[]) => React.ReactNode` (default render = current pill), handing the hidden children back so a consumer can build a Popover/Tooltip.
- [P1] visual-integrity / system-cohesion — swap `gap-1`/`gap-1.5`/`gap-2` → `gap-ds-02`/`gap-ds-02b`/`gap-ds-03` (4/6/8px equivalents already exist), and default the overflow pill to `variant="soft" color="neutral"`.
- [P2] testing — add `badge-group.test.tsx`: gap classes, `onOverflowClick` firing, `size` propagation (post-fix), `max >= total` renders no `+N`, `max={0}` behavior, and a `vitest-axe` play test.
- [P2] accessibility — when overflow occurs without `onOverflowClick`, render a `title`/sr-only text so the hidden count isn't dropped from the a11y tree; consider `role="list"`/`listitem` tag-list semantics.
- [P2] state-coverage — guard/decide `max <= 0`; add empty-children and single-child stories.
- [P3] motion — wrap `+N` in `AnimatePresence` with `springs.snappy` (matching Badge's dot), reduced-motion-guarded; optional `layout` transition on reflow.

## What it does well
- Fixed the baseline P0: interactive `+N` is a real keyboard-reachable `<button>` (via Badge's onClick path) with an explicit `aria-label="Show N more"`.
- Now `forwardRef<HTMLDivElement>` + extends `HTMLAttributes` + spreads `...rest` — refs, `data-*`, `aria-*` all pass through (baseline F2 resolved).
- Composes `Badge` rather than re-rolling a pill — no StatCard-style duplication.
- Clean typing: no `any`, no stringly types; `gap` axis is a sensible layout knob (not a mislabeled CVA variant), `size` sourced off `BadgeProps['size']`.
- Doc is honest — it explicitly discloses the `size`-only-affects-overflow quirk rather than hiding it.

## Cross-DS adoption ideas
- **MUI AvatarGroup `renderSurplus={(surplus) => ReactNode}`** — exactly the overflow render-slot we lack; import it as `overflow`/`renderOverflow` handing back count + hidden children.
- **MUI AvatarGroup `total`** — decouples the displayed total from the child count (useful when the full list lives server-side and only a page is rendered); we have no such escape hatch.
- **MUI AvatarGroup size propagation** — the group's size cascades to children; we should make `size` actually do this (or rename), closing the false-contract gap.
- **Ant Avatar.Group `maxPopover`/`maxCount`** — a built-in popover of the hidden items on `+N` hover/click; a first-class version of the pattern our `onOverflowClick` only half-enables.

## Rebuild note
Polish, not rebuild — the structure (flex-wrap + slice + `+N` pill, composing Badge) is sound and the a11y/forwardRef baseline debts are already paid. The remaining work is in-place: make `size` honest (clone or rename with deprecated alias), add an `overflow` render-slot that exposes the hidden children, swap the three spacing tokens to `gap-ds-*`, flip the overflow default to `soft`, guard the `max<=0` edge, and add a real test file + a reduced-motion-guarded `+N` transition. No structural teardown required.
