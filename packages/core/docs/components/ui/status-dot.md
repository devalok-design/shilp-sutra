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

## Gotchas
- The `pulse` prop auto-enables for "healthy" status — pass `pulse={false}` to suppress
- Status type is exported as `StatusDotStatus` if you need it in consumer code
