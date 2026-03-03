# De-Complexity Audit Implementation Plan (v2 — Council-Revised)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce codebase complexity through pattern standardization, convert AdminDashboard to compound components (breaking change), and enforce clean module boundaries for future karm/ package extraction.

**Architecture:** Pattern standardization with council-validated structural decisions. Each task is an independent commit. Tasks 1-2 run first (no deps). Task 3 next (depends on 1-2). Tasks 4-6 after Task 3 (4 and 6 share files with 3). Task 7 last (audit).

**Tech Stack:** React 18, TypeScript 5.7 (strict), Tailwind 3.4, CVA, Vite 5.4

**Verification:** `pnpm typecheck` + `pnpm build` + `pnpm lint` after each task.

---

## Task 1: Extract Shared Constants (Layer-Safe Split)

**Council decision:** Split into two files to respect ui → shared → layout → karm hierarchy. `getInitials` goes in shared/ (used by both layers). Domain constants stay in karm/ (never exported publicly).

**Files:**
- Create: `src/shared/lib/string-utils.ts`
- Create: `src/karm/tasks/task-constants.ts`
- Modify: `src/karm/tasks/task-properties.tsx` — remove getInitials (line 87-91), PRIORITY_LABELS (95-100), PRIORITY_DOT_COLORS (102-107)
- Modify: `src/karm/tasks/subtasks-tab.tsx` — remove getInitials (51-55), PRIORITY_DOT_COLORS (57-62)
- Modify: `src/karm/board/task-card.tsx` — remove PRIORITY_COLORS (29-34), PRIORITY_LABELS (36-41), getInitials (47-54)
- Modify: `src/karm/tasks/review-tab.tsx` — remove getInitials (68-72), STATUS_MAP (83-91)
- Modify: `src/karm/tasks/files-tab.tsx` — remove getInitials (68-72)
- Modify: `src/karm/tasks/conversation-tab.tsx` — remove getInitials (57-61)
- Modify: `src/shared/avatar-group.tsx` — remove getInitials (16-22)

### Step 1: Create `src/shared/lib/string-utils.ts`

```typescript
/**
 * Extract initials from a person's name.
 * "John Doe" → "JD", "Alice" → "AL"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
```

### Step 2: Create `src/karm/tasks/task-constants.ts`

```typescript
// Domain constants for task components — internal to karm/, not exported publicly

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-blue-400',
  MEDIUM: 'bg-yellow-400',
  HIGH: 'bg-orange-400',
  URGENT: 'bg-red-500',
}

export interface ReviewStatusConfig {
  variant: string
  label: string
  className: string
}

export const REVIEW_STATUS_MAP: Record<string, ReviewStatusConfig> = {
  PENDING: {
    variant: 'yellow',
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  APPROVED: {
    variant: 'green',
    label: 'Approved',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  CHANGES_REQUESTED: {
    variant: 'red',
    label: 'Changes Requested',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
}
```

### Step 3: Update all consumer files

**karm/tasks/ and karm/board/ files** — import from both:
```typescript
import { getInitials } from '../../shared/lib/string-utils'
import { PRIORITY_LABELS, PRIORITY_DOT_COLORS } from './task-constants'
```

**shared/avatar-group.tsx** — import from sibling:
```typescript
import { getInitials } from './lib/string-utils'
```

**karm/tasks/review-tab.tsx** — rename local `STATUS_MAP` references to `REVIEW_STATUS_MAP`:
```typescript
import { getInitials } from '../../shared/lib/string-utils'
import { REVIEW_STATUS_MAP } from './task-constants'
```

### Step 4: Verify and commit

```bash
pnpm typecheck && pnpm build
git add src/shared/lib/string-utils.ts src/karm/tasks/task-constants.ts src/karm/tasks/task-properties.tsx src/karm/tasks/subtasks-tab.tsx src/karm/board/task-card.tsx src/karm/tasks/review-tab.tsx src/karm/tasks/files-tab.tsx src/karm/tasks/conversation-tab.tsx src/shared/avatar-group.tsx
git commit -m "refactor: extract shared constants with layer-safe split (shared/lib + karm/tasks)"
```

