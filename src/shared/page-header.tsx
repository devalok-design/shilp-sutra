import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { IconChevronRight } from '@tabler/icons-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  titleClassName?: string
}

function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  titleClassName,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-[var(--color-border-default)] pb-6',
        className,
      )}
      {...props}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <IconChevronRight
                  className="h-3.5 w-3.5 text-[var(--color-text-placeholder)]"
                  stroke={1.5}
                />
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="B3-Reg text-[var(--color-text-placeholder)] transition-colors hover:text-[var(--color-text-secondary)]"
                >
                  {crumb.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'B3-Reg',
                    index === breadcrumbs.length - 1
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-placeholder)]',
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1
            className={cn(
              'T5-Reg text-[var(--color-text-primary)]',
              titleClassName,
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="B2-Reg text-[var(--color-text-placeholder)]">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}

PageHeader.displayName = 'PageHeader'

export { PageHeader }
export type { PageHeaderProps, Breadcrumb }
