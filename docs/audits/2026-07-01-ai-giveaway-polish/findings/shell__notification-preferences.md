# shell/notification-preferences — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:5 P2:5 P3:2

Overall: no loud visual AI tells (no accent rail, no gradient text, no emoji, no indigo). It composes `<Card>` correctly and uses tokens for most spacing. But it falls well short of the Card/StatCard finish bar: one hard a11y break (unlabeled icon-only delete button rendered as a raw `<button>` instead of the DS `IconButton`), a self-cancelling surface (nested `bg-surface-raised` chips/hovers on a `bg-surface-raised` card = zero contrast), a hardcoded `w-[130px]`, a swallowed save error with no user-facing error state, no dark/RTL/focus/error state coverage in stories or tests, and a monolithic non-composable row (hardcoded Karm-specific `IN_APP`/`GOOGLE_CHAT` label maps baked into a published DS component).

## Findings

### [P0][H] Delete action is an unlabeled, un-primitive icon-only button
- **Category:** a11y
- **Evidence:** notification-preferences.tsx:239–245 — `<button type="button" onClick={() => onDelete?.(pref.id)} className="shrink-0 rounded p-ds-02b ...">` `<Icon icon={IconTrash} size="sm" /></button>`
- **Why:** Icon-only control with no `aria-label`/text → screen readers announce "button" with no name (axe: button-name). The static axe test passes only because it renders the empty (zero-preference) state, so this row never mounts. Also a raw `<button>` re-rolls what `IconButton` already provides (label requirement, 44px target, focus-visible ring).
- **Fix:** Use `<IconButton aria-label={\`Delete ${channelInfo.label} rule\`} icon={<IconTrash />} variant="ghost" color="error" size="sm" onClick={...} />`. Add a story with populated rows so axe covers it.

### [P1][G1] Self-cancelling surface: nested `bg-surface-raised` on a `bg-surface-raised` card
- **Category:** drift
- **Evidence:** notification-preferences.tsx:196 channel-icon chip `... rounded-surface bg-surface-raised`; line 242 delete hover `hover:bg-surface-raised`. Card default is `bg-surface-raised` (card.tsx:27).
- **Why:** A chip / hover fill painted the same color as the surface it sits on is invisible — the icon "tile" reads as no tile, and the delete hover produces no visible feedback. Violates the surface layering ladder (hover on surface-2 → surface-3).
- **Fix:** Chip background → `bg-surface-sunken` or `bg-surface` (a step off the card); delete/row hover → `bg-surface-3` (`hover:bg-surface-3`). Use a token that is actually a different step from the parent.

### [P1][G2] Hardcoded arbitrary width `w-[130px]` on the tier Select
- **Category:** drift
- **Evidence:** notification-preferences.tsx:215 — `<SelectTrigger className="h-ds-xs-plus w-[130px] text-ds-sm">`
- **Why:** Raw px sidesteps the spacing scale; won't reflow with density/RTL and drifts from the token system Card/StatCard hold to.
- **Fix:** Use a token width (`w-ds-...`) or `min-w`/`w-auto` with `flex` sizing; if a fixed control width is needed, add a semantic size token.

### [P1][F3/F5] Monolithic row with hardcoded consumer-domain label maps
- **Category:** composability
- **Evidence:** notification-preferences.tsx:84–93 `CHANNEL_LABELS` (`IN_APP`, `GOOGLE_CHAT`) + `TIER_LABELS` (`INFO`/`IMPORTANT`/`CRITICAL`) baked in; the row (lines 187–246) is a fixed layout with no render slot.
- **Why:** These are Karm-specific enums shipped inside a general design-system shell component. Any consumer with different channels/tiers cannot use it, and unknown channels silently fall back to `IN_APP` (line 185). No slot to customize a row (icon/label/controls). This is the re-roll-not-compose gap StatCard avoided.
- **Fix:** Accept `channels`/`tiers` config (label + icon) via props, or a `renderRow`/children slot. Default the maps but let consumers override. At minimum export the label maps and document extension.

### [P1][G5] `Add Rule` defaults to `variant="outline"`
- **Category:** vocabulary
- **Evidence:** notification-preferences.tsx:160–167 — `<Button size="sm" variant="outline" ...>`
- **Why:** CLAUDE.md design preference: non-primary actions default to `soft` unless on a colored/raised bg or icon-dense toolbar. This button sits on the card body (a plain surface), so `soft` is the intended default.
- **Fix:** `variant="soft"`.

