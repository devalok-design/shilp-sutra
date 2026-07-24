# ai/block-renderer — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish
(prior 2026-07-01: 3/5 — composability strong; small motion/robustness gaps)

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | FallbackBlock uses raw `mt-2` (not `mt-ds-02`) + `text-body-xs` — minor drift in the error-path UI |
| accessibility | ✓ | delegates semantics to block components; container is a neutral flex list |
| api-composability | ✓ | **strongest axis** — customBlocks (prop) merged over context, fallback for unknown types, typed `BlockComponentProps<any>` |
| docs-dx | gap | verify doc lists built-in block types + customBlocks contract |
| testing | gap | needs unknown-type fallback + custom-block override coverage |
| motion-emil | gap | `initial={{ y: 12 }}` no `opacity:0` (slide-without-fade); stagger index*50ms fine for one-shot |
| state-coverage | gap | **no error boundary** — a throwing custom block crashes the whole renderer (and the conversation) |
| content-resilience | ✓ | arbitrary block list; stable keys (`block.id ?? type-index`) |
| theming-resilience | ✓ | semantic tokens; fallback uses Alert |
| system-cohesion | ✓ | reuses Alert, springs, motion-provider |
| craft | gap | `any` in the block-type maps is pragmatic but loses per-block type-safety |
| perceived-perf | ✓ | lightweight; one-shot stagger |
| market-benchmark | PARITY | comparable to Vercel AI SDK generative-UI block dispatch |
| adoption-ideas | — | see below |

## Top gaps (prioritized)
- [P1] state — wrap each block in an error boundary so one bad block degrades to a fallback instead of crashing the thread.
- [P2] motion — add `opacity:0` to the enter initial.
- [P2] visual — `mt-2` → `mt-ds-02` in FallbackBlock.

## What it does well
Clean, extensible registry (built-in + custom + graceful unknown-type fallback), context/prop merge, stable keys, reduced-motion path.

## Cross-DS adoption ideas
- **Vercel AI SDK**: partial/streaming block rendering (render a block as its data streams in).
- **React error boundaries per block** (react-error-boundary) — isolate failures.
- Typed block registry via a discriminated union instead of `Record<string, ...<any>>`.

## Rebuild note
Polish. Architecture is a keeper; add an error boundary + tidy the fallback/motion.
