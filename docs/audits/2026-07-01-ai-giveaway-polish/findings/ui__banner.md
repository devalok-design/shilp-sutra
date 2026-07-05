# ui/banner — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

Banner is mostly clean of the loud visual AI tells — no accent rail, no gradient text, no
default-framework palette (it binds to semantic `info/success/warning/error/neutral` step
tokens), no emoji, no glass/blob. The gaps are in motion correctness, composability (bespoke
slot props rather than a slot-based compound, no `asChild`), a11y (`role="alert"` hardcoded
for non-urgent default, sub-44px touch target), and a real source↔story drift (the story
still uses the `action` prop removed in v0.38.0).

## Findings

### [P1][M5] Banner animates `height` (a layout prop) on enter/exit
- **Category:** motion
- **Evidence:** banner.tsx:95-96 — `initial={{ height: 'auto', opacity: 1 }}` / `exit={{ height: 0, opacity: 0 }}`
- **Why:** Animating `height` triggers layout/reflow every frame (janky), and `height: 'auto'` is not animatable by the compositor — rubric M5 says use transform+opacity or framer's `layout` prop. The sibling Alert correctly animates only `opacity` + `y` (alert.tsx:134-136).
- **Fix:** Drop the height animation; animate `opacity` + a small `y`/`scaleY` like Alert, or wrap the collapse in framer's `layout`/`AnimatePresence` with a measured-height variant. If a true height collapse is wanted, use `springs.gentle` (the documented collapse/expand spring) and accept it's a deliberate exception — but default should not animate raw `height`.

### [P1][M3] No reduced-motion guard on the enter/exit animation
- **Category:** motion
- **Evidence:** banner.tsx:93-98 — `<motion.div ... transition={springs.snappy}>` with no `useReducedMotion()` / `withReducedMotion()` and no `MotionConfig` in the tree.
- **Why:** Rubric M3 — animation with no `prefers-reduced-motion` respect. The repo ships a `withReducedMotion()` helper (lib/motion.ts:58) that this component ignores. A user with reduced-motion set still gets the spring height/opacity collapse.
- **Fix:** Read `useReducedMotion()` and pass `withReducedMotion(springs.snappy)` (or `duration: 0`) when set; or rely on a `MotionConfig reducedMotion="user"` wrapper if the system standardizes on one. Same gap exists on Alert — fix as a pair.

### [P1][F1/F4] Bespoke `actions` + `onDismiss` corner props instead of a slot-based compound
- **Category:** composability
- **Evidence:** banner.tsx:76-79 (`actions?: React.ReactNode`, `onDismiss?`) and the hardcoded layout banner.tsx:102-117 (Icon → children → actions → dismiss button in fixed order)
- **Why:** Rubric F1/F4 — content is injected into fixed regions via props rather than composed children. Card was given `CardAction` slots and `CardHeader/Content/Footer` for exactly this. Banner has no `BannerIcon`/`BannerContent`/`BannerActions` slots, so a consumer can't reorder, can't supply a custom icon, can't replace the dismiss affordance. The icon is fully auto-selected from `color` with no override prop or slot.
- **Fix:** Offer slot sub-components (`Banner.Icon`, `Banner.Content`, `Banner.Actions`) or at minimum an `icon` override prop, while keeping the convenience `actions`/`onDismiss` props. Mirror Card's slot pattern so Banner composes rather than hard-codes its internal order.

### [P2][H/a11y] `role="alert"` hardcoded for every color including non-urgent `info`/`neutral` default
- **Category:** a11y
- **Evidence:** banner.tsx:99 — `role="alert"` unconditional; default `color = 'info'` (banner.tsx:82)
- **Why:** `role="alert"` is an assertive live region — it interrupts the screen-reader user immediately. That is wrong for an info/neutral "new version available" banner (the documented default use case, doc line 19/67). Assertive interruption should be reserved for `error`/`warning`. The doc even warns "don't stack multiple Banners" (banner.md:26) — a symptom of role=alert being too aggressive.
- **Fix:** Map role by color: `error`/`warning` → `role="alert"` (assertive); `info`/`success`/`neutral` → `role="status"` (polite) or a `role`/`aria-live` prop with a sensible default. Allow override via prop.

