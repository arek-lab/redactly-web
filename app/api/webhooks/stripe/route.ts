import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getPriceTierMap } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import type { SubscriptionStatus, SubscriptionTier } from '@/types/database'

// Next.js App Router — wyłącz body parser dla raw body (wymagane przez Stripe)
export const dynamic = 'force-dynamic'

async function getUserIdByCustomer(
  supabase: ReturnType<typeof createServiceClient>,
  customerId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .limit(1)
    .maybeSingle()
  return data?.user_id ?? null
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook signature invalid: ${message}` }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const userId = await getUserIdByCustomer(supabase, customerId)

      if (!userId) {
        const metaUserId = session.metadata?.userId
        if (metaUserId && customerId) {
          await supabase
            .from('subscriptions')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', metaUserId)
        }
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const priceId = subscription.items.data[0]?.price.id
      const mapping = priceId ? getPriceTierMap()[priceId] : undefined

      const userId = await getUserIdByCustomer(supabase, customerId)

      if (!userId) {
        return NextResponse.json({ error: 'User not found for customer' }, { status: 400 })
      }

      if (!mapping) break

      const periodEnd = subscription.items.data[0]?.current_period_end
      const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null
      const status = subscription.status === 'active' ? 'active' : subscription.status

      const { data, error, count } = await supabase
        .from('subscriptions')
        .update({
          tier: mapping.tier as SubscriptionTier,
          status: status as SubscriptionStatus,
          expires_at: expiresAt,
          quota_total: mapping.quota ?? null,
          quota_used: 0,
        })
        .eq('user_id', userId)
        .eq('product', mapping.product)
        .select()

      if (error) {
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const userId = await getUserIdByCustomer(supabase, customerId)

      if (!userId) {
        return NextResponse.json({ error: 'User not found for customer' }, { status: 400 })
      }

      const priceId = subscription.items.data[0]?.price.id
      const mapping = priceId ? getPriceTierMap()[priceId] : undefined

      if (!mapping) break

      await supabase
        .from('subscriptions')
        .update({
          tier: 'free',
          status: 'inactive',
          expires_at: null,
          quota_total: null,
          quota_used: 0,
        })
        .eq('user_id', userId)
        .eq('product', mapping.product)

      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const userId = await getUserIdByCustomer(supabase, customerId)
      if (!userId) break

      // Sprawdź, czy płatność dotyczy produktu PAYG (pdf, tier='payg')
      const { data: pdfSub } = await supabase
        .from('subscriptions')
        .select('tier, quota_total')
        .eq('user_id', userId)
        .eq('product', 'pdf')
        .maybeSingle()

      if (pdfSub?.tier === 'payg') {
        // Zsumuj ilość stron z linii faktury
        const pages = invoice.lines.data.reduce<number>(
          (acc, line) => acc + (line.quantity ?? 0),
          0,
        )
        if (pages > 0) {
          await supabase
            .from('subscriptions')
            .update({
              quota_total: (pdfSub.quota_total ?? 0) + pages,
              status: 'active',
            })
            .eq('user_id', userId)
            .eq('product', 'pdf')
        }
      }

      break
    }

    default:
      // Ignoruj nieobsługiwane eventy
      break
  }

  return NextResponse.json({ received: true })
}
