# `no-iconbutton-children`

IconButton requires the icon via the `icon` prop, not children. The type explicitly omits children.

| | |
|---|---|
| Type | `problem` |
| Category | `migration` |
| Presets | `migration`, `recommended` (error), `strict` (error) |
| Fixable | yes (`code`) |
| Applies from | `0.1.0` |

## Why

`IconButton` rejects `children` by design — the icon goes through the
`icon` prop. Wrong:

  <IconButton><Icon icon={IconArrowRight} /></IconButton>   // TS error

Right:

  <IconButton icon={<Icon icon={IconArrowRight} />} aria-label="Submit" />

This rule autofixes the children form when `icon` is not already set.
Source: hiring-platform audit (F-20).

## What it reports

**`iconButtonChildren`**

> `<IconButton>` does not accept children. Pass the icon via `icon={...}` instead.

**`iconButtonChildrenWithIcon`**

> `<IconButton>` does not accept children. The `icon` prop is already set — drop the children.

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
  rules: { 'shilp-sutra/no-iconbutton-children': 'error' },
}
```

---

<sub>Generated from `src/rules/no-iconbutton-children.ts` by `scripts/generate-rule-docs.mjs`. Edit the rule's metadata, not this file.</sub>
