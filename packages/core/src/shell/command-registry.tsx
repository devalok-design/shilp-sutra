import * as React from 'react'

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface CommandPageItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  keywords?: string[]
}

export interface CommandRegistry {
  pages: CommandPageItem[]
  adminPages: CommandPageItem[]
}

// -----------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------

const CommandRegistryContext = React.createContext<CommandRegistry | null>(null)

// -----------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------

export interface CommandRegistryProviderProps {
  children: React.ReactNode
  registry: CommandRegistry
}

export function CommandRegistryProvider({
  children,
  registry,
}: CommandRegistryProviderProps) {
  return (
    <CommandRegistryContext.Provider value={registry}>
      {children}
    </CommandRegistryContext.Provider>
  )
}

CommandRegistryProvider.displayName = 'CommandRegistryProvider'

// -----------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------

export function useCommandRegistry(): CommandRegistry | null {
  return React.useContext(CommandRegistryContext)
}
