# Troubleshoot

A decision tree for the most common shilp-sutra setup breakages. Read symptoms top-to-bottom; the first match is usually the right diagnosis.

## Symptom: Tailwind utilities don't apply (no styling at all)

**Diagnosis:** Tailwind is not detecting design-system source classes, OR the CSS imports are out of order.

Check 1 — import order. Open the global CSS file. The order MUST be:

```css
@import "tailwindcss";          /* FIRST */
@import "@devalok/shilp-sutra/css";  /* SECOND */
```

If reversed, swap them.

Check 2 — both imports present. Some setups accidentally drop `@import "tailwindcss"` after a refactor. Both imports are required.

Check 3 — file is actually loaded. In Next.js, `globals.css` must be imported from `app/layout.tsx` (App Router) or `pages/_app.tsx` (Pages Router). In Vite, from `src/main.tsx`. In Remix, via `links` export. In Astro, from a layout file.

## Symptom: Spacing utilities like `p-4` don't work but `p-ds-04` does

**Diagnosis:** Working as designed.

Shilp Sutra uses the `--spacing-ds-*` namespace to avoid colliding with consumer numeric spacing. Use `p-ds-04`, `gap-ds-03`, `mx-ds-08`, etc. Plain `p-4` is the consumer's own spacing (Tailwind's default scale) — it works but is unrelated to the design system.

If `p-ds-*` does NOT work, you have the styling-not-applying issue above.

## Symptom: Console error or weird animation glitches involving `MotionConfig`, `LayoutGroup`, or `AnimatePresence`

**Diagnosis:** Multiple copies of `framer-motion` are resolved.

Run:

```bash
pnpm why framer-motion
# or
npm ls framer-motion
```

If more than one version is listed, fix with overrides:

**pnpm:**
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

**npm:**
```jsonc
// package.json
{
  "overrides": {
    "framer-motion": "^12"
  }
}
```

**yarn (berry):**
```jsonc
// package.json
{
  "resolutions": {
    "framer-motion": "^12"
  }
}
```

**bun:**
```jsonc
// package.json
{
  "overrides": {
    "framer-motion": "^12"
  }
}
```

After editing, delete the lockfile + `node_modules` and reinstall.

## Symptom: Next.js error: `Cannot find module '@devalok/shilp-sutra/...'` or `Module parse failed: Unexpected token`

**Diagnosis:** `transpilePackages` is missing from `next.config.{ts,js,mjs}`.

Add:

```ts
transpilePackages: ["@devalok/shilp-sutra"],
```

## Symptom: Build error `Cannot find module 'sonner' / 'input-otp' / 'date-fns' / 'react-pdf' / 'react-markdown'` — OR (on Vite 8) a runtime `Could not resolve "…"` from a green build

**Diagnosis:** an optional peer dependency is missing. Each component below has a peer it pulls only when imported. Install the matching peer (always BEFORE the first import). On Vite 8 / Rolldown this does **not** fail the build — it throws at runtime — so run the MCP `verify_setup` tool to catch it early.

| You imported (per-component subpath) | Install                                                                                       |
|--------------------------------------|-----------------------------------------------------------------------------------------------|
| `…/ui/toaster` or `…/ui/toast`       | `pnpm add sonner`                                                                             |
| `…/ui/input-otp`                     | `pnpm add input-otp`                                                                          |
| `…/composed/date-picker` or `…/composed/schedule-view` | `pnpm add date-fns`                                                         |
| `…/ui/data-table` or `…/ui/data-table-toolbar` | `pnpm add @tanstack/react-table @tanstack/react-virtual`                            |
| `…/composed/file-preview`            | `pnpm add react-pdf react-zoom-pan-pinch`                                                     |
| `…/composed/markdown-viewer`         | `pnpm add react-markdown react-syntax-highlighter remark-gfm`                                 |
| `…/ai/block-renderer`, `…/ai/blocks/text`, `…/ai/blocks/error` | `pnpm add react-markdown remark-gfm`                                                          |
| Any `…/ui/charts/*`                  | `pnpm add d3-axis d3-scale d3-selection d3-shape`                                             |

These ship as **optional** peers so consumers who never render the matching component don't pay the install cost. Once you import the component, the peer becomes required. Each affected component's JSDoc carries the same install hint — hover the import in your editor to see it inline.

**No longer peers (bundled since the frimousse migration):** the emoji picker (`…/composed/emoji-picker`) and the rich-text editors (`…/composed/rich-text-editor`, `…/composed/rich-chat-input`) bundle their dependencies (frimousse, `@emoji-mart/data`, TipTap) into a lazy chunk — you do **not** install anything for them. `@tabler/icons-react` is a required peer that most package managers auto-install.

