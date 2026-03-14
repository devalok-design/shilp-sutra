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

## Gotchas
- Fixed-position bar at top of viewport (z-toast layer)
- Renders nothing when `isLoading` is false

## Changes
### v0.18.0
- **Fixed** Track `setTimeout` with ref, add cleanup on unmount

### v0.1.0
- **Added** Initial release
