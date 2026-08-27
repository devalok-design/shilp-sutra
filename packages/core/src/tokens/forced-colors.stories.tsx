import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconX, IconSearch, IconUser, IconPlus } from '@tabler/icons-react'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { BadgeIndicator } from '../ui/badge-indicator'
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
    <section className="space-y-ds-04 border border-surface-border rounded-ds-md p-ds-05 bg-surface-panel">
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

      <Section title="Alerts — subtle (default)">
        <Alert color="info" title="Info">Heads up — this is informational.</Alert>
        <Alert color="success" title="Success">All saved.</Alert>
        <Alert color="warning" title="Warning">Something needs attention.</Alert>
        <Alert color="error" title="Error">Subtle error — step-3 bg, step-11 text.</Alert>
      </Section>

      <Section title="Alerts — solid (step-9 bg, fg text)">
        <Alert color="info" variant="solid" title="Info">Solid info.</Alert>
        <Alert color="success" variant="solid" title="Success">Solid success.</Alert>
        <Alert color="warning" variant="solid" title="Warning">Solid warning.</Alert>
        <Alert color="error" variant="solid" title="Error">Solid error — foreground must stay legible.</Alert>
      </Section>

      <Section title="Solid-bg legibility matrix">
        <p className="text-ds-sm text-surface-fg-muted">
          Every component that renders text or an icon over a saturated step-9
          background, shown side-by-side across status colors. Any contrast
          regression (grey-on-saturated, white-on-light-amber, etc.) should
          jump out immediately. Warning is the canary — its step-9 is a lighter
          amber and requires dark text (<code>--color-warning-fg</code>).
        </p>

        {/* Buttons */}
        <div>
          <div className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wider mb-ds-02">Button (solid)</div>
          <div className="flex flex-wrap gap-ds-02">
            <Button variant="solid" color="accent">Accent</Button>
            <Button variant="solid" color="error">Error</Button>
            <Button variant="solid" color="success">Success</Button>
            <Button variant="solid" color="warning">Warning</Button>
            <Button variant="solid" color="neutral">Neutral</Button>
          </div>
        </div>

        {/* Button icon slot */}
        <div>
          <div className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wider mb-ds-02">Button with icon (solid)</div>
          <div className="flex flex-wrap gap-ds-02">
            <Button variant="solid" color="accent" startIcon={<Icon icon={IconPlus} />}>New</Button>
            <Button variant="solid" color="error" startIcon={<Icon icon={IconX} />}>Delete</Button>
            <Button variant="solid" color="success" startIcon={<Icon icon={IconPlus} />}>Approve</Button>
            <Button variant="solid" color="warning" startIcon={<Icon icon={IconPlus} />}>Pending</Button>
          </div>
        </div>

        {/* Badges */}
        <div>
          <div className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wider mb-ds-02">Badge (solid)</div>
          <div className="flex flex-wrap gap-ds-02">
            <Badge variant="solid" color="accent">Accent</Badge>
            <Badge variant="solid" color="error">Error</Badge>
            <Badge variant="solid" color="success">Success</Badge>
            <Badge variant="solid" color="warning">Warning</Badge>
            <Badge variant="solid" color="info">Info</Badge>
            <Badge variant="solid" color="neutral">Neutral</Badge>
          </div>
        </div>

        {/* BadgeIndicator over Avatar-like anchors */}
        <div>
          <div className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wider mb-ds-02">BadgeIndicator (counter)</div>
          <div className="flex flex-wrap items-center gap-ds-06">
            {(['accent', 'error', 'success', 'warning', 'info'] as const).map((c) => (
              <BadgeIndicator key={c} count={12} color={c}>
                <span className="inline-flex h-ds-md w-ds-md items-center justify-center rounded-ds-full bg-surface-panel-hover text-surface-fg-muted border border-surface-border-strong">
                  <Icon icon={IconUser} size="sm" />
                </span>
              </BadgeIndicator>
            ))}
          </div>
        </div>

        {/* Counter pills (freeform, like NotificationCenter / TopBar / BottomNavbar) */}
        <div>
          <div className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wider mb-ds-02">Counter pills (error-9 bg, error-fg text)</div>
          <div className="flex flex-wrap items-center gap-ds-04">
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error-9 px-0.5 text-[10px] font-semibold leading-none text-error-fg">
              3
            </span>
            <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-ds-full bg-error-9 px-ds-02 text-[10px] font-semibold leading-none text-error-fg">
              12
            </span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error-9 px-1 text-[11px] font-bold leading-none text-error-fg">
              99+
            </span>
          </div>
        </div>

        {/* Check/radio/switch checked states */}
        <div>
          <div className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wider mb-ds-02">Checkable states (accent-9 bg checked)</div>
          <div className="flex flex-wrap items-center gap-ds-05">
            <label className="flex items-center gap-ds-02"><Checkbox defaultChecked /> Checked</label>
            <label className="flex items-center gap-ds-02"><Checkbox defaultChecked indeterminate /> Indeterminate</label>
            <RadioGroup defaultValue="one" className="flex gap-ds-04">
              <label className="flex items-center gap-ds-02"><RadioGroupItem value="one" /> Selected radio</label>
            </RadioGroup>
            <label className="flex items-center gap-ds-02"><Switch defaultChecked /> On</label>
          </div>
        </div>

        {/* Pass/fail quick-scan reference */}
        <div className="rounded-ds-sm border border-surface-border-subtle bg-surface-base p-ds-03 text-ds-xs text-surface-fg-muted">
          <strong className="text-surface-fg">What to look for:</strong> every label above must be
          crisply readable against its background. Grey-on-saturated, white-on-light-amber, or any
          washed-out rendering = bug. Check both light + dark mode via the Storybook theme toolbar,
          then forced-colors emulation via DevTools → Rendering.
        </div>
      </Section>

      <Section title="Banners & Progress">
        <Banner color="info">Info banner — compact full-width strip.</Banner>
        <Banner color="success">Success banner.</Banner>
        <Banner color="warning">Warning banner.</Banner>
        <Banner color="error">Error banner.</Banner>
        <div className="space-y-ds-03 pt-ds-03">
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
          <Card variant="outline" color="success">
            <CardHeader>
              <CardTitle>Colored border</CardTitle>
              <CardDescription>Border color remaps to Highlight.</CardDescription>
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

      <Section title="Avatar-like circles / Dot substitute">
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
