// @server-safe
import * as React from 'react'
import { cn } from '../ui/lib/utils'

export interface Breadcrumb {
  label: string
  href?: string
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  titleClassName?: string
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    { title, subtitle, actions, breadcrumbs, titleClassName, className, ...props },
    ref,
  ) => {
    const resolvedTitle =
      title ?? breadcrumbs?.[breadcrumbs.length - 1]?.label ?? ''

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-ds-05 border-b border-surface-border-strong pb-ds-06',
          className,
        )}
        {...props}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-ds-02b">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="text-surface-fg-subtle"
                  >
                    <path d="M9 6l6 6l-6 6" />
                  </svg>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-ds-sm text-surface-fg-subtle transition-colors hover:text-surface-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 rounded-ds-sm"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span
                    className={cn(
                      'text-ds-sm',
                      index === breadcrumbs.length - 1
                        ? 'text-surface-fg'
                        : 'text-surface-fg-subtle',
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {(resolvedTitle || subtitle || actions) && (
          <div className="flex items-start justify-between gap-ds-05">
            <div className="flex flex-col gap-ds-02b">
              {resolvedTitle && (
                <h1
                  className={cn(
                    'text-ds-2xl font-semibold text-surface-fg',
                    titleClassName,
                  )}
                >
                  {resolvedTitle}
                </h1>
              )}
              {subtitle && (
                <p className="text-ds-md text-surface-fg-subtle">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex shrink-0 items-center gap-ds-03">{actions}</div>
            )}
          </div>
        )}
      </div>
    )
  },
)
PageHeader.displayName = 'PageHeader'

export { PageHeader }
