# ui/color-swatch — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

ColorSwatch is a small, mostly-clean decorative primitive. No accent rails, no gradient text, no glass/glow, no emoji, no AI vocabulary in source. The real gaps cluster around the `copyable` mode: it turns a 12–24px decorative span into an interactive button with no focus-visible ring, no reduced-motion concern, no error handling on the clipboard call, a sub-44px touch target, and re-rolled raw values in the "Copied!" toast. Plus a hard docs contradiction — the shipped doc declares the component "display-only / role=presentation, not interactive" and omits `copyable`/`checkerboard` from the props table, yet the source ships both.

## Findings

### [P1][J] Docs contradict the source — `copyable` + `checkerboard` undocumented, doc says "display-only / not interactive"
- **Category:** docs
- **Evidence:** `docs/components/ui/color-swatch.md:7-14` props table lists only `color/size/shape/ring`; line 27 `Interactive color picking: … ColorSwatch is display-only.`; line 32 `Renders role="presentation" — purely decorative, not interactive`. But source ships `copyable` (`color-swatch.tsx:38`) rendering a real `<button>` (`color-swatch.tsx:90-111`) and `checkerboard` (`color-swatch.tsx:39`). `llms-full.txt:1675-1700` has the identical gap.
- **Why:** Source is authoritative (rubric G/J + CLAUDE.md "source wins"); the doc actively misdescribes the component as never-interactive while it ships a clipboard button.
- **Fix:** Add `copyable` and `checkerboard` to both the `.md` and `llms-full.txt` prop tables; soften the "not interactive" lines to "decorative by default; pass `copyable` for a copy-to-clipboard button". Stories also lack a `Copyable`/`Checkerboard` story (publish-gate adjacent).

### [P1][H] `copyable` button has no `:focus-visible` ring and a sub-44px touch target
- **Category:** a11y / state-coverage
- **Evidence:** `color-swatch.tsx:90-111` — `<button>` whose only classes are `sharedClasses` (`inline-block shrink-0 relative` + `sizeMap` `h-3 w-3` / `h-4 w-4` / `h-6 w-6` + shape + optional ring). No `focus-visible:` utility, no `touch-target`. Largest size is `lg` = `h-6 w-6` (24px); `sm` = 12px.
- **Why:** Keyboard users get no visible focus indicator (rubric H: "focus ring removed without `:focus-visible` replacement"), and a 12–24px interactive target is well under the 44px minimum (H: "touch target < 44px on interactive").
- **Fix:** Add `focus-visible:focus-ring` (the DS focus-ring utility) to the copyable branch and a hit-area expansion (e.g. `before:absolute before:-inset-…` pseudo or the `touch-target` utility) so the clickable area meets 44px without bloating the visual swatch.

