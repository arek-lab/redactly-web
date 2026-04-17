import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Navbar } from '@/components/landing/navbar'

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

export const metadata: Metadata = {
  title: 'Redactly — Anonimizacja danych osobowych zgodnie z RODO',
  description:
    'Chroń dane osobowe przed wyciekiem do narzędzi AI i SaaS. Redactly anonimizuje tekst w przeglądarce i pliki PDF — lokalnie, bez wysyłania danych na zewnątrz.',
  keywords: ['RODO', 'anonimizacja', 'dane osobowe', 'wtyczka Chrome', 'PDF'],
  openGraph: {
    title: 'Redactly — Anonimizacja danych osobowych',
    description:
      'Wtyczka Chrome + aplikacja PDF. Chroń dane osobowe w codziennej pracy z AI.',
    locale: 'pl_PL',
    type: 'website',
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
    >
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
