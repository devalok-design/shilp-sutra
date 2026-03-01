import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

function renderTabs(defaultValue = 'tab1') {
  return render(
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="tab1">Tab One</TabsTrigger>
        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content One</TabsContent>
      <TabsContent value="tab2">Content Two</TabsContent>
    </Tabs>,
  )
}

describe('Tabs', () => {
  it('renders tab triggers', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument()
  })

  it('shows the default tab content', () => {
    renderTabs()
    expect(screen.getByText('Content One')).toBeInTheDocument()
  })

  it('switches content on click', async () => {
    const user = userEvent.setup()
    renderTabs()
    await user.click(screen.getByRole('tab', { name: 'Tab Two' }))
    expect(screen.getByText('Content Two')).toBeInTheDocument()
  })

  it('marks active tab with aria-selected', () => {
    renderTabs()
    expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveAttribute('aria-selected', 'false')
  })
})
