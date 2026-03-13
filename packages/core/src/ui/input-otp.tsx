'use client'

import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { IconMinus } from '@tabler/icons-react'

import { cn } from './lib/utils'

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-ds-03 has-[:disabled]:opacity-[0.38]',
      containerClassName,
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
))
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
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-ds-sm-plus w-ds-sm-plus items-center justify-center border-y border-r border-border text-ds-md shadow-01 transition-[box-shadow] first:rounded-l-ds-md first:border-l last:rounded-r-ds-md',
        isActive && 'z-raised ring-2 ring-focus',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-[16px] w-px bg-text-primary duration-slow-02" />
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
    <IconMinus />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput>

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
