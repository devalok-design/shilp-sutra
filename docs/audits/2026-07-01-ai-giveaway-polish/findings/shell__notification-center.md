# shell/notification-center — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:4 P3:2

Solid, well-structured shell component: props-driven, responsive (Popover↔Sheet), reduced-motion aware, keyboard-navigable, tested + storied + documented. It is NOT slop. But it falls short of the Card bar on three axes: (1) an off-canonical `variant` taxonomy on `NotificationAction`, (2) a decorative bell-wiggle that fires on every re-render (bounce-by-default reflex), and (3) a handful of raw values + non-composable internals (the `NotificationItem` row re-rolls surface/spacing instead of composing a base primitive, and the tier dot is a re-implementation of Badge/status-dot semantics).

---

## Findings

### [P1][G3] `NotificationAction.variant` uses an off-canonical taxonomy
- **Category:** vocabulary
- **Evidence:** notification-center.tsx:45-49 — `variant?: 'primary' | 'default' | 'danger'` with comment `'primary' is filled, 'default' is ghost, 'danger' is red ghost`
- **Why:** Rubric G3 hard-flags `primary`/`secondary` baked into `variant` and semantic color folded into the variant axis. This shipped prop conflates the canonical `variant` (solid/soft/outline/ghost/link) and `color` (accent/…/error) axes into one stringly enum, then re-maps them at call time (line 232-233: `variant={action.variant === 'primary' ? 'solid' : 'ghost'} color={action.variant === 'danger' ? 'error' : 'accent'}`).
- **Fix:** Expose the DS axes directly: `variant?: ButtonProps['variant']; color?: ButtonProps['color']` (or a small `{ variant, color }` echo). Drop the `primary/default/danger` remap. Per the CLAUDE.md soft-over-outline preference, default the non-primary action to `soft`, not `ghost`.

### [P1][M1] Bell badge wiggles on every re-render, not on new-notification
- **Category:** motion
- **Evidence:** notification-center.tsx:451-458 — `animate={prefersReducedMotion ? undefined : { rotate: [0, -3, 3, -1, 1, 0] }}` on the unread-count `motion.span`
- **Why:** This is a decorative shake keyed to nothing — it replays every time the component re-renders while `unreadCount > 0` (parent state change, prop change, etc.), not when the count actually increases. That is the "bounce/wiggle by default" reflex (M1/M4-adjacent): motion that doesn't mean anything. A shake should fire once, on the *arrival* of a new notification.
- **Fix:** Drive the shake off a count-increase effect (compare prev vs current `unreadCount`, trigger via `useAnimationControls` or an `AnimatePresence` key), or drop it. Reduced-motion is already handled — keep that guard.

### [P1][F5] `NotificationItem` re-rolls surface/spacing instead of composing a base primitive
- **Category:** composability
- **Evidence:** notification-center.tsx:170-180 — a raw `<div role="button">` with hand-rolled `hover:bg-surface-raised`, `bg-accent-1` unread tint, `gap-ds-04 px-ds-05 py-ds-04`
- **Why:** Rubric F5 is the exact drift StatCard fixed — re-rolling padding/surface/interaction instead of composing the shared primitive. A selectable list row is a recurring shape; there's no shared `ListRow`/`MenuItem` primitive being composed, so hover/selected/spacing here can drift from Sidebar items, DropdownMenu items, Combobox options, etc.
- **Fix:** If a row/list-item primitive exists (or a `MenuItem`/`ListItem` in ui/), compose it; otherwise this is acceptable for now but should be flagged as the family-level gap. At minimum extract the row-surface tokens so they match the menu-item vocabulary.

