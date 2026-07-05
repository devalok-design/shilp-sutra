# AI-Giveaway + Polish — Fix Plan

Sequenced so each wave is independently shippable, verified against the publish gates (`pre-publish-audit.mjs`), and ordered **highest-visibility-lowest-risk first**. Breaking changes are quarantined into their own waves so they land on a major/minor with a changeset + migration note, per CLAUDE.md's HARD RULES (a type narrowing IS breaking; stories + tests are publish gates; docs are a publish gate).

**Why waves, not one parallel edit pass:** 1,114 findings across 124 files with breaking-change classification, changesets, and story/test gates cannot be a blind fan-out. Each wave below is a reviewable PR.

Legend: 🟢 non-breaking · 🟡 additive (new prop/mode, old still works) · 🔴 breaking (changeset + migration).

---

## Wave 1 — Kill the surviving accent rails 🟢 (highest visibility, near-zero risk)
The one hard AI tell still shipping. Mostly deletions.
- `ui/toast` + `ui/toaster`: remove the `w-1 … accentClass` left rail; carry type via the already-typed status icon + timer bar (optional error surface tint). Update `toast.test.tsx`, the doc, and `llms-full.txt` (they advertise the rail as a feature).
- `ai/blocks`: extract one `BlockShell`/`LowConfidence` helper; replace the `border-l-2 border-warning-7 pl-3` string in block-table/confirm/error/success/text; update the 3 tests asserting it in lockstep.
- `composed/schedule-view`: delete `border-l-[3px]` on the event block (tinted bg already differentiates).
- `ui/chat`: drop `border-l-2 border-l-accent-9` on mention; keep the `bg-accent-2` tint (matches the rail-less bubble variant).
- **Verify:** vitest + Chromatic (visual backstop). Changeset: patch, "removed residual accent-rail tell (matches v0.44.0 Card decision)."

## Wave 2 — Accessibility P0s 🟢 (broken contracts; mostly non-breaking)
- `ui/split-button`: move focus into menu on open + roving Arrow/Home/End + focus-restore, **or** reuse the DropdownMenu primitive (preferred — inherits it all).
- `composed/file-preview`: compose the DS `Slider` for volume/seek/scrub (keyboard + forced-colors for free), or add `onKeyDown`.
- `composed/master-detail`: derive `activeIndex` from `selected`; give ListItem a `value`/`id` so focus + selection share one source.
- `composed/activity-feed`: real `<button>` disclosure + `aria-expanded`/`aria-controls` + focus-visible ring.
- `ui/segmented-control`: switch `tablist`/`tab` → `radiogroup`/`radio` + `aria-checked` (keep roving tabindex + arrows). 🔴 *role change is observable to consumer tests* — changeset note.
- `ui/badge-group`: `aria-label` on the overflow pill; keep it a real button.
- `shell/notification-preferences`: replace raw delete `<button>` with `<IconButton aria-label>`; add a populated-rows axe story.
- `composed/date-picker`: apply the `touch-target` utility (44px) to cells/triggers/nav arrows; keep compact look via inner padding.
- **Verify:** vitest-axe per component + manual keyboard pass. Add the missing axe stories.

