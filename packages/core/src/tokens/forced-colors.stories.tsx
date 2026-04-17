import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconX, IconSearch, IconUser, IconPlus } from '@tabler/icons-react'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Banner } from '../ui/banner'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { FormField, FormHelperText } from '../ui/form'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Link } from '../ui/link'
import { Progress } from '../ui/progress'
import { RadioGroup, RadioGroupItem } from '../ui/radio'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Textarea } from '../ui/textarea'

const meta: Meta = {
  title: 'Foundations/Forced Colors',
  tags: ['stable'],
  parameters: {
    docs: {
      description: {
        component: [
          'Component matrix for verifying behavior under `@media (forced-colors: active)`.',
          '',
          '**To test in Chrome:** open DevTools → `…` menu → More tools → Rendering → scroll to "Emulate CSS media feature forced-colors" → set to `active`.',
          '**In Firefox:** `about:preferences` → Colors → "Use system colors".',
          '**In Windows:** Settings → Accessibility → Contrast themes → pick any theme.',
          '',
          'Verify: every interactive element has a visible border; every focus ring is visible (`Highlight` outline); status colors degrade gracefully (error→Mark, others→Highlight); skeleton shimmer is static; decorative grain is hidden.',
        ].join('\n'),
      },
    },
  },
}
export default meta
type Story = StoryObj

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-ds-04 border border-surface-border rounded-ds-md p-ds-05 bg-surface-raised">
      <h3 className="text-ds-lg font-semibold text-surface-fg">{title}</h3>
      {children}
    </section>
  )
}

