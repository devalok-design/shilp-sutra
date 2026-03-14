# ScheduleView

- Import: @devalok/shilp-sutra/composed/schedule-view
- Server-safe: No
- Category: composed

## Props
    view: "day" | "week" (REQUIRED)
    date: Date (REQUIRED — current day or any date in target week)
    events: ScheduleEvent[] (REQUIRED) — { id, title, start: Date, end: Date, color? }
    onEventClick?: (event: ScheduleEvent) => void
    onSlotClick?: (start: Date, end: Date) => void
    startHour: number (default: 8)
    endHour: number (default: 18, exclusive)
    slotDuration: number (minutes, default: 30)

Event colors: "primary" | "success" | "warning" | "error" | "info" | "neutral"

## Defaults
    startHour=8, endHour=18, slotDuration=30

## Example
```jsx
<ScheduleView
  view="week"
  date={new Date()}
  events={calendarEvents}
  onEventClick={(e) => openEvent(e.id)}
/>
```

## Gotchas
- `endHour` is exclusive — `endHour=18` means the last visible slot starts at 17:30 (with default 30min slots)
- `onSlotClick` fires when clicking an empty time slot — useful for creating new events
- Events that span outside `startHour`/`endHour` may be clipped

## Changes
### v0.1.0
- **Added** Initial release
