# ui/file-upload — finish-bar audit

Finish: 2/5   Market: LAGS(Ark UI FileUpload / React Aria FileTrigger+DropZone)   Rebuild: polish

Source verified against `packages/core/src/ui/file-upload.tsx` (429 lines, single file — no subcomponents), `file-upload.stories.tsx`, `file-upload.test.tsx`, `docs/components/ui/file-upload.md`, and the 2026-07-01 baseline. Token-clean, no loud slop, decent tests/docs — but a keyboard focus-visible gap and two motion defects (both in the four heavily-weighted axes) hold it at 2. Almost nothing from the prior baseline was fixed; the code is materially unchanged.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No accent rail/gradient/emoji/glow. Radius via role tokens (`rounded-surface/control/pill`) — clean, no radius-ds. BUT drop zone rests on `bg-surface-raised-hover` (a *hover*-step token used as base fill; layering drift — input controls should rest on surface-1/input fill). `border-2 border-dashed` + tinted fill is a soft double-edge reflex; `border-2`/`h-2`/`max-w-xs` are off the `--spacing-ds-*` namespace (minor). |
| accessibility | ✗ | Hidden `<input>` carries aria-label/accept/multiple/disabled; error in `role="alert" aria-live="polite"`; progressbar has full valuenow/min/max; drop zone is Enter/Space-activatable `role="button"`; axe test passes. But **no focus-visible ring on the keyboard-operable drop zone** (WCAG 2.4.7 — a `div[role=button]` gets no/weak UA outline). `disabled` leaves `tabIndex={0}` so it stays in the tab order (half-disabled). Compact button has no `touch-target` util (px-ds-03/py-ds-02 → <44px). No forced-colors handling for the dashed border + accent fills. |
| api-composability | gap | `forwardRef<HTMLDivElement>` + displayName; typed props, no `any`; `Omit<…,'onError'>`; controlled uploading/progress/error; `onFiles` always emits `File[]`. But compact mode **re-rolls Button chrome** instead of composing `<Button variant size startIcon>` (drift, no variant/size axes); `label`/`sublabel` are string-only with no `children`/slot for rich drop-zone content; no `asChild`. |
| docs-dx | gap | Doc exists with Props/Defaults/Example/Composability/Gotchas and matches source. Story title is `Patterns/FileUpload` but audit unit is `ui/` (layer mismatch). No Success story (`progress===100` checkmark branch, tsx:339-348) and no axe play test in stories. |
| testing | ✓ | Unit + RTL + vitest-axe; covers upload/size-reject/type-reject/error-prop/progress/compact/multiple/accept/disabled/click/disabled-click/drag-active/ref/className/axe. Gaps: no `describeConformance`, no success-state test, no reduced-motion assertion. |
| motion | ✗ | Progress bar animates `width` (tsx:375) — a **layout prop, not compositor-only**, and it **escapes reduced-motion** (MotionConfig only neutralizes transform/opacity, not `width`). Error alert ships a **default 5-keyframe horizontal shake** (tsx:409, `x:[0,-4,4,-4,4,0]`) — decorative overshoot by default, no opt-out. No self-contained `useReducedMotion` guard (relies on consumer MotionConfig). No hover/press feedback on the drop zone (only drag `scale:1.02`, which is fine). Enter/exit icon transitions (opacity+scale) and `springs.snappy/bouncy` usage are correct. |
| state-coverage | gap | Deliberately designed: loading (spinner+bar), error (alert), success (checkmark), disabled, drag-active, empty (the default zone). Missing: hover on the primary target, press/active feedback, focus-visible. |
| content-resilience | gap | String props i18n-safe; error text resilient. No truncation strategy for very long label/sublabel (they wrap in the centered zone — acceptable). Does not render a selected-file list, so "many files" isn't displayed. Shake uses physical `x` (not RTL-mirrored) — decorative, minor. |
| theming-resilience | ✓ | accent-2/7/9 + error-11/success-11 + surface tokens all swap with a brand accent-9 change; radius role tokens honor `[data-shape]`. Dark: `surface-raised-hover` reads lighter than a near-black page so the zone doesn't vanish — but using a hover token at rest is still the wrong semantic. |
| system-cohesion | gap | Shares springs/tweens, Icon API, Spinner, ds spacing. Drift: compact button re-rolls Button's look (two sources of truth for "what a button is"); the `width`-animated bar mirrors StatCard's ProgressBar mistake (family-wide). |
| craft | gap | Nice touches: resets `input.value` so the same file re-selects; dialogOpen/filesAccepted refs detect an accept-filtered dialog-cancel and surface an error; cursor-pointer/not-allowed. Undercut by missing focus-visible + hover affordance. |
| perceived-performance | ✓ | Instant drag feedback; spinner + progress during upload; no CLS. Only nit: `width` animation forces layout/paint each frame instead of a compositor transform. |
| market-benchmark | ✗ | LAGS Ark UI FileUpload and React Aria FileTrigger+DropZone: both render a managed file list with per-item remove, expose reject reasons, `maxFiles`, item previews, and composable parts (Dropzone/Trigger/ItemGroup). Ours is fire-and-forget with no file list, no item management, and a weaker focus story. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P0] accessibility — no focus-visible ring on the keyboard-operable `role="button"` drop zone (tsx:302-321). → add the DS `focus-ring`/`focus-visible:` utility; verify the compact `<button>` keeps a visible ring.
- [P1] motion — progress bar animates `width` (layout prop) and slips past reduced-motion (tsx:373-377). → animate `scaleX` on a full-width child (`transform-origin:left`) so it's compositor-only and MotionConfig-honored; fix StatCard's bar too for family consistency.
- [P1] motion — default 5-keyframe error shake (tsx:409-411). → fade/slide the alert in once; gate any shake behind an explicit prop.
- [P1] accessibility — `disabled` keeps `tabIndex={0}` (tsx:304). → set `tabIndex={-1}` when disabled to leave the tab order, matching the already-set `aria-disabled`.
- [P1] api/cohesion — compact mode hand-builds a button (tsx:244-260). → compose `<Button variant="outline" size="sm" startIcon={uploading ? <Spinner/> : <Icon icon={IconPaperclip}/>}>`; inherit the canonical axes.
- [P2] visual — drop zone rests on `bg-surface-raised-hover` (tsx:317). → rest on surface-1/input fill; reserve the hover token for actual hover; add hover + `active:scale` press feedback.
- [P2] a11y — compact button lacks a 44px `touch-target`. → add the `touch-target` util.
- [P2] docs/testing — reconcile `Patterns/` vs `ui/` title; add a Success (`progress:100`) story + forced-colors/reduced-motion coverage.

