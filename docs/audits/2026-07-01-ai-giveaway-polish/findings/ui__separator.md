# ui/separator — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:3 P2:3 P3:1

## Findings

### [P0][G2] Interpolated arbitrary gradient classes don't survive the TW4 scanner
- **Category:** drift
- **Evidence:** separator.tsx:38 — `` `bg-transparent bg-[image:linear-gradient(${deg},transparent,var(--color-surface-border)_15%,...)]` `` (also :40, :42)
- **Why:** The class string interpolates a runtime variable (`${deg}`). Tailwind 4's JIT scans **source text statically** — it sees the literal token `bg-[image:linear-gradient(${l},...)]` (the minified dist proves `${l}` is still a template placeholder, separator.js:13), never the resolved `90deg`/`180deg`. The consumer build cannot emit a valid utility, so all three gradient variants render as `bg-transparent` with no gradient — the feature is dead in any real consumer. This is precisely the `theme(spacing.N)` / dynamic-class anti-pattern CLAUDE.md bans ("`w-[--var]` is dead", arbitrary values must be statically visible).
- **Fix:** Spell out the two orientations as literal, static classes (no interpolation), exactly like Card's `cornerPositions` map does for its inset utilities. Either branch on `orientation` to pick a fully-literal `bg-[image:linear-gradient(90deg,…)]` vs `(180deg,…)` string, or define the four gradients as `@utility` blocks in `tokens/utilities.css` and apply by name. Then add a build/test assertion that the utility appears in compiled CSS.

### [P1][V1/V6] Gradient-fade is a decorative AI tell shipped as a first-class default-adjacent variant
- **Category:** visual-tell
- **Evidence:** separator.tsx:16 — `variant?: 'default' | 'gradient' | 'gradient-left' | 'gradient-right'`; stories Gradient story (separator.stories.tsx:68-97) showcases all three.
- **Why:** A separator's whole job is to mark a boundary. Three of its four variants are edge-fading gradients — decorative softening with no information value, the kind of "make it look fancy" reflex (V6 glow/blur family, V1 decorative-stripe family) that reads as vibe-coded. A boundary line that fades to invisible at the ends is the opposite of a clear divider. The exemplars (Card v0.44.0) *removed* their decorative accent rail for exactly this reason. Gradients are legitimate for skeleton shimmer / chart fills / swatches — a divider is none of those.
- **Fix:** Demote to a single optional `fade?: boolean` (or drop entirely). If kept, document it as an explicitly-opt-in decorative treatment for a specific context (e.g. a hero band), not a peer of `default`. Don't lead the story with three gradient flavors.

### [P1][G3] `variant` axis is off the canonical taxonomy
- **Category:** vocabulary
- **Evidence:** separator.tsx:16 — `variant?: 'default' | 'gradient' | 'gradient-left' | 'gradient-right'`
- **Why:** The canonical `variant` axis is `solid/soft/outline/ghost/link`. Here `variant` instead encodes a decorative fade direction (`gradient-left`/`gradient-right`). A consumer reading "variant" across the system gets a different mental model on Separator than on Button/Card. Direction is a separate concern from fill style.
- **Fix:** If a fade survives at all, model it on its own axis (e.g. `fade?: 'none' | 'both' | 'start' | 'end'`) and keep `variant` either absent or reserved for the canonical taxonomy. Use logical `start`/`end` not `left`/`right` so it's RTL-correct.

### [P1][F2] No `asChild` / underlying primitive lacks the standard Slot escape hatch
- **Category:** composability
- **Evidence:** separator.tsx:31 — renders `<SeparatorPrimitive.Root>` directly; no `asChild` passthrough; SeparatorProps spreads `...props` but the doc claims "Drop it anywhere."
- **Why:** Separators are routinely needed as `<li role="separator">` inside menus or as a styled `<hr>`. Radix Separator.Root supports `asChild`; the wrapper neither documents nor tests it, and the hardcoded `h-[1px]/w-[1px]` sizing assumes a `div`. Polymorphism is the Card-bar expectation for a primitive this low-level.
- **Fix:** Confirm `asChild` flows through (it should via `...props`), add a test + a story demonstrating `asChild` with an `<hr>` or menu item, and note it in the doc's Composability section.

