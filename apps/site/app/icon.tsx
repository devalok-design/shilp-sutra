import { ImageResponse } from 'next/og'

/**
 * /icon. Next 15 routes /favicon and the <link rel="icon"> to this export.
 *
 * Renders a 32×32 brand-pink mark with a softer halo. Both light and dark
 * mode browser chromes show the same artwork; the inset shadow keeps it
 * legible on light tab bars while the saturated centre survives dark.
 */

export const runtime = 'nodejs'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#de297b',
          color: 'white',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: -0.5,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
          borderRadius: 6,
        }}
      >
        स
      </div>
    ),
    { ...size },
  )
}
