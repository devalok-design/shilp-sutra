/**
 * Single source of truth for "icon" prop shapes across the design system.
 *
 * Before 0.41.0 every component invented its own icon prop type — 6 distinct
 * shapes across 25+ components (ReactElement, ReactNode, ComponentType,
 * dual-union, IconProps['icon'], ForwardRefExoticComponent). Consumers had
 * to memorize per-component conventions. Stories drifted. Five separate
 * `iconSizeMap` declarations cropped up in component source.
 *
 * `IconInput` collapses all 6 shapes into one. Every consumer-accepted icon
 * prop should be typed as `IconInput`. The render path runs through
 * `normalizeIcon()` (see `./normalize-icon.tsx`), which:
 *
 *   - Wraps raw component refs (`IconPlus`) in `<Icon icon={IconPlus} />` so
 *     they pick up `IconProvider` size + stroke context.
 *   - Passes through already-instantiated elements (`<IconPlus />`,
 *     `<Icon icon={X} />`, or any custom node like `<span>$</span>`).
 *   - Returns `null` for `null` / `undefined`.
 *
 * Consumers can pass any of:
 *   - `<Icon icon={IconPlus} />` — canonical, size flows from context
 *   - `<IconPlus />` — raw Tabler element, passes through unchanged
 *   - `IconPlus` — Tabler component ref, normalizer wraps it
 *   - `<span>$</span>` — custom node, passes through
 *   - `null` / `undefined` — no icon
 *
 * All four work identically at the call site. The component renders them
 * inside an `IconProvider` so size flows automatically.
 */

import type * as React from 'react'

/**
 * Any value accepted as an "icon" prop across the design system.
 *
 * @see normalizeIcon for the runtime contract.
 * @see IconProvider for size context propagation.
 */
export type IconInput =
  | React.ReactElement
  | React.ComponentType<{ className?: string; size?: number | string }>
  | null
  | undefined
