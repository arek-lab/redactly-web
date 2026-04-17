import type { Subscription, SubscriptionStatus, SubscriptionTier } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckoutButton } from '@/components/app/checkout-button'
import { ManageButton } from '@/components/app/manage-button'

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  premium: 'Premium',
  enterprise: 'Enterprise',
  payg: 'Pay as you go',
  sub: 'Subskrypcja',
}

const STATUS_VARIANT: Record<
  SubscriptionStatus,
  'accent' | 'muted' | 'found' | 'ok' | 'error'
> = {
  active: 'ok',
  inactive: 'muted',
  canceled: 'error',
  past_due: 'found',
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Aktywna',
  inactive: 'Nieaktywna',
  canceled: 'Anulowana',
  past_due: 'Zaległa płatność',
}

function QuotaBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] text-text-secondary mb-1.5">
        <span>
          {used} / {total} stron w tym miesiącu
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

interface Props {
  sub: Subscription
  hasCustomer: boolean
}

export function PdfSubscriptionCard({ sub, hasCustomer }: Props) {
  const isFree = sub.tier === 'free'
  const isPayg = sub.tier === 'payg'
  const isSub = sub.tier === 'sub'
  const isActive = sub.status === 'active'

  const priceIdUpgrade = process.env.STRIPE_PRICE_PDF_SUB_STARTER ?? ''
  const priceIdPayg = process.env.STRIPE_PRICE_PDF_PAYG ?? ''

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[1px] text-text-muted mb-0.5">
            Pliki PDF
          </p>
          <p className="font-semibold text-text-primary">
            {TIER_LABELS[sub.tier]}
          </p>
        </div>
        {!isFree && (
          <Badge variant={STATUS_VARIANT[sub.status]}>
            {STATUS_LABELS[sub.status]}
          </Badge>
        )}
      </div>

      {isSub && sub.quota_total !== null && (
        <div className="mb-4">
          <QuotaBar used={sub.quota_used} total={sub.quota_total} />
        </div>
      )}

      {isPayg && sub.quota_total !== null && (
        <div className="mb-4">
          <p className="text-[13px] text-text-secondary mb-0.5">Dostępne strony</p>
          <p className="font-semibold text-text-primary">
            {sub.quota_total - sub.quota_used}
          </p>
        </div>
      )}

      {sub.expires_at && isActive && isSub && (
        <p className="text-[13px] text-text-muted mb-4">
          Odnawia się{' '}
          {new Date(sub.expires_at).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}

      {isFree && (
        <div className="mt-2">
          <p className="text-[13px] text-text-secondary mb-3">
            Przetwarzanie przez backend z pełną anonimizacją od 29,99 zł / 100 stron.
          </p>
          <CheckoutButton priceId={priceIdUpgrade} label="Ulepsz plan" />
        </div>
      )}

      {isPayg && (
        <CheckoutButton priceId={priceIdPayg} label="Doladuj strony" />
      )}

      {isSub && hasCustomer && (
        <ManageButton />
      )}
    </Card>
  )
}
