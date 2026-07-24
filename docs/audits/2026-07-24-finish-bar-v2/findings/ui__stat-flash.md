# ui/stat-flash — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish

StatFlash is a small, deliberately-scoped decorative motion primitive: a chip that mounts showing a
transient *state* glyph (toned up-arrow/check/alert) then settles into the metric's stable *identity*
icon. It is `aria-hidden` (decorative — metric text carries meaning), honors `prefers-reduced-motion`,
uses only semantic tone tokens and the `rounded-control` role token, and animates opacity/scale only.
No AI/slop tells, no radius-ds, no magic numbers, and none of the two systemic tells
(`border-card-strong`, `slide-no-fade`) are present. Real gaps are testing (below bar), a
composability passthrough hole, and a mount-only flash that never replays on data change — all polish,
no P0.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | `rounded-control` role token; semantic tone fills (`bg-*-9`/`text-*-fg`, `bg-accent-3`/`text-accent-11`); background fill only (no border+shadow → no edge-soup); no gradient/glow/glass/emoji; `p-ds-02` is a defined 4px token, on-cadence, not arbitrary. |
| accessibility | ✓ | Correct pattern for a decorative unit: `aria-hidden="true"`, documented as never the sole carrier of meaning. Non-interactive → no touch-target/keyboard needed. tone-fg tokens ship dark + `forced-colors` (HighlightText) overrides. Reduced-motion honored via `useReducedMotion()`. |
| api-composability | gap | Canonical icon type (`IconInput`), `value`-style choreography props, deprecated aliases N/A. But: NOT `forwardRef`; no `className` / `...rest` / `data-*` passthrough on the chip `<span>` — yet JSDoc advertises standalone use in "list rows, badges, toasts". Consumers can't attach a ref, add a class, or set an id. Chip surface recipe is also duplicated verbatim in StatCard's `accentStyle="icon"` branch (drift). |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas + Changes; matches source exactly (fill default soft, speed default normal, override precedence). MCP-manifest parity fine. |
| testing | ✗ | Exactly the named anti-pattern: tests only assert nodes "mount" + fill classes. No flash→settle sequence (fake-timer), no reduced-motion path, no `vitest-axe`, no `describeConformance`. The component's entire reason to exist (transient state glyph resolving to identity, gated by reduced-motion) has zero behavioral coverage. |
| motion | gap | Strong: reduced-motion guard, `initial={false}` avoids flash-of-animation, opacity/scale only (HW-accel), bounce-free springs (`snappy`/`gentle`, no overshoot), sub-300ms fades. Gaps: `fast` and `normal` share identical settle+fade (only `holdMs` differs, 450 vs 650); flash plays on MOUNT only — deps `[prefersReduced, hold]`, `setSettled` one-way — so a live metric flipping up→down on a mounted chip never replays (contradicts the documented "live" use case). Not interruptible on data change. |
| state-coverage | gap | Interactive states (hover/active/focus/disabled/loading/empty/error) are N/A — non-interactive decorative chip. The two applicable states (flash / settled) are handled, and all six tone presets covered. But the update/replay state (flash re-fire on `flash` prop change) is missing. |
| content-resilience | ✓ | Single-icon in/out into fixed regions; overlay is `absolute inset-0`, chip clips via `overflow-hidden`. No text → no truncation/i18n concern. Up/down arrows are semantic, not layout-directional (no RTL mirror needed). |
| theming-resilience | ✓ | Survives accent-9 swap (accent-N tokens); `rounded-control` honors `[data-shape]`; tone tokens carry dark + forced-colors overrides. No sunken track → no dark elevation-inversion risk. |
| system-cohesion | ✓ | Uses DS `springs`/`tweens`, `rounded-control`, `--spacing-ds-*`, `IconProvider`, `normalizeIcon`, `IconInput` — shares the system language. One drift: chip shell duplicated in StatCard instead of a shared `IconChip` (folded into api axis). |
| craft | ✓ | `overflow-hidden` clips the absolute overlay to the radius; AnimatePresence exit fade; `initial={false}` under reduced-motion; 0.55 settle-scale. The state→identity concept itself is a genuine craft idea. |
| perceived-performance | ✓ | Instant mount, transform/opacity only, fixed chip footprint + absolute overlay → zero CLS/jank. |
| market-benchmark | ✓/PARITY | No direct 1:1 peer; closest are Geist/Sonner/Linear metric-flash micro-motions. The state→identity concept mildly LEADS on idea; LAGS Geist/Radix on the primitive contract (they always `forwardRef` + spread `className`/`...props`). Net PARITY. |
| cross-ds-adoption | ✓ | See ideas below. |

## Top gaps (prioritized)
- [P1] api-composability — no `forwardRef` / `className` / `...rest` passthrough despite JSDoc promising standalone use → add ref forwarding + `className` merge (via `cn`) + spread remaining HTML attrs onto the chip `<span>`.
- [P1] testing — core flash→settle choreography + reduced-motion guard entirely untested → add fake-timer test (assert flash glyph present + `settled=false`, advance `holdMs`, assert flash exits and identity is sole glyph), a `useReducedMotion→true` test (no overlay), and `vitest-axe`.
- [P2] motion/state — flash is mount-only; changing `flash` on a mounted chip never replays → reset `settled` when `flash`/resolved tone changes (re-arm the timer), or document mount-only + recommend a `key` remount for live metrics.
- [P2] api/cohesion — chip surface recipe duplicated in StatCard `accentStyle="icon"` → extract a shared internal `IconChip` shell both render, killing the two-sources-of-truth drift.
- [P2] motion — `fast` vs `normal` differ only in `holdMs`; settle/fade byte-identical → give `fast` a snappier settle or document that `speed` tunes hold duration only.
- [P3] types — `holdMs` accepts negative/`NaN` → `Math.max(0, holdMs ?? preset.holdMs)`.

## What it does well
- Clean visual language: single `rounded-control` radius, background-fill tones (no edge-soup), zero slop tells.
- Reduced-motion handled properly with `initial={false}` — no flash-of-animation, renders settled identity directly.
- Motion built from shared DS tokens (`springs`/`tweens`), animates HW-accelerated properties only, bounce-free.
- Honest a11y posture: decorative `aria-hidden` with the boundary documented in the doc's Gotchas.
- `overflow-hidden` clip + absolute-inset overlay = crisp, CLS-free entrance.

## Cross-DS adoption ideas
- **Geist / Radix** primitives always `forwardRef` + spread `className`/`...props` — adopt that contract so StatFlash is a first-class standalone primitive (its own doc's promise).
- **Sonner / Linear** replay data-change animations on value updates (not just mount) — re-arm the flash on `flash` change for the live-metric case.
- **Geist number-flash / Tremor delta badges** pair the glyph with an optional animated delta value — a future `delta?` slot could extend StatFlash from icon-only to icon+number without breaking the current API.

## Rebuild note
Polish, not rebuild. The structure (state→identity choreography, tone map, speed presets, reduced-motion
gate) is sound and market-appropriate. In-place fixes: (1) `forwardRef` + `className`/`...rest`
passthrough; (2) real behavioral + axe tests; (3) re-arm flash on `flash` change or document mount-only;
(4) extract a shared `IconChip` shell with StatCard; (5) differentiate `fast`/`normal` or document; (6)
clamp `holdMs`. None touch the visual/motion identity — this is a quality-and-contract pass on an
already-good primitive.
