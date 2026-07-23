import type { TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'

/**
 * `@mutation` — legible deviations. A raw colour literal in a class string
 * (`bg-[#0af]`, `text-[oklch(...)]`, `border-[rgb(...)]`) bypasses the design
 * token system — the classic silent-drift path to slop. Allowed ONLY when the
 * author marks it as a deliberate deviation with a `// @mutation reason: <why>`
 * comment on the same line or the line directly above.
 *
 * v1 targets raw colour literals (zero exist in the DS today, so this only
 * guards the future). The mechanism (annotated deviations) is meant to grow to
 * off-scale spacing, non-token easing, and card borders.
 */

// Raw colour VALUES in a Tailwind arbitrary — hex / rgb / hsl / oklch / oklab.
// NOT `bg-(--token)` shorthand (that's a token, allowed).
const RAW_COLOR =
  /\b(?:bg|text|border|fill|stroke|ring|ring-offset|from|via|to|decoration|outline|caret|accent)-\[(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\()/

type MessageIds = 'unannotated'

export default createRule<[], MessageIds>({
  name: 'require-mutation-annotation',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Raw colour literals in class strings must use a token, or be marked a deliberate deviation with `// @mutation reason: <why>`.',
      category: 'recommended',
      recommended: 'warn',
      appliesFrom: '0.50.0',
    },
    schema: [],
    messages: {
      unannotated:
        'Raw colour `{{token}}` bypasses the token system. Use a semantic colour token, or mark the deviation with `// @mutation reason: <why>` on this line or the line above.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode
    const comments = sourceCode.getAllComments()

    function isAnnotated(node: TSESTree.Node): boolean {
      const line = node.loc.start.line
      return comments.some(
        (c) => /@mutation\b/.test(c.value) && (c.loc.end.line === line || c.loc.end.line === line - 1),
      )
    }

    function check(value: string, node: TSESTree.Node) {
      const m = value.match(RAW_COLOR)
      if (!m) return
      if (isAnnotated(node)) return
      context.report({ node, messageId: 'unannotated', data: { token: m[0] } })
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node.value, node)
      },
      TemplateElement(node) {
        if (node.value.raw) check(node.value.raw, node)
      },
    }
  },
})
