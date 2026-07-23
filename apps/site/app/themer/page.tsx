import { redirect } from 'next/navigation'

/** The Themer's 4 entry doors now live as tabs on /theming. */
export default function ThemerLandingPage() {
  redirect('/theming')
}
