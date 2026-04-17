import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
  }
  return _stripe
}

export function getPriceTierMap(): Record<
  string,
  { product: 'extension' | 'pdf'; tier: string; quota?: number }
> {
  return {
    [process.env.STRIPE_PRICE_EXTENSION_PREMIUM!]: {
      product: 'extension' as const,
      tier: 'premium',
    },
    [process.env.STRIPE_PRICE_PDF_SUB_STARTER!]: {
      product: 'pdf' as const,
      tier: 'sub',
      quota: 100,
    },
    [process.env.STRIPE_PRICE_PDF_SUB_BUSINESS!]: {
      product: 'pdf' as const,
      tier: 'sub',
      quota: 500,
    },
    [process.env.STRIPE_PRICE_PDF_SUB_PRO!]: {
      product: 'pdf' as const,
      tier: 'sub',
      quota: 1500,
    },
  }
}
