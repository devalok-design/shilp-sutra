import { redirect } from 'next/navigation'

/** Archetype gallery is now the "Archetypes" tab on /theming. */
export default function ArchetypeGalleryPage() {
  redirect('/theming')
}