---

## Task 2: V1 Token Migration

**Council decision:** Keep as planned. Risk agent noted visual color changes — acceptable since these tokens were undefined fallbacks anyway. Also fix pre-existing `--color-layer-accent` undefined reference in calendar.tsx.

**Files:**
- Modify: `src/karm/admin/break/header.tsx` (lines 118, 203)
- Modify: `src/karm/admin/dashboard/calendar.tsx` (line 252 + fix --color-layer-accent)
- Modify: `src/karm/admin/dashboard/dashboard-header.tsx` (line 101)
- Modify: `src/karm/admin/dashboard/render-date.tsx` (lines 233, 278)
- Modify: `src/karm/custom-buttons/CustomButton.tsx` (lines 24, 37)

### Token mapping

| V1 Token | V2 Replacement |
|----------|---------------|
| `--Alias-Semantics-Highlight-darkest` | `--color-interactive` |
| `--Alias-Primary-Default` | `--color-interactive` |
| `--primitives-purple-400-b` | `--color-focus` |
| `--color-layer-accent` (undefined) | `--color-interactive-subtle` |

### Steps

Apply find-and-replace in each file. Then verify:

```bash
pnpm typecheck && pnpm build
# Verify zero V1 tokens:
grep -r "Alias-\|primitives-purple\|primitives-pink\|color-layer-accent[^-]" src/ --include="*.tsx" --include="*.ts" -l
# Expected: no output
git commit -m "fix(tokens): migrate last V1 token references to semantic V2 tokens"
```

---

## Task 3: State Management — Selective Hook Extraction

**Council decision:** useReducer ONLY for calendar navigation (shared between calendar.tsx and admin-dashboard.tsx). Custom hooks with grouped useState for others. Component decomposition in Task 4 will further reduce admin-dashboard state.

**Files:**
- Create: `src/karm/admin/dashboard/use-calendar-navigation.ts` (useReducer — shared by 2 files)
- Create: `src/karm/admin/break/use-break-date-picker.ts` (grouped useState)
- Create: `src/karm/admin/dashboard/use-leave-request-interaction.ts` (grouped useState)
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx`
- Modify: `src/karm/admin/dashboard/calendar.tsx`
- Modify: `src/karm/admin/break/edit-break.tsx`
- Modify: `src/karm/admin/dashboard/leave-requests.tsx`

### Step 1: Create `use-calendar-navigation.ts` (useReducer)

This hook is the only one using useReducer — calendar states must change atomically (selecting a date must update days array synchronously).

```typescript
'use client'

import { useReducer } from 'react'
import { format } from 'date-fns'
import type { DayInfo } from '../types'

export interface CalendarNavState {
  currentDate: string
  selectedDate: string
  isFutureDate: boolean
  activeTimeFrame: 'weekly' | 'monthly'
  days: DayInfo[]
  selectedMonth: string
  activeIndex: number
  dateOffset: number
}

type CalendarNavAction =
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_IS_FUTURE_DATE'; payload: boolean }
  | { type: 'SET_TIME_FRAME'; payload: 'weekly' | 'monthly' }
  | { type: 'SET_DAYS'; payload: DayInfo[] }
  | { type: 'SET_SELECTED_MONTH'; payload: string }
  | { type: 'SET_ACTIVE_INDEX'; payload: number }
  | { type: 'SET_DATE_OFFSET'; payload: number }
  | { type: 'NAVIGATE_TODAY'; payload: { todayStr: string; month: string; offset: number; days: DayInfo[] } }

