<!-- Source: packages/core/docs/recipes/install-next-app-router.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: Next.js (App Router)

> Setup recipe for adding `@devalok/shilp-sutra` to a Next.js 13+ App Router project.

## 1. Detect the framework

You are in this recipe if **all** of these are true:

- `package.json` lists `"next"` at version `^13.0.0` or higher
- An `app/` directory exists at the project root or under `src/`
- An `app/layout.{tsx,jsx}` file exists

If a `pages/` directory exists at the project root AND contains route files (not just `_app`/`_document` legacy artifacts from older `create-next-app` versions), use [install-next-pages.md](./install-next-pages.md). `create-next-app@16+` no longer scaffolds `pages/` for App Router projects.

## 2. Install dependencies

Pick the package manager that matches the project's lockfile.

```bash
# pnpm  (lockfile: pnpm-lock.yaml)
pnpm add @devalok/shilp-sutra framer-motion next-themes
pnpm add -D tailwindcss@^4 @tailwindcss/postcss

# npm  (lockfile: package-lock.json)
npm install @devalok/shilp-sutra framer-motion next-themes
npm install -D tailwindcss@^4 @tailwindcss/postcss

# yarn  (lockfile: yarn.lock)
yarn add @devalok/shilp-sutra framer-motion next-themes
yarn add -D tailwindcss@^4 @tailwindcss/postcss

# bun  (lockfile: bun.lockb)
bun add @devalok/shilp-sutra framer-motion next-themes
bun add -d tailwindcss@^4 @tailwindcss/postcss
```

Add only if you will render `<Toaster />`:

```bash
pnpm add sonner
```

### 2a. Optional peer dependencies (install ONLY when importing the matching subpath)

Some components depend on third-party libraries that ship as optional peers. **Install BEFORE first import** of the matching component, or `next build` will exit with `Module not found`. Skip entirely if you only use core components (`Button`, `Text`, `Stack`, `Dialog`, `Toast`, `Form*`, `Input`, `Card`, etc.).

| When you import…                                          | Install                                                                                                |
|-----------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `@devalok/shilp-sutra/ui/charts/*` (BarChart, LineChart, …)| `pnpm add d3-array d3-axis d3-format d3-interpolate d3-scale d3-selection d3-shape d3-time-format d3-transition` |
| `@devalok/shilp-sutra/ui/data-table`                       | `pnpm add @tanstack/react-table @tanstack/react-virtual`                                                |
| `@devalok/shilp-sutra/composed/date-picker` (+ DateRange, DateTime, Calendar) | `pnpm add date-fns`                                                                       |
| `@devalok/shilp-sutra/composed/rich-text-editor` (+ RichChatInput, RichTextViewer) | `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder`            |
| `@devalok/shilp-sutra/ui/input-otp`                        | `pnpm add input-otp`                                                                                    |
| `@devalok/shilp-sutra/composed/file-preview`               | `pnpm add react-pdf react-zoom-pan-pinch`                                                               |
| `@devalok/shilp-sutra/composed/markdown-viewer`            | `pnpm add react-markdown react-syntax-highlighter`                                                      |
| Any `Icon` / `IconButton` use with Tabler icons            | `pnpm add @tabler/icons-react`                                                                          |

> These aren't in core deps so consumers who never render a chart, OTP input, or rich-text editor don't pay the install / bundle cost. One-time decision at install.

## 3. Configure PostCSS

Create or update `postcss.config.mjs` at the project root:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

If a `postcss.config.{js,cjs,json}` already exists, merge the plugin in. Do not delete the existing file.

## 4. Wire Tailwind 4 + design tokens

Locate the global CSS file. Common paths in priority order:

- `app/globals.css`
- `src/app/globals.css`
- `app/global.css`

If none exists, create `app/globals.css`. Set the file contents to (or merge into):

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

**Order matters.** `tailwindcss` MUST come first. The shilp-sutra `/css` entry registers `@theme` blocks that the Tailwind import must process.

If the project has its own theme overrides, place them AFTER both imports:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";

@theme {
  --color-brand: oklch(0.65 0.2 280);
}
```

Import the CSS file once from `app/layout.tsx` (it should already be imported in a fresh `create-next-app` project):

```tsx
import "./globals.css";
```

## 5. Configure `transpilePackages`

Edit `next.config.{ts,js,mjs}`. Add the `transpilePackages` field:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@devalok/shilp-sutra"],
};

export default nextConfig;
```

