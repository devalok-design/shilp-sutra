# Full Consistency Audit — 2026-03-13

**Scope:** Every component across all 4 package areas, scored against the 8-item CONTRIBUTING.md checklist.
**Method:** Fresh audit — 4 parallel agents, each reading every source file.
**Total components audited:** 158

---

## Executive Summary (Post-Fix)

> **Status: ALL 5 WAVES COMPLETE** — Updated 2026-03-13

| Package | Components | Pre-Fix Avg | Post-Fix Avg | Perfect (pre) | Perfect (post) |
|---------|-----------|-------------|--------------|---------------|----------------|
| core/ui | 72 | 86% | 95% | 18 | 42+ |
| core/composed | 31 | 68% | 85% | 7 | 12+ |
| core/shell | 7 | 72% | 90% | 2 | 4+ |
| karm | 48 | 71% | 87% | 2 | 10+ |
| **TOTAL** | **158** | **77%** | **91%** | **29** | **68+** |

### Overall Health Score: **9.1 / 10** (up from 7.7 pre-fix, 6.2 on March 3)

### Pass Rate by Checklist Item — Before → After

| Checklist Item | Pre-Fix | Post-Fix | Delta | Commits |
|----------------|---------|----------|-------|---------|
| 1. forwardRef | 87% | **98%** | +11% | `c76e5c5` (17 components) |
| 2. displayName | 100% | **100%** | — | — |
| 3. className+cn | 80% | **97%** | +17% | `fde95cb` (80 components) |
| 4. props spread | 46% | **97%** | +51% | `fde95cb` (80 components) |
| 5. CVA | 95% | **95%** | — | — |
| 6. Props export | 85% | **94%** | +9% | `30c3570` (14 Radix wrappers) |
| 7. Test (w/ axe) | 65% | **89%** | +24% | `30c3570` (21 core) + `f79b175` (16 karm) |
| 8. Story (autodocs) | 93% | **97%** | +4% | `3a3d5e2` (6 stories) |

### Fix Summary

| Wave | What | Commit | Components Fixed |
|------|------|--------|-----------------|
| 1 | Props spread (`...props`) | `fde95cb` | 80 across all packages |
| 2 | className + cn() | `fde95cb` | (same commit as Wave 1) |
| 3 | Tests (vitest-axe) | `30c3570` + `f79b175` | 37 new test files (21 core + 16 karm) |
| 4 | forwardRef | `c76e5c5` | 17 (8 charts + 2 core + 2 shell + 5 board) |
| 5a | Props exports | `30c3570` | 14 Radix wrappers + LinkProvider |
| 5b | Stories | `3a3d5e2` | 6 (ConfirmDialog + 4 board + PageSkeletons) |

### Remaining Gaps (not addressed)

These are known items that remain unfixed — intentional or low-priority:

- **props spread**: ~5 components where spreading isn't appropriate (context providers, render-prop wrappers)
- **forwardRef**: DataTable, DataTableToolbar (complex table refs), ConfirmDialog (dialog forwarding is non-trivial)
- **className+cn**: Some karm admin/chat internals where className isn't meaningful (pure logic wrappers)
- **Tests**: Collapsible, Form, Menubar, NavigationMenu, Sidebar, TreeView, VisuallyHidden (core/ui) — mostly Radix-heavy compound components
- **Stories**: ColorInput (needs color picker interaction), LinkProvider (context-only, no visual)

---

## Pre-Fix Baseline (original audit scores below)

---

## Package 1: core/ui (72 components)

### Perfect Scores (18)

Alert, Avatar, Badge, Banner, Button, Card, Chip, Input, Progress, Select, Sheet, Skeleton, Tabs, Text, Textarea, Toast, Toggle, ToggleGroup

### Worst Offenders

| Component | Score | Key Gaps |
|-----------|-------|----------|
| AspectRatio | 2/7 (29%) | No forwardRef, no cn(), no props spread, no Props export, no test |
| Toaster | 2/7 (29%) | No forwardRef, no cn(), no props spread, no Props export, no test |
| AreaChart | 4/7 (57%) | No forwardRef, no props spread, no test |
| BarChart | 4/7 (57%) | No forwardRef, no props spread, no test |
| LineChart | 4/7 (57%) | No forwardRef, no props spread, no test |
| PieChart | 4/7 (57%) | No forwardRef, no props spread, no test |
| RadarChart | 4/7 (57%) | No forwardRef, no props spread, no test |
| GaugeChart | 4/7 (57%) | No forwardRef, no props spread, no test |
| Sparkline | 4/7 (57%) | No forwardRef, no props spread, no test |
| ChartContainer | 4/7 (57%) | No forwardRef, no props spread, no test |
| DataTableToolbar | 4/6 (67%) | No forwardRef, no test |

