import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AICommandProvider, useAICommand } from '../ai-command-provider'

function ContextReader() {
  const ctx = useAICommand()
  return <div data-testid="ctx">{ctx ? `agent:${ctx.agent?.name}` : 'no-ctx'}</div>
}

describe('AICommandProvider', () => {
  it('provides context to children', () => {
    render(
      <AICommandProvider agent={{ name: 'Devadoot' }}>
        <ContextReader />
      </AICommandProvider>
    )
    expect(screen.getByTestId('ctx')).toHaveTextContent('agent:Devadoot')
  })

  it('returns null when no provider', () => {
    render(<ContextReader />)
    expect(screen.getByTestId('ctx')).toHaveTextContent('no-ctx')
  })
})
