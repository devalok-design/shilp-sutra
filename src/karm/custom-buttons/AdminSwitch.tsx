'use client'

import React from 'react'
import { Switch } from '../../ui/switch'
import styles from './AdminSwitch.module.css'

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
  const switchClasses = [
    styles.adminSwitch,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ')

  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={switchClasses}
    />
  )
}
AdminSwitch.displayName = 'AdminSwitch'

export { AdminSwitch }
