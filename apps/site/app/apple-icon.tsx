import { ImageResponse } from 'next/og'

/**
 * /apple-icon. Next 15 routes the <link rel="apple-touch-icon"> to this
 * export at 180×180. Rendered larger than /icon with more breathing room
 * around the mark so iOS home-screen rounding doesn't crop the glyph.
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
          background: 'linear-gradient(135deg, #33c9bf 0%, #008c84 100%)',
        }}
      >
        <svg width="112" height="96" viewBox="0 0 338 289.599" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M96.4993 100.667C112.144 100.667 124.827 87.9847 124.827 72.3397C124.827 56.6947 112.144 44.012 96.4993 44.012C80.8543 44.012 68.1715 56.6947 68.1715 72.3397C68.1715 87.9847 80.8543 100.667 96.4993 100.667Z" fill="white" />
          <path d="M144.901 96.6996C144.901 109.968 134.11 120.759 120.842 120.759H48.2003V168.858H120.842C160.625 168.858 193 136.483 193 96.6996V48.2183H144.901V96.6996Z" fill="white" />
          <path d="M48.0988 217.44V168.959H0V217.44C0 257.224 32.3746 289.598 72.1582 289.598H144.8V241.499H72.1582C58.8903 241.499 48.0988 230.708 48.0988 217.44Z" fill="white" />
          <path d="M313.639 120.74C300.371 120.74 289.58 109.949 289.58 96.6808V72.1381C289.6 32.3746 257.225 0 217.441 0H193.1V48.0988H217.441C230.709 48.0988 241.501 58.8903 241.501 72.1582V96.7009C241.501 115.163 248.467 132.035 259.923 144.8C248.467 157.584 241.501 174.436 241.501 192.898V217.441C241.501 230.709 230.709 241.501 217.441 241.501H193.1V289.599H217.441C257.225 289.599 289.6 257.225 289.6 217.441V192.898C289.6 179.631 300.391 168.839 313.659 168.839H338V120.74H313.659H313.639Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