## What it does well
- Zero loud slop: no accent rail, gradient text, emoji-as-icon, glow/glass/blob; radius entirely via role tokens (no radius-ds, no `rounded-full`).
- Genuinely thoughtful client-side validation: size + accept enforced before `onFiles`, and the dialogOpen/filesAccepted ref pair detects an accept-filtered dialog cancel to surface an error — a detail most implementations miss.
- Input value reset so the same file can be re-picked; error is a proper `role="alert" aria-live="polite"`; progressbar has complete ARIA value attributes.
- Clean typing: `forwardRef` + displayName, no `any`, `onFiles: (files: File[]) => void`, `Omit<…,'onError'>`.

## Cross-DS adoption ideas
- **Ark UI FileUpload** exposes `ItemGroup`/`Item`/`ItemPreview`/`ItemDeleteTrigger` parts + `maxFiles` and rejected-file reasons — we render no selected-file list at all. Add an optional managed list with per-file remove and per-file reject reason.
- **React Aria DropZone** announces drop-target state to screen readers and separates `FileTrigger` (the accessible button) from the drop surface — adopt the trigger/surface split and SR drag announcements.
- **React Aria FileTrigger** and Ark both support item **preview thumbnails** for images — a `renderItem`/children slot would give consumers rich drop-zone content (illustration, accepted-type chips) we currently can't express with string-only `label`/`sublabel`.

## Rebuild note
Polish, not rebuild — the core drop-zone architecture is sound and the defect list is a cluster of in-place fixes: add focus-visible ring, fix `disabled` tabIndex, swap `width`→`scaleX` and drop the default shake, correct the resting surface + add hover/press, and compose `<Button>` in compact mode. A managed file list / preview slot is additive (net-new feature to reach peer parity), not a teardown. Score is 2/5 because two of the four heavily-weighted axes (accessibility, motion) fail; clearing the P0 focus ring + the two motion P1s alone lifts it to a defensible 3-4.
