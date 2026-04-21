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

## Composability
- **One component, two containers.** Above `breakpoint`: centered Dialog. Below: bottom-anchored Sheet. Same content slot, different surface treatment per viewport.
- **Standard controlled model** — `open` + `onOpenChange` (same shape as Dialog/Sheet).
- **title + description pattern** — matches Dialog/Sheet's requirement for an accessible heading. Omit both only when the surrounding context makes the purpose obvious (rare).
- **SSR caveat:** `window.matchMedia` reads on mount — initial SSR render defaults to desktop (Dialog). Hydration flips to Sheet on mobile. Acceptable for most flows; visible layout shift on low-spec devices.
- **When to use:** Any modal that needs to behave differently on mobile (edit dialogs, filter panels, quick-action menus). For always-the-same behavior, use Dialog or Sheet directly.

## Gotchas
- Renders a centered Dialog on desktop and a bottom Sheet on mobile — same content, different container
- Uses `window.matchMedia` internally — SSR defaults to desktop (Dialog) until hydration
- Title and description are optional; if omitted, no header is rendered in either mode
