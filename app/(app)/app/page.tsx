import { createClient } from '@/lib/supabase/server'
import { UploadZone } from '@/components/app/upload-zone'
import { PlanSidebar } from '@/components/app/plan-sidebar'
import type { Subscription } from '@/types/database'

export default async function AppPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let pdfSub: Subscription | null = null

  if (user) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('product', 'pdf')
      .single()
    pdfSub = data
  }

  const isLoggedIn = !!user
  const isPremium =
    pdfSub !== null && pdfSub.status === 'active' && pdfSub.tier !== 'free'

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
          Wykryj i zastąp dane osobowe w dokumentach PDF — bez zapisywania pliku na serwerze.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:flex-1 min-w-0">
          <UploadZone isLoggedIn={isLoggedIn} isPremium={isPremium} />
        </div>
        <div className="w-full lg:w-72 shrink-0">
          <PlanSidebar
            isLoggedIn={isLoggedIn}
            isPremium={isPremium}
            pdfSub={pdfSub}
          />
        </div>
      </div>
    </div>
  )
}
