# ui/badge-indicator — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:1

BadgeIndicator is a positional notification overlay (dot / count) exported as `Badge.Indicator`.
It is genuinely clean on the headline AI tells — no accent rail, no gradient text, no double
edge, no emoji, no framework-palette colors, and it *does* respect reduced-motion. The gaps are
Card-bar finish gaps: bounce-by-default motion, raw px/text values instead of DS tokens, a color
axis that drifts from the Badge family, weak typing/ref story, an a11y announcement gap, and a
missing test + doc.

## Findings

### [P1][M1] Bounce/overshoot spring is the default entrance for a notification marker
- **Category:** motion
- **Evidence:** badge-indicator.tsx:61 — `transition={springs.bouncy}`
- **Why:** `springs.bouncy` (stiffness 400, damping 15) overshoots; rubric M1 flags bounce-by-default. The sibling Badge `dot` deliberately uses `springs.snappy` (badge.tsx:251), so this is also family-inconsistent — the same dot bounces in one component and snaps in the other.
- **Fix:** Default to `springs.snappy` to match Badge's dot. Reserve `bouncy` for a deliberate opt-in (e.g. a `celebrate` prop) if an overshoot ever carries meaning.

### [P1][G2] Hardcoded px / text-size values instead of DS tokens
- **Category:** drift
- **Evidence:** badge-indicator.tsx:67-68 — `dot ? 'h-2.5 w-2.5' : 'min-w-[18px] h-[18px] px-1 text-[11px] leading-none'`
- **Why:** `min-w-[18px]`, `h-[18px]`, `text-[11px]` are raw arbitrary values; rubric G2 wants `--spacing-ds-*` / `text-ds-*`. The Badge sibling sizes with `h-4`/`h-5`, `text-ds-xs`, `px-ds-*` (badge.tsx:58-62). A bare `px-1` and `text-[11px]` are exactly the off-scale values the token system exists to kill.
- **Fix:** Map to the scale — e.g. dot `h-2.5 w-2.5` → a `--spacing-ds` step; count → `h-ds-* min-w-ds-* px-ds-01 text-ds-xs`. If 18px/11px genuinely have no token, that is a gap to raise against the scale, not a reason to inline the literal.

### [P1][I] `color` prop typed off a local const, no exported type, no `size` axis
- **Category:** types
- **Evidence:** badge-indicator.tsx:28 — `color?: keyof typeof COLOR_CLASSES`; badge-indicator.tsx:16-22 (local `COLOR_CLASSES`)
- **Why:** The prop type is inferred from a private const rather than the shared `BadgeColor` exported by badge.tsx:338. Consumers can't name the type, and the indicator's palette silently drifts from Badge's. There is also no `size` axis — the marker is a single fixed size (rubric G3 canonical axes include `size`).
- **Fix:** Derive the indicator's color classes from Badge's `colorMap[...].solid`/`.solidFg` (single source of truth) and accept `color?: BadgeColor` (or a documented subset). Consider a small `size` axis (`sm`/`md`) for dense vs. roomy contexts.

### [P1][F5] Re-rolls a second color map instead of composing the family's source of truth
- **Category:** composability
- **Evidence:** badge-indicator.tsx:16-22 — `const COLOR_CLASSES = { error: 'bg-error-9 text-error-fg', ... }`
- **Why:** This duplicates the solid color rows already defined once in `colorMap` (badge.tsx:16-31). Two sources for the same `bg-error-9 / text-error-fg` pairing means they can drift — the StatCard lesson (F5) was exactly "compose the base, don't re-roll." The indicator legitimately does NOT need to render a `<Badge>` (different anatomy: absolute overlay vs. inline pill), but it should share the color tokens.
- **Fix:** Import/derive from Badge's `colorMap` so a color change propagates to both. Keep the positioning/shape local; only the color rows are duplicated.

### [P2][H] Count change has no `aria-live` and the marker has no SR semantics
- **Category:** a11y
- **Evidence:** badge-indicator.tsx:56-72 — the `motion.span` carries no `aria-live`, no `role`, no `aria-hidden`, no `aria-label`
- **Why:** A dynamic notification count is announced to nobody when it changes, and a screen reader otherwise reads a bare "3" floating next to the child with no context ("3 what?"). Rubric H: async/dynamic content with no `aria-live`. The dot variant has no text at all, so it's invisible to SR with no accessible name.
- **Fix:** Add `role="status"` + `aria-live="polite"` to the count span (or an offscreen label like "3 unread"). For `dot`, expose an optional `aria-label`/visually-hidden status text, or `aria-hidden` if it is purely decorative and the count lives elsewhere.

