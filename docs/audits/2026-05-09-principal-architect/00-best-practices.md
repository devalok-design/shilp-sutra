# Design System Codebase Best Practices

**Compiled:** 2026-05-09
**Purpose:** Rubric for the 6-lens principal-architect audit of `@devalok/shilp-sutra`. Each section captures an industry-canonical pattern, who codified it, why it matters, and the anti-pattern to flag.

Sources weighted in this document, in order of authority for React DSes:

- **Radix UI Primitives** — composition + accessibility + uncontrolled-by-default
- **React Aria / Adobe Spectrum** — hooks/components/patterns layering + behavior-style-state separation
- **shadcn/ui** — copy-paste registry + CVA variant pattern + AGENTS.md/skills (2026)
- **Mantine v7** — CSS-variable theming, post-CSS-in-JS rationale, codemod policy
- **Material UI / Atlaskit / Polaris / Carbon / Elastic EUI** — monorepo organization, tokens, governance
- **CVA (Class Variance Authority)** — variant API canonical
- **TkDodo, Adobe Spectrum docs, Patterns.dev** — type-safe compound component patterns
- **Sebastian Markbåge / React core docs** — forwardRef, memo, displayName, Slot

---

## 1. Architecture & layering

### Principle

A DS organizes components into **strict layers with one-way dependencies**:

```
tokens → primitives → ui → composed → shell → ai/feature
```

Each layer may import only from layers ABOVE it (closer to tokens). Cross-layer leakage causes cyclic dependencies, untestable units, and breaks tree-shaking.

### Who codifies it

- **Adobe Spectrum**: hooks (`react-aria`) → components (`react-aria-components`) → patterns (`@react-spectrum/*`). Three layers, strict direction.
- **MUI**: `@mui/base` (headless) → `@mui/material` (styled) → `@mui/joy` / `@mui/lab` (variants).
- **Polaris**: `@shopify/polaris-tokens` → `@shopify/polaris` → `@shopify/polaris-icons`.
- **Carbon**: `@carbon/themes` + `@carbon/colors` → `@carbon/react` → `@carbon/charts-react`.

### Why it matters

- Tree-shaking: a consumer importing `Text` should not pull `RichTextEditor`'s 500KB TipTap dep.
- Testability: each layer has a clean test surface; primitives don't need to mock composed components.
- Cognitive load: a contributor reads a single layer at a time.
- Versioning: a primitive change ripples upward; a composed change doesn't ripple downward.

### Anti-patterns to flag

- `ui/X.tsx` imports from `composed/Y.tsx` (upward leak)
- `composed/Y.tsx` imports from `shell/Z.tsx` (skip-up)
- Implicit coupling via shared context — `ui` publishes a context that `composed` reads but the contract isn't documented
- `primitives/` (vendored Radix) referenced via raw relative path in source instead of an alias
- Cyclical dependency between sibling files in the same layer

### shilp-sutra status

Per CLAUDE.md, the layer rule is enforced by ESLint module-boundary rule. The 2026-04-06 ecosystem audit verified compliance. Audit lens 3 will spot-check IMPLICIT couplings (context-leak, layer-skip-via-utility-import).

---

## 2. Variant API consistency (CVA)

### Principle

Every CVA component uses the same **canonical variant axes** with predictable semantics:

| Axis | Values | What it controls |
|---|---|---|
| `variant` | `solid` (default), `soft`, `outline`, `ghost`, `link` | Visual emphasis hierarchy |
| `size` | `xs`, `sm`, `md` (default), `lg`, `xl` | Physical scale |
| `color` | `accent` (default), `neutral`, `success`, `warning`, `error`, `info` | Semantic intent |
| `shape` (optional) | `default`, `pill`, `square`, `circle` | Geometry |
| `weight` (optional) | `normal`, `semibold`, `bold` | Typographic emphasis |

Components that need extra axes (e.g. `loadingPosition`, `align`) ADD them, but **never rename the canonical four** (variant/size/color/shape).

### Who codifies it

- **Radix Themes** — variant + size + color taxonomy is standard.
- **Mantine** — `variant` + `size` + `color` shared across Button, Badge, Alert.
- **Chakra** — same trio.
- **shadcn/ui** — variant + size; some components add color via Tailwind utilities.
- **CVA documentation** — variants + compoundVariants + defaultVariants is the recommended structure.

### Why it matters