function calendarNavReducer(state: CalendarNavState, action: CalendarNavAction): CalendarNavState {
  switch (action.type) {
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    case 'SET_IS_FUTURE_DATE':
      return { ...state, isFutureDate: action.payload }
    case 'SET_TIME_FRAME':
      return { ...state, activeTimeFrame: action.payload }
    case 'SET_DAYS':
      return { ...state, days: action.payload }
    case 'SET_SELECTED_MONTH':
      return { ...state, selectedMonth: action.payload }
    case 'SET_ACTIVE_INDEX':
      return { ...state, activeIndex: action.payload }
    case 'SET_DATE_OFFSET':
      return { ...state, dateOffset: action.payload }
    case 'NAVIGATE_TODAY':
      return {
        ...state,
        selectedDate: action.payload.todayStr,
        currentDate: action.payload.todayStr,
        selectedMonth: action.payload.month,
        dateOffset: action.payload.offset,
        days: action.payload.days,
      }
    default:
      return state
  }
}

export function useCalendarNavigation() {
  const today = new Date()
  const todayStr = format(today, "yyyy-MM-dd'T'HH:mm:ssxxx")
  return useReducer(calendarNavReducer, {
    currentDate: todayStr,
    selectedDate: todayStr,
    isFutureDate: false,
    activeTimeFrame: 'weekly',
    days: [],
    selectedMonth: '',
    activeIndex: 0,
    dateOffset: 0,
  })
}
```

### Step 2: Create `use-break-date-picker.ts` (grouped useState)

```typescript
'use client'

import { useState } from 'react'

export function useBreakDatePicker() {
  const now = new Date()
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeDate, setActiveDate] = useState<'start' | 'end' | null>(null)
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      const newMonth = currentMonth === 11 ? 0 : currentMonth + 1
      const newYear = currentMonth === 11 ? currentYear + 1 : currentYear
      setCurrentMonth(newMonth)
      setCurrentYear(newYear)
    } else {
      const newMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const newYear = currentMonth === 0 ? currentYear - 1 : currentYear
      setCurrentMonth(newMonth)
      setCurrentYear(newYear)
    }
  }

  const resetDates = () => {
    setSelectedStartDate(null)
    setSelectedEndDate(null)
    setActiveDate(null)
  }

  return {
    showCalendar, setShowCalendar,
    activeDate, setActiveDate,
    currentMonth, currentYear,
    selectedStartDate, setSelectedStartDate,
    selectedEndDate, setSelectedEndDate,
    navigateMonth, resetDates,
  }
}
```

### Step 3: Create `use-leave-request-interaction.ts` (grouped useState)

```typescript
'use client'

import { useState } from 'react'

export function useLeaveRequestInteraction() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeRequest, setActiveRequest] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [openComment, setOpenComment] = useState<string | null>(null)
  const [hoveredRequest, setHoveredRequest] = useState<string | null>(null)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [hoverActionTemp, setHoverActionTemp] = useState<string | null>(null)

  const reset = () => {
    setActiveRequest(null)
    setActiveAction(null)
    setMessage('')
  }

  return {
    isProcessing, setIsProcessing,
    activeRequest, setActiveRequest,
    activeAction, setActiveAction,
    message, setMessage,
    openComment, setOpenComment,
    hoveredRequest, setHoveredRequest,
    isCtrlPressed, setIsCtrlPressed,
    hoverActionTemp, setHoverActionTemp,
    reset,
  }
}
```

### Step 4: Update consumer files

**admin-dashboard.tsx**: Replace 10 useState with `useCalendarNavigation()` + 2 remaining useState (`activeTab`, `selectedAssociate`).

**calendar.tsx**: Replace 7 useState with `useCalendarNavigation()`.

**edit-break.tsx**: Replace 6 calendar-related useState with `useBreakDatePicker()`. Keep `showStatusOptions`, `existingBreaks`, `isSubmitting`, `formData` as separate useState.

**leave-requests.tsx**: Replace 8 useState with `useLeaveRequestInteraction()`.

### Step 5: Verify and commit

```bash
pnpm typecheck && pnpm build
grep -c "useState" src/karm/admin/break/edit-break.tsx src/karm/admin/dashboard/admin-dashboard.tsx src/karm/admin/dashboard/leave-requests.tsx src/karm/admin/dashboard/calendar.tsx
# Expected: 2-4 per file (down from 7-10)
git commit -m "refactor(karm): extract state management hooks (calendar nav, break picker, leave interaction)"
```

---

## Task 4: AdminDashboard Compound Component (Breaking Change)

**Council decision:** Since this is a pre-release library (v0.1.0, not yet integrated anywhere), redesign AdminDashboard as a compound component. Each sub-component gets 3-6 props. This is the Radix/shadcn pattern.

**Files:**
- Create: `src/karm/admin/dashboard/calendar-strip.tsx`
- Modify: `src/karm/admin/dashboard/admin-dashboard.tsx` — convert to compound component
- Modify: `src/karm/admin/types.ts` — add sub-component prop interfaces
- Modify: `src/karm/admin/dashboard/index.ts` — export new sub-components
- Modify: `src/karm/admin/index.ts` — update exports
- Modify: `src/karm/index.ts` — update exports
- Modify: `src/index.ts` — update exports
- Modify: `src/karm/admin/dashboard/admin-dashboard.stories.tsx` — update to new API

### Step 1: Design the compound component API

```typescript
// New consumer API:
<AdminDashboard.Root
  currentUserId="u1"
  currentUserRole="Admin"
  currentUser={user}
