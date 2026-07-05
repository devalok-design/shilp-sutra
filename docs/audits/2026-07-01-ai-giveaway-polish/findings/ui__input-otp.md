# ui/input-otp — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:2

## Findings

### [P1][G2] Hardcoded `h-[16px]` caret height instead of a token
- **Category:** drift
- **Evidence:** `packages/core/src/ui/input-otp.tsx:88` — `<div className="animate-caret-blink h-[16px] w-px bg-surface-fg duration-slow-02" />`
- **Why:** A raw arbitrary px value for the fake-caret bar; everything else in the file is on the `ds-*` scale (`h-ds-sm`, `w-ds-sm`). It also doesn't scale with `size` — the caret is 16px tall in `sm`, `md`, and `lg` slots alike, so it's visually short in `lg`.
- **Fix:** Use a token (e.g. a fractional height token) and ideally derive caret height from the size context so it scales with the slot. Minimum: replace `h-[16px]` with the nearest `--spacing-ds-*`/height token.

### [P1][I] `size` prop collides with native `<input size>` and is laundered through a runtime `typeof` guard
- **Category:** types
- **Evidence:** `packages/core/src/ui/input-otp.tsx:32-35` — `({ ..., size: sizeProp, ... }) => { ... const size: InputOTPSize = (typeof sizeProp === 'string' ? sizeProp : undefined) ?? 'md' }`
- **Why:** `OTPInput` spreads `React.ComponentPropsWithoutRef`, which includes the native numeric `size` attribute. The intersection `& { size?: InputOTPSize }` produces a `string | number` type for `size` at the prop boundary, forcing the runtime `typeof sizeProp === 'string'` narrowing. A consumer passing `size={4}` (legal on the inferred type) silently falls back to `'md'` instead of erroring. The public `InputOTPProps` type (line 106-110) inherits the same ambiguity. This is a soft API contract hole, not a hard break.
- **Fix:** `Omit<React.ComponentPropsWithoutRef<typeof OTPInput>, 'size'> & { size?: InputOTPSize }` on both the forwardRef generic and the exported `InputOTPProps`, so `size` is unambiguously the DS size axis and the runtime guard becomes unnecessary.

### [P2][H] Active-slot indicator is `ring-2 ring-accent-9` with no forced-colors fallback
- **Category:** a11y / state-coverage
- **Evidence:** `packages/core/src/ui/input-otp.tsx:80` — `isActive && 'z-raised ring-2 ring-accent-9'`
- **Why:** The only visible focus/active affordance is a colored ring on the slot (the real focusable element is the visually-hidden library input). Under Windows High Contrast / `forced-colors`, custom ring colors are stripped, so the active slot can lose its indicator. The DS has a `@media (forced-colors)` convention; this component ships none for its active state.
- **Fix:** Add a `forced-colors:` ring/outline fallback (e.g. `forced-colors:ring-[Highlight]` or an `outline` that survives forced-colors) on the active slot so the caret position stays visible.

### [P2][M3] Caret-blink animation relies solely on the global reduced-motion reset; no component-level intent
- **Category:** motion
- **Evidence:** `packages/core/src/ui/input-otp.tsx:88` (`animate-caret-blink ... duration-slow-02`) — guarded only by the blanket `@media (prefers-reduced-motion: reduce)` in `tokens/semantic.css:675`.
- **Why:** This is mostly fine (the global reset clamps `animation-duration` and `animation-iteration-count`, so the blink stops). Flagging at P2 because the component does not opt the caret out of motion intentionally — it's covered incidentally by a global reset. A real caret should arguably stay solid (not blink) under reduced-motion rather than freeze at whatever opacity the reset lands on. Verify the caret reads as "present" not "missing" when motion is reduced.
- **Fix:** No change required if the global reset leaves the caret at opacity 1; if it can freeze at opacity 0, set an explicit `motion-reduce:opacity-100 motion-reduce:animate-none` on the caret bar.

### [P2][H] No `value`/`onChange` controlled story or test for the error+FormField integration; success/required/read-only states unshown
- **Category:** state-coverage
- **Evidence:** `input-otp.stories.tsx` covers Default/WithSeparator/FourDigits/Disabled/Sizes/ErrorState only; `input-otp.test.tsx:98` axe test runs only the default (no error, no disabled, no FormField-wrapped variant).
- **Why:** The component's headline feature — auto-inheriting `state`/`aria-describedby`/`aria-required` from `useFormField()` (lines 33-47) — has zero story and zero test coverage. There's also no filled/complete state, no `onComplete` demonstration, and no RTL story. Falls short of the Card-bar "every applicable state shown" expectation.
- **Fix:** Add a `WithinFormField` story (showing inherited error + helper text) and a test asserting `aria-invalid`/`aria-describedby` propagate from form context; add a filled/`onComplete` story.

