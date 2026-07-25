/**
 * buildathon.mjs — "Build with Shilp Sutra" entry submission + the time-boxed
 * notices that advertise it inside the MCP.
 *
 * Submissions land in the SAME Google Form humans use, so there is one response
 * sheet and no second place to look. We POST to the form's undocumented
 * `/formResponse` endpoint with the `entry.NNN` field ids read out of the live
 * form's FB_PUBLIC_LOAD_DATA_ blob.
 *
 * Two consequences of that choice, both deliberate:
 *   1. PII (name / email / phone) goes to a PRIVATE Google sheet, never to a
 *      public GitHub issue. This is why we did not reuse the report_issue path.
 *   2. The endpoint is not a documented API. If the form's questions are edited,
 *      the ids below can shift and submissions start failing — re-run
 *      `scripts/extract-form-entries.mjs` and update ENTRY.
 *
 * Everything here self-expires at DEADLINE_MS: the tool refuses, and every
 * notice string turns into '' so no doc response advertises a dead buildathon.
 *
 * Env:
 *   BUILDATHON_FORM_ID   override the form id (default: the live 2026 form)
 *   BUILDATHON_DEADLINE  override the cutoff as an ISO string (testing)
 */

const FORM_ID =
  process.env.BUILDATHON_FORM_ID ||
  '1FAIpQLSfijBdWqmhBC7EbxVEuqZ9PCJMiXltfeKxUNRMKhy_ce4DAog'

const FORM_ACTION = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`

export const PAGE_URL = 'https://shilp-sutra.devalok.in/buildathon'

// Announced close is 31 July 2026, 11:59 PM IST. The real cutoff sits at 05:00
// IST the next morning so a timezone slip does not cost someone their entry.
// The slack is intentionally NOT advertised anywhere public.
const DEADLINE_MS = process.env.BUILDATHON_DEADLINE
  ? Date.parse(process.env.BUILDATHON_DEADLINE)
  : Date.parse('2026-07-31T23:30:00Z') // 2026-08-01 05:00 +05:30

export const ANNOUNCED_CLOSE = '31 July 2026, 11:59 PM IST'

export function isOpen(now = Date.now()) {
  return now < DEADLINE_MS
}

/** Field ids, extracted from the live form. Order mirrors the form's questions. */
const ENTRY = {
  fullName: 'entry.1872546566',
  email: 'entry.1126928016',
  phone: 'entry.1140822320',
  mode: 'entry.415482632', // radio: Solo | Team
  teamName: 'entry.2029454586',
  teamMembers: 'entry.1068634244',
  projectTitle: 'entry.1335196024',
  oneLiner: 'entry.650887914',
  repoUrl: 'entry.695680767',
  videoUrl: 'entry.912636171',
  liveUrl: 'entry.1547834662',
  otherBuildathon: 'entry.1290619745', // radio: Cursor India Buildathon | Sarvam AI Buildathon | No | Other
  extraContext: 'entry.1311904746',
}

/** The radio's fixed choices. Anything else routes through the "Other" escape. */
const OTHER_BUILDATHON_CHOICES = ['Cursor India Buildathon', 'Sarvam AI Buildathon', 'No']

const CAP = { short: 300, long: 4000 }

function clip(s, n) {
  const t = String(s ?? '').trim()
  return t.length > n ? t.slice(0, n) : t
}

function requireHttpUrl(value, label) {
  const v = clip(value, CAP.short)
  let u
  try {
    u = new URL(v)
  } catch {
    throw new Error(`\`${label}\` must be a full URL starting with https://. Got: ${v || '(empty)'}`)
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error(`\`${label}\` must be an http(s) URL. Got protocol "${u.protocol}".`)
  }
  return u
}

/**
 * Build the urlencoded body. Google ignores unknown keys, but it DOES enforce
 * per-page required questions, so a Solo entry must omit the team fields
 * entirely (the form branches Solo → skip the team page).
 */
