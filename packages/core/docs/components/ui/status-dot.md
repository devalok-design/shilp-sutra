# StatusDot

- Import: @devalok/shilp-sutra/ui/status-dot
- Server-safe: Yes
- Category: ui

## Props
    status: "healthy" | "warning" | "critical" | "neutral" | "inactive"
    size: "sm" | "md" | "lg"
    pulse: boolean (ping animation; defaults to true for "healthy", false for others)
    label: string (inline text rendered after the dot)
    labelClassName: string (extra classes on the label span)

## Defaults
    size="md", pulse={status === "healthy"}

## Example
```jsx
<StatusDot status="healthy" />
<StatusDot status="critical" label="Service down" pulse />
<StatusDot status="warning" size="lg" label="Elevated load" />
```

## Composability
- **Server-safe presentational dot** — simple status indicator, pairs with inline text.
- **Status semantics map to color:** healthy=success, warning=warning, critical=error, neutral=muted surface, inactive=dimmed. The pulse animation calls attention to "healthy" by default (active presence); you can flip it for other statuses by setting pulse explicitly.
- **StatusDot vs BadgeIndicator vs StatusBadge:**
  - StatusDot = tiny presence/status indicator with optional inline label (e.g. "Service online")
  - BadgeIndicator = overlay on another element (notification dot on a bell icon)
  - StatusBadge (composed) = full pill-style badge with colored bg and label text (e.g. ticket status)
- **Label composability:** If you pass `label`, it renders inline after the dot. Use `labelClassName` for custom typography (e.g. font-mono for status codes).

## Gotchas
- The `pulse` prop auto-enables for "healthy" status — pass `pulse={false}` to suppress
- Status type is exported as `StatusDotStatus` if you need it in consumer code
