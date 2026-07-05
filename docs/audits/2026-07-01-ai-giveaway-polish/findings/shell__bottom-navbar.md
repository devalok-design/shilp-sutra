# shell/bottom-navbar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

Overall: no hard AI tells. Reduced-motion is respected everywhere, tokens are mostly used, the active-indicator is a legitimate tab-underline (not a card accent rail), and it has a real test + story + doc. The gaps are Card-bar polish: a pile of hardcoded arbitrary pixel values, a backdrop that is a raw `<div onClick>` instead of composing the overlay/Sheet primitive, an ad-hoc "More" sheet re-rolling dialog semantics (focus trap, scroll lock, Escape), a dead `user` prop, and drift in the badge (raw `text-[10px]`, hand-rolled instead of composing `Badge`).

## Findings

### [P1][F5] "More" sheet re-rolls a Dialog/Sheet instead of composing the primitive
- **Category:** composability
- **Evidence:** bottom-navbar.tsx:172-231 — `<div className="fixed inset-0 z-overlay ..." onClick={...}>` + `<div className="absolute inset-0 bg-overlay" />` + a hand-built `<motion.div role="dialog" ...>` with manual Escape handling and a manual first-focusable focus effect (`useEffect` at :150-155).
- **Why:** The DS already ships Sheet/Dialog (Radix-vendored) with focus trap, scroll lock, Escape, `aria-modal`, return-focus, and portal. This re-rolls a subset of that by hand — no focus trap (tab can escape the open sheet), no scroll lock, no return-focus on close, and `role="dialog"` without `aria-modal`.
- **Fix:** Render the overflow menu as a bottom `<Sheet side="bottom">` (or Dialog) so it inherits the a11y + motion contract instead of duplicating it.

### [P1][H/a11y] Backdrop is a static `<div onClick>` — no keyboard dismiss, eslint-disabled
- **Category:** a11y
- **Evidence:** bottom-navbar.tsx:174-178 — `// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- backdrop overlay, dismiss via mouse only` then `<div className="fixed inset-0 z-overlay md:hidden" onClick={() => setShowMore(false)}>`.
- **Why:** The Escape handler lives on the *panel* (:191-194), which only fires while focus is inside the panel; there is no focus trap, so if focus leaves the panel there is no keyboard path to dismiss. Suppressing the a11y lint rule is the tell that the pattern is wrong, not that the rule is wrong.
- **Fix:** Composing Sheet/Dialog (see F5) removes the raw backdrop entirely and gives keyboard dismiss + trap for free.

### [P1][F1] Dead `user` prop — accepted, documented, never rendered
- **Category:** composability / types
- **Evidence:** bottom-navbar.tsx:46-47 (`user?: BottomNavbarUser | null`), destructured as `user: _user` at :134 (underscore = deliberately unused). JSDoc at :46 claims "used to determine admin status, presence" but nothing reads it. Story feeds `user`/`AssociateRole`/`NoUser (Hidden)` (stories :157-174) implying behavior that does not exist — `NoUser` renders identically to `Default`.
- **Why:** A prop that does nothing is API noise; the stories and JSDoc actively mislead consumers into thinking role gates visibility.
- **Fix:** Either remove `user`/`BottomNavbarUser` (breaking — changeset) or actually implement the presence/admin gating it documents. At minimum delete the misleading `NoUser (Hidden)` / `AssociateRole` stories.

### [P2][G2] NavBadge re-rolls Badge with raw values instead of composing it
- **Category:** drift / vocabulary
- **Evidence:** bottom-navbar.tsx:60-75 — `'absolute -right-1 -top-0.5 flex h-4 min-w-4 ... rounded-pill bg-error-9 text-[10px] font-semibold leading-none text-error-fg ...'`.
- **Why:** Raw `text-[10px]`, `h-4 min-w-4`, `-right-1 -top-0.5` are not DS tokens (no `--text-ds-*`, no `--spacing-ds-*`). The DS ships a Badge/BadgeIndicator; the doc even says "same as BadgeIndicator pattern" (bottom-navbar.md:40) yet doesn't use it.
- **Fix:** Compose `<Badge size="xs" color="error">` / BadgeIndicator, or at minimum swap raw values for ds tokens (`text-ds-xs`, `h-ds-*`).

