'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/#jak-dziala', label: 'Jak działa' },
  { href: '/#bezpieczenstwo', label: 'Bezpieczeństwo' },
  { href: '/#cennik', label: 'Cennik' },
]

interface MobileMenuProps {
  userEmail: string | null
}

export function MobileMenu({ userEmail }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false)
    if (pathname === '/') {
      e.preventDefault()
      const hash = href.replace('/', '')
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  async function handleSignOut() {
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <button
        className="flex items-center justify-center w-9 h-9 rounded-[7px] text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors md:hidden"
        aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-bg-white border-b border-border-soft md:hidden">
          <nav className="flex flex-col px-5 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-[7px] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border-soft mt-3 pt-3 flex flex-col gap-2">
              <Button variant="accent" size="sm" className="w-full justify-center">
                Zainstaluj wtyczkę
              </Button>
              {userEmail ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Ustawienia
                    </Button>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-3 h-8 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-[7px] transition-colors"
                  >
                    Wyloguj się
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Zaloguj się
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