### [P2][J] No co-located test file
- **Category:** docs
- **Evidence:** no `packages/core/src/ui/badge-indicator.test.tsx` (Glob: none found); sibling `badge.tsx` has tests
- **Why:** CLAUDE.md treats tests/stories as a publish gate. The show/hide logic (`showZero`, `count > max` cap, `invisible`, `dot`) and the reduced-motion branch are untested.
- **Fix:** Add an RTL + vitest-axe test covering: hides at `count={0}`, shows with `showZero`, `99+` overflow cap, `dot` renders no text, `invisible` hides, and axe-clean.

### [P2][J] No per-component doc / prop table
- **Category:** docs
- **Evidence:** no file under `packages/core/docs/components/**/badge-indicator.md` (Glob: none found)
- **Why:** Rubric J: per-component doc missing. The prop surface (`max` default 99, `showZero`, `placement`, `dot`) is only discoverable from source + story.
- **Fix:** Add a doc (or confirm it is covered by autodocs + llms-full.txt) with the prop table and the dot-vs-count guidance.

### [P2][G3] Color axis omits `neutral`; default is `error`
- **Category:** vocabulary
- **Evidence:** badge-indicator.tsx:16-22 (`COLOR_CLASSES` = error/success/warning/accent/info); badge-indicator.tsx:40 — `color = 'error'`
- **Why:** Canonical color axis (rubric G3) is `accent/neutral/success/warning/error/info`. `neutral` is missing. `error` default is defensible for a notification badge, but the family taxonomy should still expose `neutral` for a non-semantic count.
- **Fix:** Add `neutral` to the map (reuse Badge's neutral solid). Keep `error` as the default if intentional, and document why.

### [P3][types] No `forwardRef` / ref forwarding
- **Category:** types
- **Evidence:** badge-indicator.tsx:36 — `export function BadgeIndicator(...)` (plain function, `displayName` set at :79 but no ref)
- **Why:** Card, StatCard, and Badge all `forwardRef`. A consumer can't get a ref to the wrapper span for positioning/measurement. Minor for an overlay wrapper, but inconsistent with the family.
- **Fix:** Wrap in `React.forwardRef<HTMLSpanElement, BadgeIndicatorProps>` and forward to the outer `span`.

## Composability gaps
- Re-rolls a private `COLOR_CLASSES` map that duplicates Badge's `colorMap` solid rows (F5) — share the source of truth.
- `color` typed off a local const instead of the exported `BadgeColor` (I) — not nameable by consumers, free to drift.
- No `size` axis — the marker is one fixed size; dense UIs can't shrink it without `className` overrides.
- No ref forwarding (P3) — out of step with the rest of the family.

## Motion gaps
- M1: `springs.bouncy` overshoot is the default entrance — should be `springs.snappy` to match Badge's dot and avoid bounce-by-default.
- M3 (clean): `useReducedMotion` is honored — reduced-motion branch drops the scale animation and only fades. Good.
- M4 (clean): entrance + exit are differentiated via `AnimatePresence` (mount/unmount). No hover/press motion needed — it is non-interactive.
- M5 (clean): animates `scale`/`opacity` (transform), not layout props.

## Polish plan (ordered steps to reach the finish bar)
1. Swap `springs.bouncy` → `springs.snappy` (M1); keep the reduced-motion branch.
2. Replace raw values (`min-w-[18px] h-[18px] text-[11px] px-1`, dot `h-2.5 w-2.5`) with DS tokens (G2); raise a scale gap if 18/11px have no token.
3. Derive color classes from Badge's `colorMap` and type `color?: BadgeColor`; add `neutral` (F5, I, G3).
4. Add `role="status"` + `aria-live="polite"` (or an offscreen label) to the count; give `dot` an accessible name or `aria-hidden` (H).
5. Convert to `forwardRef<HTMLSpanElement>` for family consistency (P3).
6. Add a co-located RTL + axe test and a per-component doc / prop table (J).
7. (Optional) add a `size` axis (`sm`/`md`).

## Clean (rubric dims that pass)
- V1 accent rail — none. V2 double edge — none (single `ring-2` ring, no border+shadow). V3 gradient text — none. V4 framework palette — uses semantic `*-9 / *-fg` tokens, no indigo/violet/slate. V5 emoji — none. V6 blob/glass/glow — none. V7 rounded-everything — `rounded-pill` is correct for a badge marker. V8 pill-badge spam — n/a.
- V9-V15 visual reflexes — `font-sans` is the DS token; no decorative numbering, eyebrow, hero, all-caps, or AI imagery.
- E1-E8 verbal tells — JSDoc/story copy is absent or terse and clean; no em-dash tic, AI vocabulary, or hedging.
- M3 reduced-motion, M5 transform-not-layout — handled correctly.
- Story coverage is good: Default, OverflowCap, DotIndicator, Colors, Placements, HidesZero demonstrate the state matrix.