### [P2][G2] Hardcoded arbitrary pixel values throughout
- **Category:** drift
- **Evidence:** `max-w-[70px]` (:93, :261), `h-16` (:100, :261), `h-[3px]` indicator (:110, :271), `bottom-[72px]` sheet offset (:189), badge `text-[10px]` / `-right-1 -top-0.5` (:68), `h-4 min-w-4` (:68).
- **Why:** `bottom-[72px]` is a magic number that must track the bar's `h-16` (64px) + safe-area; if the bar height changes the sheet detaches. None of these read from the spacing/size scale, so they drift independently of the token system.
- **Fix:** Derive the sheet offset from the bar height (share a constant or position relative to the nav), and move item height / indicator thickness / max-width onto size tokens.

### [P2][H] Touch target below 44px on the "More" close button
- **Category:** a11y
- **Evidence:** bottom-navbar.tsx:200-204 — close `<button className="flex h-ds-sm w-ds-sm items-center justify-center rounded-pill ...">`. `h-ds-sm`/`w-ds-sm` resolve to a small (~text-sm) box, well under the 44px touch minimum the rubric (H) calls for on a touch-first component.
- **Why:** This is an explicitly mobile/touch component; a sub-44px tap target is the highest-friction spot to under-size.
- **Fix:** Use a `min-h-touch`/`min-w-touch` (or the IconButton with its 44px target) for the close control.

### [P2][H/state-coverage] "More" toggle button is not a real toggle; overflow menu has no empty guard beyond count
- **Category:** state-coverage / a11y
- **Evidence:** bottom-navbar.tsx:253-257 — the More `<button>` has `aria-expanded={showMore}` but no `aria-haspopup="dialog"` / `aria-controls` tying it to the panel (which has no `id`). Also the sheet grid is hard-`grid-cols-4` (:208) regardless of item count, so 1–3 more-items render left-packed with dead columns.
- **Why:** SR users get "expanded/collapsed" with no announced relationship to what expands; small overflow sets look unbalanced.
- **Fix:** Add `aria-haspopup="dialog"` + `aria-controls` pointing at an `id` on the panel (Sheet handles this automatically); make the grid responsive to item count.

### [P2][M5] `layoutId` shared-element indicator can jump when list membership changes
- **Category:** motion
- **Evidence:** bottom-navbar.tsx:108-113 and :269-274 — both the primary-item indicator and the More-button indicator use `layoutId="bottom-nav-indicator"`. Only one is active at a time, so the underline animates across; but on `NoPrimaryItems` / route changes the shared element can slide from an unexpected origin.
- **Why:** Not a bounce/uniform-timing tell (timing + reduced-motion are correct), but the single shared `layoutId` across two independent regions is fragile. Minor.
- **Fix:** Acceptable as-is; if flicker appears, scope the layoutId or gate the animation on mount.

### [P3][G4] Surface vocabulary: bar uses `bg-surface-raised` (surface-2) as sticky chrome
- **Category:** vocabulary
- **Evidence:** bottom-navbar.tsx:239 — nav is `bg-surface-raised`; sheet is `bg-surface-overlay` (:189). The MANDATORY layering rule puts shell chrome / sticky headers on surface-1.
- **Why:** Looks like a layering violation but is **documented as intentional** — bottom-navbar.md:50-52 (v0.19.0) records the deliberate lift from `bg-surface-1` to `bg-surface-2` "for visual hierarchy above app background." Per the rubric this is a choice, not a tell. Noting only so a future audit doesn't re-flag it; ideally add the file to `SURFACE1_ALLOWLIST` with that comment (audit script not present in this tree to verify).
- **Fix:** None required; record the exception where the surface audit reads it.

### [P3][docs/J] Doc prop table is stale vs source
- **Category:** docs
- **Evidence:** bottom-navbar.md:14 types `icon` as `ReactNode`, but source uses `IconInput` (bottom-navbar.tsx:29). Doc lists `user` as a working prop (md:9, and "used to determine admin status") though it is inert (see F1 finding). Doc "Defaults: None" omits the `currentPath = '/'`, `primaryItems = []`, `moreItems = []` defaults (tsx:133-136).
- **Why:** Source wins; the table misstates the icon type and documents a no-op prop as functional.
- **Fix:** Sync the prop table: `icon: IconInput`, document the three defaults, and reconcile the `user` prop with whatever the F1 decision is.

