# ui/search-input — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:2

SearchInput is a thin, well-behaved wrapper over `Input`. It composes the base primitive
correctly (F5 clean), uses tokens not raw values, forwards refs, and has a real test +
story + doc. No hard visual/verbal AI tells in its default rendering. The gaps are all
finish-bar gaps: docs/type drift on the `size` axis, a verbal em-dash + boilerplate tic in
the JSDoc, a controlled-only API (no uncontrolled clear path), and a couple of state-coverage
holes (no `xs`/error/RTL/sizes story).

## Findings

### [P1][G3 / J] `size` axis drift — type ships `xs` but JSDoc + doc.md + story all claim `sm | md | lg`
- **Category:** drift / docs
- **Evidence:** search-input.tsx:13 — `type SearchInputSize = 'xs' | 'sm' | 'md' | 'lg'`; but search-input.tsx:18-19 JSDoc says `**Sizes:** \`sm\` | \`md\` (default) | \`lg\``; docs/components/ui/search-input.md:8 `size: "sm" | "md" | "lg"`.
- **Why:** The `xs` size is a real, shippable value (Input supports `xs`, 28px) but is invisible to anyone reading the JSDoc, the doc table, or the Storybook autodocs — and is unstoried/untested. Source wins per CLAUDE.md; the docs are stale.
- **Fix:** Add `xs` to the JSDoc `**Sizes:**` line and the doc.md props table, or drop `xs` from `SearchInputSize` if it was never intended. Add an `AllSizes` story rendering xs/sm/md/lg.

### [P1][F6] Controlled-only clear — no uncontrolled mode; clear button is invisible to the common uncontrolled case
- **Category:** composability
- **Evidence:** search-input.tsx:57 — `const hasValue = value !== undefined && value !== ''`; clear/loading slot gating depends entirely on a controlled `value`.
- **Why:** A consumer who uses `<SearchInput defaultValue=... onClear=... />` (uncontrolled, the natural default for a search field) gets no clear button at all, because `value` is `undefined` so `hasValue` is always false. There is no `defaultValue` story/test and no ref-read fallback. The clear affordance silently only works in fully-controlled mode — an easy footgun the doc doesn't warn about.
- **Fix:** Either document the hard requirement ("clear button requires controlled `value`") prominently, or read the input's current value (via the forwarded ref / internal uncontrolled state) so the clear button works uncontrolled too. Add a `defaultValue` story to lock the behavior.

### [P2][E1 / E5] JSDoc verbal tics — em-dash connectors + boilerplate "feel free to combine props creatively!" closer
- **Category:** verbal-tell
- **Evidence:** search-input.tsx:46 — `// These are just a few ways — feel free to combine props creatively!`; em-dash connectors throughout the JSDoc (lines 16, 18, 20, 28, 36, 44).
- **Why:** E1 (em-dash as stylistic connector) and E5 (empty engagement-bait closer) are exact rubric verbal tells. The "feel free to combine props creatively!" line is the same copy-paste closer flagged on Card/StatCard — it's AI filler, not documentation.
- **Fix:** Delete the closer line. Reduce em-dashes to where a real parenthetical is meant (or use a colon/period). This is the same fix queued for Card/StatCard — do it as a family sweep.