### Full Matrix

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | Accordion | P | P | P | P | N/A | P | P | P | 7/7 |
| 2 | Alert | P | P | P | P | P | P | P | P | 8/8 |
| 3 | AlertDialog | P | P | P | P | N/A | F | F | P | 5/7 |
| 4 | AspectRatio | F | P | F | F | N/A | F | F | P | 2/7 |
| 5 | Autocomplete | P | P | P | F | N/A | P | P | P | 6/7 |
| 6 | Avatar | P | P | P | P | P | P | P | P | 8/8 |
| 7 | Badge | P | P | P | P | P | P | P | P | 8/8 |
| 8 | Banner | P | P | P | P | P | P | P | P | 8/8 |
| 9 | Breadcrumb | P | P | P | P | N/A | F | P | P | 6/7 |
| 10 | Button | P | P | P | P | P | P | P | P | 8/8 |
| 11 | ButtonGroup | P | P | P | P | N/A | P | P | P | 7/7 |
| 12 | Card | P | P | P | P | P | P | P | P | 8/8 |
| 13 | Checkbox | P | P | P | P | N/A | P | P | P | 7/7 |
| 14 | Chip | P | P | P | P | P | P | P | P | 8/8 |
| 15 | Code | P | P | P | P | F | P | P | P | 7/8 |
| 16 | Collapsible | P | P | P | P | N/A | P | F | P | 6/7 |
| 17 | ColorInput | P | P | P | F | N/A | P | P | F | 5/7 |
| 18 | Combobox | P | P | P | P | N/A | P | P | P | 7/7 |
| 19 | Container | P | P | P | P | N/A | P | P | P | 7/7 |
| 20 | ContextMenu | P | P | P | P | N/A | F | F | P | 5/7 |
| 21 | DataTable | F | P | P | N/A | N/A | P | P | P | 5/6 |
| 22 | DataTableToolbar | F | P | P | N/A | N/A | P | F | P | 4/6 |
| 23 | Dialog | P | P | P | P | N/A | F | P | P | 6/7 |
| 24 | DropdownMenu | P | P | P | P | N/A | F | P | P | 6/7 |
| 25 | FileUpload | P | P | P | P | N/A | P | P | P | 7/7 |
| 26 | Form | P | P | P | P | N/A | P | F | P | 6/7 |
| 27 | HoverCard | P | P | P | P | N/A | P | P | P | 7/7 |
| 28 | IconButton | P | P | P | P | N/A | P | P | P | 7/7 |
| 29 | Input | P | P | P | P | P | P | P | P | 8/8 |
| 30 | InputOtp | P | P | P | P | N/A | F | P | P | 6/7 |
| 31 | Label | P | P | P | P | N/A | P | P | P | 7/7 |
| 32 | Link | P | P | P | P | N/A | P | P | P | 7/7 |
| 33 | Menubar | P | P | P | P | N/A | F | F | P | 5/7 |
| 34 | NavigationMenu | P | P | P | P | N/A | F | F | P | 5/7 |
| 35 | NumberInput | P | P | P | P | N/A | P | P | P | 7/7 |
| 36 | Pagination | P | P | P | P | N/A | P | P | P | 7/7 |
| 37 | Popover | P | P | P | P | N/A | F | P | P | 6/7 |
| 38 | Progress | P | P | P | P | P | P | P | P | 8/8 |
| 39 | Radio | P | P | P | P | N/A | P | P | P | 7/7 |
| 40 | SearchInput | P | P | P | P | N/A | P | P | P | 7/7 |
| 41 | SegmentedControl | P | P | P | F | P | P | P | P | 7/8 |
| 42 | Select | P | P | P | P | P | P | P | P | 8/8 |
| 43 | Separator | P | P | P | P | N/A | P | P | P | 7/7 |
| 44 | Sheet | P | P | P | P | P | P | P | P | 8/8 |
| 45 | Skeleton | P | P | P | P | P | P | P | P | 8/8 |
| 46 | Slider | P | P | P | P | N/A | P | P | P | 7/7 |
| 47 | Spinner | P | P | P | P | N/A | P | P | P | 7/7 |
| 48 | Stack | P | P | P | P | N/A | P | P | P | 7/7 |
| 49 | StatCard | P | P | P | P | N/A | P | P | P | 7/7 |
| 50 | Stepper | P | P | P | P | N/A | P | P | P | 7/7 |
| 51 | Switch | P | P | P | P | N/A | P | P | P | 7/7 |
| 52 | Table | P | P | P | P | N/A | F | P | P | 6/7 |
| 53 | Tabs | P | P | P | P | P | P | P | P | 8/8 |
| 54 | Text | P | P | P | P | P | P | P | P | 8/8 |
| 55 | Textarea | P | P | P | P | P | P | P | P | 8/8 |
| 56 | Toast | P | P | P | P | P | P | P | P | 8/8 |
| 57 | Toaster | F | P | F | F | N/A | F | F | P | 2/7 |
| 58 | Toggle | P | P | P | P | P | P | P | P | 8/8 |
| 59 | ToggleGroup | P | P | P | P | P | P | P | P | 8/8 |
| 60 | Tooltip | P | P | P | P | N/A | F | P | P | 6/7 |
| 61 | Transitions | P | P | P | P | N/A | P | P | P | 7/7 |
| 62 | VisuallyHidden | P | P | P | P | N/A | P | F | P | 6/7 |
| 63 | Sidebar | P | P | P | P | P | F | F | P | 6/8 |
| 64 | TreeView | P | P | P | F | N/A | P | F | P | 5/7 |
| 65 | AreaChart | F | P | P | F | N/A | P | F | P | 4/7 |
| 66 | BarChart | F | P | P | F | N/A | P | F | P | 4/7 |
| 67 | LineChart | F | P | P | F | N/A | P | F | P | 4/7 |
| 68 | PieChart | F | P | P | F | N/A | P | F | P | 4/7 |
| 69 | RadarChart | F | P | P | F | N/A | P | F | P | 4/7 |
| 70 | GaugeChart | F | P | P | F | N/A | P | F | P | 4/7 |
| 71 | Sparkline | F | P | P | F | N/A | P | F | P | 4/7 |
| 72 | ChartContainer | F | P | P | F | N/A | P | F | P | 4/7 |

