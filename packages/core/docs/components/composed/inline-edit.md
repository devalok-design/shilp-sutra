# InlineEdit

- Import: @devalok/shilp-sutra/composed/inline-edit
- Server-safe: No
- Category: composed

## Props
    value: string (current text value)
    onSave: (newValue: string) => void | Promise<void> (called on commit; async shows spinner)
    placeholder: string (shown when value is empty)
    textClassName: string (CSS class for read-mode text, e.g. "text-ds-lg font-semibold")
    inputSize: "xs" | "sm" | "md" (input height in edit mode)
    multiline: boolean (renders textarea instead of input)
    readOnly: boolean
    maxLength: number
    saving: boolean (external saving state — shows spinner)

## Defaults
    placeholder="Click to edit", inputSize="sm", multiline={false}, readOnly={false}, saving={false}

## Example
```jsx
<InlineEdit
  value={title}
  onSave={(v) => updateTitle(v)}
  textClassName="text-ds-lg font-semibold"
/>
<InlineEdit value={notes} onSave={saveNotes} multiline />
```

## Gotchas
- Enter commits the edit (for multiline, use Ctrl/Cmd+Enter to commit; plain Enter adds a newline)
- Escape cancels the edit and reverts to the original value
- The value is trimmed before calling `onSave`; if the trimmed value equals the original, `onSave` is not called
- If `onSave` returns a Promise, a spinner is shown automatically until it resolves
