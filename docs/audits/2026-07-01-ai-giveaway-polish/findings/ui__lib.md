# ui/lib — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:3 P3:2

> **Scope note.** `ui/lib` is not a single component — it is the internal helpers/utilities directory
> for the `ui` layer. Contents:
> - **Renderers:** `bottom-sheet.tsx` (the only `.tsx` UI component). Internal-only — consumed by
>   `ui/popover.tsx` (responsive popover → sheet on mobile). NOT exported from the `ui` barrel; only
>   its **type** `BottomSheetProps` leaks through `lib/index.ts`.
> - **Utilities (no render output):** `motion.ts` (spring/tween tokens), `utils.ts` (`cn`), `slot.ts`
>   (Slot re-export), `link-context.tsx`, `icon-input.ts`, `normalize-icon.tsx`, `date-utils.ts`,
>   `keybinding.ts`, `check-tokens.ts`, `index.ts`.
>
> Visual-tell rubric dims (V1–V15, S1–S4) mostly N/A to the utilities — they emit no JSX. They DO
> apply to `bottom-sheet.tsx`. Motion (M1–M5) and types (I) apply broadly. The motion **tokens**
> defined here (`springs`, `tweens`) are the system every other component leans on, so they're
> audited as a source-of-truth, not as a rendered default.

## Findings

### [P1][G2] `bottom-sheet` uses raw `h-1` / `w-8` for the drag handle instead of DS spacing tokens
- **Category:** drift
- **Evidence:** `packages/core/src/ui/lib/bottom-sheet.tsx:82` — `<div className="h-1 w-8 rounded-pill bg-surface-border" />`
- **Why:** Bare `h-1`/`w-8` are raw Tailwind numeric utilities (4px / 32px), not `--spacing-ds-*`. The make-kit/CLAUDE rule is DS tokens for sizing; the test even asserts on `.h-1.w-8` as a structural hook, which freezes the raw value in. (Same raw `h-1` appears in stat-card's progress bar, so it's a family habit.)
- **Fix:** Use `h-ds-01 w-ds-05` (or whichever pair maps to 4/32px) so the handle scales with the token system; update the test to query by role/`data-` hook rather than the raw class so the size can change.

### [P2][M2] BottomSheet swipe-dismiss has no exit-motion differentiation; relies on AnimatePresence default
- **Category:** motion
- **Evidence:** `packages/core/src/ui/lib/bottom-sheet.tsx:71-74` — `initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={isReduced ? { duration: 0 } : springs.smooth}`
- **Why:** Enter and exit share one `springs.smooth` (M2 uniform timing). A sheet that the user *flung* down (high `velocity.y`) snaps shut with the same spring as a deliberate close — the gesture energy is discarded. Card-bar motion differentiates by distance/intent.
- **Fix:** Optional: feed the drag velocity into the exit transition (or use a faster `springs.snappy` on velocity-triggered dismiss). Low impact — acceptable to defer; flagged for completeness.

### [P2][H] BottomSheet has no `aria-modal` / focus-trap assertion and no `description`/labelledby path
- **Category:** a11y / state-coverage
- **Evidence:** `packages/core/src/ui/lib/bottom-sheet.tsx:60-64` — `<DialogPrimitive.Content forceMount asChild aria-label={title}>`; test only checks `getByRole('dialog')` + `aria-label`.
- **Why:** `title` is the only labeling path — there's no `aria-describedby` for body content, and the public `BottomSheetProps` (`bottom-sheet.tsx:10-21`) offers no `description` slot. The Radix Dialog primitive provides focus-trap/`aria-modal`, but nothing in the component or tests demonstrates focus return on close, Escape-to-close, or the no-title case (where `aria-label={undefined}` leaves the dialog unlabeled — an axe failure risk in real use even though the jsdom axe test passes because content is trivial).
- **Fix:** Either require `title` (type it non-optional) or fall back to a visually-hidden label; add a story/test for Escape-close + focus return. Document that an unlabeled sheet is invalid.

