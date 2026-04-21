# Container

- Import: @devalok/shilp-sutra/ui/container
- Server-safe: Yes
- Category: ui

## Props
    maxWidth: "default" | "body" | "full"
    as: ElementType (default: "div")

## Defaults
    maxWidth="default"

## Example
```jsx
<Container maxWidth="body">
  <p>Centered content</p>
</Container>
```

## Composability
- **Server-safe layout primitive.** Safe in RSC trees — no hooks, no context.
- **maxWidth choices:**
  - `"default"` (standard page container — matches the design system's layout grid)
  - `"body"` (narrower reading width — use for article/blog content)
  - `"full"` (no max — edge-to-edge, useful for full-bleed marketing sections)
- **Polymorphic via `as`:** Change the rendered element for semantics (`as="main"` for page content, `as="section"` for major subdivisions, `as="article"` for standalone content).
- **mx-auto centering is automatic** — Container handles horizontal centering; it does NOT add vertical spacing. Pair with `py-*` utility classes on the Container itself or inside it.
- Nothing cascades — nesting Containers is fine but rarely useful (max-width constraints compound).

## Gotchas
- Server-safe component — can be imported directly in Next.js Server Components
- Container does NOT add vertical padding — add it explicitly via className if needed

## Changes
### v0.1.0
- **Added** Initial release
