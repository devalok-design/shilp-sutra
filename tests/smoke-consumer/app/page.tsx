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

import { Button } from '@devalok/shilp-sutra/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@devalok/shilp-sutra/ui/dialog'
import { Skeleton } from '@devalok/shilp-sutra/ui/skeleton'
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
