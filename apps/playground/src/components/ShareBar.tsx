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
          className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-layer-02 hover:text-text-primary"
        >
          Reset All
        </button>
      )}
      <button
        onClick={copyUrl}
        className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border hover:text-text-primary"
      >
        Copy Link
      </button>
      <button
        onClick={copyCss}
        className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border hover:text-text-primary"
      >
        Export CSS
      </button>
      <button
        onClick={copyJson}
        className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border hover:text-text-primary"
      >
        Export JSON
      </button>
    </div>
  )
}
