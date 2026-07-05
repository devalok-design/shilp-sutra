# AI-Giveaway Polish — Pending Work (session handoff)

Running list of the bigger pieces still to do. Pick up in a fresh session. Read `foundational-decisions.md` (locked house rules A–H), `01-report.md` (findings), `02-polish-plan.md` (wave plan) first.

**Last updated:** 2026-07-01 (end of Wave 2 partial).

---

## Status snapshot

- **Branch:** `feat/ai-giveaway-wave-1` (holds Wave 1 + the Wave 2 items done so far). **Nothing committed yet** — working-tree changes only (user is holding commits).
- **Shared working tree** with the cards-workstream Claude. **File lanes:** I do NOT touch `card.tsx`, `stat-card.tsx`, `content-card.tsx`, `data-table-card.tsx`, `ui/index.ts` (theirs). The persistent `card.tsx:135 process` typecheck error is theirs, not ours.
- **Wave 1 (accent rails):** DONE + verified (128/128 tests). See `wave-1-spec.md`.
- **Wave 2 (a11y P0s):** **DONE (7/7)** + verified. segmented-control, activity-feed, master-detail, badge-group, notification-preferences, file-preview (MediaSlider), split-button (Popover-wrap). *file-preview + split-button want a Storybook eyeball but are code-complete + tested.*
- **Wave 3:** color-input ✅, separator ✅. Remaining: motion demo stories (code-bug fix).
- **Note:** typecheck now fully clean (cards workstream committed card.tsx). Currently on branch `feat/card-spacing-var` with my edits uncommitted — move to `feat/ai-giveaway-wave-1` at commit time.

---

## Immediate next (Wave 2 tail — decisions already locked)

### 1. split-button → Popover-wrap  **DONE**
Composed the DS Popover primitive (Popover/PopoverTrigger/PopoverContent) — focus-in/return, Escape, outside-click, mobile bottom-sheet; removed the hand-rolled `@floating-ui/dom` + listeners. `placement` maps to Radix side/align (kept the prop). Trigger now `aria-haspopup="dialog"`. typecheck+lint clean, 16/16 tests, changeset `split-button-popover-a11y.md`. **Full APG menu (arrow-key item nav via DropdownMenu) still deferred to 0.45.0** (changes the `dropdownContent` API).

### 2. file-preview → compose Slider  **DONE** (pending user Storybook visual check)
Built a shared `MediaSlider` in `file-preview/shared.tsx` on the Radix Slider primitive (the DS Slider wrapper was too chunky/opinionated for slim media chrome). Slim, hover/focus-reveal thumb, `tone="dark"` (white on overlay) / `tone="light"` (accent). Swapped all 3 sites (volume, video seek, audio scrub). Removed the audio hover-time tooltip (mouse-only). typecheck+lint clean, 6/6 tests, changeset `file-preview-media-sliders.md`. **USER TO VERIFY in Storybook:** dark-overlay slider look + hover/focus-reveal thumb + drag-seek smoothness (seek slider is controlled by media `timeupdate`, so drag may stutter slightly — confirm acceptable).

---

## G wave — touch targets (opt-in hit-area)  [needs research + spec + build]

**Decision (locked):** ship a `touch-target` utility that expands the **tap area** to ~44px via an invisible overlay (`::before` / negative-margin) — **visual box + layout unchanged** — and make it **opt-in** (utility class / prop / provider flag) so dense shipped layouts (Karm) don't reflow or get overlapping tap areas.

**To do:**
1. Research the overlap hazard in dense rows (pagination, calendar grid) — how other DSes expand hit area without neighbor overlap.
2. Spec the API (utility vs prop vs provider flag).
3. Build the utility.
4. Apply to the deferred sizing items: date-picker cells (32/36px), segmented-control sizes (28/32/40), pagination (36), dialog close (24), banner dismiss (24), tree-view rows, textarea `xs`.

Note: a `touch-target` @utility already exists (utilities.css) and is used on some toast buttons — reconcile/extend rather than reinvent.

---

## Waves 3–9 (bigger sweeps — see 02-polish-plan.md for detail)