---

## Package 2: core/composed (31 components)

### Perfect Scores (7)

AvatarGroup, ContentCard, PageHeader, PriorityIndicator, ScheduleView, StatusBadge, ActivityFeed

### Worst Offenders

| Component | Score | Key Gaps |
|-----------|-------|----------|
| DashboardSkeleton | 3/8 (38%) | No className, no props spread, no Props export, no test |
| ProjectListSkeleton | 3/8 (38%) | No className, no props spread, no Props export, no test |
| TaskDetailSkeleton | 3/8 (38%) | No className, no props spread, no Props export, no test |
| ConfirmDialog | 3/8 (38%) | No forwardRef, no className, no props spread, no story |
| SimpleTooltip | 4/8 (50%) | No forwardRef, no className, no props spread |
| MonthPicker | 4/8 (50%) | No className, no props spread, no test |
| YearPicker | 4/8 (50%) | No className, no props spread, no test |

### Full Matrix

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | AvatarGroup | P | P | P | P | P | P | P | P | 8/8 |
| 2 | CommandPalette | P | P | P | F | N/A | P | P | P | 6/7 |
| 3 | ContentCard | P | P | P | P | P | P | P | P | 8/8 |
| 4 | ErrorDisplay | P | P | F | F | N/A | P | P | P | 5/7 |
| 5 | GlobalLoading | P | P | F | F | N/A | P | P | P | 5/7 |
| 6 | CardSkeleton | P | P | P | F | N/A | P | F | P | 5/7 |
| 7 | TableSkeleton | P | P | P | F | N/A | P | F | P | 5/7 |
| 8 | BoardSkeleton | P | P | P | F | N/A | P | F | P | 5/7 |
| 9 | ListSkeleton | P | P | P | F | N/A | P | F | P | 5/7 |
| 10 | MemberPicker | P | P | F | F | N/A | P | P | P | 5/7 |
| 11 | PageHeader | P | P | P | P | N/A | P | P | P | 7/7 |
| 12 | DashboardSkeleton | P | P | F | F | N/A | F | F | P | 3/7 |
| 13 | ProjectListSkeleton | P | P | F | F | N/A | F | F | P | 3/7 |
| 14 | TaskDetailSkeleton | P | P | F | F | N/A | F | F | P | 3/7 |
| 15 | PriorityIndicator | P | P | P | P | P | P | P | P | 8/8 |
| 16 | RichTextEditor | P | P | P | F | N/A | P | F | P | 5/7 |
| 17 | RichTextViewer | P | P | P | F | N/A | P | F | P | 5/7 |
| 18 | ScheduleView | P | P | P | P | N/A | P | P | P | 7/7 |
| 19 | SimpleTooltip | F | P | F | F | N/A | P | P | P | 4/7 |
| 20 | StatusBadge | P | P | P | P | P | P | P | P | 8/8 |
| 21 | ConfirmDialog | F | P | F | F | N/A | P | P | F | 3/7 |
| 22 | UploadProgress | P | P | P | P | N/A | P | F | P | 6/7 |
| 23 | EmptyState | P | P | P | P | N/A | P | P | P | 7/7 |
| 24 | ActivityFeed | P | P | P | P | N/A | P | P | P | 7/7 |
| 25 | DatePicker | P | P | P | F | N/A | P | F | P | 5/7 |
| 26 | DateTimePicker | P | P | P | F | N/A | P | F | P | 5/7 |
| 27 | DateRangePicker | P | P | P | F | N/A | P | F | P | 5/7 |
| 28 | TimePicker | P | P | P | F | N/A | P | F | P | 5/7 |
| 29 | CalendarGrid | P | P | F | F | N/A | P | P | P | 5/7 |
| 30 | MonthPicker | P | P | F | F | N/A | P | F | P | 4/7 |
| 31 | YearPicker | P | P | F | F | N/A | P | F | P | 4/7 |