### [P2][H] State-coverage gaps in stories/tests — no error/invalid, no read-only, no required, no RTL, no `xs`, no all-sizes
- **Category:** state-coverage
- **Evidence:** search-input.stories.tsx:18-88 covers Default / Interactive / WithValue / Loading / Disabled / Empty only. search-input.test.tsx:8-11 runs `describeConformance` (covers focus/a11y/ref) but no story shows focus-visible, error, read-only, RTL, or the size scale.
- **Why:** The matrix in rubric §H expects error (+`aria-invalid`), read-only, required, RTL (search icon doesn't mirror but the clear button position does), forced-colors, and the full size axis demonstrated. SearchInput intentionally has no `state` prop (doc.md:33 says wrap Input in FormField for validation) — that's a legitimate scoping choice, so error-state coverage is N/A here — but RTL and the size scale are still unshown.
- **Fix:** Add `AllSizes` (xs→lg) and an `RTL` story (`dir="rtl"` wrapper) to confirm the clear button flips to the leading edge. Note in doc.md that validation is delegated to Input+FormField (already there — good).

### [P2][M4 / M3] Loading spinner swaps in with no transition; AnimatePresence covers clear button but not the clear↔loading↔empty crossfade
- **Category:** motion
- **Evidence:** search-input.tsx:59-61 — `const endContent = loading ? (<Spinner size="sm" />) : (<AnimatePresence>…clear…</AnimatePresence>)`. The `loading` branch is outside AnimatePresence, so toggling `loading` hard-cuts between spinner and clear button with no exit/enter.
- **Why:** The clear button animates in/out (good), but the spinner↔clear transition — the most visible state change during an async search — pops with no feedback motion (M4). The whole end slot also has no reduced-motion guard (M3), though that matches the exemplar Card/StatCard which rely on a consumer `MotionConfig` rather than per-component `useReducedMotion` (Button/Badge do guard locally — inconsistent family pattern, but the exemplar bar itself doesn't guard, so this is minor).
- **Fix:** Wrap both spinner and clear in one `<AnimatePresence mode="wait">` keyed by state so the spinner crossfades. Optionally adopt `useReducedMotion` to match Button/Badge if the family standardizes on local guards.

### [P3][I] `onClear` typed as bare `() => void` while sibling clearable patterns elsewhere may differ
- **Category:** types
- **Evidence:** search-input.tsx:49 — `onClear?: () => void`.
- **Why:** Minor — `onClear` is a fine signature. Flagging only that there's no `defaultValue`/uncontrolled type story and `value` is inherited as `string | number | readonly string[] | undefined` from `InputHTMLAttributes`, while `hasValue` only compares against `''` (a `number` value of `0` would be treated as truthy/non-empty). Edge case, search inputs are string-valued in practice.
- **Fix:** Optionally narrow to `value?: string` on SearchInputProps since a search field is text, making `hasValue` correctness obvious.

### [P3][J] doc.md "Keyboard: Escape auto-triggers onClear … via type="search"" claim is unverified and likely wrong
- **Category:** docs
- **Evidence:** docs/components/ui/search-input.md:34 — "Keyboard: Escape auto-triggers `onClear` when wired (handled via `type="search"`'s native behavior on most browsers)." But search-input.tsx never sets `type="search"` and never wires an Escape handler to `onClear`.
- **Why:** The component passes `...props` through to Input, which defaults `<input>` to `type="text"` (no `type` set). Native Escape-clears-search behavior requires `type="search"` AND is non-standard/inconsistent across browsers; `onClear` is a React callback that native Escape would not invoke. The doc describes behavior the code doesn't implement.
- **Fix:** Either set `type="search"` as the default in SearchInput and add an explicit `onKeyDown` Escape→`onClear` handler (then the doc is true), or delete the claim from doc.md.

## Composability gaps
- **F5 — clean.** Composes `<Input>` with `startSection`/`endSection`; does not re-roll surface/padding/border. This is exactly the StatCard-composes-Card pattern. Good.
- **F1 — borderline OK.** `onClear` + `loading` are behavioral props, not content-injection corner-props, so they don't violate F1 (the clear button is a fixed, opinionated affordance — appropriate for a purpose-built search field). No slot needed.
- **F6 — gap.** Controlled-only: no `defaultValue`/uncontrolled support for the clear button (see P1 above). This is the one real composability hole.
- **F2 — N/A.** SearchInput forwards to an `<input>`; `asChild` doesn't apply to a form control.

## Motion gaps
- Spinner↔clear state swap is outside AnimatePresence → hard-cut on `loading` toggle (M4).
- No per-component reduced-motion guard (M3) — but this matches the exemplar Card/StatCard, which delegate to consumer `MotionConfig`. Button/Badge guard locally; the family is inconsistent. Low priority unless the family standardizes.
- Clear-button enter/exit motion itself is correct: `springs.snappy`, opacity+scale (transform, not layout props — M5 clean), AnimatePresence handles exit.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the `size` drift (P1):** add `xs` to JSDoc + doc.md, or remove it from the type. Decide intentionally.
2. **Resolve controlled-only clear (P1):** document the controlled requirement clearly AND/OR add uncontrolled support; add a `defaultValue` story.
3. **Strip JSDoc verbal tics (P2):** delete "feel free to combine props creatively!" and trim em-dashes — sweep with Card/StatCard.
4. **Fix the Escape/`type="search"` doc claim (P3):** either implement it (set `type="search"` default + Escape handler) or delete the claim.
5. **Add stories (P2):** `AllSizes` (xs→lg) and `RTL`.
6. **Crossfade the spinner↔clear swap (P2):** single `AnimatePresence mode="wait"` keyed by state.

## Clean (rubric dims that pass)
- **V1–V8 (visual hard tells):** none. No accent rail, no double edge, no gradient text/number, no raw indigo/violet/slate as brand (icon color is `text-surface-fg-muted` via Input), no emoji icons (uses `IconSearch`/`IconX` from tabler via the Icon API), no blob/glass/glow, no rounded-everything (inherits `rounded-control` from Input), no pill-badge spam.
- **V9–V15 (visual reflexes):** clean — no hardcoded font, no decorative numbering, no eyebrow/hero/all-caps.
- **G1 surface:** clean — inherits Input's `bg-surface-raised-hover` wrapper; correct level for an input control (surface-1 family per the layering rule). Not a card.
- **G2 tokens:** clean — no raw px/hex/shadow in SearchInput itself; all sizing/spacing delegated to Input's tokenized scale.
- **E2/E3/E4/E6/E7/E8 verbal:** clean — no contrastive negation, no AI vocabulary, no meta-hedging, no chatbot artifacts, no forced tricolon, no over-structuring (only E1/E5 hit).
- **State coverage core:** `disabled`, `loading` (+`aria-busy` on input, line 94), clear-button gating, focus (via Input's `focus-within:ring`) all handled and tested. Clear button has `aria-label="Clear search"` + `title`.
- **Types:** `forwardRef<HTMLInputElement>` + `displayName` set; props extend `InputHTMLAttributes` with native `size` correctly `Omit`ted; no `any`, no `React.FC`.
- **M5:** animates transform+opacity only — no layout-prop animation.
