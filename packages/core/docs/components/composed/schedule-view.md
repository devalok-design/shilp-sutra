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

Event colors: "accent" | "success" | "warning" | "error" | "info" | "neutral"

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

## Composability
- **Day / Week calendar view** for time-block display (meetings, shifts, availability). Not a full calendar app — no month view, no drag-to-create.
- **Event data is consumer-owned:** You pass `events` as an array; ScheduleView doesn't fetch, doesn't cache, doesn't expand recurring events. All scheduling logic lives in your app.
- **Event click + slot click** — `onEventClick` for existing events; `onSlotClick` for creating new events (fires with start/end of the empty slot).
- **Color vocabulary matches the DS** — `accent/success/warning/error/info/neutral`. Map your event types to these at the data layer.
- **endHour is exclusive:** `endHour=18` means the last visible slot starts at 17:30 (with 30min slots). Match your UX expectation: 9-5 typically means `startHour=9, endHour=18`.
- **Pairs with date-picker/composed** — use DatePicker or DateRangePicker to choose which date to show; pass that as ScheduleView's `date`.

## Gotchas
- `endHour` is exclusive — `endHour=18` means the last visible slot starts at 17:30 (with default 30min slots)
- `onSlotClick` fires when clicking an empty time slot — useful for creating new events
- Events that span outside `startHour`/`endHour` may be clipped

## Changes
### v0.49.0
- **BREAKING** `ScheduleEvent.color` value `"primary"` renamed `"accent"` (DS colour vocabulary). It was the default, so untyped events are unaffected.
- **Added** keyboard focus rings on slot cells + event blocks; current-time indicator uses the shared `<Dot>`.

### v0.1.0
- **Added** Initial release
