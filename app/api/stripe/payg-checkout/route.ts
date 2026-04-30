import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

// ---------------------------------------------------------------------------
// POST /api/payg/checkout
//
// Body: { amountZl: number }   — kwota którą user chce wpłacić (w złotych)
//
// Wymagane env:
//   PAYG_PRICE_PER_PAGE_GROSZ  — cena za stronę w groszach, np. "10" = 0.10 zł
//   PAYG_MIN_AMOUNT_GROSZ      — minimalna wpłata w groszach, np. "1000" = 10 zł
//   NEXT_PUBLIC_APP_URL        — bazowy URL aplikacji
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // Parsowanie body
  let amountZl: number, successUrl: string, cancelUrl: string
  try {
    const body = await request.json() as { amountZl?: unknown; successUrl?: unknown; cancelUrl?: unknown }
    amountZl   = Number(body.amountZl)
    successUrl = typeof body.successUrl === 'string' ? body.successUrl : ''
    cancelUrl  = typeof body.cancelUrl  === 'string' ? body.cancelUrl  : ''
    if (!isFinite(amountZl) || !successUrl || !cancelUrl) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Walidacja kwoty
  const pricePerPageGrosze = parseInt(process.env.PAYG_PRICE_PER_PAGE_GROSZ!)
  const minAmountGrosze    = parseInt(process.env.PAYG_MIN_AMOUNT_GROSZ!)

  if (!pricePerPageGrosze || !minAmountGrosze) {
    return NextResponse.json({ error: 'PAYG pricing not configured' }, { status: 500 })
  }

  const amountGrosze = Math.round(amountZl * 100)

  if (amountGrosze < minAmountGrosze) {
    return NextResponse.json(
      { error: `Minimalna wpłata to ${minAmountGrosze / 100} zł` },
      { status: 400 },
    )
  }

  // Liczba stron obliczona w momencie zakupu według aktualnej ceny z .env
  // Zapisujemy w metadata — webhook użyje tej wartości, nie będzie liczył ze kwoty
  const pages = Math.floor(amountGrosze / pricePerPageGrosze)

  if (pages <= 0) {
    return NextResponse.json({ error: 'Kwota zbyt niska' }, { status: 400 })
  }

  // Pobierz user_id z sesji (dostosuj do swojego auth)
  const supabase = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser(
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '',
  )

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const session = await getStripe().checkout.sessions.create({
  mode: 'payment',
  currency: 'pln',
  line_items: [
    {
      price_data: {
        currency:     'pln',
        unit_amount:  amountGrosze,
        product_data: {
          name:        `Doładowanie PAYG – ${pages} stron`,
          description: `${pricePerPageGrosze / 100} zł / strona`,
        },
      },
      quantity: 1,
    },
  ],
  metadata: {
    userId: user.id,
    pages:  pages.toString(),
  },
  payment_intent_data: {
    metadata: {
      userId: user.id,
      pages:  pages.toString(),
    },
  },
  success_url: successUrl,
  cancel_url:  cancelUrl,
})

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
