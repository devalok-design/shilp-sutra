# Site → DS Feedback Log

> Living log of issues found in `@devalok/shilp-sutra` (the DS) while
> building the marketing site at `apps/site/`. Each entry captures what
> tripped us, what the workaround looked like, and what the DS-side fix
> should be. Older entries are kept even after they're patched so we can
> trace patterns over time.

**Maintained by:** site work, not DS work. Open a GH issue on
`devalok-design/shilp-sutra` when an item warrants escalation.
**Last touched:** 2026-05-25.

---

## Open

### O-1. `Progress` track invisible against `bg-surface-2` cards

- **Surface:** Lendis showcase KYC trust card (`apps/site/content/showcase/lendis.tsx`).
- **What.** `<Progress value={80} color="success" />` rendered the filled portion correctly but the unfilled 20% blended into the surrounding `bg-surface-2` Card body. Visual reads "done" instead of "80% of the way." Amal flagged in screenshot review (`giving-claude-eyes/amal-feedback-2.png`).
- **Workaround.** Replaced the DS Progress with a hand-rolled track + fill using `bg-surface-3` for the track and `bg-success-9` for the fill, plus a `border-surface-border-subtle` ring. ARIA attrs added manually.
- **DS-side fix.** Either bump the default track from `bg-surface-2` to `bg-surface-3` so it has 1+ step contrast against any card it lands in, OR expose a `trackColor` / `trackClassName` prop so consumers can opt out. Default + override both are worth shipping.
- **Audit.** Worth sweeping every Progress usage site-wide for the same regression: Patrika reading-progress strip, Atlas Capacity Used tile, Lendis KYC stepper. If they sit on surface-2 or accent-2 they have the same bug.

### O-2. `DataTable` `ColumnDef` not re-exported from `@devalok/shilp-sutra/ui/data-table`

- **Surface:** Lendis + Vaidya showcases, Atlas DataTable column arrays.
- **What.** `DataTable` is a TanStack-Table wrapper, but the wrapper file doesn't re-export `type ColumnDef from '@tanstack/react-table'`. Consumers either:
  1. Declare `@tanstack/react-table` themselves (forces an unrelated runtime dep — we did this for the site)
  2. Inline the row typing as `cell: ({ row }: { row: { original: T } }) => ...` plus an `as any` cast on the columns array
- **Workaround.** Site `package.json` declares `@tanstack/react-table` `^8.21.0` matching the DS's transitive version. Cells then use `cell: ({ row }) => ...` cleanly with `ColumnDef<T, unknown>[]` typing.
- **DS-side fix.** `export type { ColumnDef, Row, Header, Cell } from '@tanstack/react-table'` from the DataTable entry. Consumers never have to know about the transitive dep.

### O-3. `DataTable` `defaultDensity` prop documented but not in public type

- **Surface:** Atlas, Lendis, Vaidya — anywhere we wanted compact tables.
- **What.** Docs / examples reference `<DataTable defaultDensity="compact" />` but the prop isn't on the public `DataTableProps`. TypeScript rejects it.
- **Workaround.** Dropped the prop. Tables render at default density.
- **DS-side fix.** Either add the prop to the public type OR remove it from docs. Recipe-vs-public-type drift.

---

## Resolved

### R-1. `--shadow-brand` / `--shadow-glow` / `--shadow-ring` hardcoded to Devalok pink

- **Resolved:** commit `98aa61cd` on `feat/site-v1-and-skill`, 2026-05-25.
- **What.** Tokens hardcoded `oklch(0.55 0.19 360 / α)` (Devalok house pink). When the canvas swapped to Atlas (indigo), Lendis (green), or any other brand, hover halos stayed pink and broke the illusion.
- **Fix.** Each token now derives its tint from the active accent ramp via `color-mix(in oklch, var(--color-accent-9) N%, transparent)`. Light + dark blocks both updated. `--shadow-success` / `--shadow-warning` / `--shadow-error` correctly left alone (those follow semantic hues, not brand).

### R-2. `rounded-pill` not auto-generated as a utility under `[data-shape]` presets

- **Resolved:** confirmed working at v0.39+. False alarm.
- **What.** During the v0.39 shape-preset rollout, user reported circles rendering as squares. Diagnosed: `--radius-pill: 9999px` IS in every preset block (including `slightly-rounded`) and Tailwind 4 auto-generates `rounded-pill` correctly. Issue was browser cache, not the DS.
- **Note for future.** When `data-shape` presets feel wrong, hard-refresh first. The token output is in dist before the user's browser caches it.

### R-3. Migration script `scripts/migrate-radius-roles.mjs` over-aggressively maps `rounded-full` → `rounded-pill`

- **Resolved:** correct behaviour, not actually a bug.
- **What.** Initial worry: the migration converted every `rounded-full` to `rounded-pill`, including spots where `rounded-full` was used intentionally (avatars, status dots).
- **Diagnosis.** `--radius-pill: 9999px` in every preset, so `rounded-pill` ≡ `rounded-full` at compute time. Migration is value-equivalent.
- **Note.** Document this in the migration's docstring so future users don't worry.

---

## Themes & patterns to watch

1. **Token-to-utility coverage.** Every `--*` we want exposed as a Tailwind utility needs an `@utility` block in `tokens/utilities.css` (per the existing pattern for `--z-*`, `--duration-*`). When a new token lands, audit whether it needs a utility.
2. **Surface-layering and component default backgrounds.** DS components default to `bg-surface-2` (per the layering rule). Anywhere a component sits ON another component using the same surface, internal sub-surfaces (tracks, dividers, hover states) need to step UP a layer (surface-3 / surface-4) to maintain contrast. Audit every "small inner element on a card" surface — Progress track, Slider rail, Switch off-state, Skeleton shimmer base, etc.
3. **Brand-reactivity of effect tokens.** Pattern repeated in shadow tokens above. Worth sweeping every other token that visually depends on the brand: outline rings, focus rings (`--focus-ring`), button hover glows, anything with a hardcoded oklch value.
4. **Type-vs-doc drift on DataTable.** R-2's `defaultDensity` is one example; there may be more. Pre-publish-audit could grep DS docs for prop names and check against the TypeScript surface.

---

## How to add an entry

Append under "Open" with sections: **Surface** (where you hit it), **What** (one paragraph), **Workaround** (what we did to keep the site shipping), **DS-side fix** (recommended change in the DS itself). Move to "Resolved" with a commit reference when patched.
