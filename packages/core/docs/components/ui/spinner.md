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

## Composability
- **Prefer Button's `loading` prop** for inline button spinners — Button's integration is automatic (disables, sets aria-busy, positions the spinner). Manual Spinner inside Button is more work for no gain.
- **`variant="bare"`** uses `currentColor` — drop it into any surface (button, toolbar, badge, icon group) and it picks up the parent's text color automatically.
- **State transitions:** `spinning → success → idle` / `spinning → error → idle`. Use the state machine for async operation feedback (the success checkmark, error X animate in). Pair with `onComplete` to trigger next-step logic after the transition.
- **delay for flicker prevention:** Set `delay={150}` so very fast operations don't flash a spinner. The spinner mounts only after the delay elapses — if the operation completes first, the user never sees it.
- **Icon.state="loading" uses Spinner internally** — same underlying component. If you're inside an Icon context, prefer `<Icon state="loading" />` for consistent sizing.

## Gotchas
- Renders role="status" with sr-only "Loading..." text — no need for aria-label
- Button has built-in loading prop — prefer that over manual Spinner composition
- `bare` variant inherits text color — useful inside buttons and toolbars
- `delay` prevents flicker: spinner only appears after delay ms (good for fast API calls)
- No longer server-safe as of v0.18.0 (uses Framer Motion)

## Changes
### v0.29.0
- **Changed** `bare` variant spinning state now uses `currentColor` instead of `var(--color-accent-9)` — inherits text color from parent for seamless embedding in buttons/toolbars

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
