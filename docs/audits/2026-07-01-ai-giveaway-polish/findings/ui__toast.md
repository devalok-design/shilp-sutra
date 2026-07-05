# ui/toast — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:3 P2:4 P3:2

## Findings

### [P0][V1] Colored left accent rail on every typed toast — the exact tell Card killed
- **Category:** visual-tell
- **Evidence:** `packages/core/src/ui/toast.tsx:191-196` — `{/* Left accent bar */}` … `<div className={cn('w-1 shrink-0 rounded-l-overlay-sm', config.accentClass)} />` where `accentClass` is `bg-success-9 | bg-error-9 | bg-warning-9 | bg-info-9 | bg-accent-9` (config at `toast.tsx:47-92`). Same rail unconditionally on the upload toast: `toast.tsx:532-533` `{/* Left accent bar */}` `<div className={cn('w-1 shrink-0 rounded-l-overlay-sm', accentClass)} />`.
- **Why:** A colored 4px stripe down the edge of a rounded, shadowed floating surface is *the* single most recognizable AI giveaway (rubric V1) — and we already removed it from Card in v0.44.0. Toast is still shipping it as the default, type-signalling chrome on every success/error/warning/info/loading/upload toast.
- **Fix:** Kill the rail. Carry semantic type the way the rest of the system does after the Card rework: the status icon already encodes type via color (`iconClass: text-{color}-11`), and the timer bar already uses the type color (`timerBarClass: bg-{color}-9`). Drop the `accentClass`/rail entirely; if a stronger type cue is wanted, tint the surface (e.g. error → `bg-error-2` overlay wash) or weight the icon — emphasis via background/weight, not a stripe. Remove `accentClass` from `TOAST_TYPE_CONFIG`, the rail `<div>`s, and the `rounded-l-overlay-sm` round-tripping. Update the doc + test + llms-full lines that currently *advertise* the rail (see G1/J below).

### [P1][G2] Re-rolled raw px/size values instead of spacing/size tokens
- **Category:** drift
- **Evidence:** `toast.tsx:109` `h-[2px]` (timer bar height); `toast.tsx:211` `Spinner … className="h-4 w-4"`; `toast.tsx:231,239` `mt-0.5`; `toast.tsx:346` `className="… py-1"`; `toast.tsx:383` `h-3.5 w-3.5`; `toast.tsx:416` `gap-1`; `toast.tsx:432` `max-w-[60px]`; `toast.tsx:450,461` `h-3.5 w-3.5`; `toast.tsx:590` `max-h-[140px]`. The container/text spacing correctly uses `gap-ds-03`, `p-ds-04`, `mt-ds-03`, `text-ds-*` — so this is inconsistent within the same file.
- **Why:** Rubric G2 — hardcoded px/fractional Tailwind utilities instead of `--spacing-ds-*` / size tokens. Drift risk: these don't track the design-system scale and read as machine-emitted "whatever number looked right."
- **Fix:** Move to DS tokens where one exists (`gap-ds-01`/`gap-ds-02` for the `gap-1`; `py-ds-01` for `py-1`; size the spinner via `<Spinner size="xs">` rather than overriding `h-4 w-4`). For genuinely fixed micro-dimensions (2px timer bar, 140px scroll cap) leave them but consider a `--spacing-ds-*` value; at minimum stop mixing `mt-0.5` with `mt-ds-*` in the same text block (`toast.tsx:231,239,583`).

### [P1][I] `any` in the exported type-config map
- **Category:** types
- **Evidence:** `toast.tsx:47-54` — `icon: React.ForwardRefExoticComponent<any> | null` inside `TOAST_TYPE_CONFIG`. The Tabler icons have a precise prop type (`TablerIconsProps` / `Icon` component type) that's being widened to `any`.
- **Why:** Rubric I — `any` in component internals; loses prop checking on the icon component passed to `<Icon icon={StatusIcon} />`.
- **Fix:** Type it as the Tabler icon component type — e.g. `import type { Icon as TablerIcon } from '@tabler/icons-react'` and use `TablerIcon | null`, matching how `icon.tsx` / `IconInput` already type these.

### [P1][F4/F2] No composable surface; everything funnels through a fixed imperative-only API with bespoke option props
- **Category:** composability
- **Evidence:** `ToastContent` (`toast.tsx:129-277`) takes flat content props `title`, `description`, `action`, `cancel` and is **not exported as a composable JSX component** for normal use — the public path is imperative (`toast.success(msg, { action, cancel, description })`, `toast.tsx:638-657`). `action`/`cancel` are bespoke `{ label, onClick }` objects (`toast-types.ts:27-37,51-52`) rendered as fixed-corner `<button>`s with hand-rolled classes (`toast.tsx:248-265`) rather than accepting our `<Button>`/`<Link>` or a slot.
- **Why:** Rubric F2/F4 — the only escape hatch is `toast.custom` (fully bespoke). For the common "toast with a real Button action / a link / an icon" case there's no slot and no `asChild`; the action button re-implements button styling (`text-accent-11 underline-offset-2 hover:underline …`) instead of composing the Button primitive, so it drifts from Button's focus ring, sizing, and soft/outline vocabulary.
- **Fix:** Either (a) accept `React.ReactNode` for `action`/`cancel` so a consumer can pass `<Button size="sm" variant="soft">`, or (b) render the action through the Button primitive internally (`<Button variant="link" size="sm">`) so focus-ring/typography come from one source. Document `toast.custom` as the slot escape hatch (already there) but stop hand-rolling the default action button.

