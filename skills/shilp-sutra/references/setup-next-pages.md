<!-- Source: packages/core/docs/recipes/install-next-pages.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: Next.js (Pages Router)

> Setup recipe for adding `@devalok/shilp-sutra` to a Next.js project that uses the Pages Router (`pages/_app.tsx` as the entry).

## 1. Detect

You are in this recipe if:

- `package.json` lists `"next"` (any version `>= 12`)
- A `pages/` directory exists at the project root or under `src/` and contains `_app.{js,tsx}` (and optionally `_document.{js,tsx}`)
- `app/` directory does NOT exist, OR exists but is unused

If both `app/` and `pages/` exist, prefer [install-next-app-router.md](./install-next-app-router.md) and treat the Pages Router as legacy.

## 2. Install

Same dependencies as the App Router recipe — see [install-next-app-router.md § 2](./install-next-app-router.md#2-install-dependencies). Replace `next-themes`'s `attribute="class"` setup with the same on Pages Router (it works identically).

### 2a. Optional peer dependencies (install only when importing the matching subpath)

Some components depend on third-party libraries that ship as optional peers. **Install BEFORE first import** of the matching component, or `next build` will exit with `Module not found`. Skip entirely if you only use core components (`Button`, `Text`, `Stack`, `Dialog`, `Toast`, `Form*`, `Input`, `Card`, etc.).

| When you import… | Install |
|---|---|
| `@devalok/shilp-sutra/composed/date-picker` | `pnpm add date-fns` |
| `@devalok/shilp-sutra/composed/diff` | `pnpm add react-syntax-highlighter` |
| `@devalok/shilp-sutra/composed/file-preview` | `pnpm add react-pdf react-zoom-pan-pinch` |
| `@devalok/shilp-sutra/composed/markdown-viewer` | `pnpm add react-markdown react-syntax-highlighter remark-gfm` |
| `@devalok/shilp-sutra/composed/rich-chat-input` | `pnpm add @tiptap/core @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-list @tiptap/extension-mention @tiptap/extension-text-align @tiptap/extensions @tiptap/markdown @tiptap/pm @tiptap/react @tiptap/starter-kit @tiptap/suggestion date-fns` |
| `@devalok/shilp-sutra/composed/rich-text-editor` | `pnpm add @tiptap/core @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-list @tiptap/extension-mention @tiptap/extension-text-align @tiptap/extensions @tiptap/markdown @tiptap/pm @tiptap/react @tiptap/starter-kit @tiptap/suggestion` |
| `@devalok/shilp-sutra/composed/schedule-view` | `pnpm add date-fns` |
| `@devalok/shilp-sutra/ui/charts` | `pnpm add d3-axis d3-scale d3-selection d3-shape` |
| `@devalok/shilp-sutra/ui/data-table` | `pnpm add @tanstack/react-table @tanstack/react-virtual` |
| `@devalok/shilp-sutra/ui/data-table-toolbar` | `pnpm add @tanstack/react-table` |
| `@devalok/shilp-sutra/ui/input-otp` | `pnpm add input-otp` |
| `@devalok/shilp-sutra/ui/toast` | `pnpm add sonner` |
| `@devalok/shilp-sutra/ui/toaster` | `pnpm add sonner` |
| Any `Icon` / `IconButton` with Tabler icons (near-universal — most components use icons internally, so it is a base-install peer) | `pnpm add @tabler/icons-react` |

> These aren't in core deps so consumers who never render a chart, OTP input, or rich-text editor don't pay the install / bundle cost. One-time decision at install.

## 3. PostCSS

Same as App Router — see [§ 3](./install-next-app-router.md#3-configure-postcss).

## 4. Wire Tailwind 4 + tokens

Common CSS entry paths in priority order:

- `styles/globals.css`
- `src/styles/globals.css`
- `pages/_app.css` (rare)

If none exists, create `styles/globals.css` with:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Import it from `pages/_app.tsx`:

```tsx
import "../styles/globals.css";
```

## 5. `transpilePackages`

Identical to App Router — see [§ 5](./install-next-app-router.md#5-configure-transpilepackages).

## 6. Providers in `_app.tsx`

Replace or merge into `pages/_app.tsx`:

```tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}
```

> ⚠ **This renders `<Toaster />`, which imports `sonner`.** Install it or `next build` fails with `Module not found: Can't resolve 'sonner'`: `pnpm add sonner`. If you don't want toasts, drop the `Toaster` import + usage and skip `sonner`.

For `next-themes` to avoid hydration warnings, add a `_document.tsx` with `suppressHydrationWarning` on the `<html>`:

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

## 7. Verify

Replace `pages/index.tsx`:

```tsx
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Stack } from "@devalok/shilp-sutra/ui/stack";
import { Text } from "@devalok/shilp-sutra/ui/text";

export default function Home() {
  return (
    <Stack className="p-ds-08" gap="ds-04">
      <Text variant="heading-2xl">Hello, Shilp Sutra</Text>
      <Stack direction="row" gap="ds-03">
        <Button>Primary</Button>
        <Button variant="soft">Soft</Button>
      </Stack>
    </Stack>
  );
}
```

Run `pnpm dev` and open `http://localhost:3000`. Expected output is the same as the App Router recipe — see [§ 7](./install-next-app-router.md#7-verify-the-install).

## 8. Pages Router specifics

- **No React Server Components.** Every component runs on the client. Per-component imports still help tree-shaking but are not required for RSC safety.
- **`getServerSideProps` / `getStaticProps`** — do not import shilp-sutra components inside these (they run server-side and won't render JSX). Components are imported and used in the page module's default export, as usual.
- **`pages/_document.tsx` runs server-only.** Do not import shilp-sutra components there.

## 9. Gotchas

Same as App Router — see [§ 8](./install-next-app-router.md#8-common-gotchas).

## 10. What NOT to do

Same as App Router — see [§ 9](./install-next-app-router.md#9-what-you-should-not-do).