- Predictability: a consumer who learned `Button` can guess `Badge`, `Alert`, `Toggle` without re-reading docs.
- AI-agent learnability: `llms-full.txt` becomes much shorter when each component documents only DEVIATIONS from the canonical taxonomy.
- Code-gen: VS Code snippets, Storybook controls, Figma-mapped properties all assume the taxonomy.

### Anti-patterns to flag

- `variant="filled"` instead of `variant="solid"` (Mantine pre-v7 antipattern; we removed in v0.38)
- `variant="primary" | "secondary"` (color-coded into variant — should be `variant + color`)
- `size="small" | "medium" | "big"` (long form instead of `xs/sm/md/lg/xl`)
- `color="default"` instead of `color="accent"` (we already removed in v0.32)
- Boolean variants when an enum would scale (`isPrimary` + `isOutline` + `isGhost` — should be one `variant` enum)
- Same axis name with different value space across components (e.g. `Button.size: xs|sm|md|lg` but `Slider.size: small|medium|large`)

### shilp-sutra status

Variant audit was done in 2026-04-06 (per memory). Most axes standardized. Slider `size` axis was outstanding. Audit lens 1 will verify completion + flag anything that drifted.

---

## 3. Controlled vs uncontrolled state

### Principle

Stateful components MUST support BOTH modes:

- **Uncontrolled** (default): component manages its own state internally. Consumer passes `defaultValue`/`defaultOpen`/etc.
- **Controlled**: consumer manages state. Passes `value`/`open`/etc + `onValueChange`/`onOpenChange`.

The component detects mode by the presence of the controlled prop. Switching between modes mid-life is undefined behavior (React idiom).

### Canonical prop pairing

| Controlled value | Default | Change handler |
|---|---|---|
| `value` | `defaultValue` | `onValueChange` (NOT `onChange` for non-input components) |
| `open` | `defaultOpen` | `onOpenChange` |
| `pressed` | `defaultPressed` | `onPressedChange` |
| `checked` | `defaultChecked` | `onCheckedChange` |
| `selected` | `defaultSelected` | `onSelectionChange` |

For native-input-emulating components (Input, Textarea, NumberInput) only, use the React idiomatic `value` + `onChange(e)`.

### Who codifies it

- **Radix Primitives** — every stateful primitive supports both modes with this exact prop shape.
- **React Aria** — same pattern via hooks (`useToggleState({ isSelected, defaultSelected, onChange })`).
- **Reach UI / Headless UI** — same.

### Why it matters

- Consumers integrate with Form libraries (react-hook-form, Formik) which require controlled.
- Default uncontrolled means simple use cases work without state setup.
- `onChange` colliding with native inputs causes type confusion.

### Anti-patterns to flag

- Component supports `value` but not `defaultValue` (or vice versa) — partial support
- Component fires `onChange` for non-input semantics (use `onValueChange`)
- Component requires `value` AND `onChange` (no uncontrolled mode)
- Boolean state (open/closed) using `onClose: () => void` with no `onOpen` — should be unified `onOpenChange: (next: boolean) => void`

---

## 4. Composition primitives — `asChild` and Slot

### Principle

Components that render a DOM element MUST accept `asChild?: boolean`. When set, the component clones its single child instead of rendering its own element, merging behavior + props onto the child. Implementation uses Radix's `<Slot>` utility.

This lets consumers compose:

