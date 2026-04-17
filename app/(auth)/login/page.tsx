'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogleLogin() {
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <h1 className="text-[30px] font-display font-semibold tracking-[-0.03em] text-text-primary">
            Zaloguj się
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Nie masz konta?{' '}
            <Link
              href="/register"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              Zarejestruj się
            </Link>
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
              placeholder="••••••••"
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
            {loading ? 'Logowanie…' : 'Zaloguj się'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-soft" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-bg-base text-xs text-text-muted">
              lub
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full justify-center"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/google-logo.svg"
            alt=""
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          />
          Zaloguj przez Google
        </Button>
      </div>
    </div>
  )
}
