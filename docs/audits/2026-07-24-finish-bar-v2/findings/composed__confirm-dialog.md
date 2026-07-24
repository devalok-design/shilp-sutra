# composed/confirm-dialog — finish-bar audit
Finish: 3/5   Market: PARITY (Radix / shadcn AlertDialog)   Rebuild: polish

ConfirmDialog is a thin, opinionated convenience wrapper over the `AlertDialog`
primitive (title/description/confirm/cancel as flat props). Since the 2026-07-01
baseline (3/5) the two P1s were fixed **in source**: Cancel is now `variant="soft"`
(was `outline`) and the confirm button now uses Button's own `loading` prop —
so it inherits the DS spinner + `aria-busy` instead of the old hardcoded
"Processing…" text swap. The wrapper composes the base primitive cleanly (the
StatCard lesson) and carries zero visual slop. What holds it at 3/5 is now a
**stale doc that actively misrepresents the API**, plus the same
composability/type-surface gaps the baseline flagged (string-only props, no slots,
no uncontrolled mode, prop type declared as `'div'` but spread onto
`AlertDialogContent`).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | No slop tells. All surface/radius/shadow inherited from `AlertDialogContent`: `bg-surface-overlay`, `rounded-overlay-lg` (role token), `shadow-overlay` (single edge). Wrapper adds no classes. No border-card-strong, no rounded-ds/full, no magic numbers in the wrapper. |
| accessibility | gap | `role=alertdialog` + focus trap + Escape from Radix root; confirm `aria-busy` via Button loading. But uses plain `<Button>` not `<AlertDialogAction>`/`<AlertDialogCancel>`, so it drops Radix's semantic action/cancel wiring (Cancel-focus-by-default is only coincidental via DOM order). No axe test, no focus-order assertion — destructive confirm relies on Cancel being first in DOM. |
| api-composability | gap | Canonical `soft`/`solid` variants ✓, forwardRef+displayName ✓, composes base ✓. But string-only `title`/`description` (no `ReactNode`), no `children`/`footer`/extra-action slot, forced-controlled (`open`+`onOpenChange` required, base's `defaultOpen` hidden), and `responsive` prop unreachable through the wrapper type. |
| docs-dx | ✗ | Doc is WRONG vs source: lists `color: "default" \| "error"` (source: `'accent' \| 'error'` — `"default"` is a TS error), default `color="default"` (source: `accent`), and claims loading "replaces confirm button text with 'Processing...'" (retired — now a spinner). A consumer following the doc writes invalid code. |
| testing | gap | Good RTL coverage (labels, confirm, cancel, loading→`aria-busy`, closed). Missing: `vitest-axe`, `describeConformance`, focus assertion. |
| motion | ✓ | Inherited: `springs.smooth` scale+fade entrance, `tweens.fade` overlay, mobile off-screen sheet slide-up, transform/opacity only, AnimatePresence exit + interruptible spring. `smooth` is a hair underdamped (damping 30 vs crit ~31) — a settle, not a bounce; fine for a dialog. Caveat: reduced-motion relies on consumer `MotionConfig` (base doesn't call `withReducedMotion`) — systemic to overlays, not this component. |
| state-coverage | ✓ | default/hover/active/focus/disabled/loading all handled via Button; destructive via `color="error"`; deliberate stays-open-after-confirm for async-error handling. Empty/error states N/A for a confirm modal. |
| content-resilience | gap | `title`/`description` are `string` only — can't render a list of affected items, a warning callout, or a "don't ask again" checkbox without forking. Footer text wraps fine; footer uses physical `sm:space-x-ds-03` (space-x flips under `dir` so RTL is OK). |
| theming-resilience | ✓ | Accent-9 swap flows through solid Button; `error` color works; role radius survives `[data-shape]`; dark overlay uses `bg-surface-overlay`+`shadow-overlay` (no sunken-track inversion risk). |
| system-cohesion | ✓ | Uses DS Button, AlertDialog, shared springs, role tokens, shared focus ring. Feels like one system. |
| craft | ✓ | Cancel-first DOM order (avoids accidental-Enter destruction), deliberate stays-open-on-confirm, soft Cancel for warmth. Minor debit: bypassing `AlertDialogAction/Cancel` forfeits their built-in wiring. |
| perceived-performance | ✓ | Instant open via AnimatePresence, immediate Button loading feedback, no layout shift. |
| market-benchmark | gap | vs Radix/shadcn AlertDialog: our wrapper ADDS a mobile responsive sheet + one-line convenience API (a lead over raw shadcn compose-it-yourself), but LAGS on flexibility (Radix gives full slot composition; we give flat strings). Net PARITY. |
| cross-ds | ✓ | Concrete borrow ideas below. |

## Top gaps (prioritized)
- [P0] docs-dx — doc lists invalid `color="default"` enum + a default that doesn't exist + a retired loading behavior → **doc rot vs source**. Regenerate the doc from current CVA/source (correct enum to `accent | error`, default `accent`, loading = spinner via Button). This is the one thing actively breaking consumers.
- [P1] accessibility/craft — route confirm/cancel through `AlertDialogAction`/`AlertDialogCancel` (still styled as DS Buttons via `asChild`) so Escape→cancel and default-focus semantics are guaranteed, not incidental. Add a `vitest-axe` test + a focus-lands-on-Cancel assertion (critical for destructive).
- [P1] api-composability — allow `description?: React.ReactNode` and an optional `children`/`footer` slot for rich content + a third action. Keep string props as the convenience path.
- [P2] api-composability — fix the prop type: extend `Omit<AlertDialogContentProps, 'children' | 'color'>` instead of `'div'`. Corrects the `ref` element type and exposes `responsive` for free.
- [P2] api-composability — decide controlled-vs-uncontrolled: pass through `defaultOpen` OR document controlled-only as deliberate.
- [P2] verbal — em-dash stylistic connector in the JSDoc (line 33) — minor prose tic.

## What it does well
- Composes the base primitive instead of re-rolling overlay/surface/motion — the StatCard lesson, done right. Zero visual slop.
- Already absorbed both baseline P1s in source: `soft` Cancel + Button `loading` (spinner + `aria-busy`), so it inherits the system's intentional loading feedback rather than a hardcoded string.
- Deliberate, well-reasoned defaults: stays-open-after-confirm (handles async errors / chained confirms), Cancel-first order, `accent|error` semantic color narrowing.
- Mobile responsive full-screen sheet inherited from `AlertDialogContent` — a nicety plain shadcn AlertDialog doesn't ship.

## Cross-DS adoption ideas
- **Radix/shadcn** expose `AlertDialogAction`/`AlertDialogCancel` for wired action semantics — we should render our styled Buttons via those (`asChild`) to reclaim guaranteed Escape/cancel + default-focus behavior we currently only get by accident.
- **Radix/Base UI** are slot-composed end-to-end — adopt an optional `children`/`footer` slot so consumers can add a checkbox, callout, or third action without forking (we'd keep the flat-prop convenience layer on top).
- **Sonner/Vaul** confirm flows treat the async confirm as first-class (promise-aware button that resolves/rejects) — our `onConfirm: () => void | Promise<void>` is close; consider auto-managing `loading` from the returned promise so consumers don't hand-wire `useState`.

## Rebuild note
**Polish, not rebuild.** Structure is sound — the wrapper composes the primitive correctly and the visuals/motion are inherited and clean. Scope: (1) regenerate the stale doc from source [P0]; (2) route through `AlertDialogAction`/`AlertDialogCancel` + add axe/focus tests [P1]; (3) accept `ReactNode`/slot for `description`+footer [P1]; (4) correct the prop type to `AlertDialogContentProps` and expose `responsive`/`defaultOpen` [P2]. No structural change; all in-place.
