# DatePicker

- Import: @devalok/shilp-sutra/composed/date-picker
- Server-safe: No
- Category: composed

## Props

### DatePicker
    value?: Date | null
    onChange?: (date: Date | null) => void
    placeholder: string (default: "Pick a date")
    formatStr: string (default: "MMM d, yyyy")
    minDate: Date
    maxDate: Date
    disabledDates: (date: Date) => boolean
    className: string

### DateRangePicker
    startDate?: Date | null
    endDate?: Date | null
    onChange?: (range: { start: Date | null, end: Date | null }) => void
    placeholder: string (default: "Pick a date range")
    formatStr: string (default: "MMM d, yyyy")
    minDate: Date
    maxDate: Date
    disabledDates: (date: Date) => boolean
    presets: PresetKey[] (shows quick-select sidebar)
    numberOfMonths: number (default: 1)

### DateTimePicker
    value: Date | null
    onChange: (date: Date | null) => void
    minDate: Date
    maxDate: Date
    disabledDates: (date: Date) => boolean
    timeFormat: "12h" | "24h"
    minuteStep: number
    placeholder: string
    className: string

### TimePicker
    value?: Date | null (time stored as a Date object)
    onChange?: (date: Date) => void
    format: "12h" | "24h" (default: "12h")
    minuteStep: number (default: 1)
    secondStep: number (default: 1)
    showSeconds: boolean (default: false)
    placeholder: string (default: "Pick a time")
    disabled: boolean (default: false)
    className: string

### CalendarGrid
    currentMonth: Date (REQUIRED)
    selected?: Date | null
    rangeStart?: Date | null
    rangeEnd?: Date | null
    hoverDate?: Date | null
    onSelect: (date: Date) => void (REQUIRED)
    onHover?: (date: Date | null) => void
    onMonthChange: (date: Date) => void (REQUIRED)
    onHeaderClick?: () => void
    disabledDates: (date: Date) => boolean
    minDate: Date
    maxDate: Date
    hidePrevNav: boolean
    hideNextNav: boolean
    events: CalendarEvent[] — { date: Date, color?: string, label?: string }

### YearPicker
    currentYear: number (REQUIRED)
    selectedYear: number
    onYearSelect: (year: number) => void (REQUIRED)
    minDate: Date
    maxDate: Date

### MonthPicker
    currentYear: number (REQUIRED)
    selectedMonth: number (0-11)
    onMonthSelect: (month: number) => void (REQUIRED)
    minDate: Date
    maxDate: Date

### Presets
    presets: PresetKey[] (REQUIRED)
    onSelect: (start: Date, end: Date) => void (REQUIRED)
    className: string

PresetKey: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear'

### useCalendar hook
    useCalendar(initialMonth?: Date) => { currentMonth, setCurrentMonth, goToPreviousMonth, goToNextMonth, goToMonth, goToYear }

## Defaults
    DatePicker: placeholder="Pick a date", formatStr="MMM d, yyyy"
    DateRangePicker: placeholder="Pick a date range", formatStr="MMM d, yyyy", numberOfMonths=1
    TimePicker: format="12h", minuteStep=1, secondStep=1, showSeconds=false

## Example
```jsx
<DatePicker value={date} onChange={setDate} placeholder="Select date" />

<DateRangePicker
  startDate={start}
  endDate={end}
  onChange={({ start, end }) => { setStart(start); setEnd(end); }}
/>

<DateTimePicker value={dateTime} onChange={setDateTime} timeFormat="12h" minuteStep={15} />

<TimePicker value={time} onChange={setTime} format="24h" minuteStep={15} />
```

## Gotchas
- TimePicker stores time inside a Date object — only hours/minutes/seconds are meaningful
- CalendarGrid is a low-level building block — prefer DatePicker/DateRangePicker for most use cases
- MonthPicker month values are 0-indexed (Jan=0, Dec=11) — same as JavaScript `Date.getMonth()`
- YearPicker displays a 12-year grid based on the decade of `currentYear`
- CalendarGrid supports up to 3 event dots per day cell
- useCalendar is a convenience hook for managing calendar month state

## Changes
### v0.18.0
- **Fixed** Added `aria-label` to DatePicker/DateRangePicker trigger buttons

### v0.4.2
- **Changed** DateRangePicker default `formatStr` from `'MMM d'` to `'MMM d, yyyy'`

### v0.1.0
- **Added** Initial release
