# composed/error-boundary — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:3

Scope: `packages/core/src/composed/error-boundary.tsx` exports `ErrorDisplay` (the rendered UI) + `ErrorBoundary` (class component fallback wrapper). Co-located: `error-boundary.stories.tsx`, `__tests__/error-boundary.test.tsx`, `__tests__/error-display.test.tsx`, doc `docs/components/composed/error-boundary.md`.

The component is broadly clean on the loud AI visual tells — no accent rail, no gradient text, no emoji, no framework-palette purple, tokenized colors/spacing/radius throughout. Its gaps are the *finish* ones the Card bar targets: it re-rolls a card surface instead of composing `<Card>`, it has zero composability for its action/copy, and it misses the one a11y state that matters most for an error component (live-region announcement).

## Findings

### [P1][F5] ErrorDisplay re-rolls a Card surface instead of composing `<Card>`
- **Category:** composability
- **Evidence:** error-boundary.tsx:113–115 — `<div className="flex w-full max-w-lg flex-col items-center gap-ds-06 rounded-overlay-lg bg-surface-raised p-ds-07 text-center shadow-raised">`
- **Why:** This is exactly the drift StatCard fixed — hand-rolling `bg-surface-raised` + `shadow-raised` + radius + padding duplicates Card's surface vocabulary. If Card's elevation/edge model changes, this panel silently drifts. It even picks a *different* radius (`rounded-overlay-lg` 16px) and its own `p-ds-07`, so it already reads as a different surface family than Card (`rounded-surface`, gap model).
- **Fix:** Compose `<Card variant="default">` (or `elevated`) for the panel shell; keep only the error-specific layout (icon chip, title/message stack, actions) as children via `CardContent`. Drops the hand-rolled surface classes and inherits the gap model.

### [P1][F1] "Try Again" button is hardcoded — no slot / no action customization
- **Category:** composability
- **Evidence:** error-boundary.tsx:146–156 — `{onReset && (<div ...><Button variant="outline" size="md" onClick={onReset}>Try Again</Button></div>)}`
- **Why:** The single action is a bespoke, fixed-label, fixed-count button. A consumer who wants "Reload", a "Go home" secondary, or a link cannot do it without replacing the whole component. Title/message are already string props (fine), but the action region is where a slot belongs (`actions?: React.ReactNode`, Card-style), not a baked button.
- **Fix:** Add an `actions?: React.ReactNode` slot (rendered when present); keep `onReset` as the convenience path that renders the default "Try Again" button when no `actions` given. Optionally expose `resetLabel`.

### [P1][H/a11y] No live region — a dynamically-surfaced error is not announced
- **Category:** a11y / state-coverage
- **Evidence:** error-boundary.tsx:112–143 — outer/inner wrappers are plain `<div>`s; the heading is `<h2>` and the message a `<p>`, but there is no `role="alert"` / `aria-live` and no `role="status"` anywhere. `ErrorBoundary.render` swaps children → `ErrorDisplay` at runtime (line 209) with no announcement.
- **Why:** The whole point of this component is to appear when something fails. When it replaces content in place (the ErrorBoundary path), a screen reader user gets no notification that the region changed to an error. axe passes (error-display.test.tsx) because axe can't detect a missing live region — a false "clean".
- **Fix:** Put `role="alert"` (assertive) on the message container, or `role="status"`/`aria-live="polite"` on the panel. For 404/403 full-page use `role="alert"` is acceptable; gate on whether it's an inline boundary vs a route page if you want to be precise.