>
  <AdminDashboard.Calendar
    dateAttendanceMap={dateMap}
    onDateChange={handleDate}
  />
  <AdminDashboard.AttendanceOverview
    groupedAttendance={attendance}
    users={users}
    onUpdateStatus={handleStatus}
  />
  <AdminDashboard.AssociateDetail
    attendance={selectedUserAttendance}
    tasks={userTasks}
    breakRequest={selectedBreakRequest}
    onToggleTask={handleToggle}
    onAddTask={handleAdd}
    onReorderTasks={handleReorder}
  />
  <AdminDashboard.LeaveRequests
    requests={leaveRequests}
    corrections={corrections}
    onApproveBreak={handleApprove}
    onRejectBreak={handleReject}
    onCancelBreak={handleCancel}
    onApproveCorrection={handleApproveCorrection}
    onRejectCorrection={handleRejectCorrection}
  />
</AdminDashboard.Root>
```

### Step 2: Create CalendarStrip component

Extract the calendar day-rendering loop from both admin-dashboard.tsx and calendar.tsx into `calendar-strip.tsx`. This is shared by both files — architecture agent confirmed duplication.

### Step 3: Create AdminDashboard.Root with context

The Root component provides shared context (currentUserId, currentUserRole, config). Sub-components consume it via `useAdminDashboardContext()`.

### Step 4: Refactor each sub-component

Each existing sub-component file (attendance-overview.tsx, associate-detail.tsx, leave-requests.tsx, correction-list.tsx) already exists as separate files. The refactoring adds individual prop interfaces and makes them standalone composable pieces.

### Step 5: Update barrel exports and stories

Export all compound components. Rewrite the Storybook story to use the new API.

### Step 6: Verify and commit

```bash
pnpm typecheck && pnpm build
git commit -m "feat(karm)!: convert AdminDashboard to compound component pattern

