# ui/oauth-button — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

The component **source** is genuinely well-finished: it composes `<Button>` (F5 clean — no surface re-roll), keeps brand identity in the glyph rather than injecting per-provider hex backgrounds (V4 clean), forwards refs + displayName, exposes a composable `lastUsedSlot`, a namespaced `OAuth.*` API, and atomic `OAuthGlyph`/`getOAuthLabel` helpers. Axe-clean across all 13 providers. The gaps are almost entirely **doc/story drift around the deprecated `appearance` alias** plus a few re-rolled tokens in the "Last used" badge.

## Findings

### [P1][J] JSDoc documents the deprecated `appearance` axis as the live API
- **Category:** docs / drift
- **Evidence:** oauth-button.tsx:181-208 — `* **Appearance**: visual treatment.\n * - \`brand\` (default) — provider's brand background colour.\n * - \`outline\` ...\n * - \`dark\` — unified Apple-style across all providers`, and `@example` blocks at :205-207 use `appearance="dark"`.
- **Why:** The live axis is `variant` (`solid|soft|outline|ghost`); `appearance` is `@deprecated` (:224). The prose also claims `brand` paints "provider's brand background colour" — directly contradicted by the design note at :132-137 ("We do NOT inject per-provider hex backgrounds"). A consumer reading the doc reaches for a deprecated, mislabeled prop and expects brand-coloured backgrounds that no longer exist.
- **Fix:** Rewrite the JSDoc `**Appearance**` block as `**Variant**` documenting `solid|soft|outline|ghost`, drop the "brand background colour" claim, and change the `@example` group to `variant="solid"` (or `soft`). Leave one short line noting `appearance` is a deprecated alias.

### [P1][J] Stories drive everything through the deprecated `appearance` prop; no `variant` control
- **Category:** docs / drift
- **Evidence:** oauth-button.stories.tsx:34 `appearance: { control: 'select', options: ['brand', 'outline', 'dark'] }`, :42 `appearance: 'brand'`, and `appearance="outline"`/`appearance="dark"` at :71, :82, :154, :155, :165, :168-169. No `variant` argType anywhere.
- **Why:** Stories are the canonical usage reference and a publish gate. They teach the deprecated alias and omit the real `variant` axis entirely, so autodocs shows `brand/outline/dark` rather than `solid/soft/outline/ghost`.
- **Fix:** Replace the `appearance` argType with `variant: { control: 'select', options: ['solid','soft','outline','ghost'] }`, default `variant: 'soft'` (per G5/CLAUDE.md — non-primary), and swap all `appearance=` usages for `variant=` in the render stories.

### [P1][J] `@deprecated appearance` has no runtime dev-warning
- **Category:** docs
- **Evidence:** oauth-button.tsx:224-225 `/** @deprecated Use \`variant\`. */ appearance?: OAuthAppearance` — consumed at :291-293 with no `console.warn`/dev guard.
- **Why:** Rubric J: `@deprecated` without a dev warning lets the alias rot silently; consumers get no signal at runtime. (Type-level `@deprecated` only strikes through in editors; it does not fire on JS-only consumers.)
- **Fix:** Add a `process.env.NODE_ENV !== 'production'` `console.warn` (once) when `appearance` is passed, pointing to `variant`. Note the prop in CHANGELOG with a removal target.

### [P2][G2] "Last used" badge re-rolls raw spacing instead of ds tokens
- **Category:** drift / vocabulary
- **Evidence:** oauth-button.tsx:313 `... px-2 py-1 text-ds-2xs ...` and :350 `className="... -top-[10px] -right-2 z-10"`.
- **Why:** `px-2`/`py-1`/`-right-2` are raw Tailwind numeric spacing (not `--spacing-ds-*`), and `-top-[10px]` is an arbitrary px value — exactly the re-rolled-token pattern G2 flags. The 9px-pill size is documented as an intentional exception (:310-311), but that justifies the *font/size* choice, not the use of non-ds spacing for the padding/offset.
- **Fix:** Use `px-ds-02 py-ds-01` (or the closest ds steps) and ds-based offsets; if no ds token lands the pill on the corner, document the arbitrary offset inline the way the size exception is documented.

