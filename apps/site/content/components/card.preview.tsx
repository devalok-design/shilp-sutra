'use client'

import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

export function CardHero() {
  return (
    <div className="max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Daily release</CardTitle>
          <CardDescription>v0.40.0 ships Sunday. Skill bundle + site v1 already live.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text variant="body-sm" className="text-surface-fg-muted">
            Three phases land together: theming foundation, /theming editor, and /components detail pages.
          </Text>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Badge color="success">On track</Badge>
          <Button size="sm">View milestone</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function CardVariants() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-04">
      <Card>
        <CardHeader>
          <CardTitle>Minimal</CardTitle>
          <CardDescription>Just a heading and a description.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>With content</CardTitle>
          <CardDescription>Headers gain weight from short, specific copy.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text variant="body-sm" className="text-surface-fg-muted">
            Three sentences max in card body. Keep the user moving.
          </Text>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between gap-ds-03">
          <div className="flex flex-col gap-ds-01">
            <CardTitle>Project: Karm</CardTitle>
            <CardDescription>Devalok&apos;s product. Built with shilp-sutra.</CardDescription>
          </div>
          <Badge variant="soft" color="accent">Live</Badge>
        </CardHeader>
        <CardContent>
          <Text variant="body-sm" className="text-surface-fg-muted">
            Cards compose. Add a header row, a body, a footer, or just one of the three. Each piece is
            optional and uses the same spacing tokens, so density is consistent across the app.
          </Text>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-ds-02">
          <Button variant="soft" size="sm">Settings</Button>
          <Button size="sm">Open</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
