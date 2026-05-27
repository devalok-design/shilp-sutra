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

**Optional peer dependencies** — if you'll render `<DataTable>`, any chart, `<DatePicker>`, `<RichTextEditor>`, `<InputOTP>`, `<FilePreview>`, `<MarkdownViewer>`, or use Tabler icons, install the matching peers BEFORE first import. Full table at [install-next-app-router.md § 2a](./install-next-app-router.md#2a-optional-peer-dependencies-install-only-when-importing-the-matching-subpath) — identical for Pages Router.

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
