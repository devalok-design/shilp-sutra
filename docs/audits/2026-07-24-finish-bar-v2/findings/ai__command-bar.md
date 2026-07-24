# ai/command-bar — finish-bar audit
Finish: 3/5   Market: LAGS (cmdk / Base UI Combobox)   Rebuild: polish
(prior 2026-07-01: 2/5 — improved: combobox ARIA now solid, reduced-motion wired)

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `p-[1.5px]` + `h-[20px]`×2 magic numbers; **dead class `border-card-strong`** (no such utility/token) → hint/kbd/hero borders render no color; radius roles ✓ |
| accessibility | ✓ | combobox pattern complete (aria-expanded/controls/activedescendant/autocomplete); Esc/recall handled. Gap: clear button `p-ds-01` hit area <44px |
| api-composability | ✓ | controlled+uncontrolled open; `groups` optional; children slot; typed. `onSubmit` Omit'd to dodge native — acceptable |
| docs-dx | gap | verify doc lists all 3 variants + state prop |
| testing | gap | spinner testid present; needs per-variant + keyboard-nav coverage |
| motion-emil | ✗ | **command items re-animate (fade+slide+spring, staggered) on every keystroke** — filtered list remounts per char = jank + violates "don't animate frequently-seen". Several `initial` missing `opacity:0` (slide-without-fade) |
| state-coverage | ✓ | idle/typing/processing/responded + empty + disabled all handled |
| content-resilience | gap | long lists scroll (maxHeight) but no virtualization; no truncation on long item labels |
| theming-resilience | gap | GradientBorderWrap hardcodes `#D33163/#9B5DE5/#C850C0` — won't follow brand swap |
| system-cohesion | ✓ | reuses Dialog, Icon, springs/tweens, motion-provider |
| craft | ✓ | rotating placeholder, focus ring, kbd hints, Cmd+Enter, last-query recall |
| perceived-perf | gap | substring-only filter (no scoring); fine at small N |
| market-benchmark | LAGS | cmdk/Base UI have fuzzy scoring + virtualization; we have neither |
| adoption-ideas | — | see below |

## Top gaps (prioritized)
- [P1] motion-emil — stop re-animating items per keystroke: animate the list container once, not each item on every filter. Add `opacity:0` to slide-in initials.
- [P1] visual — `border-card-strong` is a dead class (DS-wide, see backlog); fix to `border-card` or add the missing `--color-card-strong`/utility.
- [P1] visual — tokenize `p-[1.5px]` (gradient border) + `h-[20px]` kbd.
- [P2] a11y — give the clear button a 44px `touch-target`.
- [P2] theming — drive the processing gradient from `--color-accent-9`/brand tokens, not raw hex.

## What it does well
Complete combobox a11y, reduced-motion paths throughout, three coherent variants sharing one input row, Cmd+Enter + last-query recall, focus-ring on the container.

## Cross-DS adoption ideas
- **cmdk / Fuse**: fuzzy match + score-ranked results (we do substring `includes` only).
- **Base UI Combobox / react-virtual**: virtualized listbox + async loading state for large/streamed command sets.
- **Linear**: inline result grouping with sticky group headers on scroll.

## Rebuild note
Polish, not structural. The architecture (variants, combobox, Dialog reuse) is sound; the drag is the per-keystroke animation, the dead border class, magic numbers, and the missing fuzzy/virtualization vs market leaders.
