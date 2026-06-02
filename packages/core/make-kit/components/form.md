# Form

Wrap each form field in a `<FormField>`. It cascades state + a11y wiring to compatible controls automatically.

```tsx
import { FormField, FormHelperText, useFormField } from '@devalok/shilp-sutra/ui/form'
import { Label } from '@devalok/shilp-sutra/ui/label'
```

## When to use

- Every input field in a form. One `<FormField>` per logical field.
- Provides: validation state, helper text, `aria-describedby`, `aria-invalid`, `aria-required` — wired automatically.
- Not for layout — for stacking fields, use `<Stack gap="ds-05">`.

## Compound shape

```
FormField (state, required)
  Label                    ← htmlFor auto-resolves from FormField inputId
  Input | Textarea | NumberInput | InputOTP | Select | Checkbox | ...
  FormHelperText           ← reads state + helperTextId from context
```

`FormField` generates a shared `inputId`. Both `<Label>` (via `htmlFor`) and `<Input>` (via `id`) read it from context — drop the manual id-matching dance. Explicit `htmlFor` / `id` on a child still wins.

## FormField props

| Prop | Type | Notes |
|---|---|---|
| `state` | `'helper'\|'error'\|'warning'\|'success'` | Default `helper`. Cascades to compatible controls + FormHelperText. |
| `helperTextId` | `string` | Auto-generated if omitted. Used by `aria-describedby` wiring. |
| `inputId` | `string` | Auto-generated if omitted. Shared between `<Label htmlFor>` and `<Input id>`. |
| `required` | `boolean` | Sets `aria-required` on consuming controls. Does NOT auto-render the asterisk — that comes from `<Label required>`. |

## FormHelperText props

| Prop | Type | Notes |
|---|---|---|
| `state` | `'helper'\|'error'\|'warning'\|'success'` | Inherits from FormField context. Override per-helper if needed. |

When `state="error"`, FormHelperText renders `role="alert"` so screen readers interrupt.

## Label props

| Prop | Type | Notes |
|---|---|---|
| `htmlFor` | `string` | Optional inside `<FormField>` — falls back to FormField's `inputId`. Required when used outside FormField. |
| `required` | `boolean` | Renders red asterisk. Does NOT set `aria-required` (that comes from FormField). |

## useFormField hook

```ts
const field = useFormField()
// → { state, helperTextId, required } | undefined
```

Use inside a custom control to consume FormField context.

## What auto-consumes FormField context

| Control | Auto-receives |
|---|---|
| `<Input>` | `id` (from `inputId`), `state`, `aria-describedby`, `aria-invalid`, `aria-required` |
| `<Textarea>` | same |
| `<NumberInput>` | same |
| `<InputOTP>` | `state`, `aria-describedby`, `aria-required` |
| `<Label>` | `htmlFor` (from `inputId`) |

| Control | Manual wiring needed |
|---|---|
| `<Select>` / `<SelectTrigger>` | Set `color="error"` on `SelectTrigger` from your validation state. |
| `<Checkbox>`, `<Radio>`, `<Switch>` | Pair `<Label htmlFor>` manually. State is visual on the control. |

## Examples

**Standard text field with error:**
```tsx
<FormField state={errors.email ? 'error' : 'helper'}>
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  <FormHelperText>
    {errors.email ?? 'We will never share your email.'}
  </FormHelperText>
</FormField>
```

The Input receives `aria-describedby` (linked to FormHelperText), `aria-invalid="true"` when state is error, and `aria-required="true"`.

**Warning state:**
```tsx
<FormField state="warning">
  <Label htmlFor="password" required>Password</Label>
  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
  <FormHelperText>Password strength: weak. Add a number or symbol.</FormHelperText>
</FormField>
```

**Textarea:**
```tsx
<FormField state={errors.bio ? 'error' : 'helper'}>
  <Label htmlFor="bio">Bio</Label>
  <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
  <FormHelperText>{errors.bio ?? `${bio.length} / 200`}</FormHelperText>
</FormField>
```

**Required Checkbox (manual label pairing):**
```tsx
<FormField required state={errors.terms ? 'error' : 'helper'}>
  <Stack direction="horizontal" gap="ds-03" align="center">
    <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
    <Label htmlFor="terms">I agree to the terms.</Label>
  </Stack>
  {errors.terms && <FormHelperText>{errors.terms}</FormHelperText>}
</FormField>
```

**Full form layout:**
```tsx
<form onSubmit={handleSubmit}>
  <Stack gap="ds-05">
    <FormField>
      <Label htmlFor="name" required>Name</Label>
      <Input id="name" />
    </FormField>

    <FormField>
      <Label htmlFor="email" required>Email</Label>
      <Input id="email" type="email" />
      <FormHelperText>For account recovery only.</FormHelperText>
    </FormField>

    <FormField state={errors.role ? 'error' : 'helper'}>
      <Label htmlFor="role">Role</Label>
      <Select>
        <SelectTrigger id="role" color={errors.role ? 'error' : 'default'}>
          <SelectValue placeholder="Choose a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>
      {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
    </FormField>

    <Stack direction="horizontal" gap="ds-03" justify="end">
      <Button variant="soft" type="button">Cancel</Button>
      <Button type="submit">Save</Button>
    </Stack>
  </Stack>
</form>
```

**Custom control consuming FormField context:**
```tsx
function ColorPickerField(props) {
  const field = useFormField()
  return (
    <ColorPicker
      {...props}
      aria-describedby={field?.helperTextId}
      aria-invalid={field?.state === 'error' || undefined}
      aria-required={field?.required || undefined}
    />
  )
}
```

## Composability

- **Explicit props override context** — `<Input state="error">` inside a `<FormField state="helper">` makes only that input look errored. Same for `id` / `htmlFor`.
- **Don't nest FormFields** — only the outermost context wins. Some a11y wiring silently breaks.
- **Label-to-control pairing auto-wires inside FormField** via the shared `inputId`. Outside FormField, set `htmlFor` + `id` explicitly.
- **For non-auto-wired controls** (Checkbox, Radio, Switch) where the visible label sits beside the control, you can still drop the `htmlFor` if you put the control inside FormField with no other Inputs — `inputId` resolves on the Checkbox via its `id` prop the same way.

See `foundations/color.md` for state colors, `foundations/spacing.md` for inter-field spacing (`ds-05` default).

## Rules

- One FormField per logical field. Never nest FormFields.
- For error display, drive `FormField state` from your validation state — every consuming control updates together.
- For Select / Checkbox / Radio / Switch, set the control's error visual manually (`color="error"` on SelectTrigger) — they don't auto-consume FormField state, only ids and a11y attrs.
- Don't use the removed `getFormFieldA11y()` helper — use the `useFormField()` hook.
- Inside FormField, `<FormHelperText>` reads `state` + id from context — don't pass them again unless intentionally overriding.
- Use `<Stack gap="ds-05">` to space fields vertically. Don't reach for `ds-04` or `ds-06` — see `foundations/spacing.md`.
- `<Label required>` only renders the asterisk. The `aria-required` flag comes from `<FormField required>`.
- You can omit `id` on `<Input>` and `htmlFor` on `<Label>` inside a `<FormField>` — both resolve from FormField's `inputId`. Set them explicitly only when overriding the auto-generated id.
