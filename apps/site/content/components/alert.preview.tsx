'use client'

import { Alert } from '@devalok/shilp-sutra/ui/alert'

export function AlertHero() {
  return (
    <div className="max-w-xl">
      <Alert color="info" title="shilp-sutra v0.39 is live">
        Agent Skill bundle and the marketing site shipped together. The skill installs in one curl.
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