### [P2][M3] Framer-motion entrances have no per-component reduced-motion guard
- **Category:** motion
- **Evidence:** The timer bar correctly guards with `motion-safe:animate-timer-bar` (`toast.tsx:114`), but the icon/row entrances animate `scale`/`opacity`/`y`/`x`/`height` with no reduced-motion handling at the component level: `toast.tsx:205-208` `initial={{ opacity:0, scale:0.5 }} … transition={springs.bouncy}`; `toast.tsx:344-350` row `exit={{ opacity:0, x:-20, height:0 }}`. These rely entirely on a root `<MotionConfig reducedMotion>` being present in the consumer app, which is not guaranteed.
- **Why:** Rubric M3 — animation with no `prefers-reduced-motion` fallback at the unit. Card/StatCard lean on the same global, but the inconsistency (timer bar is guarded, the springs aren't) shows the guard is ad-hoc, not systematic.
- **Fix:** Gate the spring entrances behind `useReducedMotion()` (framer-motion) or the system's `withReducedMotion()` helper (`lib/motion.ts:58`), or document the hard requirement that `<Toaster />` consumers wrap the tree in `<MotionConfig reducedMotion="user">`. Prefer the former so the component is self-sufficient.

### [P2][M1] Bounce/overshoot on every typed-icon + file-complete entrance
- **Category:** motion
- **Evidence:** `springs.bouncy` (`lib/motion.ts:27` — `damping: 15`, genuine overshoot) is applied to the status-icon pop-in (`toast.tsx:219`), the upload success/error header icons (`toast.tsx:547,557`), and the per-file complete check (`toast.tsx:361`).
- **Why:** Rubric M1 — overshoot/bounce as a default entrance. This is *borderline*: `springs.bouncy` is a named, documented token ("Toasts, pop-ins, celebration feedback", `lib/motion.ts:26`), so it is a deliberate choice, not a raw reflex. But applying genuine overshoot to *routine* feedback (an info icon, every completed file row) is the convergent "everything springs in" feel. Flagging for review, not as a hard tell.
- **Fix:** Keep `bouncy` for genuinely celebratory moments (upload all-success); use the calmer `springs.snappy`/`tweens.fade` for routine status icons so overshoot stays meaningful. If kept as-is, that's a defensible brand call — confirm it's intentional.

### [P2][H] `toast.upload`'s self-managed dismiss timer can't pause on touch / has only mouse+focus pause
- **Category:** state-coverage
- **Evidence:** `ToastContent` and `UploadToastContent` pause on `onMouseEnter`/`onFocusCapture` only (`toast.tsx:186-188,526-529`). No pointer/touch handling, so on touch devices the auto-dismiss can't be held by the user the way hover holds it on desktop.
- **Why:** Rubric H (state coverage) — interaction state (pause-on-interest) is desktop-only. Minor, since toasts are transient by design, but it's an incomplete state.
- **Fix:** Add `onPointerEnter`/`onPointerLeave` (covers touch+mouse), or accept this as a known desktop-first limitation and note it.

### [P2][J/G1] Docs, test, and llms-full advertise the accent rail as an intended feature
- **Category:** docs
- **Evidence:** `docs/components/ui/toast.md:8-14` ("no accent bar", "green accent, check icon", … "interactive accent"); `toast.md:63` "Fixed Accent bar colors from step 7 to step 9"; `llms-full.txt:4533,4535,4651` ("colored left accent bar per type"); test name + assertion `toast.test.tsx:53` `'renders an error toast with accent bar and icon'` and `toast.test.tsx:67-69` asserting `.bg-error-9` rail exists.
- **Why:** Rubric J / G1 — the docs and tests *codify* the V1 tell as a contract, which is why it's survived. Removing the rail (V1) without updating these will fail the test and leave docs claiming a feature that's gone.
- **Fix:** When V1 is fixed, rewrite these references to describe type via icon+timer color instead of an accent bar, and replace the `.bg-error-9` rail assertion with one that checks the colored status icon / timer bar.

### [P3][G2] `z-[1]`-style and `opacity-30` magic on the timer bar are fine but undocumented
- **Category:** drift
- **Evidence:** `toast.tsx:113` timer bar `opacity-30`; no z-token needed here. Low impact — flagged only for completeness against G2's "raw numeric utility" lens.
- **Fix:** Optional: promote `opacity-30` to a semantic if a "decorative track" opacity token is ever introduced; otherwise leave.

### [P3][E] Doc copy is clean of AI verbal tells
- **Category:** verbal-tell
- **Evidence:** `docs/components/ui/toast.md` — direct, prescriptive ("DO NOT use useToast()"), no em-dash connectors as filler, no E3 vocabulary, no engagement bait. Listed here only to record it was checked.
- **Fix:** None.

## Composability gaps
- **No JSX-composable surface.** The toast body (`ToastContent`) is exported (for tests) but the public contract is imperative-only with flat option props; the only composition path is the all-or-nothing `toast.custom`. There's no middle ground (e.g. pass a `<Button>` as the action).
- **Action/cancel are bespoke `{label,onClick}` objects** that re-roll button styling instead of composing the Button/Link primitives — drift from the Button focus-ring/typography/soft-vs-outline vocabulary (F2).
- **Does not compose a base surface primitive.** It hand-rolls `bg-surface-overlay shadow-floating rounded-overlay-sm` (`toast.tsx:184,525`). This is *defensible* — a floating toast is a different surface from a Card, and the overlay surface/radius/shadow are all correct DS tokens (no G1) — so this is a much weaker F5 than StatCard's case. Noting, not strongly flagging.

## Motion gaps
- Spring entrances (`springs.bouncy`, `springs.snappy`) have no component-level reduced-motion guard; only the CSS timer bar is `motion-safe:`-gated (M3). Inconsistent.
- Overshoot (`springs.bouncy`, damping 15) applied to routine status icons and every completed file row, not just celebratory moments (M1) — borderline, since it's a named token.
- `UploadFileRow` animates `height: 0` on exit (`toast.tsx:349`) — animating a layout prop (M5). With `layout` on the same element this is the framer `layout`-driven path so it's mostly OK, but height animation is the more expensive choice vs collapsing via transform.
- Pause-on-interest is mouse+focus only, no pointer/touch (M4/H).

## Polish plan (ordered steps to reach the finish bar)
1. **Kill the accent rail (V1, P0).** Remove `accentClass` from `TOAST_TYPE_CONFIG` and the two rail `<div>`s (`toast.tsx:191-196`, `532-533`). Let the status icon (already type-colored) + timer bar carry type. Optionally add a subtle surface tint for error to preserve urgency.
2. **Fix the docs/test/llms contract (J).** Rewrite `toast.md:8-14,63`, `llms-full.txt:4533/4535/4651`, and `toast.test.tsx:53/67-69` to describe icon/timer-color type signalling, not a rail.
3. **Compose the action button (F2).** Render `action`/`cancel` through the Button primitive (or accept `ReactNode`) so focus-ring, sizing, and soft/outline vocabulary come from one source.
4. **Detokenize the raw px/fraction values (G2).** Map `gap-1`/`py-1`/`mt-0.5`/spinner `h-4 w-4`/`h-3.5 w-3.5` onto `--spacing-ds-*` and `<Spinner size>`; keep only genuinely-fixed micro dims.
5. **Type the icon config (I).** Replace `ForwardRefExoticComponent<any>` with the Tabler icon component type.
6. **Self-sufficient reduced-motion (M3).** Gate the spring entrances with `useReducedMotion`/`withReducedMotion`, or hard-document the `MotionConfig` requirement on `<Toaster />`.
7. **(Optional) Calm routine motion (M1).** Reserve `springs.bouncy` for celebratory states; use `snappy`/`fade` for routine status icons.
8. **(Optional) Touch pause (H).** Add `onPointerEnter/Leave` for touch-device pause-on-interest.

## Clean (rubric dims that pass)
- **G1 surface layering:** `bg-surface-overlay` is the correct surface for a floating overlay (overlay family per the MANDATORY layering rule). Not a misuse.
- **V2 double edge:** elevation-only (`shadow-floating`, no border) on the shipped toast — clean. (The CustomJSX *story* at `toast.stories.tsx:340` pairs border+shadow, but that's a consumer demo, not a shipped default.)
- **V3 gradient text / V4 framework palette:** none — colors are semantic step tokens (`success-9`, `error-11`, `accent-11`), not `indigo`/`violet`/`slate`.
- **V5 emoji icons:** none — uses Tabler icons via the `<Icon>` API throughout.
- **V6 blob/glass/glow / V7 rounded-everything:** none — single radius vocabulary (`rounded-overlay-sm`), no backdrop-blur, no glow shadows.
- **V8 pill spam / V10 decorative numbering / V12 eyebrow kickers / V14 all-caps:** none.
- **A11y baseline (H):** `role` switches `alert`/`status` by urgency, `aria-live` assertive/polite, `aria-atomic`, sr-only live region for upload counts, labelled retry/cancel buttons, `focus-visible:ring-2` on the action button, `touch-target` class on row buttons. Strong.
- **M5 timer bar:** uses CSS animation gated by `motion-safe:` and pauses via `animationPlayState` — correct.
- **E (verbal tells):** doc + JSDoc copy clean.
- **F6 controlled/uncontrolled:** N/A — imperative API; `toast.promise` correctly orchestrates loading→success/error in one id; self-dismiss timer is hover/focus-aware.
