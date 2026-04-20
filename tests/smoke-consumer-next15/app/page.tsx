'use client'

/**
 * Minimal Next 15 + Webpack smoke. Imports a narrow high-signal surface —
 * Button, Dialog, Tooltip, Skeleton — that exercises:
 *   - CSS token resolution under Webpack's @tailwindcss/postcss pipeline
 *   - @source directive scanning the installed dist under pnpm strict-hoist
 *   - framer-motion peer resolution (AnimatePresence via Dialog)
 *   - cva + clsx + tailwind-merge runtime class composition
 *
 * Deliberately narrower than the Turbopack variant — this isn't duplicating
 * that surface, it's validating that the Webpack consumer path doesn't have
 * additional failure modes beyond Turbopack's.
 */

import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@devalok/shilp-sutra/ui/dialog'
import { Skeleton } from '@devalok/shilp-sutra/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@devalok/shilp-sutra/ui/tooltip'
import { Text } from '@devalok/shilp-sutra/ui/text'

export default function Page() {
  return (
    <TooltipProvider>
      <main className="min-h-screen bg-surface-base p-ds-06">
        <div className="mx-auto max-w-2xl flex flex-col gap-ds-05">
          <Text as="h1" variant="heading-xl">
            Next 15 + Webpack smoke
          </Text>

          <div className="flex gap-ds-03">
            <Button variant="solid" color="accent">
              Primary
            </Button>
            <Button variant="soft" color="neutral">
              Soft
            </Button>
            <Button variant="outline" color="neutral">
              Outline
            </Button>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>Tooltip via Floating UI</TooltipContent>
          </Tooltip>

          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog</DialogTitle>
                <DialogDescription>
                  AnimatePresence exits verify framer-motion peer resolution.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <div className="flex flex-col gap-ds-02">
            <Skeleton variant="text" className="w-2/3" />
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="rectangle" animation="shimmer" className="h-24" />
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}
