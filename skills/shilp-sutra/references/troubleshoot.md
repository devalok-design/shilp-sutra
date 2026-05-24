<!-- Source: packages/core/docs/recipes/troubleshoot.md — do not edit directly. Regenerate with `node scripts/build-skill.mjs`. -->

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
transpilePackages: ["@devalok/shilp-sutra", "@devalok/shilp-sutra-brand"],
```

If `@devalok/shilp-sutra-brand` is not installed, list only `@devalok/shilp-sutra`.

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

If it still happens, install it explicitly:

```bash
pnpm add use-sync-external-store
```

And open an issue at <https://github.com/devalok-design/shilp-sutra/issues> with the resolution graph (`pnpm why use-sync-external-store`) so we can fix the root cause.

## Symptom: Storybook MCP server `localhost:6006/mcp` returns 404

**Diagnosis:** Storybook dev server isn't running, OR the MCP plugin is not enabled in this Storybook version.

Check 1 — `pnpm dev` is running and `http://localhost:6006/` shows the Storybook UI.
Check 2 — the MCP endpoint requires Storybook 9+ with the MCP plugin enabled. Older versions of this repo's Storybook setup may need an upgrade.

The MCP server is a development convenience for AI agents — `llms.txt` and `llms-full.txt` are the authoritative docs and do not require a running server.

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
