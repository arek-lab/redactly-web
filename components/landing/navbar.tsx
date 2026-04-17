import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { UserMenu } from './user-menu'
import { createClient } from '@/lib/supabase/server'

function LogoMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="text-accent"
    >
      <rect width="28" height="28" rx="7" fill="currentColor" />
      <path
        d="M8 9h7c2.21 0 4 1.79 4 4s-1.79 4-4 4H8V9z"
        fill="white"
      />
      <path
        d="M8 17h5l4 4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const navLinks = [
  { href: '/#jak-dziala', label: 'Jak działa' },
  { href: '/#bezpieczenstwo', label: 'Bezpieczeństwo' },
  { href: '/#cennik', label: 'Cennik' },
]

export async function Navbar() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let userEmail: string | null = null

  if (url && key) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-white/80 backdrop-blur-md border-b border-border-soft">
      <div className="relative mx-auto max-w-[920px] px-5 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <LogoMark />
          <span className="font-display font-semibold text-[17px] text-text-primary tracking-[-0.02em]">
            Redactly
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Nawigacja główna">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-[7px] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button variant="accent" size="sm">
            Zainstaluj wtyczkę
          </Button>
          {userEmail ? (
            <UserMenu email={userEmail} />
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Zaloguj się
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger (client) */}
        <MobileMenu userEmail={userEmail} />
      </div>
    </header>
  )
}
