import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'

/**
 * shilp-sutra's `toast` is sonner-style positional, NOT object-first.
 *
 *   toast.success('Saved')                         ← correct
 *   toast.success({ title: 'Saved' })              ← wrong — surfaced as bug in hiring-platform audit (F-21)
 *   toast({ title, color: 'error' })                ← old useToast() pattern, no longer valid
 *
 * Suggest-only (not autofix) — the rewrite is context-dependent (consumer
 * may have `description`, `duration`, `action` to map). We surface the
 * issue + show the canonical shape; reviewer applies.
 */
type MessageIds = 'objectSyntax' | 'bareCallWithObject'

function isToastIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
  return node.type === AST_NODE_TYPES.Identifier && node.name === 'toast'
}

export default createRule<[], MessageIds>({
  name: 'toast-object-syntax',
  meta: {
    type: 'problem',
    docs: {
      description:
        'shilp-sutra `toast` uses positional sonner syntax: `toast.success(message, options?)`. Object-first calls are likely a leftover from `useToast()` or a Mantine/Chakra muscle-memory.',
      category: 'recommended',
      recommended: 'warn',
      appliesFrom: '0.30.0',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      objectSyntax:
        'shilp-sutra `toast.*` takes a positional message first. Use `toast.success("text", { description, … })` instead of `toast.success({ title, … })`.',
      bareCallWithObject:
        '`toast({ … })` is the old `useToast()` shape. Use the imperative `toast.success(message)` / `toast.error(message)` etc. variants.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee

        // toast({ ... })
        if (
          isToastIdentifier(callee) &&
          node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression
        ) {
          context.report({ node, messageId: 'bareCallWithObject' })
          return
        }

        // toast.success({ ... }) / toast.error({ ... }) / etc.
        if (
          callee.type === AST_NODE_TYPES.MemberExpression &&
          isToastIdentifier(callee.object) &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          /^(success|error|warning|info|loading|message)$/.test(callee.property.name) &&
          node.arguments[0]?.type === AST_NODE_TYPES.ObjectExpression
        ) {
          context.report({ node, messageId: 'objectSyntax' })
        }
      },
    }
  },
})
