<!-- Source: packages/core/docs/recipes/install-next-app-router.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

# Install: Next.js (App Router)

> Setup recipe for adding `@devalok/shilp-sutra` to a Next.js 13+ App Router project.

> **Tested cold-install on:** Next 16.2.6 + React 19.2 + Turbopack + pnpm 10.30 + Node 22 + Windows 11 (2026-05-25). Earlier versions of Next 13/14/15 are still supported on this recipe; deltas called out inline.

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

| When you import… | Install |
|---|---|
| `@devalok/shilp-sutra/composed/date-picker` | `pnpm add date-fns` |
| `@devalok/shilp-sutra/composed/file-preview` | `pnpm add react-pdf react-zoom-pan-pinch` |
| `@devalok/shilp-sutra/composed/markdown-viewer` | `pnpm add react-markdown react-syntax-highlighter remark-gfm` |
| `@devalok/shilp-sutra/composed/rich-chat-input` | `pnpm add @tiptap/core @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-list @tiptap/extension-mention @tiptap/extension-text-align @tiptap/extensions @tiptap/markdown @tiptap/pm @tiptap/react @tiptap/starter-kit @tiptap/suggestion date-fns` |
| `@devalok/shilp-sutra/composed/diff` | `pnpm add react-syntax-highlighter` |
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

## 3. Configure PostCSS

**Next 14+ scaffolds this for you.** Verify `postcss.config.mjs` (or `.js` / `.cjs` / `.json`) at the project root contains:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

If the file is missing, create it with the contents above. If another PostCSS file exists with different plugins, merge `@tailwindcss/postcss` in — do not delete the existing file.

## 4. Wire Tailwind 4 + design tokens

### 4a. Locate the global CSS file

Next 13+ default location depends on the `--src-dir` choice at scaffold time:

- `src/app/globals.css` — default since Next 14 when scaffolded without `--src-dir false`. **Most common in Next 16+ defaults.**
- `app/globals.css` — when scaffolded with `--src-dir false` (no `src/`).
- `app/global.css` — older Next 13 scaffolds.

If none exists, create at whichever path matches the project's existing `app/` location.

### 4b. Replace the scaffold's CSS with the shilp-sutra setup

A fresh `create-next-app` scaffold writes a `globals.css` with `:root` color vars, an `@theme inline` block linked to Geist font vars, a `prefers-color-scheme` dark override, and a `body { font-family: Arial }` block. **Replace the entire file** with the shilp-sutra setup unless you have a specific reason to keep scaffold styles:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";
```

**Order matters.** `tailwindcss` MUST come first. The shilp-sutra `/css` entry registers `@theme` blocks that the Tailwind import must process.

If you want to keep the scaffold's color/font vars alongside shilp-sutra tokens (rare — usually you want one or the other), put scaffold's `@theme inline` / `:root` / `body` blocks AFTER the shilp-sutra import. Otherwise the scaffold's `body { font-family: Arial }` will compete with shilp-sutra's font setup.

### 4c. Optional: add your own theme overrides

Place after both imports:

```css
@import "tailwindcss";
@import "@devalok/shilp-sutra/css";

@theme {
  --color-brand: oklch(0.65 0.2 280);
}
```

### 4d. Ensure CSS is imported from the layout

The CSS import in `app/layout.tsx` (or `src/app/layout.tsx`) should already exist in a fresh scaffold:

```tsx
import "./globals.css";
```

If you removed the Geist-font import from layout.tsx (see § 6), keep this CSS import line.

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

**Turbopack:** as of Next 16, Turbopack is the default bundler (`next dev` and `next build`). `transpilePackages` is respected by both Turbopack and the Webpack backend. Tested on Turbopack 16.2 cold-install (2026-05-25); no extra config needed.

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

> ⚠ **This default `Providers` renders `<Toaster />`, which imports `sonner`.** Install it now or `next build` fails with `Module not found: Can't resolve 'sonner'`:
> ```bash
> pnpm add sonner
> ```

`next-themes` is already in the install list from § 2 — no extra install step needed here. If you do **not** want toasts:

- Drop the `Toaster` import and its JSX usage from `Providers`
- Skip installing `sonner`

