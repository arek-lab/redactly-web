'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ManageButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      })

      if (!res.ok) throw new Error()

      const data = (await res.json()) as { url?: string }
      if (data.url) window.location.href = data.url
    } catch {
      // ciche niepowodzenie
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? 'Przekierowanie...' : 'Zarządzaj'}
    </Button>
  )
}
