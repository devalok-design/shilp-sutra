/**
 * Storybook mock for next/link.
 * Renders a plain <a> tag with onClick preventDefault so links
 * don't navigate away from the Storybook iframe.
 */
import * as React from 'react'

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children?: React.ReactNode
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
  passHref?: boolean
  locale?: string | false
  legacyBehavior?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, prefetch, replace, scroll, shallow, passHref, locale, legacyBehavior, ...rest }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        onClick={(e) => {
          e.preventDefault()
          rest.onClick?.(e)
        }}
        {...rest}
      >
        {children}
      </a>
    )
  },
)

Link.displayName = 'MockNextLink'

export default Link
