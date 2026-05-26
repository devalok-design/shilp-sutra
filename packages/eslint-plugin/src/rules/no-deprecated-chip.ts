import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'
import { getJSXElementName } from '../util/jsx'

/**
 * `Chip` was removed in v0.32.0. Replace with `Badge` (which accepts
 * `onClick` for interactivity).
 *
 * This rule flags two things:
 *   1. The `<Chip>` JSX element. Autofix: rename to `<Badge>` (preserves
 *      children + attributes).
 *   2. The `import { Chip } from '@devalok/shilp-sutra/...'`. Autofix:
 *      rename the imported specifier to `Badge`.
 */
type MessageIds = 'deprecatedChipImport' | 'deprecatedChipJsx'

const SHILP_SUTRA_SOURCES = new Set([
  '@devalok/shilp-sutra',
  '@devalok/shilp-sutra/ui',
  '@devalok/shilp-sutra/ui/badge',
  '@devalok/shilp-sutra/ui/chip',
])

export default createRule<[], MessageIds>({
  name: 'no-deprecated-chip',
  meta: {
    type: 'problem',
    docs: {
      description:
        '`Chip` was removed in 0.32.0. Use `Badge onClick={...}` instead.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.32.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedChipImport:
        '`Chip` was removed in 0.32.0. Replace with `Badge` from `@devalok/shilp-sutra/ui/badge` (use `onClick` for interactivity).',
      deprecatedChipJsx:
        '`<Chip>` was removed in 0.32.0. Use `<Badge onClick={...}>` instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (!SHILP_SUTRA_SOURCES.has(node.source.value)) return
        for (const spec of node.specifiers) {
          if (spec.type !== AST_NODE_TYPES.ImportSpecifier) continue
          const imported = spec.imported.type === AST_NODE_TYPES.Identifier ? spec.imported.name : spec.imported.value
          if (imported === 'Chip') {
            context.report({
              node: spec,
              messageId: 'deprecatedChipImport',
              fix: (fixer) => fixer.replaceText(spec, 'Badge'),
            })
          }
        }
      },
      JSXOpeningElement(node) {
        if (getJSXElementName(node) !== 'Chip') return
        context.report({
          node: node.name,
          messageId: 'deprecatedChipJsx',
          fix: (fixer) => fixer.replaceText(node.name, 'Badge'),
        })
      },
      JSXClosingElement(node) {
        if (node.name.type !== AST_NODE_TYPES.JSXIdentifier) return
        if (node.name.name !== 'Chip') return
        context.report({
          node: node.name,
          messageId: 'deprecatedChipJsx',
          fix: (fixer) => fixer.replaceText(node.name, 'Badge'),
        })
      },
    }
  },
})