```tsx
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

The Button gives the Link its styling, focus management, and ARIA. The Link gives the Button its routing.

### Who codifies it

- **Radix Primitives** — every primitive supports asChild.
- **shadcn/ui** — components inherit asChild from Radix.
- **React Aria** — uses render-props (`<Button>{props => ...}</Button>`) rather than asChild, but achieves same goal.

### Why it matters

- Routing, framework integration, polymorphic rendering without prop bloat.
- Avoids a component having to know about every router (Next/Link, react-router/Link, TanStack Router/Link).
- Avoids duplicating styles across "ButtonLink", "ButtonAnchor", "ButtonButton" variants.

### Anti-patterns to flag

- Custom `as` prop (Mantine pre-v7 antipattern — heavier API than asChild)
- `<ButtonAnchor>` / `<ButtonLink>` / `<ButtonRouterLink>` proliferation
- Wrapping `<a>` inside `<Button>` instead of using asChild (double DOM, double focus ring)
- `asChild` declared but doesn't merge ref correctly

### shilp-sutra status

Most ui/* primitives accept asChild via Radix. Some custom components (composed/, shell/) may not. Audit lens 1 will verify coverage.

---

## 5. forwardRef + displayName

### Principle

Every component renders a DOM element MUST:

1. Use `React.forwardRef<ElementType, Props>(...)`.
2. Set `Component.displayName = "Component"` immediately after.
3. Type the ref correctly (e.g. `HTMLButtonElement` not `HTMLElement`).

For components wrapping `forwardRef + memo`:

```tsx
const Inner = React.forwardRef<HTMLButtonElement, Props>(...)
Inner.displayName = "Button"
const Button = React.memo(Inner)
Button.displayName = "memo(Button)" // optional but helpful in DevTools
```

### Who codifies it

- React core docs.
- Steve Kinney's React + TypeScript course.
- Every major DS (MUI, Mantine, Chakra, shadcn).

### Why it matters

- Without `displayName`, React DevTools shows "ForwardRef" or "Anonymous" — debugging is painful.
- Without `forwardRef`, integrators can't use `useRef` to focus, measure, or animate the element.
- Without precise ref typing, `ref.current.focus()` doesn't autocomplete.

### Anti-patterns to flag

- `displayName` missing or set to wrong string (e.g., `"forwardRef"`)
- `ref` typed as `HTMLElement` when component renders `<button>` (lose specific methods)
- Component wraps a primitive but doesn't forward the ref through to the inner DOM
- Component uses `React.FC<Props>` (deprecated, no implicit `children`, no ref support)

---

## 6. Compound components — when and how

### Principle

Convert a flat-prop component to a **compound component** when EITHER of these is true:

1. **Prop count > 8** for layout/content (CONTRIBUTING.md threshold for shilp-sutra).
2. **Two or more independently renderable sections** that consumers commonly need to customize.

Compound components share state via React Context. Children read context to coordinate (e.g., `Tabs.Trigger` knows the active tab).

### Two implementation styles

| Style | Example | When to use |
|---|---|---|
| **Open compound** | `<Card><Card.Header /><Card.Body /></Card>` | Flexible layouts, optional sections, ordering matters to consumer |
| **Slot-based** | `<Dialog header={...} body={...} footer={...} />` | Consistency-critical (e.g. always-Header-then-Body-then-Footer), prevents wrong ordering |

Per [TkDodo's analysis](https://tkdodo.eu/blog/building-type-safe-compound-components):
> Use compound components for layout flexibility with mostly static, explicitly-related elements — not for dynamic lists or rigid structures.

For dynamic-content cases (tables of arbitrary rows), use a **render-prop/data API** instead (`<DataTable rows={data} columns={cols} />`).

### Who codifies it

- **Radix** — every primitive that has multi-part anatomy (Tabs, Accordion, Dialog) is compound.
- **React Aria** — both styles available via hooks vs components packages.
- **Mantine** — uses compound + slots both.
- **shadcn/ui** — strongly compound (Card.Header, Card.Body, etc.).

### Anti-patterns to flag

- Flat component with > 8 props that should be compound (Card with `title` + `description` + `action` + `header` + `footer` + `image` + `imageAlt` + ... — refactor)
- Compound component for a fixed-layout case (Dialog with required Header+Body+Footer order — should be slot-based to prevent reordering)
- Compound component for dynamic data (Table.Row repeated 1000 times — should be data-driven `DataTable`)
- Mixing styles within one component (Card uses `Card.Header` AND has a `title` prop — pick one)

### shilp-sutra status

CLAUDE.md and CONTRIBUTING both codify the >8-prop / 2+ sections rule. Audit lens 4 will catalog adherence.

---

## 7. Type safety patterns

### Principle

DSes ship TypeScript types as a primary artifact. Type-level errors prevent half of consumer integration bugs.

### Required practices

- **Discriminated unions for state machines.** Spinner state: `{ state: "spinning" } | { state: "success" } | { state: "error", error: Error }` — not `{ state: string, error?: Error }`.
- **Exact prop types** via `interface` or `type`. Export them (`export type ButtonProps = ...`).
- **Polymorphic components via `as` or `asChild`** — types must flow correctly. The `as` prop pattern requires complex generics; `asChild` is simpler (just don't override the child's type).
- **Generic constraints** on collection components: `<Combobox<Item>>` not `<Combobox>` with `any`.
- **No `any` in the public API.** `unknown` if truly unknown; specific union otherwise.
- **`@ts-nocheck` only in vendored third-party code** (Radix primitives in shilp-sutra are an explicit exception, documented in CLAUDE.md).
- **Strict null checks**, **no implicit any**, **exact optional types** (TS 4.4+).

### Anti-patterns to flag

- `any` in exported props or event handler payloads
- Optional props with implicit defaults (`color?: string` — should be `color?: "accent" | "neutral" | ...`)
- Union of strings as a stringly-typed enum (`size: "small" | "big" | string` — defeats narrowing)
- `React.FC` (deprecated, hides ref problem)
- `HTMLElement` ref typing instead of specific `HTMLButtonElement`
- Inferred but not exported prop types
- `Omit<HTMLProps, "size">` chains that grow unbounded

---

## 8. State coverage matrix

### Principle

Every interactive component MUST consider AND demonstrate (in stories OR tests) handling for:

| State | Question |
|---|---|
| **Default** | Resting state |
| **Hover** | Mouse over |
| **Focus** | Keyboard focus visible (`:focus-visible`) |
| **Pressed/Active** | Mouse down / keydown |
| **Disabled** | `disabled` attribute set, ARIA-disabled, tabindex -1 |
| **Loading** | Async pending — visual + `aria-busy` |
| **Error** | Validation or async failure — visual + `aria-invalid` |
| **Success** | Validation or async pass — visual + announcement |
| **Empty** | Container with no children — fallback content or graceful collapse |
| **Read-only** | Display-but-not-edit |
| **Required** | `aria-required` |
| **RTL** | Right-to-left layout (Hebrew, Arabic, Urdu) — directional icons mirror |
| **Forced colors** | Windows high-contrast — semantic tokens remap |
| **Reduced motion** | `@media (prefers-reduced-motion)` — animations disabled or simplified |
| **Dark mode** | `.dark` class applied |
| **Selected** | For selectable components (TabItem active, MenuItem selected) |
| **Indeterminate** | Checkbox tri-state |

Not every state applies to every component. Container-only components (Stack, Container) skip Hover/Active. Chart components have their own state matrix.

### Who codifies it

- **WCAG 2.2** — minimum a11y bar (focus-visible, contrast, motion).
- **React Aria** — adaptive interactions (mouse + touch + keyboard) baked in.
- **Material 3** — state layers as a visual primitive.
- **Forced-Colors Mode** docs (Microsoft, MDN).

### Anti-patterns to flag

- Component renders disabled style but doesn't set `aria-disabled` / `disabled` attribute
- `:focus` outline removed without `:focus-visible` replacement
- Loading state is `<Spinner />` overlaid but no `aria-busy`
- RTL icons that don't mirror (left-arrow stays pointing left in Hebrew)
- Animations that don't respect `prefers-reduced-motion`
- Empty state that crashes on `children.length === 0`
- Forced-colors mode shows ghost-button as invisible (no border in high-contrast)

### shilp-sutra status

Forced-colors support added in 0.36.0 (per CHANGELOG). Reduced-motion respected in animations.css (per CLAUDE.md). RTL untested. Audit lens 6 will catalog per-component state coverage gaps.

---

## 9. Naming conventions

### Files

- **Component files**: `kebab-case.tsx` (e.g., `data-table.tsx`)
- **Test files**: `kebab-case.test.tsx` co-located, OR `kebab-case.test.tsx` in `__tests__/`
- **Story files**: `kebab-case.stories.tsx` co-located
- **Doc files**: `kebab-case.md` in `docs/components/`
- **Type-only files**: `kebab-case-types.ts` if separated; usually inline is fine

### Exports

- **Component name**: `PascalCase`. Match filename (`data-table.tsx` → `export function DataTable`).
- **Variant exports**: Suffix with `Variants` (`buttonVariants`, `cardVariants`).
- **Type exports**: Suffix with `Props` for component props (`ButtonProps`).
- **Hook exports**: Prefix with `use` (`useColorMode`, `useIsMobile`).

### CSS class hooks

- **Data attributes for state**: `data-state="open" | "closed"`, `data-disabled`, `data-pressed`. Allows consumers to style states.
- **CSS vars for tokens**: `--color-*`, `--spacing-*`, `--radius-*`. Namespace package-specific vars (`--spacing-ds-*`).

### Anti-patterns to flag

- File `dataTable.tsx` (camelCase) instead of `data-table.tsx`
- Component `dataTable` (camelCase) instead of `DataTable`
- Hook `ColorMode` (no `use` prefix)
- Type `ButtonInterface` (use `ButtonProps`)
- Variant export `buttonVariations` (inconsistent with `Variants` suffix)
- State exposed via class only (no `data-*` attribute) — consumers can't style without re-implementing
- Token names without DS namespace (`--spacing-3` collides with consumer)

---

## 10. Dead code prevention

### Principle

Public API surface is a contract — **never grow it accidentally**. Every export should be intentional, used by at least one consumer, and documented.

### Required practices

- **CI gates** for unused exports (`tsr`, `knip`, or `ts-prune`).
- **Bundler-side** tree-shaking verification per entry point (`size-limit` or equivalent).
- **Story coverage** for every public component (CONTRIBUTING gate).
- **Removed-but-unreplaced** check: if you remove an export, make sure no internal code still imports it via stale relative path.
- **TODO/FIXME hygiene**: every `TODO` / `FIXME` references an issue number.
- **Deprecation discipline**: `@deprecated` JSDoc + dev-mode warning + CHANGELOG entry, removal in next minor (per shilp-sutra CONTRIBUTING § Versioning).

### Who codifies it

- **Knip** — TypeScript dead-code finder, popular in DSes.
- **MUI** — has `pnpm extract-error-codes` and unused-types CI.
- **Polaris** — strict `tsc --noEmit` + custom dead-code check.

### Anti-patterns to flag

- Exports declared in barrel but never imported
- Components in source but no story (= invisible to docs/tests, possibly unused entirely)
- Props typed in interface but never read in implementation
- `if (false)` / `// eslint-disable-next-line no-unused-vars` patches
- Unreferenced files in package directory (orphan modules)
- Stale `// TODO` comments older than 6 months without ticket
- Re-exports of removed APIs left as no-op stubs (we cleaned this in v0.38 sweep)