Mount `<Providers>` from `app/layout.tsx` (or `src/app/layout.tsx`). **Replace the scaffold's layout** with the version below — the scaffold imports `next/font/google` (Geist) and applies font-variable classes to `<html>`, which you don't need when shilp-sutra ships its own fonts:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Your app",
  description: "Built with shilp-sutra",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Specifically, **remove these scaffold lines**:

- `import { Geist, Geist_Mono } from "next/font/google";`
- The `const geistSans = Geist({...})` and `const geistMono = Geist_Mono({...})` blocks
- The `className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}` on `<html>`
- The `className="min-h-full flex flex-col"` on `<body>`

If you want to keep Geist alongside shilp-sutra's fonts, leave the `Geist` imports — but know that shilp-sutra's `font-sans` token resolves to Inter (body) and Ranade (display), not to the scaffold's `--font-geist-sans`. Loading both is wasted bytes.

`suppressHydrationWarning` on `<html>` is required because `next-themes` writes the `class` attribute before React hydrates. Without it, every page logs a hydration warning.

## 7. Verify the install

Replace the contents of `app/page.tsx` (or `src/app/page.tsx`). The scaffold's `page.tsx` imports `next/image` and renders the Vercel marketing layout — replace the whole file:

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
- **Scaffold's `body { font-family: Arial }` overrides shilp-sutra fonts.** The `create-next-app` `globals.css` template sets `font-family: Arial, Helvetica, sans-serif` on `<body>`. If you kept the scaffold's body styles, they win the cascade over shilp-sutra's `font-sans`. § 4b says to replace the whole file — follow it.
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
- **`p-3` vs `p-ds-03` — both are valid.** DS spacing uses the `--spacing-ds-*` namespace (`p-ds-04`, `gap-ds-03`); Tailwind 4's default numeric scale (`p-4`, `gap-2`) coexists by design. Pick `p-ds-*` for values that should track DS theme changes (card padding, form gaps); pick `p-N` for one-off layout values (section breathing room). Do NOT mass-codemod `p-4` → `p-ds-04` — that is not what the package intends. For layout rhythm, pick a 3-tier cadence (`ds-03` related / `ds-05` grouped / `ds-07` section), not every adjacent token.
- **Auto-generated `pnpm-workspace.yaml`.** `pnpm 10+` writes a `pnpm-workspace.yaml` at the project root on first install with `ignoredBuiltDependencies` entries. This is harmless for a standalone app, but if you're nesting this project inside a larger monorepo, delete this file and use the parent monorepo's workspace config instead.
- **Auto-generated `AGENTS.md`.** `create-next-app` writes an `AGENTS.md` with managed `<!-- BEGIN:nextjs-agent-rules -->` / `<!-- END:nextjs-agent-rules -->` markers. Shilp Sutra's agent rules use `<!-- BEGIN:shilp-sutra-agent-rules -->` markers — they coexist cleanly. If you install the shilp-sutra Agent Skill (see the repo root `AGENTS.md` for the one-liner), it adds its block alongside Next's, not over it.
- **Bare `shadow` is dead.** Tailwind 4 has no `--shadow-DEFAULT`. Use `shadow-raised`, `shadow-overlay`, or `shadow-floating`.

## 9. What you should NOT do

- ❌ Create `tailwind.config.ts` with `presets: [shilpSutra]` — the JS preset was removed in 0.38.
- ❌ Add `@plugin "@devalok/shilp-sutra/tailwind"` — also removed.
- ❌ Wrap the whole app in `<MotionConfig reducedMotion="...">` unless the user explicitly asks for a global motion override; Shilp Sutra components already respect `prefers-reduced-motion`.
- ❌ Import from `@devalok/shilp-sutra/tailwind` — the export was removed in 0.38.
- ❌ Run `pnpm add @radix-ui/react-*` — Radix is vendored; no @radix-ui runtime deps are required.

## 10. Optional next steps

- **Brand customization** — swap accent color, radius scale, or fonts: see [customize-brand.md](./customize-brand.md).
- **App shell** — add a sidebar + topbar layout: read `docs/components/shell/app-sidebar.md` and `docs/components/shell/top-bar.md` (or `get_component` via the shilp-sutra MCP).
- **Server-safe components** — push as much rendering as possible into Server Components: see [server-components.md](./server-components.md).
