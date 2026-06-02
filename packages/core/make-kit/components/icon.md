# Icon

Wrapper around Tabler icon components. Auto-sizes via `IconProvider` context.

```tsx
import { Icon } from '@devalok/shilp-sutra/ui'
import { IconPlus, IconCheck, IconX } from '@tabler/icons-react'
```

For the broader icon system (which icons exist, how to register custom ones, the IconProvider tree), see `foundations/icons.md`. This guide covers the `<Icon>` component itself.

## When to use

- Any inline SVG icon — inside Button slots, IconButton, Badge slots, table cells, list rows.
- Need an interactive icon button? Use `<IconButton>`, not Icon wrapped in `<button>`.
- Need a static cluster of related icons? Use `<IconGroup>`.
- Need a status indicator? Use `<StatusDot>` or `<Badge dot>` — they're optimized for that.

Tabler-only. Don't mix icon libraries — see `foundations/icons.md` for the rationale.

## Props

| Prop | Type | Notes |
|---|---|---|
| `icon` | `ForwardRefExoticComponent` (REQUIRED) | Tabler icon component (or any ForwardRef SVG icon matching the Tabler shape). |
| `size` | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'2xl'` | Reads from `IconContext` if not set. |
| `stroke` | `'light'\|'regular'\|'bold'` | Reads from `IconContext` if not set. |
| `label` | `string` | Accessible label — sets `role="img"`, `aria-label`, and `<title>`. Without it, icon is `aria-hidden="true"`. |
| `animate` | `'spin'\|'pulse'\|'bounce'\|'draw'\|'none'` \| `{ rotate?, scale? }` | Static when undefined. |
| `state` | `'idle'\|'loading'\|'success'\|'error'` | State machine — overrides `animate` when both set. |
| `className` | `string` | |

## Size scale

| Size | Pixel | Default use |
|---|---|---|
| `xs` | 14 | Inside `xs` buttons / badges, dense table cells. |
| `sm` | 16 | Inside `sm` buttons / badges, standard inline. |
| `md` (default) | 18 | Inside `md` buttons / inputs. |
| `lg` | 20 | Inside `lg` buttons / large inputs. |
| `xl` | 24 | Standalone icons in card headers. |
| `2xl` | 32 | Hero / illustration accents. |

Stroke weight varies by size — smaller icons use lighter strokes for clarity. Override via `stroke` only when the visual weight feels off.

## Accessibility

| Use | Result |
|---|---|
| No `label` (inside a labeled Button / IconButton) | `aria-hidden="true"` — screen readers skip. |
| With `label` (standalone) | `role="img"` + `aria-label` + SVG `<title>`. |

Inside `<IconButton aria-label="Edit">` the icon is decorative — don't set `label` on the Icon.

For standalone icons (status indicators, decorative bullets that convey meaning), pass `label`.

## Examples

**Inside a Button:**
```tsx
<Button startIcon={IconPlus}>New project</Button>
```

`startIcon` accepts the bare Tabler component — Button wraps it in `<Icon>` and provides size via IconProvider. You don't need to wrap manually.

**Inside an IconButton (requires `<Icon>` wrapper):**
```tsx
<IconButton
  icon={<Icon icon={IconEdit} />}
  variant="ghost"
  aria-label="Edit item"
/>
```

IconButton's `icon` prop expects a React element, so wrap in `<Icon icon={...} />`. Size flows from the button via IconProvider.

**Standalone with label (a11y):**
```tsx
<Icon icon={IconAlertCircle} label="Warning" size="lg" />
```

Renders `role="img"` with `aria-label="Warning"` — screen readers announce it.

**Loading spinner via state:**
```tsx
<Icon icon={IconRefresh} state="loading" />
```

`state="loading"` renders a bare Spinner regardless of the `icon` prop. Use for inline loading affordances.

**Success / error feedback:**
```tsx
<Icon icon={IconCheck} state="success" />
<Icon icon={IconX} state="error" />
```

`state="success"` / `state="error"` render animated checkmark / cross via Framer Motion. Respects `prefers-reduced-motion`.

**Path-draw animation (check / X / circle-check only):**
```tsx
<Icon icon={IconCheck} animate="draw" />
```

Draws the stroke progressively (0.35s easeOut). Works with `IconCheck`, `IconX`, and `IconCircleCheck` only — other icons fall back to static render.

**Spin animation:**
```tsx
<Icon icon={IconLoader} animate="spin" />
```

For an actual loading state, prefer `state="loading"` — it renders the dedicated Spinner.

**Inside a row, auto-sized from input:**
```tsx
<Input
  size="lg"
  startSection={<Icon icon={IconSearch} />}  {/* size: 'md' from IconProvider */}
  placeholder="Search"
/>
```

Input's IconProvider sets size by input size: `xs` / `sm` input → `sm` icon, `md` / `lg` input → `md` icon. Don't pass `size` on the nested Icon.

**Status badge with custom-colored icon:**
```tsx
<Stack direction="horizontal" gap="ds-02" align="center">
  <Icon icon={IconCircleFilled} size="xs" className="text-success-9" />
  <Text variant="body-sm">Online</Text>
</Stack>
```

For most status displays prefer `<StatusDot>` — purpose-built. Use this pattern only when you need a specific icon shape.

## Composability

- **IconProvider cascade:** Button, IconButton, Badge, Input (start/endSection), NumberInput, IconGroup all wrap children in an `IconProvider`. Nested `<Icon>` reads size + stroke automatically. Don't pass `size` on those nested Icons.
- **Explicit props override context.** When you genuinely need a different size, pass `size` on the Icon — it wins.
- **State overrides animate.** When both are set, `state` wins. `state="loading"` renders a Spinner; `state="success"` / `state="error"` render path-drawn animations.
- **Reduced motion respected.** All animations fall back to static render under `prefers-reduced-motion: reduce`.

See `foundations/icons.md` for the icon-system overview (Tabler-only rationale, IconProvider tree, custom icons), `foundations/motion.md` for animation tokens.

## Rules

- Use Tabler icons only. See `foundations/icons.md` for the rationale and registry.
- Inside Button / IconButton / Badge slots, don't pass `size` on the nested Icon — IconProvider sets it.
- For standalone icons that convey meaning (not in a labeled button), pass `label` — without it, screen readers skip the icon.
- Inside `<IconButton aria-label="...">`, the Icon is decorative — don't set `label` on the Icon (would duplicate the announcement).
- For loading affordances, use `state="loading"` — it renders the dedicated Spinner.
- `animate="draw"` only works for `IconCheck`, `IconX`, `IconCircleCheck`. Other icons silently fall back to static.
- Don't wrap Icon in `<button>` — use `<IconButton>`.
- Stroke weight scales with size — only override `stroke` when the default truly feels off, not as a stylistic preference.
