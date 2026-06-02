# Setup

Required to use this kit. Every generated app needs all of these.

## Install

```bash
npm i @devalok/shilp-sutra @tabler/icons-react framer-motion tailwindcss @tailwindcss/vite
# optional, only if you render toasts:
npm i sonner
```

`framer-motion` and `tailwindcss` are **required peer dependencies.** Without them, motion contexts split and tokens don't compile.

## Vite config

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

## Single CSS entry

In `src/index.css` (or your global stylesheet):

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Import that CSS file once at the app root (`main.tsx`):

```tsx
import './index.css'
```

**Do not add `tailwind.config.ts`.** This kit is Tailwind 4 CSS-first. There is no JS preset. All tokens come from the CSS import via `@theme` blocks.

## Provider tree

Wrap the app once at the root:

```tsx
import { MotionProvider } from '@devalok/shilp-sutra/motion'
import { Toaster } from '@devalok/shilp-sutra/ui/toaster'
import { IconProvider } from '@devalok/shilp-sutra/ui/icon-context'

export default function App({ children }) {
  return (
    <MotionProvider reducedMotion="user">
      <IconProvider size={16}>
        {children}
        <Toaster />
      </IconProvider>
    </MotionProvider>
  )
}
```

- `MotionProvider` — required. `reducedMotion="user"` respects OS preference. Without this provider, motion primitives still work but reduced-motion is ignored.
- `IconProvider` — optional but recommended. Sets default icon size for all `<Icon>` children. Override per-call with `<Icon size={20} />`.
- `Toaster` — only needed if the app calls `toast(...)`. Mount exactly once.

## Dark mode toggle

Add the `.dark` class on `<html>` or `<body>` to flip the entire token system to dark. The kit ships `useColorMode()`:

```tsx
import { useColorMode } from '@devalok/shilp-sutra/hooks/use-color-mode'

function ThemeToggle() {
  const { mode, setMode } = useColorMode() // 'light' | 'dark' | 'system'
  return (
    <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      Toggle theme
    </Button>
  )
}
```

The hook persists choice to `localStorage`, syncs across tabs, and respects `prefers-color-scheme` when set to `'system'`.

## Import paths

Two valid styles:

```tsx
// Per-component (preferred — smaller bundle, server-component safe):
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card } from '@devalok/shilp-sutra/ui/card'

// Barrel (fine for client-only apps):
import { Button, Card, Dialog } from '@devalok/shilp-sutra'
```

A few components are **per-component only** (their barrel was removed in v0.40 because they statically import optional peer deps). These must use the subpath:

- `Toaster`, `toast` → `@devalok/shilp-sutra/ui/toaster`, `/ui/toast`
- `DatePicker*` → `@devalok/shilp-sutra/composed/date-picker`
- `EmojiPicker*` → `@devalok/shilp-sutra/composed/emoji-picker`
- `FilePreview` → `@devalok/shilp-sutra/composed/file-preview`
- `MarkdownViewer` → `@devalok/shilp-sutra/composed/markdown-viewer`
- `RichTextEditor*` → `@devalok/shilp-sutra/composed/rich-text-editor`
- `InputOTP*` → `@devalok/shilp-sutra/ui/input-otp`

## Verify

After install, this should render without errors:

```tsx
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card } from '@devalok/shilp-sutra/ui/card'

export default function Page() {
  return (
    <div className="min-h-screen bg-surface-base p-ds-07">
      <Card className="max-w-md mx-auto p-ds-05">
        <Button>Hello</Button>
      </Card>
    </div>
  )
}
```

If `bg-surface-base` doesn't apply, the CSS import is missing or out of order. The kit's CSS must come **after** `@import "tailwindcss"`.
