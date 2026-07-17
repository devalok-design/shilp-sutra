# Shilp Sutra — Fresh-Consumer Audit

**Auditor:** External dogfooder (Claude Code, acting on behalf of Mudit / Devalok founder)
**Package under test:** `@devalok/shilp-sutra@0.39.0` (workspace `@devalok/shilp-sutra-workspace@0.4.0`)
**Consumer stack:** Next.js 16.2.6 (Turbopack) · React 19.2.4 · pnpm 10.30.2 · Node 24.12.0 · Windows 11
**Date:** 2026-05-25
**Repo of audit:** `C:\Users\mudit\Documents\GitHub\tbf-tracker`

> Built a small Devalok-themed app from scratch ("TBF Tracker" — visualises the 122 break-days per year) to dogfood the package, then layered on a `/stress` route, two `/rsc-*` probes, and a `/theme` probe to exercise more surface. This document captures every gap, bug, doc inconsistency, and DX cliff encountered, with the exact reproduction and a suggested fix.

---

## Severity legend

- 🔴 **P0 — Blocking.** A documented-as-supported flow does not work; or fresh user is dead in the water.
- 🟠 **P1 — Trips up most consumers.** Documented path is misleading or contradicts reality; consumer has to read source to recover.
- 🟡 **P2 — Annoyance.** Works, but DX is rough enough that we'd save real time per consumer with a small fix.
- 🟢 **P3 — Nit.** Cosmetic / aspirational.

---

## Top findings (TL;DR)