BREAKING CHANGE: AdminDashboard now uses compound component API.
Before: <AdminDashboard currentUserId='...' onDateChange={...} ...29 props />
After: <AdminDashboard.Root><AdminDashboard.Calendar /><AdminDashboard.LeaveRequests />...</AdminDashboard.Root>"
```

---

## Task 5: Inline Style Elimination (render-date.tsx)

**Council decision:** Convert getStyles() to cn() Tailwind classes (codebase convention), not CSSProperties sub-functions. Differentiate the two lavender hex values.

**Files:**
- Modify: `src/karm/admin/dashboard/render-date.tsx`

### Hex-to-token mapping (refined)

| Hex | Semantic Token | Usage |
|-----|---------------|-------|
| `#F8F6FC` | `var(--color-interactive-subtle)` | Light lavender background |
| `#E6E1F3` | `var(--color-interactive-selected)` | Selected/active lavender |
| `#000000` | `var(--color-text-primary)` | Text |
| `#FFFFFF` | `var(--color-text-on-color)` | Text on colored bg |
| `#B7AFB2` | `var(--color-text-disabled)` | Muted text |
| `#403A3C` | `var(--color-text-secondary)` | Secondary text |
| `#6B6164` | `var(--color-text-secondary)` | Secondary text |
| `#D2222D` | `var(--color-error)` | Error/absent |
| `#3F181E` | `var(--color-text-primary)` | Dark text |
| `#B02651` | `var(--color-interactive)` | Interactive bg |
| `#E6E4E5` | `var(--color-field)` | Field bg |
| `#FCF7F7` | `var(--color-error-surface)` | Error surface |

### Approach: Convert getStyles/getBGStyles to cn() pattern

Replace the CSSProperties functions with Tailwind class computation using cn(). This matches the codebase convention (ui/ and shared/ all use cn()).

```typescript
// Before: getStyles() returns CSSProperties object
const styles = getStyles()
return <div style={styles}>...</div>

// After: computed className with cn()
const dateClasses = cn(
  'relative flex cursor-pointer flex-col items-center text-center transition-colors',
  isWeekend && 'text-[var(--color-text-disabled)]',
  isSelected && !isToday && 'bg-[var(--color-interactive-subtle)] rounded-[20px]',
  isToday && isSelected && 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)] rounded-full',
  isToday && !isSelected && 'text-[var(--color-interactive)]',
  hasAttendance && attendanceStatus === 'present' && 'text-[var(--color-text-primary)]',
  hasAttendance && attendanceStatus === 'absent' && 'text-[var(--color-error)]',
  isHoliday && 'bg-[var(--color-error-surface)]',
  isPadding && 'opacity-50',
)
return <div className={dateClasses}>...</div>
```

### Convert dot indicator to Tailwind

```typescript
// Before: inline style object
<span style={{ position: 'absolute', bottom: '0px', ... }} />

// After: Tailwind classes
<span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[var(--color-error)]" />
```

### Verify and commit

```bash
pnpm typecheck && pnpm build
grep -c "style=" src/karm/admin/dashboard/render-date.tsx
# Expected: 0 or near-zero (only truly dynamic values like DnD positions)
git commit -m "refactor(karm): convert render-date inline styles to Tailwind cn() pattern"
```

---

## Task 6: Function Extraction (edit-break.tsx)

**Council decision:** Task 4 handles admin-dashboard decomposition. This task focuses on edit-break.tsx (755 LOC) and remaining render-date cleanup.

**Files:**
- Create: `src/karm/admin/utils/date-range-utils.ts`
- Modify: `src/karm/admin/break/edit-break.tsx`

### Step 1: Extract date range logic to pure utils

Move computeDateSelection, isDateInRange, checkOverlap to `date-range-utils.ts` alongside existing `date-utils.ts`.

```typescript
// src/karm/admin/utils/date-range-utils.ts

export function computeDateSelection(
  clickedDate: string,
  activeDate: 'start' | 'end' | null,
  currentStart: string | null,
  currentEnd: string | null,
): { startDate: string | null; endDate: string | null; nextActiveDate: 'start' | 'end' | null } {
  // Pure date range selection logic extracted from edit-break handleDayClick
}

export function isDateInRange(date: string, start: string | null, end: string | null): boolean {
  // Pure range check
}

export function checkDateOverlap(
  start: string,
  end: string,
  existingRanges: Array<{ startDate: string; endDate: string }>,
): boolean {
  // Pure overlap detection
}
```

### Step 2: Simplify edit-break handleDayClick

