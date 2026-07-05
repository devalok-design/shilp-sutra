# tokens — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:2 P3:2

> **Scope note.** The `tokens` unit has no shipped `.tsx` *component* — it is the design-token
> layer: OKLCH primitive scales (`primitives.css`), semantic tokens (`semantic.css`),
> typography/radius/motion/animation tokens, plus a `generate-scale.ts` generator + test, and
> three Storybook-only `.tsx` artifacts (`FoundationsShowcase.tsx`, `IconographyShowcase.tsx`,
> `forced-colors.stories.tsx`) + two MDX docs. **None of `src/tokens/` ships in the npm tarball**
> (`package.json` `files` = `dist`, `docs/components`, … — not `src`); the CSS is compiled into
> `dist`. So the showcase/MDX files are internal design docs — findings there are docs-severity
> (P2/P3), not consumer-facing defaults. The token *values* are algorithmically generated
> (OKLCH, brand-hue-parameterized) — the structural opposite of model-default slop.

## Findings

### [P2][E3] "straightforward" AI-vocabulary word in Foundations doc
- **Category:** verbal-tell
- **Evidence:** `packages/core/src/tokens/Foundations.mdx:8` — `…separates raw values from intent-based decisions, making theming and dark mode straightforward.`
- **Why:** "straightforward" is a soft model-default filler adjacent to the E3 list; the clause also editorializes ("making … straightforward") instead of stating the mechanism.
- **Fix:** Drop the clause or state the fact: `…separates raw values from intent-based decisions; dark mode is a second declaration of the same semantic tokens.`

