import { ImageResponse } from 'next/og'

/**
 * /apple-icon. Next 15 routes the <link rel="apple-touch-icon"> to this
 * export at 180×180. Rendered larger than /icon with more breathing room
 * around the mark so iOS home-screen rounding doesn't crop the glyph.
 */

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, oklch(0.65 0.22 360) 0%, oklch(0.55 0.24 360) 100%)',
          color: 'white',
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: -2,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
        }}
      >
        स
      </div>
    ),
    { ...size },
  )
}
