'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const PRESETS_ZL = [10, 20, 50]

interface Props {
  pricePerPageGrosze: number
  minAmountZl: number
}

export function PaygTopupButton({ pricePerPageGrosze, minAmountZl }: Props) {
  const [selected, setSelected]   = useState<number | null>(null)
  const [custom, setCustom]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)

  const amountZl = selected !== null ? selected : (custom ? parseFloat(custom) : NaN)
  const isValid  = !isNaN(amountZl) && amountZl >= minAmountZl
  const pages    = isValid && pricePerPageGrosze > 0
    ? Math.floor((amountZl * 100) / pricePerPageGrosze)
    : 0

  async function handleTopup() {
    if (!isValid) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Brak aktywnej sesji')

      const res  = await fetch('/api/stripe/payg-checkout', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amountZl }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      if (data.url) window.location.href = data.url
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Błąd płatności')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Presety */}
      <div className="flex gap-2 mb-3">
        {PRESETS_ZL.map(zl => {
          const presetPages = pricePerPageGrosze > 0
            ? Math.floor((zl * 100) / pricePerPageGrosze)
            : 0
          const active = selected === zl

          return (
            <button
              key={zl}
              type="button"
              onClick={() => { setSelected(zl); setCustom('') }}
              className={[
                'flex-1 flex flex-col items-center justify-center py-2 rounded-[8px] border text-[13px] transition-colors duration-150',
                active
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border-mid text-text-secondary hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              <span className="font-semibold">{zl} zł</span>
              {presetPages > 0 && (
                <span className="text-[11px] opacity-70">{presetPages} str.</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Własna kwota */}
      <input
        type="number"
        min={minAmountZl}
        step="1"
        placeholder={`Inna kwota (min. ${minAmountZl} zł)`}
        value={custom}
        onChange={e => { setCustom(e.target.value); setSelected(null) }}
        className="w-full h-9 px-3 text-[13px] rounded-[8px] border border-border-mid bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent mb-3 transition-colors duration-150"
      />

      {/* Podgląd konwersji dla własnej kwoty */}
      {selected === null && isValid && pages > 0 && (
        <p className="text-[12px] text-text-muted mb-3">
          ≈ {pages} stron ({pricePerPageGrosze / 100} zł / strona)
        </p>
      )}

      {errorMsg && (
        <p className="text-[12px] text-red-500 mb-2">{errorMsg}</p>
      )}

      <Button
        variant="accent"
        size="sm"
        className="w-full"
        onClick={handleTopup}
        disabled={!isValid || loading}
      >
        {loading ? 'Przekierowanie...' : 'Doładuj portfel'}
      </Button>
    </div>
  )
}
