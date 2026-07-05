# ui/popover — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:3 P3:1

## Findings

### [P1][M3] No reduced-motion guard on the desktop scale animation
- **Category:** motion
- **Evidence:** popover.tsx:84-87 — `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ ...springs.snappy, opacity: tweens.fade }}`
- **Why:** The desktop content path animates a transform with no `prefers-reduced-motion` handling. The mobile `BottomSheet` path *does* guard (`useReducedMotion` → `{ duration: 0 }`, drag disabled), so reduced-motion users get a clean sheet on mobile but a scale-pop on desktop — inconsistent and a rubric M3 default-ships gap. (Family-wide: DropdownMenu and HoverCard share the same unguarded pattern, so the fix should be lifted to a shared overlay-motion helper, not pasted per-file.)
- **Fix:** Call `useReducedMotion()` and collapse to `{ duration: 0 }` (or skip the scale, keep opacity) when reduced — mirror what `BottomSheet` already does. Ideally extract a `useOverlayMotion()` returning the initial/animate/exit/transition so Popover/DropdownMenu/HoverCard stay in sync.

### [P1][F1] Mobile path hardcodes `title="Options"` — bespoke string baked into the component
- **Category:** composability / a11y
- **Evidence:** popover.tsx:60-64 — `<BottomSheet open={open} onOpenChange={...} title="Options" className={className}>`
- **Why:** On mobile, `PopoverContent` silently swaps to a `BottomSheet` whose accessible label is the literal string `"Options"` for *every* popover — a width picker, an info blurb, a form. `BottomSheet.title` sets the dialog's `aria-label`, so the mobile screen-reader name is wrong/generic and there is no prop to override it. It's a hardcoded English string (also an i18n + a11y defect) injected at a fixed slot rather than threaded from the consumer.
- **Fix:** Add an optional prop (e.g. `mobileTitle?: string` or reuse an `aria-label`/`title` already passed) and forward it to `BottomSheet.title`; fall back to `undefined` (BottomSheet already tolerates no title) rather than a fabricated `"Options"`.

