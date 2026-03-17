# ResponsiveOverlay

- Import: @devalok/shilp-sutra/composed/responsive-overlay
- Server-safe: No
- Category: composed

## Props
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    breakpoint: "sm" | "md" (below this renders as bottom Sheet; above as Dialog)
    children: ReactNode
    className: string

## Defaults
    breakpoint="md"

## Example
```jsx
<ResponsiveOverlay
  open={open}
  onOpenChange={setOpen}
  title="Edit task"
  description="Update the task details"
>
  <TaskForm />
</ResponsiveOverlay>
```

## Gotchas
- Renders a centered Dialog on desktop and a bottom Sheet on mobile — same content, different container
- Uses `window.matchMedia` internally — SSR defaults to desktop (Dialog) until hydration
- Title and description are optional; if omitted, no header is rendered in either mode
