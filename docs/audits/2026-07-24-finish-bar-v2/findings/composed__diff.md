# composed/diff — finish-bar audit

Finish: 3/5   Market: PARITY (GitHub diff / Monaco DiffEditor)   Rebuild: polish

Version-compare viewer wrapping the headless `diff` (jsdiff) engine. Three modes
(inline / split / fields-JSON), line/word granularity, collapse-unchanged, and
per-hunk accept/reject for review flows. Strong API and craft; held back by zero
tests and a review-control reveal that fails keyboard + touch.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Single edge treatment (border-card, no shadow) — no edge-soup, clean. `rounded-surface` role token on the card ✓. But `rounded-xs` on inline `<mark>`s is a bare TW scale, not a role token. Base surface is `surface-raised` (light = neutral-1 = page ground) not `surface-2` — separation leans entirely on the border. No gradient/glow/emoji/pill-spam. |
| accessibility | ✗ | Review controls are `opacity-0 group-hover:opacity-100` with no `group-focus-within` and no touch path — invisible on touch (no hover) and invisible to keyboard until focused. Added/removed rows differentiate by color + a `&minus;`/`+` glyph only, with no SR-only "Added/Removed" label (fields mode does label them ✓; inline/split don't). Accept/Reject buttons have good `aria-label`s; expander is a real `<button>` with text. |
| api-composability | ✓ | Canonical `before`/`after`, `mode`, `granularity`, `onAcceptHunk`/`onRejectHunk`. Batteries-included `<Diff>` + compound `Diff.Root/Summary/Body/ColumnLabels` + `useDiff()`. `forwardRef`+`displayName`, exported `DiffHunk`/`DiffProps`, no `any`. Excellent surface. |
| docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas and matches source (verified). Stories cover all modes + collapse + review + composable. But no axe play test, and a leftover dev-scaffolding story (`BorderExperiment` — "pick one", anti-slop Phase 0) would ship into published Storybook. |
| testing | ✗ | **No `diff.test.tsx` at all.** Non-trivial pure logic (`buildRows`, `toSegments`, `collapse` thresholds/context, `flatten`, `fieldChanges`, word-count stats) is completely untested. No RTL, no vitest-axe, no describeConformance. |
| motion | gap | `Reveal` guards `useReducedMotion` ✓, duration 0.2s easeOut ✓, animates opacity+height together (no slide-no-fade). Weak point: animating `height: auto` triggers layout/reflow (not HW-accelerated) — jank risk on large expansions; a grid-rows or transform approach is cheaper. Uses a bespoke tween, not the DS shared spring. |
| state-coverage | gap | Empty ("No changes" / "No field changes.") and error (invalid-JSON message) states deliberately designed — the lazy-DS weak spots are covered ✓. But every interactive reveal is hover-bound (see a11y); no loading state for large/async diffs. |
| content-resilience | ✓ | `whitespace-pre-wrap break-words` cells + `overflow-x-auto` body; collapse of long unchanged runs; `min-w-0` flex cells in split; `r.text \|\| ' '` preserves empty-line height; `flatten` handles nested objects + arrays. RTL not handled (physical `pl-/pr-`, `text-right`) — defensible for code, weaker for prose word-diff. |
| theming-resilience | ✓ | Pure semantic tokens (success/error scales, surface-*), no hard-coded accent, so brand accent-9 swap is a no-op. `rounded-surface` honors `[data-shape]`. Light↔dark tints flip via token overrides; `surface-raised` resolves neutral-1→neutral-2. `rounded-xs` on marks is fixed (not shape-remapped) — minor. |
| system-cohesion | gap | Composes `Button`/`Icon`, uses `cn`, ds spacing, semantic scales — mostly in tune. Drift: `rounded-xs` (non-role), arbitrary `min-w-[3.5ch]`, `mt-[2px]`, dense `gap-ds-01`/`py-ds-01` off the ds-03/05/07 cadence, and a hand-rolled Reveal tween instead of the DS spring. |
| craft | ✓ | `select-none` on gutters + `+`/`−` signs (copy the diff → clean text, no line numbers) is real craft. `tabular-nums` line numbers align. Word-level intra-line highlight when a row is both del+add. `line-through decoration-error-11/40` on removed words. Thoughtful. |
| perceived-performance | gap | Diff memoized on inputs ✓. But no virtualization — a large changed region renders every row (collapse only folds unchanged runs); big diffs jank + shift. Synchronous main-thread compute blocks on large inputs. `height:auto` expand causes reflow/CLS. |
| market-benchmark | PARITY | vs GitHub diff / Monaco DiffEditor / react-diff-view. Leads on: structured `fields` (JSON key-diff) mode, first-class headless accept/reject hunks, compound composability. Lags on: virtualization (Monaco/GitHub handle huge diffs), syntax highlighting (peers colorize code; we render plain mono), touch/keyboard reach of controls, and tests. |
| cross-ds-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] accessibility — review controls are hover-only (`group-hover:opacity-100`, no `group-focus-within`, no touch), so keyboard-until-focus and touch users can't Accept/Reject → reveal on `group-focus-within` too and make them always-visible (or focusable-visible) on coarse pointers.
- [P1] testing — zero test file for a component full of pure transform logic → add unit tests for `collapse`/`fieldChanges`/`flatten`/`buildRows` + RTL for mode switching + a vitest-axe pass.
- [P1] accessibility — added/removed rows differ by color + glyph only in inline/split → add SR-only "Added"/"Removed" prefixes (as fields mode already does) so the diff is not color-only (WCAG 1.4.1).
- [P2] perceived-performance — no virtualization; large diffs render every changed row → add a windowing slot or row cap for big inputs.
- [P2] visual-integrity/system-cohesion — `rounded-xs` + `min-w-[3.5ch]` + `mt-[2px]` are off-system → move mark radius to a role token; the `3.5ch` gutter is defensible but pull to a named constant.
- [P2] motion — `height:auto` animation reflows → grid-rows `1fr`/`0fr` or transform-based reveal.
- [P2] docs-dx — `BorderExperiment` dev story ships to Storybook → drop or gate it; add an axe play test.

