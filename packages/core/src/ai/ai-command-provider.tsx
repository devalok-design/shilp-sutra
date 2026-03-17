'use client'

import * as React from 'react'
import type { BlockComponentProps } from './types'

export interface AICommandContext {
  customBlocks: Record<string, React.ComponentType<BlockComponentProps<any>>>
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  agent?: { name: string; icon?: React.ReactNode }
}

const AICommandCtx = React.createContext<AICommandContext | null>(null)

export function useAICommand(): AICommandContext | null {
  return React.useContext(AICommandCtx)
}

export interface AICommandProviderProps {
  children: React.ReactNode
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  agent?: { name: string; icon?: React.ReactNode }
}

export function AICommandProvider({ children, customBlocks = {}, onAction, agent }: AICommandProviderProps) {
  const value = React.useMemo<AICommandContext>(
    () => ({ customBlocks, onAction, agent }),
    [customBlocks, onAction, agent],
  )
  return <AICommandCtx.Provider value={value}>{children}</AICommandCtx.Provider>
}