If a `transpilePackages` array already exists, append to it. Do not replace.

Without `transpilePackages`, Next will refuse to load our pre-built `dist/*.js` because it ships native ESM that does not match Next's CJS-leaning loader for `node_modules`.

## 6. Scaffold the Providers wrapper

Create `app/providers.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@devalok/shilp-sutra/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
```

`next-themes` is already in the install list from § 2 — no extra install step needed here. If `<Toaster />` is not used:

- Drop the `Toaster` import and its JSX usage
- Skip installing `sonner`

Mount `<Providers>` from `app/layout.tsx`:

```tsx
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required because `next-themes` writes the `class` attribute before React hydrates. Without it, every page logs a hydration warning.

## 7. Verify the install

Replace the contents of `app/page.tsx`:

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
        <Button variant="outline">Outline</Button>
      </Stack>
    </Stack>
  );
}
```

Run the dev server:

```bash
pnpm dev
```

Open `http://localhost:3000`. You should see:

- The heading rendered in **Ranade** (display font), the buttons in **Inter** (body font)
- The primary button on a saturated accent background, the soft button with a tinted background and no border, the outline button with a border and transparent background
- No hydration warning in the browser console
- No 404 for fonts (fonts are bundled inside the package; `next/font` is not required)

If anything is off, see [troubleshoot.md](./troubleshoot.md).

## 8. Common gotchas

- **CSS import order.** `tailwindcss` BEFORE `@devalok/shilp-sutra/css`. Reversing the order silently produces a build with no design-system utilities.
- **Multiple `framer-motion` copies.** Run `pnpm why framer-motion`. If it shows more than one resolved version, contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) silently break. Fix:
  ```jsonc
  // package.json
  {
    "pnpm": {
      "overrides": {
        "framer-motion": "^12"
      }
    }
  }
  ```
  For npm/yarn/bun equivalents, see [troubleshoot.md](./troubleshoot.md).
- **Per-component imports keep RSC fast AND avoid peer-dep cliffs.** Inside Server Components, prefer `@devalok/shilp-sutra/ui/text`, `…/composed/page-header`, etc. The barrel `@devalok/shilp-sutra/ui` re-exports many client components — including some with hard peer-dep imports (e.g. `input-otp`) — so it both inflates the client bundle and forces those peers to be installed even when you never render those components. See [server-components.md](./server-components.md) for the full RSC-safety matrix.
- **`p-3` vs `p-ds-03` — both are valid.** DS spacing uses the `--spacing-ds-*` namespace (`p-ds-04`, `gap-ds-03`); Tailwind 4's default numeric scale (`p-4`, `gap-2`) coexists by design. Pick `p-ds-*` for values that should track DS theme changes (card padding, form gaps); pick `p-N` for one-off layout values (section breathing room). Do NOT mass-codemod `p-4` → `p-ds-04` — that is not what the package intends.
- **Bare `shadow` is dead.** Tailwind 4 has no `--shadow-DEFAULT`. Use `shadow-raised`, `shadow-overlay`, or `shadow-floating`.

## 9. What you should NOT do

- ❌ Create `tailwind.config.ts` with `presets: [shilpSutra]` — the JS preset was removed in 0.38.
- ❌ Add `@plugin "@devalok/shilp-sutra/tailwind"` — also removed.
- ❌ Wrap the whole app in `<MotionConfig reducedMotion="...">` unless the user explicitly asks for a global motion override; Shilp Sutra components already respect `prefers-reduced-motion`.
- ❌ Import from `@devalok/shilp-sutra/tailwind` — the export was removed in 0.38.
- ❌ Run `pnpm add @radix-ui/react-*` — Radix is vendored; no @radix-ui runtime deps are required.

## 10. Optional next steps

- **Brand customization** — swap accent color, radius scale, or fonts: see [customize-brand.md](./customize-brand.md).
- **App shell** — add a sidebar + topbar layout: read `llms-full.txt` sections for `AppSidebar` and `TopBar`.
- **Server-safe components** — push as much rendering as possible into Server Components: see [server-components.md](./server-components.md).
