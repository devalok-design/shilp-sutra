'use client'

import { Alert } from '@devalok/shilp-sutra/ui/alert'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

export function AlertHero() {
  return (
    <div className="max-w-xl">
      <Alert color="info" title={`shilp-sutra v${SHILP_SUTRA_MINOR} is live`}>
        Machine-readable BREAKING.json manifest, Next.js recipe polish, and the
        usual Devalok improvements. Patch path stays one command.
      </Alert>
    </div>
  )
}

export function AlertVariants() {
  return (
    <div className="flex flex-col gap-ds-04">
      <Alert color="info" title="Heads up">
        Neutral, informational. Use info for product news.
      </Alert>

      <Alert color="success" title="Saved">
        Successful actions. Confirmation reading.
      </Alert>

      <Alert color="warning" title="Verify before continuing">
        Things that need attention but are not yet errors. Common for unsaved-changes notices.
      </Alert>

      <Alert color="error" title="Could not save changes">
        Hard errors. Always paired with a clear next action.
      </Alert>

      <Alert color="info" variant="solid" title="Solid variant">
        Higher emphasis. Use for one-shot announcements; subtle is the everyday default.
      </Alert>
    </div>
  )
}