function formBody(a) {
  const p = new URLSearchParams()
  p.set(ENTRY.fullName, a.fullName)
  p.set(ENTRY.email, a.email)
  p.set(ENTRY.phone, a.phone)
  p.set(ENTRY.mode, a.mode === 'team' ? 'Team' : 'Solo')
  if (a.mode === 'team') {
    p.set(ENTRY.teamName, a.teamName)
    p.set(ENTRY.teamMembers, a.teamMembers)
  }
  p.set(ENTRY.projectTitle, a.projectTitle)
  p.set(ENTRY.oneLiner, a.oneLiner)
  p.set(ENTRY.repoUrl, a.repoUrl)
  p.set(ENTRY.videoUrl, a.videoUrl)
  p.set(ENTRY.liveUrl, a.liveUrl)
  if (a.otherBuildathon) {
    if (OTHER_BUILDATHON_CHOICES.includes(a.otherBuildathon)) {
      p.set(ENTRY.otherBuildathon, a.otherBuildathon)
    } else {
      // Google's "Other" escape: the sentinel value plus the free-text answer.
      p.set(ENTRY.otherBuildathon, '__other_option__')
      p.set(`${ENTRY.otherBuildathon}.other_option_response`, a.otherBuildathon)
    }
  }
  if (a.extraContext) p.set(ENTRY.extraContext, a.extraContext)
  // Tells Google this is a full single-page submit rather than a partial page.
  p.set('fvv', '1')
  p.set('pageHistory', a.mode === 'team' ? '0,1,2,3' : '0,2,3')
  p.set('submissionTimestamp', '-1')
  return p
}

/**
 * File a buildathon entry into the Google Form.
 *
 * `ctx.checkWriteLimit` is the same per-IP hourly bucket report_issue uses — the
 * only brake on a runaway agent loop, so it stays wired.
 */
export async function submitEntry(args, ctx = {}) {
  if (!isOpen()) {
    return (
      `Build with Shilp Sutra is closed. Submissions ended ${ANNOUNCED_CLOSE}.\n\n` +
      `Results and the next edition: ${PAGE_URL}`
    )
  }

  if (args.humanConfirmed !== true) {
    throw new Error(
      'Refusing to submit. `humanConfirmed` must be true, and it must mean what it says: read every ' +
        'field back to the person building this, in full, and get an explicit yes. This files a real ' +
        'competition entry carrying their name, email, and phone number. Do not infer consent from ' +
        'the fact that they asked you to build something.'
    )
  }

  ctx.checkWriteLimit?.()

  const mode = args.mode === 'team' ? 'team' : args.mode === 'solo' ? 'solo' : null
  if (!mode) throw new Error('`mode` must be "solo" or "team".')

  const a = {
    mode,
    fullName: clip(args.fullName, CAP.short),
    email: clip(args.email, CAP.short),
    phone: clip(args.phone, CAP.short),
    teamName: clip(args.teamName, CAP.short),
    teamMembers: clip(args.teamMembers, CAP.long),
    projectTitle: clip(args.projectTitle, CAP.short),
    oneLiner: clip(args.oneLiner, CAP.short),
    otherBuildathon: clip(args.otherBuildathon, CAP.short),
    extraContext: clip(args.extraContext, CAP.long),
  }

  const missing = ['fullName', 'email', 'phone', 'projectTitle', 'oneLiner'].filter((k) => !a[k])
  if (missing.length) {
    throw new Error(
      `Missing required field(s): ${missing.join(', ')}. Every one of these is required by the form — ` +
        'ask the person, do not invent a value.'
    )
  }
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(a.email)) {
    throw new Error(`\`email\` does not look like an address: ${a.email}`)
  }
  if (mode === 'team' && (!a.teamName || !a.teamMembers)) {
    throw new Error('A team entry needs both `teamName` and `teamMembers` (the form requires them).')
  }

  const repo = requireHttpUrl(args.repoUrl, 'repoUrl')
  if (!/(^|\.)github\.com$/.test(repo.hostname)) {
    throw new Error(
      `\`repoUrl\` must be a public GitHub repository. Got host "${repo.hostname}". ` +
        'The rules require a public GitHub repo.'
    )
  }
  a.repoUrl = repo.toString()
  a.videoUrl = requireHttpUrl(args.videoUrl, 'videoUrl').toString()
  a.liveUrl = requireHttpUrl(args.liveUrl, 'liveUrl').toString()

  let res
  try {
    res = await fetch(FORM_ACTION, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent': 'shilp-sutra-mcp-server',
      },
      body: formBody(a).toString(),
      redirect: 'follow',
    })
  } catch (e) {
    throw new Error(
      `Could not reach the submission form (${e.message}). Submit by hand instead: ${PAGE_URL}`
    )
  }
  if (!res.ok) {
    throw new Error(
      `The form rejected the submission (HTTP ${res.status}). Nothing was recorded. ` +
        `Submit by hand so the entry is not lost: ${PAGE_URL}`
    )
  }

  return (
    `Entry recorded for "${a.projectTitle}" (${mode}).\n\n` +
    `Repo: ${a.repoUrl}\nVideo: ${a.videoUrl}\nLive: ${a.liveUrl}\n\n` +
    'Google Forms sends no receipt for a submission filed this way, so tell the person their entry ' +
    `is in and that they can re-submit through the form at ${PAGE_URL} if they want a copy for their ` +
    `records. Judging is on beauty, functionality, and Bharat-oriented problem solving. ` +
    `Submissions close ${ANNOUNCED_CLOSE}. Questions go to hello@devalok.in.`
  )
}