**Catch this at edit time, not build time:** install `@devalok/eslint-plugin-shilp-sutra` (`pnpm add -D @devalok/eslint-plugin-shilp-sutra`, then `shilpSutra.configs['flat/recommended']`). Its `prefer-per-component-import` rule flags peer-cliff symbols imported from a barrel and autofixes the path — surfacing the cliff in your editor before the bundler ever fails.

For the full table in your framework's install recipe, see `install-<framework>.md → §2a. Optional peer dependencies`.

## Symptom: Hydration warning on every page load (Next.js)

**Diagnosis:** `next-themes` writes the `class` attribute on `<html>` before React hydrates, causing a server/client class mismatch.

Add `suppressHydrationWarning` to `<html>` in `app/layout.tsx` (App Router) or `pages/_document.tsx` (Pages Router):

```tsx
<html lang="en" suppressHydrationWarning>
```

This warning is specific to the `class` attribute on `<html>` — it does NOT suppress hydration warnings on other elements.

## Symptom: Dark mode toggle does nothing

**Diagnosis:** The `.dark` class is not being applied to `<html>` (or any ancestor of the components).

Quick verification — open the browser console and run:

```js
document.documentElement.classList.add("dark");
```

If components now render in dark mode, the toggle wiring is broken (not the design system). Check:

- `next-themes` is installed and `<ThemeProvider attribute="class">` wraps the app
- For Vite/Remix/Astro/TanStack: the `theme-bootstrap.js` script runs before any React mount

If `.dark` IS on `<html>` and components still look light, the CSS imports are out of order — see the first symptom above.

## Symptom: RSC error — `You're importing a component that needs useState. It only works in a Client Component`

**Diagnosis:** A client-only shilp-sutra component is being imported into a Server Component via the barrel.

Switch to per-component imports:

```tsx
// ❌ pulls client code into RSC
import { Button } from "@devalok/shilp-sutra/ui";

// ✅ component-scoped, declares "use client" only where needed
import { Button } from "@devalok/shilp-sutra/ui/button";
```

For the full RSC-safety matrix, see [server-components.md](./server-components.md).

## Symptom: Fonts render in browser default (Times/Arial), not Inter/Ranade

**Diagnosis:** Either the CSS import did not load (see first symptom), or the consumer is overriding `--font-sans` / `--font-display` and pointing at a font that isn't loaded.

Check the computed value of `--font-sans` on `<html>` in DevTools. It should be `"Inter Variable", system-ui, ...`. If the override variable points at a font that isn't loaded, the browser falls back.

The font files ship inside the package — no `next/font` configuration is required for the defaults to work.

## Symptom: Bare `shadow` class produces no visible shadow

**Diagnosis:** Working as designed. Tailwind 4 has no default `--shadow` token, so the `shadow` utility no longer exists.

Use the explicit shadow variants:

- `shadow-raised` — cards, buttons
- `shadow-overlay` — popovers, dropdowns
- `shadow-floating` — modals, dialogs
- `shadow-brand` — accent emphasis

## Symptom: `<Toaster />` is mounted but `toast()` doesn't show anything

**Diagnosis:** Either `sonner` is not installed, or two `<Toaster />` instances are mounted at different positions and they're stacking off-screen.

Check 1 — `pnpm list sonner` shows `^2.0.0` or higher.

Check 2 — only ONE `<Toaster />` is mounted in the app. Search the project: `grep -r "<Toaster" src/ app/`.

In dev mode, calling `toast()` without a mounted `<Toaster />` logs a one-time console warning pointing to the fix (since v0.36.0).

## Symptom: Build error mentioning `use-sync-external-store`

**Diagnosis:** Should not happen since v0.37.0 — `use-sync-external-store` was moved to runtime dependencies and is auto-installed transitively.

**Why this dependency exists at all** (it is a hook built into React 18+, so it looks redundant): we do not use the shim ourselves. It is a TipTap transitive. TipTap's code is bundled into our `dist`, and that bundled chunk imports `use-sync-external-store/shim`. We externalize the shim rather than bundling it, because bundling forced a `createRequire` bridge into our Rollup runtime chunk that broke every Turbopack consumer. Externalized code must be resolvable from the consumer's tree, hence the declaration.

If it still happens, install it explicitly:

```bash
pnpm add use-sync-external-store
```

And open an issue at <https://github.com/devalok-design/shilp-sutra/issues> with the resolution graph (`pnpm why use-sync-external-store`) so we can fix the root cause.

## Symptom: `Cannot find package 'sonner'` when you only imported a hook (or `'react-markdown'` from the AI barrel)

**Diagnosis:** you imported a *barrel* rather than the component itself, and the barrel re-exports something with an optional peer.

- `@devalok/shilp-sutra/hooks` re-exports `toast`, which needs `sonner`.
- `@devalok/shilp-sutra/ai` re-exports the block renderer, which needs `react-markdown`.

