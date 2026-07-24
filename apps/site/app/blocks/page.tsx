import { redirect } from 'next/navigation'

/**
 * Blocks now render as the first section of the merged /showcase page.
 * Individual /blocks/[slug] detail pages are unaffected — only this index
 * redirects, so old links to /blocks land on the canonical merged page.
 */
export default function BlocksIndexPage() {
  redirect('/showcase')
}
