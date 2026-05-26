import type { TSESTree } from '@typescript-eslint/utils'
import { AST_NODE_TYPES } from '@typescript-eslint/utils'

export interface ImportSpecifierInfo {
  /** As-imported local binding name */
  local: string
  /** Original exported name (for `import { foo as bar }`, this is `foo`) */
  imported: string
  /** Whether this is a type-only import specifier */
  typeOnly: boolean
  /** Original AST node, for source-range computation in autofixes */
  node: TSESTree.ImportSpecifier
}

/**
 * Parse a barrel ImportDeclaration into a normalized specifier list.
 * Filters out default + namespace imports — those don't apply to our
 * barrel-split rule.
 */
export function getNamedSpecifiers(
  node: TSESTree.ImportDeclaration,
): ImportSpecifierInfo[] {
  const out: ImportSpecifierInfo[] = []
  for (const spec of node.specifiers) {
    if (spec.type !== AST_NODE_TYPES.ImportSpecifier) continue
    const imported =
      spec.imported.type === AST_NODE_TYPES.Identifier
        ? spec.imported.name
        : spec.imported.value
    out.push({
      local: spec.local.name,
      imported,
      typeOnly: spec.importKind === 'type',
      node: spec,
    })
  }
  return out
}

/**
 * Generate the source text for a single import declaration. Used when an
 * autofix needs to emit additional imports alongside a rewritten original.
 *
 * Shape: `import { A, B as C } from 'pkg'\n` or with type-only prefix.
 *
 * Preserves the original `importKind` (type-only at the declaration level).
 */
export function renderImportDeclaration(opts: {
  specifiers: Array<Pick<ImportSpecifierInfo, 'local' | 'imported' | 'typeOnly'>>
  source: string
  /** True if the WHOLE declaration is `import type { … }` */
  typeOnlyDeclaration?: boolean
  /** Final newline appended. Default: true. */
  newline?: boolean
}): string {
  const { specifiers, source, typeOnlyDeclaration = false, newline = true } = opts
  if (specifiers.length === 0) return ''

  const parts = specifiers.map((s) => {
    const prefix = !typeOnlyDeclaration && s.typeOnly ? 'type ' : ''
    return s.local === s.imported
      ? `${prefix}${s.imported}`
      : `${prefix}${s.imported} as ${s.local}`
  })

  const prefix = typeOnlyDeclaration ? 'import type' : 'import'
  const line = `${prefix} { ${parts.join(', ')} } from '${source}'`
  return newline ? `${line}\n` : line
}