### [P1][G4] Hover surface vocabulary is inconsistent within the panel
- **Category:** drift
- **Evidence:** row hover notification-center.tsx:178 `hover:bg-surface-raised`; dismiss-button hover line 257 `hover:bg-surface-raised-hover`; header "mark all read" line 362 has no hover surface (color-only)
- **Why:** Three interactive elements inside one overlay panel use three different hover treatments (`surface-raised`, `surface-raised-hover`, none). Per surface layering, hover on a surface-1/overlay base should land on a consistent step (surface-3/`surface-raised-hover`), and a row hover to `surface-raised` (surface-2) reads as a *lower* elevation delta than the nested dismiss button's `surface-raised-hover`.
- **Fix:** Pick one hover step for panel rows and apply it consistently; make the "Mark all read" affordance match (it's a text button with only a color shift while rows get a bg — inconsistent).

### [P2][G2] Raw pixel value for the tier dot
- **Category:** drift
- **Evidence:** notification-center.tsx:186 — `'h-[8px] w-[8px] rounded-pill …'`
- **Why:** Hardcoded `8px` instead of a spacing/size token; every other dimension here uses `ds-*` or fixed utility classes. G2 flags raw px over tokens.
- **Fix:** Use a size token (`h-ds-02 w-ds-02` or the nearest DS size) or a named status-dot size, so the dot scales with the token system.

### [P2][F1/F5] Tier dot re-implements status-dot / Badge semantics inline
- **Category:** composability
- **Evidence:** notification-center.tsx:129-133 `TIER_COLORS` map (`bg-info-9`/`bg-warning-9`/`bg-error-9`) + inline dot at 184-190; unread pill at 351-355 is a hand-rolled count badge (`rounded-pill bg-accent-2 … text-accent-11`)
- **Why:** Two spots re-roll things the DS already has vocabulary for: a semantic status dot and a count Badge. The tier→color map is a private lookup that can drift from the semantic color tokens used elsewhere; the header count "pill" duplicates Badge's soft-accent look without composing Badge.
- **Fix:** Compose `Badge` (soft, accent) for the header unread count; extract a shared status-dot (or use Badge's dot form) driven by `color="info|warning|error"` so the tier mapping lives in one place.

### [P2][H] Missing/uneven state coverage vs the matrix
- **Category:** state-coverage
- **Evidence:** stories cover default/all-read/all-unread/empty/loading/critical/actions/dismiss/footer/custom-empty/header-actions/custom-width — but no story or test demonstrates the **mobile Sheet** path (`useIsMobile`, line 464-486), **focus-visible** ring on the row/trigger, **forced-colors**, or **hasMore + onFetchMore** infinite-scroll firing.
- **Why:** Rubric H asks interactive components to demonstrate focus-visible, forced-colors, and the responsive branch. The mobile Sheet branch is a whole second render path with zero coverage; the row uses `role="button"` + `tabIndex=0` but there's no visible `:focus-visible` ring class on it (line 176-180 has hover but no focus style), so keyboard focus is invisible.
- **Fix:** Add a `:focus-visible` ring to the row (`focus-visible:ring-…`/`focus-ring` utility). Add a mobile-viewport story (or test with `useIsMobile` mocked) and a `hasMore`/`onFetchMore` interaction test. Consider a forced-colors story.

### [P2][H] Row focus ring is absent
- **Category:** a11y
- **Evidence:** notification-center.tsx:176-180 — the `role="button"` row has `hover:bg-surface-raised` but no `focus-visible:` treatment; contrast with the DS `focus-ring` utility used elsewhere
- **Why:** Keyboard users tab through rows (tabIndex=0) with no visible focus indicator — a focus-ring-removed-without-replacement class of a11y gap (H). axe won't catch a missing *visible* ring.
- **Fix:** Add the shared focus utility (`focus-visible:outline-none focus-visible:ring-2 ring-accent-8` or the repo's `focus-ring` @utility) to the row and the dismiss button.

### [P3][V5] Emoji used as an icon in story source
- **Category:** visual-tell
- **Evidence:** notification-center.stories.tsx:277 — `WithHeaderActions` renders `⚙` (gear emoji) as the settings button glyph
- **Why:** Rubric V5 flags emoji-as-icon in component/story/doc source. It's a demo slot (consumer-supplied), not a component default, so low severity — but it models the wrong pattern for the DS gallery and the doc example (line 42) correctly uses a Button instead.
- **Fix:** Swap `⚙` for `<Icon icon={IconSettings} />` in the story to model the icon API.

### [P3][F6] `onDismiss` action semantics use `onClick`-style naming on data actions
- **Category:** composability
- **Evidence:** notification-center.tsx:49 — `NotificationAction.onClick: (id: string) => void`
- **Why:** Minor: the action callback is named `onClick` but receives the notification id (a value, not a DOM event), which is closer to an `onSelect`/`onAction` value-callback (F6 spirit — value semantics vs event semantics). Not breaking, but the naming implies a DOM event handler.
- **Fix:** Consider `onAction(id)` / `onSelect(id)` naming to signal it's a value callback, not a DOM click handler. Low priority — public API, would be a breaking rename.

---

## Composability gaps
- **`NotificationItem` (row) does not compose a shared list-row/menu-item primitive** (F5) — re-rolls surface, hover, spacing, and interaction semantics inline; drift risk against Sidebar/DropdownMenu/Combobox rows.
- **Header count and tier dot re-roll Badge/status-dot** (F1/F5) instead of composing the existing Badge / a shared status-dot.
- **`NotificationAction.variant` collapses the `variant`+`color` axes** into one non-canonical enum then re-maps (G3) — consumers can't reach `soft`, `outline`, or arbitrary semantic colors.
- Slots are otherwise good: `headerActions`, `footerSlot`, `emptyState` are proper `ReactNode` slots; controlled `open`/`onOpenChange` is present; `getNotificationRoute` keeps routing in the consumer. No bespoke-corner-prop tell.
- No `asChild` on the trigger button — acceptable here since it's wrapped by `PopoverTrigger asChild`/`SheetTrigger asChild`, but a consumer wanting to swap the bell for their own element has no escape hatch besides `className`.

## Motion gaps
- **Bell wiggle fires on every re-render, keyed to nothing** (M1) — decorative bounce-by-default; should trigger once on count-increase or be removed.
- **Row/dismiss have hover transitions but no focus-visible feedback** (M4/H) — interactive feedback motion is incomplete for keyboard users.
- Reduced-motion is respected across the board (bell shake line 453, row stagger line 406-408) — good. The `index * 0.03` list stagger is reasonable (distance-scaled, not uniform-robotic). No layout-prop animation (uses opacity + transform) — clean on M5.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the action taxonomy (G3):** replace `NotificationAction.variant: 'primary'|'default'|'danger'` with canonical `{ variant?, color? }` echoing Button; default non-primary to `soft`. Update doc + types.
2. **Make the bell shake meaningful (M1):** trigger the wiggle only on `unreadCount` increase (prev-vs-current effect), keep the reduced-motion guard.
3. **Add focus-visible rings (H/a11y):** apply the DS focus utility to the notification row and the dismiss button.
4. **De-duplicate DS vocabulary (F1/F5/G2):** compose `Badge` for the header count; extract a token-driven status dot (drop `h-[8px]`); unify the tier→color map with semantic tokens.
5. **Unify hover surface step (G4):** one consistent hover treatment for panel rows / dismiss / mark-all-read.
6. **Close state coverage (H):** add mobile-Sheet story, `hasMore`/`onFetchMore` test, forced-colors story; swap the `⚙` emoji in `WithHeaderActions` for the Icon API (V5).

## Clean (rubric dims that pass)
- **V1 accent rail:** none — tier is a small dot, not a left/top color stripe. Clean.
- **V2 double edge:** trigger = border+bg (no shadow); popover = shadow-floating (no border). Each element picks one. Clean.
- **V3 gradient text / V6 blob-glow:** none. The unread count and value are solid color. Clean.
- **V4 framework palette:** uses semantic tokens (`accent-*`, `info/warning/error-9`, `surface-*`), no raw indigo/slate. Clean.
- **V7 rounded-everything:** uses `rounded-pill` (dots/badges), `rounded-overlay-lg`, `rounded-control-inner` — one radius vocabulary. Clean.
- **V8 pill-badge spam:** single unread-count badge, meaning-bearing. Clean.
- **E1–E8 verbal:** JSDoc + doc copy are direct and free of AI vocabulary/em-dash-tics/hedging. Clean.
- **M3/M5 reduced-motion + layout props:** reduced-motion guarded; animates opacity/transform only. Clean.
- **G1 surface:** popover/sheet on `bg-surface-overlay` (correct overlay tier), page-chrome not on surface-2. Clean.
- **I types:** `forwardRef` + `displayName` present; exported `Notification`/`NotificationAction`/`NotificationCenterProps`; no `any`, no `React.FC`, ref typed to `HTMLButtonElement`. Clean.
- **J docs parity:** doc prop table matches source; story exists (publish gate met); axe test present. Clean (the doc's `⚙`-free example is better than the story's).
