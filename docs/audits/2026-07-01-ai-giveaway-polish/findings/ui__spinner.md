# ui/spinner — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

## Findings

### [P1][G3] `variant` axis off the canonical taxonomy (`filled` / `bare`)
- **Category:** vocabulary
- **Evidence:** spinner.tsx:57 — `variant?: 'filled' | 'bare'`; spinner.tsx:12-16 uses `filled`/`bare` throughout
- **Why:** Canonical `variant` axis is `solid/soft/outline/ghost/link` (rubric G3); `filled` is exactly the flagged off-taxonomy synonym for `solid`, and `bare` is a one-off name not shared with any sibling (Button's embedded-spinner context, IconButton, etc.). G3 explicitly flags `filled`.
- **Fix:** Either rename the axis to something that is clearly NOT the variant taxonomy (e.g. `surface?: 'fill' | 'none'` or `tone`), or align to `solid`. The semantics here ("does the success/error state get a filled circle") aren't really the variant axis at all — it's a presentational sub-mode. Prefer a distinct prop name so it doesn't read as a broken `variant` axis.

### [P1][G2] State color reaches a raw `var(--color-*)` string instead of a class/token utility
- **Category:** drift
- **Evidence:** spinner.tsx:74-78 — `stateColors = { spinning: 'var(--color-accent-9)', success: 'var(--color-success-9)', error: 'var(--color-error-9)' }`; consumed at spinner.tsx:109 and passed to `stroke={color}` / `fill={color}`
- **Why:** This is an SVG `stroke`/`fill` attribute, so a Tailwind utility class can't drive it directly — but hand-writing `var(--color-accent-9)` strings duplicates token names in JS and bypasses the token vocabulary the rest of the system enforces. If a token is renamed, this silently drifts. It also pins the spinning state to `accent-9` rather than letting it inherit, so a spinner in a neutral/muted context is always brand-pink.
- **Fix:** Drive color via `currentColor` + a wrapping text-color class where possible (the `bare` path already does this well at :109/:112), or centralize these three token references so they're the single source. At minimum, consider `text-accent-9`/`text-success-9` on the `<span>` and `stroke="currentColor"` so the SVG inherits.

### [P1][F2] No `asChild` / polymorphism and no way to relabel the status text
- **Category:** composability
- **Evidence:** spinner.tsx:68-72 — `srText` is a hardcoded `Record<string,string>` with fixed English strings; spinner.tsx:313 — `<span className="sr-only">{srText[state]}</span>`; no `label`/`aria-label` prop on `SpinnerProps`
- **Why:** The sr-only text is uncustomizable. A consumer loading a specific resource ("Loading projects…") or running in a non-English app cannot override "Loading...". For an a11y-bearing status element this is a real composability/i18n gap.
- **Fix:** Add an optional `label?: string` (and/or per-state labels) that overrides `srText[state]`, defaulting to the current strings.

### [P2][V3-adjacent / E1] sr-only "Loading..." uses a literal three-dot ellipsis
- **Category:** verbal-tell
- **Evidence:** spinner.tsx:69 — `spinning: 'Loading...'`; mirrored in test spinner.test.tsx:28-29
- **Why:** Trailing `...` (three periods) in UI copy is a minor AI/sloppy-copy tell and screen-reader-unfriendly (some SRs read "dot dot dot"). Not load-bearing, but it's the kind of default we're stripping.
- **Fix:** Use `'Loading'` (no ellipsis) or the single-glyph ellipsis `…` if a trailing mark is wanted. Then update the test assertion.

### [P2][M2] Hand-rolled per-property durations bypass the motion token scale
- **Category:** motion
- **Evidence:** spinner.tsx:119-123 — `ARC_COMPLETE = 0.4`, `FILL_DELAY = 0.3`, `FILL_DURATION = 0.25`, `ICON_DELAY = isFilled ? 0.5 : 0.35`, `ICON_DURATION = 0.35`; all consumed as raw seconds in the `transition` objects (e.g. :209-217, :243, :273-276)
- **Why:** `lib/motion.ts` exports a `durations` scale (`fast01..slow02`) and `springs`/`tweens` presets that Card and StatCard compose from. Spinner re-rolls its own magic-number timing (`0.25`, `0.3`, `0.35`, `0.4`, `0.5`) instead of pulling from the scale, so it's the only animated component not on the shared duration vocabulary. M2 (uniform/robotic vs. intentional) is partly addressed (the sequence IS choreographed), but the values are off-scale.
- **Fix:** Map the choreography onto `durations.*` (e.g. `slow01` = 0.4 for arc-complete, `moderate02` = 0.24 for fill) so the timing is one vocabulary. A documented comment on why the staging needs custom delays would justify the few that don't fit.

### [P2][M3 / state-coverage] Reduced-motion path drops the success/error icon-draw entirely AND never fires `onComplete`
- **Category:** motion / state-coverage
- **Evidence:** spinner.tsx:252-261 (reduced-motion `success` branch renders a static `<path>` with **no** `onAnimationComplete`); same for X at :285-293. The `onComplete` callback only exists on the animated `motion.path` (:277, :308).
- **Why:** Under `prefers-reduced-motion`, a consumer relying on `onComplete` (e.g. to advance a flow after the success tick) will **never** get the callback — the static path has no completion event. This is a real behavioral gap: the documented contract ("Fires when success/error transition animation completes", :60) silently breaks for reduced-motion users.
- **Fix:** In the reduced-motion branch, fire `onComplete?.()` in a `useEffect` (or `requestAnimationFrame`) when the static success/error path mounts, so the callback contract holds regardless of motion preference.

### [P2][J] No per-component doc + no `delay`/`variant`/`onComplete` controls fully exercised in stories' a11y
- **Category:** docs
- **Evidence:** Glob for `docs/components/**/spinner.md` → "No files found"; stories cover states/sizes/variants well but there is no markdown doc/prop table in `docs/components/`
- **Why:** Rubric J flags a missing per-component doc. Other components have a doc page with a prop table that must match CVA/source; Spinner has none, so docs-parity can't be verified and consumers reading the docs site get nothing.
- **Fix:** Confirm whether `docs/components/` is the canonical location (the JSDoc here is rich and may be the source for generated docs). If a per-component md is the standard, add one mirroring the `SpinnerProps` table.

### [P3][I] `srText` / `stateColors` typed as loose `Record<string, string>`
- **Category:** types
- **Evidence:** spinner.tsx:68 `const srText: Record<string, string>`; spinner.tsx:74 `const stateColors: Record<string, string>`
- **Why:** The keys are exactly the `state` union (`spinning|success|error`). Typing them `Record<string,string>` loses exhaustiveness — adding a 4th state wouldn't error here. Minor, but it's a stringly-typed lookup the rubric (I) calls out.
- **Fix:** `Record<NonNullable<SpinnerProps['state']>, string>` so a new state forces a new entry.

### [P3][state-coverage] No `aria-live` on the status region for state transitions
- **Category:** a11y
- **Evidence:** spinner.tsx:126 — `<span ref={ref} role="status" ...>`; the sr-only text changes (`Loading...` → `Complete`/`Error`) at :313 but the container has no explicit `aria-live`
- **Why:** `role="status"` implies `aria-live="polite"` by default, so this is largely fine — but the success/error transition is exactly the moment an SR user needs the update announced, and relying on implicit live semantics across a content swap can be flaky. Low severity because the implicit role mapping usually covers it.
- **Fix:** Optionally add explicit `aria-live="polite"` (and consider `aria-atomic`) to make the announce-on-completion behavior deterministic.

## Composability gaps
- **No label override** for the sr-only text — `srText` is hardcoded English, no `label`/`aria-label` prop (F2-adjacent; i18n + specificity gap).
- **`variant` axis name (`filled`/`bare`)** isn't shared vocabulary with any sibling; not a slot issue but a vocabulary/composability mismatch (G3/G4).
- Spinner is correctly a leaf primitive (no children, no surface), so F1/F3/F4/F5 (slots, base-primitive composition) **do not apply** — it has nothing to re-roll a Card from. This is appropriate for a spinner.
- No `asChild` — but a spinner has no polymorphic DOM target a consumer would realistically swap, so **F2 polymorphism is N/A**; the only F2-flavored gap is the label override above.

## Motion gaps
- **Reduced-motion drops `onComplete`** (the most important gap — breaks the documented callback contract for RM users). [M3]
- **Magic-number durations** off the `lib/motion.ts` scale; not on the shared duration vocabulary. [M2]
- Reduced-motion handling otherwise is **genuinely good**: every `motion.*` element has a `prefersReduced` static fallback (track :134, arc :159, fill :224, check :252, X :285). [M3 — mostly clean]
- Easing is intentional and on-system (`linear` for the spin loop, `easeInOut`/`easeOut` for the choreography) — **no bounce/elastic-by-default tell** (M1 clean).
- Animates `rotate` / `strokeDasharray` / `pathLength` / `opacity` — transform + SVG path props, **not layout props** (M5 clean).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the reduced-motion `onComplete` gap** (P2/M3) — fire the callback from a `useEffect` in the static success/error branches so the contract holds. This is the only behaviorally-broken item.
2. **Add a `label?: string` prop** (P1/F2) overriding `srText[state]`; default to current strings. Closes the i18n/specificity gap.
3. **Rename the `filled`/`bare` axis** off the `variant` taxonomy (P1/G3) — pick a name that doesn't read as a broken `solid/soft/outline` axis (e.g. `surface`/`tone`), or document why `variant` is reused here.
4. **Pull timing onto `durations.*`** from `lib/motion.ts` (P2/M2); keep a comment for any value that genuinely can't snap to the scale.
5. **Drop the `...` ellipsis** in sr text → `'Loading'` (P2/E1) and update the test.
6. **Tighten the lookup types** to the `state` union (P3/I).
7. **Add a per-component doc** if `docs/components/` is canonical (P2/J).
8. Consider explicit `aria-live="polite"` on the status span (P3).

## Clean (rubric dims that pass)
- **V1–V2, V6–V8** — no accent rail, no border+shadow double-edge, no blob/glass/glow, no rounded-everything, no pill spam. It's an SVG glyph.
- **V3** — no gradient text/number (no text content beyond sr-only).
- **V4** — colors are semantic tokens (`accent-9`/`success-9`/`error-9`), **not** raw indigo/violet/slate. The only nit is *how* they're referenced (G2), not *which* (V4 clean).
- **V5** — checkmark/X are hand-drawn SVG paths (:81-86), not emoji. The arc spinner is real geometry. No emoji-as-icon anywhere in source/story.
- **V9** — no hardcoded Inter/Geist font.
- **E2–E8** — JSDoc and story copy are direct and accurate; no contrastive negation, no AI-vocabulary, no meta-hedging, no tricolon filler. (Only E1 ellipsis nit above.)
- **M1, M5** — no bounce-by-default; no animating layout props.
- **A11y baseline** — `role="status"` + sr-only text per state, `forwardRef<HTMLSpanElement>`, `displayName` set (:318), axe test passes (test:15-20). `delay` flicker-avoidance is a nice touch.
- **H state coverage** — spinning/success/error all handled and shown in stories; reduced-motion handled (minus the `onComplete` gap); dark mode inherited via tokens; `bare` variant correctly uses `currentColor` for embedding in buttons/toolbars.
- **Types** — clean `SpinnerProps` interface, exported, no `any`, no `React.FC`, specific ref element. (Only the loose `Record` lookups, P3.)
- **Tests + stories** — both present and substantive; stories cover sizes, states, variants, delay, button-context, and live state transitions.
