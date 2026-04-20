'use client'

// Imports the highest-risk surface of shilp-sutra components for the
// consumer smoke test. If any of these emit a Turbopack build error,
// an invalid CSS rule, a missing module, or a dev-mode warning with
// "shilp-sutra" in the path, the test fails and publish is blocked.
//
// Coverage rationale (high bug density historically):
// - Sidebar: TW3 [--x] arbitrary CSS var, theme() calls, bare `shadow`
// - RichChatInput + RichTextEditor: tiptap → rolldown-runtime CJS require
// - TopBar.Section: React 19 key warning
// - Button / Dialog / DataTable / Tabs / Tooltip / Skeleton / Toast: broad surface
//
// Marked 'use client' so event handler props (onSubmit, onClick) can be
// passed to interactive components without server→client serialization.

import { Avatar, AvatarFallback, AvatarImage } from '@devalok/shilp-sutra/ui/avatar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@devalok/shilp-sutra/ui/accordion'
import { Alert } from '@devalok/shilp-sutra/ui/alert'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Checkbox } from '@devalok/shilp-sutra/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@devalok/shilp-sutra/ui/collapsible'
import { Dialog, DialogContent, DialogTrigger } from '@devalok/shilp-sutra/ui/dialog'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Progress } from '@devalok/shilp-sutra/ui/progress'
import { RadioGroup, RadioGroupItem } from '@devalok/shilp-sutra/ui/radio'
import { Skeleton } from '@devalok/shilp-sutra/ui/skeleton'
import { Spinner } from '@devalok/shilp-sutra/ui/spinner'
import { StatusDot } from '@devalok/shilp-sutra/ui/status-dot'
import { Stepper, Step } from '@devalok/shilp-sutra/ui/stepper'
import { Switch } from '@devalok/shilp-sutra/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@devalok/shilp-sutra/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@devalok/shilp-sutra/ui/sidebar'
import { SplitButton } from '@devalok/shilp-sutra/ui/split-button'
import { RichChatInput } from '@devalok/shilp-sutra/composed/rich-chat-input'
import { RichTextEditor } from '@devalok/shilp-sutra/composed/rich-text-editor'
import { TopBar } from '@devalok/shilp-sutra/shell/top-bar'
import { Toaster } from '@devalok/shilp-sutra/ui/toaster'

export default function Page() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Home</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <TopBar>
            <TopBar.Left>
              <SidebarTrigger />
              <TopBar.Title>Smoke</TopBar.Title>
            </TopBar.Left>
            <TopBar.Right>
              <TopBar.Section gap="tight">
                <Button size="sm">Action</Button>
              </TopBar.Section>
            </TopBar.Right>
          </TopBar>
          <main className="p-6 flex flex-col gap-4">
            {/* Phase 3 verification surface — forces TW4 to generate
                @utility, dark:, and @theme utilities so our smoke CSS
                grep can prove they emit. If any are missing, the grep
                acceptance fails the smoke run. */}
            <div
              data-phase3-verify
              className="text-heading-xl text-body-md text-label-sm text-code focus-ring pt-safe dark:bg-accent-9 dark:text-accent-11 hover:dark:bg-accent-10"
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button>Open dialog</Button>
              </DialogTrigger>
              <DialogContent>Hello</DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="soft">Hover</Button>
              </TooltipTrigger>
              <TooltipContent>tip</TooltipContent>
            </Tooltip>

            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">A</TabsTrigger>
                <TabsTrigger value="b">B</TabsTrigger>
              </TabsList>
              <TabsContent value="a">pane</TabsContent>
            </Tabs>

            <Skeleton className="h-8 w-32" />

            {/* Avatar — exercises w-ds-* / h-ds-* sizing + ring-accent-* +
                animate-in + circle/square/rounded shapes. The 0.37.0-next.0
                bug surfaced here first. */}
            <div className="flex items-center gap-ds-03">
              <Avatar size="xs"><AvatarFallback>X</AvatarFallback></Avatar>
              <Avatar size="sm"><AvatarFallback>S</AvatarFallback></Avatar>
              <Avatar size="md" status="online"><AvatarFallback>M</AvatarFallback></Avatar>
              <Avatar size="lg" ring="lead"><AvatarFallback>L</AvatarFallback></Avatar>
              <Avatar size="xl" badge={5} shape="rounded"><AvatarFallback>B</AvatarFallback></Avatar>
            </div>

            {/* StatusDot — exercises processing-ants-* animations */}
            <div className="flex gap-ds-03">
              <StatusDot status="healthy" pulse />
              <StatusDot status="warning" />
              <StatusDot status="critical" />
              <StatusDot status="neutral" />
              <StatusDot status="inactive" variant="ring" />
            </div>

            {/* Alert — exercises shadow-error/success/warning + bg-{status}-* */}
            <Alert variant="solid" color="info">info</Alert>
            <Alert variant="subtle" color="success">success</Alert>
            <Alert variant="outline" color="warning">warning</Alert>

            {/* Badge — exercises bg-accent-*, bg-{status}-* across steps */}
            <div className="flex gap-ds-02">
              <Badge variant="solid" color="accent">accent</Badge>
              <Badge variant="solid" color="error">error</Badge>
              <Badge variant="soft" color="success">success</Badge>
              <Badge variant="outline" color="warning">warning</Badge>
              <Badge variant="soft" color="info">info</Badge>
            </div>

            {/* Accordion — animate-accordion-down/up + radix height vars */}
            <Accordion type="single" collapsible>
              <AccordionItem value="a">
                <AccordionTrigger>Item</AccordionTrigger>
                <AccordionContent>Content</AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Collapsible — animate-collapsible-down/up */}
            <Collapsible>
              <CollapsibleTrigger>Toggle</CollapsibleTrigger>
              <CollapsibleContent>hidden</CollapsibleContent>
            </Collapsible>

            {/* Progress — animate-progress-indeterminate */}
            <Progress value={42} />

            {/* Spinner — exercises framer-motion animations */}
            <Spinner size="md" />

            {/* SplitButton — exercises bg-*-6 (the step-6 tokens we added) */}
            <SplitButton
              variant="solid"
              color="accent"
              dropdownContent={<div>menu</div>}
              onClick={() => {}}
            >
              Primary
            </SplitButton>

            {/* Form controls — focus-ring, border-focus, checkbox/radio animations */}
            <div className="flex gap-ds-03">
              <Input placeholder="text" />
              <Checkbox />
              <Switch />
            </div>
            <RadioGroup defaultValue="one">
              <RadioGroupItem value="one" />
              <RadioGroupItem value="two" />
            </RadioGroup>

            {/* Stepper — exercises ring-accent-8 */}
            <Stepper activeStep={1}>
              <Step label="First" />
              <Step label="Second" />
              <Step label="Third" />
            </Stepper>

            {/* Tiptap consumers — triggers rolldown-runtime require path */}
            <RichTextEditor content="<p>hello</p>" />
            <RichChatInput onSubmit={() => {}} />
          </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  )
}
