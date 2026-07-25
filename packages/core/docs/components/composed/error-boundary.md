# ErrorDisplay

- Import: @devalok/shilp-sutra/composed/error-boundary
- Server-safe: No
- Category: composed

## Props

### ErrorDisplay (the rendered UI — forwardRef<HTMLDivElement>, spreads div attrs)
    error: unknown (REQUIRED — Error object, status object, or string)
    onReset: () => void (optional — renders a "Try Again" button)
    actions: ReactNode (optional — custom recovery actions; replaces the default button)
    fullPage: boolean (default: true — center in a min-h-[60vh] region; false = inline)
    autoFocusReset: boolean (default: false — focus the recovery button on mount)

Note: the raw `error.message` is shown ONLY in development. In production, ErrorDisplay
shows the friendly status-mapped copy (404/403/500/default); the real message stays in
the dev-only stack-trace block.

### ErrorBoundary (class boundary — wrap a subtree)
    children: ReactNode (REQUIRED)
    onReset: () => void (optional — called after the boundary resets)
    onError: (error: unknown, info: React.ErrorInfo) => void (optional — wire Sentry/logging)
    resetKeys: unknown[] (optional — auto-reset when any value changes; react-error-boundary parity)
    fallback: (props: { error: unknown; onReset: () => void }) => ReactNode (optional — defaults to ErrorDisplay)

## Defaults
    fullPage: true

## Example
```jsx
<ErrorDisplay error={error} onReset={() => refetch()} />
```

## Composability
- **ErrorDisplay, not ErrorBoundary** — confusingly, the import path is `error-boundary` but the component is `ErrorDisplay`. It renders an error UI; it does NOT catch errors. Pair it with your own ErrorBoundary (from react-error-boundary, Next.js error.tsx, etc.) as the fallback UI.
- **Auto-detects HTTP status codes** (404, 403, 500) when the `error` object has a `status` field — shows appropriate icon + message.
- **Dev-only stack trace:** Renders the stack trace only when `process.env.NODE_ENV !== 'production'`. Production users see a clean error page.
- **onReset for retry:** Pass a callback that re-fetches / resets state. Commonly wired to a react-query `refetch` or router `replace(...)`.
- Composes with EmptyState for "no data" states (which aren't really errors) — use EmptyState for empty, ErrorDisplay for failed.

## Gotchas
- Auto-detects HTTP status codes (404, 403, 500) and shows appropriate icon/message
- Shows stack trace in development mode only
- The import path is `error-boundary` but the component is named `ErrorDisplay`

## Changes
### v0.18.0
- **Added** ErrorBoundary tests (13 new tests)

### v0.1.0
- **Added** Initial release
