# ui/hover-card — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:3 P3:2

## Findings

### [P1][I] `React.FC` on the HoverCard root + missing forwardRef
- **Category:** types
- **Evidence:** hover-card.tsx:21 — `const HoverCard: React.FC<React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root>> = ({`
- **Why:** Rubric I explicitly bans `React.FC` in exported components; it also blocks ref forwarding to the root and leaks an implicit `children` type. The exemplars (Card.tsx:120, StatCard.tsx:206) use `React.forwardRef` + `displayName`. Root here gets a `displayName` (line 45) but no ref.
- **Fix:** Drop `React.FC`. The Radix Root takes no DOM node so a ref isn't strictly required, but at minimum type it as a plain function component returning `React.JSX.Element` with an explicit props interface, matching the dialog/popover sibling pattern rather than `React.FC`.

### [P2][M3] No local reduced-motion guard on the enter/exit scale animation
- **Category:** motion
- **Evidence:** hover-card.tsx:68-71 — `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ ...springs.snappy, opacity: tweens.fade }}`
- **Why:** Reduced-motion is only honored if the consumer wraps the tree in `MotionProvider` / `MotionConfig` (motion-provider.tsx:39). framer-motion's `reducedMotion="user"` is NOT on by default — a consumer who renders HoverCard without the provider gets the scale animation regardless of OS preference. Card's `interactive` lift has the same dependency, so this is a family-wide pattern, but it's still a default-rendering gap per rubric M3.
- **Fix:** Either gate the `scale` transform behind `useReducedMotion()` locally (keep opacity-only fade when reduced), or document that MotionProvider is required for reduced-motion compliance. Prefer the local guard so the component is correct standalone.

### [P2][H] Hover-only interaction with no built-in keyboard/touch affordance shipped
- **Category:** a11y / state-coverage
- **Evidence:** hover-card.tsx:14-20 JSDoc admits "pointer-only by design … Do NOT use for essential content"; doc hover-card.md:25 repeats it. Radix HoverCard does open on focus, but neither story nor test exercises focus-open, and there is no focus-visible styling on the content.
- **Why:** Rubric H wants focus-visible coverage and notes touch invisibility. The escape hatch is documented (good), but the state matrix is under-demonstrated — no focus, RTL, forced-colors, dark, or reduced-motion story/test.
- **Fix:** Add a focus-open story (Tab to trigger) and a forced-colors/dark snapshot. Confirm `outline-hidden` (line 73) doesn't strip a focus ring the content legitimately needs.

### [P2][J] Story/test coverage thin vs the Card bar
- **Category:** docs / state-coverage
- **Evidence:** hover-card.stories.tsx has a single `Default` story (lines 13-45); no Controlled, no placement/align/side, no openDelay/closeDelay, no dark/forced-colors variants. Card/StatCard ship multiple state stories.
- **Why:** Publish-gate parity. One story is the minimum, not the finish bar.
- **Fix:** Add Controlled, alignment/side, and delay stories; an interactive-content example (button inside content — the documented differentiator from Tooltip).

### [P3][G2] Hardcoded width `w-64` default on content
- **Category:** drift
- **Evidence:** hover-card.tsx:73 — `'z-popover w-64 rounded-overlay bg-surface-overlay p-ds-05 shadow-floating outline-hidden'`
- **Why:** `w-64` is a raw Tailwind spacing scale value, not a `--spacing-ds-*` token, baked as a default. It's overridable via `className` (both story and Radix examples do `w-80`), so it's a soft default, not a hard tell — but it's a non-tokenized magic width. Minor.
- **Fix:** Either accept it as a sensible default (documented) or move to a `--spacing-ds-*`-derived width. Low priority.

### [P3][docs] Doc uses `--` where an en/em dash was intended; "preview" copy is fine
- **Category:** verbal-tell
- **Evidence:** hover-card.stories.tsx:33 — `created and maintained by @vercel.` preceded by `--` (`The React Framework -- created`); doc hover-card.md:22,24 use `—` em-dashes as connectors ("a user card, link preview, product card — use HoverCard").
- **Why:** Rubric E1 flags `—` as a stylistic connector. The doc uses several em-dash connectors. Borderline — these are dense reference notes, not prose, and the dashes separate clauses functionally. Flagging for the synthesis pass to decide; not a clear tell.
- **Fix:** Optional: restructure the em-dash clauses in hover-card.md:22-24 into colons/parens if the house style bans connective em-dashes.

