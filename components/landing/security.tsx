import { SectionHeader } from '@/components/ui/section-header'

interface TrustCell {
  title: string
  lines: string[]
}

const cells: TrustCell[] = [
  {
    title: 'Dane nie opuszczają UE',
    lines: [
      'Serwery: eu-central-1, Frankfurt',
      'Transfer poza UE: nigdy',
      'GDPR Art. 44 — spełnione',
    ],
  },
  {
    title: 'Zero retention',
    lines: [
      'Plik usunięty po przetworzeniu',
      'TTL: 60 sekund',
      'Logi treści: brak',
    ],
  },
  {
    title: 'RODO / GDPR',
    lines: [
      'DPA dostępna na żądanie',
      'Audytowalny log operacji',
      'Szyfrowanie HMAC-SHA256',
    ],
  },
  {
    title: 'Wtyczka lokalnie',
    lines: [
      'Plan Free: zero requestów',
      'Działa wyłącznie w przeglądarce',
      'Manifest V3, Shadow DOM',
    ],
  },
]

export function Security() {
  return (
    <section
      id="bezpieczenstwo"
      className="px-6 py-20 md:py-24 bg-bg-surface"
    >
      <div className="mx-auto max-w-[920px] space-y-10">
        <SectionHeader
          eyebrow="Bezpieczeństwo"
          title="Zaprojektowane dla środowisk regulowanych"
          description="Spełniamy wymagania RODO, GDPR i wewnętrznych polityk bezpieczeństwa IT."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cells.map((cell) => (
            <div
              key={cell.title}
              className="bg-bg-white border border-border-mid rounded-[12px] p-6 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full bg-accent shrink-0"
                  aria-hidden="true"
                />
                <h3 className="font-display font-semibold text-[14px] text-text-primary leading-tight">
                  {cell.title}
                </h3>
              </div>
              <ul className="space-y-1.5">
                {cell.lines.map((line) => (
                  <li
                    key={line}
                    className="text-[13px] text-text-secondary pl-4 border-l border-border-soft"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
