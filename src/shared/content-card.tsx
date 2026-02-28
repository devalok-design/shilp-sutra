import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'

const contentCardVariants = cva(
  'rounded-lg transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] hover:shadow-[0px_2px_8px_0px_var(--Elevation-2)]',
        outlined:
          'border border-[var(--border-secondary)] bg-transparent hover:border-[var(--border-tertiary)]',
        ghost:
          'border border-transparent bg-transparent hover:bg-[var(--Elevation-Card-hover-primary)]',
      },
      padding: {
        default: 'p-5',
        compact: 'p-3',
        spacious: 'p-6',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  },
)

interface ContentCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentCardVariants> {
  header?: React.ReactNode
  headerTitle?: string
  headerActions?: React.ReactNode
  footer?: React.ReactNode
}

function ContentCard({
  variant,
  padding,
  header,
  headerTitle,
  headerActions,
  footer,
  className,
  children,
  ...props
}: ContentCardProps) {
  const hasHeader = header || headerTitle || headerActions

  return (
    <div
      className={cn(
        contentCardVariants({ variant, padding: hasHeader || footer ? 'none' : padding }),
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            'flex items-center justify-between border-b border-[var(--border-primary)]',
            padding === 'compact' ? 'px-3 py-2.5' : padding === 'spacious' ? 'px-6 py-4' : 'px-5 py-3.5',
          )}
        >
          {header ?? (
            <>
              {headerTitle && (
                <h3 className="B1-Reg semibold text-[var(--Mapped-Text-Primary)]">
                  {headerTitle}
                </h3>
              )}
              {headerActions && (
                <div className="flex items-center gap-2">{headerActions}</div>
              )}
            </>
          )}
        </div>
      )}

      <div
        className={cn(
          hasHeader || footer
            ? padding === 'compact'
              ? 'p-3'
              : padding === 'spacious'
                ? 'p-6'
                : 'p-5'
            : '',
        )}
      >
        {children}
      </div>

      {footer && (
        <div
          className={cn(
            'border-t border-[var(--border-primary)]',
            padding === 'compact' ? 'px-3 py-2.5' : padding === 'spacious' ? 'px-6 py-4' : 'px-5 py-3.5',
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

ContentCard.displayName = 'ContentCard'

export { ContentCard, contentCardVariants }
export type { ContentCardProps }
