import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs'

describe('Tabs accessibility', () => {
  it('should have no violations with tab items', async () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Account</TabsTrigger>
          <TabsTrigger value="tab2">Settings</TabsTrigger>
          <TabsTrigger value="tab3">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Account details here.</TabsContent>
        <TabsContent value="tab2">Settings panel here.</TabsContent>
        <TabsContent value="tab3">Notification preferences.</TabsContent>
      </Tabs>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