### [P2][G2] Magic viewport value `min-h-[60vh]` shipped as the default height
- **Category:** drift
- **Evidence:** error-boundary.tsx:112 — `cn("flex min-h-[60vh] items-center justify-center p-ds-05", className)`
- **Why:** `60vh` is an un-tokenized arbitrary value baked into the default. It also forces a large min-height on *every* usage, including inline boundaries that should hug their content — the consumer must fight it via `className` override.
- **Fix:** Drop the forced `min-h-[60vh]` from the default (let layout be the consumer's job), or expose it behind a `fullPage`/`centered` prop. If a centered full-page default is wanted, keep it gated, not unconditional.

### [P2][structural-tell] Stale copy-paste comment `{/* Error IconInfoCircle */}`
- **Category:** structural-tell / verbal-tell
- **Evidence:** error-boundary.tsx:130 — `{/* Error IconInfoCircle */}` labels the title/message text block (no IconInfoCircle anywhere in the file)
- **Why:** A leftover, incorrect comment — the kind of artifact that reads as un-reviewed generated code. Comments `{/* Error Icon */}` / `{/* Actions */}` / `{/* Dev stack trace */}` are also low-value section labels on obvious JSX.
- **Fix:** Delete the wrong comment; drop the obvious section-label comments or keep only ones that carry non-obvious intent.

### [P2][G3] Generic + 404 errors default to an *accent* (brand) tint chip
- **Category:** vocabulary / drift
- **Evidence:** error-boundary.tsx:64–66 (404 → `bgClass: 'bg-accent-2', iconClass: 'text-accent-11'`) and 87–94 (default → `bg-accent-2` / `text-accent-11`)
- **Why:** A failure state painted in the brand accent is a semantic mismatch — "something went wrong" reads as neutral/informational, not on-brand-highlight. It also makes the color language inconsistent: 403 uses `warning-3`, 500 uses `error-3` (step 3), but 404/default use `accent-2` (step 2) — mixed scale steps across the same config table.
- **Fix:** Use a neutral surface for generic/404 (`bg-surface-sunken`/neutral chip, `text-surface-fg-muted`) or `bg-info-3`/`text-info-11` if you want a semantic-info read. Normalize all chips to the same scale step (all `-3`).

### [P2][M4] Panel appears with no entrance/transition; no reduced-motion consideration
- **Category:** motion
- **Evidence:** error-boundary.tsx:111–170 — entirely static markup; unlike StatCard/overlays there is no entrance on the panel and no `transition` on the icon chip.
- **Why:** When ErrorBoundary swaps in the fallback it hard-cuts. The finish bar (StatCard) gives its content an intentional fade/slide. This is minor for an error page (a hard cut is arguably calmer), so it's a polish gap not a tell — but it's below the bar. Note there is *no* reduced-motion concern precisely because there's no motion, so M3 is not violated; if motion is added it must be guarded.
- **Fix:** Optional subtle `opacity/y` entrance on the panel via the motion lib (reduced-motion-safe), or explicitly document "no entrance by design." Not required.

### [P3][G5] Button uses `variant="outline"` where CLAUDE.md prefers `soft`
- **Category:** vocabulary
- **Evidence:** error-boundary.tsx:149 — `<Button variant="outline" ...>`
- **Why:** Default preference is `soft` for non-primary actions. However this button is the *primary* (and only) action, and it sits on a `bg-surface-raised` panel — one of the documented exceptions where outline is acceptable. So this is defensible, flagged only for the record.
- **Fix:** Reasonable as-is. If reconsidered, the primary recovery action could be a solid/`accent` Button to give it real affordance, with outline/soft reserved for a secondary.

### [P3][J] Naming/entry-point confusion: file+story say "ErrorBoundary", shipped display is `ErrorDisplay`
- **Category:** docs
- **Evidence:** stories.tsx:5 `title: 'Patterns/ErrorBoundary'` but `component: ErrorDisplay`; doc error-boundary.md:1 titled `# ErrorDisplay` while import path is `.../error-boundary`; doc lines 20 & 29 explicitly call this out as a gotcha.
- **Why:** The mismatch is documented as intentional, so it's a known choice not a defect — but it's still a papercut (Storybook title advertises a boundary; the story only exercises the display). Low severity.
- **Fix:** Either rename the file to `error-display.tsx` with a re-export shim, or make the Storybook title `Patterns/ErrorDisplay`. At minimum add one story that mounts `<ErrorBoundary>` with a throwing child so the boundary path is demonstrated (currently only tested, never shown).

### [P3][docs] Doc prop table omits the spread `...props` / `className` / `ref` surface and the `ErrorBoundary` API entirely
- **Category:** docs
- **Evidence:** error-boundary.md:7–12 lists only `error` + `onReset`; `ErrorDisplay` extends `React.ComponentPropsWithoutRef<'div'>` (tsx:12) and forwards ref (tsx:98), and `ErrorBoundary` (`children`, `onReset`, `fallback`) is exported but undocumented.
- **Why:** Consumers can't discover `fallback`, `onReset` on the boundary, or that `ErrorDisplay` accepts native div props + ref.
- **Fix:** Add an `ErrorBoundary` section (children/onReset/fallback) and note ErrorDisplay forwards ref + spreads div attrs.

## Composability gaps
- **Re-rolls Card's surface (F5):** hand-built `bg-surface-raised + shadow-raised + rounded-overlay-lg + p-ds-07` instead of `<Card>`. Different radius/padding family = visible drift from the Card bar.
- **No action slot (F1):** the recovery action is a hardcoded single `Button` with fixed label "Try Again". No `actions` slot, no secondary action, no label override.
- **No fallback slot on the display level:** `ErrorBoundary` has a `fallback` render-prop (good), but `ErrorDisplay` itself has no slots for custom title/message *nodes* (only string coercion via error) — fine for now, but the action gap is the real one.
- **Icon/message are config-locked to 4 status codes:** `getErrorConfig` is a private switch; a consumer can't register a 401/429/503 mapping. Not required, but it's a closed extension point.

## Motion gaps
- **No entrance on the panel (M4-adjacent):** ErrorBoundary hard-swaps to the fallback with no transition; below the StatCard finish bar but defensible for an error page.
- **No feedback motion added by the component** — the only motion is whatever `<Button>` brings. Acceptable.
- **M3 not violated** (no animation ⇒ nothing to guard), but if any entrance is added it must be reduced-motion-safe via the motion lib, not a raw CSS animation. (Contrast: StatCard's sparkline uses a raw injected `@keyframes` — do not copy that pattern here.)

## Polish plan (ordered steps to reach the finish bar)
1. **Compose `<Card>`** for the panel shell (kills F5): replace the hand-rolled surface div with `<Card variant="elevated"><CardContent>…</CardContent></Card>`; delete `bg-surface-raised shadow-raised rounded-overlay-lg p-ds-07`.
2. **Add `role="alert"`** (or `role="status"` for non-critical) to the message region so ErrorBoundary swaps are announced (fixes the H/a11y gap axe can't catch).
3. **Add an `actions?: React.ReactNode` slot**; render the default "Try Again" button only when `actions` is absent and `onReset` is set. Optionally `resetLabel`.
4. **Remove the forced `min-h-[60vh]`** default (or gate behind `fullPage`); it's an un-tokenized magic value that fights inline usage.
5. **Delete the stale `{/* Error IconInfoCircle */}` comment** and the low-value section comments.
6. **Normalize the color config:** neutral (or info) chip for generic/404 instead of brand accent; make all chips the same scale step.
7. **Docs + stories:** document the `ErrorBoundary` API + ref/div spread; add one story that mounts `ErrorBoundary` with a throwing child; align the Storybook title with the component name.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. The status color lives in the icon chip bg/fg, not a left/top stripe. Clean.
- **V2 double-edge:** outer panel is shadow-only (no border); the dev stack-trace box is border-only (no shadow). No element carries both. Clean.
- **V3 gradient text:** none — title/message/status are solid `text-surface-fg`/`-subtle`. Clean.
- **V4 framework palette:** no raw indigo/violet/slate; all colors are semantic tokens (`accent-*`, `warning-*`, `error-*`, `surface-*`). Clean.
- **V5 emoji:** none — real lucide/tabler icons via `<Icon>`. Clean.
- **V6 blob/glass/glow, V7 rounded-everything, V8 pill spam:** none. Single radius per element, all tokenized; no badges. Clean.
- **G2 tokens (mostly):** spacing/radius/color all `-ds`/semantic tokens except the one `min-h-[60vh]` flagged above; no bare `shadow`/`rounded`/`bg-gradient-to-*`/`w-[--var]`. Clean apart from that value.
- **I types:** `error: unknown` (correctly the widest input), typed narrowing helpers, `forwardRef` + `displayName` on ErrorDisplay, exported `ErrorDisplayProps`/`ErrorBoundaryProps`. No `any`, no `React.FC`, no stringly enums. Clean.
- **Verbal tells (E1–E8):** JSDoc + doc + copy are plain and direct — no em-dash tic beyond legitimate use, no AI vocabulary, no hedging, no chatbot artifacts. Clean.
- **Tests:** solid coverage — status mapping, message extraction, dev/prod stack gating, reset callback, ref forwarding, ErrorBoundary catch/pass-through, plus a dedicated axe suite. Good.