### [P3][F2] `InputOTPSeparator` is hardcoded to `IconMinus` with no slot/override
- **Category:** composability
- **Evidence:** `packages/core/src/ui/input-otp.tsx:96-103` — `<div ref={ref} role="separator" {...props}><Icon icon={IconMinus} size="sm" /></div>`
- **Why:** The separator always renders a minus glyph; a consumer who wants a dot/slash/custom separator can't override the icon without re-implementing the component. Minor — shadcn's original is the same — but below the Card-bar "content goes through slots" standard. `children`, if passed, are ignored (the `<Icon>` is always rendered, not `props.children`).
- **Fix:** Render `children ?? <Icon icon={IconMinus} size="sm" />` so the glyph is overridable, or accept an `icon` prop.

### [P3][docs][J] Doc lists `value`/`onComplete`/`pattern` props that come from the underlying library, not the component
- **Category:** docs
- **Evidence:** `docs/components/ui/input-otp.md:10-13` documents `value`, `onChange`, `onComplete`, `pattern` as `InputOTP` props; the component itself only declares `state` + `size` and spreads the rest to `OTPInput`.
- **Why:** Not wrong (they pass through), but the doc presents library props as first-class without saying so until the Composability note. The `size` doc entry also doesn't warn about the native-`size` collision. Low impact.
- **Fix:** Mark pass-through props as "(from `input-otp`)" and note the `size` is the DS size axis (string), not the native numeric attribute.

## Composability gaps
- `InputOTPSeparator` hardcodes `IconMinus`; no glyph slot/override and ignores `children` (F2, P3).
- Otherwise composability is strong and matches the family pattern: compound slots (`InputOTP` / `InputOTPGroup` / `InputOTPSlot` / `InputOTPSeparator`), size propagated via `InputOTPSizeContext` (mirrors Card's `CardSizeContext`), and full library prop pass-through. No bespoke corner-props. This is genuinely close to the Card bar structurally.

## Motion gaps
- Caret blink covered only by the global `prefers-reduced-motion` reset, not opted out at the component level (M3, P2) — likely fine but unverified that the caret stays visible (not frozen at opacity 0) under reduced motion.
- No entrance/feedback motion on slot fill or active-slot transition beyond the CSS `transition-[box-shadow,border-color]` (line 77) — that transition itself is good, intentional, and token-driven. No bounce-by-default, no animated layout props. Clean on M1/M2/M5.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the `size` prop type collision: `Omit<…, 'size'> & { size?: InputOTPSize }` on the forwardRef generic and `InputOTPProps`; delete the `typeof sizeProp === 'string'` runtime guard (I, P1).
2. Replace `h-[16px]` caret with a token and scale it off the size context so the caret fits `sm`/`md`/`lg` (G2, P1).
3. Add a `forced-colors:` fallback to the active-slot ring so the caret position survives Windows High Contrast (H, P2).
4. Add `WithinFormField` + filled/`onComplete` stories and a FormField-integration a11y test (state-coverage, P2).
5. Make `InputOTPSeparator` render `children ?? <Icon icon={IconMinus} />` so the separator glyph is overridable (F2, P3).
6. Tidy the doc prop table to mark pass-through library props and the `size` semantics (J, P3).

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no gradient text, no default framework palette (uses `accent-9`, `surface-border-strong`, `error-7` semantic tokens), no emoji icons (uses `IconMinus` via the DS Icon API), no blob/glass/glow, single radius vocabulary (`rounded-l-control` / `rounded-r-control`), no pill spam.
- **V9–V15 reflexes:** none. No hardcoded font, no decorative numbering, no eyebrow/hero/all-caps defaults.
- **E1–E8 verbal tells:** doc and JSDoc are clean — direct, prescriptive, no em-dash tic abuse, no AI vocabulary, no meta-hedging.
- **G1 surface:** correct — slots use `surface-border-strong` borders on a transparent fill (an input control, not a card); no `bg-surface-1` misuse.
- **G3 variant axis:** `size` axis is canonical `sm/md/lg`; `state` (`default`/`error`) is the input-control convention, consistent with the Input/Form family.
- **F6 controlled/uncontrolled:** delegated correctly to the `input-otp` library (supports both `value` and uncontrolled); `onChange`/`onComplete` are the library's input-semantic callbacks. No gap.
- **a11y wiring:** `aria-invalid`, `aria-describedby`, `aria-required` are correctly wired from `useFormField()`; `has-[:disabled]:opacity-action-disabled` and `disabled:cursor-not-allowed` handle the disabled state; axe-clean test present.
- **forwardRef/displayName:** all four components forward refs and set `displayName`.
- **M1/M2/M5 motion:** no bounce-by-default, no robotic uniform timing concern, no animating layout props; the box-shadow/border transition is intentional and token-driven.
