# ai/ai-command-provider — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: none
(prior 2026-07-01: 4/5)

## Scores
Non-visual React context provider — visual/motion/a11y axes N/A.

| Axis | Verdict | Note |
|---|---|---|
| api-composability | ✓ | clean typed context; `useMemo` value; stable `EMPTY_BLOCKS` ref avoids re-provides; nullable `useAICommand()` so consumers can no-op outside a provider |
| docs-dx | gap | verify doc shows the provider + `useAICommand` contract + prop>context precedence |
| testing | gap | needs a provide/consume + precedence test |
| system-cohesion | ✓ | the shared spine for Conversation + BlockRenderer |
| craft | gap | `customBlocks<any>` loses type-safety (same as block-renderer) |
| market-benchmark | PARITY | comparable to Vercel AI SDK provider context; minimal by design |
| adoption-ideas | — | see below |

## Top gaps (prioritized)
- [P3] typing — thread a generic through the block map to drop `any`.
- [P3] docs/tests — document + test the precedence contract (prop wins over context).

## What it does well
Minimal, correct, memoized context with a nullable hook and stable empty default — exactly what a provider should be.

## Cross-DS adoption ideas
- **Vercel AI SDK / assistant-ui**: put streaming status + an `AbortController` (stop generation) in the context so any descendant can cancel.
- Expose the resolved agent + a `useAIAgent()` selector hook.

## Rebuild note
None. Solid as-is; the only moves are typing polish + surfacing cancel/streaming state (feature, not fix).
