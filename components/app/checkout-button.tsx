'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CheckoutButtonProps {
  priceId: string
  label?: string
  className?: string
}

export function CheckoutButton({
  priceId,
  label = 'Ulepsz plan',
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    console.log('[Checkout] priceId:', priceId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard?checkout=canceled`,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errData)}`)
      }

      const data = (await res.json()) as { url?: string; error?: string }
      console.log('[Checkout] odpowiedź API:', data)
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[Checkout] błąd przy inicjowaniu płatności:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="accent"
      size="sm"
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Przekierowanie...' : label}
    </Button>
  )
}
