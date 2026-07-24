import { ImageResponse } from 'next/og'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

/**
 * Dynamic Open Graph image for the homepage.
 *
 * Resolves to `https://shilp-sutra.devalok.in/opengraph-image` at runtime.
 * Renders the brand teal ramp + tagline + product mark using ImageResponse
 * (Edge-runtime built into Next 15). No external assets, no design pipeline
 * dependency.
 *
 * 1200×630 is the OG standard (Twitter / LinkedIn / Slack / WhatsApp all
 * read it at 1.91:1).
 */

export const runtime = 'nodejs'
export const alt =
  'shilp-sutra. Your brand. Every component. Out of the box. A React design system from Devalok.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
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
          color: '#0a1a18',
          // Shilp Sutra teal ramp: accent-1 wash with accent-3 in the corner glow
          background:
            'linear-gradient(135deg, #f3f8f7 0%, #e6f3f2 60%, #c6ebe6 100%)',
          position: 'relative',
        }}
      >
        {/* Header — eyebrow + studio mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: '#008c84',
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 0.3,
              color: '#0f4a46',
            }}
          >
            {`From Devalok · Public beta v${SHILP_SUTRA_MINOR}`}
          </div>
        </div>

        {/* Headline + subline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            maxWidth: 920,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: 92,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -2.5,
              color: '#081514',
            }}
          >
            <span>Your brand. Every component.&nbsp;</span>
            <span style={{ color: '#006e68' }}>Out of the box.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: '#2c5551',
              maxWidth: 880,
            }}
          >
            A React design system from Devalok. Tailwind 4, OKLCH tokens, 120+ accessible
            components. Powers Karm, Devalok Hiring, BharatTools, and Gurukul.
          </div>
        </div>

        {/* Footer — domain + signature */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#3a6864',
          }}
        >
          <div
            style={{
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 24,
              letterSpacing: 0.5,
            }}
          >
            shilp-sutra.devalok.in
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: '#008c84' }} />
            <span>Made in Bharat by Devalok</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
