import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'

/**
 * `useToast()` was deprecated in v0.30.0 in favor of the imperative `toast`
 * API. Old:
 *
 *   import { useToast } from '@devalok/shilp-sutra/ui/toast'
 *   const { toast } = useToast()
 *   toast({ title: 'Saved' })
 *
 * New:
 *
 *   import { toast } from '@devalok/shilp-sutra/ui/toast'
 *   toast.success('Saved')
 *
 * This rule flags the import + the call. Autofix removes only the import
 * (call-site rewriting is too brittle — `toast({ variant: 'error', title })`
 * has many shapes; consumers review per-site).
 */
type MessageIds = 'useToastImport' | 'useToastCall'

const SHILP_TOAST_SOURCES = new Set([
  '@devalok/shilp-sutra',
  '@devalok/shilp-sutra/ui',
  '@devalok/shilp-sutra/ui/toast',
])

export default createRule<[], MessageIds>({
  name: 'use-toast-deprecated',
  meta: {
    type: 'problem',
    docs: {
      description:
        'The `useToast()` hook was deprecated in 0.30.0. Use the imperative `toast.success("message")` API instead.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.30.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useToastImport:
        '`useToast` was deprecated in 0.30.0. Import `toast` instead and call `toast.success(message, options)`.',
      useToastCall:
        '`useToast()` is deprecated. Replace `const { toast } = useToast()` with `import { toast } from "@devalok/shilp-sutra/ui/toast"`, then call `toast.success(message)` directly.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        if (!SHILP_TOAST_SOURCES.has(node.source.value)) return
        for (const spec of node.specifiers) {
          if (spec.type !== AST_NODE_TYPES.ImportSpecifier) continue
          const imported = spec.imported.type === AST_NODE_TYPES.Identifier ? spec.imported.name : spec.imported.value
          if (imported === 'useToast') {
            context.report({
              node: spec,
              messageId: 'useToastImport',
              fix: (fixer) => fixer.replaceText(spec, 'toast'),
            })
          }
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === 'useToast'
        ) {
          context.report({ node, messageId: 'useToastCall' })
        }
      },
    }
  },
})
