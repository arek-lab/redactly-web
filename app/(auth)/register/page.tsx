'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-12 h-12 rounded-full bg-badge-ok/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-badge-ok"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-[24px] font-display font-semibold text-text-primary">
            Sprawdź skrzynkę
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Wysłaliśmy link potwierdzający na adres{' '}
            <span className="text-text-primary font-medium">{email}</span>.
            Kliknij w link, aby aktywować konto.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Wróć do logowania
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <h1 className="text-[30px] font-display font-semibold tracking-[-0.03em] text-text-primary">
            Utwórz konto
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Masz już konto?{' '}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              Zaloguj się
            </Link>
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jan@przyklad.pl"
              className="h-10 px-3 rounded-[7px] border border-border-input bg-bg-white text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-text-primary"
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 znaków"
              className="h-10 px-3 rounded-[7px] border border-border-input bg-bg-white text-sm text-text-primary placeholder:text-text-faint outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-badge-found">{error}</p>
          )}

          <Button
            type="submit"
            variant="accent"
            size="md"
            className="w-full justify-center mt-1"
            disabled={loading}
          >
            {loading ? 'Tworzenie konta…' : 'Utwórz konto'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-text-muted text-center">
          Rejestrując się, akceptujesz politykę prywatności i przetwarzanie
          danych zgodnie z RODO.
        </p>
      </div>
    </div>
  )
}
