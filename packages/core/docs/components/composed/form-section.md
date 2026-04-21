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
- **Visual grouping of related FormFields.** Wraps its children with a title + description + horizontal rule separator. No state, no context.
- **collapsible mode** wraps content in a Collapsible — useful for "Advanced settings" or optional form sections. `defaultOpen={false}` for initially-closed.
- **Pairs with FormField:** Each form control inside should be a FormField for consistent label + helper text + validation. FormSection doesn't auto-wrap; you still structure each field yourself.
- **Not a page-level header** — for a full form's main heading use PageHeader. FormSection is mid-form, between field groups.

## Gotchas
- `defaultOpen` only applies when `collapsible={true}` — otherwise the section is always open
- Renders a horizontal rule between the header and content automatically
