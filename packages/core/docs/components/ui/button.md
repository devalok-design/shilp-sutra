# Button

- Import: @devalok/shilp-sutra/ui/button
- Server-safe: No
- Category: ui

## Props
    variant: "solid" | "soft" | "outline" | "ghost" | "link" | "default" (alias->solid) | "destructive" (alias->solid+error)
    color: "accent" | "error" | "success" | "warning" | "neutral" | "default" (alias->accent)
    size: "xs" | "sm" | "md" | "lg" | "compact-xs" | "compact-sm" | "compact-md" | "icon" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg"
    weight: "semibold" | "normal"
    shape: "default" | "pill"
    startIcon: ReactElement (use <Icon icon={...} />) | null
    endIcon: ReactElement (use <Icon icon={...} />) | null
    loading: boolean (disables button, shows spinner)
    loadingPosition: "start" | "end" | "center" (default: "start")
    fullWidth: boolean
    asChild: boolean
    onClickAsync: (e: MouseEvent) => Promise<void> (auto loading->success/error->idle)
    asyncFeedbackDuration: number (ms, default 1500)

## Defaults
    variant="solid", color="accent", weight="semibold", size="md", shape="default"

## Example
```jsx
<Button variant="solid" color="error" startIcon={<Icon icon={IconTrash} />} loading={isDeleting}>
  Delete project
</Button>
<Button variant="soft" color="success" startIcon={<Icon icon={IconCheck} />}>Approved</Button>
<Button variant="soft" color="warning" size="compact-sm" shape="pill">Overdue</Button>
```

## Gotchas
- DO NOT use variant="destructive" — use variant="solid" color="error"
- DO NOT use variant="secondary" — use variant="outline" or variant="ghost"
- DO NOT use size="default" — use size="md"
- DO NOT use color="danger" or color="default" — use color="error" or color="accent"
- startIcon/endIcon now expect `<Icon icon={...} />` wrapper, not bare icon components
- Inherits variant/color/size/weight/shape from ButtonGroup context if present
- onClickAsync overrides onClick and loading when active
- Grain children (DevalokGrain) are auto-separated and rendered as direct button children for absolute positioning

## Changes
### v0.29.0
- **Added** `soft` variant — tinted background, colored text (new middle ground between solid and ghost)
- **Added** 5 color options: `accent` (default), `error`, `success`, `warning`, `neutral` (replaces old `default`/`error`-only axis)
- **Added** `shape` prop: `"default"` | `"pill"` (rounded-full with extra horizontal padding)
- **Added** compact sizes: `compact-xs`, `compact-sm`, `compact-md` (height-less inline buttons)
- **Added** `xs` size and `icon-xs` size
- **Added** `weight` prop: `"semibold"` (default) | `"normal"` for lighter labels
- **Changed** `startIcon`/`endIcon` now accept `<Icon icon={...} />` wrapper (auto-sized via IconProvider context per button size)
- **Changed** Default color is now `"accent"` (was `"default"`)
- **Changed** Solid hover adds tinted shadows per color (e.g., `hover:shadow-brand`, `hover:shadow-error`)
- **Changed** Icon slots get negative-margin inset to tighten padding against button edges
- **Added** DevalokGrain support — grain children are auto-separated and rendered for texture overlays

### v0.22.0
- **Changed** Active/pressed scale from `0.97` to `0.95` for snappier press feedback.
- **Fixed** Ghost/outline hover not fading — `transition-transform` in base overrode `transition-colors` from variant. Combined into single `transition-[color,background-color,border-color,box-shadow,transform]`.
- **Added** `disabled:cursor-not-allowed` to button base (was missing).

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