### [P2][H] Dismiss button touch target is 24px (`min-h-ds-xs` = 24px), below the 44px minimum
- **Category:** a11y
- **Evidence:** banner.tsx:111 — `min-h-ds-xs min-w-ds-xs` resolves to 24px (tokens/semantic.css:318 `--spacing-ds-xs: 24px`)
- **Why:** Rubric H — touch target < 44px on an interactive element. The hit area is 24×24, far under WCAG 2.5.5 / the 44px guidance.
- **Note:** This is a *family-wide* pattern (Dialog, Sheet, Alert all use `min-h-ds-xs` for the close button), so it's a shared convention rather than Banner-specific slop — but it still fails the bar. Flagging here; a system-level fix (bump the icon-dismiss hit area or add invisible padding) should cover all four. Lower severity because it's deliberate-consistent, not a reflex.
- **Fix:** Increase the dismiss hit area to ≥44px (e.g. `min-h-ds-sm`/`size-11` with negative margin to keep visual size), or use the project IconButton with its built-in touch-target utility. Coordinate across Dialog/Sheet/Alert/Banner.

### [P2][J] Story uses the `action` (singular) prop removed in v0.38.0 — source↔story drift
- **Category:** docs / drift
- **Evidence:** banner.stories.tsx:51 (`action: (<Button…>)`) and banner.stories.tsx:71 (`WithActionAndDismissible` → `action:`); `BannerProps` exposes only `actions` (banner.tsx:77). banner.md:37 records the removal as BREAKING in v0.38.0.
- **Why:** Rubric J — story doesn't match source. `action` is no longer a prop, so the `WithAction` and `WithActionAndDismissible` stories pass an unknown prop that is silently dropped (and should be a TS error under the typed `args`). Those stories render with NO action button — they're broken demos. `MultipleActions` (uses `actions`) is the only correct action story.
- **Fix:** Rename `action:` → `actions:` in both stories (banner.stories.tsx:51, :71). Consider folding `WithAction` into the `actions` form.

### [P3][H] Dismiss button has no `disabled`/`loading`/forced-colors state coverage and no test for keyboard focus
- **Category:** state-coverage
- **Evidence:** banner.tsx:108-117 — button has hover + focus-visible ring only; no forced-colors fallback for the `hover:bg-current/10` tint; test (banner.test.tsx) covers click + presence but not keyboard activation or focus-visible.
- **Why:** Rubric H — incomplete state matrix. `hover:bg-current/10` disappears in forced-colors mode (no `forced-colors:` fallback), and there's no story/test demonstrating focus-visible or RTL.
- **Fix:** Add a `forced-colors:` outline fallback on hover; add a keyboard-activation test and a focus-visible story.

### [P3][docs] JSDoc + story copy carry mild filler tics
- **Category:** verbal-tell
- **Evidence:** banner.tsx:71 — `// These are just a few ways — feel free to combine props creatively!` (also in card.tsx/stat-card.tsx); the `—` em-dash as connector appears throughout the JSDoc (E1).
- **Why:** Rubric E1 (em-dash connector) and E5 (engagement-bait closer "feel free to combine props creatively!"). Low impact (JSDoc, not shipped UI copy) and it's a repo-wide pattern, but it's the AI-comment tell.
- **Fix:** Drop the "feel free to combine props creatively!" closer from the JSDoc template across components; this is a synthesis-level cleanup, not Banner-only.