### [P1][state-coverage] Save error is swallowed; no user-facing error state
- **Category:** state-coverage
- **Evidence:** notification-preferences.tsx:133–137 — `catch (error) { console.error('[Preferences] Failed to save:', error) } finally { setIsSaving(false) }`
- **Why:** On a failed `onSave` the dialog stays open with no message, no `aria-live`, no inline error — the user sees the spinner stop and nothing else. Violates the global "errors raised, never swallowed silently" rule and the state matrix (error state).
- **Fix:** Surface the error (inline `Alert`/field error inside the dialog with `role="alert"`), keep dialog open, and don't reset the form.

### [P2][G4] Bare `rounded` on the delete button instead of a radius role token
- **Category:** vocabulary
- **Evidence:** notification-preferences.tsx:242 — `className="shrink-0 rounded p-ds-02b ..."`
- **Why:** `rounded` (bare 4px, semantic.css:347) is the TW4 default namespace, not the control radius role. Close/icon buttons are documented to use `--radius-control-inner` (`rounded-control-inner`). Drifts from the family radius vocabulary. (Moot if switched to `IconButton` per the P0.)
- **Fix:** `rounded-control-inner` (or inherit from `IconButton`).

### [P2][H] Delete button touch target likely < 44px
- **Category:** a11y
- **Evidence:** notification-preferences.tsx:242 — `p-ds-02b` padding around an `size="sm"` (~16px) icon → ~28px hit box.
- **Why:** Below the 44px minimum interactive target in the state matrix. `IconButton` handles this; the raw button doesn't.
- **Fix:** Adopt `IconButton` (has `touch-target`), or add `min-h`/`min-w` + the `touch-target` utility.

### [P2][H] No focus-visible ring on the raw delete button
- **Category:** a11y
- **Evidence:** notification-preferences.tsx:242 — only `transition-colors hover:bg-... hover:text-error-11`; no `focus-visible:` styles.
- **Why:** Relies on the UA outline; keyboard focus feedback is inconsistent and can be lost in forced-colors. Card-bar components use the `focus-ring` utility.
- **Fix:** Add the DS `focus-ring` utility (again, free via `IconButton`).

### [P2][state-coverage] Stories/tests miss dark, RTL, focus, error, and populated-a11y states
- **Category:** state-coverage
- **Evidence:** notification-preferences.stories.tsx (8 stories, all data-shape variations, none for dark/RTL/error); test only renders the empty state (__tests__/notification-preferences.test.tsx:31,36).
- **Why:** The state matrix requires dark, RTL (directional icons), focus-visible, error, and forced-colors coverage. The single axe test on the empty state misses the unlabeled-button violation entirely.
- **Fix:** Add a dark + RTL story, a "save error" story, and an axe test against the `Default` (populated) preferences.

### [P2][docs] Doc `## Changes` is stale / wrong version
- **Category:** docs
- **Evidence:** docs/components/shell/notification-preferences.md:47–49 — `### v0.1.0 - Added Initial release`; DS is at 0.44.x. Doc lists no props defaults for the internal dialog state and no `IconButton` usage.
- **Why:** Docs parity gap; changelog stamp never advanced.
- **Fix:** Update the version stamp and note the composability/label-map extension points once added.

### [P3][structural] Header uses `space-y-0` + `pb-ds-04` override, fighting Card's gap model
- **Category:** drift
- **Evidence:** notification-preferences.tsx:156 — `<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-ds-04">`
- **Why:** Card v0.44.0 moved to a gap model where the container owns vertical rhythm; re-adding `pb-ds-04` and `space-y-0` on the header is exactly the per-slot padding the gap model removed. Minor, but it's drift from the finished Card contract. A header action like "Add Rule" is arguably a `<CardAction>` slot candidate.
- **Fix:** Rely on Card's gap; if the title+button row needs its own layout use a flex child inside `CardHeader` without overriding vertical padding. Consider `<CardAction placement="top-right">` for the button.

