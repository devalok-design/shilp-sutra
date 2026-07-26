<!-- Source: packages/core/docs/recipes/install-tanstack-start.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: TanStack Start

> Setup recipe for adding `@devalok/shilp-sutra` to a TanStack Start project (the React full-stack framework built on Vite).

> **Updated 2026-07-10 for the Vite-plugin era.** TanStack Start moved off Vinxi: the package is now `@tanstack/react-start` (not `@tanstack/start`), config lives in `vite.config.ts` (not `app.config.ts`), and the app root is `src/` (not `app/`). If you are on an old Vinxi-based project (`app.config.ts`, `@tanstack/start`), migrate to the Vite plugin first — see the TanStack Start docs.

## 1. Detect

You are in this recipe if:

- `package.json` lists `"@tanstack/react-start"` and `"@tanstack/react-router"`
- `vite.config.{ts,js}` exists and uses the `tanstackStart` plugin from `@tanstack/react-start/plugin/vite`
- `src/router.tsx` and `src/routes/__root.tsx` exist (a `src/routeTree.gen.ts` is generated on first run)

If instead you see `app.config.ts` + `@tanstack/start`, that is the legacy Vinxi setup — this recipe does not apply until you migrate.

> **Scaffolded with `create-start` and got a Router SPA?** As of `@tanstack/create-start` 0.59, the default template is a TanStack **Router** SPA — Vite + `@tanstack/react-router` + an `index.html` + `src/main.tsx` (client `createRoot`), with **no** `@tanstack/react-start` and no SSR server entry. That is NOT the Start SSR setup this recipe covers — use [install-vite.md](./install-vite.md) instead (it is router-agnostic and covers TanStack Router SPAs cleanly). This recipe applies only when `@tanstack/react-start` is a dependency.

## 2. Install

```bash
# pnpm
pnpm add @devalok/shilp-sutra framer-motion
pnpm add -D tailwindcss@^4 @tailwindcss/vite

# npm
npm install @devalok/shilp-sutra framer-motion
npm install -D tailwindcss@^4 @tailwindcss/vite
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

## 3. Wire Tailwind 4 in `vite.config.ts`

Add `@tailwindcss/vite` to the existing plugins array. `tanstackStart()` must come before `viteReact()`; `tailwindcss()` can go first so tokens are processed early.

```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
```

Do **not** add a `tailwind.config.{ts,js}` — Tailwind 4 is CSS-first.

## 4. Wire tokens

Create `src/styles/globals.css`:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Wire it as an asset-URL stylesheet from the root route's `head` (the TanStack Start idiom — the `?url` suffix emits the file as an asset instead of inlining it):

```tsx
// src/routes/__root.tsx
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import globalsCss from "../styles/globals.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [{ rel: "stylesheet", href: globalsCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

> **Newer scaffolds use `shellComponent`.** As of `@tanstack/create-start` 0.59 the generated `__root.tsx` uses `shellComponent: RootDocument` (which receives `{ children }`) instead of `component: RootComponent` with `<Outlet />`. Both wire up the same way for shilp-sutra — put the `{ rel: "stylesheet", href: appCss }` link in `head()` and keep `<HeadContent />` + `<Scripts />`. If your `__root.tsx` already has a `shellComponent`, add the stylesheet link to its existing `head()` rather than replacing the component. (Verified cold: shilp-sutra components — Button, Text, MarkdownViewer, EmojiPickerPopover — SSR-render cleanly under TanStack Start, HTTP 200.)

## 5. Theme toggle

Add a pre-hydration bootstrap so there is no flash of the wrong theme. The cleanest place is a `scripts` entry on the root route (runs before hydration); a static `public/theme-bootstrap.js` referenced from `<head>` also works and is CSP-friendly.

Static-asset approach — create `public/theme-bootstrap.js`:

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

Reference it from the root route's `head` scripts:

```tsx
export const Route = createRootRoute({
  head: () => ({
    // ...meta, links as above...
    scripts: [{ src: "/theme-bootstrap.js" }],
  }),
  component: RootComponent,
});
```

For runtime toggling inside components, use the `useColorMode` hook — see [install-vite.md § 5](./install-vite.md#5-theme-toggle-no-next-themes-here).

## 6. Toaster (optional)

Mount once in `__root.tsx`'s `RootComponent`, next to `<Outlet />`:

```tsx
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";

// inside <body>
<Outlet />
<Toaster />
<Scripts />
```

## 7. Verify

Create or replace `src/routes/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Stack } from "@devalok/shilp-sutra/ui/stack";
import { Text } from "@devalok/shilp-sutra/ui/text";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
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

Run `pnpm dev` and open the printed URL. Expected output matches [Next App Router § 7](./install-next-app-router.md#7-verify-the-install).

## 8. TanStack Start specifics

- **No `transpilePackages` equivalent — and you do not need one.** TanStack Start's Vite resolves `@devalok/shilp-sutra` from `node_modules` as native ESM.
- **Server functions** (`createServerFn`) — do not import shilp-sutra components inside server functions; they run server-only.
- **Streaming SSR** is the default. Shilp Sutra components SSR cleanly (no client-only side effects at module top-level).
- **`framer-motion` SSR** — animations gracefully degrade on the initial render.
- **`routeTree.gen.ts` is generated** — do not edit it by hand; it regenerates on dev/build.

## 9. What NOT to do

- ❌ Add a `tailwind.config.{ts,js}` — Tailwind 4 is CSS-first.
- ❌ Use `@tanstack/start` / `app.config.ts` / `@tanstack/start/config` — that is the retired Vinxi setup. Current TanStack Start is `@tanstack/react-start` + `vite.config.ts`.
- ❌ Mount `<Toaster />` inside route components — it lives once at the `__root`.
- ❌ Mix `@tailwindcss/postcss` and `@tailwindcss/vite` — pick the Vite plugin.
