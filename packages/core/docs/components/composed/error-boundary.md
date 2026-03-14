# ErrorDisplay

- Import: @devalok/shilp-sutra/composed/error-boundary
- Server-safe: No
- Category: composed

## Props
    error: unknown (REQUIRED — Error object, status object, or string)
    onReset: () => void (optional retry button)

## Defaults
    None

## Example
```jsx
<ErrorDisplay error={error} onReset={() => refetch()} />
```

## Gotchas
- Auto-detects HTTP status codes (404, 403, 500) and shows appropriate icon/message
- Shows stack trace in development mode only
- The import path is `error-boundary` but the component is named `ErrorDisplay`

## Changes
### v0.18.0
- **Added** ErrorBoundary tests (13 new tests)

### v0.1.0
- **Added** Initial release