### [P3][state-coverage] `console.error` in library code
- **Category:** state-coverage
- **Evidence:** notification-preferences.tsx:134 — `console.error('[Preferences] Failed to save:', error)`
- **Why:** A published component logging to the consumer's console is noisy and non-actionable; the error should propagate to a callback/UI, not the console.
- **Fix:** Remove the log; surface via the error-state fix above (or rethrow after showing UI).

## Composability gaps
- Hardcoded `CHANNEL_LABELS` / `TIER_LABELS` (Karm domain enums) with no prop to supply channels/tiers or override labels/icons — the component only works for one app's data shape (F3/F5).
- No row slot / `renderRow` — the row layout (icon, label, tier select, mute switch, delete) is fixed; consumers can't reorder, add, or replace controls (F1).
- Delete action re-rolls a raw `<button>` instead of composing `IconButton`; the header "Add Rule" button could compose the `<CardAction>` slot Card now offers (F5/F1).
- The Add-Rule dialog form state is fully internal (uncontrolled only) — no way to preset/control the draft, and `onSave` is the only integration point; no controlled `open` prop exposed either.

## Motion gaps
- The row hover uses `transition-colors` only, but its hover color (`hover:bg-surface-raised`) equals the surface → no visible feedback motion (M4). Fix the surface, then the transition becomes meaningful.
- No entrance/exit on the preference list or on add/delete of a row — adding/removing a rule pops with no motion (M4). StatCard/Card animate entrance intentionally; this list does nothing.
- Delete button has no press feedback (`active:`/`whileTap`) (M4).
- No `prefers-reduced-motion` consideration needed for current (near-zero) motion, but any added list/row motion must go through the motion system with reduced-motion guards (M3).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the P0 a11y break:** replace the raw delete `<button>` with `<IconButton aria-label={\`Delete ${channelInfo.label} rule\`} icon={<IconTrash />} variant="ghost" color="error" size="sm" />` — this also fixes touch target, focus ring, and bare-`rounded`.
2. **Fix the self-cancelling surface:** channel-icon chip and row/delete hover must use a surface step that differs from the card (`bg-surface-sunken`/`bg-surface`; `hover:bg-surface-3`).
3. **Surface the save error:** stop swallowing in `catch`; render an inline `Alert role="alert"` in the dialog, keep it open, drop the `console.error`.
4. **Replace `w-[130px]`** with a token width; switch `Add Rule` to `variant="soft"`.
5. **Generalize the domain coupling:** accept `channels`/`tiers` config (or a `renderRow` slot), default to the current maps, handle unknown channels explicitly instead of falling back to `IN_APP`.
6. **Align to Card's gap model:** drop `space-y-0 pb-ds-04` on the header; consider moving `Add Rule` to a `<CardAction>` slot.
7. **Add motion:** entrance/exit on rows via the motion system with reduced-motion guards; press feedback on actions.
8. **Close state coverage:** dark + RTL + save-error stories; axe test against the populated `Default` story; update the doc version stamp + extension notes.

## Clean (rubric dims that pass)
- **V1 accent rail:** none — rows are divided with a plain `border-b border-surface-border-strong`, no colored stripe.
- **V2 double edge:** composes Card's single-edge surface; no border+shadow doubling of its own.
- **V3 gradient text / V4 framework palette / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none. No indigo/violet, no `bg-clip-text`, no `backdrop-blur`, no `rounded-2xl/3xl`.
- **V5 emoji as icons:** none — uses lucide/tabler via the DS `Icon`.
- **E1–E8 verbal tells:** copy is plain and functional ("Add Rule", "No custom preferences set...", "Mute this channel"); no em-dash tic, AI vocabulary, or hedging in source/story/doc.
- **G3 variant-axis drift:** uses canonical `size="sm"`, `variant="outline|ghost"` (the outline one is a G5 preference, not an axis-name drift).
- **I types:** proper `forwardRef` + `displayName`, exported prop/interface types, no `any`, `onValueChange` used for Select (not `onChange`). `channel`/`minTier` are `string` rather than string-literal unions — acceptable given the intended generalization, but tighten if the enums are meant to be fixed.
- **F composing base:** correctly builds on `<Card>`/`<CardHeader>`/`<CardContent>` and uses `Dialog`, `Select`, `Switch`, `Spinner`, `Button` primitives rather than re-rolling them (the delete button is the one exception).
