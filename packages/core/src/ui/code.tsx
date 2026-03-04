'use client'

import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Props for Code — a typography component that renders either inline `<code>` or block `<pre><code>`
 * monospace text, styled with the design system's layer tokens.
 *
 * **`variant` options:**
 * - `"inline"` (default) — renders as `<code>` with a subtle layer-03 background, suitable for
 *   short snippets within prose (e.g. "Use the `onClick` prop to...").
 * - `"block"` — renders as `<pre>` with a bordered, padded, horizontally-scrollable block for
 *   multi-line code samples.
 *
 * @example
 * // Inline code reference in documentation:
 * <p>Pass <Code>loading={true}</Code> to show the spinner.</p>
 *
 * @example
 * // Block code sample (e.g. in a README or docs page):
 * <Code variant="block">{`const greeting = "Hello, world!"\nconsole.log(greeting)`}</Code>
 *
 * @example
 * // Inline API key display:
 * <p>Your API key: <Code>sk-dev-abc123xyz</Code></p>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'inline' | 'block'
}

const Code = React.forwardRef<HTMLPreElement | HTMLElement, CodeProps>(
  ({ className, variant = 'inline', children, ...props }, ref) => {
    if (variant === 'block') {
      return (
        <pre
          ref={ref as React.Ref<HTMLPreElement>}
          className={cn(
            'overflow-x-auto rounded-ds-md border border-border-subtle bg-layer-02 p-ds-05 font-mono text-ds-sm leading-[150%] text-text-primary',
            className,
          )}
          {...props}
        >
          <code>{children}</code>
        </pre>
      )
    }

    return (
      <code
        ref={ref}
        className={cn(
          'rounded-ds-sm bg-layer-03 px-ds-02 py-ds-01 font-mono text-ds-sm text-text-primary',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
)
Code.displayName = 'Code'

export { Code }
