'use client'

import * as React from 'react'

import type { IconInput } from '../ui/lib/icon-input'
import type { BlockComponentProps } from './types'

export interface AICommandContext {
  customBlocks: Record<string, React.ComponentType<BlockComponentProps<any>>>
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  agent?: { name: string; icon?: IconInput }
}

const AICommandCtx = React.createContext<AICommandContext | null>(null)

export function useAICommand(): AICommandContext | null {
  return React.useContext(AICommandCtx)
}

export interface AICommandProviderProps {
  children: React.ReactNode
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  agent?: { name: string; icon?: IconInput }
}

const EMPTY_BLOCKS: Record<string, React.ComponentType<BlockComponentProps<any>>> = {}

export function AICommandProvider({ children, customBlocks, onAction, agent }: AICommandProviderProps) {
  const blocks = customBlocks ?? EMPTY_BLOCKS
  const value = React.useMemo<AICommandContext>(
    () => ({ customBlocks: blocks, onAction, agent }),
     
    [blocks, onAction, agent],
  )
  return <AICommandCtx.Provider value={value}>{children}</AICommandCtx.Provider>
}
