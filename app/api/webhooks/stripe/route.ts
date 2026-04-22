import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe, getPriceTierMap } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import type { SubscriptionStatus, SubscriptionTier } from '@/types/database'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

async function isEventProcessed(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('stripe_events')
    .select('stripe_event_id')
    .eq('stripe_event_id', eventId)
    .maybeSingle()
  return !!data
}

async function markEventProcessed(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
  eventType: string,
  error?: string,
) {
  await supabase.from('stripe_events').insert({
    stripe_event_id: eventId,
    event_type:      eventType,
    error:           error ?? null,
  })
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/stripe
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')

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

  // Idempotentność — jeśli event był już przetworzony, zwróć 200 bez działania
  if (await isEventProcessed(supabase, event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {

      // ---------------------------------------------------------------------
      // Checkout ukończony — przypisz stripe_customer_id do usera
      // Stripe gwarantuje że ten event przyjdzie przed subscription.created
      // ---------------------------------------------------------------------
      case 'checkout.session.completed': {
        const session    = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const metaUserId = session.metadata?.userId

        if (metaUserId && customerId) {
          const existing = await getUserIdByCustomer(supabase, customerId)
          if (!existing) {
            await supabase
              .from('subscriptions')
              .update({ stripe_customer_id: customerId })
              .eq('user_id', metaUserId)
          }
        }
        break
      }

      // ---------------------------------------------------------------------
      // Subskrypcja utworzona lub zaktualizowana (zmiana planu, reaktywacja)
      // ---------------------------------------------------------------------
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId   = subscription.customer as string
        const priceId      = subscription.items.data[0]?.price.id
        const mapping      = priceId ? getPriceTierMap()[priceId] : undefined

        if (!mapping) break

        const userId = await getUserIdByCustomer(supabase, customerId)
        if (!userId) {
          await markEventProcessed(supabase, event.id, event.type, 'user not found')
          return NextResponse.json({ error: 'User not found' }, { status: 400 })
        }

        const item        = subscription.items.data[0]
        const periodStart = new Date(item.current_period_start * 1000).toISOString()
        const periodEnd   = new Date(item.current_period_end   * 1000).toISOString()

        await supabase
          .from('subscriptions')
          .update({
            tier:                   mapping.tier as SubscriptionTier,
            status:                 subscription.status as SubscriptionStatus,
            expires_at:             periodEnd,
            stripe_subscription_id: subscription.id,
            period_start:           periodStart,
            period_end:             periodEnd,
            quota_total:            mapping.quota ?? null,
            quota_used:             0,
            updated_at:             new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('product', mapping.product)

        break
      }

      // ---------------------------------------------------------------------
      // Subskrypcja anulowana
      // ---------------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId   = subscription.customer as string
        const priceId      = subscription.items.data[0]?.price.id
        const mapping      = priceId ? getPriceTierMap()[priceId] : undefined

        if (!mapping) break

        const userId = await getUserIdByCustomer(supabase, customerId)
        if (!userId) {
          await markEventProcessed(supabase, event.id, event.type, 'user not found')
          return NextResponse.json({ error: 'User not found' }, { status: 400 })
        }

        await supabase
          .from('subscriptions')
          .update({
            tier:        'free',
            status:      'canceled',
            expires_at:  null,
            quota_total: null,
            quota_used:  0,
            updated_at:  new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('product', mapping.product)

        break
      }

      // ---------------------------------------------------------------------
      // Faktura opłacona — wyłącznie dla subskrypcji cyklicznych (renewal)
      // PAYG obsługuje payment_intent.succeeded poniżej
      // ---------------------------------------------------------------------
      case 'invoice.payment_succeeded': {
        const invoice     = event.data.object as Stripe.Invoice
        const _sub        = invoice.parent?.subscription_details?.subscription
        const stripeSubId = (typeof _sub === 'string' ? _sub : _sub?.id) ?? null

        // Brak subscription ID = jednorazowa płatność PAYG — obsłużona niżej
        if (!stripeSubId) break

        // Renewal: resetuj limit stron i ustaw nowy okres rozliczeniowy.
        // Daty bierzemy z linii faktury — bez dodatkowego API call do Stripe.
        const line        = invoice.lines.data[0]
        const periodStart = new Date(line.period.start * 1000).toISOString()
        const periodEnd   = new Date(line.period.end   * 1000).toISOString()

        await supabase
          .from('subscriptions')
          .update({
            quota_used:   0,
            period_start: periodStart,
            period_end:   periodEnd,
            expires_at:   periodEnd,
            status:       'active',
            updated_at:   new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSubId)

        break
      }

      // ---------------------------------------------------------------------
      // Faktura nieopłacona — oznacz subskrypcję jako past_due
      // Bez tego user z odrzuconą kartą nadal przetwarza pliki za darmo
      // ---------------------------------------------------------------------
      case 'invoice.payment_failed': {
        const invoice     = event.data.object as Stripe.Invoice
        const _sub2       = invoice.parent?.subscription_details?.subscription
        const stripeSubId = (typeof _sub2 === 'string' ? _sub2 : _sub2?.id) ?? null

        if (!stripeSubId) break

        await supabase
          .from('subscriptions')
          .update({
            status:     'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSubId)

        break
      }

      // ---------------------------------------------------------------------
      // Jednorazowa płatność PAYG ukończona
      //
      // Liczba stron jest zapisana w metadata.pages przy tworzeniu sesji
      // checkout — NIE liczymy ze kwoty w webhooks, bo cena może się zmienić.
      //
      // Wymagane env:
      //   PAYG_PRICE_PER_PAGE_GROSZ  — cena za stronę w groszach (np. "10")
      //   PAYG_MIN_AMOUNT_GROSZ      — minimalna wpłata w groszach (np. "1000")
      //
      // Przy tworzeniu sesji checkout ustaw metadata:
      //   metadata: { userId: user.id, pages: calculatedPages.toString() }
      // ---------------------------------------------------------------------
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent

        const pages  = parseInt(intent.metadata?.pages  ?? '0')
        const userId = intent.metadata?.userId

        if (!userId || pages <= 0) break

        // Atomowy upsert portfela + zapis audit logu w jednej transakcji DB.
        // Używamy RPC żeby uniknąć race condition przy równoległych wpłatach
        // oraz żeby mieć gwarancję że oba INSERT-y albo przejdą albo nie.
        const { error } = await supabase.rpc('topup_wallet_with_log', {
          p_user_id:            userId,
          p_pages:              pages,
          p_stripe_payment_id:  intent.id,
        })

        if (error) throw new Error(`topup_wallet_with_log failed: ${error.message}`)

        break
      }

      default:
        break
    }

    await markEventProcessed(supabase, event.id, event.type)

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Logujemy błąd w DB i zwracamy 200 — Stripe nie będzie retryował.
    // Błędy są widoczne przez: SELECT * FROM stripe_events WHERE error IS NOT NULL
    await markEventProcessed(supabase, event.id, event.type, message)
    return NextResponse.json({ received: true, error: message })
  }

  return NextResponse.json({ received: true })
}