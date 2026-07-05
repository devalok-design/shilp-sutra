---
"@devalok/shilp-sutra": patch
---

FilePreview: the video seek, volume, and audio scrub controls are now keyboard-accessible. They were plain `<div role="slider">` with pointer handlers only — no keyboard, no forced-colors support (a WCAG break). They now compose a shared `MediaSlider` built on the Radix Slider primitive (Arrow / Home / End, focus ring, high-contrast), styled slim with a hover/focus-reveal thumb (white on the dark video overlay, accent on light). Users can now also drag to seek, not just click. (The audio bar's mouse-only hover-time tooltip was removed.)