### [P1][I] `Popover` root typed as `React.FC`
- **Category:** types
- **Evidence:** popover.tsx:16 — `const Popover: React.FC<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>> = ({ ... })`
- **Why:** Rubric I explicitly flags `React.FC`. Card/StatCard and the rest of the finished set use `forwardRef` + explicit prop interfaces. `React.FC` here also bakes in an implicit `children` and blocks ref forwarding on the root (minor, since Root is contextual, but it's the flagged anti-pattern and a vocabulary mismatch with the family).
- **Fix:** Type it as a plain function component with an explicit props type: `function Popover(props: PopoverProps)` or `(props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => …`, dropping `React.FC`.

### [P2][H] Mobile drawer-swap is undocumented behavior change with no exposed control
- **Category:** state-coverage / docs
- **Evidence:** popover.tsx:55-69 — `const isMobileRaw = useIsMobile(); if (isMobileRaw) { return <BottomSheet …> }`; doc popover.md has no mention of the mobile bottom-sheet behavior at all.
- **Why:** A consumer-invisible responsive fork: below the mobile breakpoint, alignment/side/sideOffset/anchor are all dropped and the thing becomes a swipe-dismiss drawer. There's no opt-out, no story asserting it (the `MobileDrawer` story exists but has no `play` assertion), and the doc's positioning section ("accepts `side`, `align`, `sideOffset`…") is silently false on mobile. State matrix: the mobile path is shipped but neither documented nor test-covered.
- **Fix:** Document the responsive swap in popover.md (and the dropped positioning props); consider a `disableMobileSheet`/`responsive={false}` escape hatch; add a play-test or note for the mobile branch.

### [P2][M2/M4] Trigger has no press/hover feedback motion of its own; exit reuses the same spring as enter
- **Category:** motion
- **Evidence:** popover.tsx:47 — `const PopoverTrigger = PopoverPrimitive.Trigger` (bare re-export); popover.tsx:84-87 enter and exit both use `springs.snappy` + `tweens.fade`.
- **Why:** Minor. Trigger feedback is delegated to whatever `asChild` element is passed (usually Button, which has its own motion), so this is acceptable — noting it for completeness. Enter==exit timing is the rubric's M2 "no enter/exit differentiation," but for a small overlay a symmetric snap is a defensible choice, so this is low-severity.
- **Fix:** Optional — give exit a slightly faster tween if differentiation is wanted; otherwise leave as a deliberate choice.

### [P2][J] Doc prop table is thin and the changelog version stamp may be stale vs. mobile behavior
- **Category:** docs
- **Evidence:** popover.md:21-31 — Composability/Gotchas prose only, no structured prop table for `PopoverContent` (`align`, `sideOffset`, `className`) and no mention of the mobile `BottomSheet` fork or `useIsMobile` dependency. `PopoverContentProps` is exported (popover.tsx:103) but undocumented beyond a one-line changelog entry.
- **Why:** Falls short of the Card bar's doc parity — the mobile responsive behavior is a material API characteristic that's entirely absent from docs.
- **Fix:** Add a short prop/behavior table and a "Responsive" section describing the mobile drawer swap.

### [P3][V/structural] Default `w-72` fixed width is an opinionated default
- **Category:** visual-tell (weak)
- **Evidence:** popover.tsx:89 — `'z-popover w-72 rounded-overlay bg-surface-overlay p-ds-05 text-surface-fg shadow-floating outline-hidden'`
- **Why:** Not an AI tell — `w-72` is a reasonable, overridable default (consumers pass `className="w-60"` as the stories show). Flagging only because it's a magic Tailwind width rather than a `--spacing-ds-*`/sizing token; consistent-enough with HoverCard's `w-64`. No action required unless the family standardizes overlay widths on a token.
- **Fix:** Optional — none needed; could move to a sizing token if the overlay family gets a width scale.

## Composability gaps
- **Hardcoded `title="Options"`** on the mobile BottomSheet (popover.tsx:62) — a fixed string injected at a slot the consumer can't reach. Should be a forwarded prop.
- **No escape hatch for the mobile drawer swap** — `useIsMobile()` unconditionally rewrites the render tree below the breakpoint with no `responsive={false}` opt-out.
- **Otherwise composes correctly:** Trigger/Anchor are clean re-exports of the Radix primitives (does NOT re-roll positioning), `asChild` flows through the primitive, and `className` merges via `cn` onto the content. Controlled/uncontrolled is handled properly (F6 clean): `open` + `defaultOpen` + `onOpenChange` with an internal uncontrolled fallback (popover.tsx:22-32). No bespoke corner-props, no flat-prop bloat. Good.

## Motion gaps
- **M3:** Desktop scale animation (popover.tsx:84-87) has no reduced-motion guard, while the mobile path does — inconsistent. Fix should be a shared overlay-motion helper (DropdownMenu + HoverCard have the identical unguarded pattern).
- **M2:** Enter and exit share `springs.snappy`/`tweens.fade` (no differentiation) — low severity, defensible for a small overlay.
- **Clean:** Uses `springs.snappy` (stiffness 500, damping 30 — critically damped, NO overshoot) so there's no bounce-by-default (M1 clean). Animates `opacity` + `scale` (transform) only, never layout props (M5 clean). Has entrance AND exit via `AnimatePresence` + `forceMount` (M4 overlay-feedback present).

## Polish plan (ordered steps to reach the finish bar)
1. **Reduced-motion (M3):** Add `useReducedMotion()` to `PopoverContent`'s desktop path; collapse scale/transition to `{ duration: 0 }` when reduced. Best done by extracting a shared `useOverlayMotion()` helper and adopting it in Popover, DropdownMenu, HoverCard so the family stays in lockstep.
2. **Mobile title (F1/a11y):** Replace the literal `title="Options"` with a forwarded prop (or a passed `aria-label`), defaulting to `undefined`.
3. **Drop `React.FC` (I):** Retype `Popover` as a plain function component with an explicit props interface; export the props type.
4. **Docs (J/H):** Add a prop/behavior table to popover.md and a "Responsive" section documenting the mobile bottom-sheet swap and the positioning props it drops; optionally add a `responsive={false}` escape hatch and a play-test for the mobile branch.

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no gradient text, no double-edge (single `shadow-floating`, no border), uses semantic tokens (`bg-surface-overlay`, `rounded-overlay`) not raw indigo/slate, no emoji, no rounded-everything (single `rounded-overlay` vocabulary), no pill spam.
- **G1 surface:** correct — overlay uses `bg-surface-overlay` (the layering rule explicitly assigns Popover to surface-1/overlay; matches DropdownMenu/HoverCard).
- **G2 tokens:** `--spacing-ds-*` (`p-ds-05`), `rounded-overlay`, `shadow-floating`, `z-popover` — all real semantic tokens, no dead TW3 syntax, no hardcoded hex/px shadows.
- **G3/G4 vocabulary:** overlay vocabulary (`rounded-overlay` + `bg-surface-overlay` + `shadow-floating` + `z-popover`) is identical across Popover/DropdownMenu/HoverCard — family consistent.
- **F6 controlled/uncontrolled:** fully handled (open + defaultOpen + onOpenChange + internal state).
- **E verbal tells:** doc/stories/JSDoc clean — no em-dash tic abuse, no AI vocabulary, no meta-hedging, no emoji.
- **H state coverage:** open/closed, controlled, keyboard (Escape closes per story), axe-clean test present; mobile branch is the only under-covered state.
- **Tests + stories present** (publish-gate satisfied): popover.test.tsx (8 tests incl. axe) and popover.stories.tsx (5 stories).
