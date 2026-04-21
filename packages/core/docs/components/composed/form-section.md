# FormSection

- Import: @devalok/shilp-sutra/composed/form-section
- Server-safe: No
- Category: composed

## Props
    title: string
    description: string (subtitle text below the title)
    collapsible: boolean (wraps content in a Collapsible)
    defaultOpen: boolean (initial open state when collapsible)
    children: ReactNode (form fields)

## Defaults
    collapsible={false}, defaultOpen={true}

## Example
```jsx
<FormSection title="General" description="Basic project settings">
  <FormField .../>
  <FormField .../>
</FormSection>

<FormSection title="Advanced" collapsible defaultOpen={false}>
  <FormField .../>
</FormSection>
```

## Composability
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- `defaultOpen` only applies when `collapsible={true}` — otherwise the section is always open
- Renders a horizontal rule between the header and content automatically
