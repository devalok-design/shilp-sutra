import { ImageResponse } from 'next/og'
import { DATES, CLOSES, PRIZE } from '@/lib/buildathon'

/**
 * Open Graph image for /buildathon, composed from the poster's own palette
 * (Figma "Shilp-Sutra | Visual Identity", frame SSB-LinkedIn): the identity
 * gradient, ink #131514, and the lime plate under the prize figure.
 *
 * Two constraints this file exists to respect:
 * - HEX ONLY. satori 502s on a solid oklch() value, so no design tokens here.
 * - runtime nodejs, not edge (see app/opengraph-image.tsx for the same note).
 *
 * The BUILDATHON letterforms are not reproduced — satori cannot render the
 * vector composition, and faking it in a system face would misrepresent the
 * mark. The type carries the card instead.
 */

export const runtime = 'nodejs'
export const alt = `Build with Shilp Sutra. An online buildathon by Devalok, ${DATES}. Win ${PRIZE} worth of branding, GTM strategy, and ongoing support.`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#131514'
const LIME = '#D5EF72'

export default async function BuildathonOpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
          color: INK,
          // The poster gradient: white → #C6EBE6 at ~38% → white, on its diagonal.
          background: 'linear-gradient(119deg, #FFFFFF 0%, #C6EBE6 38%, #FFFFFF 100%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', fontSize: 30 }}>Build with</div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, letterSpacing: -1.5 }}>
            Shilp Sutra
          </div>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 600 }}>{DATES}</div>
        </div>

        {/* Prize block sits on the baseline of the card: the figure and the line
            it qualifies read as one unit, so they share a row. */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 26 }}>Win</div>
            <div style={{ display: 'flex' }}>
              <div
                style={{
                  display: 'flex',
                  background: LIME,
                  color: INK,
                  fontSize: 82,
                  fontWeight: 700,
                  padding: '2px 18px',
                }}
              >
                {PRIZE}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              width: 380,
              lineHeight: 1.35,
              paddingBottom: 8,
            }}
          >
            worth of Branding, GTM Strategy, and ongoing support from Devalok.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
          }}
        >
          <div style={{ display: 'flex' }}>Entries close {CLOSES}</div>
          <div style={{ display: 'flex', fontWeight: 600 }}>shilp-sutra.devalok.in/buildathon</div>
        </div>
      </div>
    ),
    size
  )
}
