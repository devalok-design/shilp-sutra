'use client'

import { IconMinus } from '@tabler/icons-react'
import { OTPInput, OTPInputContext } from 'input-otp'
import * as React from 'react'

import { useFormField } from './form'
import { Icon } from './icon'
import { cn } from './lib/utils'

// ── Size context ────────────────────────────────────────────────────

type InputOTPSize = 'sm' | 'md' | 'lg'

const InputOTPSizeContext = React.createContext<InputOTPSize>('md')

const slotSizeClasses: Record<InputOTPSize, string> = {
  sm: 'h-ds-sm w-ds-sm text-ds-sm',
  md: 'h-ds-sm-plus w-ds-sm-plus text-ds-md',
  lg: 'h-ds-md w-ds-md text-ds-lg',
}

// ── InputOTP ────────────────────────────────────────────────────────

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput> & {
    state?: 'default' | 'error'
    /** Slot size. @default 'md' */
    size?: InputOTPSize
  }
>(({ className, containerClassName, state, size: sizeProp, ...props }, ref) => {
  const formField = useFormField()
  const isError = state === 'error' || formField?.state === 'error'
  const size: InputOTPSize = (typeof sizeProp === 'string' ? sizeProp : undefined) ?? 'md'

  return (
    <InputOTPSizeContext.Provider value={size}>
      <OTPInput
        ref={ref}
        aria-invalid={isError || undefined}
        aria-describedby={formField?.helperTextId}
        aria-required={formField?.required || undefined}
        containerClassName={cn(
          'group/otp flex items-center gap-ds-03 has-[:disabled]:opacity-action-disabled',
          isError && 'is-error',
          containerClassName,
        )}
        className={cn('disabled:cursor-not-allowed', className)}
        {...props}
      />
    </InputOTPSizeContext.Provider>
  )
})
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const size = React.useContext(InputOTPSizeContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center justify-center border-y border-r border-surface-border-strong shadow-raised transition-[box-shadow,border-color] first:rounded-l-control first:border-l last:rounded-r-control',
        slotSizeClasses[size],
        'group-[.is-error]/otp:border-error-7',
        isActive && 'z-raised ring-2 ring-accent-9',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-[16px] w-px bg-surface-fg duration-slow-02" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Icon icon={IconMinus} size="sm" />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> & {
  state?: 'default' | 'error'
  /** Slot size. @default 'md' */
  size?: InputOTPSize
}

export { InputOTP, InputOTPGroup, InputOTPSeparator,InputOTPSlot }
