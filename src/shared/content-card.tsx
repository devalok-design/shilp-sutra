import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'

const contentCardVariants = cva(
  'rounded-[var(--radius-lg)] transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-moderate)]',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--color-border-default)] bg-[var(--color-layer-01)] hover:shadow-[var(--shadow-02)]',
        outline:
          'border border-[var(--border-secondary)] bg-transparent hover:border-[var(--border-tertiary)]',
        ghost:
          'border border-transparent bg-transparent hover:bg-[var(--color-layer-02)]',
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
            'flex items-center justify-between border-b border-[var(--color-border-default)]',
            padding === 'compact' ? 'px-3 py-2.5' : padding === 'spacious' ? 'px-6 py-4' : 'px-5 py-3.5',
          )}
        >
          {header ?? (
            <>
              {headerTitle && (
                <h3 className="B1-Reg semibold text-[var(--color-text-primary)]">
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
            'border-t border-[var(--color-border-default)]',
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
