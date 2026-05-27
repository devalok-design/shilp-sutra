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
 * v0.23.0 renamed numeric shadow aliases:
 *   shadow-01 → shadow-raised
 *   shadow-02 → shadow-raised-hover
 *   shadow-03 → shadow-floating
 *   shadow-04 → shadow-overlay
 *   shadow-05 — removed entirely. Surface as error with no autofix.
 */
const SHADOW_MAP: Record<string, string | null> = {
  '01': 'raised',
  '02': 'raised-hover',
  '03': 'floating',
  '04': 'overlay',
  '05': null,
}

function rewriteToken(token: string): string | null {
  const match = token.match(/^(-?)((?:hover|focus|active|disabled|group-hover|dark):)*shadow-(\d{2})$/)
  if (!match) return null
  const [, negative, modifiers, num] = match
  if (!num) return null
  const replacement = SHADOW_MAP[num]
  if (replacement === null) return null // removed — flag but don't autofix
  if (replacement === undefined) return null
  return `${negative ?? ''}${modifiers ?? ''}shadow-${replacement}`
}

type MessageIds = 'deprecatedShadowToken' | 'removedShadow05'

export default createRule<[], MessageIds>({
  name: 'no-deprecated-shadow-token',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Replace numeric shadow aliases (shadow-01..04) with their semantic v0.23.0 successors. shadow-05 was removed entirely.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.23.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedShadowToken:
        'Numeric `shadow-*` aliases were renamed in 0.23.0. Use the semantic name.',
      removedShadow05:
        '`shadow-05` was removed entirely in 0.23.0 (was unused). Drop it or pick `shadow-overlay` if a top-tier shadow is wanted.',
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

        // Detect shadow-05 separately — non-autofixable
        const hasShadow05 = tokenized.tokens.some((t) => /shadow-05$/.test(t))
        if (hasShadow05) {
          context.report({ node: literal, messageId: 'removedShadow05' })
        }

        const rewritten = rewriteClassName(tokenized, rewriteToken)
        if (!rewritten) return

        context.report({
          node: literal,
          messageId: 'deprecatedShadowToken',
          fix: (fixer) => fixer.replaceText(literal, quoteClassName(literal, renderClassName(rewritten))),
        })
      },
    }
  },
})
