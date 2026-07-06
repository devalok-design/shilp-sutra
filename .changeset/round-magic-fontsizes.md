---
"@devalok/shilp-sutra": patch
---

Round eight hard-coded font-sizes in Message and VideoPreview up to DS type-scale tokens (v0.44 followups item E). Chat sender name and message/edit bodies move `text-[13px]` → `text-ds-md` (14px); the chat timestamp and the video-preview timecode + playback-rate button move `text-[11px]` → `text-ds-sm` (12px).

Rationale: peer systems closest to our use (Atlassian, IBM Carbon) hold a 12px legibility floor and carry no 11/13px step — chat body is primary reading text, so it takes the canonical `ds-md` body step rather than shrinking. Token utilities set font-size only in TW4, so line-heights are unchanged.

Visible effect: chat text reads slightly roomier. The `badge-indicator` count pill intentionally keeps its 11px value — a decorative numeral in a fixed 18px pill, not body text, so the text floor doesn't apply. Non-breaking (no API change).
