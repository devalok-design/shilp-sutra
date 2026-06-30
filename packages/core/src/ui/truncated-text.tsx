'use client'

import * as React from 'react'

import { cn } from './lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

type TruncateMode = 'end' | 'clamp' | 'middle'

export interface TruncatedTextProps {
  /** The full text. Always the accessible name, even when visually shortened. */
  children: string
  /**
   * `end` (default) single-line "…end"; `clamp` multi-line (`lines`); `middle`
   * keeps both ends (filenames, emails) — `name…end.pdf`.
   */
  mode?: TruncateMode
  /** Lines for `mode="clamp"`. @default 2 */
  lines?: number
  /** Element to render. @default 'span' */
  as?: 'span' | 'p' | 'div'
  /** Show the full text in a tooltip when (and only when) actually truncated. @default true */
  tooltip?: boolean
  className?: string
  /** Override the full-text accessible name / tooltip (defaults to `children`). */
  title?: string
}

/** Keep `keep` chars total, ellipsis in the middle. */
function truncateMiddle(str: string, keep: number, ellipsis = '…'): string {
  if (keep >= str.length || keep < 2) return str
  const budget = keep - ellipsis.length
  const head = Math.ceil(budget / 2)
  const tail = Math.floor(budget / 2)
  // slice(-0) returns the whole string, so guard the tail explicitly.
  return str.slice(0, head) + ellipsis + (tail > 0 ? str.slice(-tail) : '')
}

/**
 * Text that truncates and recovers. CSS handles `end`/`clamp` (full text stays in the
 * DOM, screen-reader safe); `middle` measures + JS-shortens but keeps the full string as
 * the accessible name. A tooltip appears ONLY when the text is actually clipped.
 *
 * Note: for `end`/`middle` in a flex/grid row, the shrinking item still needs `min-w-0`
 * (CSS gotcha) — apply it at the call site.
 *
 * @example
 * <TruncatedText>{user.name}</TruncatedText>
 * <TruncatedText mode="middle">{fileName}</TruncatedText>      // report…v2.pdf
 * <TruncatedText mode="clamp" lines={2}>{description}</TruncatedText>
 */
export const TruncatedText = React.forwardRef<HTMLElement, TruncatedTextProps>(
  ({ children, mode = 'end', lines = 2, as = 'span', tooltip = true, className, title }, forwardedRef) => {
    const full = children
    const [overflowing, setOverflowing] = React.useState(false)
    const [display, setDisplay] = React.useState(full)
    const roRef = React.useRef<ResizeObserver | null>(null)

    // Callback ref owns the ResizeObserver so it always tracks the CURRENT node.
    // Wrapping in a Tooltip remounts the element when `overflowing` flips — a one-shot
    // layout effect would leave a stale observer on the detached node (which then fires
    // with size 0 and resets the measurement). Reconnecting here avoids that loop.
    const attachRef = React.useCallback(
      (node: HTMLElement | null) => {
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node

        roRef.current?.disconnect()
        if (!node) return

        const measure = () => {
          if (mode === 'middle') {
            node.textContent = full
            if (node.clientWidth === 0 || node.scrollWidth <= node.clientWidth) {
              setDisplay(full)
              setOverflowing(false)
              return
            }
            // Largest middle-truncated string that fits, via binary search.
            let lo = 2
            let hi = full.length
            let best = 2
            while (lo <= hi) {
              const midKeep = (lo + hi) >> 1
              node.textContent = truncateMiddle(full, midKeep)
              if (node.scrollWidth <= node.clientWidth) {
                best = midKeep
                lo = midKeep + 1
              } else {
                hi = midKeep - 1
              }
            }
            setDisplay(truncateMiddle(full, best))
            setOverflowing(true)
          } else if (mode === 'clamp') {
            setOverflowing(node.scrollHeight > node.clientHeight + 1)
          } else {
            setOverflowing(node.scrollWidth > node.clientWidth + 1)
          }
        }

        measure()
        roRef.current = new ResizeObserver(measure)
        roRef.current.observe(node)
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [full, mode, lines, forwardedRef],
    )

    const Tag = as as React.ElementType
    const content = (
      <Tag
        ref={attachRef}
        className={cn(
          mode === 'end' && 'block truncate',
          mode === 'middle' && 'block overflow-hidden whitespace-nowrap',
          mode === 'clamp' && 'overflow-hidden',
          className,
        )}
        style={
          mode === 'clamp'
            ? ({ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines } as React.CSSProperties)
            : undefined
        }
        // When clipped, the visible text may be shortened (middle mode) — keep the full
        // string as the accessible name so screen readers always read it in full.
        aria-label={overflowing ? (title ?? full) : undefined}
      >
        {mode === 'middle' ? display : full}
      </Tag>
    )

    if (tooltip && overflowing) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>{title ?? full}</TooltipContent>
        </Tooltip>
      )
    }
    return content
  },
)
TruncatedText.displayName = 'TruncatedText'
