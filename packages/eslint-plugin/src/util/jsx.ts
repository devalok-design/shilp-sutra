import type { TSESTree } from '@typescript-eslint/utils'
import { AST_NODE_TYPES } from '@typescript-eslint/utils'

/**
 * Read the literal element name out of a JSXOpeningElement. Returns null
 * for member-expression names (e.g. `<Foo.Bar />`) — rules concerned with a
 * specific component should handle those separately if needed.
 */
export function getJSXElementName(
  node: TSESTree.JSXOpeningElement,
): string | null {
  if (node.name.type === AST_NODE_TYPES.JSXIdentifier) {
    return node.name.name
  }
  return null
}

/**
 * Find a JSX attribute by name. Returns null when absent or a spread attr.
 */
export function findJSXAttribute(
  node: TSESTree.JSXOpeningElement,
  name: string,
): TSESTree.JSXAttribute | null {
  for (const attr of node.attributes) {
    if (
      attr.type === AST_NODE_TYPES.JSXAttribute &&
      attr.name.type === AST_NODE_TYPES.JSXIdentifier &&
      attr.name.name === name
    ) {
      return attr
    }
  }
  return null
}

/**
 * Get the literal string value of a JSX attribute. Returns null when the
 * attribute is missing, dynamic, or non-string.
 *
 *   variant="solid"        → "solid"
 *   variant={"solid"}      → "solid"
 *   variant={dynamic}      → null
 *   variant                → null   (no value = bool true, not a string)
 */
export function getJSXStringAttributeValue(
  attr: TSESTree.JSXAttribute,
): string | null {
  const value = attr.value
  if (!value) return null
  if (value.type === AST_NODE_TYPES.Literal && typeof value.value === 'string') {
    return value.value
  }
  if (value.type === AST_NODE_TYPES.JSXExpressionContainer) {
    const expr = value.expression
    if (expr.type === AST_NODE_TYPES.Literal && typeof expr.value === 'string') {
      return expr.value
    }
  }
  return null
}

/**
 * Get the value AST node of a JSX attribute, for use as the report target /
 * autofix range. Returns the inner expression for `attr={expr}` shape.
 */
export function getJSXAttributeValueNode(
  attr: TSESTree.JSXAttribute,
): TSESTree.Node | null {
  const value = attr.value
  if (!value) return null
  if (value.type === AST_NODE_TYPES.Literal) return value
  if (value.type === AST_NODE_TYPES.JSXExpressionContainer) {
    return value.expression.type === AST_NODE_TYPES.JSXEmptyExpression
      ? value
      : value.expression
  }
  return null
}
