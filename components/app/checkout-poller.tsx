'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// After successful checkout Stripe webhook arrives async — poll until DB reflects the change.
export function CheckoutPoller() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('checkout') !== 'success') return

    const delays = [2000, 4000, 8000]
    const timers = delays.map((ms) => setTimeout(() => router.refresh(), ms))
    return () => timers.forEach(clearTimeout)
  }, [params, router])

  return null
}
