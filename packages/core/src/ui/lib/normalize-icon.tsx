// @server-safe
import * as React from 'react'

import { Icon } from '../icon'
import type { IconSize } from '../icon-context'
import type { IconInput } from './icon-input'

/**
 * Normalize any IconInput shape into a renderable React node.
 *
 * - Component refs (`IconPlus`) → wrap in `<Icon icon={IconPlus} />` (context-aware).
 * - Already-instantiated elements (`<IconPlus />`, `<Icon …/>`, `<span>$</span>`) →
 *   passed through. If inside an `<IconProvider>`, any nested `<Icon>` element
 *   picks up the size + stroke from context automatically.
 * - `null` / `undefined` → returns `null`.
 *
 * Components calling this should also wrap their icon slot in
 * `<IconProvider size={defaultSize}>` so the size context propagates to
 * nested `<Icon>` elements. Example:
 *
 * ```tsx
 * import { IconProvider } from './icon-context'
 * import { normalizeIcon } from './lib/normalize-icon'
 *
 * function MyComponent({ icon, size = 'md' }: { icon?: IconInput; size?: 'sm' | 'md' | 'lg' }) {
 *   return (
 *     <div>
 *       <IconProvider size={iconSizeMap[size]}>
 *         {normalizeIcon(icon)}
 *       </IconProvider>
 *     </div>
 *   )
 * }
 * ```
 *
 * @param input  Anything matching `IconInput`.
 * @param fallbackSize  Optional explicit size to apply if the input is a
 *   raw component ref AND no IconProvider context is set. In practice you
 *   should use IconProvider for size control; this fallback is for unusual
 *   cases where the consumer can't be wrapped (e.g. portal-rendered icons).
 */
export function normalizeIcon(
  input: IconInput,
  fallbackSize?: IconSize,
): React.ReactNode {
  if (input == null) return null

  // Already an instantiated React element — pass through. If it's our
  // `<Icon>`, the IconProvider above will populate any unset size/stroke.
  // If it's a raw Tabler element (`<IconPlus />`) or any custom node, it
  // renders as-is.
  if (React.isValidElement(input)) return input

  // Component ref shape. Two flavors:
  //   - Tabler icons / forwardRef components → typeof input === 'object' and
  //     input.$$typeof is REACT_FORWARD_REF_TYPE.
  //   - Plain function components → typeof input === 'function'.
  // Both wrap into `<Icon icon={…} />` so they participate in IconContext.
  if (isIconComponentRef(input)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Icon icon={input as any} size={fallbackSize} />
  }

  return null
}

/**
 * True for ForwardRef components (Tabler icons) AND for plain function
 * components. False for instantiated JSX elements and arbitrary objects.
 */
function isIconComponentRef(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'function') return true
  if (typeof value === 'object') {
    const v = value as { $$typeof?: symbol; render?: unknown }
    return typeof v.$$typeof === 'symbol' && typeof v.render === 'function'
  }
  return false
}
