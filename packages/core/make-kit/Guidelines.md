# shilp-sutra — Figma Make Kit Guidelines

> **Read order.** This is the entry point. Read `setup.md` next, then `foundations/overview.md`, then `components/overview.md`. Branch into specific token / component files on demand.

## What this is

`@devalok/shilp-sutra` is the Devalok design system: React 18/19 components built on vendored Radix primitives, OKLCH design tokens, CSS-first Tailwind 4. Generated apps must use these components instead of raw HTML elements wherever a matching component exists.

## Product character

| Trait | Value |
|---|---|
| Density | Mid. Default `md` size on controls. Reach for `sm` only inside dense toolbars, tables, filter bars. |
| Color philosophy | ~90% neutral surfaces, accent color used sparingly for primary action + status. Brand accent is OKLCH magenta by default, but the kit is themable — never hardcode hex. |
| Corner radius | Semantic roles (`--radius-control`, `--radius-surface`, `--radius-overlay`). Default preset = "slightly-rounded" (6/10/16 px). Never hand-pick radii. |
| Elevation | Five surface tiers (`surface-base`, `raised`, `sunken`, `overlay`, `inverted`). Cards sit on `raised`, dialogs on `overlay`. Never combine an explicit `border-*` with a `shadow-*` token — shadow tokens already contain a hairline ring layer. |
| Motion | framer-motion is a required peer. Wrap apps in `<MotionProvider reducedMotion="user">` once. Use motion primitives (`MotionFade`, `MotionCollapse`, `MotionSlide`) instead of CSS keyframes. |
| Dark mode | `.dark` class on `<html>` or `<body>` flips every token. Algorithmically derived from OKLCH curves — surfaces lighten with elevation. |

## Mandatory rules

These are not preferences. Generated code that violates them is wrong.

1. **Use design system components, not raw HTML.** `<Button>` not `<button>`. `<Input>` not `<input>`. `<Text>` not `<span>`/`<p>` (when typographic semantics matter). `<Stack>` not bare flex divs.
2. **Use semantic tokens, never hex / rgb / hsl.** `bg-surface-raised` not `bg-white`. `text-fg` not `text-zinc-900`. `bg-accent-9` not `bg-pink-500`.
3. **Spacing uses `ds-*` cadence.** `p-ds-05`, `gap-ds-03`. Never `p-4` / `p-6`. Default cadence is `ds-03 / ds-05 / ds-07` (related items / grouped sections / page sections). Do not reach for every adjacent token (`ds-04`, `ds-06`) — three tiers, not five.
4. **Prefer `variant="soft"` over `variant="outline"` for non-primary actions.** Soft (tinted bg, no visible border) reads better in data-dense UIs. Outline only when on a colored bg or paired with a primary for explicit hierarchy.
5. **Surface layering is strict.** Page = `surface-base`. Cards/panels/widgets = `surface-raised`. Dialogs/popovers/dropdowns/inputs = `surface-overlay`. Shell chrome (sidebar, topbar) = `surface-sunken`. Tooltips = `surface-inverted`. If you're unsure, read `foundations/surfaces.md`.
6. **Never combine `border-*` + `shadow-*` tokens.** Shadow tokens already include a 1px ring layer. Adding an explicit border creates a 2-px edge.
7. **Icons use `<Icon icon={...} />` from `@tabler/icons-react`.** Do not import lucide, heroicons, mui-icons. The icon system auto-sizes via `IconProvider` context.
8. **Toasts mount once at app root.** `<Toaster />` (singleton). All triggering is imperative: `toast.success("...")`, `toast.error("...")`.
9. **Forms wire via `<FormField>`.** It auto-binds `<Label htmlFor>` ↔ `<Input id>` via context. Do not hand-generate ids.
10. **Dialog is responsive by default.** It auto-fullScreens on mobile (<768px). Sheet auto-bottom-drawer. Popover auto-drawer. Opt out with `responsive={false}` only when explicitly needed.

## Workflow — before generating any screen

1. **Identify the layout shell.** AppSidebar + TopBar for product pages. Container + Stack for marketing. Dialog/Sheet for modal flows.
2. **Pick the surface for each region.** Read `foundations/surfaces.md`. Default page bg is `surface-base`; everything else stacks up from there.
3. **Pick components from `components/overview.md`.** That file has decision trees for the common confusions (Button variant, Input vs Combobox vs Autocomplete, Dialog vs Sheet vs Popover).
4. **Lay things out with `<Stack>` + `<Container>`.** Use `gap-ds-03/05/07`. Don't reach for arbitrary flex divs.
5. **Apply state via component props, not classnames.** Loading? `loading` prop on Button. Error state on Input? `state="error"`. Disabled? `disabled`. Don't simulate states with className overrides.

## Workflow — before using a component

1. Read its component guideline in `components/`. Each lists variants, props, and at least 3 correct examples.
2. Check the "Don't" section at the bottom of the file. Most common mistakes are listed there.
3. If a prop you want isn't documented, it probably doesn't exist — don't invent one.

## Guidelines map

| File | When to read |
|---|---|
| `setup.md` | Always. Required imports + provider setup. |
| `foundations/color.md` | Choosing background / text / border color. Decision tree for status colors. |
| `foundations/typography.md` | Picking text size / weight. Heading vs body hierarchy. |
| `foundations/spacing.md` | Picking gap / padding. The three-tier cadence rule. |
| `foundations/surfaces.md` | Picking which surface tier a region sits on. Includes the surface decision matrix. |
| `foundations/radius.md` | When to override a radius role. Shape presets (`sharp` / `slightly-rounded` / `rounded`). |
| `foundations/motion.md` | Adding transitions, list stagger, drawer slides. framer-motion primitives. |
| `foundations/dark-mode.md` | Wiring the `.dark` toggle. How tokens behave in dark mode. |
| `foundations/icons.md` | Using Tabler icons, sizing via IconProvider. |
| `components/overview.md` | Catalog of all major components with decision trees. Read before picking a component. |
| `components/{name}.md` | Deep guide per component. Variants, props, examples, rules. |

## What this kit excludes

- Raw HTML form elements (use `<Input>`, `<Select>`, `<Combobox>`, `<Textarea>`, etc.)
- Tailwind utility colors (`text-zinc-*`, `bg-blue-*`) — use semantic tokens
- Custom icon libraries — Tabler only
- CSS-in-JS at runtime — utilities + tokens cover styling
- React Router / Next.js Link primitives — use `<Link>` from the kit; consumers wire their router via `LinkProvider`