## Composability gaps
- Overflow menu is a bespoke hand-rolled sheet (raw backdrop + `role="dialog"`) instead of composing Sheet/Dialog — loses focus trap, scroll lock, return-focus, `aria-modal`. (F5)
- NavBadge re-rolls Badge/BadgeIndicator with raw pixel values instead of composing the shipped primitive. (F1/F5)
- Dead `user` prop: bespoke prop accepted + documented but never rendered; no slot, no behavior. (F1)
- No `asChild` / render-prop for the item link beyond LinkContext — fine for this component (LinkProvider is the intended seam), so not flagged as F2.
- Item content is fixed (`icon` + `title` + `badge`) with no slot for trailing/leading custom content; acceptable for a constrained nav bar (F3 threshold not exceeded — 5 props).

## Motion gaps
- None severe. Reduced-motion is honored on every animated element (`useReducedMotion` gates whileTap, indicator spring, sheet slide, and sets `{ duration: 0 }`). Enter/exit differentiated via AnimatePresence on the sheet.
- The single shared `layoutId="bottom-nav-indicator"` spans two independent regions (primary items + More button); low-risk but can produce an unexpected slide origin on list changes. (M5, P2)
- No hover/press feedback on the overflow grid items beyond a bg color transition — acceptable (touch-first), but `transition-colors` with no duration token on the grid links (:215) vs the fast-02 used on primary links (:100) is a minor inconsistency.

## Polish plan (ordered steps to reach the finish bar)
1. Replace the hand-rolled overflow overlay (bottom-navbar.tsx:172-231) with `<Sheet side="bottom">` / Dialog — this deletes the raw backdrop, the manual focus `useEffect`, the manual Escape handler, and the eslint-disable in one move, and gives focus trap + scroll lock + return-focus + `aria-modal`.
2. Resolve the dead `user` prop: either remove `user`/`BottomNavbarUser` (breaking → changeset) or implement the documented admin/presence gating. Update/remove the `NoUser`/`AssociateRole` stories accordingly.
3. Compose Badge/BadgeIndicator for NavBadge; drop `text-[10px]`, `h-4 min-w-4`, `-right-1 -top-0.5` for tokens.
4. Detokenize the magic numbers: derive the sheet's bottom offset from the bar height instead of `bottom-[72px]`; move `h-16`, `h-[3px]`, `max-w-[70px]` onto size tokens.
5. Bump the close button to a ≥44px touch target (IconButton or `min-h-touch`).
6. Wire `aria-haspopup="dialog"` + `aria-controls`/`id` on the More button↔panel; make the overflow grid responsive to item count.
7. Sync the doc prop table (icon → `IconInput`, add defaults, reconcile `user`) and add the surface-2 exception comment where the surface audit reads it.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — the active indicator is a full-width `h-[3px]` top underline (tab pattern), not a colored corner/left rail on a card. Correct.
- **V2–V8 visual tells:** no double-edge (border-t on chrome is a single edge, no shadow), no gradient text, no raw indigo/violet (uses `accent-*`/`error-*` semantic tokens), no emoji icons (lucide/tabler via Icon API), no glass/blob/glow, one radius vocabulary, no pill spam.
- **V9–V15 reflexes:** uses `text-ds-*` type tokens, no decorative numbering/eyebrows/all-caps/hero.
- **E1–E8 verbal:** JSDoc + doc are direct and prose-clean; no em-dash tic, no AI vocabulary, no meta-hedging.
- **M1–M4 motion:** intentional springs from the shared motion lib, reduced-motion respected everywhere, entrance/exit differentiated.
- **I types:** `forwardRef` + `displayName` present, refs typed to `HTMLElement`, `IconInput` (not `ReactNode`) for icons, no `any`, exported prop interfaces.
- **H a11y (partial):** `aria-label` on nav + items, `aria-current="page"` on active item, `aria-label` on badge count, axe-clean test. (Gaps noted above are the deltas.)
- **Tests + stories exist:** real badge test with axe assertion; 10 stories covering active states, empty primary/more, badges.
