# Admin Utilities

- Import: @devalok/shilp-sutra-karm/admin
- Server-safe: Partial (date/emoji utils are server-safe; renderAdjustmentType and renderStatus return JSX)
- Category: admin

Utility functions for date formatting, status rendering, and emoji handling.

Exports: AdjustmentType, renderAdjustmentType, renderStatus, formatDate, formatDateIST, formatTimeIST, formatDateWithWeekday, formatOptionalDate, getDaySuffix, isSameDay, getWeekDays, getMonthDays, getStartOfDay, getEndOfDay, removeAllEmojis, removeEmojiAtStart

## Functions

### renderAdjustmentType
```ts
function renderAdjustmentType(type: keyof typeof AdjustmentType): JSX.Element
```
Maps an adjustment type key to a human-readable label wrapped in a `<div>`.

### AdjustmentType (constant)
```ts
const AdjustmentType = {
  YEARLY_BALANCE: 'YEARLY_BALANCE',
  CARRY_FORWARD: 'CARRY_FORWARD',
  CASHOUT: 'CASHOUT',
  OTHER: 'OTHER',
} as const
```

### renderStatus
```ts
function renderStatus(status: string, correction?: boolean): ReactNode
```
Returns a `<Badge>` with color and label based on status. When `correction=true`, uses correction-specific labels (e.g. "Corrected" instead of "Approved", "Denied" instead of "Rejected").

Status map (default): APPROVED=success "Approved", PENDING=warning "Pending", REJECTED=error "Denied", CANCELLED=error "Redacted", MISSING=error "Missed"

Status map (correction): APPROVED=accent "Corrected", PENDING=warning "Pending", REJECTED=error "Denied", MISSING=error "Missed"

### formatDate
```ts
function formatDate(date: Date | string): string
```
Formats to IST locale short date, e.g. `"14 Mar '26"`. Uses `en-IN` locale with `Asia/Kolkata` timezone.

### formatDateIST
```ts
function formatDateIST(date: Date | string, options?: Intl.DateTimeFormatOptions): string
```
Formats date to IST locale string with custom options. Defaults to `Asia/Kolkata` timezone.

### formatTimeIST
```ts
function formatTimeIST(date: Date | string, options?: Intl.DateTimeFormatOptions): string
```
Formats time to IST locale string with custom options. Defaults to `Asia/Kolkata` timezone.

### formatDateWithWeekday
```ts
function formatDateWithWeekday(date: Date): string
```
Returns formatted date with weekday, e.g. `"14 Mar '26, Thursday"`.

### formatOptionalDate
```ts
function formatOptionalDate(date: Date | string | '-'): string
```
Like `formatDate` but returns `"-"` if input is `"-"`.

### getDaySuffix
```ts
function getDaySuffix(day: number): string
```
Returns day with ordinal suffix: `1` -> `"1st"`, `2` -> `"2nd"`, `11` -> `"11th"`, etc.

### isSameDay
```ts
function isSameDay(date1: Date, date2: Date): boolean
```
Checks if two dates are the same calendar day. Returns `false` if either argument is not a valid Date.

### getWeekDays
```ts
function getWeekDays(currentDate: string | Date, selectedDate: string | Date): WeekDay[]
```
Returns 7-day array (Sun-Sat) for the week containing `currentDate`. Each entry has `{ day, date, fullDate, isToday, isActive, hasBreak?, isAbsent? }`.

### getMonthDays
```ts
function getMonthDays(currentDate: Date | string, selectedDate: Date | string): MonthDay[]
```
Returns full month grid including padding days from adjacent months. Each entry has `{ day, date, fullDate, isToday, isActive, isPadding }`.

### getStartOfDay
```ts
function getStartOfDay(date?: Date): Date
```
Returns start of day (00:00:00.000). Defaults to current date.

### getEndOfDay
```ts
function getEndOfDay(date?: Date): Date
```
Returns end of day (23:59:59.999). Defaults to current date.

### removeAllEmojis
```ts
function removeAllEmojis(text?: string): string
```
Strips all emoji characters from a string. Returns `""` if input is undefined.

### removeEmojiAtStart
```ts
function removeEmojiAtStart(text: string): string
```
Strips emoji characters only from the beginning of a string.

### ApprovedAdjustments (ApprovedAdjustmentsProps) — component
    adjustments: Adjustment[] (REQUIRED)
    adminId: string (REQUIRED)
    ...HTMLDivElement attributes

Renders a table of approved adjustments showing user, date, days, type, reason, and approver. Displays "You" for self-approved items.

## Example
```jsx
import {
  renderStatus,
  renderAdjustmentType,
  formatDate,
  formatDateIST,
  removeAllEmojis,
  ApprovedAdjustments,
} from '@devalok/shilp-sutra-karm/admin'

// Render a status badge
{renderStatus('APPROVED')}           // -> <Badge color="success">Approved</Badge>
{renderStatus('PENDING', true)}      // -> <Badge color="warning">Pending</Badge>

// Render adjustment type
{renderAdjustmentType('CASHOUT')}    // -> <div>Cashout</div>

// Format dates
formatDate(new Date())               // "14 Mar '26"
formatDateIST(new Date(), { weekday: 'long' }) // "Thursday"
formatDateWithWeekday(new Date())    // "14 Mar '26, Thursday"
getDaySuffix(3)                      // "3rd"

// Clean emoji text
removeAllEmojis("Hello World")    // "Hello World"
removeEmojiAtStart("Hello")       // "Hello"

// Approved adjustments table
<ApprovedAdjustments adjustments={approvedList} adminId="admin-1" />
```

## Gotchas
- All date functions use `Asia/Kolkata` timezone and `en-IN` locale by default
- `renderAdjustmentType` and `renderStatus` return JSX — call them as functions, not as components
- `renderStatus` falls back to the REJECTED config for unknown status values
- `getWeekDays` starts weeks on Sunday (weekStartsOn: 0)
- `getMonthDays` includes padding days from previous/next months with `isPadding: true`

## Changes
### v0.9.0
- **Added** Initial release with all admin utility functions
