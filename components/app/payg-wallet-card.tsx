import { Card } from '@/components/ui/card'
import { PaygTopupButton } from '@/components/app/payg-topup-button'

interface Props {
  balance:             number
  pricePerPageGrosze:  number
  minAmountZl:         number
}

export function PaygWalletCard({ balance, pricePerPageGrosze, minAmountZl }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[1px] text-text-muted mb-0.5">
            Portfel PAYG
          </p>
          <p className="font-semibold text-text-primary">Pay as you go</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[13px] text-text-muted mb-0.5">Dostępne strony</p>
        <p className="text-[32px] font-[650] tracking-[-1px] text-text-primary leading-none">
          {balance.toLocaleString('pl-PL')}
        </p>
        {pricePerPageGrosze > 0 && (
          <p className="text-[12px] text-text-muted mt-1">
            {(pricePerPageGrosze / 100).toFixed(2)} zł / strona
          </p>
        )}
      </div>

      <PaygTopupButton
        pricePerPageGrosze={pricePerPageGrosze}
        minAmountZl={minAmountZl}
      />
    </Card>
  )
}
