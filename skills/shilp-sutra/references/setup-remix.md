<!-- Source: packages/core/docs/recipes/install-remix.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: Remix

> Setup recipe for adding `@devalok/shilp-sutra` to a Remix project (v2 with Vite).

## 1. Detect

You are in this recipe if:

- `package.json` lists `"@remix-run/node"` and `"@remix-run/react"`
- `vite.config.{ts,js}` exists with the `vitePlugin` from `@remix-run/dev`
- `app/root.tsx` exists with `<Outlet />` inside `<Document>` shell

For React Router v7 (the spiritual successor to Remix), use the [install-vite.md](./install-vite.md) recipe — it works the same way.

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

Some components ship hard peers as optional. **Install BEFORE first import** or Remix's Vite build will fail with `Failed to resolve import`. Skip if you only use core components.

| When you import…                                          | Install                                                                                                |
|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `@devalok/shilp-sutra/ui/charts/*`                         | `pnpm add d3-array d3-axis d3-format d3-interpolate d3-scale d3-selection d3-shape d3-time-format d3-transition` |
| `@devalok/shilp-sutra/ui/data-table`                       | `pnpm add @tanstack/react-table @tanstack/react-virtual`                                                |
| `@devalok/shilp-sutra/composed/date-picker` (+ DateRange, DateTime, Calendar) | `pnpm add date-fns`                                                                       |
| `@devalok/shilp-sutra/composed/rich-text-editor` (+ RichChatInput, RichTextViewer) | `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`            |
| `@devalok/shilp-sutra/ui/input-otp`                        | `pnpm add input-otp`                                                                                    |
| `@devalok/shilp-sutra/composed/file-preview`               | `pnpm add react-pdf react-zoom-pan-pinch`                                                               |
| `@devalok/shilp-sutra/composed/markdown-viewer`            | `pnpm add react-markdown react-syntax-highlighter`                                                      |
| Any `Icon` / `IconButton` with Tabler icons                | `pnpm add @tabler/icons-react`                                                                          |

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
  const { mode, toggle } = useColorMode();
  return (
    <button onClick={toggle} aria-label="Toggle theme">
      {mode === "dark" ? "☀" : "☾"}
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
