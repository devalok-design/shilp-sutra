# Full Standardization Audit — shilp-sutra Design System

**Date**: 2026-03-03
**Scope**: Every component file across all 4 modules + token architecture
**Method**: Parallel 6-agent sweep (4 module audits + grep scan + token consistency)
**Components audited**: 103 files, ~114 exported components
**Violations found**: ~232 mechanical + numerous design-level issues

---

## Executive Summary

| Module | Components | Avg Score | Worst Score | Best Score |
|--------|-----------|-----------|-------------|------------|
| **ui/** | 41 files | **8.8/10** | 3/10 (RenderAdjustmentType) | 10/10 (18 components) |
| **shared/** | 22 exports | **7.2/10** | 5/10 (LoadingSkeleton) | 10/10 (PageHeader) |
| **layout/** | 6 files | **6.0/10** | 5/10 (BottomNavbar, NotificationCenter) | 8/10 (AppCommandPalette) |
| **karm/** | 43 files | **5.4/10** | 2/10 (breaks.tsx, edit-break.tsx) | 9/10 (AccentProvider) |
| **Token architecture** | 4 files | **8.0/10** | — | — |
| **Overall** | **103 files** | **6.9/10** | | |

### Violation Distribution by Category

| Category | Count | Severity |
|----------|-------|----------|
| Arbitrary width/height (`w-[Npx]`, `h-[Npx]`) | ~80 | High |
| Raw half-step spacing (`0.5`, `2.5`, `3.5`) | 78 | Medium |
| Arbitrary spacing (`p-[10px]`, etc.) | 25 | Medium |
| Raw Tailwind sizing (`h-7`, `h-8`, `h-9`) | ~60 | Medium |
| Z-index violations (`z-10`, `z-[N]`) | 13 | Medium |
| Border radius (`rounded-full` not `rounded-ds-full`) | 18 | Low |
| Shadow violations | 5 | Low |
| Raw opacity (`opacity-50` not `opacity-[0.38]`) | 7 | Medium |
| Missing `forwardRef` | ~12 | High (structural) |
| Missing `...props` spread | ~8 | Medium (structural) |
| Raw/hex colors | 2 | Low |
| Raw typography (`text-2xl`) | 1 | Low |

---

## CRITICAL Issues (Must Fix — Broken at Runtime)

### C1. FileUpload malformed token names — CLASSES SILENTLY FAIL
**File**: `src/ui/file-upload.tsx` lines 201, 237, 269, 271, 325
**Issue**: Token names use single-digit format (`gap-ds-2`, `px-ds-3`, `py-ds-2`, `mt-ds-2`, `gap-ds-3`, `p-ds-8`) instead of two-digit format (`gap-ds-02`, `px-ds-03`, etc.). Tailwind will **not** generate these classes — spacing is silently missing at runtime.
**Fix**: `gap-ds-2` → `gap-ds-02`, `px-ds-3` → `px-ds-03`, `py-ds-2` → `py-ds-02`, `mt-ds-2` → `mt-ds-02`, `gap-ds-3` → `gap-ds-03`, `p-ds-8` → `p-ds-08`

### C2. BreakAdmin non-functional class
**File**: `src/karm/admin/break/break-admin.tsx` line 554
**Issue**: `text-var(--color-text-primary)` is an invalid Tailwind class. Active tab text color is not applied.
**Fix**: `text-var(--color-text-primary)` → `text-text-primary`

### C3. DashboardHeader / Calendar invalid CSS class names
**Files**: `src/karm/admin/dashboard/dashboard-header.tsx` lines 101, 104, 133, 237; `src/karm/admin/dashboard/calendar.tsx` line 76
**Issue**: `flex-direction-row` and `justify-flex-start` are not valid Tailwind utilities. They produce no CSS output.
**Fix**: `flex-direction-row` → `flex-row`, `justify-flex-start` → `justify-start`

### C4. Badge uses primitive color tokens directly
**File**: `src/ui/badge.tsx` lines 22, 24
**Issue**: `border-[var(--pink-200)]` and `border-[var(--purple-200)]` reference raw primitive CSS variables. These will not adapt to dark mode and violate the token architecture's core rule.
**Fix**: Use semantic border tokens (`border-interactive`, `border-accent`, or define `border-brand` / `border-accent-subtle`)

### C5. body-md-semibold documented but does not exist
**File**: `src/tokens/typography-semantic.css` line 10
**Issue**: Migration guide comment maps `B2-Semibold → body-md-semibold`, but no `--typo-body-md-semibold-*` tokens exist. Migration will silently fail.
**Fix**: Either add the tokens or remove the migration reference

---

## HIGH Priority Issues

### H1. Missing `forwardRef` on 12+ components

CONTRIBUTING.md mandates `React.forwardRef` for every component. These are non-compliant:

| Module | Component | File |
|--------|-----------|------|
| ui/ | RenderAdjustmentType | `render-adjustment-type.tsx` |
| ui/ | VisuallyHidden | `visually-hidden.tsx` |
| ui/ | Skeleton | `skeleton.tsx` |
| shared/ | CommandPalette | `command-palette.tsx` |
| shared/ | DatePicker | `date-picker/date-picker.tsx` |
| shared/ | DateRangePicker | `date-picker/date-range-picker.tsx` |
| shared/ | DateTimePicker | `date-picker/date-time-picker.tsx` |
| shared/ | TimePicker | `date-picker/time-picker.tsx` |
| karm/ | TaskCard | `board/task-card.tsx` |
| karm/ | ChatPanel | `chat/chat-panel.tsx` |
| karm/ | TaskDetailPanel | `tasks/task-detail-panel.tsx` |
| karm/ | DeleteBreak | `admin/break/delete-break.tsx` |
| karm/ | EditBreakBalance | `admin/break/edit-break-balance.tsx` |
| karm/ | EditBreak | `admin/break/edit-break.tsx` |
| karm/ | LeaveRequest | `admin/break/leave-request.tsx` |
| layout/ | NotificationPreferences | `notification-preferences.tsx` |
| layout/ | AppCommandPalette | `app-command-palette.tsx` |

### H2. Missing `...props` spread on root element (8 components)
**Files**: `sidebar.tsx`, `top-bar.tsx`, `bottom-navbar.tsx`, `notification-center.tsx` (layout); several karm/ components
**Issue**: `forwardRef` callback destructures named props but never spreads remaining HTML attributes.

### H3. Token system gaps — `h-9` (36px) used in 15+ components
The sizing token scale jumps from `h-ds-sm` (32px) to `h-ds-md` (40px). The value `h-9` (36px) appears in:
- All date-picker trigger buttons
- InputOTP slots
- Pagination links
- Menubar/NavigationMenu triggers
- Breadcrumb ellipsis
- layout/ avatar buttons

**Recommendation**: Either add `--size-sm-plus: 36px` token or standardize all to `h-ds-sm` (32px) or `h-ds-md` (40px).

### H4. Token system gaps — `h-7` (28px) used in 10+ components
Same problem: `h-7` (28px) falls between `h-ds-xs` (24px) and `h-ds-sm` (32px). Used in:
- Rich text editor toolbar buttons
- Chat module icon buttons
- Calendar navigation buttons
- Page skeleton elements

### H5. Chart tokens not exposed in Tailwind preset
**File**: `src/tailwind/preset.ts`
**Issue**: `--chart-1` through `--chart-8` are defined in semantic.css but not mapped in preset.ts colors. Charts bypass the Tailwind layer entirely via inline style injection.

### H6. `--color-focus-inset` not exposed in preset
**File**: `src/tailwind/preset.ts`
**Issue**: Defined in semantic.css (light + dark) but missing from colors map. Components must use arbitrary value syntax.

### H7. `opacity-40` vs `opacity-[0.38]` inconsistency
The WCAG-compliant disabled opacity is `0.38` (used in ~30 components). But 7 files use `opacity-40` instead:
- `src/ui/data-table.tsx` lines 683, 706
- `src/ui/tree-view/tree-item.tsx` line 129
- `src/shared/date-picker/calendar-grid.tsx` line 247
- `src/shared/date-picker/month-picker.tsx` line 53
- `src/shared/date-picker/year-picker.tsx` line 45
- `src/karm/admin/dashboard/admin-dashboard.tsx` line 349

### H8. karm/admin uses legacy/phantom token
**File**: `src/karm/admin/break/breaks.tsx` line 91
**Issue**: `bg-[var(--mapped-borders-margin-tertiary)]` references a CSS variable that doesn't exist in the current token architecture. Legacy from previous design system.

### H9. Hardcoded font family
**File**: `src/karm/admin/break/leave-request.tsx` line 198
**Issue**: `placeholder:font-["Bricolage_Grotesque"]` bypasses the `font-accent` design token.

---

## MEDIUM Priority Issues

### M1. Pervasive raw half-step spacing (78 instances)
The most common raw spacing values and their token equivalents:
| Raw Value | Pixel | Suggested Token |
|-----------|-------|----------------|
| `p-0.5` / `py-0.5` | 2px | `p-ds-01` / `py-ds-01` |
| `mt-0.5` / `ml-0.5` | 2px | `mt-ds-01` / `ml-ds-01` |
| `gap-0.5` | 2px | `gap-ds-01` |
| `px-2.5` / `gap-2.5` | 10px | `px-ds-02b` / `gap-ds-02b` (6px) or `px-ds-03` (8px) |
| `py-3.5` / `p-3.5` | 14px | `py-ds-04` (12px) or `py-ds-05` (16px) |
| `top-1.5` / `top-3.5` | 6px/14px | `top-ds-02b` / `top-ds-04` |

**Worst files**: `task-properties.tsx` (10), `sidebar.tsx` (8), `loading-skeleton.tsx` (4), `page-skeletons.tsx` (3)

### M2. `p-[10px]` pattern in admin tables (12+ instances)
**File**: `src/karm/admin/adjustments/approved-adjustments.tsx` — 12 occurrences
**Also**: `break-balance.tsx`, `break-admin-skeleton.tsx`
**Fix**: `p-[10px]` → `p-ds-02b` (6px) or `p-ds-03` (8px) — pick closest token

### M3. Arbitrary viewport calc heights in karm/admin/dashboard
Pattern: `max-md:h-[calc(100vh-586px)]`, `min-h-[407.2px]`, etc.
**Files**: `correction-list.tsx`, `leave-requests.tsx`, `approved-adjustments.tsx`, `admin-dashboard.tsx`, `dashboard-skeleton.tsx`
**Issue**: Magic pixel values coupled to specific page layouts. Fragile and not tokenizable.
**Recommendation**: Extract to CSS custom properties or use `flex-1`/`min-h-0` overflow patterns.

### M4. Arbitrary shadows in karm/admin
Custom `shadow-[0px_4px_4px_0px_var(--color-inset-glow)...]` patterns in:
- `render-date.tsx` (5 instances)
- `edit-break.tsx` (1 instance)
- `calendar.tsx` (1 instance)
**Fix**: Use `shadow-01` through `shadow-05` or `shadow-brand`

### M5. `rounded-full` instead of `rounded-ds-full` (12 instances)
Straightforward find-and-replace across: `combobox.tsx`, `icon-button.tsx`, `skeleton.tsx`, `file-upload.tsx` (2), chart components (3), `break-request.tsx` (3), `render-date.tsx` (2)

### M6. `rounded-none` not tokenized
**File**: `src/tailwind/preset.ts`
**Issue**: `--radius-none` is defined in semantic.css but not exposed as `rounded-ds-none` in preset. 6 component instances use bare `rounded-none`.

### M7. `z-10` raw z-index (9 instances)
Should map to `z-raised` (10) which exists in the token system:
- `data-table.tsx` (2), `navigation-menu.tsx`, `input-otp.tsx`, `sidebar.tsx`, `activity-tab.tsx`, `task-detail-panel.tsx`, `calendar.tsx`
Plus `z-20` in `sidebar.tsx` (needs `z-raised` or new token)

### M8. Stack component accepts arbitrary gap strings
**File**: `src/ui/stack.tsx` line 42
**Issue**: `gap && \`gap-${gap}\`` constructs class names from raw strings, allowing non-token values.
**Fix**: Accept only `ds-*` token keys or enumerate allowed gap values.

### M9. Missing `cn()` in className handling
**File**: `src/karm/dashboard/daily-brief.tsx`
**Issue**: Uses `${className || ''}` string concatenation instead of `cn()` utility.

### M10. `window.confirm()` anti-pattern
**File**: `src/karm/tasks/task-properties.tsx` line 207
**Issue**: Browser's native confirm dialog cannot be styled, tested, or overridden. Should use Dialog component.

---

## LOW Priority Issues

### L1. `--spacing-02b` / `--spacing-05b` naming convention
Non-standard "b" suffix breaks the numeric naming pattern. Consider renaming to numeric equivalents.

### L2. Gradient token naming ambiguity
`--gradient-brand-light` and `--gradient-brand-dark` have different values in `:root` vs `.dark`, making the `-light/-dark` suffix misleading.

### L3. Legacy typography.css still imported
`src/tokens/typography.css` marked DEPRECATED but still in the import chain, shipping unused `.T1-Reg` / `.B2-Reg` classes.

### L4. `--max-width` / `--max-width-body` redundantly in `.dark` block
Non-color layout tokens don't need dark mode overrides.

### L5. `--font-size-lg` (18px) unused in semantic typography
Defined in primitives and preset but no `--typo-*` variant uses it. Gap between body-lg (16px) and heading-xs (20px).

### L6. `minWidth` scale missing from preset
`width`, `height`, `minHeight` have `ds-*` entries but `minWidth` does not.

### L7. TreeItem inline depth calculation
**File**: `src/ui/tree-view/tree-item.tsx` line 122
`style={{ paddingLeft: depth * 20 + 8 }}` bypasses token system for indentation.

---

## Token Architecture Health

| Dimension | Score |
|-----------|-------|
| Primitive completeness | 10/10 |
| Semantic token completeness | 8/10 |
| Dark mode coverage | 9/10 |
| Typography completeness | 7/10 |
| Naming consistency | 8/10 |
| Preset ↔ CSS alignment | 8/10 |
| Scale consistency | 9/10 |
| Architecture quality | 9/10 |
| **Overall** | **8.0/10** |

---

## Fully Compliant Components (Score 10/10)

These 19 components have zero violations:

**ui/**: Accordion, AlertDialog, AspectRatio, Banner, ButtonGroup, Card, Checkbox, Chip, Code, Collapsible, Container, ContextMenu, Dialog, Form, HoverCard, IconButton, Input, Link, Popover, Select, Sheet, Tabs, Text, Textarea, Toaster, Toggle, ToggleGroup, Tooltip, Transitions

**shared/**: PageHeader

---

## Worst Offending Components (Bottom 10)

| Rank | Component | Module | Score | Key Issues |
|------|-----------|--------|-------|------------|
| 1 | breaks.tsx | karm/admin | 2/10 | Legacy CSS var, arbitrary %-widths, no cn() |
| 2 | edit-break.tsx | karm/admin | 2/10 | Arbitrary shadows, z-[4], no forwardRef |
| 3 | RenderAdjustmentType | ui/ | 3/10 | Not a proper component |
| 4 | associate-detail.tsx | karm/admin | 3/10 | rounded-3xl, inline styles |
| 5 | leave-requests.tsx | karm/admin | 3/10 | 407.2px magic number, viewport calcs |
| 6 | break-admin.tsx | karm/admin | 4/10 | Non-functional class, raw z-index |
| 7 | break-balance.tsx | karm/admin | 4/10 | Arbitrary % widths, calc values |
| 8 | break-request.tsx | karm/admin | 4/10 | rounded-full, arbitrary dividers |
| 9 | approved-adjustments.tsx | karm/admin | 4/10 | p-[10px] x12, viewport calcs |
| 10 | dashboard-header.tsx | karm/admin | 4/10 | Invalid flex-direction-row class |

---

## Recommended Fix Order

### Sprint 1: Critical Fixes (runtime bugs)
1. Fix FileUpload malformed token names (C1)
2. Fix BreakAdmin non-functional class (C2)
3. Fix DashboardHeader/Calendar invalid classes (C3)
4. Fix Badge primitive color tokens (C4)

### Sprint 2: Structural Compliance
5. Add forwardRef to 12+ components (H1)
6. Add ...props spread to 8 components (H2)
7. Fix opacity-40 → opacity-[0.38] (H7)
8. Replace legacy CSS var in breaks.tsx (H8)
9. Replace hardcoded font in leave-request.tsx (H9)

### Sprint 3: Token System Gaps
10. Decide on h-9 (36px) — add token or normalize (H3)
11. Decide on h-7 (28px) — add token or normalize (H4)
12. Expose chart tokens in preset (H5)
13. Expose focus-inset in preset (H6)
14. Add rounded-ds-none to preset (M6)
15. Add minWidth scale to preset (L6)

### Sprint 4: Spacing Standardization
16. Replace 78 raw half-step spacing values (M1)
17. Replace p-[10px] pattern in admin tables (M2)
18. Replace rounded-full → rounded-ds-full (M5)
19. Replace z-10 → z-raised (M7)

### Sprint 5: karm/admin Deep Refactor
20. Replace viewport calc magic numbers (M3)
21. Replace arbitrary shadows (M4)
22. Fix Stack gap prop typing (M8)
23. Fix cn() usage in DailyBrief (M9)
24. Replace window.confirm() (M10)
25. Full rewrite of breaks.tsx, edit-break.tsx, associate-detail.tsx

### Sprint 6: Cleanup
26. Remove legacy typography.css import (L3)
27. Clean up gradient naming (L2)
28. Remove redundant dark mode declarations (L4)
29. Add body-md-semibold or remove migration reference (C5)
30. Address font-size-lg gap in typography (L5)

---

## Appendix: Module-by-Module Component Scores

### ui/ (41 files, avg 8.8)
| Component | Score | | Component | Score |
|-----------|-------|-|-----------|-------|
| Accordion | 10 | | Autocomplete | 8 |
| Alert | 8 | | AlertDialog | 10 |
| AspectRatio | 10 | | Avatar | 7 |
| AvatarStack | 7 | | Badge | 8 |
| Banner | 10 | | Breadcrumb | 8 |
| Button | 8 | | ButtonGroup | 10 |
| Card | 10 | | Checkbox | 10 |
| Chip | 10 | | Code | 10 |
| Collapsible | 10 | | Combobox | 8 |
| Container | 10 | | ContextMenu | 10 |
| DataTable | 6 | | DataTableToolbar | 8 |
| Dialog | 10 | | DropdownMenu | 9 |
| FileUpload | 7 | | Form | 10 |
| HoverCard | 10 | | IconButton | 10 |
| Input | 10 | | InputOTP | 9 |
| Label | 9 | | Link | 10 |
| Menubar | 9 | | NavigationMenu | 8 |
| NumberInput | 7 | | Pagination | 9 |
| Popover | 10 | | Progress | 9 |
| RadioGroup | 9 | | RenderAdjustmentType | 3 |
| SearchInput | 9 | | Select | 10 |
| Separator | 9 | | Sheet | 10 |
| Sidebar | 7 | | Skeleton | 10 |
| Slider | 9 | | Spinner | 9 |
| Stack | 8 | | StatCard | 9 |
| Stepper | 8 | | Switch | 9 |
| Table | 8 | | Tabs | 10 |
| Text | 10 | | Textarea | 10 |
| Toast | 9 | | Toaster | 10 |
| Toggle | 10 | | ToggleGroup | 10 |
| Tooltip | 10 | | Transitions | 10 |
| TreeView | 8 | | TreeItem | 8 |
| VisuallyHidden | 6 | | Charts (avg) | 7 |

### shared/ (13 files, avg 7.2)
| Component | Score | | Component | Score |
|-----------|-------|-|-----------|-------|
| PageHeader | 10 | | ContentCard | 9 |
| GlobalLoading | 9 | | Presets | 9 |
| StatusBadge | 8 | | PriorityIndicator | 8 |
| ErrorDisplay | 7 | | AvatarGroup | 7 |
| RichTextEditor | 7 | | CalendarGrid | 7 |
| MonthPicker | 7 | | YearPicker | 7 |
| TimePicker | 7 | | MemberPicker | 7 |
| DatePicker | 7 | | DateTimePicker | 6 |
| DateRangePicker | 6 | | CommandPalette | 6 |
| EmptyState | 6 | | LoadingSkeleton | 5 |
| PageSkeletons | 5 | | | |

### layout/ (6 files, avg 6.0)
| Component | Score |
|-----------|-------|
| AppCommandPalette | 8 |
| AppSidebar | 6 |
| TopBar | 6 |
| NotificationPreferences | 6 |
| BottomNavbar | 5 |
| NotificationCenter | 5 |

### karm/ (43 files, avg 5.4)
| Component | Score | | Component | Score |
|-----------|-------|-|-----------|-------|
| AccentProvider | 9 | | icons.tsx | 9 |
| render-status.tsx | 9 | | SegmentedControl | 7 |
| KanbanBoard | 7 | | ChatInput | 7 |
| FilesTab | 7 | | ReviewTab | 7 |
| ProjectCard | 7 | | DailyBrief | 7 |
| StreamingText | 7 | | ConversationList | 6 |
| MessageList | 6 | | ConversationTab | 6 |
| SubtasksTab | 6 | | TaskProperties | 6 |
| ActivityTab | 6 | | AttendanceCTA | 6 |
| ClientPortalHeader | 6 | | DeleteBreak | 6 |
| EditBreakBalance | 6 | | ChatPanel | 5 |
| TaskCard | 5 | | BoardColumn | 5 |
| TaskDetailPanel | 5 | | AdminDashboard | 5 |
| AttendanceOverview | 5 | | RenderDate | 5 |
| DashboardSkeleton | 4 | | Header (break) | 4 |
| BreakAdmin | 4 | | BreakAdminSkeleton | 4 |
| BreakBalance | 4 | | BreakRequest | 4 |
| Calendar | 4 | | CorrectionList | 4 |
| DashboardHeader | 4 | | LeaveRequest | 4 |
| ApprovedAdjustments | 4 | | LeaveRequests | 3 |
| AssociateDetail | 3 | | EditBreak | 2 |
| Breaks | 2 | | | |
