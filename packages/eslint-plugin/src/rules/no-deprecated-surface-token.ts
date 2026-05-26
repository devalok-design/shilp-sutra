import { findJSXAttribute, getJSXElementName } from '../util/jsx'
import {
  getLiteralClassNameNode,
  getQuoteChar,
  quoteClassName,
  renderClassName,
  rewriteClassName,
  tokenizeClassName,
} from '../util/classnames'
import { createRule } from '../util/create-rule'

/**
 * v0.23.0 renamed numeric surface aliases to semantic names. This rule
 * catches both `bg-surface-1` / `border-surface-2` / `text-surface-3` /
 * etc. across all utility prefixes that map to the surface token namespace.
 *
 * `bg-surface-1` → `bg-surface-base` (page bg) — see MIGRATION.md v0.23.0
 *                  table; we pick `surface-base` as the closest semantic
 *                  match for `surface-1` (the original "page background"
 *                  alias). Consumers wanting other semantics review the
 *                  fix and adjust per-site.
 */
const SURFACE_MAP: Record<string, string> = {
  '1': 'base',
  '2': 'raised',
  '3': 'raised-hover',
  '4': 'raised-active',
}

const PREFIXES = ['bg', 'border', 'text', 'ring', 'outline', 'divide', 'fill', 'stroke']

function rewriteToken(token: string): string | null {
  // Match `<prefix>-surface-<n>` exactly. Skip already-semantic tokens like
  // `bg-surface-base`, `bg-surface-overlay`, etc.
  const match = token.match(/^(-?)((?:hover|focus|active|disabled|group-hover|dark):)*([a-z]+)-surface-(\d)$/)
  if (!match) return null
  const [, negative, modifiers, prefix, num] = match
  if (!prefix || !num || !PREFIXES.includes(prefix)) return null
  const replacement = SURFACE_MAP[num]
  if (!replacement) return null
  return `${negative ?? ''}${modifiers ?? ''}${prefix}-surface-${replacement}`
}

type MessageIds = 'deprecatedSurfaceToken'

export default createRule<[], MessageIds>({
  name: 'no-deprecated-surface-token',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Replace numeric surface aliases (bg-surface-1, border-surface-2, …) with their semantic v0.23.0 successors (surface-base, surface-raised, surface-raised-hover, surface-raised-active).',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.23.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedSurfaceToken:
        'Numeric `surface-*` aliases were removed in 0.23.0. Use the semantic name.',
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
          messageId: 'deprecatedSurfaceToken',
          fix: (fixer) => fixer.replaceText(literal, quoteClassName(literal, renderClassName(rewritten))),
        })
      },
    }
  },
})

// re-export helper for testing
export { rewriteToken as __rewriteSurfaceToken }
