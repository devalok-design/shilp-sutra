import { redirect } from 'next/navigation'

/** Brand-color import is now the "Your brand color" tab on /theming. */
export default function BrandImportPage() {
  redirect('/theming')
}
