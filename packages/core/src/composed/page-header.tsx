// @server-safe
import * as React from 'react'

import {
  Breadcrumb as BreadcrumbNav,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'
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
          <BreadcrumbNav className="text-body-sm">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.href && !isLast ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </BreadcrumbNav>
        )}

        {(resolvedTitle || subtitle || actions) && (
          <div className="flex flex-wrap items-start justify-between gap-ds-05">
            <div className="flex min-w-0 flex-col gap-ds-02b">
              {resolvedTitle && (
                <h1
                  className={cn(
                    'text-heading-md font-semibold text-surface-fg',
                    titleClassName,
                  )}
                >
                  {resolvedTitle}
                </h1>
              )}
              {subtitle && (
                <p className="text-body-md text-surface-fg-subtle line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex flex-wrap items-center gap-ds-03">{actions}</div>
            )}
          </div>
        )}
      </div>
    )
  },
)
PageHeader.displayName = 'PageHeader'

export { PageHeader }
