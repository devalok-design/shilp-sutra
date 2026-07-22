# Component API Cheat Sheet

> Quick reference for building with `@devalok/shilp-sutra`. Values are the **exact
> accepted enums** from the current release (`0.49.x`), pulled from the component
> source. **Defaults are in bold.** Import everything from
> `@devalok/shilp-sutra/ui/<name>`.

## ⚠️ Read this first — the cross-component gotchas

The prop *vocabulary* is not yet uniform across every component. These are the
four things that most often cause a "why won't this compile / why does it look
wrong" moment. Until they're unified, use this sheet as the source of truth.

1. **Tinted style is `soft` on some, `subtle` on others.**
   `variant="soft"` works on **Button** and **Badge**. **Alert** calls the tinted
   look `variant="subtle"` (there is no `soft`). Badge has **both** `subtle`
   (tinted + border, its default) and `soft` (tinted, borderless) — they look
   different.

2. **The `color` enum differs per component.** `color="error"` works on Button,
   Alert, Toggle, Slider — but **not** on Switch. `color="accent"` works on
   Button/Switch/Toggle — but **not** on Alert/Banner (those start at `info`).
   Check the table before assuming a colour is accepted.

3. **Icon props have different names.** `startIcon` / `endIcon` on Button & Badge;
   `icon` on IconButton; `startSection` / `endSection` on Input; `thumbIcon` on
   Switch. Passing `startIcon` to an Input silently does nothing.

4. **Controlled-change handlers differ.** Most use `onValueChange`
   (Radio, ToggleGroup, Tabs, Autocomplete, NumberInput); Switch/Checkbox use
   `onCheckedChange`; Toggle uses `onPressedChange`; **SegmentedControl uses
   `onSelect`** (the outlier).

## Per-component reference

Legend: **bold** = default value · `—` = axis not offered by that component.

| Component | `variant` | `color` | `size` | icon prop | change handler |
|---|---|---|---|---|---|
| **Button** | **solid** · soft · outline · ghost · link | **accent** · error · success · warning · neutral | xs · sm · **md** · lg · compact-xs/sm/md · icon · icon-xs/sm/md/lg | `startIcon`, `endIcon` | — |
| **IconButton** | *(extends Button)* | *(extends Button)* | sm · md · lg | `icon` (required `aria-label`) | — |
| **Badge** | **subtle** · solid · outline · soft | **default** · accent · error · success · warning · info · neutral · teal · amber · slate · indigo · cyan · orange · emerald · custom | xs · sm · **md** · lg | `startIcon`, `endIcon` | — |
| **Alert** | **subtle** · solid · outline | **info** · success · warning · error · neutral | sm · **md** · lg | — | — |
| **Banner** | — | **info** · success · warning · error · neutral | — | — | — |
| **Switch** | — | **accent** · success · warning | sm · **md** · lg | `thumbIcon` | `onCheckedChange` |
| **Checkbox** | — | — | sm · **md** · lg | — | `onCheckedChange` |
| **Radio** | — | — | — | — | `onValueChange` |
| **Toggle** | **default** · outline | **accent** · error · success · neutral | sm · **md** · lg | — | `onPressedChange` |
| **ToggleGroup** | **default** · outline | — | sm · **md** · lg | — | `onValueChange` |
| **SegmentedControl** | default · solid | — | sm · md · lg | — | **`onSelect`** ⚠️ |
| **Slider** | — | **accent** · success · warning · error | sm · **md** · lg | — | `onValueChange` |
| **Progress** | — | accent · success · warning · error | sm · md · lg | — | — |
| **Dot** | filled · ring · off | accent · success · warning · error · info · neutral · current | xs · sm · md · lg | — | — |
| **Card** | **default** · elevated · outline · flat | **default** · accent · error · success · warning · info · neutral | sm · **md** · lg | — | — |
| **Input** | — | — | xs · sm · **md** · lg | `startSection`, `endSection` | — |
| **Textarea** | — | — | xs · sm · **md** · lg | — | — |
| **SearchInput** | — | — | sm · **md** · lg | *(built-in search icon)* | — |
| **NumberInput** | — | — | xs · sm · **md** · lg | — | `onValueChange` |
| **Select** | default · outline · ghost *(on `SelectTrigger`)* | — | *(inherits)* | — | `onValueChange` *(on `Select` root)* |
| **Combobox** | — | — | xs · sm · **md** · lg | — | `onValueChange` |
| **Autocomplete** | — | — | — | — | `onValueChange` |
| **Tabs** | line · contained *(on `TabsList`)* | accent · neutral *(on `TabsList`)* | — | — | `onValueChange` *(on `Tabs`)* |

## Conventions that DO hold everywhere

- **Every component forwards `ref`, merges your `className` last (so your classes
  win), and spreads extra props** (`id`, `data-*`, `aria-*`, `onClick`) onto its
  root — pass HTML attributes freely.
- **`size` is `sm | md | lg`** on most controls; text-entry fields
  (Input, Textarea, Combobox, NumberInput) also offer `xs`.
- **Secondary buttons: prefer `variant="soft"` over `outline`** — warmer,
  brand-consistent, reads better in dense UIs (use `outline` only on coloured/
  raised surfaces or icon-dense toolbars).
- **Forms:** wrap a control in `<FormField>` with a `<Label>` and the label
  auto-associates (no manual `htmlFor`/`id` needed) — works for Input, Textarea,
  Select, NumberInput, Combobox, Autocomplete, ColorInput as of 0.49.x.
- **Theming:** set one brand hue; every component recolours via CSS vars — no
  theme provider, no re-render.

## For AI editors (Cursor / Claude Code / Codex)

The library ships machine-readable docs so your agent doesn't guess: an
installable Agent Skill, `llms.txt`, `AGENTS.md`, and a hosted MCP server
(`https://shilp-sutra.devalok.in/mcp`) with `find_component` / `get_component` /
`get_tokens`. Point your agent at those and it gets the current prop surface
per component. This sheet is the human-scannable companion.

---

*Generated from the `0.49.x` component source. If a value here disagrees with
your editor's autocomplete, the TypeScript types win — file an issue.*
