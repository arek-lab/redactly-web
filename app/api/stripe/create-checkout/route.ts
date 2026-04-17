import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { priceId?: string; successUrl?: string; cancelUrl?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { priceId, successUrl, cancelUrl } = body

  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceClient()

  // Pobierz lub stwórz stripe_customer_id
  const { data: sub, error: subError } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .limit(1)
    .maybeSingle()

  if (subError) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  let customerId = sub?.stripe_customer_id ?? null

  if (!customerId) {
    try {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
    } catch {
      return NextResponse.json({ error: 'Stripe customer creation failed' }, { status: 500 })
    }
  }

  // Zawsze zapisz customer ID do obu wierszy subscriptions (extension + pdf)
  // Dzięki temu webhook checkout.session.completed zawsze znajdzie userId
  await service
    .from('subscriptions')
    .update({ stripe_customer_id: customerId })
    .eq('user_id', user.id)

  try {
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Stripe session creation failed' }, { status: 500 })
  }
}
