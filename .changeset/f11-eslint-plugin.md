---
"@devalok/eslint-plugin-shilp-sutra": minor
---

feat: initial release — 12 ESLint rules for the shilp-sutra design system

New publishable package: `@devalok/eslint-plugin-shilp-sutra@0.1.0`. Catches deprecated APIs, peer-cliff barrel imports, TW3-era class names, and ships autofixes that turn breaking-change migrations into one-command codemods.

## Install

```bash
pnpm add -D @devalok/eslint-plugin-shilp-sutra
```

Then in `eslint.config.ts` (flat config, ESLint 9+):

```ts
import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'
export default [shilpSutra.configs['flat/recommended']]
```

Or `.eslintrc`:

```jsonc
{ "extends": ["plugin:@devalok/shilp-sutra/recommended"] }
```

## 12 rules

10 migration rules (autofix where possible) + 2 advisory rules. Full table in [packages/eslint-plugin/README.md](../packages/eslint-plugin/README.md).

| Rule | Catches | Autofix |
|---|---|---|
| `no-deprecated-button-variant` | `variant="default"`, `variant="destructive"`, `color="default"` (removed 0.32.0) | ✅ |
| `no-deprecated-surface-token` | `bg-surface-1`..`surface-4` numeric aliases (removed 0.23.0) | ✅ |
| `no-deprecated-shadow-token` | `shadow-01`..`shadow-05` numeric aliases (removed 0.23.0) | ✅ |
| `no-deprecated-chip` | `<Chip>` (removed 0.32.0) | ✅ |
| `no-tailwind-config-preset` | JS Tailwind preset (removed 0.38.0) | ❌ |
| `prefer-per-component-import` | Peer-cliff symbols on barrel imports (Toaster, DatePicker, RichTextEditor, etc. — removed from barrel 0.40.0) | ✅ |
| `use-toast-deprecated` | `useToast()` (deprecated 0.30.0) | partial |
| `no-bg-gradient-to` | TW3 `bg-gradient-to-*` (TW4 0.37.0+) | ✅ |
| `no-css-var-bracket` | TW3 `w-[--var]` (TW4 0.37.0+) | ✅ |
| `no-iconbutton-children` | `<IconButton>{...}</IconButton>` (always wrong — type forbids children) | ✅ |
| `no-bare-shadow` | Bare `shadow` class (no shadow in TW4) | ❌ |
| `toast-object-syntax` | `toast.success({title})` (old shape — use positional) | ❌ |

## Three presets

- `recommended` — daily: migration at `error`, advisory at `warn`
- `strict` — every rule at `error`
- `migration` — migration rules only. Use as a one-shot codemod when upgrading the design system: `pnpm eslint --fix --config <flat/migration> src/`

Each preset ships in both flat-config (`flat/recommended`, `flat/strict`, `flat/migration`) and legacy (`recommended`, `strict`, `migration`) shapes.

## Architecture (informed by typescript-eslint + react-hooks + Storybook patterns)

- `@typescript-eslint/utils` `RuleCreator` with type-safe messageIds
- `@typescript-eslint/rule-tester` + Vitest test harness
- 82 inline test cases across 12 rules — all passing
- `tsup` dual ESM+CJS+`.d.ts` build
- `meta.docs.category` (migration / recommended / stylistic) + `meta.docs.appliesFrom` (DS version) on every rule
- Bails silently on dynamic className expressions (`cn(...)`, template literals) — false positives worse than false negatives
- Whole-node `fixer.replaceText` autofixes — never splices

## Peer

`eslint ^8.57.0 || ^9.0.0 || ^10.0.0`. No `@devalok/shilp-sutra` peer (rules work on consumer code regardless of installed DS version).

## What's NOT included

- `forced-toaster-mount` project-wide check — ESLint is per-file; deferred to v0.2.0 if demand surfaces
- Per-rule docs at `docs/rules/*.md` — the README rule table covers v0.1.0 needs; per-rule pages can land later
- A spacing rule (`no-raw-spacing-utility`) — explicitly dropped. `p-N` and `p-ds-N` coexist by design (see MIGRATION.md v0.39.x → spacing namespace coexistence)

## Replaces

- F-23 (TW3 → TW4 codemod CLI) — `no-bg-gradient-to` + `no-css-var-bracket` + `no-tailwind-config-preset` together cover what a standalone codemod would do
- F-22 (runtime Toaster peer warning) — `prefer-per-component-import` catches the cliff at edit time instead

Closes tbf-tracker F-11.
