# Button

- Import: @devalok/shilp-sutra/ui/button
- Server-safe: No
- Category: ui

## Props
    variant: "solid" | "default" (alias->solid) | "outline" | "ghost" | "link" | "destructive" (alias->solid+error)
    color: "default" | "error"
    size: "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-md" | "icon-lg"
    startIcon: ReactNode
    endIcon: ReactNode
    loading: boolean (disables button, shows spinner)
    loadingPosition: "start" | "end" | "center" (default: "start")
    fullWidth: boolean
    asChild: boolean
    onClickAsync: (e: MouseEvent) => Promise<void> (auto loading->success/error->idle)
    asyncFeedbackDuration: number (ms, default 1500)

## Defaults
    variant="solid", color="default", size="md"

## Example
```jsx
<Button variant="solid" color="error" startIcon={<IconTrash />} loading={isDeleting}>
  Delete project
</Button>
```

## Gotchas
- DO NOT use variant="destructive" — use variant="solid" color="error"
- DO NOT use variant="secondary" — use variant="outline" or variant="ghost"
- DO NOT use size="default" — use size="md"
- DO NOT use color="danger" — use color="error"
- Inherits variant/color/size from ButtonGroup context if present
- onClickAsync overrides onClick and loading when active

## Changes
### v0.18.0
- **Added** `onClickAsync` prop — promise-driven loading -> success/error state machine
- **Added** `asyncFeedbackDuration` prop (default 1500ms)
- **Changed** whileTap scale animation added via Framer Motion
- **Fixed** Async feedback colors — `bg-success text-text-on-color` changed to `bg-success-9 text-accent-fg`
- **Fixed** `onClickAsync` added `isMountedRef` guard to prevent set-state-after-unmount

### v0.4.2
- **Fixed** `Omit<HTMLAttributes, 'color'>` resolves TS2320 conflict with CVA color prop
- **Fixed** `className` was passed inside `buttonVariants()` (silently dropped by CVA) — now separate `cn()` argument

### v0.3.0
- **Changed** (BREAKING) `variant="primary"` renamed to `variant="solid"`, `variant="secondary"` renamed to `variant="outline"`, `variant="error"` moved to `color="error"`
- **Fixed** All dismiss/close buttons now meet WCAG 2.5.8 minimum 24px touch target

### v0.1.0
- **Added** Initial release
