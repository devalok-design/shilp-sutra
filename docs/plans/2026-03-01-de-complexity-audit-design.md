# De-Complexity Audit: Pattern Standardization Design

**Date**: 2026-03-01
**Approach**: C — Pattern Standardization First
**Goal**: Define target patterns, then apply across codebase without breaking anything

## Scope

Focus on karm/ and shared/ modules (where complexity lives). UI layer is already 9.5/10 — leave it alone.

## Target Patterns

### Pattern 1: State Management — useReducer for 5+ states

**Current**: 12 components with 5+ useState calls scattered throughout render logic.

**Target**: Any component with 5+ related state values uses a reducer extracted to a co-located hook file.

```typescript
// Before (edit-break.tsx — 11 useState calls)
const [showCalendar, setShowCalendar] = useState(false)
const [activeDate, setActiveDate] = useState<'start' | 'end' | null>(null)
const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
// ... 8 more

// After — src/karm/admin/break/use-edit-break-state.ts
type EditBreakState = { showCalendar: boolean; activeDate: 'start' | 'end' | null; ... }
type EditBreakAction = { type: 'TOGGLE_CALENDAR' } | { type: 'SET_ACTIVE_DATE'; payload: ... } | ...
function editBreakReducer(state: EditBreakState, action: EditBreakAction): EditBreakState { ... }
export function useEditBreakState(initial?: Partial<EditBreakState>) { return useReducer(editBreakReducer, ...) }
```

**Files affected**: edit-break.tsx (11), admin-dashboard.tsx (11), leave-requests.tsx (9), calendar.tsx (8), date-picker.tsx (7), notification-preferences.tsx (7), break-admin.tsx (5), board-column.tsx (5)

### Pattern 2: Shared Constants — Single Source of Truth

**Current**: Priority colors, status maps, and helper functions duplicated across 4+ files.

**Target**: One constants module per domain, imported everywhere.

```typescript
// src/karm/constants.ts — single source of truth
export const PRIORITY_CONFIG = {
  LOW:    { label: 'Low',    dotColor: 'bg-blue-400',   badgeColor: 'bg-blue-100 text-blue-700' },
  MEDIUM: { label: 'Medium', dotColor: 'bg-yellow-400', badgeColor: 'bg-yellow-100 text-yellow-700' },
  HIGH:   { label: 'High',   dotColor: 'bg-orange-400', badgeColor: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', dotColor: 'bg-red-500',    badgeColor: 'bg-red-100 text-red-700' },
} as const

export const STATUS_CONFIG = { ... } // Consolidate STATUS_MAP + CORRECTION_STATUS_MAP

export function getInitials(name: string): string { ... } // One implementation
```

**Files affected**: task-properties.tsx, subtasks-tab.tsx, task-card.tsx, render-status.tsx, review-tab.tsx

### Pattern 3: Props Decomposition — Composition over Monolith

**Current**: AdminDashboardProps has 19 data fields + 15 callback props = 34+ total.

**Target**: Break large props interfaces into composed sub-interfaces grouped by concern.

```typescript
// Before
interface AdminDashboardProps {
  currentUserId: string
  currentUserRole: UserRole
  users?: AdminUser[]
  onDateChange?: (date: string) => void
  onAssociateChange?: (user: AdminUser | null) => void
  // ... 30 more fields
}

// After
interface AdminDashboardProps {
  auth: AdminAuthProps          // currentUserId, currentUserRole, currentUser
  data: AdminDashboardData      // users, groupedAttendance, leaveRequests, etc.
  handlers: AdminDashboardHandlers  // onDateChange, onAssociateChange, etc.
  config?: AdminDashboardConfig     // assetsBaseUrl, userImages, isLoading
}
```

**Files affected**: admin-dashboard.tsx (34+ fields), task-detail-panel.tsx (18+ fields)

### Pattern 4: Inline Style Elimination — Tokens or Tailwind

**Current**: 57 files use `style={}`, 37 files have hardcoded hex colors.

**Target**: Replace hardcoded values with semantic tokens. Use Tailwind arbitrary values for dynamic cases.

```typescript
// Before
style={{ backgroundColor: '#f8f6fc' }}
style={{ boxShadow: '0px 0px 4px 0px var(--primitives-purple-400-b) inset' }}

// After
className="bg-[var(--color-interactive-subtle)]"
className="shadow-[inset_0_0_4px_0_var(--color-focus)]"
```

**Exception**: Truly dynamic computed values (DnD positions, calculated sizes) may keep inline styles.

**Files affected**: render-date.tsx (heaviest — 50+ inline styles), calendar.tsx, header.tsx, dashboard-header.tsx, CustomButton.tsx, avatar-stack.tsx

### Pattern 5: V1 Token Migration — Final Cleanup

**Current**: 7 instances of `--Alias-*` and `--primitives-*` tokens in karm/.

**Target**: Zero V1 token references. All replaced with semantic equivalents.

**Files affected**: header.tsx (2), calendar.tsx (1), dashboard-header.tsx (1), render-date.tsx (2), CustomButton.tsx (2)

### Pattern 6: Extract Long Functions — Max 50 Lines Per Function

**Current**: Several render functions and handlers exceed 100 lines with 3+ levels of nesting.

**Target**: Break complex render logic into named sub-components or helper functions. No function body exceeds ~50 lines.

```typescript
// Before (admin-dashboard.tsx — calendar rendering inline, 80+ lines)
return (
  <div>
    {days.map(day => {
      if (day.isWeekend) { ... }
      if (day.hasAttendance) {
        if (day.correction) { ... }
        // ... 60 more lines of nested conditionals
      }
    })}
  </div>
)

// After
function DayCell({ day, onSelect }: DayCellProps) { ... }  // 20 lines
function CalendarGrid({ days, onDaySelect }: CalendarGridProps) { ... }  // 15 lines
```

**Files affected**: admin-dashboard.tsx (645 LOC), edit-break.tsx (755 LOC), leave-requests.tsx (343 LOC), render-date.tsx (409 LOC)

## Execution Order

Each step is an independent commit. Steps 1-2 can be parallelized. Steps 3-6 can be parallelized.

1. **Shared constants** — Extract duplicated maps/helpers to `src/karm/constants.ts`
2. **V1 token migration** — Replace 7 remaining V1 token references
3. **State management** — Extract useReducer hooks for the 8 high-state components
4. **Props decomposition** — Restructure AdminDashboardProps and TaskDetailPanelProps
5. **Inline style elimination** — Convert inline styles to Tailwind, replace hex with tokens
6. **Function extraction** — Break long functions into named sub-components

## What We're NOT Touching

- **ui/ layer** — Already 9.5/10 consistency, no changes needed
- **primitives/** — Vendored Radix code, not a refactoring target
- **CVA standardization** — Low priority, 13/51 is fine (not all components need variants)
- **forwardRef in karm/** — Domain components rarely need ref forwarding
- **Story files** — Out of scope (maintenance burden but not complexity)
- **Build config** — Working well, don't touch

## Success Criteria

- Zero V1 token references in src/
- No component with 8+ useState calls (down from 6 such components)
- No duplicated constant maps (single source of truth per domain)
- AdminDashboardProps < 10 top-level fields
- Inline styles reduced by 70%+ (from 57 files to <20)
- No function body > ~50 lines in modified files
- All existing Storybook stories still render correctly
- Build succeeds with zero new TypeScript errors
