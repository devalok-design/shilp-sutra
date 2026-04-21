# ContentCard

- Import: @devalok/shilp-sutra/composed/content-card
- Server-safe: Yes
- Category: composed

## Props
    variant: "default" | "outline" | "ghost"
    padding: "default" | "compact" | "spacious" | "none"
    header: ReactNode (custom header content)
    headerTitle: string (simple text header)
    headerActions: ReactNode (actions in header area)
    footer: ReactNode
    children: ReactNode (body)

## Defaults
    variant="default", padding="default"

## Example
```jsx
<ContentCard headerTitle="Team Members" headerActions={<Button size="sm">Add</Button>}>
  <p>Member list here</p>
</ContentCard>
```

## Composability
- **Server-safe higher-level Card** — wraps ui/Card with conventional header/title/actions/footer slots.
- **When to use:** List rows, dashboard tiles, any "card with title + optional actions + body + optional footer" pattern. Use raw ui/Card for custom layouts or when you need accent bars.
- **Slot precedence:** `header` beats `headerTitle`. Use `headerTitle` for simple strings, `header` for rich content.
- **padding variants** (default/compact/spacious/none) set once on ContentCard; the underlying Card size cascade propagates.

## Gotchas
- Server-safe: can be imported directly in Next.js Server Components
- Use `headerTitle` for simple text headers; use `header` for custom header content
- `header` takes precedence over `headerTitle` if both are provided

## Changes
### v0.2.0
- **Added** Identified as server-safe component

### v0.1.0
- **Added** Initial release