A bundler tree-shakes the unused branch away, so this is invisible in a client build. It bites at **runtime in Node** — SSR, a route handler, a test — where the import is evaluated for real.

Fix — import the specific module instead of the barrel:

```ts
// needs sonner installed, because the barrel also exports toast
import { useIsMobile } from '@devalok/shilp-sutra/hooks'

// no optional peers at all
import { useIsMobile } from '@devalok/shilp-sutra/hooks/use-mobile'
```

Every hook has its own subpath: `use-mobile`, `use-color-mode`, `use-touch-device`, `use-viewport-height`. Same rule applies across the library — a deep import never costs you more than that component needs.

## Symptom: `error TS2305: Module '"react"' has no exported member 'ReactSVG'`

**This is an upstream `@tabler/icons-react` bug, not a shilp-sutra one** — but you will hit it following our install instructions, so it is documented here.

`@tabler/icons-react` (through 3.45.0, the current release) opens its type declarations with:

```ts
import { ReactSVG, … } from 'react'
```

React 18's types exported `ReactSVG`; React 19's removed it, keeping only `ReactSVGElement`. So on React 19 the icon package's own `.d.ts` fails to compile.

You only see it with **all three**: React 19, `skipLibCheck: false`, and a direct `@tabler/icons-react` import in your own code. React 18 is unaffected, and the default `skipLibCheck: true` suppresses it.

Workarounds, in order of preference:

1. Leave `skipLibCheck: true` (the default in every framework scaffold). It suppresses errors inside dependency declarations — including this one.
2. Import icons through our re-export instead of directly, so the broken declaration is never loaded into your program.
3. Pin `@types/react` to 18 if your app is still on React 18.

There is nothing to fix on our side: we neither wrap nor re-declare Tabler's types. Track it upstream at <https://github.com/tabler/tabler-icons/issues>.

## Symptom: `error TS2307: Cannot find module '@devalok/shilp-sutra/ui/button'` under `"moduleResolution": "node"`

**Diagnosis:** You are on TypeScript's legacy resolution mode, which predates and ignores the `exports` field in `package.json`. Our files live under `dist/`, and every public path is mapped through `exports` — legacy resolution looks for a literal `node_modules/@devalok/shilp-sutra/ui/button.js` and finds nothing.

**Supported resolution modes:**

| `moduleResolution` | Supported | Notes |
|---|---|---|
| `bundler` | ✅ | Recommended. Vite, Next.js, and most modern setups default to this. |
| `node16` / `nodenext` | ✅ | Fully supported since 0.55.0. |
| `node` (legacy) | ❌ | Cannot read `exports`. No subpath resolves. |

Fix — in your `tsconfig.json`:

```jsonc
{ "compilerOptions": { "moduleResolution": "bundler" } }
```

## Symptom: `require('@devalok/shilp-sutra')` throws `ERR_REQUIRE_ESM`

**Diagnosis:** The package is ESM-only — we ship no CommonJS build. Whether `require()` works depends on your Node version:

| Node | `require('@devalok/shilp-sutra/ui/button')` |
|---|---|
| 22.12+ / 23+ | ✅ Works — `require(esm)` is supported and unflagged. Verified against every entry point, including the full `./ui` barrel. |
| < 22.12 | ❌ `ERR_REQUIRE_ESM` |

On older Node, use a dynamic import:

```js
const { Button } = await import('@devalok/shilp-sutra/ui/button')
```

Or move the consuming file to ESM (`"type": "module"`, or a `.mjs` extension). Every supported framework target — Next.js, Vite, Remix, Astro, TanStack Start — handles the ESM entry natively; this only affects hand-written CJS scripts.

## Symptom: Storybook MCP server `localhost:6006/mcp` returns 404

**Diagnosis:** Storybook dev server isn't running, OR the MCP plugin is not enabled in this Storybook version.

Check 1 — `pnpm dev` is running and `http://localhost:6006/` shows the Storybook UI.
Check 2 — the MCP endpoint requires Storybook 9+ with the MCP plugin enabled. Older versions of this repo's Storybook setup may need an upgrade.

The MCP server is a development convenience for AI agents — `llms.txt`, the per-component docs at `docs/components/`, and `mcp-manifest.json` are the authoritative shipped docs and do not require a running server.

## Still stuck

Open an issue with this template:

```md
## Environment
- Framework + version (Next.js 15.x / Vite 5.x / Remix 2.x / Astro 5.x / TanStack Start ...)
- Package manager + version (pnpm 10.x / npm 11.x / yarn / bun)
- Node version
- @devalok/shilp-sutra version
- Other peer deps (framer-motion, sonner, tailwindcss versions)

## What I tried
[Recipe followed, step where it broke]

## What happened
[Exact error message, stack trace, screenshot]

## What I expected
[Behavior described in the recipe]
```

File at: <https://github.com/devalok-design/shilp-sutra/issues/new>
