---
'@devalok/shilp-sutra': patch
---

Give the `RichChatInput` editor an accessible name

Tiptap 3.34 keeps `role="textbox"` on the editable element, and a textbox needs a
name. The editor now carries `aria-label` set to the `placeholder` prop (default
`Type a message...`). Snapshot tests that capture the editor element will show the
new attribute.
