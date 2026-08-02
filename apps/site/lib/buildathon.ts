/**
 * Build with Shilp Sutra — the one place the buildathon's facts live, so the
 * page, the OG image, and the metadata can never disagree with each other.
 *
 * The MCP server keeps its own copy in packages/mcp-server/src/buildathon.mjs
 * (it deploys separately and cannot import from the site). If a date or the
 * prize changes, change BOTH.
 */

export const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfijBdWqmhBC7EbxVEuqZ9PCJMiXltfeKxUNRMKhy_ce4DAog/viewform'

export const MCP_URL = 'https://shilp-sutra.devalok.in/mcp'
export const CONTACT_EMAIL = 'hello@devalok.in'

export const DATES = '25 July - 4 August, 2026'
export const CLOSES = '4 August, 11:59 PM IST'
/** Short form, for places where the time of day is noise (e.g. a hero plate). */
export const CLOSES_SHORT = '4 August'
export const PRIZE = '$15,000'

/**
 * The announced close, as a timestamp. The real cutoff on the MCP side sits a
 * few hours later so a timezone slip does not cost anyone their entry; that
 * slack is deliberately not surfaced here.
 */
export const CLOSES_AT = Date.parse('2026-08-04T18:29:00Z') // 4 Aug 23:59 +05:30

export function isOpen(now = Date.now()) {
  return now < CLOSES_AT
}

export const JUDGING = [
  {
    title: 'Beauty',
    body: 'How considered and polished it looks.',
  },
  {
    title: 'Functionality',
    body: 'How well it works and holds together.',
  },
  {
    title: 'Bharat-oriented problem solving',
    body: 'How meaningfully it serves the people of Bharat.',
  },
] as const

export const REQUIREMENTS = [
  'A public GitHub repository',
  'A demo video',
  'A live demo URL',
] as const
