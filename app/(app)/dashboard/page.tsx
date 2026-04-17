import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutSuccess } from '@/components/app/checkout-success'
import { ExtensionSubscriptionCard } from '@/components/app/extension-subscription-card'
import { PdfSubscriptionCard } from '@/components/app/pdf-subscription-card'
import { FileHistoryTable } from '@/components/app/file-history-table'
import type { Subscription, PdfJob } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: subs }, { data: jobs }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('pdf_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const extensionSub =
    (subs as Subscription[] | null)?.find((s) => s.product === 'extension') ?? null
  const pdfSub =
    (subs as Subscription[] | null)?.find((s) => s.product === 'pdf') ?? null
  const hasCustomer = (subs ?? []).some((s) => s.stripe_customer_id !== null)

  const displayName = user.user_metadata?.full_name as string | undefined
  const greeting = displayName ?? user.email ?? 'uzytkownik'

  const lastLoginDate = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="mx-auto max-w-[920px] px-5 py-16">
      <Suspense>
        <CheckoutSuccess />
      </Suspense>

      {/* Header */}
      <div className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[1px] text-text-muted mb-1">
          Konto
        </p>
        <h1 className="text-[30px] font-[650] tracking-[-0.8px] text-text-primary">
          Cześć, {greeting}
        </h1>
        {lastLoginDate && (
          <p className="text-[13px] text-text-muted mt-1">
            Ostatnie logowanie: {lastLoginDate}
          </p>
        )}
      </div>

      {/* Subscriptions */}
      <section className="mb-8">
        <h2 className="text-[15px] font-semibold text-text-primary mb-4">
          Subskrypcja
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {extensionSub && (
            <ExtensionSubscriptionCard
              sub={extensionSub}
              hasCustomer={hasCustomer}
            />
          )}
          {pdfSub && (
            <PdfSubscriptionCard sub={pdfSub} hasCustomer={hasCustomer} />
          )}
        </div>
      </section>

      {/* File history */}
      <FileHistoryTable jobs={(jobs as PdfJob[] | null) ?? []} />
    </div>
  )
}