---

## Package 3: core/shell (7 components)

### Perfect Scores (2)

AppSidebar, BottomNavbar

### Worst Offenders

| Component | Score | Key Gaps |
|-----------|-------|----------|
| LinkProvider | 1/3 (33%) | No Props export, no test, no story |
| AppCommandPalette | 3/7 (43%) | No forwardRef, no className+cn, no props spread, no test |
| NotificationPreferences | 4/7 (57%) | No forwardRef, no props spread, no test |

### Full Matrix

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | TopBar | P | P | P | P | N/A | P | F* | P | 6/7 |
| 2 | AppSidebar | P | P | P | P | N/A | P | P | P | 7/7 |
| 3 | BottomNavbar | P | P | P | P | N/A | P | P | P | 7/7 |
| 4 | NotificationCenter | P | P | P | P | N/A | P | F* | P | 6/7 |
| 5 | NotificationPreferences | F | P | P | F | N/A | P | F | P | 4/7 |
| 6 | AppCommandPalette | F | P | F | F | N/A | P | F | P | 3/7 |
| 7 | LinkProvider | N/A | P | N/A | N/A | N/A | F | F | F | 1/3 |

*F* = test file exists but missing vitest-axe assertion

---

## Package 4: karm (48 components)

### Perfect Scores (2)

ClientPortalHeader (7/7), ProjectCard (7/7)

### Worst Offenders

| Component | Score | Key Gaps |
|-----------|-------|----------|
| BreakAdminSkeleton | 3/7 (43%) | No className, no props spread, no Props export, no test |
| DevsabhaSkeleton | 3/7 (43%) | No props spread, no Props export, no test, no story |
| BandwidthSkeleton | 3/7 (43%) | No props spread, no Props export, no test, no story |
| BoardToolbar | 3/7 (43%) | No forwardRef, no props spread, no Props export |
| BulkActionBar | 3/7 (43%) | No forwardRef, no props spread, no Props export, no story |
| ColumnHeader | 3/7 (43%) | No forwardRef, no className+cn, no props spread |
| TaskContextMenu | 3/7 (43%) | No forwardRef, no className+cn, no props spread, no story |

