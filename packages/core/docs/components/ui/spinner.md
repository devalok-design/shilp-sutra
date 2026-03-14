# Spinner

- Import: @devalok/shilp-sutra/ui/spinner
- Server-safe: No
- Category: ui

## Props
    size: "sm" | "md" | "lg"
    state: "spinning" | "success" | "error"
    variant: "filled" | "bare"
    delay: number (ms — render delay to avoid flicker on fast operations)
    onComplete: () => void (callback after success/error state transition)
    className: string

## Defaults
    size: "md"
    state: "spinning"
    variant: "filled"

## Example
```jsx
<Spinner size="lg" />
<Spinner state="success" /> {/* green checkmark */}
<Spinner variant="bare" /> {/* uses currentColor, for embedding in buttons */}
```

## Gotchas
- Renders role="status" with sr-only "Loading..." text — no need for aria-label
- Button has built-in loading prop — prefer that over manual Spinner composition
- `bare` variant inherits text color — useful inside buttons and toolbars
- `delay` prevents flicker: spinner only appears after delay ms (good for fast API calls)
- No longer server-safe as of v0.18.0 (uses Framer Motion)

## Changes
### v0.18.0
- **Changed** (BREAKING) Complete rewrite with Framer Motion arc animation and state transitions
- **Added** `state` prop: 'spinning' | 'success' | 'error'
- **Added** `variant` prop: 'filled' | 'bare'
- **Added** `delay` prop for flicker prevention
- **Added** `onComplete` callback for state transitions
- **Changed** No longer server-safe (Framer Motion dependency)
- **Fixed** Fade out track circle in bare mode, use larger icons for bare variant

### v0.3.0
- **Fixed** Animations respect `prefers-reduced-motion`

### v0.2.0
- **Added** Identified as server-safe (no longer true as of v0.18.0)

### v0.1.0
- **Added** Initial release
