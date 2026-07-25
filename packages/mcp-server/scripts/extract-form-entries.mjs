#!/usr/bin/env node
/**
 * extract-form-entries.mjs — read the live buildathon Google Form and print its
 * `entry.NNN` field ids.
 *
 * The submit_entry tool POSTs to the form's undocumented /formResponse endpoint,
 * which means it depends on field ids that are NOT a stable API: editing a
 * question in the Forms UI can mint a new id and silently break submissions.
 * When that happens, run this and update ENTRY in src/buildathon.mjs.
 *
 *   node scripts/extract-form-entries.mjs
 *   node scripts/extract-form-entries.mjs --check    # exit 1 if ids drifted
 *
 * The ids live in the page's FB_PUBLIC_LOAD_DATA_ blob:
 *   data[1][1] = questions; each has [ , title, , type, [ [entryId, choices, required], … ] ]
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '../src/buildathon.mjs')

const FORM_ID =
  process.env.BUILDATHON_FORM_ID ||
  '1FAIpQLSfijBdWqmhBC7EbxVEuqZ9PCJMiXltfeKxUNRMKhy_ce4DAog'

const check = process.argv.includes('--check')

const res = await fetch(`https://docs.google.com/forms/d/e/${FORM_ID}/viewform`, {
  headers: { 'user-agent': 'Mozilla/5.0 (shilp-sutra form-entry extractor)' },
})
if (!res.ok) {
  console.error(`Could not fetch the form (HTTP ${res.status}). Is it still public?`)
  process.exit(1)
}
const html = await res.text()
const m = html.match(/FB_PUBLIC_LOAD_DATA_ = (.*?);<\/script>/s)
if (!m) {
  console.error('FB_PUBLIC_LOAD_DATA_ not found. The form may require sign-in, or Google changed the page shape.')
  process.exit(1)
}
const data = JSON.parse(m[1])

const found = []
for (const item of data[1][1] ?? []) {
  const [, title, , type, fields] = item
  for (const f of fields ?? []) {
    const [id, choices, required] = f
    found.push({
      id: `entry.${id}`,
      title,
      type,
      required: required === 1,
      choices: choices ? choices.map((c) => c[0]) : null,
    })
  }
}

console.log(`Form: ${data[1][8] ?? '(untitled)'}  (${found.length} fields)\n`)
for (const f of found) {
  const req = f.required ? 'required' : 'optional'
  const opts = f.choices ? `  choices=${JSON.stringify(f.choices)}` : ''
  console.log(`${f.id.padEnd(20)} ${req.padEnd(9)} ${JSON.stringify(f.title)}${opts}`)
}

if (check) {
  const src = readFileSync(SRC, 'utf8')
  const wired = new Set([...src.matchAll(/'(entry\.\d+)'/g)].map((x) => x[1]))
  const live = new Set(found.map((f) => f.id))
  const gone = [...wired].filter((id) => !live.has(id))
  const added = [...live].filter((id) => !wired.has(id))
  if (gone.length || added.length) {
    console.error('\nDRIFT — src/buildathon.mjs ENTRY no longer matches the live form.')
    if (gone.length) console.error(`  wired but not on the form: ${gone.join(', ')}`)
    if (added.length) console.error(`  on the form but not wired: ${added.join(', ')}`)
    process.exit(1)
  }
  console.log('\nOK — every wired entry id is still on the live form.')
}
