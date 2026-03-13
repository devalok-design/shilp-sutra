import React from 'react'

interface LayoutProps {
  mode: 'tokens' | 'sandbox'
  onModeChange: (mode: 'tokens' | 'sandbox') => void
  darkMode: boolean
  onToggleDarkMode: () => void
  sidebar: React.ReactNode
  preview: React.ReactNode
  topBarActions: React.ReactNode
}

export function Layout({
  mode,
  onModeChange,
  darkMode,
  onToggleDarkMode,
  sidebar,
  preview,
  topBarActions,
}: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-surface-1 text-surface-fg">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-lg font-semibold tracking-tight">
            शिल्प सूत्र <span className="text-surface-fg-muted font-normal">Playground</span>
          </h1>
          {/* Mode switcher */}
          <div className="flex rounded-md border border-surface-border">
            <button
              onClick={() => onModeChange('tokens')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'tokens'
                  ? 'bg-accent-9 text-accent-fg'
                  : 'text-surface-fg-muted hover:text-surface-fg'
              } rounded-l-md`}
            >
              Token Studio
            </button>
            <button
              onClick={() => onModeChange('sandbox')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === 'sandbox'
                  ? 'bg-accent-9 text-accent-fg'
                  : 'text-surface-fg-muted hover:text-surface-fg'
              } rounded-r-md`}
            >
              Component Sandbox
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="rounded-md p-2 text-surface-fg-muted hover:bg-surface-2 hover:text-surface-fg"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>
          {topBarActions}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-surface-border p-4">
          {sidebar}
        </aside>
        {/* Preview */}
        <main className="flex-1 overflow-y-auto p-6">
          {preview}
        </main>
      </div>
    </div>
  )
}
