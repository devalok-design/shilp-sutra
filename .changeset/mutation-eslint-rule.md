---
"@devalok/eslint-plugin-shilp-sutra": minor
---

Add `require-mutation-annotation` rule (the `@mutation` mechanism). Flags raw colour literals in class strings (`bg-[#..]`, `text-[oklch(..)]`, `border-[rgb(..)]`) that bypass the token system, allowed only when marked a deliberate deviation with `// slop-allow: <id> <reason>` on the line or above. `warn` in `recommended`, `error` in `strict`.
