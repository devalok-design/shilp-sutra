# composed/error-boundary — finish-bar audit
Finish: 2/5   Market: LAGS(react-error-boundary)   Rebuild: polish

Scope: `packages/core/src/composed/error-boundary.tsx` exports `ErrorDisplay` (rendered UI, `forwardRef`) + `ErrorBoundary` (class fallback wrapper). Co-located: `error-boundary.stories.tsx`, `__tests__/error-boundary.test.tsx` (15 unit + 2 boundary), `__tests__/error-display.test.tsx` (6 axe), doc `docs/components/composed/error-boundary.md`. Prior baseline: 3/5 (2026-07-01).

Source is broadly clean on loud AI tells and its bones are sound — but the axis that matters most for an *error* component (live-region announcement) is still absent, and a dead utility class + a raw-message leak have crept in since the baseline. Capped at 2/5 by the a11y P0.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No loud slop (no rail/gradient/emoji/glass; single edge per element; tokenized). But `border-card-strong` is a **dead class** (no `--color-card-strong` token, no `@utility` — only `border-card` exists) so the dev stack-trace box border falls back to `currentColor`; `min-h-[60vh]` magic value; 404/default use brand `accent-2` chip while 403/500 use `warning-3`/`error-3` (mixed semantic + mixed scale steps); `rounded-bubble` (a chat-bubble radius) on a generic icon chip. |
| accessibility | ✗ | **P0:** no `role="alert"`/`aria-live` anywhere — `ErrorBoundary.render` swaps children→`ErrorDisplay` in place with zero SR announcement. The 6 axe tests pass because axe cannot detect a *missing* live region → false clean. No focus move to the recovery button on swap. Contrast (step-11 on step-2/3) is AA-fine. |
| api-composability | gap | `forwardRef`+`displayName`, `error: unknown` (widest), `fallback` render-prop, div-spread all ✓. But recovery action is a hardcoded single "Try Again" — no `actions` slot / secondary action / label override; `getErrorConfig` is a closed 4-code switch (no 401/429/503); **`ErrorBoundary` has no `componentDidCatch`** → no `onError`/logging hook (can't wire Sentry); no `resetKeys`. Re-rolls Card's surface. |
| docs-dx | gap | Doc lists only `ErrorDisplay` `error`+`onReset`; omits the exported `ErrorBoundary` API (`children`/`onReset`/`fallback`) and the ref/div-spread surface. Storybook title `Patterns/ErrorBoundary` but every story exercises only `ErrorDisplay` — the boundary path is tested, never *shown*. |
| testing | ✓ | 15 unit (status mapping, message extraction, dev/prod stack gating, reset callback, ref forward) + 6 axe + 2 boundary catch/pass-through. Solid. Gap: nothing asserts the live region (because there isn't one) or an error-logging hook (because there isn't one). |
| motion | gap | Entirely static; `ErrorBoundary` hard-cuts to the fallback. Defensible for an error page (a calm cut is arguably right), but below the StatCard finish bar. No reduced-motion violation (no motion to guard). |
| state-coverage | ✓ | 404/403/500/default, dev/prod stack, with/without reset all deliberately designed. Minor: no pending/retrying state on "Try Again" if `onReset` is async. |
| content-resilience | ✓ | `max-w-lg` + centered wrap, `overflow-auto` on the stack box, symmetric `p-ds-*` (RTL-safe). Long messages wrap cleanly. |
| theming-resilience | gap | Semantic tokens survive an accent-9 swap. But the dev stack box is `bg-surface-raised` nested inside a `bg-surface-raised` card → no elevation distinction in either theme, and its only intended separator is the dead `border-card-strong` → the box visually blends into the card. |
| system-cohesion | gap | Re-rolls Card's surface (`bg-surface-raised`+`shadow-raised`+`rounded-overlay-lg`+`p-ds-07`) instead of composing `<Card>` — the exact StatCard drift; picks a different radius family (`rounded-overlay-lg` vs Card's `rounded-surface`) and `rounded-bubble` for the chip. Button `soft` now matches DS preference (fixed from baseline's `outline`). |
| craft | gap | Stale copy-paste comment `{/* Error IconInfoCircle */}` (no such icon); `export { ErrorBoundary,ErrorDisplay }` missing space; **raw `error.message` is shown to production users** (`message \|\| errorConfig.message`, line 141) — a 500 whose `.message` is `ECONNREFUSED 10.0.0.5:5432` leaks internals past the friendly copy. |
| perceived-performance | ✓ | Synchronous render on catch, no async, no CLS; the `min-h` reserves height so the swap doesn't jump. |
| market-benchmark | LAGS | vs react-error-boundary: our *display* leads (status-aware icon/title/message + dev stack; RErrBoundary ships no UI). Our *boundary contract* lags — no `onError(error, info)`, no `resetKeys` auto-reset, no `resetErrorBoundary`/hook. Net LAGS on the mechanics. |
| cross-DS-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- **[P0] accessibility** — no live region on a component whose entire job is to appear on failure → add `role="alert"` (assertive) to the message region, or `role="status"`/`aria-live="polite"` for non-critical inline boundaries; move focus to the recovery button on `ErrorBoundary` swap.
- **[P1] visual-integrity / theming** — `border-card-strong` is a dead class (renders as `currentColor`) → replace with `border-card` (the defined utility) or `border-surface-border`; also collapses the nested same-surface blend on the stack box.
- **[P1] craft (security)** — raw `error.message` reaches production users → gate the raw message behind `isDev`, or show `errorConfig.message` in prod and the real message only in the dev stack block.
- **[P1] api-composability** — `ErrorBoundary` has no `componentDidCatch` → add `onError?(error, info)` so consumers can report to Sentry/logging; add an `actions?: ReactNode` slot (default "Try Again" only when absent).
- **[P2] api / market** — no `resetKeys` → auto-reset when a dependency array changes (react-error-boundary parity).
- **[P2] visual-integrity** — drop `min-h-[60vh]` magic value (gate behind a `fullPage` prop) and normalize 404/default to a neutral/info chip at the same scale step as 403/500.
- **[P2] docs-dx** — document the `ErrorBoundary` API + ref/div-spread; add a story that mounts `<ErrorBoundary>` with a throwing child; align the Storybook title.
- **[P3] craft** — delete the stale `{/* Error IconInfoCircle */}` comment and fix the `export {` spacing.

## What it does well
- Genuinely clean on loud tells: no accent rail, no gradient text, no emoji, no glass/blob, single edge treatment per element, colors/spacing tokenized.
- `error: unknown` is the correct widest input; typed narrowing helpers (`getStatusFromError`/`getMessageFromError`/`getStackFromError`) handle Error / `{status}` / `{data:{message}}` / string shapes.
- `forwardRef` + `displayName`, div-spread, and a `fallback` render-prop on the boundary.
- Dev-only stack trace, correctly gated on `NODE_ENV`.
- Strong test coverage (15 unit + 6 axe + 2 boundary), and Button is now `soft` (baseline finding fixed).

## Cross-DS adoption ideas
- **react-error-boundary** exposes `onError(error, info)`, `resetKeys` (auto-reset when deps change), and passes `resetErrorBoundary` into the fallback — import all three; our boundary has none.
- **Sentry ErrorBoundary** surfaces an event/feedback id and a "report feedback" affordance — an optional `eventId`/support-code slot would give users something to quote to support.
- **Next.js `error.tsx`** normalizes on a `reset()` prop (we already have `onReset`) — keep that vocabulary and add the missing `actions` slot for a secondary "Go home" the copy already promises.

## Rebuild note
**Polish (heavy), not rebuild.** The structure is sound; the 2/5 is driven by a single-line a11y P0 (missing `role="alert"`) plus a small cluster of fixable defects: the dead `border-card-strong`, the raw-message prod leak, the missing `componentDidCatch`/`onError` and `actions` slot, and composing `<Card>` for the shell to kill the surface drift. No API teardown is required — every fix is additive (new props as optional) or a class swap, so it stays non-breaking. Ship the `role="alert"`, dead-class, and prod-leak fixes first (correctness/security), then the composability additions.
