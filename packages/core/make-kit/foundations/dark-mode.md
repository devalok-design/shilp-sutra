# Dark mode

`.dark` class on `<html>` or `<body>` flips every token. No theme provider, no JS reshuffle.

## How it works

The kit declares a custom variant: `@custom-variant dark (&:where(.dark *))`. Identical semantics to Tailwind's old `darkMode: 'class'`. Adding `.dark` higher in the DOM cascades every semantic token to its dark counterpart.

Dark tokens are **algorithmically derived** from the OKLCH primitives, not hand-tuned hex overrides. This means:

- Surfaces *lighten* with elevation in dark mode (opposite of light mode). `surface-overlay` is brighter than `surface-base` when `.dark` is active.
- Brand swaps (consumer overrides `--color-accent-9`) produce a coherent dark palette without extra work.
- Status colors stay legible — solid backgrounds darken slightly (L=0.63→0.54 in dark mode) to maintain WCAG AA.

## Wiring the toggle

```tsx
import { useColorMode } from '@devalok/shilp-sutra/hooks/use-color-mode'

function ThemeToggle() {
  const { mode, resolvedMode, setMode } = useColorMode()
  // mode: 'light' | 'dark' | 'system'
  // resolvedMode: 'light' | 'dark' (after resolving 'system')

  return (
    <Button
      variant="soft"
      onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
    >
      <Icon icon={resolvedMode === 'dark' ? IconSun : IconMoon} />
      {resolvedMode === 'dark' ? 'Light' : 'Dark'}
    </Button>
  )
}
```

`useColorMode()` handles:
- Persisting to `localStorage` (`shilp-sutra-color-mode`)
- Listening to `prefers-color-scheme` when mode is `'system'`
- Syncing across browser tabs
- Adding/removing `.dark` on `<html>`

## What you have to do per-component

Nothing. Semantic tokens flip automatically. As long as you use `bg-surface-raised` not `bg-white`, dark mode works.

The only exception: **images, illustrations, decorative SVGs**. These don't flip. Author them as theme-aware:

```tsx
{resolvedMode === 'dark' ? <img src="/logo-dark.svg" /> : <img src="/logo-light.svg" />}
```

Or use a single CSS-variable-driven SVG (`fill="currentColor"` + `text-fg`).

## Forced-colors (Windows high-contrast)

Independent of `.dark`. Activated by the OS. Every semantic color remaps to system keywords (`Canvas`, `CanvasText`, `Highlight`, `LinkText`, `GrayText`) under `@media (forced-colors: active)`. No work needed if you use semantic tokens.

## Initial load — avoid the flash

Set the mode **before** React hydrates. Insert this script tag in `<head>` (Next.js: `app/layout.tsx`):

```html
<script>
  (function () {
    var m = localStorage.getItem('shilp-sutra-color-mode') || 'system';
    var dark = m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  })();
</script>
```

Without this, light mode flashes on first paint when the user prefers dark.

## Rules

- **Never** hardcode hex / Tailwind palette colors. They don't dark-mode flip.
- **Never** write a `dark:bg-*` override on a semantic token — the token already handles dark mode.
- **For images**, use conditional rendering off `resolvedMode`.
- **Wire the head script** to prevent the FOUC on first paint.
- Default to `'system'` mode unless the product is explicitly light-only or dark-only.
