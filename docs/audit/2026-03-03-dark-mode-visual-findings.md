# Dark Mode Visual Audit Findings

**Date:** 2026-03-03
**Scope:** Token coverage, focus rings, shadows, status colors, chart palette
**Method:** Automated code analysis across all ~125 components

---

## Executive Summary

The dark mode implementation is **structurally sound** with 97/97 color tokens having `.dark` overrides and a well-organized elevation hierarchy. However, the audit uncovered **4 critical bugs**, **8 high-priority a11y gaps**, and several medium-priority improvements.

| Category | Rating |
|----------|--------|
| Token Coverage (light/dark parity) | Good (97/97) |
| Focus Ring Visibility | Needs Attention (18 components missing) |
| Shadow/Elevation | Needs Attention (3 broken shadow nestings) |
| Status Color Surfaces | Good (1 tag contrast concern) |
| Chart Palette | Needs Attention (1 undefined token) |

---

## 1. Token Coverage Audit

### Token Parity: Perfect
- **`:root` color tokens**: 97
- **`.dark` color tokens**: 97
- **Missing dark variants**: None

### Orphan Token References (bugs)

| Token Referenced | File | Severity |
|-----------------|------|----------|
| `--color-text-accent` (undefined) | `src/karm/admin/break/leave-request.tsx:89` | HIGH |
| `--color-text-muted` (undefined) | `src/ui/charts/radar-chart.tsx:200` | HIGH |
| `--color-border-focus` (undefined) | `src/ui/data-table.tsx:153, 583` | HIGH |

These tokens are used via `var()` but do not exist in `semantic.css`. The browser will silently fall back, causing invisible or unstyled elements.

### Malformed Tailwind Class

| Issue | File | Severity |
|-------|------|----------|
| `text-var(--color-text-primary)` (missing brackets) | `src/karm/admin/break/break-admin.tsx:318` | HIGH |

This class is silently ignored by Tailwind, leaving text unstyled.

### Recommended Fixes
- `--color-text-accent` -> use `--color-text-interactive` or `--color-accent`
- `--color-text-muted` -> use `--color-text-tertiary` or `--color-text-placeholder`
- `--color-border-focus` -> use `--color-focus` or `--color-border-interactive`
- `text-var(...)` -> fix to `text-text-primary`

---

## 2. Focus Ring Audit

### What Works Well
- ~35 components implement the canonical `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus` pattern
- Focus token (`--color-focus`) has good values: `pink-500` (light) / `pink-400` (dark)
- All date-picker components in `src/shared/` are consistently implemented
- Menu items use acceptable `focus:bg-layer-02` pattern for managed menus

### Components MISSING Focus Rings (Critical/High)

| Component | File | Severity |
|-----------|------|----------|
| NumberInput (all 3 elements) | `src/ui/number-input.tsx:65,79,87` | CRITICAL |
| FileUpload (compact + dropzone) | `src/ui/file-upload.tsx:200,258` | HIGH |
| Chip (clickable + delete button) | `src/ui/chip.tsx:64,78` | HIGH |
| SegmentedControl | `src/karm/custom-buttons/segmented-control.tsx` | HIGH |
| MemberPicker (option buttons) | `src/shared/member-picker.tsx:83` | HIGH |
| DataTableToolbar (global search) | `src/ui/data-table-toolbar.tsx:123` | HIGH |
| DataTable (inline search) | `src/ui/data-table.tsx:627` | HIGH |

### Components with `outline-none` but No Alternative (Medium)

| Component | File |
|-----------|------|
| Combobox (search input) | `src/ui/combobox.tsx:316` |
| Collapsible (trigger) | `src/ui/collapsible.tsx:8` |
| ChatInput (textarea) | `src/karm/chat/chat-input.tsx:66` |
| SubtasksTab (input) | `src/karm/tasks/subtasks-tab.tsx:205` |
| TaskDetailPanel (title) | `src/karm/tasks/task-detail-panel.tsx:278` |
| TaskProperties (input) | `src/karm/tasks/task-properties.tsx:402` |
| AssociateDetail (input/textarea) | `src/karm/admin/dashboard/associate-detail.tsx:302,396` |
| EditBreak (input) | `src/karm/admin/break/edit-break.tsx:651` |
| LeaveRequests (input) | `src/karm/admin/dashboard/leave-requests.tsx:317` |

### Ring Offset Dark Mode Issue

~15 components use `ring-offset-2` but the ring offset color defaults to white. In dark mode, this creates a visible white gap between the element and the pink focus ring. Should apply `ring-offset-background` or use `--color-focus-inset` (token exists but is unused).

### Inconsistency
- `src/ui/autocomplete.tsx:129` uses `focus:` instead of `focus-visible:` (mouse clicks trigger ring)

---

## 3. Shadow/Elevation Audit

### Shadow Token Coverage: Complete
All 6 shadow tokens have `.dark` overrides with ~3x opacity multiplier (industry standard).

| Token | Light Opacity | Dark Opacity |
|-------|--------------|-------------|
| shadow-01 | 0.10 | 0.30 |
| shadow-02 | 0.12 | 0.40 |
| shadow-03 | 0.14 | 0.50 |
| shadow-04 | 0.18 | 0.60 |
| shadow-05 | 0.22 | 0.70 |
| shadow-brand | 0.25 | 0.35 |

