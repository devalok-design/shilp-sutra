'use client'

import React from 'react'
import { Switch } from '../../ui/switch'
import { cn } from '../../ui/lib/utils'

interface AdminSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const AdminSwitch: React.FC<AdminSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}) => {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        // Base styles
        'relative w-[68px] h-10 rounded-[88px] transition-colors duration-[var(--duration-moderate)] ease-in-out',
        'bg-[var(--color-field)]',
        // Checked state
        'data-[state=checked]:bg-[var(--color-interactive-hover)]',
        // Thumb styles (child span) – checked
        '[&[data-state=checked]>span]:translate-x-[30px]',
        '[&[data-state=checked]>span]:bg-[var(--color-layer-01)]',
        "[&[data-state=checked]>span]:bg-[url('https://karm-crm.s3.ap-south-1.amazonaws.com/assets/AdminSwitch/admin-switch-on.svg')]",
        '[&[data-state=checked]>span]:bg-no-repeat',
        '[&[data-state=checked]>span]:bg-center',
        '[&[data-state=checked]>span]:bg-[length:20px]',
        '[&[data-state=checked]>span]:transition-all',
        '[&[data-state=checked]>span]:duration-[var(--duration-moderate)]',
        '[&[data-state=checked]>span]:ease-in-out',
        // Thumb styles – unchecked
        '[&[data-state=unchecked]>span]:translate-x-[2px]',
        '[&[data-state=unchecked]>span]:bg-[var(--color-layer-01)]',
        "[&[data-state=unchecked]>span]:bg-[url('https://karm-crm.s3.ap-south-1.amazonaws.com/assets/AdminSwitch/admin-switch-off.svg')]",
        '[&[data-state=unchecked]>span]:bg-no-repeat',
        '[&[data-state=unchecked]>span]:bg-center',
        '[&[data-state=unchecked]>span]:bg-[length:20px]',
        '[&[data-state=unchecked]>span]:transition-all',
        '[&[data-state=unchecked]>span]:duration-[var(--duration-moderate)]',
        '[&[data-state=unchecked]>span]:ease-in-out',
        // Hover state (when not disabled)
        !disabled && 'hover:bg-[var(--color-field,#f7e9e9)]',
        !disabled && 'data-[state=checked]:hover:bg-[var(--color-interactive-hover)]',
        // Disabled state
        disabled && [
          'cursor-not-allowed',
          'bg-[var(--color-field-disabled,#d3ced0)]',
          'border-[var(--color-text-disabled,#b7afb2)]',
          '[&>span]:bg-[var(--color-text-placeholder,#8c8084)]',
          '[&>span]:opacity-50',
        ],
        className,
      )}
    />
  )
}
AdminSwitch.displayName = 'AdminSwitch'

export { AdminSwitch }