---

## 11. Internationalization (i18n) and locale

### Principle

Components MUST not hardcode user-facing strings. Everything is either:

- A `children` prop (the consumer provides the text)
- A required prop with explicit copy (`label="Close"`)
- Read from a locale-aware source (date format, number format)

### Required for full DSes

- Date components: locale-aware via `date-fns`/`Intl.DateTimeFormat`/`@internationalized/date`
- Number inputs: locale-aware via `Intl.NumberFormat`
- Calendar: 13 calendar systems (Gregorian, Buddhist, Islamic, Hebrew, etc.)
- RTL: components mirror directional UI (icons, animations)
- Pluralization: `Intl.PluralRules` for "1 item" vs "2 items"

### Who codifies it

- **React Aria** — gold standard. ~30 languages, 13 calendar systems, 5 numbering systems, RTL.
- **MUI X** — locale objects per language.
- **Mantine** — internalized formatters.

### Anti-patterns to flag

- `<Button>Close</Button>` with hardcoded "Close" inside the component (consumer can't translate)
- Date picker hardcoded to MM/DD/YYYY (US-only)
- Currency symbol inside the component (`$`) instead of locale-aware
- Animation that doesn't mirror in RTL (a slide-in-from-right that should slide-in-from-left)

### shilp-sutra status

Likely English-only assumption throughout. RTL untested. This is an ACCEPTABLE pre-1.0 state if scoped explicitly. Audit lens 6 will document the gap, not file a P0 unless a critical user-facing string is hardcoded.

---

## 12. Accessibility (a11y) baseline

### Principle

Every interactive component MUST meet WCAG 2.2 AA, with built-in:

- ARIA roles + properties matching the WAI-ARIA pattern
- Keyboard navigation (Tab, Shift+Tab, arrows, Esc, Enter, Space) per pattern
- Focus management (focus traps for modals, focus restore on close)
- Screen-reader announcements (`aria-live` for async, `role="alert"` for errors)
- Sufficient color contrast (4.5:1 text, 3:1 UI elements)
- Touch targets ≥ 44px (WCAG 2.5.5)
- Forced-colors support (`@media (forced-colors: active)`)
- Motion respects `prefers-reduced-motion`

### Required CI gates

- `vitest-axe` per component test (smoke axe check)
- Storybook a11y addon for visual review
- Lighthouse CI for app-level (out of scope for primitive lib)

### Who codifies it

- **WAI-ARIA Authoring Practices Guide** (W3C)
- **WCAG 2.2** (W3C)
- **React Aria docs** — patterns implementation
- **Radix primitives** — patterns implementation

### Anti-patterns to flag

- Component renders custom `<div onClick>` instead of `<button>` (no role, no keyboard support)
- Modal that doesn't trap focus
- Async loader with no `aria-busy` or `aria-live`
- Keyboard handler missing arrow keys for menu navigation
- Custom focus ring that loses visibility in forced-colors mode
- `aria-label` on a wrapper instead of the focusable inner element

### shilp-sutra status

Per CLAUDE.md: vitest-axe per test, Storybook a11y addon enabled, forced-colors support. Audit lens 6 will spot-check whether the gates are uniformly applied.

---

## 13. Build and distribution hygiene

### Principle

A DS package's `dist/` is a sacred artifact. Every published byte should be intentional.

### Required practices

- **Per-component entry points** for tree-shaking (we have `./ui/button`, `./ui/dialog`, etc.)
- **Per-entry bundle-size gate** in CI (size-limit per entry, fail on regression)
- **`sideEffects` in package.json** correctly listing CSS files
- **`"use client"` directive injected only on client-only components** (server-safe components stay directive-less)
- **Externalized peer deps** — never bundle React, framer-motion, sonner
- **No leaked Node built-ins** in browser bundle (`require("module")`, `from "module"`)
- **SSR smoke test** importing every entry point in a Node context
- **Provenance attestation** on every release (sigstore/OIDC since 0.37.0)

### shilp-sutra status

All gates exist per CLAUDE.md + pre-publish-audit.mjs (45 gates). Audit lens 5 (dead code) will overlap with this. Audit lens 3 (layer enforcement) covers leakage.

---

## 14. AI-agent readability

### Principle (new in 2026)

A DS now has TWO audiences: humans AND coding agents. Patterns:

- **`AGENTS.md`** at repo root with managed BEGIN/END markers.
- **`llms.txt` + `llms-full.txt`** with current API + breaking changes front-loaded.
- **Recipe files in `docs/recipes/`** shipped in the npm tarball.
- **Stories tagged with `tags: ['autodocs']`** so MDX is generated.
- **Variant names exported** so agents can grep CVA source for authoritative list.

### Who codifies it

- **shadcn/ui** — `shadcn skills` package for agent context.
- **Next.js** — `AGENTS.md` + version-matched docs at `node_modules/next/dist/docs/`.
- **shilp-sutra** — shipped today (v0.38.0).

### Anti-patterns to flag

- Variant names in docs that don't match CVA source (we audit this — `audit-component-docs.mjs --check`)
- AGENTS.md paths that 404 (broken markdown links)
- llms.txt that says "scheduled for removal in 0.X" when 0.X already removed it
- Recipe code samples using removed APIs

---

## How to use this document

Each subsequent audit lens (`01-` through `06-`) cross-references the relevant sections here. Findings cite the specific principle violated.

Severity guideline:

- **P0** — violates a hard guarantee (API contract, type safety, a11y baseline). Blocks 1.0.
- **P1** — violates a stated convention with widespread impact. Should fix before 1.0 freeze.
- **P2** — minor inconsistency. Post-1.0 cleanup.
- **P3** — preference / future-proofing.

This rubric does NOT replace project-specific decisions captured in CLAUDE.md, CONTRIBUTING.md, the public-release roadmap, or the changeset history. Where a project-specific decision contradicts industry default, project wins (e.g., shilp-sutra's `--spacing-ds-*` namespace is intentional collision-avoidance — not a violation).

## Sources

- [Radix Primitives — Introduction](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Radix Primitives — Composition (asChild + Slot)](https://www.radix-ui.com/primitives/docs/guides/composition)
- [Radix Primitives — Slot](https://www.radix-ui.com/primitives/docs/utilities/slot)
- [React Aria / Adobe Spectrum](https://react-spectrum.adobe.com/react-aria/)
- [Compound Pattern — patterns.dev](https://www.patterns.dev/react/compound-pattern/)
- [TkDodo — Building Type-Safe Compound Components](https://tkdodo.eu/blog/building-type-safe-compound-components)
- [CVA — Class Variance Authority](https://cva.style/docs)
- [shadcn/ui CLI v4 changelog (March 2026)](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- [Mantine v7 changelog (CSS-in-JS removal)](https://mantine.dev/changelog/7-0-0/)
- [Spencer Pauly — React naming conventions](https://www.spencerpauly.com/tech/react-naming-conventions-best-practices)
- [Steve Kinney — forwardRef, memo, and displayName](https://stevekinney.com/courses/react-typescript/forwardref-memo-and-displayname)
- [Why design systems live in monorepos](https://dev.to/vineethpawar/why-so-many-design-systems-live-in-monorepo-3e3d)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
