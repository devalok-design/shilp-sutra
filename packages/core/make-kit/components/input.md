# Input

Single-line text entry. Use instead of `<input type="text" | "email" | "url" | "tel" | "search" | "password">`.

```tsx
import { Input } from '@devalok/shilp-sutra/ui/input'
```

## When to use

- Any single-line text capture: email, URL, search, name, password, phone.
- Multi-line input? Use `<Textarea>`.
- Number-only with steppers? Use `<NumberInput>`.
- One-time-code / PIN entry? Use `<InputOTP>`.
- Searchable list with selection? Use `<Combobox>` or `<Autocomplete>`.

Wrap in a `<FormField>` for automatic a11y wiring (state, `aria-describedby`, `aria-invalid`, `aria-required`).

## Sizes

| Size | Pixel height | When |
|---|---|---|
| `xs` | 28 | Toolbar / inline filters. |
| `sm` | 32 | Dense forms. |
| `md` (default) | 40 | Standard. |
| `lg` | 48 | Marketing / spacious layouts. |

All sizes use 14 px text — sizes scale height + padding, not font.

## States

| State | Visual | Use |
|---|---|---|
| `default` (default) | Subtle border. | Resting. |
| `error` | Red border + `aria-invalid="true"`. | Validation failure. |
| `warning` | Amber border. | Soft caution (caps lock on, weak password). |
| `success` | Green border. | Inline confirmation. |

## Props

| Prop | Type | Notes |
|---|---|---|
| `size` | `'xs'\|'sm'\|'md'\|'lg'` | Default `md`. Excludes the HTML native `size` attribute. |
| `state` | `'default'\|'error'\|'warning'\|'success'` | Inherits from `<FormField>` context if present. |
| `startSection` | `ReactNode` | Leading slot — icon (React element) or label string. |
| `endSection` | `ReactNode` | Trailing slot — icon or label. |
| `startSectionType` | `'icon'\|'label'` | Auto-inferred from content type. Override only when needed. |
| `endSectionType` | `'icon'\|'label'` | Auto-inferred. |
| `startSectionClickable` | `boolean` | Enables pointer events on the section (e.g. clear button in slot). |
| `endSectionClickable` | `boolean` | Same for trailing slot. |
| `wrapperClassName` | `string` | Classes on the wrapper div (border, bg, ring live here). |
| `className` | `string` | Classes on the raw `<input>` element (transparent — text only). |

Plus all standard HTML input attributes except the native `size` (renamed to mean visual sizing).

## Section type inference

| Content | Renders as |
|---|---|
| React element (`<Icon icon={IconMail} />`) | `'icon'` — fixed-width centered cell. |
| String (`"https://"`, `".00"`) | `'label'` — tinted bg + border separator. |

Override via `startSectionType` / `endSectionType` when the inference is wrong.

## Examples

**Standard, with leading icon:**
```tsx
<Input
  type="email"
  placeholder="you@example.com"
  startSection={<Icon icon={IconMail} />}
/>
```

**URL prefix (label section):**
```tsx
<Input
  startSection="https://"
  placeholder="example.com"
/>
```

**Currency with prefix icon + suffix label:**
```tsx
<Input
  startSection={<Icon icon={IconCurrencyDollar} />}
  endSection=".00"
  placeholder="0"
  inputMode="decimal"
/>
```

**Clearable search (clickable trailing slot):**
```tsx
<Input
  placeholder="Search projects"
  startSection={<Icon icon={IconSearch} />}
  endSection={
    <button type="button" onClick={() => setValue('')} aria-label="Clear">
      <Icon icon={IconX} />
    </button>
  }
  endSectionClickable
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Inside a FormField (auto-wired a11y):**
```tsx
<FormField state="error">
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" type="email" />
  <FormHelperText>Enter a valid work email.</FormHelperText>
</FormField>
```

The Input picks up `state="error"`, `aria-describedby` (linked to FormHelperText), `aria-invalid`, and `aria-required` from FormField context automatically.

**Password with reveal toggle:**
```tsx
const [visible, setVisible] = useState(false)

<Input
  type={visible ? 'text' : 'password'}
  placeholder="Password"
  endSection={
    <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
      <Icon icon={visible ? IconEyeOff : IconEye} />
    </button>
  }
  endSectionClickable
/>
```

## Composability

- **FormField:** Inside a `<FormField>`, Input auto-reads `state`, `aria-describedby`, `aria-invalid`, `aria-required` from context. Explicit props override.
- **IconProvider:** Icons in `startSection` / `endSection` are auto-sized via the input's `size`. Don't pass `size` on the nested `<Icon>`.
- **Container-first architecture:** Border, background, and focus ring live on the wrapper div, not the input element. Style overrides go through `wrapperClassName`, not `className`. The raw `<input>` is transparent.

See `foundations/color.md` for state-color tokens, `foundations/icons.md` for the IconProvider cascade.

## Rules

- Pair every Input with a `<Label htmlFor="x" />` and matching `<Input id="x" />`. FormField does NOT auto-wire labels.
- Use `wrapperClassName` for border / bg / ring overrides. `className` only changes the raw input text styling.
- Don't pass `size` on `<Icon>` inside a section — IconProvider sets it.
- Don't use the HTML native `size` attribute — it's excluded. Use CSS width or the size prop.
- For interactive sections (clear button, password toggle), set `startSectionClickable` / `endSectionClickable`. Without it, the slot is `pointer-events-none`.
- For status / validation, set `state` — it sets `aria-invalid` automatically when `state="error"`.
- Don't use the removed `startIcon` / `endIcon` props — they were removed in 0.38. Use `startSection` / `endSection`.
- Prefer FormField wrapping for any input with a label + helper — manual a11y wiring is error-prone.
