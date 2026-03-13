import { type PlaygroundState } from '../lib/url-state'
import { generateCssExport, generateJsonExport } from '../lib/css-export'

interface ShareBarProps {
  state: PlaygroundState
  onResetAll: () => void
}

export function ShareBar({ state, onResetAll }: ShareBarProps) {
  const hasOverrides =
    Object.keys(state.primitives).length > 0 ||
    Object.keys(state.semantic).length > 0

  const copyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href)
  }

  const copyCss = async () => {
    await navigator.clipboard.writeText(generateCssExport(state))
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(generateJsonExport(state))
  }

  return (
    <div className="flex items-center gap-2">
      {hasOverrides && (
        <button
          onClick={onResetAll}
          className="rounded-md px-3 py-1.5 text-sm text-surface-fg-muted hover:bg-surface-2 hover:text-surface-fg"
        >
          Reset All
        </button>
      )}
      <button
        onClick={copyUrl}
        className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-surface-fg-muted hover:border-surface-border-strong hover:text-surface-fg"
      >
        Copy Link
      </button>
      <button
        onClick={copyCss}
        className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-surface-fg-muted hover:border-surface-border-strong hover:text-surface-fg"
      >
        Export CSS
      </button>
      <button
        onClick={copyJson}
        className="rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-surface-fg-muted hover:border-surface-border-strong hover:text-surface-fg"
      >
        Export JSON
      </button>
    </div>
  )
}
