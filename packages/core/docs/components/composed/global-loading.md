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
- **Thin top-of-viewport progress bar** — for route-level navigation indicators (NProgress-style). Fixed at the top; z-toast layer.
- **Wire to router events:** Pair with Next.js `useRouter` + navigation events, or react-router's `useNavigation`, or a custom global loading state in Redux/Zustand. Set `isLoading={true}` during transit, `false` when landed.
- **Not for in-page loading** — use Spinner, Skeleton, or LoadingSkeleton for component-level loading states. GlobalLoading is strictly for cross-route / full-page transitions.
- **Auto-unmounts when isLoading=false** — no need to manage visibility via classes or conditional rendering.

## Gotchas
- Fixed-position bar at top of viewport (z-toast layer)
- Renders nothing when `isLoading` is false

## Changes
### v0.18.0
- **Fixed** Track `setTimeout` with ref, add cleanup on unmount

### v0.1.0
- **Added** Initial release