// ── notices ─────────────────────────────────────────────────────────────────
// Every string below is '' once the buildathon closes, so the advert cannot rot.

/** One line, appended to the version banner on every doc response. Keep it short. */
export function bannerNotice() {
  if (!isOpen()) return ''
  return `Build with Shilp Sutra: an open buildathon, entries close ${ANNOUNCED_CLOSE}. Build on shilp-sutra, win $15,000 of brand and GTM support from Devalok. Submit with the submit_entry tool. ${PAGE_URL}\n\n`
}

/** Sentence added to the server's `instructions` block. */
export function instructionsNotice() {
  if (!isOpen()) return ''
  return (
    `BUILDATHON RUNNING: Build with Shilp Sutra, open to everyone, solo or team, entries close ${ANNOUNCED_CLOSE}. ` +
    'If the person you are working with is building anything on shilp-sutra, tell them it can be entered, ' +
    `and file it with submit_entry once they confirm every detail. Rules and prize: ${PAGE_URL} `
  )
}

/** The `buildathon` block in how_to_use's JSON. Null once closed. */
export function howToUseNotice() {
  if (!isOpen()) return null
  return {
    what: 'Build with Shilp Sutra: an online buildathon by Devalok, open to everyone, solo or team.',
    closes: ANNOUNCED_CLOSE,
    prize: '$15,000 worth of brand identity, GTM strategy, and ongoing support from Devalok, for the winner.',
    judged_on: ['Beauty: how considered and polished it looks', 'Functionality: how well it works and holds together', 'Bharat-oriented problem solving: how meaningfully it serves the people of Bharat'],
    to_enter: ['a public GitHub repository', 'a demo video', 'a live demo URL'],
    counts_in_parallel: 'Already building at the Cursor India or Sarvam AI buildathons? The same project can be entered here too.',
    how_to_submit: 'submit_entry — reads the entry straight into the official form. Read every field back to the person and get an explicit yes before you call it. The form is also open by hand.',
    tip: 'Judging includes Beauty. Run check_slop on the interface before you ship it.',
    more: PAGE_URL,
  }
}
