import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Tabs, TabsContent,TabsList, TabsTrigger } from './tabs'

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

  describe('size', () => {
    it('applies sm size classes to list and triggers', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList size="sm" data-testid="list">
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>,
      )
      const list = screen.getByTestId('list')
      expect(list.className).toContain('h-8')
      const trigger = screen.getByRole('tab', { name: 'Tab One' })
      expect(trigger.className).toContain('text-body-xs')
    })

    it('applies md size classes by default', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="list">
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>,
      )
      const list = screen.getByTestId('list')
      expect(list.className).toContain('h-10')
      const trigger = screen.getByRole('tab', { name: 'Tab One' })
      expect(trigger.className).toContain('text-body-sm')
    })

    it('applies lg size classes to list and triggers', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList size="lg" data-testid="list">
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>,
      )
      const list = screen.getByTestId('list')
      expect(list.className).toContain('h-12')
      const trigger = screen.getByRole('tab', { name: 'Tab One' })
      expect(trigger.className).toContain('text-body-md')
    })
  })

  describe('color', () => {
    it('applies accent color classes by default (line variant)', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>,
      )
      const trigger = screen.getByRole('tab', { name: 'Tab One' })
      expect(trigger.className).toContain('data-[state=active]:text-accent-11')
    })

    it('applies neutral color classes (line variant)', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList color="neutral">
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>,
      )
      const trigger = screen.getByRole('tab', { name: 'Tab One' })
      expect(trigger.className).toContain('data-[state=active]:text-surface-fg')
    })

    it('does not apply line-specific accent color class to contained variant', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList variant="contained" color="accent">
            <TabsTrigger value="tab1">Tab One</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>,
      )
      const trigger = screen.getByRole('tab', { name: 'Tab One' })
      // Contained variant should NOT have the line-specific accent-11 active text
      expect(trigger.className).not.toContain('data-[state=active]:text-accent-11')
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = renderTabs()
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus to next tab', async () => {
      const user = userEvent.setup()
      renderTabs()
      const tabOne = screen.getByRole('tab', { name: 'Tab One' })
      tabOne.focus()
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'Tab Two' })).toHaveFocus()
    })

    it('ArrowLeft moves focus to previous tab', async () => {
      const user = userEvent.setup()
      renderTabs()
      const tabTwo = screen.getByRole('tab', { name: 'Tab Two' })
      tabTwo.focus()
      await user.keyboard('{ArrowLeft}')
      expect(screen.getByRole('tab', { name: 'Tab One' })).toHaveFocus()
    })
  })
})
