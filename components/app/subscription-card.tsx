import { createClient } from '@/lib/supabase/server'
import type { Subscription, SubscriptionProduct } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckoutButton } from '@/components/app/checkout-button'
import { ManageButton } from '@/components/app/manage-button'

const PRODUCT_LABELS: Record<SubscriptionProduct, string> = {
  extension: 'Wtyczka Chrome',
  pdf: 'Aplikacja PDF',
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  premium: 'Premium',
  enterprise: 'Enterprise',
  payg: 'Pay as you go',
  sub: 'Subskrypcja',
}

const STATUS_VARIANT: Record<
  string,
  'accent' | 'muted' | 'found' | 'ok' | 'error'
> = {
  active: 'ok',
  inactive: 'muted',
  canceled: 'error',
  past_due: 'found',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktywna',
  inactive: 'Nieaktywna',
  canceled: 'Anulowana',
  past_due: 'Zaległa płatność',
}

interface UpgradePrices {
  extensionPremium: string
  pdfSubStarter: string
}

function QuotaBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
        <span>
          {used} / {total} stron
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SubCard({
  sub,
  upgradePrices,
  hasCustomer,
}: {
  sub: Subscription
  upgradePrices: UpgradePrices
  hasCustomer: boolean
}) {
  const isActive = sub.status === 'active'
  const isFree = sub.tier === 'free'

  function upgradePrice() {
    if (sub.product === 'extension') return upgradePrices.extensionPremium
    return upgradePrices.pdfSubStarter
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          {PRODUCT_LABELS[sub.product]}
        </span>
        {!isFree && (
          <Badge variant={STATUS_VARIANT[sub.status] ?? 'muted'}>
            {STATUS_LABELS[sub.status] ?? sub.status}
          </Badge>
        )}
      </div>

      <div>
        <p className="text-[13px] text-text-secondary">Plan</p>
        <p className="font-semibold text-text-primary">{TIER_LABELS[sub.tier] ?? sub.tier}</p>
      </div>

      {sub.product === 'pdf' && sub.quota_total !== null && (
        <div>
          <p className="text-[13px] text-text-secondary">Quota miesięczna</p>
          <QuotaBar used={sub.quota_used} total={sub.quota_total} />
        </div>
      )}

      {sub.product === 'pdf' && sub.tier === 'payg' && sub.quota_total !== null && (
        <div>
          <p className="text-[13px] text-text-secondary">Dostępne strony</p>
          <p className="font-semibold text-text-primary">
            {sub.quota_total - sub.quota_used} stron
          </p>
        </div>
      )}

      {sub.expires_at && isActive && (
        <p className="text-[13px] text-text-muted">
          Odnawia się{' '}
          {new Date(sub.expires_at).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}

      <div className="flex gap-2 mt-1">
        {isFree && (
          <CheckoutButton
            priceId={upgradePrice()}
            label="Ulepsz plan"
          />
        )}
        {!isFree && hasCustomer && <ManageButton />}
      </div>
    </Card>
  )
}

export async function SubscriptionCard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('product')

  if (!subs || subs.length === 0) return null

  const hasCustomer = subs.some((s) => s.stripe_customer_id !== null)

  const upgradePrices: UpgradePrices = {
    extensionPremium: process.env.STRIPE_PRICE_EXTENSION_PREMIUM!,
    pdfSubStarter: process.env.STRIPE_PRICE_PDF_SUB_STARTER!,
  }
  console.log('[SubscriptionCard] upgradePrices:', upgradePrices)

  return (
    <section>
      <h2 className="text-[15px] font-semibold text-text-primary mb-4">Subskrypcja</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {subs.map((sub) => (
          <SubCard
            key={sub.id}
            sub={sub}
            upgradePrices={upgradePrices}
            hasCustomer={hasCustomer}
          />
        ))}
      </div>
    </section>
  )
}