```typescript
const handleDayClick = (dateStr: string) => {
  const result = computeDateSelection(dateStr, datePicker.activeDate, datePicker.selectedStartDate, datePicker.selectedEndDate)
  datePicker.setSelectedStartDate(result.startDate)
  datePicker.setSelectedEndDate(result.endDate)
  datePicker.setActiveDate(result.nextActiveDate)
}
```

### Step 3: Verify and commit

```bash
pnpm typecheck && pnpm build
git commit -m "refactor(karm): extract date range utils and simplify edit-break handlers"
```

---

## Task 7: Import Boundary Enforcement

**Council decision:** Ensure karm/ only imports from the design system's public API paths (ui/, shared/, layout/). No reaching into private internals. Prepares for future karm/ package extraction.

**Files:**
- Audit all karm/ imports
- Fix any violations found

### Step 1: Audit imports

```bash
# Find all imports in karm/ that reach into ui/ internals (anything beyond the barrel)
grep -rn "from '.*ui/" src/karm/ --include="*.tsx" --include="*.ts" | grep -v "from '.*ui/lib/utils'" | grep -v "from '.*ui/index'"
```

### Step 2: Check for valid import patterns

karm/ files should import from:
- `../../ui/button` (component file — acceptable, these are the public API)
- `../../ui/lib/utils` (cn utility — acceptable)
- `../../shared/...` (acceptable)
- `../../layout/...` (acceptable)
- `../types` (within karm — acceptable)

karm/ files should NOT import from:
- Any file inside `primitives/_internal/`
- Any non-exported utility from ui/ or shared/

### Step 3: Document the boundary rules

Add a comment block to `src/karm/index.ts`:

```typescript
// ============================================================
// karm/ Module Boundary Rules
// ============================================================
// karm/ components may import from:
//   - ui/ components (../../ui/*)
//   - ui/lib/utils (cn utility)
//   - shared/ components (../../shared/*)
//   - layout/ components (../../layout/*)
//   - Within karm/ (sibling modules)
//
// karm/ components must NOT import from:
//   - primitives/_internal/
//   - Any non-exported internal utility
//
// This ensures karm/ can be cleanly extracted to
// @devalok/shilp-sutra-karm in the future.
// ============================================================
```

### Step 4: Verify and commit

```bash
pnpm typecheck && pnpm build
git commit -m "refactor(karm): enforce import boundaries, document module rules"
```

---

## Execution Order

```
Task 1 (constants) ──┐
                     ├──→ Task 3 (hooks) ──→ Task 4 (compound) ──→ Task 6 (extract) ──→ Task 7 (boundaries)
Task 2 (V1 tokens) ──┘                  ──→ Task 5 (inline styles)
```

Tasks 1 & 2: parallel (no file overlap)
Task 3: after 1 & 2 (needs clean state)
Tasks 4 & 5: after 3 (4 shares files with 3)
Task 6: after 4 (shares edit-break with 3)
Task 7: last (audits everything)

## Verification Checklist (Post All Tasks)

```bash
pnpm typecheck && pnpm build && pnpm lint

# Zero V1 tokens
grep -r "Alias-\|primitives-purple\|primitives-pink" src/ --include="*.tsx" --include="*.ts" -l

# Zero duplicated getInitials
grep -rn "function getInitials" src/ --include="*.tsx" --include="*.ts"
# Expected: only src/shared/lib/string-utils.ts

# useState reduction
grep -c "useState" src/karm/admin/break/edit-break.tsx src/karm/admin/dashboard/admin-dashboard.tsx src/karm/admin/dashboard/leave-requests.tsx src/karm/admin/dashboard/calendar.tsx
# Expected: 2-4 per file

# Zero inline styles in render-date
grep -c "style=" src/karm/admin/dashboard/render-date.tsx
# Expected: 0 or near-zero

# Import boundaries clean
grep -rn "primitives/_internal" src/karm/ --include="*.tsx" --include="*.ts"
# Expected: no matches
```
