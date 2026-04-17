import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#F6F6FA',
          padding: '80px',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <svg width="56" height="56" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#7C3AED" />
            <path d="M8 9h7c2.21 0 4 1.79 4 4s-1.79 4-4 4H8V9z" fill="white" />
            <path d="M8 17h5l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#14121F',
              letterSpacing: '-0.02em',
            }}
          >
            Redactly
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '60px',
            fontWeight: 700,
            color: '#14121F',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
            marginBottom: '28px',
          }}
        >
          Anonimizacja danych osobowych
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#504E65',
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          Wtyczka Chrome + PDF · Lokalnie, bez wysyłania danych · Zgodnie z RODO
        </div>

        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#7C3AED',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
