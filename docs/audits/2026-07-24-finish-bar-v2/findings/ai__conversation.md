# ai/conversation — finish-bar audit
Finish: 3/5   Market: PARITY (leads scroll-craft, lags message actions)   Rebuild: polish
(prior 2026-07-01: 3/5)

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `h-4 w-4` hardcoded icon box in AgentHeader (IconProvider already sizes — redundant drift, same tell as old segmented) |
| accessibility | gap | `aria-live="polite"` on the WHOLE scroll container over-announces (re-reads on any change); should scope to new assistant turn. `role="button"` redundant on `motion.button`. No per-message landmark (`article`/`log`) |
| api-composability | ✓ | prop > context > default resolution for agent/onAction/customBlocks; typed; forwardRef+displayName |
| docs-dx | gap | verify doc covers processingSteps + customBlocks + autoScroll |
| testing | gap | needs autoscroll/IntersectionObserver + processing-state coverage |
| motion-emil | gap | UserMessage/ScrollPill `initial={{ y: 8 }}` with no `opacity:0` → slides without fading (nothing-from-nothing avoided but half-done). Breathing dots easeInOut ✓ |
| state-coverage | gap | processing (steps + breathing) ✓; **no empty-conversation state**; error only via blocks |
| content-resilience | ✓ | autoScroll + IntersectionObserver "stick to bottom unless scrolled up" + new-content pill = robust; maxHeight scroll |
| theming-resilience | ✓ | semantic tokens throughout |
| system-cohesion | ✓ | reuses Icon, springs, motion-provider, BlockRenderer |
| craft | ✓ | the scroll-anchoring + pill is genuinely well done — better than many chat UIs |
| perceived-perf | gap | no token-streaming animation; assistant turn appears whole |
| market-benchmark | PARITY | leads on scroll UX; lags Vercel AI SDK / assistant-ui on message actions, markdown, avatars, timestamps |
| adoption-ideas | — | see below |

## Top gaps (prioritized)
- [P1] a11y — scope `aria-live` to the latest assistant message (or use a visually-hidden live region), not the whole thread.
- [P1] state — add an empty-conversation state (agent intro / suggested prompts).
- [P2] motion — add `opacity:0` to the message/pill enter initials.
- [P2] visual — drop the `h-4 w-4` AgentHeader icon wrapper (IconProvider sizes).

## What it does well
Scroll anchoring (stick-to-bottom + IntersectionObserver + new-content pill), clean processing-step visualization, context-driven agent/block resolution, full reduced-motion paths.

## Cross-DS adoption ideas
- **Vercel AI SDK UI / assistant-ui**: per-message action row (copy / regenerate / edit / feedback) on hover.
- **ChatGPT/Claude**: token-by-token streaming text with a caret; timestamps + avatars.
- **assistant-ui**: branching/edit-and-resend of user turns.

## Rebuild note
Polish. The scroll engine is a strength to keep; gaps are a11y live-region scoping, an empty state, and market-standard message actions.
