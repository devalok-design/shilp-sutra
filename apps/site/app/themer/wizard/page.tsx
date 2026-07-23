import { redirect } from 'next/navigation'

/** The guided wizard is now the "Guided wizard" tab on /theming. */
export default function WizardPage() {
  redirect('/theming')
}
