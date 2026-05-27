import type { TSESTree } from '@typescript-eslint/utils'

/**
 * True iff the JSX `className` attribute value is a simple string literal that
 * we can safely tokenize + autofix. Bails on:
 *   - Template literals (className={`bg-${x}`})
 *   - Function calls (className={cn('a', 'b')} / clsx(...) / tw(...))
 *   - Conditional expressions / member access / anything dynamic
 *
 * Returns the literal node when safe, otherwise null. Caller emits no report
 * when null (silent bail) — false positives on dynamic class names are
 * worse than false negatives.
 */
export function getLiteralClassNameNode(
  attr: TSESTree.JSXAttribute,
): TSESTree.Literal | null {
  const value = attr.value
  if (!value) return null

  if (value.type === 'Literal' && typeof value.value === 'string') {
    return value
  }

  if (value.type === 'JSXExpressionContainer') {
    const expr = value.expression
    if (expr.type === 'Literal' && typeof expr.value === 'string') {
      return expr
    }
  }

  return null
}

/**
 * Split a className string into tokens. Preserves the original whitespace
 * shape (multi-space gaps, leading/trailing spaces) via a parallel array of
 * separators so we can rebuild it identically when only a few tokens change.
 */
export interface TokenizedClassName {
  /** Each token (with no surrounding whitespace) */
  tokens: string[]
  /** Separator string before each token (e.g. ' ', '\n  ', or '' for the first token) */
  separators: string[]
  /** Trailing whitespace after the last token */
  trailing: string
}

export function tokenizeClassName(raw: string): TokenizedClassName {
  const tokens: string[] = []
  const separators: string[] = []
  const matches = raw.matchAll(/(\s*)(\S+)/g)
  let lastIdx = 0
  for (const match of matches) {
    separators.push(match[1] ?? '')
    tokens.push(match[2] ?? '')
    lastIdx = (match.index ?? 0) + match[0].length
  }
  const trailing = raw.slice(lastIdx)
  return { tokens, separators, trailing }
}

/**
 * Rebuild the original raw string from a tokenized form. Round-trip safe.
 */
export function renderClassName(t: TokenizedClassName): string {
  let out = ''
  for (let i = 0; i < t.tokens.length; i++) {
    out += (t.separators[i] ?? '') + (t.tokens[i] ?? '')
  }
  out += t.trailing
  return out
}

/**
 * Apply a token-level rewrite. Returns null if no tokens changed (so the
 * caller can skip emitting an autofix).
 *
 * The rewriter is given each token; return the replacement string, or `null`
 * to indicate "no change for this token."
 */
export function rewriteClassName(
  t: TokenizedClassName,
  rewriter: (token: string) => string | null,
): TokenizedClassName | null {
  let changed = false
  const newTokens = t.tokens.map((tok) => {
    const replacement = rewriter(tok)
    if (replacement == null || replacement === tok) return tok
    changed = true
    return replacement
  })
  if (!changed) return null
  return { tokens: newTokens, separators: t.separators, trailing: t.trailing }
}

/**
 * Detect the quote style used by the original Literal node (single or double).
 */
export function getQuoteChar(node: TSESTree.Literal): '"' | "'" {
  const raw = node.raw ?? '"'
  return raw[0] === "'" ? "'" : '"'
}

/**
 * Produce a Literal-node replacement string (including surrounding quotes)
 * for a className value. Use with `fixer.replaceText(node, ...)`.
 */
export function quoteClassName(node: TSESTree.Literal, content: string): string {
  const q = getQuoteChar(node)
  const escaped = q === '"' ? content.replace(/"/g, '\\"') : content.replace(/'/g, "\\'")
  return `${q}${escaped}${q}`
}