### Broken Shadow Nesting (BUG)

3 locations nest `var(--shadow-02)` (a full shorthand value) inside an arbitrary `shadow-[...]` declaration, producing **invalid CSS**:

| File | Line(s) |
|------|---------|
| `src/karm/admin/break/edit-break-balance.tsx` | 87 |
| `src/karm/admin/break/edit-break.tsx` | 417, 627 |

These elements render with **no shadow at all** in both modes.

### Improvement Opportunities
- `shadow-brand` dark multiplier (1.4x) is much lower than neutral shadows (3x); consider increasing to 0.40-0.45
- 3 inline `style={{ boxShadow }}` in `break-request.tsx` should migrate to `className="shadow-02"`
- `shadow-05` at 0.70 opacity may be too heavy; visual review recommended

---

## 4. Status Color Audit

### Status Token Coverage: Complete
All 4 statuses (success/error/warning/info) have complete token sets (base, surface, border, text) with `.dark` overrides. All 7 tag colors (neutral/blue/green/red/yellow/magenta/purple) have bg/text/border with `.dark` overrides.

### Status Surface Contrast (Dark Mode): Excellent

| Status | Surface | Text | Est. Contrast |
|--------|---------|------|---------------|
| Success | green-900 | green-200 | ~8.5:1 |
| Error | red-900 | red-200 | ~7.2:1 |
| Warning | yellow-900 | yellow-200 | ~9.5:1 |
| Info | blue-900 | blue-200 | ~7.8:1 |

All easily exceed WCAG AA (4.5:1).

### Tag Contrast Concern

| Tag | Dark BG | Dark Text | Est. Contrast | Verdict |
|-----|---------|-----------|---------------|---------|
| Red | red-700 (#b30b00) | red-100 (#ff9c95) | ~3.5:1 | **FAILS AA** |

The red tag in dark mode has insufficient contrast for small text. Recommend darkening the background to `red-800` or `red-900`.

---

## 5. Chart Palette Audit

### Chart Token Coverage: Complete
8 chart colors (`--chart-1` through `--chart-8`) all have `.dark` overrides. Colors shift from 500-weight (light) to 400-weight (dark).

### Dark Mode Chart Contrast

| Token | Dark Hex | vs layer-01 (#282425) | Verdict |
|-------|----------|----------------------|---------|
| chart-1 (pink) | #d97195 | ~6.2:1 | Pass |
| chart-2 (purple) | #ab9ded | ~6.5:1 | Pass |
| chart-3 (blue) | #1d88c8 | ~3.5:1 | Borderline (meets 3:1 graphical) |
| chart-4 (green) | #2aa648 | ~3.8:1 | Borderline (meets 3:1 graphical) |
| chart-5 (yellow) | #cc9600 | ~4.5:1 | Pass |
| chart-6 (red) | #eb3a2e | ~3.8:1 | Borderline |
| chart-7 (cyan) | #22d3ee | ~7.5:1 | Pass |
| chart-8 (orange) | #fb923c | ~5.8:1 | Pass |

### Critical Bug
- `--color-text-muted` referenced in `radar-chart.tsx:200` does not exist. Level labels are invisible in dark mode.

### Minor Gaps
- `chart-7` and `chart-8` use hardcoded hex (no cyan/orange primitives exist)
- No colorblind-safe alternate palette
- `chart-3` (blue) and `chart-7` (cyan) are close in hue for multi-series charts

---

## 6. Prioritized Action Items

### Critical (Must Fix)
1. **NumberInput** -- add `focus-visible:ring-2 focus-visible:ring-focus` to all 3 interactive elements
2. **Broken shadow nesting** -- fix `var(--shadow-02)` inside `shadow-[...]` in edit-break-balance.tsx and edit-break.tsx (3 locations)
3. **Undefined token references** -- replace `--color-text-accent`, `--color-text-muted`, `--color-border-focus` with valid tokens
4. **Malformed Tailwind class** -- fix `text-var(--color-text-primary)` in break-admin.tsx

### High Priority
5. **FileUpload** -- add focus rings to compact button and drop zone
6. **Chip** -- add focus rings to clickable chips and delete buttons
7. **SegmentedControl** -- add focus ring to tab buttons
8. **DataTable/Toolbar search inputs** -- add focus styling (replace bare `outline-none`)
9. **MemberPicker option buttons** -- add focus styling
10. **Red tag dark contrast** -- darken `--color-tag-red-bg` in `.dark` from `red-700` to `red-800`/`red-900`
11. **Ring offset dark mode** -- apply `ring-offset-background` or `ring-offset-[var(--color-focus-inset)]` on ~15 components

### Medium Priority
12. **Radar chart** -- fix `fill-[var(--color-text-muted)]` to `fill-text-tertiary`
13. **RichTextEditor** -- fix `focus-within:border-[var(--border-secondary)]` to use valid token
14. **Karm domain inputs** (8 instances) -- add focus ring alternatives
15. **shadow-brand** dark opacity -- increase from 0.35 to 0.40-0.45

### Low Priority
16. **Autocomplete** -- change `focus:` to `focus-visible:` for consistency
17. **Inline boxShadow styles** -- migrate 3 instances to Tailwind `shadow-02` class
18. **`--color-focus-inset`** -- token defined but unused; apply to ring-offset-color