### [P2][G2] Showcase demos hardcode px/rem instead of DS tokens
- **Category:** drift
- **Evidence:** `FoundationsShowcase.tsx:5-39` (`marginBottom:'3rem'`, `fontSize:'1.25rem'`, `borderRadius:'4px'` at line 254) and `IconographyShowcase.tsx:48-83`, plus fallback literals like `'var(--radius-ds-lg, 8px)'` / `'var(--color-surface-raised, #f9f9f9)'` (IconographyShowcase.tsx:103-106).
- **Why:** These are Storybook token-visualization demos (raw swatch scaffolding is legitimate — you can't demo a raw spacing value *with* `p-ds-05`), but the section chrome (headings, paragraph margins, the `4px` code-chip radius at FoundationsShowcase.tsx:254, the `#f9f9f9`/`#eee` hardcoded fallbacks) is chrome, not swatch data, and drifts from the tokens the page exists to advertise. Story-only, so low severity.
- **Fix:** Bind the *chrome* (headings, paragraph spacing, code-chip radius, cell backgrounds) to `var(--color-*)` / `var(--radius-*)` / `var(--spacing-*)`; keep raw literals only for the swatch dimensions being demonstrated. Drop the hex fallbacks in `var(…, #hex)` — inside Storybook the tokens are always defined.

### [P3][E1] Em-dash-as-connector in Foundations doc / CSS comments
- **Category:** verbal-tell
- **Evidence:** `Foundations.mdx:2` (2 occurrences) e.g. `every step has a defined purpose — background, border, solid, text`; pervasive in CSS comments too (`semantic.css`, `card`-style block comments) and grain.md ("Solid variant: grain 20% opacity + gradient").
- **Why:** E1 flags `—` as a stylistic connector. In prose docs this is a mild tell; in CSS comments it's near-invisible and idiomatic, so only the MDX prose is worth touching.
- **Fix:** In `Foundations.mdx` prose, replace connector em-dashes with a colon or a rewrite (`a defined purpose: background, border, solid, text`). Leave CSS comments.

### [P3][V6] Opt-in `--shadow-glow` token exists (glow shadow)
- **Category:** visual-tell (borderline — a CHOICE, not a shipped default)
- **Evidence:** `semantic.css:420` `--shadow-glow: 0 0 0 1.5px color-mix(in oklch, var(--color-accent-9) 20%, transparent), 0 0 7px …;` (dark override at :614). Consumed only by `ui/button.tsx` and `ai/command-bar.tsx` / `ai/devadoot-icon.tsx`.
- **Why:** V6 hard-bans "glowing colored box-shadow" *as a default surface*. This is **not** a tell by the rubric's own rule: it is bound to the brand `--color-accent-9` token and is opt-in (no component applies it by default outside the AI/command-bar surfaces where an accent glow is a deliberate affordance). Logging only for completeness / to confirm it was reviewed.
- **Fix:** None required. Keep it gated behind explicit component opt-in (as it is). If any *content* component ever reaches for `shadow-glow` by default, re-flag as V6.

## Composability gaps
- None applicable. This is the token layer — there is no runtime component API, no props, no slots. The generator (`generate-scale.ts`) exposes `generateScale(opts)` + `BRAND_PALETTES`, a clean pure-function API with typed `ScaleOptions`/`Scale` and `RangeError` guards (F-dimensions N/A).
- The three `.tsx` files are Storybook showcases, not composable primitives; F1–F6 do not apply.

## Motion gaps
- **Clean.** `animations.css` is intentional and well-structured: durations reference the `--duration-*` scale, easings reference `--ease-*` tokens (M2 pass — timing varies by purpose: popover-in 150ms entrance vs popover-out 100ms exit, distinct enter/exit easings). Layout-prop animations (`accordion-down`/`collapsible-*` animate `height`) are **justified** — they are Radix-coupled and driven by Radix's runtime `--radix-*-content-height` var, the standard technique; not the M5 reflex of animating `top/left/width` in JS. Looping animations (skeleton-shimmer, progress-indeterminate) use `transform`/`background-position` (M5 pass).
- **Note (not a token-layer finding):** these keyframes have no `@media (prefers-reduced-motion)` guard *in this file*. Reduced-motion is handled at the consumer/component layer (MotionConfig, `base.css`) per the DS architecture, so M3 is not charged here — but the synthesis pass should confirm a global reduced-motion kill-switch exists so these infinite loops (shimmer, processing-ants) are actually silenced. If none exists, that becomes an M3 P1 at the animations-token level.

## Polish plan (ordered steps to reach the finish bar)
The unit is already at the bar. Optional polish, in priority order:
1. Delete the "making … straightforward" clause in `Foundations.mdx:8` (E3).
2. Rewrite the two connector em-dashes in `Foundations.mdx` prose (E1).
3. Bind showcase *chrome* styles (headings/paragraph spacing/code-chip radius/cell bg) to DS tokens and drop the `var(…, #hex)` fallbacks in `IconographyShowcase.tsx` (G2).
4. (Cross-unit) Confirm a global `prefers-reduced-motion` guard neutralizes the infinite loops declared in `animations.css`; if absent, add one.

## Clean (rubric dims that pass)
- **V1 accent rail** — no card/rail construct in this unit. Clean.
- **V3 gradient text** — no `bg-clip-text`/`text-transparent` anywhere. Clean.
- **V4 default framework palette** — `indigo`/`slate`/`cyan`/`purple(violet)` primitives are **brand-named** (Neel / Megha / Samudra; "Sapta Varna" category system, `FoundationsShowcase.tsx:58-64`, `semantic.css:262-270`) and generated via OKLCH `generateScale`, not raw Tailwind `indigo-500`. Deliberate brand system, not a reflex. Clean.
- **V5 emoji-as-icon** — zero emoji; icon system is Tabler via a real catalog (`IconographyShowcase.tsx`). Clean.
- **V6/V7/V8** — gradients are brand-token-bound (`--gradient-brand-*` = pink→purple, consumed only by DevalokGrain; `GradientScale` demo shows them as swatches, legitimate). Radius is a single named vocabulary with role tokens + `[data-shape]` presets. No pill-badge spam. Clean.
- **V9 safe-face font** — showcases reference `var(--font-mono)` / DS type tokens, no hardcoded Inter/Geist. Clean.
- **M2/M5 motion** — see Motion gaps; timing varies by purpose, transforms not layout props (Radix-height exception justified). Clean.
- **G1/G3/G4 vocabulary** — token naming is canonical and consistent (12-step scales, `--color-<role>-<step>`, `--radius-<role>`, `--duration-*`, `--ease-*`). Radius primitive-vs-role separation is documented as intentional (`FoundationsShowcase.tsx:350-373`). Clean.
- **I types** — `generate-scale.ts` exports typed `Scale`/`ScaleOptions`, `BRAND_PALETTES`, validated inputs with `RangeError`. No `any`. Test coverage is thorough (structure, oklch format, lightness/chroma curves, per-palette). Clean.
- **H state-coverage / a11y** — `forced-colors.stories.tsx` is an exemplary a11y artifact: a full component matrix explicitly for verifying `@media (forced-colors: active)`, focus rings, solid-bg legibility, and color-only-state warnings. This is *above* the bar. Clean.
- **J docs parity** — Iconography + Foundations MDX match the token source; icon catalog reflects real usage. Clean.
