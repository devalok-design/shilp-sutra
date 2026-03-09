import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Input } from '@/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Switch } from '@/ui/switch'
import { Label } from '@/ui/label'
import { Separator } from '@/ui/separator'
import { Alert } from '@/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/ui/tooltip'

export function ComponentGrid() {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Buttons */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Button</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="solid" size="sm">Solid SM</Button>
            <Button variant="solid" size="md">Solid MD</Button>
            <Button variant="solid" size="lg">Solid LG</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="solid" color="error">Error</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Badge</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="subtle">Default</Badge>
            <Badge variant="subtle" color="success">Success</Badge>
            <Badge variant="subtle" color="error">Error</Badge>
            <Badge variant="subtle" color="warning">Warning</Badge>
            <Badge variant="subtle" color="info">Info</Badge>
            <Badge variant="solid">Solid</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <Separator />

        {/* Input */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Input</h3>
          <div className="flex flex-col gap-3 max-w-sm">
            <Input placeholder="Default input" />
            <Input placeholder="Error state" state="error" />
            <Input placeholder="Disabled" disabled />
          </div>
        </section>

        <Separator />

        {/* Card */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Card</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>With subtle border and shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Card content goes here.</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Stronger shadow for emphasis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">Card content goes here.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form Controls */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Form Controls</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="check-demo" />
              <Label htmlFor="check-demo">Checkbox</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="switch-demo" />
              <Label htmlFor="switch-demo">Switch</Label>
            </div>
          </div>
        </section>

        <Separator />

        {/* Alerts — uses color prop, not variant for the color axis */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Alert</h3>
          <div className="space-y-3">
            <Alert color="info">This is an informational alert.</Alert>
            <Alert color="success">Operation completed successfully.</Alert>
            <Alert color="warning">Please review before proceeding.</Alert>
            <Alert color="error">Something went wrong.</Alert>
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Tabs</h3>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Overview</TabsTrigger>
              <TabsTrigger value="tab2">Details</TabsTrigger>
              <TabsTrigger value="tab3">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p className="text-sm text-text-secondary p-3">Overview content</p>
            </TabsContent>
            <TabsContent value="tab2">
              <p className="text-sm text-text-secondary p-3">Details content</p>
            </TabsContent>
            <TabsContent value="tab3">
              <p className="text-sm text-text-secondary p-3">Settings content</p>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Avatar */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Avatar</h3>
          <div className="flex gap-3">
            <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>EF</AvatarFallback></Avatar>
          </div>
        </section>

        <Separator />

        {/* Tooltip */}
        <section>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Tooltip</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </section>
      </div>
    </TooltipProvider>
  )
}