- **W3 — remaining P0 odds & ends:** ~~color-input default presets~~ **DONE** (brand-derived OKLCH presets replace the raw Tailwind-500 set; stories/doc/test updated; 15/15 pass; changeset `color-input-brand-presets.md`). ~~separator~~ **DONE** (gradient variants were decorative + broken-in-prod + demo-only → deprecated, renders solid; prop removed at 0.45; 9/9 pass; changeset `separator-solid-only.md`). STILL TODO: two motion demo stories crash on load (fix `<Fade open=>`→`<MotionFade show=>`, `direction="bottom"`→`"down"`, `variant="primary/secondary"`→`solid/soft`) — pure code-bug fix, not visual.
- **W4 — shared infra:** controllable-state hook (DECISION: build vs adopt vendored `primitives/_internal/react-use-controllable-state`); overlay-motion contract (enter/exit + local reduced-motion); shared count-badge/status-dot primitive (shell re-rolls it 4×). `BlockShell` already built in Wave 1.
- **W5 — motion:** settle-not-bounce sweep; add local `useReducedMotion()` to all overlays; guard infinite pulses; keep `springs.bouncy` only where overshoot is intentional (DECISION: which usages).
- **W6 — compose-don't-reroll (F5):** biggest quality win. ~18 composed + 3 ai + shell badges re-roll a base primitive → point them at the real Card/Button/Badge/Skeleton. Pure refactor (Chromatic guards). Fix skeleton family radius (`rounded-overlay-lg`→`rounded-surface`, border-led→elevation-led).
- **W7 — vocabulary + controlled/uncontrolled → ships as 0.45.0 (BREAKING):** canonical `variant/size/color` everywhere; `onValueChange` naming; remove `color="default"`; add uncontrolled modes to ~24 components; **split-button full DropdownMenu rebuild lands here**. Classify EACH prop change widening-vs-narrowing (HARD RULE: narrowing = breaking). Migration guide + Karm DS notice (`/send-karm-notice`).
- **W8 — slots over corner-props (MY scope = non-Card):** avatar `badge`, banner `actions`, popover `title`, split-button `dropdownContent`, status-dot `label`, tree-view `actions`/`secondaryLabel`, etc. Additive now, deprecate old props → remove at 0.45.0. (Cards workstream owns Card/StatCard/ContentCard slots.)
- **W9 — state-coverage + docs + verbal sweep:** `describeA11yStates` helper (DECISION: API); add dark/forced-colors/RTL/reduced-motion stories+tests across ui+composed (incl. badge-group which has NO test file); fix ~10 composed docs that lie about behavior; strip em-dash/contrastive-negation from docs; finish touch-target sweep (with G).

---

## Open decisions — resolved 2026-07-01
- **W3 color-input palette:** ✅ brand-derived OKLCH spectrum (done). CB-safety: leave as brand spectrum (no over-claim).
- **W4 controllable-state:** ✅ **BUILD a fresh shared `useControllableState` hook** (not reuse vendored).
- **W5 motion:** ✅ calm/settle everywhere; `springs.bouncy` ONLY for deliberate moments (e.g. success celebration).
- **G touch-target:** ✅ **ON BY DEFAULT** (hit-area only, no reflow) — but G research MUST handle dense-row tap-zone *overlap* (pagination/calendar) before global apply.
- **W7:** 0.45.0 clean-break, deprecate-with-aliases as we go (locked earlier). Still to detail at W7: exact per-component axis renames + per-prop widening/narrowing classification.
- **W4 count-badge API / overlay-motion variants, W9 `describeA11yStates` API:** impl-level, decide in-wave (no product decision needed).

## Still fully done this session
Wave 1 (rails) ✅ · Wave 2 (a11y P0s, 7/7) ✅ · Wave 3 (color-input, separator, motion-stories) ✅. Full suite 2190/2190. Changesets written for each. Remaining: G wave + W4–W9 (parked for separate sessions; decisions above pre-locked).

## Verification + commit checklist (per wave)
`pnpm --filter @devalok/shilp-sutra typecheck` (ignore foreign card.tsx) → targeted `vitest run` → `pnpm build` (catches TW4-scanner issues) → Storybook/Chromatic for visual → one changeset per wave. Stage ONLY my file lane. Wave 1 changeset already written (`.changeset/wave-1-accent-rails.md`).