### Full Matrix — admin/break

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | BreakAdmin | P | P | P | F | N/A | P | P | P | 6/7 |
| 2 | BreakAdminSkeleton | P | P | F | F | N/A | F | F | P | 3/7 |
| 3 | BreakBalance | P | P | F | F | N/A | P | P | P | 5/7 |
| 4 | Breaks | P | P | F | F | N/A | P | F | P | 4/7 |
| 5 | DeleteBreak | P | P | F | F | N/A | P | F | P | 4/7 |
| 6 | EditBreak | P | P | P | F | N/A | P | P | P | 6/7 |
| 7 | EditBreakBalance | P | P | F | F | N/A | P | F | P | 4/7 |
| 8 | BreakAdminHeader | P | P | F | F | N/A | P | F | P | 4/7 |
| 9 | LeaveRequest | P | P | F | F | N/A | P | P | P | 5/7 |

### Full Matrix — admin/dashboard

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | AdminDashboard | P | P | P | F | P | P | P | P | 7/8 |
| 2 | AssociateDetail | P | P | P | F | N/A | P | F | P | 5/7 |
| 3 | AttendanceOverview | P | P | P | F | N/A | P | P | P | 6/7 |
| 4 | BreakRequest | P | P | P | F | N/A | P | P | P | 6/7 |
| 5 | Calendar | P | P | P | F | N/A | P | P | P | 6/7 |
| 6 | CorrectionList | P | P | P | F | N/A | P | P | P | 6/7 |
| 7 | DashboardHeader | P | P | P | F | N/A | P | P | P | 6/7 |
| 8 | DashboardSkeleton | P | P | P | F | N/A | F | P | P | 5/7 |
| 9 | LeaveRequests | P | P | P | F | N/A | P | F | P | 5/7 |
| 10 | RenderDate | P | P | P | F | N/A | P | F | P | 5/7 |

### Full Matrix — admin/adjustments

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | ApprovedAdjustments | P | P | F | F | N/A | P | F | P | 4/7 |

### Full Matrix — board

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | BoardColumn | P | P | P | F | N/A | P | P | P | 6/7 |
| 2 | BoardProvider | N/A | N/A | N/A | N/A | N/A | P | P | N/A | 2/2 |
| 3 | BoardToolbar | F | P | P | F | N/A | F | P | P | 4/7 |
| 4 | BulkActionBar | F | P | P | F | N/A | F | P | F | 3/7 |
| 5 | ColumnEmpty | F | P | P | F | N/A | P | P | F | 4/7 |
| 6 | ColumnHeader | F | P | F | F | N/A | P | P | F | 3/7 |
| 7 | KanbanBoard | P | P | P | F | N/A | P | P | P | 6/7 |
| 8 | TaskCard | P | P | P | F | P | P | P | P | 7/8 |
| 9 | TaskCardCompact | P | P | P | F | P | P | P | P | 7/8 |
| 10 | TaskCardOverlay | P | P | P | F | N/A | P | P | P | 6/7 |
| 11 | TaskCardCompactOverlay | P | P | P | F | N/A | P | P | P | 6/7 |
| 12 | TaskContextMenu | F | P | F | F | N/A | P | P | F | 3/7 |

### Full Matrix — chat

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | ChatInput | P | P | F | F | N/A | P | P | P | 5/7 |
| 2 | ChatPanel | P | P | F | F | N/A | P | P | P | 5/7 |
| 3 | ConversationList | P | P | P | F | N/A | P | P | P | 6/7 |
| 4 | MessageList | P | P | F | F | N/A | P | P | P | 5/7 |
| 5 | StreamingText | P | P | F | F | N/A | P | P | P | 5/7 |

### Full Matrix — client

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | AccentProvider | N/A | P | N/A | N/A | N/A | P | F | P | 2/3 |
| 2 | ClientPortalHeader | P | P | P | P | N/A | P | P | P | 7/7 |
| 3 | ProjectCard | P | P | P | P | N/A | P | P | P | 7/7 |

### Full Matrix — dashboard

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | AttendanceCta | P | P | F | F | N/A | P | P | P | 5/7 |
| 2 | DailyBrief | P | P | P | F | N/A | P | P | P | 6/7 |
| 3 | ScratchpadWidget | P | P | P | F | N/A | P | P | P | 6/7 |
| 4 | SidebarScratchpad | P | P | P | F | N/A | P | P | P | 6/7 |

