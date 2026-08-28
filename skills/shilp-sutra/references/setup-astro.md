<!-- Source: packages/core/docs/recipes/install-astro.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: Astro

> Setup recipe for adding `@devalok/shilp-sutra` to an Astro project with React islands.

## 1. Detect

You are in this recipe if:

- `astro.config.{ts,mjs,js}` exists at the project root
- `package.json` lists `"astro"`
- React is integrated via `@astrojs/react`

If `@astrojs/react` is not installed, install it first:

```bash
pnpm astro add react
```

## 2. Install dependencies

```bash
pnpm add @devalok/shilp-sutra framer-motion
pnpm add -D tailwindcss@^4 @tailwindcss/vite
```

Add only if rendering `<Toaster />`:

```bash
pnpm add sonner
```

### 2a. Optional peer dependencies (install ONLY when importing the matching subpath)

Some components ship hard peers as optional. **Install BEFORE first import.** ⚠ On Vite / Rolldown a missing peer may **not** fail the build — the bundler can silently replace the import with a stub that throws `Could not resolve "…"` in the browser at runtime, while the build still exits 0. A green build is therefore **not** proof the app works. Confirm coverage with the MCP `verify_setup` / `preflight` tools or the table below. Skip only if you use core components.

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

## 3. Wire Tailwind 4 in `astro.config`

Astro has its own `@astrojs/tailwind` integration, but for Tailwind 4 use the Vite plugin directly (Astro 4.5+ supports this):

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Do **not** also enable `@astrojs/tailwind` — that integration is Tailwind 3 only and will conflict.

## 4. Wire tokens

Create `src/styles/globals.css`:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Import it from a layout component (e.g., `src/layouts/BaseLayout.astro`):

```astro
---
import "../styles/globals.css";
const { title = "App" } = Astro.props;
---
<!doctype html>
<html lang="en" class="">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

## 5. Theme toggle

Add the bootstrap script to `<head>` of `BaseLayout.astro` (before stylesheet imports):

```astro
---
import "../styles/globals.css";
---
<!doctype html>
<html lang="en">
  <head>
    <script is:inline>
      try {
        var stored = localStorage.getItem("theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (stored === "dark" || (!stored && prefersDark))
          document.documentElement.classList.add("dark");
      } catch (e) {}
    </script>
    <!-- ... -->
  </head>
  <body><slot /></body>
</html>
```

`is:inline` keeps it out of bundling, so it runs before any other JS.

For runtime toggling inside React islands, use the same `useColorMode` hook shown in [install-vite.md § 5](./install-vite.md#5-theme-toggle-no-next-themes-here).

## 6. Use components in islands

Shilp Sutra components are **client-only** (they use React hooks). Mount them in islands with a `client:*` directive:

```astro
---
import { Button } from "@devalok/shilp-sutra/ui/button";
---
<Button client:load>Hello</Button>
```

Static / non-interactive primitives (Text, Stack, Container, Code, VisuallyHidden) work without `client:*` because they render to static markup. Per-component imports are still required.

## 7. Toaster (optional)

Mount once in a top-level island. The simplest approach is a small React wrapper component:

```tsx
// src/components/AppToaster.tsx
"use client";
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";
export default function AppToaster() {
  return <Toaster />;
}
```

```astro
---
import AppToaster from "../components/AppToaster";
---
<AppToaster client:load />
```

## 8. Verify

Create `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Stack } from "@devalok/shilp-sutra/ui/stack";
import { Text } from "@devalok/shilp-sutra/ui/text";
---
<BaseLayout title="Home">
  <Stack className="p-ds-08" gap="ds-04">
    <Text variant="heading-2xl">Hello, Shilp Sutra</Text>
    <Stack direction="row" gap="ds-03">
      <Button client:load>Primary</Button>
      <Button client:load variant="soft">Soft</Button>
    </Stack>
  </Stack>
</BaseLayout>
```

Run `pnpm dev` and open the URL.

## 9. Astro-specific gotchas

- **No `transpilePackages` equivalent — and you do not need one.** Astro's Vite uses native ESM and resolves `@devalok/shilp-sutra` from `node_modules` directly.
- **Component must be inside a `client:*` island to be interactive.** A button without `client:load` will render but not respond to clicks.
- **Server-side islands (`server:defer`)** — fine, but RSC import rules apply (per-component imports only). See [server-components.md](./server-components.md).
- **`@astrojs/tailwind` and `@tailwindcss/vite` conflict.** Pick one. For Tailwind 4 use the Vite plugin.

## 10. What NOT to do

- ❌ Use `@astrojs/tailwind` (Tailwind 3 only).
- ❌ Add `tailwind.config.{ts,js}` — Tailwind 4 is CSS-first.
- ❌ Import shilp-sutra components into a `.astro` file expecting interactivity without `client:*`.