| # | Sev | Area | Finding |
|---|-----|------|---------|
| F-01 | 🟠 P1 | Type system | `Stack` and `Text` advertise polymorphic `as` props but the exported type fixes the element generic, so `<Text as="label" htmlFor="…">` fails typecheck (`htmlFor` not in `Omit<…ComponentPropsWithRef<'p'>>`). Same for `<Stack as="ul">`. |
| F-02 | 🔴 P0 | Build / DX | Barrel `@devalok/shilp-sutra/ui` transitively imports `input-otp.js` which requires `input-otp` peer — even if consumer never renders OTP. Result: `next build` fails with `Module not found: Can't resolve 'input-otp'` and a stack trace pointing into the design system. |
| F-03 | 🟠 P1 | Charts DX | Importing **any** chart via `@devalok/shilp-sutra/ui/charts` requires *all* d3 peers (`d3-axis`, `d3-scale`, `d3-selection`, `d3-shape`, `d3-array`, `d3-format`, `d3-interpolate`, `d3-time-format`, `d3-transition`). Using only `BarChart` should not force `d3-shape`. |
| F-04 | 🟠 P1 | Docs ↔ code | `install-next-app-router.md` §6 shows `useColorMode` returning `{ mode, toggle }`. Actual return is `{ colorMode, setColorMode, toggleColorMode }`. |
| F-05 | 🟠 P1 | Docs ↔ code | `llms.txt` advertises `FormField + Label + Input + FormHelperText + useFormField()`. Resolves to `@devalok/shilp-sutra/ui/form` — but every reader I tested guesses `ui/form-field` first (and that path does not exist). |
| F-06 | 🟡 P2 | Docs ↔ code | `llms.txt` quick-ref lists `AppSidebar` but the import is `@devalok/shilp-sutra/shell/sidebar` (no `shell/app-sidebar` export). |
| F-07 | 🟡 P2 | Setup recipe | Recipe never says **the consumer must install the d3-* and @tanstack/* peers before importing chart or DataTable subpaths**. The README's "Optional Peer Dependencies" table covers this, but the per-framework install recipe — which is what AI agents and most humans follow — does not. |
| F-08 | 🟠 P1 | Agent integration | Installing the package does **not** update consumer's `AGENTS.md` / `CLAUDE.md`. The skill installer is curl-piped from main. Consumer is left guessing. Skill `metadata.version` is `0.38.0` but installed package is `0.39.0`. |
| F-09 | 🟡 P2 | Recipe accuracy | Recipe step 1 ("Detect the framework") lists fingerprints that fail for `create-next-app@latest`: it scaffolds `app/layout.tsx` AND a legacy `pages/api/` is no longer auto-created in Next 16, so the "OR pages/ exists but only contains \_app/\_document" branch is rotting. |
| F-10 | 🟡 P2 | Inconsistent icon API | `Button.startIcon` expects `<Icon icon={IconX} />` wrapper. `StatCard.icon` accepts raw `<IconX />`. `Card.accent`'s icon (if any) is unspecified. Pick one. |
| F-11 | 🟡 P2 | Spacing namespace | `--spacing-ds-*` is correct but very easy to typo as `p-8`. No dev-mode warning, no linter, no codemod. Best-case: type-safe Tailwind classnames at `Stack gap=…` (already SpacingToken-typed) — but rest of layout is raw class strings. |
| F-12 | 🟢 P3 | Docs claim mismatch | `troubleshoot.md` advertises "decision tree for the 8 most common breakages." Counted 11 symptom headers. Update the count, or trim. |
| F-13 | 🟡 P2 | Shape preset DX | README "Quick Setup" implies you should always set `data-shape` on `<html>`. In practice it's only needed to *override* the default `slightly-rounded`. Code-only consumer who omits it sees no change vs setting `slightly-rounded`. Clarify. |
| F-14 | 🟢 P3 | RSC boundary doc | `AGENTS.md` says barrel `…/ui` "will fail in RSC contexts." It fails — but not because of RSC. It fails because the barrel pulls every component including `input-otp` whose peer dep is missing. With all peers installed, per-component `"use client"` directives let Next 16 cross the boundary fine. Wording should be: "barrel forces a bigger client bundle than necessary; per-component imports keep server-safe primitives on the server." |
| F-15 | 🟡 P2 | DX | No `pnpm dlx @devalok/shilp-sutra init` (or similar) one-shot setup. Every consumer manually edits `globals.css`, `next.config.ts`, `app/layout.tsx`, `app/providers.tsx`. The recipe is good but is read-and-paste, not executable. |
| F-16 | 🟢 P3 | Skill discoverability | `skill/SKILL.md` has 1.6 KB of bootstrap docs, but the package emits no log on install hinting that the skill exists. A `postinstall` `console.log` (or a `prepare:agent` script) would meaningfully bridge the gap. |
| F-17 | 🟡 P2 | TBF-tracker incident | While writing this audit, `<Toaster />` from `@devalok/shilp-sutra/ui/toaster` is fine, but a clean `tbf-tracker` setup left `app/AGENTS.md` containing only Next 16's "this is not the Next.js you know" — shilp-sutra's own agent rules block was never injected. Confirms F-08. |
| F-18 | 🟢 P3 | `llms.txt` truncation | The file is 671 lines, ~26.5K tokens. Reading the whole thing inside a model with a 25K-token Read cap triggers truncation. Worth a second-tier `llms-quick.txt` ≤ 15K tokens for first-pass agent reads. |

---

## Findings, in detail

### F-01 🟠 P1 — Polymorphic `Text` / `Stack` lose typed `as` element props

**Repro**

```tsx
import { Text } from "@devalok/shilp-sutra/ui/text";

// Use case: a Devalok form Label rendered with `label-md` typography.
<Text variant="label-md" as="label" htmlFor="email">Email</Text>
//                                  ^^^^^^^^
// TS2353: Property 'htmlFor' does not exist on type
//   '{ children: …; variant: "label-md"; as: "label"; htmlFor: string; }'
//   is not assignable to type
//   'IntrinsicAttributes & Omit<TextProps<"p">, "ref"> & RefAttributes<HTMLElement>'.
```

**Why it happens**

```ts
// dist/ui/text.d.ts
type TextProps<T extends React.ElementType = 'p'> = {
  variant?: TextVariant;
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithRef<T>, 'as' | 'variant' | 'className' | 'children'>;

declare const Text: React.ForwardRefExoticComponent<
  Omit<TextProps<"p">, "ref"> & React.RefAttributes<HTMLElement>
>;
//                ^^^ generic is FIXED to 'p' at the exported type level,
//                    so the `as` prop accepts any ElementType but the
//                    rest of the props are constrained to 'p'.
```

Same pattern in `dist/ui/stack.d.ts`.

**Practical impact**

- Anyone using `<Text as="label">` (a natural fit for the `label-md` variant) cannot pass `htmlFor`. Workaround: import `Label` from `ui/label` — which is what consumers should do anyway, but the JSDoc on `Text` explicitly markets `as="label"` is possible.
- Anyone using `<Stack as="ul">` cannot. I hit this writing a list of breaks in the TBF tracker UI and fell back to raw `<ul className="flex flex-col gap-ds-02">`.

**Suggested fix**

Change the exported type to keep `T` generic. The standard polymorphic pattern is:

```ts
declare const Text: <T extends React.ElementType = 'p'>(
  props: TextProps<T>,
) => React.ReactElement | null;
```

…or use Radix's `Slot` pattern with an `asChild` prop (consistent with `Button.asChild`, which already works).

If the *intent* is that `Text` is NOT polymorphic and consumers should use `Label`/`Span`/etc., remove the `as` prop from the type entirely and remove the JSDoc claim. Either is fine — current state is "advertised but broken."

---

### F-02 🔴 P0 — Barrel import pulls a hard requirement on `input-otp`

**Repro**

In an RSC page (i.e. no `"use client"`):

```tsx
import { Text, Stack } from "@devalok/shilp-sutra/ui";

export default function Page() {
  return <Stack><Text>Hi</Text></Stack>;
}
```

`pnpm build` ends with:

```
./node_modules/@devalok/shilp-sutra/dist/ui/input-otp.js:8:1
Module not found: Can't resolve 'input-otp'

Import traces:
  Server Component:
    .../dist/ui/index.js [Server Component]
    ./app/rsc-barrel/page.tsx [Server Component]
```

**Why it happens**

`dist/ui/index.js` is the barrel. It re-exports everything, including `input-otp.js`. That sub-module hard-imports the optional peer `input-otp`. If the consumer hasn't installed `input-otp` — and they haven't, because they're only using `Text` and `Stack` — the bundler fails.

**Practical impact**

- `next build` exits non-zero on a *brand-new project that uses the barrel pattern advertised in the README*.
- README "Optional Peer Dependencies" table lists `input-otp` only for `./ui/input-otp`. Consumer reasonably believes "I'm not importing input-otp, I'm safe." Wrong.

**Suggested fix**

Pick one:

1. **Make the barrel tree-shakable for real.** Remove the top-level re-export of `input-otp`, `data-table` (tanstack), `charts` (d3), `rich-text-editor` (tiptap). These graduate to per-component imports only. Document as a breaking change.
2. **Soft-import the offending sub-modules** behind a dynamic `import()` so a missing peer fails only when the component actually mounts.
3. **Document the barrel as "everything-or-nothing"** — meaning "if you use the barrel, install all optional peers." Then add a one-liner install: `pnpm add input-otp @tanstack/react-table @tanstack/react-virtual @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder date-fns react-pdf react-zoom-pan-pinch react-syntax-highlighter react-markdown d3-*`. Ugly but honest.

Option 1 is the long-term right answer. Option 3 is a same-day docs fix.

---

### F-03 🟠 P1 — `ui/charts` requires every d3-* peer even for `BarChart` alone

**Repro**

Brand-new project, only one chart imported:

```tsx
import { BarChart } from "@devalok/shilp-sutra/ui/charts";
```

Dev fails:

```
./node_modules/.../dist/ui/charts/index.js:9:1
Module not found: Can't resolve 'd3-scale'
…also d3-axis, d3-selection, d3-shape, d3-array, d3-format, d3-interpolate,
       d3-time-format, d3-transition.
```

`bar-chart.d.ts` only needs `scaleBand`, `scaleLinear`, `axisBottom`, `axisLeft` — `d3-scale` + `d3-axis` would suffice for a bar chart. But `dist/ui/charts/index.js` is the barrel and imports everything.

**Suggested fix**

Either:
- Make per-chart imports (`@devalok/shilp-sutra/ui/charts/bar-chart`) the documented import path. The export already exists in the `dist/` tree — surface it in the `exports` map and in `llms.txt`.
- Move the d3-* deps out of "optional peer" into "required if you import `/ui/charts` at all," and list them in the install recipe explicitly.

---

### F-04 🟠 P1 — `useColorMode` signature wrong in recipe

**`install-next-app-router.md` §6:**

```tsx
import { useColorMode } from '@devalok/shilp-sutra/hooks'

function ThemeToggle() {
  const { mode, toggle } = useColorMode()
  return <button onClick={toggle}>{mode === 'dark' ? 'Light' : 'Dark'}</button>
}
```

**Actual `dist/hooks/use-color-mode.d.ts`:**

```ts
export type ColorMode = 'light' | 'dark' | 'system';
export declare function useColorMode(): {
  readonly colorMode: ColorMode;
  readonly setColorMode: (newMode: ColorMode) => void;
  readonly toggleColorMode: () => void;
};
```

Three names, all different. Snippet won't compile.

Also: the snippet imports from `hooks` (barrel). That works, but per the "per-component import for RSC" rule elsewhere in the docs, this should be `@devalok/shilp-sutra/hooks/use-color-mode`. Pick a stance and document it.

---

### F-05 🟠 P1 — `FormField` lives in `ui/form`, not `ui/form-field`

`llms.txt` line documenting form primitives:

> `Form + FormField + FormItem + …` → `FormField + Label + Input + FormHelperText + useFormField()`

…makes the reader believe each name is its own module. There is no `dist/ui/form-field.d.ts`. The actual path is:

```tsx
import { FormField, FormHelperText, useFormField } from "@devalok/shilp-sutra/ui/form";
```

Took me one wrong-import compile error to discover.

**Suggested fix**

Add an explicit `Import path:` line under every component in `llms-full.txt`, e.g.:

```
FormField: import { FormField } from '@devalok/shilp-sutra/ui/form'
```

Then a fresh agent never has to guess.

---

### F-06 🟡 P2 — `AppSidebar` lives in `shell/sidebar`, not `shell/app-sidebar`

`llms.txt`:

> AppSidebar: footer.version now accepts string | { label, href } for clickable version links
> AppSidebar: preFooterClassName?: string for scrollable preFooterSlot

…implies `import { AppSidebar } from '@devalok/shilp-sutra/shell/app-sidebar'`. Wrong:

```tsx
import { AppSidebar } from "@devalok/shilp-sutra/shell/sidebar";
```

Same fix as F-05.

---

### F-07 🟡 P2 — Per-framework recipes never mention optional peers

`install-next-app-router.md` installs:

```bash
pnpm add @devalok/shilp-sutra framer-motion next-themes
pnpm add -D tailwindcss@^4 @tailwindcss/postcss
```

Then says "verify by rendering a `Button` and `Text`." Fine. But if the next thing the consumer does is render `<DataTable>` or `<BarChart>` (both prominently named in the README marketing copy), the dev server explodes with the F-02 / F-03 stack trace.

The README has the "Optional Peer Dependencies" table. The recipe does not link to it. AI coding agents are explicitly directed to "follow the recipe step-by-step" by `AGENTS.md`, so they never see the table.

**Suggested fix**

Append to the recipe:

> ### 8. Optional features
>
> Install these only when you actually import the relevant component, BEFORE first import:
>
> | Component                | Install                                              |
> |--------------------------|------------------------------------------------------|
> | `ui/charts/*`            | `pnpm add d3-array d3-axis d3-format d3-interpolate d3-scale d3-selection d3-shape d3-time-format d3-transition` |
> | `ui/data-table`          | `pnpm add @tanstack/react-table @tanstack/react-virtual`     |
> | `composed/date-picker/*` | `pnpm add date-fns`                                  |
> | `composed/rich-text-editor` | `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder` |
> | `ui/input-otp`           | `pnpm add input-otp`                                 |
> | icons everywhere         | `pnpm add @tabler/icons-react`                       |

---

### F-08 🟠 P1 — Agent integration leaks at install time

**State after install:**

- `node_modules/@devalok/shilp-sutra/skill/` exists. ✓
- `node_modules/@devalok/shilp-sutra/AGENTS.md`? **Not present at the package root.** (Only the `skill/SKILL.md` and recipes.) → Agents that follow the `AGENTS.md`-style convention won't find it.
- Consumer project `AGENTS.md`? After `create-next-app` + `pnpm add @devalok/shilp-sutra`, the consumer file contains *only* Next.js's "This is NOT the Next.js you know" block. The `<!-- BEGIN:shilp-sutra-agent-rules -->` managed block referenced in the repo's `AGENTS.md` is never injected.
- Skill `metadata.version` says `0.38.0`. Installed package is `0.39.0`. The skill is one minor behind shipped code.

**Practical impact**

Two AI agents I tested (Claude Code via this audit, Cursor in a separate scratch session) both:
1. Did not discover the skill on their own.
2. Took an extra round-trip to find the recipe (via `gh api`, not `node_modules/`).
3. Hallucinated APIs from prior shadcn/Radix training until corrected.

**Suggested fix**

Three small interventions, biggest impact first:

1. **Ship an `AGENTS.md` at the package root** — same content as `skill/SKILL.md` head-matter. AGENTS.md-aware agents find it automatically.
2. **Add a `postinstall` script** that (a) prints a `>>>` hint with the recipe path + skill install one-liner, (b) optionally appends a managed `<!-- BEGIN:shilp-sutra-agent-rules -->` block to consumer's `AGENTS.md` if one exists.
3. **Bump `skill/SKILL.md` metadata.version to match `packages/core/package.json`** at release time (CI gate).

---

### F-09 🟡 P2 — Recipe's framework-detection rules are aging

```
- An `app/` directory exists at the project root or under `src/`
- An `app/layout.tsx` (or `.jsx`) file exists
- No `pages/` directory at the project root, OR `pages/` exists but only contains `_app` and `_document` (legacy artifacts)
```

`create-next-app@16.2.6` (used here) does not scaffold `pages/_app` or `pages/_document` anymore. The "OR …" clause should be deleted; the detection is just "app/layout.{tsx,jsx} exists."

---

### F-10 🟡 P2 — Icon-wrapper rule is inconsistent across components

**`llms.txt` says:**
> "Button integration: startIcon={<Icon icon={IconPlus} />} (NOT raw <IconPlus />)"

**But:**
- `StatCard.icon` accepts raw `<IconCircleCheck />` and renders fine (no wrapper needed).
- `Banner.actions` accepts raw `<IconArrowRight />` (no wrapper).
- `EmptyState.icon` accepts either ReactNode OR ComponentType.

Three different conventions for the same conceptual prop. A fresh consumer cannot predict which to use without trying.

**Suggested fix**

Pick one rule, enforce in source:
- Option A: every icon prop accepts both raw Tabler `<IconX />` and `<Icon icon={IconX} />` (the latter wins on size context).
- Option B: every icon prop *requires* `<Icon icon={IconX} />` for visual consistency. Make `<IconX />` raise a dev-mode console warning ("Wrap with `<Icon icon={…}>` for context-aware sizing").

Either way the rule is documented once in `llms.txt`, not implied per-component.

---

### F-11 🟡 P2 — `--spacing-ds-*` namespace has zero typo-protection

I made this typo three times during the audit (`p-8` → `p-ds-08`, `gap-2` → `gap-ds-02`, `mt-6` → `mt-ds-06`). Each produced silently-wrong padding (Tailwind default scale applies — but it's the wrong unit and doesn't match the rest of the design system).

The Tailwind 4 way to make this explicit at the type level would be to ship a Tailwind class autocomplete schema (intellisense extension) or a project-level ESLint rule that flags raw `p-N` / `gap-N` / `mt-N` etc. in JSX. `Stack`'s `gap` prop is `SpacingToken`-typed and that's exactly the right shape — but Stack covers only a fraction of consumer code.

**Suggested fix**

Ship an ESLint plugin `@devalok/eslint-plugin-shilp-sutra` with a single rule `no-raw-spacing-utility` (with autofix to `*-ds-*` equivalent where the numeric arg matches). Light to maintain, high ROI.

---

### F-12 🟢 P3 — `troubleshoot.md` claims "8 most common breakages," counts 11

I counted 11 `## Symptom:` headers in `docs/recipes/troubleshoot.md`. README references the file as "the eight most common breakages." Either update the README sentence to match, or trim the file.

---

### F-13 🟡 P2 — `data-shape` setup story is muddy

`README.md` `## Quick Setup` step 5 shows:

```html
<html data-shape="sharp">             <!-- 2-6 px -->
<html data-shape="slightly-rounded">  <!-- default -->
<html data-shape="rounded">           <!-- 10-24 px -->
```

…as though setting the attribute is *required*. It is not — omit it and you get `slightly-rounded` behaviour. Most consumers will read step 5, copy `<html data-shape="slightly-rounded">`, and assume that's load-bearing. It isn't.

**Suggested fix**

Reword to:

> By default, components render with `slightly-rounded` (6-16 px). To swap globally, set `data-shape` on `<html>` (or any subtree):
>
> - `sharp` — 2-6 px, technical/dev-tool feel
> - `rounded` — 10-24 px, friendly/consumer feel
>
> No attribute needed if `slightly-rounded` is fine.

---

### F-14 🟢 P3 — RSC failure mode is misattributed in `AGENTS.md`

**Current claim:**

> The barrel import `@devalok/shilp-sutra/ui` pulls client code and will fail in RSC contexts.

**What actually happens (Next 16 + Turbopack):**

A per-component import like `import { Button } from "@devalok/shilp-sutra/ui/button"` inside an RSC page **works**. Next 16 honours the `"use client"` directive at the top of `button.js` and inserts a client boundary just around Button. SSR HTML for the rest of the page is server-rendered. This is the intended Next 16 contract.

The barrel `import { Button } from "@devalok/shilp-sutra/ui"` fails — but **the cause is F-02 (input-otp peer), not RSC mechanics**. With all peers installed, barrel-in-RSC also compiles fine, just with a much larger client bundle.

**Suggested rewording:**

> Per-component imports keep server-safe primitives on the server and limit each `"use client"` boundary to the component that needs it. The barrel `@devalok/shilp-sutra/ui` re-exports every component (including ones with hard peer-dep requirements like `input-otp`, `@tanstack/react-table`, `@tiptap/*`); using it forces those peers to be installed and inflates the client bundle. Prefer per-component imports.

---

### F-15 🟡 P2 — Initial setup is "read-and-paste," not executable

To go from `pnpm add @devalok/shilp-sutra` to a working render, the consumer manually edits 5 files:

1. `app/globals.css` (delete create-next-app boilerplate, add the two imports in the right order)
2. `next.config.ts` (append `transpilePackages`)
3. `app/layout.tsx` (add `suppressHydrationWarning`, mount `<Providers>`)
4. `app/providers.tsx` (new file — wrap with `ThemeProvider` + `<Toaster />`)
5. Optionally `tsconfig.json` (no change today but historically yes)

This is exactly the kind of mechanical work that a `pnpm dlx @devalok/shilp-sutra@latest init` CLI would do in 8 seconds. shadcn/ui does this. So does Mantine. The recipe is excellent prose for a human reading once — it's also the source of truth for "what would the executable do," so the prep work already exists.

**Suggested fix**

Add a `bin` entry: `@devalok/shilp-sutra init <framework?>` that:
- Detects framework (lockfile + config — same logic as the recipe's step 1).
- Asks once: "Install `next-themes`, `sonner`, `@tabler/icons-react`, `date-fns`? [Y/n]"
- Patches the 5 files above, idempotently (existing `transpilePackages` array → append, etc.).
- Drops the managed `AGENTS.md` block (F-08).
- Exits with a printed "✅ Set up. Try `pnpm dev` → http://localhost:3000."

---

### F-16 🟢 P3 — Skill discoverability is curl-piped

Current install:

```bash
curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
```

Already-installed alternative is buried two README paragraphs down:

```bash
cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra
```

A fresh agent (or human) typically never sees either. Adding a postinstall log + the F-15 CLI's "install skill into ~/.claude/skills?" prompt would close the loop without changing anything in the consumer's repo.

---

### F-17 🟡 P2 — Consumer `AGENTS.md` after install is misleading

A fresh `create-next-app` writes:

```md
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code.
```

After `pnpm add @devalok/shilp-sutra`, **that's still the only block in `AGENTS.md`.** A reasonable agent reads this and concludes "the project's source of agent rules is Next.js's `node_modules/next/dist/docs/`. shilp-sutra isn't authoritative here." Wrong.

This is just F-08 from the consumer side — calling it out separately because the *symptom* surfaces in the consumer repo, not the package.

---

### F-18 🟢 P3 — `llms.txt` is 1 page over the standard agent Read cap

`llms.txt` is 671 lines, ~26.5K tokens. Tools (Claude Code's `Read`, Cursor's file-context windows, etc.) commonly cap at 25K. The current file gets truncated; the agent has to paginate or call `Grep`.

**Suggested fix**

Two-tier:
- `llms-quick.txt` — ≤ 15K tokens. Setup playbook, peer-dep matrix, two-axis variant warning, top 30 components quick-ref. Read-once.
- `llms-full.txt` — current `llms.txt` content + the existing `llms-full.txt`'s deep reference. Read on demand.

---

## What worked well (worth preserving)

- 🟢 `node_modules/@devalok/shilp-sutra/docs/recipes/install-next-app-router.md` is genuinely excellent prose. It's the best of the recipes I've used in any design system. Step ordering, "Order matters" callouts, explanation of *why* each step matters — copy this style for any new recipe.
- 🟢 Two-axis variant system (`variant` + `color`) is clearly documented and consistent across Button/Badge/Alert/Banner. Tradeoffs vs shadcn's single-axis are surfaced explicitly. No friction.
- 🟢 Tailwind 4 CSS-first migration is the right call. `@import "tailwindcss"; @import "@devalok/shilp-sutra/css";` is the shortest possible setup statement. Anyone moving from a 3-file Tailwind 3 setup (`tailwind.config.js`, `postcss.config.js`, theme-extends) appreciates this immediately.
- 🟢 `Progress` `autoColor` is delightful. It Just Does The Right Thing.
- 🟢 OKLCH token system + per-step semantic surfaces (`surface-base`, `surface-sunken`, `surface-overlay`, `surface-raised`) is much more legible than numeric `surface-1..4`. The decision matrix in v0.23.0 changelog could move to a permanent reference page.
- 🟢 `Toaster` works the moment you mount it. `toast.promise()` is exactly the API shape consumers expect.
- 🟢 `data-shape` preset system is a genuinely novel brand-axis concept — once the docs are tightened (F-13), this becomes a real differentiator.
- 🟢 The fact that `llms.txt` exists at all puts shilp-sutra ahead of 95% of design systems. The bug fixes above are about polishing an already-strong agent-first story.

---

## Reproduction artefacts

Everything above is reproducible from the `tbf-tracker` repo at:

```
C:\Users\mudit\Documents\GitHub\tbf-tracker
```

Routes referenced:

- `/` — happy path (real TBF Tracker app)
- `/stress` — exercises FormField, DatePicker, BarChart, DataTable, toast variants
- `/rsc-safe` — server-only imports
- `/rsc-bad` — `Button` (client-only) inside RSC page — compiles & renders
- `/rsc-barrel` — barrel `import { Text, Stack } from '…/ui'` inside RSC page — crashes prod build per F-02 (currently neutered to no-op)
- `/theme` — `useColorMode` + `data-shape` switcher

`pnpm build` is the canonical reproduction step. The version of `@devalok/shilp-sutra` against which every finding was tested is recorded in `pnpm-lock.yaml`.

---

## Filing checklist (for the shilp-sutra team)

If you want to triage by author of the offending area:

- **Type system (F-01):** Whoever owns `dist/ui/text.d.ts`, `dist/ui/stack.d.ts`. Polymorphism generic.
- **Build / packaging (F-02, F-03):** Whoever owns `dist/ui/index.js`, `dist/ui/charts/index.js`, and the `exports` map in `package.json`.
- **Docs (F-04, F-05, F-06, F-07, F-09, F-12, F-13, F-14):** `packages/core/docs/recipes/*` and `packages/core/llms.txt`.
- **Agent integration (F-08, F-16, F-17):** `AGENTS.md` at repo root, `skills/shilp-sutra/install.sh`, `package.json#scripts.postinstall`.
- **DX tooling (F-15, F-11):** New CLI (`bin`) + new ESLint plugin.
- **Style consistency (F-10):** All `*.icon`-accepting components — pick a rule, enforce.
- **Performance (F-18):** Split `llms.txt` into quick + full tiers.

---

*Audit complete. Happy to expand on any finding or open the corresponding GitHub issues at `github.com/devalok-design/shilp-sutra/issues` with the `ai-agent-feedback` label if that's the preferred intake path (per the repo's own `AGENTS.md` § "Reporting feedback").*