## Wave 3 — color-input palette + separator + broken motion stories 🟢/🟡
- `ui/color-input`: re-base `NAMED_PRESETS` off a designed, color-blind-safe spectrum (not indigo/violet-led); change story defaults off `#6366F1`.
- `ui/separator`: replace interpolated `linear-gradient(${deg}…)` with literal per-orientation strings (like Card's `cornerPositions` map) or an `@utility`; add a test asserting the class emits.
- `ui/motion.stories.tsx`: fix `<Fade open=>`→`<MotionFade show=>`, `direction="bottom"`→`"down"`, `variant="primary"/"secondary"`→`"solid"/"soft"`. Re-run story tests (currently two stories throw at render).
- **Verify:** build (separator needs the TW4 scanner to emit), story tests green.

## Wave 4 — Shared infrastructure (unblocks the systemic sweeps) 🟡
Build the primitives the sweeps compose onto. Additive.
- **`useControllableState` hook** (or adopt the vendored `react-use-controllable-state` already in primitives) as the ONE controlled/uncontrolled contract → Wave 7.
- **Overlay motion contract:** a `useOverlayMotion()` / shared variants that bake in local `useReducedMotion()`, consistent enter/exit, one easing source → Waves 5 + 8.
- **Shared count-badge / status-dot** primitive (shell re-rolls it 4 ways) → Wave 6.
- **`BlockShell`** for ai (surface + low-confidence treatment) → composes `<Card>` → Wave 6.
- Clean the reference: drop Card's redundant `default` color alias (keep `neutral`), add local reduced-motion to Card. 🔴 removing `color="default"` is breaking → fold into the Wave 7 breaking batch, or alias-deprecate first.

## Wave 5 — In-component reduced-motion (M3) + de-bounce (M1) 🟢
- Add local `useReducedMotion()` (via the Wave 4 contract) to every overlay (Dialog, AlertDialog, Sheet, Popover, Select, Combobox, Tooltip, HoverCard, DropdownMenu) so they're correct standalone.
- Guard the infinite pulses (priority-indicator, deadline-indicator, schedule-view, recording-overlay, avatar-group, empty-state) — mirror `badge.tsx`'s gated pulse.
- Remove overshoot where it's not intentional; reserve `springs.bouncy` for genuine emphasis.
- **Verify:** add reduced-motion stories (feeds Wave 9).

## Wave 6 — Compose, don't re-roll: additive refactors (F5) 🟡
Internal refactors — same public API, now composing the base primitive. No consumer-visible change (visual regression caught by Chromatic).
- ai: `command-bar`/`conversation`/`blocks` → compose `<Card>`/`BlockShell` (Wave 4).
- shell: badges/dots → shared primitive (Wave 4).
- composed: skeleton family, content-card internals, page-header, activity-feed, status-badge → compose Card/Badge/Skeleton; fix skeleton radius token (`rounded-surface` not `rounded-overlay-lg`) + border-led → elevation-led.
- ui: `toaster`/`data-table-card`/`file-upload` → compose Card surface; `stat-flash` → compose StatCard chip (kill the verbatim dupe).
- **Verify:** Chromatic diff must be ~empty (pure refactor); full vitest.

## Wave 7 — Vocabulary + controlled/uncontrolled 🔴 (breaking — batch on one minor/major)
All the API-shape breaks in one migration.
- Adopt the Wave-4 controlled/uncontrolled contract on the 24 controlled-only components; rename non-canonical handlers (`onChange(value)`→`onValueChange`, `onSelect`, `selectedId`) with deprecated aliases where possible.
- Canonicalize variant axes: Combobox/Autocomplete gain `variant`+`color`+`size`; SearchInput `xs` reconciled with docs; composed non-canonical axes (`padding`/`display`/`status`/`light|dark`) → `size`/`color`/`variant`.
- Remove Card `color="default"` (Wave 4).
- **Verify:** classify EACH prop change widening-vs-narrowing (HARD RULE); changeset lists every narrowing as breaking; MIGRATION.md section; file a `/send-karm-notice` DS Notice.

## Wave 8 — Slots over corner-props (F1) 🟡 (additive; deprecate props next major)
Add the slot API alongside the existing prop (like Card's `CardAction`), mark the corner-prop `@deprecated`.
- avatar `badge`, banner `actions`, popover `title`, split-button `dropdownContent`, stat-card `footer`, status-dot `label`, tree-view `actions`, content-card `headerActions`/`footer` (+ resolve F4 mixed model), data-table `emptyState`/`renderExpanded`.

## Wave 9 — State-coverage + docs + verbal sweep 🟢
- Add reduced-motion / forced-colors / RTL stories + tests across ui + composed (systemic convention gap). Consider a `describeA11yStates` helper so it's uniform.
- Fix the ~10 composed doc drifts + shell/ai doc drifts (source wins); regenerate `llms-full.txt` / make-kit where prop surfaces changed.
- De-em-dash the docs (79 connectors in shell alone); fix story examples that teach `<button style={{background:'#6366F1'}}>` → `<Button variant="soft">`.
- Fix remaining `React.FC` / `any` (alert-dialog, tooltip, context-menu, ai `BlockComponentProps<any>`, normalize-icon, shell `ShellUser`/`UserRole`).
- Touch-target sweep (Wave 2 covered the P0s; finish the rest).

---

## Suggested first PR
**Waves 1 + 2 + 3 together** — every P0, all 🟢/one small 🔴 (segmented-control role), highest visibility, no shared-infra dependency. One reviewable branch, one patch/minor release. Then Wave 4 (infra) unlocks 5–8.

## Open decisions for you
1. **Breaking batch (Wave 7):** one big `0.45.0`/`1.0.0` migration, or drip alias-deprecations across minors?
2. **Card `color="default"` removal** — breaking; alias-deprecate first or clean-break?
3. **Wave 1 scope** — kill the toast rail outright, or keep an opt-in `showAccent` prop for consumers who want it? (Recommend outright — it's the tell.)
