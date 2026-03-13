import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { cn } from './lib/utils'
import {
  IconBell,
  IconCheck,
  IconMail,
  IconSend,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { durations, easings } from './lib/motion'
import { Button } from './button'
import { Switch } from './switch'
import { Checkbox } from './checkbox'
import { Input } from './input'
import { Chip } from './chip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './sheet'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
import { Skeleton } from './skeleton'
import { Progress } from './progress'
import { Spinner } from './spinner'
import { Badge } from './badge'
import { Label } from './label'
import { Fade, Collapse, Grow, Slide } from './transitions'

const meta: Meta = {
  title: 'Foundations/Motion',
  tags: [],
}
export default meta

/* ---------------------------------------------------------------------------
 * Helper: reusable animate button
 * ------------------------------------------------------------------------ */
function AnimateButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-ds-md border border-surface-border-strong px-ds-04 py-ds-02 text-ds-sm text-surface-fg hover:bg-surface-2 transition-colors duration-fast-01 ease-productive-standard"
    >
      {active ? 'Reset' : 'Animate'}
    </button>
  )
}

/* ---------------------------------------------------------------------------
 * Section header used in gallery stories
 * ------------------------------------------------------------------------ */
function SectionLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-ds-04">
      <h3 className="text-ds-lg font-semibold text-surface-fg">{children}</h3>
      {sub && <p className="text-ds-sm text-surface-fg-muted mt-ds-01">{sub}</p>}
    </div>
  )
}

function TokenBadge({ children }: { children: React.ReactNode }) {
  return (
    <code className="inline-block rounded-ds-sm bg-surface-2 px-ds-02b py-ds-01 text-ds-xs text-surface-fg-muted font-mono">
      {children}
    </code>
  )
}

/* ===========================================================================
 * 1. TOKEN REFERENCE — Duration Scale
 * ========================================================================= */

/**
 * Interactive visualization of all 7 duration tokens.
 * Click "Animate" to see each duration in action.
 */
