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

interface Props {
  sub: Subscription
  hasCustomer: boolean
}

export function ExtensionSubscriptionCard({ sub, hasCustomer }: Props) {
  const isFree = sub.tier === 'free'
  const isEnterprise = sub.tier === 'enterprise'
  const isPremium = sub.tier === 'premium'
  const isActive = sub.status === 'active'

  const priceId = process.env.STRIPE_PRICE_EXTENSION_PREMIUM ?? ''

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[1px] text-text-muted mb-0.5">
            Wtyczka Chrome
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

      {sub.expires_at && isActive && (
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
            Uaktualnij do Premium aby uzyskać pełną anonimizację (NLP, lematyzacja, bazy geo).
          </p>
          <CheckoutButton
            priceId={priceId}
            label="Przejdź na Premium — 29,99 zł/mies."
          />
        </div>
      )}

      {isPremium && hasCustomer && (
        <ManageButton />
      )}

      {isEnterprise && (
        <a
          href="mailto:hello@redactly.pl"
          className="inline-flex items-center h-8 px-3 text-sm font-medium rounded-[7px] border border-border-mid text-text-primary hover:border-accent hover:text-accent transition-colors duration-150"
        >
          Skontaktuj się z nami
        </a>
      )}
    </Card>
  )
}