export const ComponentMatrix: Story = {
  name: 'Component Matrix',
  render: () => (
    <div className="space-y-ds-06 p-ds-06 max-w-5xl">
      <header className="space-y-ds-02">
        <h1 className="text-ds-2xl font-bold text-surface-fg">Forced-Colors Verification</h1>
        <p className="text-ds-md text-surface-fg-muted">
          Toggle forced-colors emulation in DevTools → Rendering. Every section
          below should remain usable: visible borders, clear focus, readable text,
          no invisible interactive affordances.
        </p>
      </header>

      <Section title="Buttons — all variants × colors">
        <div className="flex flex-wrap gap-ds-03">
          <Button variant="solid" color="accent">Solid Accent</Button>
          <Button variant="soft" color="accent">Soft Accent</Button>
          <Button variant="outline" color="accent">Outline Accent</Button>
          <Button variant="ghost" color="accent">Ghost Accent</Button>
          <Button variant="link" color="accent">Link Accent</Button>
        </div>
        <div className="flex flex-wrap gap-ds-03">
          <Button variant="solid" color="error">Solid Error</Button>
          <Button variant="soft" color="success">Soft Success</Button>
          <Button variant="outline" color="warning">Outline Warning</Button>
          <Button variant="ghost" color="neutral" startIcon={<Icon icon={IconPlus} />}>Ghost w/ Icon</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-ds-03">
          <Badge>Default</Badge>
          <Badge variant="solid" color="accent">Solid</Badge>
          <Badge variant="soft" color="error">Soft Error</Badge>
          <Badge variant="outline" color="success">Outline Success</Badge>
          <Badge dot color="warning">With Dot</Badge>
          <Badge onDismiss={() => {}}>Dismissible</Badge>
        </div>
      </Section>

      <Section title="Inputs, Labels, and Form validation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-05">
          <FormField>
            <Label>Name</Label>
            <Input placeholder="Your name" />
            <FormHelperText>We'll use this on your profile.</FormHelperText>
          </FormField>
          <FormField state="error">
            <Label>Email</Label>
            <Input defaultValue="not-an-email" />
            <FormHelperText>Please enter a valid email.</FormHelperText>
          </FormField>
          <FormField>
            <Label>Search</Label>
            <Input startSection={<IconSearch />} placeholder="Search…" />
          </FormField>
          <FormField>
            <Label>Select</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Apple</SelectItem>
                <SelectItem value="b">Banana</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField>
            <Label>Textarea</Label>
            <Textarea placeholder="Write something…" />
          </FormField>
          <FormField state="warning">
            <Label>Disabled</Label>
            <Input disabled defaultValue="Cannot edit" />
            <FormHelperText>Locked by admin.</FormHelperText>
          </FormField>
        </div>
      </Section>

      <Section title="Checkboxes, Radios, Switches">
        <div className="flex flex-wrap items-center gap-ds-05">
          <label className="flex items-center gap-ds-02"><Checkbox /> Unchecked</label>
          <label className="flex items-center gap-ds-02"><Checkbox defaultChecked /> Checked</label>
          <label className="flex items-center gap-ds-02"><Checkbox disabled /> Disabled</label>
          <RadioGroup defaultValue="one" className="flex gap-ds-04">
            <label className="flex items-center gap-ds-02"><RadioGroupItem value="one" /> One</label>
            <label className="flex items-center gap-ds-02"><RadioGroupItem value="two" /> Two</label>
          </RadioGroup>
          <label className="flex items-center gap-ds-02"><Switch /> Off</label>
          <label className="flex items-center gap-ds-02"><Switch defaultChecked /> On</label>
        </div>
      </Section>

      <Section title="Alerts, Banners, Progress">
        <Alert color="info" title="Info alert">Heads up — this is informational.</Alert>
        <Alert color="success" variant="solid" title="Success alert (solid)">All saved.</Alert>
        <Alert color="warning" title="Warning">Something needs attention.</Alert>
        <Alert color="error" variant="solid" title="Error (solid)">
          Error foreground should remain legible.
        </Alert>
        <Banner color="info">Banner — compact info strip.</Banner>
        <div className="space-y-ds-03">
          <Progress value={40} />
          <Progress value={75} color="success" />
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Everything routine.</CardDescription>
            </CardHeader>
            <CardContent>Body content here.</CardContent>
            <CardFooter><Button variant="outline" size="sm">Action</Button></CardFooter>
          </Card>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated</CardTitle>
              <CardDescription>Stronger shadow — gets stripped in forced-colors.</CardDescription>
            </CardHeader>
            <CardContent>Body content here.</CardContent>
          </Card>
          <Card variant="outline" accent="left" accentColor="success">
            <CardHeader>
              <CardTitle>With accent strip</CardTitle>
              <CardDescription>Strip color remaps to Highlight.</CardDescription>
            </CardHeader>
            <CardContent>Body content here.</CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Tabs, Links, Skeletons">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Overview</TabsTrigger>
            <TabsTrigger value="b">Details</TabsTrigger>
            <TabsTrigger value="c" disabled>Locked</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Overview pane.</TabsContent>
          <TabsContent value="b">Details pane.</TabsContent>
        </Tabs>
        <p className="text-ds-md">
          Prose with a <Link href="#">regular link</Link> and a{' '}
          <Link href="#" className="text-link-visited">visited-style link</Link>.
        </p>
        <div className="space-y-ds-03">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </Section>

      <Section title="Dialog (opens overlay)">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm action</DialogTitle>
              <DialogDescription>
                Dialog surfaces render as Canvas in forced-colors. Backdrop
                collapses; modal chrome relies on its border.
              </DialogDescription>
            </DialogHeader>
            <FormField>
              <Label>Reason</Label>
              <Input placeholder="Optional note" />
            </FormField>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="solid" color="error">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Focus ring verification">
        <p className="text-ds-md text-surface-fg-muted">
          Tab through the elements below. Every one should show a visible
          outline (system <code>Highlight</code>) on focus.
        </p>
        <div className="flex flex-wrap gap-ds-03">
          <Button variant="ghost">Ghost 1</Button>
          <Button variant="ghost">Ghost 2</Button>
          <a href="#" className="text-link underline">Anchor link</a>
          <Input placeholder="Tab here" className="w-48" />
          <Checkbox />
          <Switch />
        </div>
      </Section>

      <Section title="Avatar-like circles / StatusDot substitute">
        <p className="text-ds-md text-surface-fg-muted">
          These rely on color alone to communicate state — in forced-colors
          they collapse to the same shade. Pair with text/iconography for
          meaning.
        </p>
        <div className="flex items-center gap-ds-03">
          <span className="size-3 rounded-full bg-success-9" /> <span>Online</span>
          <span className="size-3 rounded-full bg-warning-9" /> <span>Away</span>
          <span className="size-3 rounded-full bg-error-9" /> <span>Busy</span>
          <span className="size-3 rounded-full bg-surface-border" /> <span>Offline</span>
        </div>
      </Section>

      <Section title="Icon-only button">
        <div className="flex gap-ds-03">
          <Button variant="ghost" size="icon" aria-label="Profile"><Icon icon={IconUser} /></Button>
          <Button variant="solid" color="error" size="icon" aria-label="Delete"><Icon icon={IconX} /></Button>
        </div>
      </Section>
    </div>
  ),
}
