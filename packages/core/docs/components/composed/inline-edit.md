# InlineEdit

- Import: @devalok/shilp-sutra/composed/inline-edit
- Server-safe: No
- Category: composed

## Props
    value: string (current text value)
    onSave: (newValue: string) => void | Promise<void> (called on commit; async shows spinner)
    placeholder: string (shown when value is empty)
    textClassName: string (CSS class for the editable text, e.g. "text-ds-lg font-semibold")
    readOnly: boolean
    maxLength: number
    saving: boolean (external saving state — shows spinner, disables editing)

## Defaults
    placeholder="Click to edit", readOnly={false}, saving={false}

## Example
```jsx
<InlineEdit
  value={title}
  onSave={(v) => updateTitle(v)}
  textClassName="text-ds-lg font-semibold"
/>
```

## Composability
<!-- composability-stub -->
- TODO: document how this component composes with others (context cascade, slot API, portal behavior, common pairings, when to use vs alternatives).

## Gotchas
- Uses contentEditable — the text IS the editor. No input field appears.
- Click to focus → cursor appears in text. Type to edit. Enter saves. Escape reverts.
- Text is auto-selected on focus (like renaming a file in Finder)
- Paste is restricted to plain text (no rich content)
- The value is trimmed before calling `onSave`; if unchanged, `onSave` is not called
- If `onSave` returns a Promise, a spinner is shown and editing is disabled until it resolves
- On Promise rejection, the text reverts to the original value
