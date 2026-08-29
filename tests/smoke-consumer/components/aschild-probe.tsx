// A SERVER component (no 'use client') one module below the route, using
// <Button asChild>. This is the exact shape reported in issue #270.
import { Button } from '@devalok/shilp-sutra/ui/button'

export function AsChildProbe() {
  return (
    <div className="flex justify-center" data-probe>
      <Button size="lg">PlainButtonProbe</Button>
      <Button asChild size="lg">
        <a href="#tools">AsChildProbeAnchor</a>
      </Button>
    </div>
  )
}