### Full Matrix — page-skeletons

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | DevsabhaSkeleton | P | P | P | F | N/A | F | F | F | 3/7 |
| 2 | BandwidthSkeleton | P | P | P | F | N/A | F | F | F | 3/7 |

### Full Matrix — tasks

| # | Component | Ref | Name | cn | Spread | CVA | Props | Test | Story | Score |
|---|-----------|-----|------|----|--------|-----|-------|------|-------|-------|
| 1 | ActivityTab | P | P | P | F | N/A | P | F | P | 5/7 |
| 2 | ConversationTab | P | P | P | F | N/A | P | F | P | 5/7 |
| 3 | FilesTab | P | P | P | F | N/A | P | F | P | 5/7 |
| 4 | ReviewTab | P | P | P | F | N/A | P | F | P | 5/7 |
| 5 | SubtasksTab | P | P | P | F | N/A | P | F | P | 5/7 |
| 6 | TaskDetailPanel | P | P | P | F | N/A | P | P | P | 6/7 |
| 7 | TaskProperties | P | P | P | F | N/A | P | P | P | 6/7 |

---

## Systemic Issues (ranked by severity)

### 1. Props spread — 46% pass rate (CRITICAL)

Only 73 of 158 components spread `...props` onto their root element. This prevents consumers from adding `data-*`, `aria-*`, `id`, or event handler attributes. The karm package is worst at **4% pass rate** — only ClientPortalHeader and ProjectCard spread props.

**Impact:** Breaks composability. Consumers can't add test IDs, accessibility attributes, or integration hooks.

### 2. Test coverage — 65% pass rate (HIGH)

55 components lack tests with vitest-axe assertions. Major gaps:
- All 8 chart components (core/ui)
- Entire date-picker family (core/composed)
- All loading-skeleton sub-components (core/composed)
- 5 of 7 tasks tab components (karm)
- 5 of 9 admin/break components (karm)
- RichTextEditor/Viewer (core/composed)

Some existing tests also lack vitest-axe assertions (TopBar, NotificationCenter).

### 3. className + cn() — 80% pass rate (MEDIUM)

32 components don't accept or merge a `className` prop. Concentrated in:
- karm/admin/break (7 of 9 fail)
- karm/chat (4 of 5 fail)
- core/composed page-skeletons (3 of 3 fail)
- core/composed date-picker internals (CalendarGrid, MonthPicker, YearPicker)

### 4. forwardRef — 87% pass rate (MEDIUM)

20 components lack forwardRef. Two clusters:
- All 8 chart components (core/ui) — use plain functions
- 5 board sub-components (karm) — BoardToolbar, BulkActionBar, ColumnEmpty, ColumnHeader, TaskContextMenu

### 5. Props export — 85% pass rate (LOW)

24 components don't export a typed Props interface. Mainly Radix wrappers (AlertDialog, ContextMenu, Dialog, DropdownMenu, etc.) that re-export primitive types without a DS-level named type.

### 6. Stories — 93% pass rate (LOW)

11 components missing stories. Mostly karm internal sub-components (board/bulk-action-bar, board/column-empty, board/column-header, board/task-context-menu) and skeletons.

### 7. CVA — 95% pass rate (LOW)

Only Code component has variants without CVA (uses a simple string prop). Low priority.

### 8. displayName — 100% pass rate (NONE)

Universal compliance. No action needed.

---

## Recommended Fix Priority

### Wave 1 — Props spread (biggest bang, mechanical fix)
Add `...props` spread to all 85 failing components. This is a low-risk, high-value mechanical change.

### Wave 2 — className + cn() (20 components)
Add `className` prop acceptance and `cn()` merging to the 32 failing components.

### Wave 3 — Tests (55 components)
Write tests with vitest-axe assertions for untested components. Prioritize:
1. Chart components (8) — high consumer visibility
2. Date-picker family (6) — complex interaction surfaces
3. karm/tasks tabs (5) — active development area

### Wave 4 — forwardRef (20 components)
Convert plain functions to forwardRef. Charts and board sub-components.

### Wave 5 — Props export + Stories (cleanup)
Add DS-level Props type aliases for Radix wrappers. Add missing stories for board sub-components.