## What it does well
- Genuinely strong composability: batteries-included `<Diff>` and a full compound API (`Root/Summary/Body/ColumnLabels` + `useDiff()`) from one source of truth.
- `fields` (structured JSON) mode and first-class per-hunk accept/reject are real differentiators over stock code-diff viewers — built for a review loop, not just viewing.
- Craft details: `select-none` gutters/signs (clean copy-paste), tabular-nums, word-level intra-line highlight, empty-line height preservation.
- Empty and error states are deliberately designed — exactly where most DS components are lazy.
- Clean token discipline: no accent hard-coding, semantic success/error, `rounded-surface` role token, single edge treatment (no edge-soup).

## Cross-DS adoption ideas
- Monaco / GitHub colorize code — add an optional `renderLine`/`highlight` slot so consumers can drop in Shiki/Prism tokenization; we currently render plain mono.
- react-diff-view / react-window — a virtualization option for large diffs (we render every changed row).
- GitHub — sticky hunk headers (the `@@ … @@` section context) and line-anchor/linking + range selection; we have hunk-level accept/reject but no line-level affordances.
- jsdiff `diffChars` — a character-level granularity option alongside `line`/`word`.
- Add "expand all / collapse all" and reveal review controls on `focus-within` + coarse-pointer (touch), matching accessible-toolbar patterns.

## Rebuild note
Polish, not rebuild. The architecture (headless engine + owned presentation, compound context API) and the API surface are sound and market-competitive. The gaps are additive fixes on a good base: (1) make review controls reachable by keyboard/touch (`group-focus-within` + coarse-pointer visibility), (2) add SR-only added/removed labels, (3) write the missing test suite for the pure transform functions, (4) swap the `height:auto` reveal for a non-reflowing technique, (5) optional virtualization + syntax-highlight slots to close the market gap vs Monaco/GitHub. No structural change to the model or API is warranted.
