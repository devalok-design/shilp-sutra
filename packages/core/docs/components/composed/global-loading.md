# GlobalLoading

- Import: @devalok/shilp-sutra/composed/global-loading
- Server-safe: No
- Category: composed

## Props
    isLoading: boolean (REQUIRED)

## Defaults
    None

## Example
```jsx
<GlobalLoading isLoading={isNavigating} />
```

## Composability
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- Fixed-position bar at top of viewport (z-toast layer)
- Renders nothing when `isLoading` is false

## Changes
### v0.18.0
- **Fixed** Track `setTimeout` with ref, add cleanup on unmount

### v0.1.0
- **Added** Initial release
