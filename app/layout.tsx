import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/landing/navbar'
import { SessionBroadcast } from '@/components/SessionBroadcast'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

function resolveMetadataBase(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://redactly.app')
  } catch {
    return new URL('https://redactly.app')
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: 'Redactly – Anonimizacja danych osobowych zgodnie z RODO',
  description:
    'Chroń dane osobowe przed wyciekiem do narzędzi AI i SaaS. Redactly anonimizuje tekst w przeglądarce i pliki PDF – lokalnie, bez wysyłania danych na zewnątrz.',
  keywords: ['RODO', 'anonimizacja', 'dane osobowe', 'wtyczka Chrome', 'PDF'],
  openGraph: {
    title: 'Redactly – Anonimizacja danych osobowych',
    description:
      'Wtyczka Chrome + aplikacja PDF. Chroń dane osobowe w codziennej pracy z AI.',
    locale: 'pl_PL',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pl"
      className={`${montserrat.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <SessionBroadcast />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