### [P2][V14] "Last used" badge defaults to `uppercase tracking-wide`
- **Category:** visual-tell
- **Evidence:** oauth-button.tsx:313 `... uppercase tracking-wide font-semibold ...` — shipped as the **default** badge, rendered whenever `lastUsed` is set.
- **Why:** All-caps-as-default-emphasis (V14). "Last used" is a soft UX hint, not a label that needs shouting; uppercase micro-text is a common AI badge tic. (OAuthDivider's uppercase at :462 is a single load-bearing separator label — borderline but defensible; this one is a decorative pill.)
- **Fix:** Drop `uppercase tracking-wide`; render "Last used" in sentence case at `text-ds-2xs`. If emphasis is needed, lean on the accent fill already present.

### [P2][H] "Last used" badge is `aria-hidden` with `(last used)` only appended when the long-form aria path triggers
- **Category:** a11y / state-coverage
- **Evidence:** oauth-button.tsx:298-300 `ariaLabelForButton = iconOnly || compact || lastUsed ? \`${longName}${lastUsed ? ' (last used)' : ''}\` : undefined`; badge wrapper at :347-351 is `aria-hidden="true"`.
- **Why:** The augmentation only fires because `lastUsed` is in the OR-gate. It works for the default label, but if a consumer passes custom `children` AND `lastUsed`, the aria-label becomes the resolved long-form name (ignoring `children`) — the visible custom label and the accessible name diverge. Edge case, but the "(last used)" hint is also English-only with no `lastUsedLabel` reflection into aria.
- **Fix:** Append the localized `lastUsedLabel` (or a dedicated `lastUsedAriaLabel`) to the accessible name rather than a hardcoded `(last used)`, and prefer `children` over the resolved long-form name when `children` is provided.

### [P2][H] Stories don't demonstrate disabled / loading / focus-visible states
- **Category:** state-coverage
- **Evidence:** oauth-button.stories.tsx — has Default, AllProviders×3, Intent, Sizes, IconOnly, LastUsed, Helper, flows, Async; no disabled story, no explicit loading story (Async covers it implicitly), no RTL/forced-colors/reduced-motion coverage.
- **Why:** Rubric H wants the state matrix demonstrated in stories OR tests. Disabled is tested (test:104) but not shown; focus-visible/forced-colors/RTL are neither shown nor tested. These all inherit from Button so risk is low, but the matrix isn't demonstrated at this layer.
- **Fix:** Add a `States` story row (disabled, loading via `onClickAsync`, focus-visible) and at minimum a forced-colors note; or document that state coverage is delegated to Button's stories.

### [P3][docs] No per-component doc at docs/components
- **Category:** docs
- **Evidence:** Glob `packages/core/docs/components/**/oauth*` → no files.
- **Why:** Rubric J lists "per-component doc missing" as a P2-class gap, but OAuthButton may be documented only via autodocs + llms-full.txt; not all components have standalone md. Flagging low.
- **Fix:** Confirm coverage exists in llms-full.txt / make-kit with the `variant` axis (not `appearance`); add a doc stub if the family is meant to have one.

### [P3][G3] `OAuthVariant` omits `link` (and never had `xl`); minor taxonomy partial-cover
- **Category:** vocabulary
- **Evidence:** oauth-button.tsx:54 `export type OAuthVariant = 'solid' | 'soft' | 'outline' | 'ghost'` vs Button's canonical `solid|soft|outline|ghost|link` (button.tsx:26-31).
- **Why:** Deliberate and reasonable — `link` makes no sense for an OAuth CTA. Listed only for completeness; not a real defect.
- **Fix:** None needed. Optionally note in JSDoc that `link` is intentionally excluded.

## Composability gaps
- **Mostly clean.** `lastUsedSlot` is a real composable slot (ReactNode or render-fn), `children` overrides the label, `icon` is the documented escape hatch for brand-multicolour SVGs, `OAuthGlyph` exposes the atomic glyph, and `OAuth.*` gives a namespaced compound API. This is at or near the Card bar for composability.
- Minor: `lastUsed` + `lastUsedSlot` + `lastUsedLabel` is three coupled props where a single `lastUsed?: boolean | ReactNode | { label }` could collapse the surface — but the current split is explicit and documented, so this is preference, not a gap.
- No `asChild` on OAuthButton, but it forwards to Button which owns `asChild`; consumers polymorph via Button props. Acceptable for a wrapper.

## Motion gaps
- **None at the component layer.** OAuthButton/Group/Divider/ConnectionRow add no bespoke animation — all motion (hover/press/async-feedback, reduced-motion handling) is inherited from `<Button>`, which is the right place for it. No bounce-by-default, no animated layout props, no missing reduced-motion guard introduced here.

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the `appearance` doc/story drift (P1×3).** Rewrite the JSDoc `**Appearance**`→`**Variant**` block (solid/soft/outline/ghost), delete the "brand background colour" claim, fix the `@example`s. Swap the stories' `appearance` argType + all usages to `variant` (default `soft`), and rename/remove the misleading "All providers — dark (unified)" story (no `dark` variant exists; it renders identical to solid).
2. **Add a dev-warning** when the deprecated `appearance` prop is passed; log a CHANGELOG entry + removal target.
3. **Detox the "Last used" badge (P2×2):** replace `px-2 py-1 -right-2 -top-[10px]` with ds tokens (document any necessary arbitrary offset like the size exception already is), and drop `uppercase tracking-wide` for sentence case.
4. **Tighten the lastUsed aria augmentation (P2):** localize "(last used)" via `lastUsedLabel` and respect `children` over the resolved long-form name.
5. **Add a States story** (disabled, loading, focus-visible) or document delegation to Button's state stories.

## Clean (rubric dims that pass)
- **V1 accent rail** — none. **V2 double edge** — inherits Button's single-edge model. **V3 gradient text** — none. **V4 framework palette** — brand identity is in the glyph, no per-provider hex; badge uses `bg-accent-9` semantic token. **V5 emoji** — none (real Tabler glyphs). **V6 blob/glass/glow** — none. **V7 rounded-everything** — uses `rounded-pill` only on the pill badge, `rounded-surface` on the connection row. **V8 pill spam** — single "Last used" pill, gated behind a prop.
- **F5** — composes `<Button>` and (StatCard-style) does not re-roll surface/padding/elevation.
- **G1 surface** — OAuthConnectionRow uses `bg-surface-raised` (a card-like row on the page) correctly; no surface-1 misuse.
- **I types** — `forwardRef` + `displayName` on all five components, typed `OAuthProvider`/`OAuthIntent`/`OAuthVariant` string unions (no stringly-typed `color?: string`), no `any` in the public surface, no `React.FC`.
- **Motion (M1–M5)** — clean (delegated to Button).
- **a11y baseline** — axe-clean across all 13 providers, icon-only, and connection row (test:182-201, 341-346); icon-only keeps the long-form name in aria-label.