## Composability gaps
- **Clean on the big ones.** Controlled/uncontrolled is fully handled (hover-card.tsx:27-37 — `open`/`defaultOpen`/`onOpenChange`, uncontrolled state, `isControlled` guard) — no F6 gap. `asChild` is present on the trigger (it IS the Radix Trigger, line 47) and inside Content (line 64 forwards to `motion.div`). No bespoke corner-props; content is a free-form slot. This matches the Card composition model.
- Minor: the root being `React.FC` (not forwardRef) is the only structural soft-spot — see [P1][I].
- `HoverCardTrigger` is a bare re-export (line 47) so it has no `displayName` of its own; consistent with how Radix re-exports are done elsewhere, not a real gap.

## Motion gaps
- M1 (bounce-by-default): **Clean.** Uses `springs.snappy` (stiffness 500 / damping 30 — critically-damped, no overshoot) for scale, `tweens.fade` for opacity. No `backOut`/bouncy default on an overlay. Appropriate.
- M2 (uniform timing): **Clean.** Enter and exit both 0.95↔1 scale + fade; symmetric exit is intentional for an overlay.
- M3 (reduced-motion): **Gap** — see finding above. Only honored via consumer-side MotionProvider; no standalone guard.
- M4 (feedback motion): **Clean** — entrance/exit on the overlay present via AnimatePresence (lines 56-82, `forceMount` + portal).
- M5 (animating layout props): **Clean** — animates `opacity` + `scale` (transform), never width/height/top/left.

## Polish plan (ordered steps to reach the finish bar)
1. Replace `React.FC` on `HoverCard` root with an explicit function-component + props interface (matches popover/dialog siblings); keep `displayName`. (P1)
2. Add a local `useReducedMotion()` guard so the scale animation degrades to opacity-only (or no motion) without requiring consumer MotionProvider. (P2/M3)
3. Expand stories: Controlled, alignment/side, openDelay/closeDelay, interactive-content (button in content), dark + forced-colors. Add a focus-open story to demonstrate keyboard reachability. (P2)
4. Add tests for focus-open and reduced-motion (assert no scale transform applied under reduced). (P2)
5. Optional: tokenize the `w-64` default or document it as the intended default width. (P3)
6. Optional: review em-dash connectors in the doc against house verbal style. (P3)

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no double edge (single `shadow-floating`, no competing border — V2 clean), no gradient text, no indigo/violet/slate brand palette (uses `bg-surface-overlay`, `z-popover`, semantic tokens), no emoji icons, no blob/glass/glow, single `rounded-overlay` radius, no pill spam.
- **V9–V15 reflexes:** none — no hardcoded font, no decorative numbering, no eyebrow kicker, no all-caps, no hero, no AI imagery.
- **S1–S4 structural:** n/a (component, not a page).
- **G1 surface:** correct — overlay uses `bg-surface-overlay` (overlay tier per the MANDATORY layering rule), not `surface-1`/`surface-2`. Correct tier.
- **G2 tokens:** uses `rounded-overlay`, `shadow-floating`, `p-ds-05`, `z-popover`, `space-x-ds-*` in story — all DS tokens (one raw `w-64` default noted above).
- **G3 variant axes:** n/a — no CVA variants; passes through Radix `align`/`sideOffset`.
- **F6 controlled/uncontrolled:** fully covered.
- **Types (mostly):** `HoverCardContent` correctly uses `forwardRef` + `ElementRef`/`ComponentPropsWithoutRef`; `HoverCardContentProps` is exported (line 87). Only the root's `React.FC` is flagged.
- **a11y baseline:** axe-clean test present (test lines 103-114); honest pointer-only limitation documented in both source JSDoc and doc.
