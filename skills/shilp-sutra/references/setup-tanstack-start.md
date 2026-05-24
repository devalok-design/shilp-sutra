<!-- Source: packages/core/docs/recipes/install-tanstack-start.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: TanStack Start

> Setup recipe for adding `@devalok/shilp-sutra` to a TanStack Start project (the React full-stack framework built on Vinxi/Vite).

## 1. Detect

You are in this recipe if:

- `package.json` lists `"@tanstack/start"` and `"@tanstack/react-router"`
- `app.config.{ts,js}` (Vinxi) exists at the project root
- `app/router.tsx` and `app/routes/__root.tsx` exist

## 2. Install

```bash
pnpm add @devalok/shilp-sutra framer-motion
pnpm add -D tailwindcss@^4 @tailwindcss/vite
```

Optional:

```bash
pnpm add sonner   # only if rendering <Toaster />
```

## 3. Wire Tailwind 4 in `app.config.ts`

```ts
import { defineConfig } from "@tanstack/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

## 4. Wire tokens

Create `app/styles/globals.css`:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Import it from `app/routes/__root.tsx`:

```tsx
import "../styles/globals.css";
```

If you prefer asset-URL imports the way Remix does it, use `import css from "../styles/globals.css?url"` and add `<link rel="stylesheet" href={css} />` to the `<head>` returned by `__root.tsx`.

## 5. Theme toggle

Create `public/theme-bootstrap.js` (a static asset served verbatim):

```js
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
```

Reference it from `app/routes/__root.tsx`:

```tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/theme-bootstrap.js" />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
```

For runtime toggling, use the `useColorMode` hook — see [install-vite.md § 5](./install-vite.md#5-theme-toggle-no-next-themes-here).

## 6. Toaster (optional)

Mount in `__root.tsx` next to `<Outlet />`:

```tsx
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";

// inside <body>
<>
  <Outlet />
  <Toaster />
</>
```

## 7. Verify

Create or replace `app/routes/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Stack } from "@devalok/shilp-sutra/ui/stack";
import { Text } from "@devalok/shilp-sutra/ui/text";

export const Route = createFileRoute("/")({
  component: () => (
    <Stack className="p-ds-08" gap="ds-04">
      <Text variant="heading-2xl">Hello, Shilp Sutra</Text>
      <Stack direction="row" gap="ds-03">
        <Button>Primary</Button>
        <Button variant="soft">Soft</Button>
      </Stack>
    </Stack>
  ),
});
```

Run `pnpm dev` and open the URL.

## 8. TanStack Start specifics

- **Server functions** (`createServerFn`) — do not import shilp-sutra components inside server functions; they run server-only.
- **Streaming SSR** is the default. All shilp-sutra components SSR cleanly because they have no client-only side effects at module top-level.
- **`framer-motion` SSR** — animations gracefully degrade on the initial render.
- **CSP.** The static `theme-bootstrap.js` asset complies with strict CSP (no inline scripts required).

## 9. What NOT to do

- ❌ Add `tailwind.config.{ts,js}` — Tailwind 4 is CSS-first.
- ❌ Mount `<Toaster />` inside route components — it should live once at the `__root`.
- ❌ Mix `@tailwindcss/postcss` and `@tailwindcss/vite` — pick one (Vite plugin recommended for TanStack Start).
