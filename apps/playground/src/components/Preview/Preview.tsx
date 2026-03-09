import { ComponentGrid } from './ComponentGrid'

interface PreviewProps {
  mode: 'tokens' | 'sandbox'
  sandboxContent?: React.ReactNode
}

export function Preview({ mode, sandboxContent }: PreviewProps) {
  if (mode === 'sandbox' && sandboxContent) {
    return <div className="max-w-4xl mx-auto">{sandboxContent}</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ComponentGrid />
    </div>
  )
}
