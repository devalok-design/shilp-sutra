<!-- Source: packages/core/docs/recipes/install-vite.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: Vite + React

> Setup recipe for adding `@devalok/shilp-sutra` to a Vite + React SPA.

## 1. Detect

You are in this recipe if:

- `vite.config.{ts,js,mjs}` exists at the project root
- `package.json` lists `"vite"` and `"react"`
- `src/main.{tsx,jsx}` is the entry that calls `createRoot(...).render(<App />)`

This recipe also covers Vite + React + React Router (any version) — the design system is router-agnostic.

If you are using Remix (which now runs on Vite), use [install-remix.md](./install-remix.md). If you are using TanStack Start, use [install-tanstack-start.md](./install-tanstack-start.md).

## 2. Install dependencies

```bash
# pnpm
pnpm add @devalok/shilp-sutra framer-motion
pnpm add -D tailwindcss@^4 @tailwindcss/vite

# npm
npm install @devalok/shilp-sutra framer-motion
npm install -D tailwindcss@^4 @tailwindcss/vite

# yarn
yarn add @devalok/shilp-sutra framer-motion
yarn add -D tailwindcss@^4 @tailwindcss/vite

# bun
bun add @devalok/shilp-sutra framer-motion
bun add -d tailwindcss@^4 @tailwindcss/vite
```

Add only if rendering `<Toaster />`:

```bash
pnpm add sonner
```

### 2a. Optional peer dependencies (install ONLY when importing the matching subpath)

Some components ship hard peers as optional. **Install BEFORE first import.** ⚠ On Vite 8 / Rolldown a missing peer does **not** fail the build — Rolldown silently replaces the import with a stub that throws `Could not resolve "…"` in the browser at runtime, while `vite build` still exits 0. A green build is therefore **not** proof the app works. Confirm coverage with the MCP `verify_setup` / `preflight` tools or the table below. Skip only if you use core components.

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

Use the official Tailwind 4 Vite plugin (faster than PostCSS for Vite):

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

If the project already uses PostCSS for other reasons, you can use `@tailwindcss/postcss` instead — see [install-next-app-router.md § 3](./install-next-app-router.md#3-configure-postcss). Stick with one approach; do not load both.

## 4. Wire tokens in the global CSS

Common CSS entry paths in priority order:

- `src/index.css`
- `src/main.css`
- `src/styles/globals.css`
- `src/App.css`

If none exists, create `src/index.css`. Set or merge:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

Import it once from the entry (`src/main.tsx`):

```tsx
import "./index.css";
```

## 5. Theme toggle (no `next-themes` here)

Vite has no built-in theme provider. Use the design system's `useColorMode` hook with a small bootstrap script to avoid a flash of wrong theme.

Add the bootstrap to `index.html` (in `<head>`, before any stylesheet):

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var dark = stored === "dark" || (!stored && prefersDark);
      if (dark) document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
</script>
```

Wire the runtime hook from anywhere in the app (e.g., a header button):

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

## 6. Mount Toaster (optional)

If you installed `sonner`, mount the Toaster once near the app root:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
);
```

## 7. Verify

Replace `src/App.tsx` (keep the **default export** — the `create-vite` template's `main.tsx` imports it as `import App from "./App"`, so a named export would break the build with `TS2613: Module has no default export`):

```tsx
import { Button } from "@devalok/shilp-sutra/ui/button";
import { Stack } from "@devalok/shilp-sutra/ui/stack";
import { Text } from "@devalok/shilp-sutra/ui/text";

export default function App() {
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

Run `pnpm dev` and open the printed Vite URL. Expected output matches [Next App Router § 7](./install-next-app-router.md#7-verify-the-install).

## 8. Gotchas (Vite-specific)

- **`@tailwindcss/vite` and `@tailwindcss/postcss` together.** Pick one — running both causes utilities to be processed twice and CSS bloat.
- **CSS import paths in HMR.** Vite is strict about case-sensitivity even on macOS. `@devalok/shilp-sutra/CSS` will not resolve; use the lowercase `/css`.
- **Multiple framer-motion copies.** Same fix as Next — see [install-next-app-router.md § 8](./install-next-app-router.md#8-common-gotchas).
- **Spacing utilities.** Use `p-ds-04` (not `p-4`). Tailwind composite text utilities: `text-heading-xl`, `text-body-md`, `text-code`.

## 9. What NOT to do

- ❌ Add `@devalok/shilp-sutra/tailwind` — the export was removed in 0.38.
- ❌ Add a `tailwind.config.{ts,js}` with `presets: [shilpSutra]` — JS preset removed.
- ❌ Try to use `next-themes` here — it requires Next. Use the bootstrap script + `useColorMode` shown in § 5.
