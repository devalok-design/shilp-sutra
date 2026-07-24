# ai/devadoot-icon — finish-bar audit
Finish: 4/5   Market: LEADS (distinctive brand-identity motion)   Rebuild: polish
(prior 2026-07-01: 3/5)

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | intentional brand chakra; gradient-as-identity (Gemini-inspired). Hardcoded brand hex is defensible for THE mascot |
| accessibility | ✓ | `aria-hidden` (decorative); reduced-motion → static fill. Caveat: if used as the SOLE processing signal, pair with a live-region text (Conversation already does) |
| api-composability | ✓ | tiny surface (state/size/className), memoized |
| docs-dx | gap | verify doc shows the 4 states + reduced-motion behavior |
| testing | gap | needs per-state render + reduced-motion fallback coverage |
| motion-emil | ✓ | rich but justified — an identity/rare element is where delight belongs (Emil). Sweep 4s/12s, shimmer, responded pop (spring 500/15), error shake. reduced-motion fully handled |
| state-coverage | ✓ | idle/processing/responded/error all distinct |
| content-resilience | ✓ | fixed-size SVG, size prop |
| theming-resilience | gap | raw hex won't follow a consumer brand-accent swap; a themed deploy gets Devalok pink regardless |
| system-cohesion | gap | defines its own hex palette + springs inline rather than referencing brand tokens / `springs.bouncy` |
| craft | ✓ | layered gradient + shimmer + rotation; `useMotionValue`/`useTransform` for the sweep |
| perceived-perf | gap | several concurrent infinite animations (gradient rotate + 3 stop-color cycles + shimmer); SVG fill isn't GPU-composited — measure on low-end |
| market-benchmark | LEADS | more distinctive than Gemini/Claude generic thinking dots |
| adoption-ideas | — | see below |
| DEAD CODE | — | responded branch animates `fill:[url,url]` (same→same) — a no-op; remove |

## Top gaps (prioritized)
- [P2] dead-code — remove the no-op `fill:[url,url]` animate on the responded path.
- [P2] theming — expose an opt-in to drive stops from `--color-accent-9` so branded deploys can re-tint (keep Devalok default).
- [P3] perf — profile the stacked infinite animations on low-end; consider pausing idle breathing when off-screen (IntersectionObserver).

## What it does well
A genuinely distinctive brand-identity motion (color IS the animation), fully reduced-motion-safe, decorative-correct a11y, four legible states.

## Cross-DS adoption ideas
- **Gemini/Claude**: none to import — we lead here; instead, consider *exporting* this as the pattern other brand marks follow.
- Off-screen animation pause (perf) — common in Linear/Framer marketing marks.

## Rebuild note
Polish only. It's a strength of the DS; just remove the dead animate, add optional theming, and profile perf.
