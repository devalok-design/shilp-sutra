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

  // ForwardRef component (Tabler icons + anything built with React.forwardRef).
  // Wrap in <Icon /> so it participates in IconContext (size + stroke flow
  // from any surrounding IconProvider).
  if (isForwardRefComponent(input)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Icon icon={input as any} size={fallbackSize} />
  }

  // Plain function/class component — render directly. The component is
  // responsible for its own sizing; we don't force <Icon> wrapping because
  // <Icon>'s type expects a ForwardRef shape and passing arbitrary props
  // would generate React warnings.
  if (typeof input === 'function') {
    const Component = input as React.ComponentType<{
      className?: string
      size?: number | string
    }>
    return <Component />
  }

  return null
}

/**
 * True only for `React.forwardRef`-shaped components (Tabler icons fit
 * this). React tags forwardRef objects with `$$typeof` (a symbol) and a
 * `render` function.
 */
function isForwardRefComponent(value: unknown): boolean {
  if (value == null) return false
  if (typeof value !== 'object') return false
  const v = value as { $$typeof?: symbol; render?: unknown }
  return typeof v.$$typeof === 'symbol' && typeof v.render === 'function'
}
