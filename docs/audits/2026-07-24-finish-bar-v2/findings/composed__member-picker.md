# composed/member-picker — finish-bar audit
Finish: 3/5   Market: LAGS(React Aria / Base UI Combobox)   Rebuild: polish

MemberPicker is a thin wrapper around `MultiSelectPopover` (MSP). It adds a member type,
an avatar+initials `renderItem`, and a legacy `selectedIds`/`onSelect(id)`/`multiple` API
shim. It correctly **composes** the primitive rather than re-rolling surface/popover/search
(no bespoke drift) and carries no hard visual slop tells in its own source. Its ceiling is
capped by a non-canonical API that hides the base primitive's better features, and it inherits
MSP's motion + a11y gaps. Source is unchanged since the 2026-07-01 baseline (still 3/5); all
prior P1s remain open through 0.52.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1 visual-integrity | ✓ | Own source is clean: `gap-ds-03`, `h-ico-md`, role tokens, semantic `text-surface-fg`, no accent rail / gradient / glass / emoji. Overlay surface (`bg-surface-overlay`) is the correct layer. Inherited from MSP: `max-h-[240px]` + inline `width:240` magic numbers and off-cadence `py-ds-02b` — flagged, but they live in the dependency. |
| 2 accessibility | gap | Inherited MSP listbox hardcodes `aria-multiselectable="true"` even when MemberPicker runs single-select (`maxSelections=1`) — the listbox lies about cardinality (real SR-correctness bug). Rows are ~sub-44px (`py-ds-02b`, no `touch-target`). No Home/End. Positives: search `aria-label`, `aria-activedescendant`, `role=option`/`aria-selected`, Arrow/Enter nav, focus managed via activedescendant. Operable + labeled, so not a P0 blocker. |
| 3 api-composability | ✗ | Non-canonical: `selectedIds`+`onSelect(memberId)` re-derives a single toggled id from MSP's clean `onValueChange(ids)` (loses info when a `maxSelections` replace drops 2 ids). `multiple:boolean` re-expresses `maxSelections` and blocks "pick up to N". Hardcoded avatar `renderItem` blocks base `groups`/`onSearch`/`emptyMessage`/`description`/`align`/`width`. No `value`/`defaultValue`/uncontrolled. Passthrough typed as `<div>` attrs but spreads onto MSP→PopoverContent (dishonest surface). forwardRef+displayName present. |
| 4 docs-dx | gap | Doc has Props/Defaults/Example/Composability/Gotchas/Changes and matches source, but example uses `Button variant="outline"` (violates soft-over-outline pref) and oversells composability the wrapper actually blocks (no async/grouped members). |
| 5 testing | gap | RTL covers render/open/select/filter/initials. No `vitest-axe`, no `describeConformance`, no keyboard-nav test, no multi-select toggle test, no empty-state assertion. |
| 6 motion | gap | Inherited from MSP: every row entrance `initial={{opacity:0,x:-8}}` with per-index `delay: index*0.02` stagger (fine at 6 members, ~1s at 50) + `springs.bouncy` check pop, and **no `useReducedMotion`/MotionConfig guard** anywhere in the chain. Re-animates on every open — a frequent action. Has opacity:0 (no slide-no-fade tell). |
| 7 state-coverage | gap | hover/selected/disabled/focused/loading/empty all designed in MSP — but `MemberPickerMember` exposes no `disabled` and no `onSearch`, so per-member disabled + async + loading are unreachable through MemberPicker. No selected-state affordance on the trigger (selection only visible inside the open popover; consumer must plumb count/avatars). |
| 8 content-resilience | gap | `truncate` + `min-w-0` handle long names; avatar `shrink-0`. But entrance `x:-8` is physical (LTR-biased, not mirrored for RTL). No grouping/overflow strategy exposed for very long member lists. |
| 9 theming-resilience | ✓ | `accent-2`/`accent-11` + `surface-overlay` survive brand accent swap and dark mode; radius via role tokens honors `[data-shape]`. No sunken track to invert. |
| 10 system-cohesion | ✓ | Shares DS springs, role radius, focus/spacing language; composes Avatar/Icon/Spinner/Popover/MSP — no bespoke drift. |
| 11 craft | ✓ | `getInitials` fallback, `scrollIntoView({block:'nearest'})` on focused row, replace-oldest behavior in single mode, `cursor-not-allowed` on disabled. |
| 12 perceived-performance | gap | Popover opens instantly; async spinner present. But no virtualization → long member lists render + stagger-animate every row on open (jank + perceived-readiness delay). No CLS. |
| 13 market-benchmark | ✗ | LAGS React Aria ComboBox / Base UI Combobox / cmdk: no virtualized listbox, no typeahead, no async exposed through MemberPicker, no grouping exposed, non-canonical selection API, and the single-mode `aria-multiselectable` inaccuracy. The underlying MSP is competent; MemberPicker hides most of it. |
| 14 cross-DS-adoption | info | See ideas below. |

