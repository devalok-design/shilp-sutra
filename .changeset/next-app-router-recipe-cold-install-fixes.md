---
"@devalok/shilp-sutra": patch
---

docs(recipes): fix Next.js App Router cold-install friction surfaced by dogfood test

A cold-install dogfood test against `pnpm create next-app@latest` on Next 16.2.6 + Turbopack + React 19.2 + pnpm 10.30 (2026-05-25) surfaced seven friction points in `install-next-app-router.md`. Recipe still worked end-to-end, but every friction point was a place an AI agent could trip naively. This release updates the recipe.

### What changed

- **Added "Tested on" matrix** at the top of the recipe so agents know the exact stack we last verified against.
- **`src/app/globals.css` is now listed as the priority-1 location** for the global CSS file (Next 14+ default; was priority-2 in the old recipe).
- **§ 4b now explicitly tells agents to replace the entire scaffold `globals.css`**, not just append. The scaffold writes `:root` color vars, an `@theme inline` block linked to Geist font vars, a `prefers-color-scheme` block, and a `body { font-family: Arial }` block — any of which can silently override shilp-sutra tokens.
- **§ 5 calls out Turbopack** as the Next 16 default and confirms `transpilePackages` is respected.
- **§ 3 PostCSS step rewritten** to say "verify or create" — Next 14+ scaffolds the correct file. Agents were burning cycles re-creating it.
- **§ 6 layout.tsx replacement now explicitly lists the scaffold lines to remove** — `next/font/google` Geist imports, the `${geistSans.variable}` className on `<html>`, and the `min-h-full flex flex-col` className on `<body>`. Naive agents kept the Geist imports running alongside shilp-sutra's fonts.
- **§ 7 page.tsx replacement notes the scaffold's existing Vercel marketing layout** so agents know they're replacing real content.
- **§ 8 gotchas adds three new entries**:
  - Scaffold's `body { font-family: Arial }` wins the cascade over shilp-sutra fonts if kept (most common silent break).
  - Auto-generated `pnpm-workspace.yaml` from pnpm 10+ — harmless standalone, broken inside a monorepo.
  - Auto-generated `AGENTS.md` from `create-next-app` uses `<!-- BEGIN:nextjs-agent-rules -->` markers; shilp-sutra's use `<!-- BEGIN:shilp-sutra-agent-rules -->` — they coexist, but worth knowing.

### Why patch, not minor

Recipe content updates that clarify existing setup do not widen public API surface. They make the same recipe land successfully on more environments. No new exports, no behavior change, no new dependency.
