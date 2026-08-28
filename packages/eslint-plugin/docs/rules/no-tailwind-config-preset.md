# `no-tailwind-config-preset`

The JS Tailwind preset was removed in 0.38.0. Switch to the CSS-first setup (@import "@devalok/shilp-sutra/css").

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | no |
| Applies from | `0.38.0` |

## Why

v0.38.0 removed the JS Tailwind preset. The new setup is CSS-only:

  @import "tailwindcss";
  @import "@devalok/shilp-sutra/css";

This rule flags two patterns in JS/TS files:
  1. `import shilpSutra from '@devalok/shilp-sutra/tailwind'` (and aliases)
  2. `presets: [shilpSutra]` or `presets: [require('@devalok/shilp-sutra/tailwind')]`
     inside an exported config object.

No autofix — the migration is multi-file (tailwind.config.ts is deleted +
globals.css gains the @import lines). We point consumers at the recipe.

## What it reports

**`deprecatedTailwindImport`**

> The `@devalok/shilp-sutra/tailwind` JS preset export was removed in 0.38.0. Switch to the CSS-first setup — see install-<framework>.md §4.

**`deprecatedPresetsArray`**

> `presets: [shilpSutra]` in tailwind.config.* is no longer supported (0.38.0). Delete tailwind.config.* and use `@import "@devalok/shilp-sutra/css"` in your global CSS instead.

## Configuration

```js
// eslint.config.js — flat config
import shilpSutra from '@devalok/eslint-plugin-shilp-sutra'

export default [
  shilpSutra.configs['flat-recommended'],
]
```

Or enable just this rule:

```js
{
  plugins: { 'shilp-sutra': shilpSutra },
  rules: { 'shilp-sutra/no-tailwind-config-preset': 'error' },
}
```

---

<sub>Generated from `src/rules/no-tailwind-config-preset.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
