---
"@devalok/shilp-sutra": patch
---

Fix five reported bugs:

- **`ui/table-row-link` subpath now exported** (#101). The `TableRowLink` dist file shipped in 0.45.0 but was missing from the `exports` map, so the documented `@devalok/shilp-sutra/ui/table-row-link` import threw `ERR_PACKAGE_PATH_NOT_EXPORTED`. Added the entry.
- **`Message highlight="mention"` is visible again** (#99). In 0.45.0 the mention row-tint was intentionally dropped in favor of the in-content `@token` — but the token styling only existed on the editor, never on the read-only `Message`, so mentions rendered flat. `Message` now styles in-content `.mention` tokens (accent tint), matching the editor. The row stays flat by design; use the styled `@token` for standout. Mention-token styling is now shared via a single `MENTION_TOKEN_CLASS` across the editor, chat input, and Message to prevent drift.
- **`RichChatInput` mention callbacks no longer go stale** (#92). `onMentionSelect` was captured once in the memoized extensions and never refreshed; it's now read through a live ref, matching the existing `enterBehaviorRef` pattern. The same fix was applied to the `mentions` list and `onMentionSearch` resolver (same stale-closure class), so swapping them mid-session now takes effect.
- **`VideoPreview` keyboard rate shortcuts track the current rate** (#91). `>` / `<` cycled from the mount-time rate (always 1×) because the keydown handler closed over stale state; playback rate is now read through a live ref.
- **`Stepper` now has unit-test coverage** (#93). Added the missing `stepper.test.tsx` (conformance + state derivation + `onStepClick` + `StepperContent`).
