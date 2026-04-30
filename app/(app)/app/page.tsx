import { createClient } from '@/lib/supabase/server'
import { PlanSidebar } from '@/components/app/plan-sidebar'
import { PaygWalletCard } from '@/components/app/payg-wallet-card'
import { UploadZoneDynamic } from '@/components/app/upload-zone-dynamic'
import type { Subscription } from '@/types/database'

export default async function AppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let pdfSub:        Subscription | null = null
  let walletBalance: number              = 0

  if (user) {
    const [{ data: sub }, { data: wallet }] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('product', 'pdf_api')
        .single(),
      supabase
        .from('page_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
    pdfSub        = sub
    walletBalance = wallet?.balance ?? 0
  }

  const isLoggedIn         = !!user
  const isPremium          = (pdfSub !== null && pdfSub.status === 'active' && pdfSub.tier !== 'free') || walletBalance > 0
  const pricePerPageGrosze = parseInt(process.env.PAYG_PRICE_PER_PAGE_GROSZ ?? '10')
  const minAmountZl        = Math.ceil(parseInt(process.env.PAYG_MIN_AMOUNT_GROSZ ?? '1000') / 100)

  return (
    <div className="mx-auto max-w-[920px] px-5 py-16">
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[1px] text-text-muted mb-2">
          Redactly Files
        </p>
        <h1 className="text-[30px] font-[650] tracking-[-0.8px] text-text-primary">
          Anonimizacja PDF
        </h1>
        <p className="text-text-secondary mt-2 max-w-[480px]">
          Wykryj i zastąp dane osobowe w dokumentach PDF – bez zapisywania pliku na serwerze.
        </p>
      </div>

      {/* Upload zone — pełna szerokość */}
      <div className="mb-6">
        <UploadZoneDynamic isLoggedIn={isLoggedIn} isPremium={isPremium} />
      </div>

      {/* Karty informacyjne — responsywne */}
      {isLoggedIn ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlanSidebar
            isLoggedIn={isLoggedIn}
            isPremium={isPremium}
            pdfSub={pdfSub}
          />
          <PaygWalletCard
            balance={walletBalance}
            pricePerPageGrosze={pricePerPageGrosze}
            minAmountZl={minAmountZl}
          />
        </div>
      ) : (
        <div className="max-w-sm">
          <PlanSidebar
            isLoggedIn={isLoggedIn}
            isPremium={isPremium}
            pdfSub={pdfSub}
          />
        </div>
      )}
    </div>
  )
}