### [P2][G2] Hardcoded `h-[1px]` / `w-[1px]` instead of a token
- **Category:** drift
- **Evidence:** separator.tsx:44 — `orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'`
- **Why:** Raw `1px` arbitrary values bypass the token system. A hairline width is a legitimate design decision but should reference a token (e.g. a `--border-width` / `border` utility) so a global hairline change is one edit. Minor — 1px is near-universal for dividers — but it's re-rolled, not tokenized.
- **Fix:** Use `h-px`/`w-px` (Tailwind's static token) at minimum, or a DS border-width token if one exists. Avoids the arbitrary-value bracket entirely.

### [P2][H] No thickness / inset / label state coverage; vertical-height footgun only in docs
- **Category:** state-coverage
- **Evidence:** separator.tsx whole file — only orientation + decorative + the gradient variants; doc Gotchas:29 notes "Vertical separator needs an explicit height."
- **Why:** A finished divider primitive typically offers a labeled variant ("OR" divider), a thickness option, and inset/spacing helpers — common real needs the component punts to the consumer. The vertical-height requirement is a known footgun documented but not mitigated (no sensible default, no warning). Falls short of the Card-bar "full applicable-state coverage."
- **Fix:** Consider a `label`/children slot for a centered-text divider (very common) and/or an inset prop. At minimum, give vertical a `self-stretch` fallback or document the flex requirement more prominently. Decide scope explicitly rather than leaving gaps.

### [P2][J] Doc prop table omits the `variant` prop entirely
- **Category:** docs
- **Evidence:** separator.md:7-13 — Props lists only `orientation` and `decorative`; `variant` (added v0.22.0 per Changes:32) is missing from the Props/Defaults tables though it's the component's most prominent (and most problematic) axis.
- **Why:** Docs-parity gap: the prop table doesn't match the CVA/source surface. An AI agent or human reading the doc won't know `variant` exists from the Props section (only from the buried Changes log).
- **Fix:** Add `variant: "default" | "gradient" | "gradient-left" | "gradient-right"` with default `"default"` to the Props/Defaults tables — or, better, after the G3/V1 fixes, document the corrected axis.

### [P3][docs] `decorative` default contradicts common a11y expectation without strong steer
- **Category:** docs
- **Evidence:** separator.tsx:24 — `decorative = true`; doc Composability:23 explains but defaults stay decorative.
- **Why:** Defaulting to `role="none"` is a defensible choice (most separators are decorative), but it silently hides every separator from AT unless the consumer flips it. Worth a one-line nudge in the doc toward `decorative={false}` for section boundaries. Minor.
- **Fix:** Keep the default; strengthen the doc note (already present) — no code change needed.

## Composability gaps
- No verified/tested/documented `asChild` (F2) — can't polymorph to `<hr>` or a menu `<li role="separator">` with confidence; sizing assumes a `div`.
- No label/text-divider slot — the very common "OR" centered divider must be hand-rolled by consumers; a finished primitive would expose a children slot.
- `variant` axis conflates fill-treatment with direction (`-left`/`-right`), off the canonical taxonomy (G3) — and uses physical not logical direction, so it's not RTL-aware.

## Motion gaps
- None required. A static divider has no entrance/feedback motion expectation, so M1–M5 are N/A (no animated layout props, no missing reduced-motion guard because there's no animation). Clean by absence — correctly so. (Contrast StatCard, which composes motion; a separator should stay still.)

## Polish plan (ordered steps to reach the finish bar)
1. **Fix G2 (P0) first** — replace the interpolated `bg-[image:linear-gradient(${deg},…)]` with fully-literal static class strings branched on orientation (or `@utility` blocks), so the gradient variants actually compile in consumer Tailwind. Add a test asserting the resolved utility class is present.
2. **Resolve the gradient question (V1/V6, G3)** — decide whether decorative fade survives at all. If it does: collapse it to a single opt-in `fade` axis with logical `start`/`end`/`both` values, freeing `variant` from the non-canonical taxonomy and making it RTL-correct. If it doesn't: remove it (a divider should mark a boundary, not dissolve).
3. **Tokenize the hairline (G2)** — `h-px`/`w-px` or a border-width token instead of `h-[1px]`.
4. **Add `asChild` coverage (F2)** — confirm passthrough, add test + story (`<hr>` and menu-item examples), document it.
5. **Close docs parity (J)** — put the corrected axis in the Props/Defaults table; refresh the example.
6. **Scope the label/inset slots (H)** — explicitly decide in/out for a text-divider slot and vertical-height default; ship or document the decision.

## Clean (rubric dims that pass)
- **V2 double-edge:** N/A — single hairline, no border+shadow conflict.
- **V3 gradient text / V5 emoji / V7 rounded-everything / V8 pill-spam:** none present.
- **V4 framework palette:** uses `--color-surface-border` semantic token, not raw `slate`/`indigo`. Good.
- **V9 fonts / V10-V15:** N/A for a divider; none present in source or stories.
- **E1–E8 verbal tells:** doc + JSDoc copy is direct and clean — no em-dash tic as connector (en-dashes used for ranges/labels are fine), no AI vocabulary, no hedging.
- **M1–M5 motion:** correctly static (see Motion gaps).
- **F5 base primitive:** correctly composes vendored Radix `SeparatorPrimitive.Root` rather than re-rolling a `<div>` — good.
- **F6 controlled/uncontrolled:** N/A (stateless).
- **G1 surface:** N/A — a hairline, not a surface; no surface-1 misuse.
- **H a11y core:** `decorative`/`role` handled correctly and tested (separator.test.tsx:25-34); `decorative={false}` → `role="separator"` verified.
- **I types:** properly typed via `ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>`, `forwardRef` + `displayName` present, `SeparatorProps` exported, no `any`.
- **Tests/stories exist:** conformance harness + targeted tests + 5 stories present (publish gate met).
