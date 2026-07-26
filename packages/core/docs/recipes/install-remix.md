# Install: Remix

> Setup recipe for adding `@devalok/shilp-sutra` to a Remix project (v2 with Vite).

## 1. Detect

You are in this recipe if:

- `package.json` lists `"@remix-run/node"` and `"@remix-run/react"`
- `vite.config.{ts,js}` exists with the `vitePlugin` from `@remix-run/dev`
- `app/root.tsx` exists with `<Outlet />` inside `<Document>` shell

> **New projects scaffold as React Router v7, not Remix.** `create-remix` is deprecated and redirects to `create-react-router`; Remix v2 was upstreamed into React Router (maintenance mode). If you ran `create-react-router`, you have an RR7 **framework-mode** app (`@react-router/dev` + `react-router build` + `app/root.tsx` + `ssr: true`) — verified cold with shilp-sutra (SSR render, HTTP 200). Its wiring is the same shape as this recipe: `@tailwindcss/vite` plugin, `@import "@devalok/shilp-sutra/css"` in `app/app.css`, and **no `transpilePackages`** (Vite resolves our ESM). Ignore the SPA-only steps in [install-vite.md](./install-vite.md) (`index.html` bootstrap, `main.tsx` `createRoot`) — RR7 framework mode has its own `root.tsx` shell, like this recipe.

## 2. Install

```bash
pnpm add @devalok/shilp-sutra framer-motion
pnpm add -D tailwindcss@^4 @tailwindcss/vite
```

Optional:

```bash
pnpm add sonner   # only if rendering <Toaster />
```

### 2a. Optional peer dependencies (install ONLY when importing the matching subpath)

Some components ship hard peers as optional. **Install BEFORE first import.** ⚠ On Vite 8 / Rolldown a missing peer does **not** fail the build — Rolldown silently replaces the import with a stub that throws `Could not resolve "…"` in the browser at runtime, while the build still exits 0. A green build is therefore **not** proof the app works. Confirm coverage with the MCP `verify_setup` / `preflight` tools or the table below. Skip only if you use core components.

| When you import… | Install |
|---|---|
| `@devalok/shilp-sutra/composed/date-picker` | `pnpm add date-fns` |
| `@devalok/shilp-sutra/composed/file-preview` | `pnpm add react-pdf react-zoom-pan-pinch` |
| `@devalok/shilp-sutra/composed/markdown-viewer` | `pnpm add react-markdown react-syntax-highlighter remark-gfm` |
| `@devalok/shilp-sutra/composed/rich-chat-input` | `pnpm add -D @tiptap/react` *(types only — the runtime is bundled)* |
| `@devalok/shilp-sutra/composed/rich-text-editor` | `pnpm add -D @tiptap/react` *(types only — the runtime is bundled)* |
| `@devalok/shilp-sutra/composed/schedule-view` | `pnpm add date-fns` |
| `@devalok/shilp-sutra/ui/charts` | `pnpm add d3-axis d3-scale d3-selection d3-shape` |
| `@devalok/shilp-sutra/ui/data-table` | `pnpm add @tanstack/react-table @tanstack/react-virtual` |
| `@devalok/shilp-sutra/ui/data-table-toolbar` | `pnpm add @tanstack/react-table` |
| `@devalok/shilp-sutra/ui/input-otp` | `pnpm add input-otp` |
| `@devalok/shilp-sutra/ui/toast` | `pnpm add sonner` |
| `@devalok/shilp-sutra/ui/toaster` | `pnpm add sonner` |
| Any `Icon` / `IconButton` with Tabler icons (near-universal — most components use icons internally, so it is a base-install peer) | `pnpm add @tabler/icons-react` |

## 3. Wire Tailwind 4 in `vite.config.ts`

```ts
import { vitePlugin as remix } from "@remix-run/dev";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    remix(),
  ],
});
```

`tailwindcss()` should come before `remix()` so the design tokens are processed first.

## 4. Wire tokens

Create `app/styles/globals.css`:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Wire it as a Remix link export from `app/root.tsx`:

```tsx
import type { LinksFunction } from "@remix-run/node";
import globalsCss from "./styles/globals.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalsCss },
];
```

The `?url` suffix is critical — it tells Vite to emit the file as an asset URL instead of inlining the CSS contents.

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

Reference it from `app/root.tsx` so it loads before any React hydration:

```tsx
import { Outlet, Meta, Links, Scripts, ScrollRestoration } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Meta />
        <Links />
        <script src="/theme-bootstrap.js" />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

For runtime toggling inside React components, use `useColorMode`:

```tsx
import { useColorMode } from "@devalok/shilp-sutra/hooks/use-color-mode";

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <button onClick={toggleColorMode} aria-label="Toggle theme">
      {colorMode === "dark" ? "☀" : "☾"}
    </button>
  );
}
```

## 6. Toaster (optional)

Mount once in `app/root.tsx` next to `<Outlet />`:

```tsx
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";

// inside <body>
<>
  <Outlet />
  <Toaster />
</>
```

## 7. Verify

Create `app/routes/_index.tsx`:

```tsx
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Stack } from "@devalok/shilp-sutra/ui/stack";
import { Text } from "@devalok/shilp-sutra/ui/text";

export default function Index() {
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

Run `pnpm dev` and open the URL.

## 8. Remix-specific gotchas

- **`?url` suffix on CSS imports.** Without it, Vite tries to inline the CSS, which breaks Tailwind processing.
- **Loaders are server-only.** Do not import shilp-sutra components inside a `loader` function — they will not render.
- **Server-rendered output.** Remix SSRs every route. The CSS-in-JS-free approach of shilp-sutra works perfectly here; no extra config needed.
- **`framer-motion` and SSR.** All shilp-sutra animations gracefully degrade for the initial server render. No special handling required.
- **CSP.** If your CSP blocks inline scripts, the `theme-bootstrap.js` static asset above already complies (no `unsafe-inline` needed).

## 9. What NOT to do

- ❌ Add `tailwind.config.{ts,js}` — Tailwind 4 is CSS-first.
- ❌ Skip the `?url` suffix on CSS imports.
- ❌ Mount `<Toaster />` inside route components — it should live once at the root.