export const DurationScale: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const tokens = Object.entries(durations) as [string, string][]
    return (
      <div className="space-y-ds-04">
        <AnimateButton active={active} onClick={() => setActive((p) => !p)} />
        <div className="space-y-ds-03">
          {tokens.map(([name, value]) => (
            <div key={name} className="flex items-center gap-ds-04">
              <code className="w-40 text-ds-xs text-surface-fg-muted font-mono">
                {name} ({value})
              </code>
              <div className="relative h-8 flex-1 rounded-ds-sm bg-surface-2 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-ds-sm bg-accent-9"
                  style={{
                    width: active ? '100%' : '0%',
                    transition: `width ${value} var(--ease-productive-standard)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 2. TOKEN REFERENCE — Easing Comparison
 * ========================================================================= */

/**
 * Side-by-side comparison of productive vs. expressive easing.
 * Both use 400ms duration so you can see the easing difference clearly.
 */
export const EasingComparison: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const categories = ['standard', 'entrance', 'exit'] as const
    return (
      <div className="space-y-ds-04">
        <AnimateButton active={active} onClick={() => setActive((p) => !p)} />
        <div className="grid grid-cols-2 gap-ds-06">
          <div>
            <h3 className="text-ds-sm font-semibold text-surface-fg mb-ds-03">
              Productive
            </h3>
            {categories.map((cat) => (
              <div key={cat} className="mb-ds-03">
                <code className="text-ds-xs text-surface-fg-muted">{cat}</code>
                <div className="relative h-6 mt-ds-01 rounded-ds-sm bg-surface-2 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-ds-sm bg-accent-9"
                    style={{
                      width: active ? '100%' : '0%',
                      transition: `width 400ms var(--ease-productive-${cat})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-ds-sm font-semibold text-surface-fg mb-ds-03">
              Expressive
            </h3>
            {categories.map((cat) => (
              <div key={cat} className="mb-ds-03">
                <code className="text-ds-xs text-surface-fg-muted">{cat}</code>
                <div className="relative h-6 mt-ds-01 rounded-ds-sm bg-surface-2 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-ds-sm bg-brand-primary"
                    style={{
                      width: active ? '100%' : '0%',
                      transition: `width 400ms var(--ease-expressive-${cat})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 3. EASING PERSONALITY — Same animation, all 8 easings
 * ========================================================================= */

/**
 * Demonstrates the personality of each easing curve using the same sliding-dot
 * animation. Productive = efficient & snappy, Expressive = dramatic & bouncy.
 */
export const EasingPersonality: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const allEasings = [
      ...Object.entries(easings.productive).map(([cat, val]) => ({
        label: `productive-${cat}`,
        value: val,
        mode: 'productive' as const,
      })),
      ...Object.entries(easings.expressive).map(([cat, val]) => ({
        label: `expressive-${cat}`,
        value: val,
        mode: 'expressive' as const,
      })),
      { label: 'bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', mode: 'utility' as const },
      { label: 'linear', value: 'linear', mode: 'utility' as const },
    ]

    return (
      <div className="space-y-ds-04">
        <AnimateButton active={active} onClick={() => setActive((p) => !p)} />
        <p className="text-ds-sm text-surface-fg-muted">
          All dots travel the same distance in 600ms. Watch how each easing changes the feel.
        </p>
        <div className="space-y-ds-04">
          {allEasings.map(({ label, value, mode }) => (
            <div key={label} className="flex items-center gap-ds-04">
              <div className="w-48 flex items-center gap-ds-02">
                <span
                  className={cn(
                    'inline-block h-2 w-2 rounded-ds-full',
                    mode === 'productive'
                      ? 'bg-accent-9'
                      : mode === 'expressive'
                        ? 'bg-brand-primary'
                        : 'bg-warning-9',
                  )}
                />
                <code className="text-ds-xs text-surface-fg-muted font-mono">{label}</code>
              </div>
              <div className="relative flex-1 h-8 rounded-ds-sm bg-surface-2">
                <div
                  className="absolute top-1 h-6 w-6 rounded-ds-full bg-accent-9 shadow-02"
                  style={{
                    left: active ? 'calc(100% - 1.5rem)' : '0',
                    transition: `left 600ms ${value}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 4. COMPONENT GALLERY — Fast Micro-Interactions (duration-fast-01, 70ms)
 * ========================================================================= */

/**
 * Real components using fast-01 (70ms) productive motion.
 * These are snappy, task-focused interactions — hover, toggle, focus.
 */
export const FastMicroInteractions: StoryObj = {
  render: () => {
    const [checked, setChecked] = useState(false)
    const [switchOn, setSwitchOn] = useState(false)
    const [chips, setChips] = useState(['React', 'TypeScript', 'Tailwind'])

    return (
      <div className="space-y-ds-08 max-w-2xl">
        <div>
          <SectionLabel sub="duration-fast-01 (70ms) + ease-productive-standard">
            Fast Micro-Interactions
          </SectionLabel>
          <p className="text-ds-sm text-surface-fg-muted mb-ds-06">
            Snappy, utilitarian transitions for task-focused interactions. Hover over and click
            these components to feel the 70ms productive motion.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Button hover & press</h4>
          <div className="flex flex-wrap gap-ds-03">
            <Button variant="solid">Solid</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="solid" color="error">Error</Button>
            <Button variant="link">Link</Button>
          </div>
          <TokenBadge>transition-[color,background-color,border-color,box-shadow] duration-fast-01</TokenBadge>
        </div>

        {/* Switch */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Switch toggle</h4>
          <div className="flex items-center gap-ds-03">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
            <Label>{switchOn ? 'Enabled' : 'Disabled'}</Label>
          </div>
          <TokenBadge>transition-colors duration-fast-01 (track) + transition-transform duration-fast-01 (thumb)</TokenBadge>
        </div>

        {/* Checkbox */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Checkbox check</h4>
          <div className="flex items-center gap-ds-03">
            <Checkbox checked={checked} onCheckedChange={() => setChecked((p) => !p)} />
            <Label>{checked ? 'Checked' : 'Unchecked'}</Label>
          </div>
          <TokenBadge>transition-colors duration-fast-01</TokenBadge>
        </div>

        {/* Input focus */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Input focus ring</h4>
          <Input placeholder="Click to focus — watch the border transition" className="max-w-sm" />
          <TokenBadge>transition-colors duration-fast-01</TokenBadge>
        </div>

        {/* Tabs */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Tab switching</h4>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-ds-sm text-surface-fg-muted">Overview content — tab indicator slides at 70ms.</p>
            </TabsContent>
            <TabsContent value="analytics">
              <p className="text-ds-sm text-surface-fg-muted">Analytics content.</p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-ds-sm text-surface-fg-muted">Settings content.</p>
            </TabsContent>
          </Tabs>
          <TokenBadge>transition-[color,background-color,border-color,box-shadow] duration-fast-01</TokenBadge>
        </div>

        {/* Chips */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Chip interactions</h4>
          <div className="flex flex-wrap gap-ds-02">
            {chips.map((label) => (
              <Chip
                key={label}
                label={label}
                variant="outline"
                onDismiss={() => setChips((prev) => prev.filter((c) => c !== label))}
              />
            ))}
            {chips.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChips(['React', 'TypeScript', 'Tailwind'])}
              >
                Restore chips
              </Button>
            )}
          </div>
          <TokenBadge>transition-colors duration-fast-01</TokenBadge>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 5. COMPONENT GALLERY — Medium Reveals (duration-moderate-01/02, 150-240ms)
 * ========================================================================= */

/**
 * Components with moderate duration reveals — accordion, tooltip, dialog, sheet.
 * These use 150-240ms with productive or expressive easing depending on importance.
 */
export const MediumReveals: StoryObj = {
  render: () => {
    return (
      <TooltipProvider>
        <div className="space-y-ds-08 max-w-2xl">
          <div>
            <SectionLabel sub="duration-moderate-01/02 (150-240ms)">
              Medium Reveals
            </SectionLabel>
            <p className="text-ds-sm text-surface-fg-muted mb-ds-06">
              Content reveals and attention-drawing moments. Productive easing for task UI,
              expressive easing for significant moments like dialogs.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">
              Accordion expand/collapse
            </h4>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What motion tokens does this use?</AccordionTrigger>
                <AccordionContent>
                  The chevron rotates with <code className="text-ds-xs font-mono">duration-moderate-02</code> and
                  the content expands with <code className="text-ds-xs font-mono">ease-productive-standard</code>.
                  This makes the expand feel smooth and functional.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Why productive instead of expressive?</AccordionTrigger>
                <AccordionContent>
                  Accordion is a task-focused component. Users expand sections to find information,
                  not to be delighted. Productive motion gets out of the way.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How does reduced motion affect this?</AccordionTrigger>
                <AccordionContent>
                  When <code className="text-ds-xs font-mono">prefers-reduced-motion: reduce</code> is
                  active, all transition durations collapse to 0.01ms. The content still appears,
                  just without animation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <TokenBadge>duration-moderate-02 (240ms) + ease-productive-standard</TokenBadge>
          </div>

          {/* Tooltip */}
          <div className="space-y-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Tooltip entrance</h4>
            <div className="flex gap-ds-04">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" startIcon={<IconUser />}>
                    Hover me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Profile settings</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-md">
                    <IconSettings />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open settings</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-md">
                    <IconBell />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>3 new notifications</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TokenBadge>duration-fast-02 (110ms) + ease-productive-entrance</TokenBadge>
          </div>

          {/* Dialog */}
          <div className="space-y-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Dialog entrance (expressive)</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Motion: Expressive Entrance</DialogTitle>
                  <DialogDescription>
                    This dialog uses <code className="font-mono">duration-moderate-02</code> with
                    expressive entrance easing. The overlay fades in while the content
                    zooms and slides — creating a dramatic, attention-drawing moment.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-ds-md bg-surface-2 p-ds-04 space-y-ds-02">
                  <div className="flex items-center gap-ds-02">
                    <TokenBadge>duration-moderate-02 (240ms)</TokenBadge>
                    <span className="text-ds-xs text-surface-fg-muted">overlay + content</span>
                  </div>
                  <div className="flex items-center gap-ds-02">
                    <TokenBadge>ease-expressive-entrance</TokenBadge>
                    <span className="text-ds-xs text-surface-fg-muted">zoom-in + fade-in</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <TokenBadge>duration-moderate-02 (240ms) + expressive entrance</TokenBadge>
          </div>

          {/* Sheet */}
          <div className="space-y-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Sheet slide-in</h4>
            <div className="flex gap-ds-03">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Right Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet Panel</SheetTitle>
                    <SheetDescription>
                      Slides in from the right with productive-standard easing at 240ms.
                      Sheet panels are task-focused — they use productive motion.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-ds-06 space-y-ds-04">
                    <div className="rounded-ds-md bg-surface-2 p-ds-04">
                      <TokenBadge>ease-productive-standard duration-moderate-02</TokenBadge>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <TokenBadge>duration-moderate-02 (240ms) + ease-productive-standard</TokenBadge>
          </div>
        </div>
      </TooltipProvider>
    )
  },
}

/* ===========================================================================
 * 6. COMPONENT GALLERY — Slow & Continuous (duration-slow-01/02, 400-700ms)
 * ========================================================================= */

/**
 * Slow, continuous animations — skeleton shimmer, progress bars, spinners.
 * These run indefinitely and use linear or productive-standard easing.
 */
export const SlowAndContinuous: StoryObj = {
  render: () => {
    const [progress, setProgress] = useState(0)
    const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

    const startProgress = () => {
      setProgress(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return 100
          }
          return p + 2
        })
      }, 50)
    }

    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, [])

    return (
      <div className="space-y-ds-08 max-w-2xl">
        <div>
          <SectionLabel sub="duration-slow-01/02 (400-700ms) + linear/productive">
            Slow & Continuous
          </SectionLabel>
          <p className="text-ds-sm text-surface-fg-muted mb-ds-06">
            Long-running animations for loading states. These use slow durations
            with linear easing for smooth, non-distracting loops.
          </p>
        </div>

        {/* Skeleton shimmer */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Skeleton shimmer</h4>
          <div className="space-y-ds-03 max-w-sm">
            <div className="flex items-center gap-ds-04">
              <Skeleton variant="circle" className="h-12 w-12" animation="shimmer" />
              <div className="flex-1 space-y-ds-02">
                <Skeleton variant="text" className="w-3/4" animation="shimmer" />
                <Skeleton variant="text" className="w-1/2" animation="shimmer" />
              </div>
            </div>
            <Skeleton variant="rectangle" className="h-32 w-full" animation="shimmer" />
            <div className="space-y-ds-02">
              <Skeleton variant="text" animation="shimmer" />
              <Skeleton variant="text" className="w-5/6" animation="shimmer" />
              <Skeleton variant="text" className="w-2/3" animation="shimmer" />
            </div>
          </div>
          <TokenBadge>animate-skeleton-shimmer — duration-slow-02 (700ms) + ease-linear</TokenBadge>
        </div>

        {/* Progress */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Progress bar</h4>
          <div className="space-y-ds-04 max-w-sm">
            <div className="space-y-ds-02">
              <span className="text-ds-sm text-surface-fg-muted">Determinate</span>
              <Progress value={progress} showLabel />
              <Button variant="outline" size="sm" onClick={startProgress}>
                {progress >= 100 ? 'Restart' : 'Start'}
              </Button>
            </div>
            <div className="space-y-ds-02">
              <span className="text-ds-sm text-surface-fg-muted">Indeterminate</span>
              <Progress />
            </div>
          </div>
          <TokenBadge>animate-progress-indeterminate — duration-slow-02 (700ms)</TokenBadge>
        </div>

        {/* Spinner */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Spinner</h4>
          <div className="flex items-center gap-ds-06">
            <div className="flex flex-col items-center gap-ds-02">
              <Spinner size="sm" />
              <span className="text-ds-xs text-surface-fg-muted">sm</span>
            </div>
            <div className="flex flex-col items-center gap-ds-02">
              <Spinner size="md" />
              <span className="text-ds-xs text-surface-fg-muted">md</span>
            </div>
            <div className="flex flex-col items-center gap-ds-02">
              <Spinner size="lg" />
              <span className="text-ds-xs text-surface-fg-muted">lg</span>
            </div>
          </div>
          <TokenBadge>animate-spin — continuous ease-linear</TokenBadge>
        </div>

        {/* Button loading states */}
        <div className="space-y-ds-03">
          <h4 className="text-ds-md font-medium text-surface-fg">Button loading states</h4>
          <div className="flex flex-wrap gap-ds-03">
            <Button loading loadingPosition="start">Saving...</Button>
            <Button loading loadingPosition="center">Processing</Button>
            <Button variant="outline" loading loadingPosition="end">Uploading...</Button>
          </div>
          <TokenBadge>Spinner inherits animate-spin from parent context</TokenBadge>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 7. TRANSITION UTILITIES — Fade, Collapse, Grow, Slide
 * ========================================================================= */

/**
 * The transition utility components from transitions.tsx, demonstrated with
 * interactive toggles. These are building blocks for custom animations.
 */
export const TransitionUtilities: StoryObj = {
  render: () => {
    const [fadeOpen, setFadeOpen] = useState(true)
    const [collapseOpen, setCollapseOpen] = useState(true)
    const [growOpen, setGrowOpen] = useState(true)
    const [slideOpen, setSlideOpen] = useState(true)

    return (
      <div className="space-y-ds-08 max-w-2xl">
        <div>
          <SectionLabel sub="Composable transition primitives">
            Transition Utilities
          </SectionLabel>
          <p className="text-ds-sm text-surface-fg-muted mb-ds-06">
            Low-level transition wrappers that respect reduced-motion preferences.
            Use these for custom reveal animations in your layouts.
          </p>
        </div>

        {/* Fade */}
        <div className="space-y-ds-03">
          <div className="flex items-center gap-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Fade</h4>
            <Button variant="ghost" size="sm" onClick={() => setFadeOpen((p) => !p)}>
              Toggle
            </Button>
            <TokenBadge>ease-productive-entrance</TokenBadge>
          </div>
          <Fade open={fadeOpen}>
            <div className="rounded-ds-md bg-surface-2 border border-surface-border-strong p-ds-05">
              <p className="text-ds-sm text-surface-fg-muted">
                This content fades in and out with <code className="font-mono">opacity</code> transition.
              </p>
            </div>
          </Fade>
        </div>

        {/* Collapse */}
        <div className="space-y-ds-03">
          <div className="flex items-center gap-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Collapse</h4>
            <Button variant="ghost" size="sm" onClick={() => setCollapseOpen((p) => !p)}>
              Toggle
            </Button>
            <TokenBadge>ease-productive-standard</TokenBadge>
          </div>
          <Collapse open={collapseOpen}>
            <div className="rounded-ds-md bg-surface-2 border border-surface-border-strong p-ds-05">
              <p className="text-ds-sm text-surface-fg-muted">
                Height-based collapse/expand. Great for accordion-like reveals
                where content pushes below it.
              </p>
            </div>
          </Collapse>
        </div>

        {/* Grow */}
        <div className="space-y-ds-03">
          <div className="flex items-center gap-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Grow</h4>
            <Button variant="ghost" size="sm" onClick={() => setGrowOpen((p) => !p)}>
              Toggle
            </Button>
            <TokenBadge>ease-productive-entrance</TokenBadge>
          </div>
          <Grow open={growOpen}>
            <div className="rounded-ds-md bg-surface-2 border border-surface-border-strong p-ds-05 inline-block">
              <p className="text-ds-sm text-surface-fg-muted">
                Scales from 0 to 1 with opacity. Good for popover-like reveals.
              </p>
            </div>
          </Grow>
        </div>

        {/* Slide */}
        <div className="space-y-ds-03">
          <div className="flex items-center gap-ds-03">
            <h4 className="text-ds-md font-medium text-surface-fg">Slide</h4>
            <Button variant="ghost" size="sm" onClick={() => setSlideOpen((p) => !p)}>
              Toggle
            </Button>
            <TokenBadge>ease-productive-entrance</TokenBadge>
          </div>
          <div className="overflow-hidden rounded-ds-md border border-surface-border-strong">
            <Slide open={slideOpen} direction="up">
              <div className="bg-surface-2 p-ds-05">
                <p className="text-ds-sm text-surface-fg-muted">
                  Slides in from a direction (up/down/left/right). Used for bottom sheets,
                  slide-in panels, and notification bars.
                </p>
              </div>
            </Slide>
          </div>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 8. SCENARIO — Form Submission Flow
 * ========================================================================= */

/**
 * A realistic form submission scenario showing multiple motion tiers working together:
 * Input focus (fast-01) -> Button loading (fast-01 + spin) -> Success feedback (moderate-02).
 */
export const ScenarioFormSubmission: StoryObj = {
  name: 'Scenario: Form Submission',
  render: () => {
    const [step, setStep] = useState<'idle' | 'submitting' | 'success'>('idle')

    const handleSubmit = () => {
      setStep('submitting')
      setTimeout(() => setStep('success'), 1500)
      setTimeout(() => setStep('idle'), 4000)
    }

    return (
      <div className="space-y-ds-06 max-w-md">
        <div>
          <SectionLabel sub="Multiple motion tiers in one flow">
            Scenario: Form Submission
          </SectionLabel>
          <p className="text-ds-sm text-surface-fg-muted mb-ds-04">
            Watch how different duration tiers create a cohesive experience:
            input focus is instant (70ms), the button spinner is continuous,
            and the success feedback fades in at 240ms.
          </p>
        </div>

        <div className="rounded-ds-xl border border-surface-border-strong bg-surface-1 p-ds-06 space-y-ds-05">
          <div className="space-y-ds-02">
            <Label>Email address</Label>
            <Input
              type="email"
              placeholder="team@devalok.com"
              startIcon={<IconMail />}
              disabled={step !== 'idle'}
            />
          </div>
          <div className="space-y-ds-02">
            <Label>Message</Label>
            <Input
              placeholder="What's on your mind?"
              disabled={step !== 'idle'}
            />
          </div>

          <Button
            fullWidth
            loading={step === 'submitting'}
            loadingPosition="start"
            startIcon={step === 'success' ? <IconCheck /> : <IconSend />}
            variant={step === 'success' ? 'secondary' : 'primary'}
            onClick={handleSubmit}
            disabled={step !== 'idle'}
          >
            {step === 'idle' && 'Send Message'}
            {step === 'submitting' && 'Sending...'}
            {step === 'success' && 'Sent!'}
          </Button>

          {/* Success feedback */}
          <Fade open={step === 'success'}>
            <div className="flex items-center gap-ds-03 rounded-ds-md bg-success-3 border border-success-7 p-ds-04">
              <IconCheck className="h-ico-md w-ico-md text-success-11" />
              <div>
                <p className="text-ds-sm font-medium text-success-11">Message sent successfully</p>
                <p className="text-ds-xs text-success-11 opacity-80">We'll get back to you soon.</p>
              </div>
            </div>
          </Fade>
        </div>

        <div className="space-y-ds-02">
          <p className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wide">Motion breakdown</p>
          <div className="grid grid-cols-3 gap-ds-03">
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">fast-01</p>
              <p className="text-ds-xs text-surface-fg">Input focus</p>
            </div>
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">continuous</p>
              <p className="text-ds-xs text-surface-fg">Button spinner</p>
            </div>
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">moderate-02</p>
              <p className="text-ds-xs text-surface-fg">Success fade</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 9. SCENARIO — Dashboard Loading
 * ========================================================================= */

/**
 * Progressive loading pattern: skeleton shimmer -> content fade-in.
 * Shows how slow and moderate motion tiers create a cohesive loading experience.
 */
export const ScenarioDashboardLoading: StoryObj = {
  name: 'Scenario: Dashboard Loading',
  render: () => {
    const [loading, setLoading] = useState(true)

    const reload = () => {
      setLoading(true)
      setTimeout(() => setLoading(false), 2000)
    }

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 2000)
      return () => clearTimeout(timer)
    }, [])

    return (
      <div className="space-y-ds-06 max-w-lg">
        <div>
          <SectionLabel sub="Skeleton shimmer -> content fade-in">
            Scenario: Dashboard Loading
          </SectionLabel>
          <div className="flex items-center gap-ds-03 mb-ds-04">
            <Button variant="outline" size="sm" onClick={reload}>
              Reload
            </Button>
            <span className="text-ds-xs text-surface-fg-muted">
              {loading ? 'Loading (2s)...' : 'Loaded!'}
            </span>
          </div>
        </div>

        <div className="rounded-ds-xl border border-surface-border-strong bg-surface-1 p-ds-06 space-y-ds-06">
          {/* Header area */}
          <div className="flex items-center justify-between">
            {loading ? (
              <>
                <Skeleton variant="text" className="w-32 h-6" animation="shimmer" />
                <Skeleton variant="rectangle" className="w-20 h-8" animation="shimmer" />
              </>
            ) : (
              <Fade open={!loading}>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-ds-lg font-semibold text-surface-fg">Dashboard</h3>
                  <Button size="sm" variant="outline">Export</Button>
                </div>
              </Fade>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-ds-04">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-ds-md bg-surface-2 p-ds-04 space-y-ds-02">
                    <Skeleton variant="text" className="w-16 h-3" animation="shimmer" />
                    <Skeleton variant="text" className="w-10 h-6" animation="shimmer" />
                  </div>
                ))
              : [
                  { label: 'Tasks', value: '42', color: 'info' as const },
                  { label: 'Completed', value: '28', color: 'success' as const },
                  { label: 'Overdue', value: '3', color: 'error' as const },
                ].map((stat) => (
                  <Fade key={stat.label} open={!loading}>
                    <div className="rounded-ds-md bg-surface-2 p-ds-04">
                      <p className="text-ds-xs text-surface-fg-muted">{stat.label}</p>
                      <div className="flex items-center gap-ds-02 mt-ds-01">
                        <span className="text-ds-xl font-semibold text-surface-fg">{stat.value}</span>
                        <Badge color={stat.color} size="sm">{stat.label}</Badge>
                      </div>
                    </div>
                  </Fade>
                ))}
          </div>

          {/* List skeleton */}
          <div className="space-y-ds-03">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-ds-04">
                    <Skeleton variant="circle" className="h-8 w-8" animation="shimmer" />
                    <div className="flex-1 space-y-ds-02">
                      <Skeleton variant="text" className="w-3/4" animation="shimmer" />
                      <Skeleton variant="text" className="w-1/2" animation="shimmer" />
                    </div>
                  </div>
                ))
              : [
                  { name: 'Review design specs', badge: 'In Progress' },
                  { name: 'Update motion tokens', badge: 'Done' },
                  { name: 'Write component tests', badge: 'Planned' },
                ].map((task) => (
                  <Fade key={task.name} open={!loading}>
                    <div className="flex items-center gap-ds-04">
                      <div className="h-8 w-8 rounded-ds-full bg-accent-2 flex items-center justify-center">
                        <IconCheck className="h-ico-sm w-ico-sm text-accent-11" />
                      </div>
                      <div className="flex-1">
                        <p className="text-ds-sm text-surface-fg">{task.name}</p>
                        <p className="text-ds-xs text-surface-fg-muted">{task.badge}</p>
                      </div>
                    </div>
                  </Fade>
                ))}
          </div>
        </div>

        <div className="space-y-ds-02">
          <p className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wide">Motion breakdown</p>
          <div className="grid grid-cols-2 gap-ds-03">
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">slow-02 (700ms)</p>
              <p className="text-ds-xs text-surface-fg">Skeleton shimmer loop</p>
            </div>
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">moderate-02 (240ms)</p>
              <p className="text-ds-xs text-surface-fg">Content fade-in</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 10. SCENARIO — Notification Center
 * ========================================================================= */

/**
 * Interactive notification scenario: badge pulse, sheet slide, chip dismiss.
 * Shows how micro-interactions and reveals combine in a realistic workflow.
 */
export const ScenarioNotificationCenter: StoryObj = {
  name: 'Scenario: Notification Center',
  render: () => {
    const [notifications, setNotifications] = useState([
      { id: 1, title: 'New task assigned', desc: 'Review the motion system stories', time: '2m ago', color: 'info' as const },
      { id: 2, title: 'Build succeeded', desc: 'CI pipeline passed all checks', time: '15m ago', color: 'success' as const },
      { id: 3, title: 'Deadline approaching', desc: 'Sprint review is tomorrow', time: '1h ago', color: 'warning' as const },
    ])

    const dismiss = (id: number) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const restore = () => {
      setNotifications([
        { id: 1, title: 'New task assigned', desc: 'Review the motion system stories', time: '2m ago', color: 'info' as const },
        { id: 2, title: 'Build succeeded', desc: 'CI pipeline passed all checks', time: '15m ago', color: 'success' as const },
        { id: 3, title: 'Deadline approaching', desc: 'Sprint review is tomorrow', time: '1h ago', color: 'warning' as const },
      ])
    }

    return (
      <div className="space-y-ds-06 max-w-md">
        <div>
          <SectionLabel sub="Badge + Sheet + dismiss transitions">
            Scenario: Notification Center
          </SectionLabel>
          <p className="text-ds-sm text-surface-fg-muted mb-ds-04">
            Click the bell to open the notification sheet. Dismiss notifications
            to see the collapse transition. Multiple motion tiers work together.
          </p>
        </div>

        <div className="flex items-center gap-ds-04">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" startIcon={<IconBell />}>
                Notifications
                {notifications.length > 0 && (
                  <Badge color="error" size="sm" className="ml-ds-02">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-ds-06 space-y-ds-03">
                {notifications.length === 0 ? (
                  <div className="text-center py-ds-08">
                    <p className="text-ds-sm text-surface-fg-muted">All caught up!</p>
                    <Button variant="ghost" size="sm" className="mt-ds-03" onClick={restore}>
                      Restore notifications
                    </Button>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-ds-03 rounded-ds-md border border-surface-border-strong p-ds-04 transition-colors duration-fast-01 hover:bg-surface-2"
                    >
                      <Badge color={n.color} size="sm" dot>
                        {n.color}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-ds-sm font-medium text-surface-fg">{n.title}</p>
                        <p className="text-ds-xs text-surface-fg-muted">{n.desc}</p>
                        <p className="text-ds-xs text-surface-fg-subtle mt-ds-01">{n.time}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => dismiss(n.id)}
                        aria-label={`Dismiss ${n.title}`}
                      >
                        <span className="text-ds-xs">&times;</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>

          {notifications.length === 0 && (
            <Button variant="ghost" size="sm" onClick={restore}>
              Restore
            </Button>
          )}
        </div>

        <div className="space-y-ds-02">
          <p className="text-ds-xs font-semibold text-surface-fg-muted uppercase tracking-wide">Motion breakdown</p>
          <div className="grid grid-cols-3 gap-ds-03">
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">fast-01</p>
              <p className="text-ds-xs text-surface-fg">Button hover</p>
            </div>
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">moderate-02</p>
              <p className="text-ds-xs text-surface-fg">Sheet slide-in</p>
            </div>
            <div className="rounded-ds-md bg-surface-2 p-ds-03 text-center">
              <p className="text-ds-xs font-mono text-surface-fg-muted">fast-01</p>
              <p className="text-ds-xs text-surface-fg">Card hover</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

/* ===========================================================================
 * 11. REDUCED MOTION — Accessibility demo
 * ========================================================================= */

/**
 * Demonstrates the effect of prefers-reduced-motion.
 * Uses a simulated toggle to show how the system collapses all transitions.
 */
export const ReducedMotionDemo: StoryObj = {
  name: 'Reduced Motion (a11y)',
  render: () => {
    const [reduced, setReduced] = useState(false)
    const [showContent, setShowContent] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!containerRef.current) return
      // Apply simulated reduced-motion to the container's subtree
      if (reduced) {
        containerRef.current.style.setProperty('--sim-duration', '0.01ms')
      } else {
        containerRef.current.style.removeProperty('--sim-duration')
      }
    }, [reduced])

    return (
      <div className="space-y-ds-06 max-w-2xl">
        <div>
          <SectionLabel sub="How the motion system handles prefers-reduced-motion">
            Reduced Motion (Accessibility)
          </SectionLabel>
          <p className="text-ds-sm text-surface-fg-muted mb-ds-04">
            When users have <code className="font-mono text-ds-xs">prefers-reduced-motion: reduce</code> enabled
            in their OS settings, all animation and transition durations collapse to 0.01ms.
            Content still appears and disappears — just instantly, without motion.
          </p>
        </div>

        <div className="rounded-ds-md bg-surface-2 border border-surface-border-strong p-ds-05 space-y-ds-04">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ds-sm font-medium text-surface-fg">Simulate reduced motion</p>
              <p className="text-ds-xs text-surface-fg-muted">
                Toggle to see the difference. In production, this is automatic via CSS media query.
              </p>
            </div>
            <Switch checked={reduced} onCheckedChange={setReduced} />
          </div>
        </div>

        <div ref={containerRef} className="space-y-ds-04">
          <Button
            variant="outline"
            onClick={() => setShowContent((p) => !p)}
          >
            Toggle content
          </Button>

          {/* Animated box */}
          <div
            className="rounded-ds-md bg-accent-2 border border-accent-7 p-ds-05 transition-all ease-productive-entrance"
            style={{
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'translateY(0)' : 'translateY(-8px)',
              transitionDuration: reduced ? '0.01ms' : '240ms',
            }}
          >
            <p className="text-ds-sm text-surface-fg">
              {reduced
                ? 'No motion — content appears/disappears instantly.'
                : 'This box fades and slides with 240ms expressive entrance.'}
            </p>
          </div>

          {/* Progress comparison */}
          <div className="grid grid-cols-2 gap-ds-04">
            <div className="space-y-ds-02">
              <span className="text-ds-xs text-surface-fg-muted">Progress bar</span>
              <Progress value={65} showLabel />
            </div>
            <div className="space-y-ds-02">
              <span className="text-ds-xs text-surface-fg-muted">Skeleton</span>
              <Skeleton
                variant="rectangle"
                className="h-8 w-full"
                animation={reduced ? 'none' : 'shimmer'}
              />
            </div>
          </div>
        </div>

        <div className="rounded-ds-md bg-warning-3 border border-warning-7 p-ds-04">
          <p className="text-ds-sm text-warning-11">
            <strong>How it works in production:</strong> The global CSS rule{' '}
            <code className="font-mono text-ds-xs">@media (prefers-reduced-motion: reduce)</code>{' '}
            sets all <code className="font-mono text-ds-xs">animation-duration</code> and{' '}
            <code className="font-mono text-ds-xs">transition-duration</code> to 0.01ms. No
            per-component changes needed.
          </p>
        </div>
      </div>
    )
  },
}
