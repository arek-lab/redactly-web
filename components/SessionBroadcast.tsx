'use client'
import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function SessionBroadcast() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.postMessage({
          type: 'REDACTLY_AUTH',
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          },
        }, window.location.origin)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        window.postMessage({
          type: session ? 'REDACTLY_AUTH' : 'REDACTLY_SIGNOUT',
          session: session ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          } : null,
        }, window.location.origin)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return null
}