## Composability gaps
- No slot-based compound (`Banner.Icon` / `Banner.Content` / `Banner.Actions`) — layout order is hardcoded (banner.tsx:102-117). Card has slots; Banner does not. (F1/F4)
- No way to override the auto-selected icon — `BANNER_ICONS[color]` is the only path (banner.tsx:83). No `icon` prop or icon slot. (F1)
- No `asChild`/polymorphism — fine for a region, low priority. (F2)
- Controlled/uncontrolled dismissal: visibility is internal-only (`useState(true)`, banner.tsx:84). No `open`/`defaultOpen` + `onOpenChange` — a consumer can't control or re-show the banner without remounting. (F6)
- Does not compose a base primitive, but Banner is a leaf region so F5 doesn't strictly apply; the `bg/border/text` color logic is duplicated verbatim from Alert's `subtle` compoundVariants (banner.tsx:16-27 vs alert.tsx:36-40) — extract a shared semantic-intent token map to avoid drift.

## Motion gaps
- Animates `height` (layout prop) — M5. (banner.tsx:95-96)
- No reduced-motion guard — M3. (banner.tsx:97)
- `springs.snappy` (stiffness 500, damping 30) is fine for micro-interaction but is being used for a full-width collapse where `springs.gentle` is the documented choice (lib/motion.ts:29) — minor M2 timing mismatch.
- Action buttons get a hover transition (`[&_button:hover]:bg-current/10`, banner.tsx:105) but the entrance has no per-element feedback differentiation — acceptable for a banner.

## Polish plan (ordered steps to reach the finish bar)
1. **Motion correctness:** replace the `height: auto → 0` exit with opacity + `y`/`scaleY` (match Alert) or framer `layout`; add `useReducedMotion()` → `withReducedMotion(...)`. (M5, M3)
2. **Fix the broken stories:** rename `action:` → `actions:` in `WithAction` and `WithActionAndDismissible`. (J)
3. **a11y role:** map `role` by color — `status`/polite for info/success/neutral, `alert`/assertive for warning/error; allow override. (H)
4. **Touch target:** bump the dismiss hit area to ≥44px (coordinate the fix with Dialog/Sheet/Alert). Add forced-colors hover fallback. (H)
5. **Composability:** add `Banner.Icon`/`Banner.Content`/`Banner.Actions` slots and an `icon` override prop, keeping the convenience props; consider controlled `open`/`onOpenChange`. (F1/F4/F6)
6. **De-dup intent colors:** extract the shared `info/success/warning/error/neutral` step-3/7/11 map used by both Alert and Banner into one source. (drift)
7. **Tests/stories:** add keyboard-activation + focus-visible + reduced-motion + RTL coverage; add a doc note that role varies by color.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. Banner uses a full `border-b` in the semantic color, not a left/top accent stripe.
- **V2 double edge:** single `border-b`, no shadow — edge-only, correct.
- **V3 gradient text:** none.
- **V4 framework palette:** binds to semantic `info/success/warning/error/neutral` step tokens (banner.tsx:16-27), not raw `indigo/slate`.
- **V5 emoji:** none — uses Tabler icons via the Icon API (banner.tsx:33-39).
- **V6 blob/glass/glow:** none.
- **V7 rounded-everything:** Banner has no radius (full-width strip); dismiss uses `rounded-control-inner` token. Clean.
- **V8 pill spam / V9–V15:** none.
- **G2 tokens:** spacing/duration/easing all use `ds-*` and `duration-*`/`ease-*` tokens; no raw px/hex/dead-TW4 classes. Focus ring uses the canonical `focus-visible:ring-2 ring-accent-9`.
- **G3 variant-axis:** uses canonical `color` axis with canonical member names. No `variant`-baked-in primary/secondary, no `filled`.
- **I types:** `forwardRef` + `displayName` present; `BannerProps` extends `Omit<HTMLAttributes,'color'>` + `VariantProps`; no `any` in the public surface (the `any` in `BANNER_ICONS` value type is internal). Ref typed to `HTMLDivElement`.
- **Tests exist** and cover role, children, dismiss presence/absence, dismiss behavior, actions slot, plus `describeConformance` across all five colors.
