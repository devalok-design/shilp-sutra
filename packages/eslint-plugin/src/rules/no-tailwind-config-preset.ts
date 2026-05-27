import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'

/**
 * v0.38.0 removed the JS Tailwind preset. The new setup is CSS-only:
 *
 *   @import "tailwindcss";
 *   @import "@devalok/shilp-sutra/css";
 *
 * This rule flags two patterns in JS/TS files:
 *   1. `import shilpSutra from '@devalok/shilp-sutra/tailwind'` (and aliases)
 *   2. `presets: [shilpSutra]` or `presets: [require('@devalok/shilp-sutra/tailwind')]`
 *      inside an exported config object.
 *
 * No autofix — the migration is multi-file (tailwind.config.ts is deleted +
 * globals.css gains the @import lines). We point consumers at the recipe.
 */
type MessageIds = 'deprecatedTailwindImport' | 'deprecatedPresetsArray'

export default createRule<[], MessageIds>({
  name: 'no-tailwind-config-preset',
  meta: {
    type: 'problem',
    docs: {
      description:
        'The JS Tailwind preset was removed in 0.38.0. Switch to the CSS-first setup (@import "@devalok/shilp-sutra/css").',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.38.0',
    },
    schema: [],
    messages: {
      deprecatedTailwindImport:
        'The `@devalok/shilp-sutra/tailwind` JS preset export was removed in 0.38.0. Switch to the CSS-first setup — see install-<framework>.md §4.',
      deprecatedPresetsArray:
        '`presets: [shilpSutra]` in tailwind.config.* is no longer supported (0.38.0). Delete tailwind.config.* and use `@import "@devalok/shilp-sutra/css"` in your global CSS instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const SHILP_TAILWIND = /@devalok\/shilp-sutra\/tailwind(\b|$)/

    function checkPresetArray(arr: TSESTree.ArrayExpression) {
      for (const el of arr.elements) {
        if (el == null) continue
        // require('@devalok/shilp-sutra/tailwind')
        if (
          el.type === AST_NODE_TYPES.CallExpression &&
          el.callee.type === AST_NODE_TYPES.Identifier &&
          el.callee.name === 'require' &&
          el.arguments[0]?.type === AST_NODE_TYPES.Literal &&
          typeof el.arguments[0].value === 'string' &&
          SHILP_TAILWIND.test(el.arguments[0].value)
        ) {
          context.report({ node: el, messageId: 'deprecatedPresetsArray' })
        }
        // [shilpSutra] — identifier reference. Best-effort match.
        if (el.type === AST_NODE_TYPES.Identifier && /shilp.?sutra/i.test(el.name)) {
          context.report({ node: el, messageId: 'deprecatedPresetsArray' })
        }
      }
    }

    return {
      ImportDeclaration(node) {
        if (SHILP_TAILWIND.test(node.source.value)) {
          context.report({ node, messageId: 'deprecatedTailwindImport' })
        }
      },
      Property(node) {
        if (
          node.key.type === AST_NODE_TYPES.Identifier &&
          node.key.name === 'presets' &&
          node.value.type === AST_NODE_TYPES.ArrayExpression
        ) {
          checkPresetArray(node.value)
        }
      },
    }
  },
})