### [P2][docs/J] No per-component doc for BottomSheet and only `BottomSheetProps` (not the component) is exported
- **Category:** docs
- **Evidence:** `packages/core/src/ui/lib/index.ts:1` — `export type { BottomSheetProps } from './bottom-sheet'` (type-only); no `BottomSheet` value export anywhere in `ui` barrel; no `docs/components/**/bottom-sheet.md`.
- **Why:** A public **type** is exported for a component with no public **value** export and no doc. Consumers can reference `BottomSheetProps` but can't import `BottomSheet`. Either it's intentionally internal (then don't leak the type) or it's public (then export the component + write a doc + add it to the barrel). Right now it's a half-public surface — the exact drift the audit targets.
- **Fix:** Decide: internal → drop the `BottomSheetProps` re-export from `lib/index.ts`. Public → export `BottomSheet` from `ui/index.ts`, add a per-component doc + prop table, register in llms-full/make-kit.

### [P3][I] `motionProps()` erases types to `Record<string, unknown>` — a documented but lossy bridge
- **Category:** types
- **Evidence:** `packages/core/src/ui/lib/motion.ts:84-86` — `export function motionProps<T extends Record<string, unknown>>(props: T): Record<string, unknown> { return props }`
- **Why:** The generic `T` is accepted then discarded; callers lose prop types when spreading onto `motion.*`. The JSDoc explains *why* (Framer's overloaded event handlers genuinely clash), so this is a justified choice, not a tell — but it's still a type hole worth tracking. Used by Card's interactive path.
- **Fix:** Acceptable as-is given the rationale. Future: a precise `Omit<T, FramerConflictingHandlers> & MotionProps` mapped type would restore inference; low priority.

### [P3][M1] `springs.bouncy` ships overshoot (damping 15) as a named system token
- **Category:** motion
- **Evidence:** `packages/core/src/ui/lib/motion.ts:27` — `bouncy: { type: 'spring', stiffness: 400, damping: 15, mass: 0.5 }`
- **Why:** This is the M1 "bounce/elastic" easing — but it is **gated behind an explicit named preset** ("Toasts, pop-ins, celebration feedback") chosen deliberately by a caller, not a default. Per the rubric that makes it a choice, not a tell. Flagged only so synthesis can verify callers reach for `bouncy` *intentionally* (e.g. stat-card's delta-arrow pop) and not reflexively on every entrance. Not a defect in the token itself.
- **Fix:** None needed in `lib`. Audit the *callers* of `springs.bouncy` for reflexive use; the token's existence is correct.

## Composability gaps
- **BottomSheet is a flat prop component, not slot-based** (`bottom-sheet.tsx:10-21`). It takes `children` plus `dragHandle`/`swipeable`/`title` flags. For a single internal use that's fine, but it does not compose the vendored `Dialog` compound surface (Header/Title/Description/Footer) the way `Sheet`/`Dialog` do — so a `title` *prop* exists where `Dialog` would use a `<DialogTitle>` slot (F1/F4). If it ever goes public, it should compose the Dialog slots rather than re-roll `title` as a prop.
- **No `asChild` on BottomSheet** (F2) — but it's a portal/overlay, so polymorphism is not expected. Not a gap.
- `link-context.tsx` / `slot.ts` / `normalize-icon.tsx` are exactly the composability *primitives* (Slot re-export, polymorphic Link injection, unified icon normalizer) the rubric wants — these are the F-series done right. No gaps.

## Motion gaps
- BottomSheet **correctly** guards reduced-motion (`useReducedMotion()` → `{ duration: 0 }` transition AND disables drag, `bottom-sheet.tsx:32,74,75`). M3 clean.
- BottomSheet animates **transform `y` + opacity**, not layout props (M5 clean).
- M2: enter/exit share one spring; no velocity-aware exit (see P2 finding above).
- `motion.ts` provides a real duration scale (`durations`) and a `withReducedMotion()` helper — the system has the right primitives; the gap is only that `withReducedMotion()` is defined but BottomSheet inlines `{ duration: 0 }` instead of using it (minor inconsistency, not worth a finding).

## Polish plan (ordered steps to reach the finish bar)
1. **Resolve BottomSheet's public status** (P2 docs): if internal, stop exporting `BottomSheetProps`; if public, export the component, write the doc + prop table, register in llms-full/make-kit, and a11y-harden (require label, test Escape/focus-return).
2. **Tokenize the drag handle** (P1 G2): `h-1 w-8` → `--spacing-ds-*` pair; change the test hook off the raw class.
3. **Use `withReducedMotion()`** in BottomSheet instead of the inline `{ duration: 0 }` so the reduced-motion path goes through one helper (consistency with the rest of the system).
4. **(Optional) velocity-aware exit** (P2 M2): faster spring when dismissal is fling-triggered.
5. Leave `motionProps` and `springs.bouncy` as documented intentional choices; audit *callers* of `bouncy` separately.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. BottomSheet has a single top border (off-screen seam for a sheet sliding up) — not a card accent rail.
- **V2 double edge:** BottomSheet's `border-t` + `shadow-overlay` is a one-sided seam on an overlay, the standard sheet pattern, not a card border+shadow double-edge.
- **V3 gradient text / V4 framework palette / V5 emoji / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none in any file. All colors are semantic tokens (`bg-surface-overlay`, `bg-overlay`, `surface-border-strong`); radius is `rounded-t-overlay-lg` / `rounded-pill` (documented tokens); the `⌘` in `keybinding.ts` is a real modifier glyph, not decorative emoji.
- **G1 surface:** BottomSheet on `bg-surface-overlay` is correct (overlay → surface-1 family is explicitly allowed). `z-modal`, `--radius-overlay-lg` are the documented tokens (BottomSheet is named in the token comment).
- **G3 variant-axis drift:** N/A — utilities expose no variant axes; BottomSheet's booleans (`dragHandle`/`swipeable`) are behavior flags, not a mislabeled variant taxonomy.
- **E1–E8 verbal tells:** JSDoc and comments across `motion.ts`, `icon-input.ts`, `normalize-icon.tsx`, `utils.ts` are direct and technical — no em-dash tics-as-connector beyond legitimate punctuation, no AI vocabulary, no hedging, no chatbot artifacts. Stories/test copy ("Swipe down to dismiss") is plain.
- **M3 reduced-motion:** handled in BottomSheet.
- **I types:** `IconInput` is a precise discriminated union (no `any` in the exported type); `LinkComponent` is a precise forwardRef type; `cn`/`date-utils`/`keybinding` are fully typed. The only `any` is an internal, eslint-acknowledged cast in `normalize-icon.tsx:59`. No `React.FC`, no `color?: string`, no stringly-typed enums in exported surfaces.
- **Tests:** `motion.ts`, `date-utils.ts`, and `bottom-sheet.tsx` all have co-located tests; BottomSheet has an axe test + open/closed/drag-handle/aria coverage. Good for an internal helper dir.