## Top gaps (prioritized)
- [P0] accessibility — MSP hardcodes `aria-multiselectable="true"`; single-select MemberPicker (`maxSelections=1`) reports multi-select to SRs → fix belongs in MSP (derive from `maxSelections`), MemberPicker inherits.
- [P1] api-composability — expose canonical `value`/`onValueChange(ids)` (+`defaultValue`), demote `onSelect` to a `@deprecated` alias; replace `multiple` with forwarded `maxSelections?: number` (keep `multiple` as documented sugar).
- [P1] api-composability — forward a typed subset of base props (`onSearch`, `groups`, `emptyMessage`, `align`, `width`, `renderItem` override, item `description`); make avatar row the default, overridable. Type passthrough against `MultiSelectPopoverProps`, not `<div>` attrs.
- [P1] motion — gate MSP row entrance/stagger/bounce behind `useReducedMotion()`; MemberPicker inherits the fix.
- [P2] accessibility — bump row height to `touch-target` (≥44px); add Home/End keys in MSP.
- [P2] state-coverage — offer an optional default/`renderTrigger(selected)` trigger (avatar stack + count) so selection is visible without consumer plumbing; forward a member-appropriate `emptyMessage` default.
- [P2] testing — add a `vitest-axe` play test + keyboard-nav + multi-toggle coverage.
- [P2] docs-dx — switch doc/story trigger to `Button variant="soft"`; regenerate doc from the true forwarded prop surface; note trigger must be focusable.

## What it does well
- Composes the primitive honestly — delegates surface/popover/search to MSP, re-rolls nothing (the StatCard/Card drift anti-pattern is absent).
- Own source is visually clean and on-cadence; correct overlay surface layer; role radius tokens; theming + dark-mode safe.
- Real craft touches: initials fallback, focused-row scroll-into-view, replace-oldest single-select, disabled affordance.
- forwardRef + displayName correct; publish-gate stories present (single/multi/custom-placeholder/preselected/empty).

## Cross-DS adoption ideas
- **Base UI / React Aria Combobox** — virtualized listbox; adopt for long member rosters (kills the stagger-on-long-list jank).
- **React Aria ListBox** — typeahead first-match + Home/End/PageUp keys; MSP only has Arrow/Enter.
- **cmdk / Linear people-picker** — selected-avatar chips rendered inside the trigger + a "no members yet" empty affordance and optional "invite/create" row.
- **Base UI Combobox** — async loading skeleton rows (MSP shows only a spinner); surface through MemberPicker via `onSearch`.

## Rebuild note
**Polish**, not rebuild. MemberPicker's structure (compose MSP + avatar row) is right; the work is API realignment on the wrapper: canonical `value`/`onValueChange`/`maxSelections` with deprecated `onSelect`/`multiple` aliases, honest passthrough typing, and forwarding the base's hidden features. The one item that must land upstream in MultiSelectPopover — and is the sole reason a11y isn't scored higher — is the `aria-multiselectable` cardinality bug (P0) plus the reduced-motion guard; both are MSP fixes MemberPicker inherits for free.
