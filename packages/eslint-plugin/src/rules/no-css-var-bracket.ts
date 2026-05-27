import { findJSXAttribute, getJSXElementName } from '../util/jsx'
import {
  getLiteralClassNameNode,
  quoteClassName,
  renderClassName,
  rewriteClassName,
  tokenizeClassName,
} from '../util/classnames'
import { createRule } from '../util/create-rule'

/**
 * TW4 changed the CSS variable arbitrary-value syntax: `w-[--var]` → `w-(--var)`.
 * Applies to every utility that accepts an arbitrary value (w-, h-, p-, m-, gap-, etc.).
 */
function rewriteToken(token: string): string | null {
  // Match any utility with `[--<varname>]` as the arbitrary value.
  // Capture: prefix incl. dash, the variable expression, and optional state modifier.
  const match = token.match(/^([a-z-]+\[)(--[a-zA-Z0-9_-]+)(\])$/)
  if (!match) return null
  const [, prefix, varExpr] = match
  if (!prefix || !varExpr) return null
  // prefix ends with `[` — strip it, build `(--var)` instead
  return prefix.slice(0, -1) + '(' + varExpr + ')'
}

type MessageIds = 'tw3VarBracket'

export default createRule<[], MessageIds>({
  name: 'no-css-var-bracket',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Replace TW3-era `w-[--var]` arbitrary-value syntax with TW4 `w-(--var)`.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.37.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      tw3VarBracket:
        'TW4 (shilp-sutra 0.37+) replaced `utility-[--var]` with `utility-(--var)`.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = getJSXElementName(node)
        if (!name) return
        const className = findJSXAttribute(node, 'className')
        if (!className) return
        const literal = getLiteralClassNameNode(className)
        if (!literal || typeof literal.value !== 'string') return

        const tokenized = tokenizeClassName(literal.value)
        const rewritten = rewriteClassName(tokenized, rewriteToken)
        if (!rewritten) return

        context.report({
          node: literal,
          messageId: 'tw3VarBracket',
          fix: (fixer) => fixer.replaceText(literal, quoteClassName(literal, renderClassName(rewritten))),
        })
      },
    }
  },
})