### [P1][H/state] Clipboard write has no error path — promise rejection swallowed, `navigator.clipboard` assumed present
- **Category:** state-coverage / a11y
- **Evidence:** `color-swatch.tsx:69-74` — `navigator.clipboard.writeText(color).then(() => { … })` with no `.catch`, and no guard for `navigator.clipboard` being `undefined` (insecure context / permissions-denied).
- **Why:** Violates the global rule "errors raised explicitly, never swallowed." In an insecure context or when the permission is denied the promise rejects → unhandled rejection, and the user gets no "Copied!" feedback and no failure feedback. On older/SSR-hydration edge cases `navigator.clipboard` can be undefined → throws on click.
- **Fix:** Guard `if (!navigator.clipboard) return` (or fall back), and add `.catch` that surfaces failure (e.g. don't flip `copied`, optionally an `onCopyError`/`onCopy(success)` callback). At minimum don't swallow.

### [P2][G2] Re-rolled raw values in the "Copied!" toast instead of DS tokens
- **Category:** drift
- **Evidence:** `color-swatch.tsx:103-108` — `className="… px-1.5 py-0.5 text-[10px] font-sans …"`. `text-[10px]` is exactly `--text-ds-xs` (`tokens/semantic.css:71` `--text-ds-xs: 0.625rem; /* 10px */`); `px-1.5 py-0.5` are raw Tailwind spacing, not `--spacing-ds-*`.
- **Why:** G2 token hygiene — arbitrary `text-[10px]` and non-`ds` spacing bypass the type/spacing scales the rest of the system binds to; drifts on a token change.
- **Fix:** `text-[10px]` → `text-ds-xs`; `px-1.5 py-0.5` → `px-ds-02 py-ds-01` (nearest cadence). `font-sans` is fine.

### [P2][M4] `copyable` press gives no feedback motion; "Copied!" appears/disappears with no transition
- **Category:** motion
- **Evidence:** `color-swatch.tsx:90-111` button has no `whileTap`/`active:` and no `transition`; the toast at `:102-109` is a bare conditional `{copied && (<span …>)}` — hard mount/unmount, no enter/exit.
- **Why:** M4 missing feedback motion — an interactive element with no press feedback, and an overlay that pops in/out with no entrance/exit reads unfinished against the Card/StatCard bar (StatCard animates its delta/value entrances).
- **Fix:** Add a subtle `active:scale-[0.97]` (or framer `whileTap`) on the button and a small fade/translate on the "Copied!" badge (AnimatePresence or a CSS transition), guarded by reduced-motion.

### [P2][M3] No reduced-motion consideration on the copyable interaction path
- **Category:** motion
- **Evidence:** Component imports no motion system; once feedback motion is added (above) there is no `prefers-reduced-motion` guard anywhere in `color-swatch.tsx`.
- **Why:** M3 — any motion added must respect reduced-motion. Currently moot only because there is zero motion; flagging so the M4 fix doesn't ship unguarded.
- **Fix:** Use the DS motion primitives (`motionProps`/MotionConfig) or `motion-reduce:` variants for any added feedback.

### [P2][F6] `copyable` has no `onCopy` callback / controlled feedback hook
- **Category:** composability
- **Evidence:** `color-swatch.tsx:69-74` — copy success only flips internal `copied` state; no `onCopy?(color)` prop, no way for a consumer to react (toast, analytics) or to override the inline "Copied!" affordance.
- **Why:** F6-adjacent — interactive behavior with no escape hatch; consumers wanting their own confirmation UX must re-implement.
- **Fix:** Add optional `onCopy?: (color: string) => void` fired on success (and the error path from the P1 above).

### [P3][types] `props` cast across element types instead of a discriminated prop surface
- **Category:** types
- **Evidence:** `color-swatch.tsx:27` `ColorSwatchProps extends React.HTMLAttributes<HTMLSpanElement>`, then `:99` `{...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}` and `:94` `ref as React.Ref<HTMLButtonElement>`. When `copyable`, the public type still says span attrs.
- **Why:** Minor type smell — the rendered element flips span↔button but the prop type doesn't; `button`-only attributes aren't surfaced and the cast is unchecked.
- **Fix:** Acceptable for a tiny primitive; if tightening, narrow via a union (`copyable extends button attrs`) or document that `copyable` accepts button attrs. Low priority.

### [P3][docs] Default story / examples use raw Tailwind palette hexes (exempt as swatch demos — note only)
- **Category:** docs
- **Evidence:** `color-swatch.stories.tsx:20` `color: '#6366F1'` (indigo — the canonical AI-tell hue), `:58-70` `BrandColors` grid of raw palette hexes labeled "Indigo/Violet/…".
- **Why:** Per rubric these are **legitimate color-swatch demos** (explicitly exempted) — a color swatch must show literal colors, and `#6366F1` here is demo data, not a brand/accent default. NOT a V4 tell. Flagged only so synthesis doesn't double-count it.
- **Fix:** None required. Optionally vary the default-story hex off `#6366F1` to avoid the visual association, but not necessary.

## Composability gaps
- No `onCopy` callback for the `copyable` mode (F6) — consumers can't hook success/failure.
- `copyable`/`checkerboard` are boolean feature-flags on a flat prop surface; fine at this size (well under the 8-prop compound threshold), no compound restructure warranted.
- No `asChild` — correct: this is a leaf decorative element, not a polymorphic wrapper. Not a gap.
- Does not compose a base primitive, but there is no surface/card primitive to compose here — it's a true leaf. Not an F5 violation.

## Motion gaps
- M4: copyable button has no press feedback; "Copied!" badge mounts/unmounts with no enter/exit transition.
- M3: no reduced-motion guard (currently moot — zero motion — but must be added alongside any feedback motion).
- No M1/M2/M5 issues (no bounce-by-default, no layout-prop animation; component is static by default which is appropriate for a decorative swatch).

## Polish plan (ordered steps to reach the finish bar)
1. **Docs parity (P1):** add `copyable` + `checkerboard` to `color-swatch.md` and `llms-full.txt` prop tables; remove the false "display-only / not interactive" claim; add `Copyable` and `Checkerboard` stories.
2. **A11y on copyable (P1):** add `focus-visible:focus-ring` and a 44px hit area (`touch-target` or pseudo-element inset) to the button branch.
3. **Error handling (P1):** guard `navigator.clipboard`, add `.catch`, don't swallow failure; add optional `onCopy(color)` callback (F6).
4. **Token hygiene (P2):** `text-[10px]`→`text-ds-xs`, `px-1.5 py-0.5`→`px-ds-02 py-ds-01` in the "Copied!" toast.
5. **Feedback motion (P2):** add `active:`/`whileTap` press feedback + a fade/translate on the "Copied!" badge, all reduced-motion-guarded (M3/M4).

## Clean (rubric dims that pass)
- V1 accent rail — none. V2 double-edge — none (ring is shadow-ring-sm only, no border+shadow combo). V3 gradient text — none. V4 framework palette as brand — none in source (story hexes are exempt demos). V5 emoji — none. V6 blob/glass/glow — none. V7 rounded-everything — uses `rounded-pill`/`rounded-none`/`rounded-control-inner` from the radius vocabulary. V8 pill spam — none.
- V9–V15 visual reflexes — none (uses `font-sans`/DS tokens; no kicker, hero, all-caps, decorative numbering).
- E1–E8 verbal tells — JSDoc and doc prose are clean and direct (no em-dash-as-connector beyond legit usage, no AI vocabulary, no hedging).
- G1 surface — n/a (decorative leaf, no card surface). G3 variant axes — `size` (sm/md/lg) and `shape` (circle/square/rounded) are on-taxonomy; `color` here is intentionally a free CSS string (documented), not an enum-axis violation.
- I types — `forwardRef` + `displayName` present, specific element refs (`HTMLSpanElement`), no `any`, no `React.FC`, props exported.
- Cleanup timer on unmount is correct (`:45-46`).
