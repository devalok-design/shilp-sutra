import { ImageResponse } from 'next/og'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

/**
 * Dynamic Open Graph image for the homepage.
 *
 * Resolves to `https://shilp-sutra.devalok.in/opengraph-image` at runtime.
 * Renders the brand pink ramp + tagline + product mark using ImageResponse
 * (Edge-runtime built into Next 15). No external assets, no design pipeline
 * dependency.
 *
 * 1200×630 is the OG standard (Twitter / LinkedIn / Slack / WhatsApp all
 * read it at 1.91:1).
 */

export const runtime = 'edge'
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
          color: '#1a0a14',
          // Devalok pink ramp: accent-1 wash with accent-3 in the corner glow
          background:
            'linear-gradient(135deg, oklch(0.985 0.008 360) 0%, oklch(0.96 0.024 360) 60%, oklch(0.92 0.04 360) 100%)',
          position: 'relative',
        }}
      >
        {/* Header — eyebrow + studio mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: 'oklch(0.6 0.22 360)',
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 0.3,
              color: 'oklch(0.4 0.12 360)',
            }}
          >
            From Devalok · Public beta v{SHILP_SUTRA_MINOR}
          </div>
        </div>

        {/* Headline + subline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            zIndex: 1,
            maxWidth: 920,
          }}
        >
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: -2.5,
              color: '#160812',
            }}
          >
            Your brand. Every component.{' '}
            <span style={{ color: 'oklch(0.5 0.22 360)' }}>Out of the box.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: 'oklch(0.35 0.08 360)',
              maxWidth: 880,
            }}
          >
            A React design system from Devalok. Tailwind 4, OKLCH tokens, 119 accessible
            components. Powers Karm, Devalok Hiring, BharatTools, and Gurukul.
          </div>
        </div>

        {/* Footer — domain + signature */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1,
            fontSize: 22,
            color: 'oklch(0.4 0.08 360)',
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
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: 'oklch(0.6 0.22 360)' }} />
            <span>Made in Bharat by Devalok</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
