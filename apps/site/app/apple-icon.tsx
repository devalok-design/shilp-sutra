import { ImageResponse } from 'next/og'

/**
 * /apple-icon. Next 15 routes the <link rel="apple-touch-icon"> to this
 * export at 180×180. Rendered larger than /icon with more breathing room
 * around the mark so iOS home-screen rounding doesn't crop the glyph.
 *
 * Matches the refreshed brand app-icon (Figma node 83:3779): gradient
 * top→bottom (#33C9BF → #00605A), Shilp Sutra glyph in solid black. iOS
 * re-masks the corners, so the tile is full-bleed (no baked radius).
 */

export const runtime = 'nodejs'
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
          background: 'linear-gradient(180deg, #33C9BF 0%, #00605A 100%)',
        }}
      >
        <svg width="112" height="96" viewBox="0 0 364.115 311.973" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M103.955 108.445C120.809 108.445 134.471 94.7822 134.471 77.9285C134.471 61.0748 120.809 47.4121 103.955 47.4121C87.1014 47.4121 73.4388 61.0748 73.4388 77.9285C73.4388 94.7822 87.1014 108.445 103.955 108.445Z" fill="black" />
          <path d="M156.096 104.17C156.096 118.463 144.471 130.088 130.178 130.088H51.9241V181.903H130.178C173.035 181.903 207.911 147.027 207.911 104.17V51.9431H156.096V104.17Z" fill="black" />
          <path d="M51.8148 234.239V182.012H0V234.239C0 277.096 34.8758 311.972 77.7331 311.972H155.987V260.157H77.7331C63.4401 260.157 51.8148 248.532 51.8148 234.239Z" fill="black" />
          <path d="M337.871 130.068C323.578 130.068 311.953 118.443 311.953 104.15V77.7114C311.975 34.8758 277.099 0 234.242 0H208.02V51.8148H234.242C248.535 51.8148 260.16 63.4401 260.16 77.7331V104.172C260.16 124.061 267.664 142.236 280.005 155.987C267.664 169.759 260.16 187.913 260.16 207.802V234.24C260.16 248.533 248.535 260.159 234.242 260.159H208.02V311.973H234.242C277.099 311.973 311.975 277.098 311.975 234.24V207.802C311.975 193.509 323.6 181.883 337.893 181.883H364.115V130.068H337.893H337.871Z" fill="black" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
